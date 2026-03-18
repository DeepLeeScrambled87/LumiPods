#!/usr/bin/env node

import { mkdirSync, rmSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const APPWRITE_ENDPOINT = requireEnv('APPWRITE_ENDPOINT').replace(/\/$/, '');
const APPWRITE_PROJECT_ID = requireEnv('APPWRITE_PROJECT_ID');
const APPWRITE_API_KEY = requireEnv('APPWRITE_API_KEY');
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'lumipods';
const APPWRITE_BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'learner-artifacts';

const POCKETBASE_CONTAINER = process.env.POCKETBASE_CONTAINER || 'lumipods-pocketbase';
const POCKETBASE_DATA_DB_PATH = process.env.POCKETBASE_DATA_DB_PATH || '/pb_data/data.db';
const POCKETBASE_STORAGE_ROOT = process.env.POCKETBASE_STORAGE_ROOT || '/pb_data/storage';

const ACTIVE_COLLECTIONS = [
  'families',
  'learners',
  'schedules',
  'blocks',
  'artifacts',
  'progress',
  'points',
  'rewards_redemptions',
  'competencies',
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 1024 * 1024 * 20,
    ...options,
  }).trim();
}

function runJson(command, args) {
  const output = run(command, args);
  return output ? JSON.parse(output) : null;
}

function normalizeDateTime(value) {
  if (!value || typeof value !== 'string') return '';
  if (value.includes('T')) return value;
  if (value.includes(' ')) return value.replace(' ', 'T');
  return value;
}

async function appwriteJson(pathname) {
  const response = await fetch(`${APPWRITE_ENDPOINT}${pathname}`, {
    headers: {
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'X-Appwrite-Key': APPWRITE_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  const body = await response.text();
  const json = body ? JSON.parse(body) : null;

  if (!response.ok) {
    throw new Error(`Appwrite request failed (${response.status}) ${pathname}: ${body}`);
  }

  return json;
}

function copyPocketBaseDb(tempDir) {
  const localPath = path.join(tempDir, 'pocketbase-data.db');
  run('docker', ['cp', `${POCKETBASE_CONTAINER}:${POCKETBASE_DATA_DB_PATH}`, localPath]);
  return localPath;
}

function sqliteRows(dbPath, sql) {
  return runJson('sqlite3', ['-json', dbPath, sql]) || [];
}

function dockerFileExists(containerPath) {
  try {
    run('docker', ['exec', POCKETBASE_CONTAINER, 'test', '-f', containerPath]);
    return true;
  } catch {
    return false;
  }
}

function dockerFileSize(containerPath) {
  return Number(
    run('docker', [
      'exec',
      POCKETBASE_CONTAINER,
      'sh',
      '-lc',
      `wc -c < ${shellQuote(containerPath)}`,
    ]),
  );
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function parseAttrs(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function main() {
  const tempDir = path.join(tmpdir(), 'lumipods-appwrite-preflight');
  rmSync(tempDir, { force: true, recursive: true });
  mkdirSync(tempDir, { recursive: true });

  const dbPath = copyPocketBaseDb(tempDir);
  const pbCollections = sqliteRows(
    dbPath,
    "select id, name from _collections where name in ('families','learners','schedules','blocks','artifacts','progress','points','rewards_redemptions','competencies','ai_conversations','french_lessons','vr_sessions') order by name;",
  );
  const pbCollectionIds = Object.fromEntries(pbCollections.map((row) => [row.name, row.id]));

  const pbCounts = Object.fromEntries(
    ACTIVE_COLLECTIONS.map((name) => {
      const rows = sqliteRows(dbPath, `select count(*) as count from ${name};`);
      return [name, rows[0]?.count || 0];
    }),
  );

  const artifactRows = sqliteRows(
    dbPath,
    'select id, learner, family, type, title, file, podId, weekNumber from artifacts;',
  );
  const artifactCollectionId = pbCollectionIds.artifacts;

  const artifactInventory = [];
  for (const artifact of artifactRows) {
    const containerFilePath = `${POCKETBASE_STORAGE_ROOT}/${artifactCollectionId}/${artifact.id}/${artifact.file}`;
    const attrsPath = `${containerFilePath}.attrs`;
    const exists = artifact.file ? dockerFileExists(containerFilePath) : false;
    const attrsRaw = artifact.file && exists
      ? run('docker', ['exec', POCKETBASE_CONTAINER, 'cat', attrsPath])
      : '';
    const attrs = parseAttrs(attrsRaw);
    const size = artifact.file && exists ? dockerFileSize(containerFilePath) : 0;

    artifactInventory.push({
      id: artifact.id,
      title: artifact.title,
      type: artifact.type,
      fileName: artifact.file,
      podId: artifact.podId,
      weekNumber: artifact.weekNumber,
      exists,
      size,
      mimeType: attrs['user.content_type'] || '',
      originalName: attrs['user.metadata']?.['original-filename'] || artifact.file || '',
      containerFilePath,
    });
  }

  const bucket = await appwriteJson(`/storage/buckets/${APPWRITE_BUCKET_ID}`);
  const collections = await appwriteJson(`/databases/${APPWRITE_DATABASE_ID}/collections`);

  const appwriteCollectionStates = {};
  for (const collection of collections.collections || []) {
    if (!ACTIVE_COLLECTIONS.includes(collection.$id)) continue;
    const attributes = await appwriteJson(
      `/databases/${APPWRITE_DATABASE_ID}/collections/${collection.$id}/attributes`,
    );
    const pending = (attributes.attributes || [])
      .filter((attribute) => attribute.status !== 'available')
      .map((attribute) => ({
        key: attribute.key,
        status: attribute.status,
        error: attribute.error || '',
      }));
    appwriteCollectionStates[collection.$id] = {
      name: collection.name,
      pendingAttributes: pending,
    };
  }

  const bucketMaxFileSize = Number(bucket.maximumFileSize || 0);
  const filesOverBucketLimit = artifactInventory.filter(
    (artifact) => artifact.exists && bucketMaxFileSize > 0 && artifact.size > bucketMaxFileSize,
  );

  const report = {
    generatedAt: new Date().toISOString(),
    pocketBase: {
      container: POCKETBASE_CONTAINER,
      dataDbPath: POCKETBASE_DATA_DB_PATH,
      collectionIds: pbCollectionIds,
      counts: pbCounts,
      artifactFiles: {
        total: artifactInventory.length,
        withFiles: artifactInventory.filter((item) => item.fileName).length,
        missingFiles: artifactInventory.filter((item) => item.fileName && !item.exists).length,
        largestFiles: artifactInventory
          .filter((item) => item.exists)
          .sort((a, b) => b.size - a.size)
          .slice(0, 10)
          .map((item) => ({
            id: item.id,
            title: item.title,
            fileName: item.fileName,
            size: item.size,
            mimeType: item.mimeType,
          })),
      },
    },
    appwrite: {
      endpoint: APPWRITE_ENDPOINT,
      projectId: APPWRITE_PROJECT_ID,
      databaseId: APPWRITE_DATABASE_ID,
      bucketId: APPWRITE_BUCKET_ID,
      bucketMaxFileSize,
      bucketMaxFileSizeMb: bucketMaxFileSize ? Number((bucketMaxFileSize / 1024 / 1024).toFixed(2)) : 0,
      collections: appwriteCollectionStates,
      filesOverBucketLimit: filesOverBucketLimit.map((item) => ({
        id: item.id,
        title: item.title,
        fileName: item.fileName,
        size: item.size,
      })),
    },
  };

  const reportPath = path.join(tempDir, 'preflight-report.json');
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ ok: true, reportPath, report }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
