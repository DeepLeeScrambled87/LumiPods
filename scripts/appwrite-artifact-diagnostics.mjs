#!/usr/bin/env node

import { mkdirSync, rmSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
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

function sqliteRows(dbPath, sql) {
  return runJson('sqlite3', ['-json', dbPath, sql]) || [];
}

function copyPocketBaseDb(tempDir) {
  const dbPath = path.join(tempDir, 'pocketbase-data.db');
  run('docker', ['cp', `${POCKETBASE_CONTAINER}:${POCKETBASE_DATA_DB_PATH}`, dbPath]);
  return dbPath;
}

function dockerFileExists(containerPath) {
  try {
    run('docker', ['exec', POCKETBASE_CONTAINER, 'test', '-f', containerPath]);
    return true;
  } catch {
    return false;
  }
}

async function appwriteJson(pathname) {
  const response = await fetch(`${APPWRITE_ENDPOINT}${pathname}`, {
    headers: {
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'X-Appwrite-Key': APPWRITE_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`Appwrite request failed (${response.status}) ${pathname}: ${text}`);
  }

  return json;
}

async function appwriteExists(pathname) {
  const response = await fetch(`${APPWRITE_ENDPOINT}${pathname}`, {
    headers: {
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'X-Appwrite-Key': APPWRITE_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    return true;
  }

  if (response.status === 404) {
    return false;
  }

  const text = await response.text();
  throw new Error(`Appwrite request failed (${response.status}) ${pathname}: ${text}`);
}

async function main() {
  const tempDir = path.join(tmpdir(), 'lumipods-appwrite-artifact-diagnostics');
  rmSync(tempDir, { force: true, recursive: true });
  mkdirSync(tempDir, { recursive: true });

  const dbPath = copyPocketBaseDb(tempDir);
  const collectionIdRow = sqliteRows(
    dbPath,
    "select id from _collections where name = 'artifacts' limit 1;",
  )[0];

  if (!collectionIdRow?.id) {
    throw new Error('Could not resolve PocketBase artifacts collection ID.');
  }

  const artifactCollectionId = collectionIdRow.id;
  const pocketBaseArtifacts = sqliteRows(
    dbPath,
    'select id, learner, family, type, title, file, podId, weekNumber from artifacts order by id;',
  );

  const diagnostics = [];
  for (const artifact of pocketBaseArtifacts) {
    const fileExpected = Boolean(artifact.file);
    const containerPath = fileExpected
      ? `${POCKETBASE_STORAGE_ROOT}/${artifactCollectionId}/${artifact.id}/${artifact.file}`
      : '';
    const sourceFileExists = fileExpected ? dockerFileExists(containerPath) : false;
    const hasDocument = await appwriteExists(
      `/databases/${APPWRITE_DATABASE_ID}/collections/artifacts/documents/${artifact.id}`,
    );
    const hasFile = fileExpected
      ? await appwriteExists(`/storage/buckets/${APPWRITE_BUCKET_ID}/files/${artifact.id}`)
      : true;

    diagnostics.push({
      id: artifact.id,
      title: artifact.title,
      type: artifact.type,
      fileName: artifact.file,
      podId: artifact.podId,
      weekNumber: artifact.weekNumber,
      sourceFileExists,
      hasDocument,
      hasFile,
      status:
        !hasDocument && !hasFile
          ? 'missing-document-and-file'
          : !hasDocument
            ? 'missing-document'
            : !hasFile
              ? 'missing-file'
              : 'complete',
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      pocketBaseArtifacts: pocketBaseArtifacts.length,
      appwriteArtifactDocuments: diagnostics.filter((item) => item.hasDocument).length,
      appwriteBucketFiles: diagnostics.filter((item) => item.hasFile).length,
      complete: diagnostics.filter((item) => item.status === 'complete').length,
      missingDocumentAndFile: diagnostics.filter((item) => item.status === 'missing-document-and-file').length,
      missingDocument: diagnostics.filter((item) => item.status === 'missing-document').length,
      missingFile: diagnostics.filter((item) => item.status === 'missing-file').length,
    },
    retryArtifactIds: diagnostics
      .filter((item) => item.status !== 'complete')
      .map((item) => item.id),
    diagnostics,
  };

  const reportPath = path.join(tempDir, 'artifact-diagnostics.json');
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ ok: true, reportPath, report }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
