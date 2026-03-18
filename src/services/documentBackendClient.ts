import {
  appwriteCollectionUrl,
  appwriteConfig,
  appwriteDocumentUrl,
  appwriteHeaders,
  isAppwriteConfigured,
} from '../lib/appwrite';
import { isPocketBaseConfigured, pb } from '../lib/pocketbase';

export type DataBackendKind = 'pocketbase' | 'appwrite';

type RawRecord = Record<string, unknown>;

export interface DocumentBackendClient {
  kind: DataBackendKind;
  isOnline(): Promise<boolean>;
  getOne(collection: string, id: string): Promise<RawRecord>;
  list(collection: string): Promise<RawRecord[]>;
  create(collection: string, data: Record<string, unknown>): Promise<RawRecord>;
  update(collection: string, id: string, data: Record<string, unknown>): Promise<RawRecord>;
  delete(collection: string, id: string): Promise<void>;
}

const parseJsonField = <T>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  if (typeof value !== 'string') {
    return value as T;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const normalizeAppwriteRecord = (collection: string, record: RawRecord): RawRecord => {
  const base: RawRecord = {
    ...record,
    id: String(record.$id || record.id || ''),
    created: String(record.$createdAt || record.created || ''),
    updated: String(record.$updatedAt || record.updated || ''),
  };

  switch (collection) {
    case 'families':
      return {
        ...base,
        settings: parseJsonField(record.settingsJson ?? record.settings, {}),
      };
    case 'learners':
      return {
        ...base,
        family: record.familyId ?? record.family,
        preferences: parseJsonField(record.preferencesJson ?? record.preferences, {}),
      };
    case 'schedules':
      return {
        ...base,
        family: record.familyId ?? record.family,
        learner: record.learnerId ?? record.learner,
        blocks: parseJsonField(record.blocksJson ?? record.blocks, []),
      };
    case 'blocks':
      return {
        ...base,
        schedule: record.scheduleId ?? record.schedule,
        learner: record.learnerId ?? record.learner,
        materials: parseJsonField(record.materialsJson ?? record.materials, []),
        resources: parseJsonField(record.resourcesJson ?? record.resources, []),
      };
    case 'artifacts':
      return {
        ...base,
        family: record.familyId ?? record.family,
        learner: record.learnerId ?? record.learner,
        file: record.fileId ?? record.file,
        tags: parseJsonField(record.tagsJson ?? record.tags, []),
        competencies: parseJsonField(record.competenciesJson ?? record.competencies, []),
        iterations: parseJsonField(record.iterationsJson ?? record.iterations, []),
        feedback: parseJsonField(record.feedbackJson ?? record.feedback, []),
        rubricScore: parseJsonField(record.rubricScoreJson ?? record.rubricScore, null),
      };
    case 'progress':
      return {
        ...base,
        family: record.familyId ?? record.family,
        learner: record.learnerId ?? record.learner,
      };
    case 'points':
      return {
        ...base,
        family: record.familyId ?? record.family,
        learner: record.learnerId ?? record.learner,
      };
    case 'rewards_redemptions':
      return {
        ...base,
        family: record.familyId ?? record.family,
        learner: record.learnerId ?? record.learner,
      };
    case 'competencies':
      return {
        ...base,
        learner: record.learnerId ?? record.learner,
        evidenceIds: parseJsonField(record.evidenceIdsJson ?? record.evidenceIds, []),
      };
    case 'projects':
      return {
        ...base,
        family: record.familyId ?? record.family,
        learner: record.learnerId ?? record.learner,
        externalPlatformIds: parseJsonField(record.externalPlatformIdsJson ?? record.externalPlatformIds, []),
        tags: parseJsonField(record.tagsJson ?? record.tags, []),
        artifactIds: parseJsonField(record.artifactIdsJson ?? record.artifactIds, []),
        reflectionIds: parseJsonField(record.reflectionIdsJson ?? record.reflectionIds, []),
      };
    case 'project_steps':
      return {
        ...base,
        family: record.familyId ?? record.family,
        learner: record.learnerId ?? record.learner,
        project: record.projectId ?? record.project,
        evidenceArtifactIds: parseJsonField(record.evidenceArtifactIdsJson ?? record.evidenceArtifactIds, []),
      };
    case 'reflection_entries':
      return {
        ...base,
        family: record.familyId ?? record.family,
        learner: record.learnerId ?? record.learner,
        project: record.projectId ?? record.project,
        quizAnswers: parseJsonField(record.quizAnswersJson ?? record.quizAnswers, []),
        evidenceArtifactIds: parseJsonField(record.evidenceArtifactIdsJson ?? record.evidenceArtifactIds, []),
        tags: parseJsonField(record.tagsJson ?? record.tags, []),
      };
    case 'external_activity_sessions':
      return {
        ...base,
        family: record.familyId ?? record.family,
        learner: record.learnerId ?? record.learner,
        project: record.projectId ?? record.project,
        launchUrl: record.url ?? record.launchUrl,
        evidenceArtifactIds: parseJsonField(record.evidenceArtifactIdsJson ?? record.evidenceArtifactIds, []),
        tags: parseJsonField(record.tagsJson ?? record.tags, []),
      };
    case 'achievement_unlocks':
      return {
        ...base,
        family: record.familyId ?? record.family,
        learner: record.learnerId ?? record.learner,
      };
    case 'planning_rules':
      return {
        ...base,
        family: record.familyId ?? record.family,
        learner: record.learnerId ?? record.learner,
        supportPodIds: parseJsonField(record.supportPodIdsJson ?? record.supportPodIds, []),
        preferredPlatformIds: parseJsonField(
          record.preferredPlatformIdsJson ?? record.preferredPlatformIds,
          []
        ),
      };
    default:
      return base;
  }
};

const toJsonString = (value: unknown, fallback: string): string => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  return typeof value === 'string' ? value : JSON.stringify(value);
};

