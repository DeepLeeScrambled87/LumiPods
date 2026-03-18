#!/usr/bin/env node

import { mkdirSync, rmSync, statSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
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

const CURRENT_COLLECTIONS = [
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

function parseArgs(argv) {
  const options = {
    apply: false,
    dryRun: true,
    collections: [...CURRENT_COLLECTIONS],
    skipFiles: false,
    ids: [],
  };

  for (const arg of argv) {
    if (arg === '--apply') {
      options.apply = true;
      options.dryRun = false;
    } else if (arg === '--dry-run') {
      options.apply = false;
      options.dryRun = true;
    } else if (arg === '--skip-files') {
      options.skipFiles = true;
    } else if (arg.startsWith('--collections=')) {
      options.collections = arg
        .slice('--collections='.length)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    } else if (arg.startsWith('--ids=')) {
      options.ids = arg
        .slice('--ids='.length)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
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

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function copyPocketBaseDb(tempDir) {
  const dbPath = path.join(tempDir, 'pocketbase-data.db');
  run('docker', ['cp', `${POCKETBASE_CONTAINER}:${POCKETBASE_DATA_DB_PATH}`, dbPath]);
  return dbPath;
}

function copyFromContainer(containerPath, localPath) {
  run('docker', ['cp', `${POCKETBASE_CONTAINER}:${containerPath}`, localPath]);
}

function dockerFileExists(containerPath) {
  try {
    run('docker', ['exec', POCKETBASE_CONTAINER, 'test', '-f', containerPath]);
    return true;
  } catch {
    return false;
  }
}

function parsePocketBaseDate(value) {
  if (!value || typeof value !== 'string') return undefined;
  return value.includes('T') ? value : value.replace(' ', 'T');
}

async function appwriteRequest(method, pathname, body, extraHeaders = {}) {
  const headers = {
    'X-Appwrite-Project': APPWRITE_PROJECT_ID,
    'X-Appwrite-Key': APPWRITE_API_KEY,
    ...extraHeaders,
  };

  const init = { method, headers };

  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body;
    } else {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${APPWRITE_ENDPOINT}${pathname}`, init);
  const text = await response.text();
  let json = null;

  if (text) {
    const contentType = response.headers.get('content-type') || '';
    const looksLikeJson = /^\s*[\[{]/.test(text);
    if (contentType.includes('application/json') || looksLikeJson) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }
  }

  return { ok: response.ok, status: response.status, json, text };
}

async function getBucketInfo() {
  const response = await appwriteRequest('GET', `/storage/buckets/${APPWRITE_BUCKET_ID}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Appwrite bucket: ${response.text}`);
  }
  return response.json;
}

async function ensureDocument(collectionId, documentId, data) {
  const createResponse = await appwriteRequest(
    'POST',
    `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/documents`,
    {
      documentId,
      data,
      permissions: [],
    },
  );

  if (createResponse.ok) {
    return { action: 'created', document: createResponse.json };
  }

  if (createResponse.status !== 409) {
    throw new Error(
      `Failed to create ${collectionId}/${documentId} (${createResponse.status}): ${createResponse.text}`,
    );
  }

  const updateResponse = await appwriteRequest(
    'PATCH',
    `/databases/${APPWRITE_DATABASE_ID}/collections/${collectionId}/documents/${documentId}`,
    { data, permissions: [] },
  );

  if (!updateResponse.ok) {
    throw new Error(
      `Failed to update ${collectionId}/${documentId} (${updateResponse.status}): ${updateResponse.text}`,
    );
  }

  return { action: 'updated', document: updateResponse.json };
}

async function uploadFile({ fileId, uploadName, mimeType, localPath }) {
  const buffer = await readFile(localPath);
  const form = new FormData();
  form.set('fileId', fileId);
  form.set('file', new Blob([buffer], { type: mimeType || 'application/octet-stream' }), uploadName);

  const createResponse = await appwriteRequest(
    'POST',
    `/storage/buckets/${APPWRITE_BUCKET_ID}/files`,
    form,
  );

  if (createResponse.ok) {
    if (!createResponse.json) {
      throw new Error(
        `Upload returned non-JSON success payload (${createResponse.status}): ${createResponse.text.slice(0, 300)}`,
      );
    }
    return { action: 'created', file: createResponse.json };
  }

  if (createResponse.status !== 409) {
    throw new Error(
      `Failed to upload file ${fileId} (${createResponse.status}): ${createResponse.text.slice(0, 300)}`,
    );
  }

  const existingResponse = await appwriteRequest(
    'GET',
    `/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}`,
  );

  if (!existingResponse.ok) {
    throw new Error(
      `Failed to fetch existing file ${fileId} (${existingResponse.status}): ${existingResponse.text.slice(0, 300)}`,
    );
  }

  return { action: 'existing', file: existingResponse.json };
}

function jsonText(value, fallback = '[]') {
  if (value === null || value === undefined || value === '') return fallback;
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function optionalString(value) {
  return value === null || value === undefined || value === '' ? undefined : String(value);
}

function optionalInteger(value) {
  if (value === null || value === undefined || value === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : undefined;
}

function optionalBoolean(value) {
  if (value === null || value === undefined || value === '') return undefined;
  return Boolean(value);
}

function compact(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  );
}

function createDocumentPayloads(rowsByCollection) {
  return {
    families: (rowsByCollection.families || []).map((row) => ({
      id: row.id,
      data: compact({
        legacyPocketBaseId: row.id,
        name: row.name,
        ownerUserId: row.owner,
        settingsJson: jsonText(row.settings, '{}'),
        currentPodId: optionalString(row.currentPodId),
        currentWeek: optionalInteger(row.currentWeek),
        timezone: optionalString(row.timezone),
        schoolYearStart: optionalInteger(row.schoolYearStart),
      }),
    })),
    learners: (rowsByCollection.learners || []).map((row) => ({
      id: row.id,
      data: compact({
        legacyPocketBaseId: row.id,
        familyId: row.family,
        name: row.name,
        age: optionalInteger(row.age),
        skillLevel: row.skillLevel,
        avatar: optionalString(row.avatar),
        points: optionalInteger(row.points),
        streakDays: optionalInteger(row.streakDays),
        preferencesJson: jsonText(row.preferences, '{}'),
        pin: optionalString(row.pin),
      }),
    })),
    schedules: (rowsByCollection.schedules || []).map((row) => ({
      id: row.id,
      data: compact({
        legacyPocketBaseId: row.id,
        familyId: row.family,
        learnerId: optionalString(row.learner),
        date: parsePocketBaseDate(row.date),
        dayOfWeek: optionalInteger(row.dayOfWeek),
        isTemplate: optionalBoolean(row.isTemplate),
        blocksJson: jsonText(row.blocks, '[]'),
      }),
    })),
    blocks: (rowsByCollection.blocks || []).map((row) => ({
      id: row.id,
      data: compact({
        legacyPocketBaseId: row.id,
        scheduleId: row.schedule,
        learnerId: optionalString(row.learner),
        title: row.title,
        subject: optionalString(row.subject),
        type: optionalString(row.type),
        startTime: row.startTime,
        duration: optionalInteger(row.duration),
        status: optionalString(row.status),
        delayedUntil: optionalString(row.delayedUntil),
        podId: optionalString(row.podId),
        weekNumber: optionalInteger(row.weekNumber),
        description: optionalString(row.description),
        materialsJson: jsonText(row.materials, '[]'),
        resourcesJson: jsonText(row.resources, '[]'),
        completedAt: parsePocketBaseDate(row.completedAt),
        focusMinutes: optionalInteger(row.focusMinutes),
        pointsEarned: optionalInteger(row.pointsEarned),
      }),
    })),
    progress: (rowsByCollection.progress || []).map((row) => ({
      id: row.id,
      data: compact({
        legacyPocketBaseId: row.id,
        familyId: row.family,
        learnerId: row.learner,
        date: parsePocketBaseDate(row.date),
        podId: optionalString(row.podId),
        weekNumber: optionalInteger(row.weekNumber),
        blocksCompleted: optionalInteger(row.blocksCompleted),
        blocksTotal: optionalInteger(row.blocksTotal),
        focusMinutes: optionalInteger(row.focusMinutes),
        pointsEarned: optionalInteger(row.pointsEarned),
        artifactsCreated: optionalInteger(row.artifactsCreated),
        streakMaintained: optionalBoolean(row.streakMaintained),
        frenchMinutes: optionalInteger(row.frenchMinutes),
        vrMinutes: optionalInteger(row.vrMinutes),
      }),
    })),
    points: (rowsByCollection.points || []).map((row) => ({
      id: row.id,
      data: compact({
        legacyPocketBaseId: row.id,
        familyId: row.family,
        learnerId: row.learner,
        type: row.type,
        points: optionalInteger(row.points),
        blockId: optionalString(row.blockId),
        artifactId: optionalString(row.artifactId),
        description: optionalString(row.description),
      }),
    })),
    rewards_redemptions: (rowsByCollection.rewards_redemptions || []).map((row) => ({
      id: row.id,
      data: compact({
        legacyPocketBaseId: row.id,
        familyId: row.family,
        learnerId: row.learner,
        rewardId: row.rewardId,
        rewardTitle: optionalString(row.rewardTitle),
        pointsSpent: optionalInteger(row.pointsSpent),
        status: optionalString(row.status),
        approvedBy: optionalString(row.approvedBy),
        approvedAt: parsePocketBaseDate(row.approvedAt),
        fulfilledAt: parsePocketBaseDate(row.fulfilledAt),
        notes: optionalString(row.notes),
      }),
    })),
    competencies: (rowsByCollection.competencies || []).map((row) => ({
      id: row.id,
      data: compact({
        legacyPocketBaseId: row.id,
        learnerId: row.learner,
        domain: row.domain,
        level: row.level,
        evidenceIdsJson: jsonText(row.evidenceIds, '[]'),
        assessedBy: optionalString(row.assessedBy),
        notes: optionalString(row.notes),
      }),
    })),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const tempDir = path.join(tmpdir(), 'lumipods-appwrite-migration');
  rmSync(tempDir, { force: true, recursive: true });
  mkdirSync(tempDir, { recursive: true });

  const dbPath = copyPocketBaseDb(tempDir);
  const collectionRows = sqliteRows(
    dbPath,
    "select id, name from _collections where name in ('families','learners','schedules','blocks','artifacts','progress','points','rewards_redemptions','competencies') order by name;",
  );
  const pocketBaseCollectionIds = Object.fromEntries(collectionRows.map((row) => [row.name, row.id]));

  const rowsByCollection = {};
  for (const collection of options.collections) {
    const rows = sqliteRows(dbPath, `select * from ${collection};`);
    rowsByCollection[collection] =
      options.ids.length > 0 ? rows.filter((row) => options.ids.includes(String(row.id))) : rows;
  }

  const payloadsByCollection = createDocumentPayloads(rowsByCollection);
  const bucket = await getBucketInfo();
  const bucketMaxFileSize = Number(bucket.maximumFileSize || 0);
  const artifactCollectionId = pocketBaseCollectionIds.artifacts;

  const report = {
    generatedAt: new Date().toISOString(),
    mode: options.apply ? 'apply' : 'dry-run',
    selectedCollections: options.collections,
    selectedIds: options.ids,
    bucketMaxFileSize,
    collections: {},
    files: {
      uploaded: 0,
      existing: 0,
      skipped: 0,
      failed: [],
    },
  };

  for (const collection of options.collections) {
    report.collections[collection] = {
      total:
        collection === 'artifacts'
          ? (rowsByCollection.artifacts || []).length
          : (payloadsByCollection[collection]?.length || 0),
      created: 0,
      updated: 0,
      skipped: 0,
      failed: [],
    };
  }

  if (!options.apply) {
    for (const artifact of rowsByCollection.artifacts || []) {
      if (!artifact.file) continue;
      const filePath = `${POCKETBASE_STORAGE_ROOT}/${artifactCollectionId}/${artifact.id}/${artifact.file}`;
      const exists = dockerFileExists(filePath);
      const size = exists
        ? Number(run('docker', ['exec', POCKETBASE_CONTAINER, 'sh', '-lc', `wc -c < ${shellQuote(filePath)}`]))
        : 0;
      if (!exists || (bucketMaxFileSize > 0 && size > bucketMaxFileSize)) {
        report.files.failed.push({
          id: artifact.id,
          title: artifact.title,
          fileName: artifact.file,
          exists,
          size,
          overBucketLimit: bucketMaxFileSize > 0 && size > bucketMaxFileSize,
        });
      } else {
        report.files.skipped += 1;
      }
    }

    const reportPath = path.join(tempDir, 'migration-dry-run.json');
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    process.stdout.write(`${JSON.stringify({ ok: true, reportPath, report }, null, 2)}\n`);
    return;
  }

  for (const collection of options.collections) {
    if (collection === 'artifacts') continue;
    for (const payload of payloadsByCollection[collection] || []) {
      try {
        const result = await ensureDocument(collection, payload.id, payload.data);
        report.collections[collection][result.action] += 1;
      } catch (error) {
        report.collections[collection].failed.push({
          id: payload.id,
          error: error.message,
        });
      }
    }
  }

  for (const artifact of rowsByCollection.artifacts || []) {
    const collectionReport = report.collections.artifacts;
    const filePath = `${POCKETBASE_STORAGE_ROOT}/${artifactCollectionId}/${artifact.id}/${artifact.file}`;
    const attrsPath = `${filePath}.attrs`;
    const localFilePath = path.join(tempDir, `${artifact.id}-${artifact.file}`);
    const localAttrsPath = `${localFilePath}.attrs`;

    try {
      let uploadSummary = null;
      let fileMimeType = '';
      let fileName = artifact.file;
      let fileSize = 0;

      if (artifact.file && !options.skipFiles) {
        if (!dockerFileExists(filePath)) {
          throw new Error(`PocketBase file not found: ${filePath}`);
        }

        copyFromContainer(filePath, localFilePath);
        if (dockerFileExists(attrsPath)) {
          copyFromContainer(attrsPath, localAttrsPath);
        }

        const attrs = JSON.parse(await readFile(localAttrsPath, 'utf8')).user || {};
        fileMimeType = attrs.content_type || '';
        fileName = attrs.metadata?.['original-filename'] || artifact.file;
        fileSize = statSync(localFilePath).size;

        if (bucketMaxFileSize > 0 && fileSize > bucketMaxFileSize) {
          throw new Error(
            `File exceeds Appwrite bucket max (${fileSize} > ${bucketMaxFileSize}): ${artifact.file}`,
          );
        }

        uploadSummary = await uploadFile({
          fileId: artifact.id,
          uploadName: fileName,
          mimeType: fileMimeType,
          localPath: localFilePath,
        });
        if (uploadSummary.action === 'created') {
          report.files.uploaded += 1;
        } else if (uploadSummary.action === 'existing') {
          report.files.existing += 1;
        }
      } else {
        report.files.skipped += 1;
      }

      const documentPayload = compact({
        legacyPocketBaseId: artifact.id,
        familyId: artifact.family,
        learnerId: artifact.learner,
        type: artifact.type,
        title: artifact.title,
        description: optionalString(artifact.description),
        reflection: optionalString(artifact.reflection),
        fileId: artifact.file ? artifact.id : undefined,
        fileName,
        fileMimeType: optionalString(fileMimeType),
        fileSize: fileSize || undefined,
        thumbnailUrl: optionalString(artifact.thumbnailUrl),
        externalUrl: artifact.file
          ? `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${artifact.id}/view?project=${APPWRITE_PROJECT_ID}`
          : optionalString(artifact.externalUrl),
        tagsJson: jsonText(artifact.tags, '[]'),
        competenciesJson: jsonText(artifact.competencies, '[]'),
        skillLevel: optionalString(artifact.skillLevel),
        visibility: optionalString(artifact.visibility),
        isFeatured: optionalBoolean(artifact.isFeatured),
        podId: optionalString(artifact.podId),
        blockId: optionalString(artifact.blockId),
        weekNumber: optionalInteger(artifact.weekNumber),
        iterationsJson: jsonText(artifact.iterations, '[]'),
        feedbackJson: jsonText(artifact.feedback, '[]'),
        rubricScoreJson: jsonText(artifact.rubricScore, '{}'),
        publishedAt: parsePocketBaseDate(artifact.publishedAt),
      });

      const result = await ensureDocument('artifacts', artifact.id, documentPayload);
      collectionReport[result.action] += 1;

      await rm(localFilePath, { force: true });
      await rm(localAttrsPath, { force: true });
    } catch (error) {
      collectionReport.failed.push({
        id: artifact.id,
        title: artifact.title,
        error: error.message,
      });
      report.files.failed.push({
        id: artifact.id,
        title: artifact.title,
        fileName: artifact.file,
        error: error.message,
      });
    }
  }

  const reportPath = path.join(tempDir, 'migration-apply-report.json');
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ ok: true, reportPath, report }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