const toAppwritePayload = (collection: string, data: Record<string, unknown>): Record<string, unknown> => {
  const payload: Record<string, unknown> = { ...data };
  delete payload.id;
  delete payload.created;
  delete payload.updated;

  switch (collection) {
    case 'families':
      return {
        legacyPocketBaseId: data.id,
        name: data.name,
        currentPodId: data.currentPodId,
        currentWeek: data.currentWeek,
        timezone:
          (typeof data.settings === 'object' && data.settings && 'timezone' in data.settings
            ? (data.settings as Record<string, unknown>).timezone
            : data.timezone) || undefined,
        schoolYearStart: data.schoolYearStart,
        settingsJson: toJsonString(data.settings, '{}'),
      };
    case 'learners':
      return {
        legacyPocketBaseId: data.id,
        familyId: data.family ?? data.familyId,
        name: data.name,
        age: data.age,
        skillLevel: data.skillLevel,
        avatar: data.avatar,
        pin: data.pin,
        points: data.points,
        streakDays: data.streakDays,
        preferencesJson: toJsonString(data.preferences, '{}'),
      };
    case 'schedules':
      return {
        legacyPocketBaseId: data.id,
        familyId: data.family ?? data.familyId,
        learnerId: data.learner ?? data.learnerId,
        date: data.date,
        dayOfWeek: data.dayOfWeek,
        isTemplate: data.isTemplate,
        blocksJson: toJsonString(data.blocks, '[]'),
      };
    case 'blocks':
      return {
        legacyPocketBaseId: data.id,
        scheduleId: data.schedule ?? data.scheduleId,
        learnerId: data.learner ?? data.learnerId,
        title: data.title,
        subject: data.subject,
        type: data.type,
        startTime: data.startTime,
        duration: data.duration,
        status: data.status,
        delayedUntil: data.delayedUntil,
        podId: data.podId,
        weekNumber: data.weekNumber,
        description: data.description,
        materialsJson: toJsonString(data.materials, '[]'),
        resourcesJson: toJsonString(data.resources, '[]'),
        completedAt: data.completedAt,
        focusMinutes: data.focusMinutes,
        pointsEarned: data.pointsEarned,
      };
    case 'artifacts':
      return {
        legacyPocketBaseId: data.id,
        familyId: data.family ?? data.familyId,
        learnerId: data.learner ?? data.learnerId,
        type: data.type,
        title: data.title,
        description: data.description,
        reflection: data.reflection,
        fileId: data.file ?? data.fileId,
        fileName: data.fileName,
        fileMimeType: data.fileMimeType,
        fileSize: data.fileSize,
        thumbnailUrl: data.thumbnailUrl,
        externalUrl: data.externalUrl,
        tagsJson: toJsonString(data.tags, '[]'),
        competenciesJson: toJsonString(data.competencies, '[]'),
        skillLevel: data.skillLevel,
        visibility: data.visibility,
        isFeatured: data.isFeatured,
        podId: data.podId,
        blockId: data.blockId,
        weekNumber: data.weekNumber,
        iterationsJson: toJsonString(data.iterations, '[]'),
        feedbackJson: toJsonString(data.feedback, '[]'),
        rubricScoreJson: toJsonString(data.rubricScore, '{}'),
        publishedAt: data.publishedAt,
      };
    case 'progress':
      return {
        legacyPocketBaseId: data.id,
        familyId: data.family ?? data.familyId,
        learnerId: data.learner ?? data.learnerId,
        date: data.date,
        podId: data.podId,
        weekNumber: data.weekNumber,
        blocksCompleted: data.blocksCompleted,
        blocksTotal: data.blocksTotal,
        focusMinutes: data.focusMinutes,
        pointsEarned: data.pointsEarned,
        artifactsCreated: data.artifactsCreated,
        streakMaintained: data.streakMaintained,
        frenchMinutes: data.frenchMinutes,
        vrMinutes: data.vrMinutes,
      };
    case 'points':
      return {
        legacyPocketBaseId: data.id,
        familyId: data.family ?? data.familyId,
        learnerId: data.learner ?? data.learnerId,
        type: data.type,
        points: data.points,
        blockId: data.blockId,
        artifactId: data.artifactId,
        description: data.description,
        sourceDate: data.sourceDate,
      };
    case 'rewards_redemptions':
      return {
        legacyPocketBaseId: data.id,
        familyId: data.family ?? data.familyId,
        learnerId: data.learner ?? data.learnerId,
        rewardId: data.rewardId,
        rewardTitle: data.rewardTitle,
        pointsSpent: data.pointsSpent,
        status: data.status,
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt,
        fulfilledAt: data.fulfilledAt,
        notes: data.notes,
      };
    case 'competencies':
      return {
        legacyPocketBaseId: data.id,
        learnerId: data.learner ?? data.learnerId,
        domain: data.domain,
        level: data.level,
        evidenceIdsJson: toJsonString(data.evidenceIds, '[]'),
        assessedBy: data.assessedBy,
        notes: data.notes,
      };
    case 'projects':
      return {
        legacyPocketBaseId: data.id,
        familyId: data.family ?? data.familyId,
        learnerId: data.learner ?? data.learnerId,
        podId: data.podId,
        title: data.title,
        summary: data.summary,
        goal: data.goal,
        status: data.status,
        source: data.source,
        skillLevel: data.skillLevel,
        challengeLevel: data.challengeLevel,
        startDate: data.startDate,
        targetDate: data.targetDate,
        completedAt: data.completedAt,
        externalPlatformIdsJson: toJsonString(data.externalPlatformIds, '[]'),
        tagsJson: toJsonString(data.tags, '[]'),
        artifactIdsJson: toJsonString(data.artifactIds, '[]'),
        reflectionIdsJson: toJsonString(data.reflectionIds, '[]'),
        lastWorkedAt: data.lastWorkedAt,
      };
    case 'project_steps':
      return {
        legacyPocketBaseId: data.id,
        projectId: data.project ?? data.projectId,
        familyId: data.family ?? data.familyId,
        learnerId: data.learner ?? data.learnerId,
        title: data.title,
        description: data.description,
        status: data.status,
        orderIndex: data.orderIndex,
        linkedBlockId: data.linkedBlockId,
        linkedPlatformId: data.linkedPlatformId,
        dueDate: data.dueDate,
        completedAt: data.completedAt,
        evidenceArtifactIdsJson: toJsonString(data.evidenceArtifactIds, '[]'),
        notes: data.notes,
      };
    case 'reflection_entries':
      return {
        legacyPocketBaseId: data.id,
        familyId: data.family ?? data.familyId,
        learnerId: data.learner ?? data.learnerId,
        projectId: data.project ?? data.projectId,
        externalSessionId: data.externalSessionId,
        blockId: data.blockId,
        blockTitle: data.blockTitle,
        date: data.date,
        prompt: data.prompt,
        whatLearned: data.whatLearned,
        challenge: data.challenge,
        nextStep: data.nextStep,
        confidence: data.confidence,
        notes: data.notes,
        quizAnswersJson: toJsonString(data.quizAnswers, '[]'),
        evidenceArtifactIdsJson: toJsonString(data.evidenceArtifactIds, '[]'),
        tagsJson: toJsonString(data.tags, '[]'),
      };
    case 'external_activity_sessions':
      return {
        legacyPocketBaseId: data.id,
        familyId: data.family ?? data.familyId,
        learnerId: data.learner ?? data.learnerId,
        projectId: data.project ?? data.projectId,
        platformId: data.platformId,
        platformName: data.platformName,
        title: data.title,
        description: data.description,
        url: data.launchUrl ?? data.url,
        scheduledDate: data.scheduledDate,
        scheduledStartTime: data.scheduledStartTime,
        durationMinutes: data.durationMinutes,
        status: data.status,
        syncMode: data.syncMode,
        importedAccountLabel: data.importedAccountLabel,
        notes: data.notes,
        reflectionId: data.reflectionId,
        evidenceArtifactIdsJson: toJsonString(data.evidenceArtifactIds, '[]'),
        tagsJson: toJsonString(data.tags, '[]'),
        completedAt: data.completedAt,
        blockId: data.blockId,
        lastSyncedAt: data.lastSyncedAt,
      };
    case 'achievement_unlocks':
      return {
        legacyPocketBaseId: data.id,
        familyId: data.family ?? data.familyId,
        learnerId: data.learner ?? data.learnerId,
        achievementId: data.achievementId,
        unlockedAt: data.unlockedAt,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        pointsAwarded: data.pointsAwarded,
      };
    case 'planning_rules':
      return {
        legacyPocketBaseId: data.id,
        familyId: data.family ?? data.familyId,
        learnerId: data.learner ?? data.learnerId,
        name: data.name,
        status: data.status,
        primaryPodId: data.primaryPodId,
        supportPodIdsJson: toJsonString(data.supportPodIds, '[]'),
        preferredPlatformIdsJson: toJsonString(data.preferredPlatformIds, '[]'),
        weeklyProjectSessions: data.weeklyProjectSessions,
        weeklyExternalSessions: data.weeklyExternalSessions,
        includeMovement: data.includeMovement,
        includeFrench: data.includeFrench,
        includeWriting: data.includeWriting,
        challengeLevel: data.challengeLevel,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        notes: data.notes,
      };
    default:
      return payload;
  }
};

const appwriteRequest = async (
  method: string,
  url: string,
  body?: Record<string, unknown>
): Promise<RawRecord> => {
  const response = await fetch(url, {
    method,
    headers: appwriteHeaders(),
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const text = await response.text();
  const json = text ? (JSON.parse(text) as RawRecord) : {};

  if (!response.ok) {
    throw new Error(`Appwrite request failed (${response.status}): ${text}`);
  }

  return json;
};

const listAllAppwriteDocuments = async (collection: string): Promise<RawRecord[]> => {
  const documents: RawRecord[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const url = `${appwriteCollectionUrl(collection)}?queries[]=${encodeURIComponent(`limit(${limit})`)}&queries[]=${encodeURIComponent(`offset(${offset})`)}`;
    const payload = await appwriteRequest('GET', url);
    const page = Array.isArray(payload.documents) ? (payload.documents as RawRecord[]) : [];
    documents.push(...page.map((record) => normalizeAppwriteRecord(collection, record)));

    if (page.length < limit) {
      break;
    }

    offset += limit;
  }

  return documents;
};

const pocketBaseClient: DocumentBackendClient = {
  kind: 'pocketbase',
  async isOnline() {
    if (!isPocketBaseConfigured()) {
      return false;
    }

    try {
      await pb.health.check();
      return true;
    } catch {
      return false;
    }
  },
  async getOne(collection, id) {
    const record = (await pb.collection(collection).getOne(id)) as RawRecord;
    return record;
  },
  async list(collection) {
    const records = (await pb.collection(collection).getFullList({
      sort: '-created',
    })) as RawRecord[];
    return records;
  },
  async create(collection, data) {
    return (await pb.collection(collection).create(data)) as RawRecord;
  },
  async update(collection, id, data) {
    return (await pb.collection(collection).update(id, data)) as RawRecord;
  },
  async delete(collection, id) {
    await pb.collection(collection).delete(id);
  },
};

const appwriteClient: DocumentBackendClient = {
  kind: 'appwrite',
  async isOnline() {
    if (!isAppwriteConfigured()) {
      return false;
    }

    try {
      const response = await fetch(`${appwriteConfig.endpoint}/health/version`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  },
  async getOne(collection, id) {
    const record = await appwriteRequest('GET', appwriteDocumentUrl(collection, id));
    return normalizeAppwriteRecord(collection, record);
  },
  async list(collection) {
    return listAllAppwriteDocuments(collection);
  },
  async create(collection, data) {
    const record = await appwriteRequest('POST', appwriteCollectionUrl(collection), {
      documentId: data.id || 'unique()',
      data: toAppwritePayload(collection, data),
      permissions: [],
    });
    return normalizeAppwriteRecord(collection, record);
  },
  async update(collection, id, data) {
    const record = await appwriteRequest('PATCH', appwriteDocumentUrl(collection, id), {
      data: toAppwritePayload(collection, data),
      permissions: [],
    });
    return normalizeAppwriteRecord(collection, record);
  },
  async delete(collection, id) {
    await appwriteRequest('DELETE', appwriteDocumentUrl(collection, id));
  },
};

const DATA_BACKEND = ((import.meta.env.VITE_DATA_BACKEND as DataBackendKind | undefined) ||
  (isAppwriteConfigured() ? 'appwrite' : 'pocketbase')) as DataBackendKind;

export const documentBackendClient: DocumentBackendClient =
  DATA_BACKEND === 'appwrite' ? appwriteClient : pocketBaseClient;

export const getDataBackendKind = (): DataBackendKind => documentBackendClient.kind;
