import { COLLECTIONS } from '../lib/pocketbase';
import { storage } from '../lib/storage';
import { queueSync } from '../hooks/useDatabase';
import { documentBackendClient } from './documentBackendClient';
import type {
  AchievementUnlock,
  ExternalActivitySession,
  LearningProject,
  PlannedSupportPod,
  PlanningRule,
  ProjectStep,
  ReflectionEntry,
} from '../types/learning';

const OFFLINE_KEYS = {
  PROJECTS: 'offline-projects',
  PROJECT_STEPS: 'offline-project-steps',
  REFLECTIONS: 'offline-reflections',
  EXTERNAL_SESSIONS: 'offline-external-sessions',
  ACHIEVEMENT_UNLOCKS: 'offline-achievement-unlocks',
  PLANNING_RULES: 'offline-planning-rules',
} as const;

const collectionAvailability = new Map<string, boolean>();

const checkOnline = async (): Promise<boolean> => {
  return documentBackendClient.isOnline();
};

const isPocketBaseRecordId = (id: string): boolean => /^[a-z0-9]{15}$/.test(id);

const omitRecordId = (data: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'id'));

const omitUndefined = (data: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));

const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return undefined;
  }

  const { status } = error as { status?: unknown };
  return typeof status === 'number' ? status : undefined;
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error as { message?: unknown };
    return typeof message === 'string' ? message : '';
  }

  return '';
};

const isMissingCollectionError = (error: unknown): boolean => {
  const status = getErrorStatus(error);
  if (status === 404) {
    return true;
  }

  const message = getErrorMessage(error).toLowerCase();
  return message.includes('missing') || message.includes('not found');
};

const shouldUseRemoteCollection = async (collection: string): Promise<boolean> => {
  if (collectionAvailability.get(collection) === false) {
    return false;
  }

  return checkOnline();
};

const markCollectionAvailable = (collection: string): void => {
  collectionAvailability.set(collection, true);
};

const markCollectionMissing = (collection: string): void => {
  collectionAvailability.set(collection, false);
};

const updateCachedList = <T extends { id: string }>(key: string, item: T): T[] => {
  const cached = storage.get<T[]>(key, []);
  const index = cached.findIndex((entry) => entry.id === item.id);

  if (index >= 0) {
    cached[index] = item;
  } else {
    cached.unshift(item);
  }

  storage.set(key, cached);
  return cached;
};

const removeCachedItem = <T extends { id: string }>(key: string, itemId: string): T[] => {
  const cached = storage.get<T[]>(key, []).filter((entry) => entry.id !== itemId);
  storage.set(key, cached);
  return cached;
};

const mapSessionStatusToBlockStatus = (status: ExternalActivitySession['status']) => {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'in-progress':
      return 'in-progress';
    case 'skipped':
      return 'skipped';
    default:
      return 'scheduled';
  }
};

const getProjectsKey = (learnerId: string) => `${OFFLINE_KEYS.PROJECTS}-${learnerId}`;
const getProjectStepsKey = (projectId: string) => `${OFFLINE_KEYS.PROJECT_STEPS}-${projectId}`;
const getReflectionsKey = (learnerId: string) => `${OFFLINE_KEYS.REFLECTIONS}-${learnerId}`;
const getExternalSessionsKey = (learnerId: string) => `${OFFLINE_KEYS.EXTERNAL_SESSIONS}-${learnerId}`;
const getAchievementUnlocksKey = (learnerId: string) => `${OFFLINE_KEYS.ACHIEVEMENT_UNLOCKS}-${learnerId}`;
const getPlanningRulesKey = (learnerId: string) => `${OFFLINE_KEYS.PLANNING_RULES}-${learnerId}`;

export const projectDataService = {
  getCachedByLearner(learnerId: string): LearningProject[] {
    return storage.get<LearningProject[]>(getProjectsKey(learnerId), []);
  },

  async getByLearner(learnerId: string): Promise<LearningProject[]> {
    if (await shouldUseRemoteCollection(COLLECTIONS.PROJECTS)) {
      try {
        const records = await documentBackendClient.list(COLLECTIONS.PROJECTS);
        const projects = records
          .filter((record) => String(record.learner || record.learnerId || '') === learnerId)
          .map(mapRecordToProject)
          .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
        storage.set(getProjectsKey(learnerId), projects);
        markCollectionAvailable(COLLECTIONS.PROJECTS);
        return projects;
      } catch (error) {
        if (isMissingCollectionError(error)) {
          markCollectionMissing(COLLECTIONS.PROJECTS);
        }
      }
    }

    return this.getCachedByLearner(learnerId);
  },

  async save(project: LearningProject): Promise<LearningProject> {
    const cacheKey = getProjectsKey(project.learnerId);
    updateCachedList(cacheKey, project);

    if (await shouldUseRemoteCollection(COLLECTIONS.PROJECTS)) {
      const data = mapProjectToRecord(project);
      const shouldUpdateRemote = isPocketBaseRecordId(project.id);

      try {
        const record = shouldUpdateRemote
          ? await documentBackendClient.update(COLLECTIONS.PROJECTS, project.id, omitRecordId(data))
          : await documentBackendClient.create(COLLECTIONS.PROJECTS, omitRecordId(data));

        const savedProject = mapRecordToProject(record);
        const cached = storage.get<LearningProject[]>(cacheKey, []);
        storage.set(
          cacheKey,
          cached.map((entry) => (entry.id === project.id ? savedProject : entry))
        );
        markCollectionAvailable(COLLECTIONS.PROJECTS);
        return savedProject;
      } catch (error) {
        if (isMissingCollectionError(error)) {
          markCollectionMissing(COLLECTIONS.PROJECTS);
        } else {
          queueSync(
            COLLECTIONS.PROJECTS,
            shouldUpdateRemote ? 'update' : 'create',
            shouldUpdateRemote ? data : omitRecordId(data)
          );
        }
      }
    }

    return project;
  },

  async touch(projectId: string, learnerId: string, updates: Partial<LearningProject>): Promise<LearningProject | null> {
    const current = this.getCachedByLearner(learnerId).find((project) => project.id === projectId);
    if (!current) {
      return null;
    }

    const nextProject: LearningProject = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.save(nextProject);
  },
};

export const projectStepDataService = {
  getCachedByProject(projectId: string): ProjectStep[] {
    return storage.get<ProjectStep[]>(getProjectStepsKey(projectId), []);
  },

  async getByProject(projectId: string): Promise<ProjectStep[]> {
    if (await shouldUseRemoteCollection(COLLECTIONS.PROJECT_STEPS)) {
      try {
        const records = await documentBackendClient.list(COLLECTIONS.PROJECT_STEPS);
        const steps = records
          .filter((record) => String(record.project || record.projectId || '') === projectId)
          .map(mapRecordToProjectStep)
          .sort((left, right) => left.orderIndex - right.orderIndex);
        storage.set(getProjectStepsKey(projectId), steps);
        markCollectionAvailable(COLLECTIONS.PROJECT_STEPS);
        return steps;
      } catch (error) {
        if (isMissingCollectionError(error)) {
          markCollectionMissing(COLLECTIONS.PROJECT_STEPS);
        }
      }
    }

    return this.getCachedByProject(projectId);
  },

  async save(step: ProjectStep): Promise<ProjectStep> {
    const cacheKey = getProjectStepsKey(step.projectId);
    updateCachedList(cacheKey, step);

    if (await shouldUseRemoteCollection(COLLECTIONS.PROJECT_STEPS)) {
      const data = mapProjectStepToRecord(step);
      const shouldUpdateRemote = isPocketBaseRecordId(step.id);

      try {
        const record = shouldUpdateRemote
          ? await documentBackendClient.update(COLLECTIONS.PROJECT_STEPS, step.id, omitRecordId(data))
          : await documentBackendClient.create(COLLECTIONS.PROJECT_STEPS, omitRecordId(data));

        const savedStep = mapRecordToProjectStep(record);
        const cached = storage.get<ProjectStep[]>(cacheKey, []);
        storage.set(
          cacheKey,
          cached.map((entry) => (entry.id === step.id ? savedStep : entry))
        );
        markCollectionAvailable(COLLECTIONS.PROJECT_STEPS);
        return savedStep;
      } catch (error) {
        if (isMissingCollectionError(error)) {
          markCollectionMissing(COLLECTIONS.PROJECT_STEPS);
        } else {
          queueSync(
            COLLECTIONS.PROJECT_STEPS,
            shouldUpdateRemote ? 'update' : 'create',
            shouldUpdateRemote ? data : omitRecordId(data)
          );
        }
      }
    }

    return step;
  },
};

export const reflectionEntryDataService = {
  getCachedByLearner(learnerId: string): ReflectionEntry[] {
    return storage.get<ReflectionEntry[]>(getReflectionsKey(learnerId), []);
  },

  async getByLearner(learnerId: string): Promise<ReflectionEntry[]> {
    if (await shouldUseRemoteCollection(COLLECTIONS.REFLECTION_ENTRIES)) {
      try {
        const records = await documentBackendClient.list(COLLECTIONS.REFLECTION_ENTRIES);
        const entries = records
          .filter((record) => String(record.learner || record.learnerId || '') === learnerId)
          .map(mapRecordToReflectionEntry)
          .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
        storage.set(getReflectionsKey(learnerId), entries);
        markCollectionAvailable(COLLECTIONS.REFLECTION_ENTRIES);
        return entries;
      } catch (error) {
        if (isMissingCollectionError(error)) {
          markCollectionMissing(COLLECTIONS.REFLECTION_ENTRIES);
        }
      }
    }

    return this.getCachedByLearner(learnerId);
  },

  async create(entry: ReflectionEntry): Promise<ReflectionEntry> {
    const cacheKey = getReflectionsKey(entry.learnerId);
    updateCachedList(cacheKey, entry);

    if (await shouldUseRemoteCollection(COLLECTIONS.REFLECTION_ENTRIES)) {
      const data = mapReflectionEntryToRecord(entry);
      const shouldUpdateRemote = isPocketBaseRecordId(entry.id);

      try {
        const record = shouldUpdateRemote
          ? await documentBackendClient.update(COLLECTIONS.REFLECTION_ENTRIES, entry.id, omitRecordId(data))
          : await documentBackendClient.create(COLLECTIONS.REFLECTION_ENTRIES, omitRecordId(data));

        const savedEntry = mapRecordToReflectionEntry(record);
        const cached = storage.get<ReflectionEntry[]>(cacheKey, []);
        storage.set(
          cacheKey,
          cached.map((item) => (item.id === entry.id ? savedEntry : item))
        );
        markCollectionAvailable(COLLECTIONS.REFLECTION_ENTRIES);
        return savedEntry;
      } catch (error) {
        if (isMissingCollectionError(error)) {
          markCollectionMissing(COLLECTIONS.REFLECTION_ENTRIES);
        } else {
          queueSync(
            COLLECTIONS.REFLECTION_ENTRIES,
            shouldUpdateRemote ? 'update' : 'create',
            shouldUpdateRemote ? data : omitRecordId(data)
          );
        }
      }
    }

    return entry;
  },
};

export const externalActivitySessionDataService = {
  getCachedByLearner(learnerId: string): ExternalActivitySession[] {
    return storage.get<ExternalActivitySession[]>(getExternalSessionsKey(learnerId), []);
  },

  getCachedForDate(learnerId: string, date: string): ExternalActivitySession[] {
    return this.getCachedByLearner(learnerId).filter((session) => session.scheduledDate === date);
  },

  async getByLearner(learnerId: string): Promise<ExternalActivitySession[]> {
    if (await shouldUseRemoteCollection(COLLECTIONS.EXTERNAL_ACTIVITY_SESSIONS)) {
      try {
        const records = await documentBackendClient.list(COLLECTIONS.EXTERNAL_ACTIVITY_SESSIONS);
        const sessions = records
          .filter((record) => String(record.learner || record.learnerId || '') === learnerId)
          .map(mapRecordToExternalSession)
          .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
        storage.set(getExternalSessionsKey(learnerId), sessions);
        markCollectionAvailable(COLLECTIONS.EXTERNAL_ACTIVITY_SESSIONS);
        return sessions;
      } catch (error) {
        if (isMissingCollectionError(error)) {
          markCollectionMissing(COLLECTIONS.EXTERNAL_ACTIVITY_SESSIONS);
        }
      }
    }

    return this.getCachedByLearner(learnerId);
  },

  async save(session: ExternalActivitySession): Promise<ExternalActivitySession> {
    const cacheKey = getExternalSessionsKey(session.learnerId);
    updateCachedList(cacheKey, session);

    if (await shouldUseRemoteCollection(COLLECTIONS.EXTERNAL_ACTIVITY_SESSIONS)) {
      const data = mapExternalSessionToRecord(session);
      const shouldUpdateRemote = isPocketBaseRecordId(session.id);

      try {
        const record = shouldUpdateRemote
          ? await documentBackendClient.update(
              COLLECTIONS.EXTERNAL_ACTIVITY_SESSIONS,
              session.id,
              omitRecordId(data)
            )
          : await documentBackendClient.create(COLLECTIONS.EXTERNAL_ACTIVITY_SESSIONS, omitRecordId(data));

        const savedSession = mapRecordToExternalSession(record);
        const cached = storage.get<ExternalActivitySession[]>(cacheKey, []);
        storage.set(
          cacheKey,
          cached.map((entry) => (entry.id === session.id ? savedSession : entry))
        );
        markCollectionAvailable(COLLECTIONS.EXTERNAL_ACTIVITY_SESSIONS);
        return savedSession;
      } catch (error) {
        if (isMissingCollectionError(error)) {
          markCollectionMissing(COLLECTIONS.EXTERNAL_ACTIVITY_SESSIONS);
        } else {
          queueSync(
            COLLECTIONS.EXTERNAL_ACTIVITY_SESSIONS,
            shouldUpdateRemote ? 'update' : 'create',
            shouldUpdateRemote ? data : omitRecordId(data)
          );
        }
      }
    }

    return session;
  },
};

export const achievementUnlockDataService = {
  getCachedByLearner(learnerId: string): AchievementUnlock[] {
    return storage.get<AchievementUnlock[]>(getAchievementUnlocksKey(learnerId), []);
  },

  async getByLearner(learnerId: string): Promise<AchievementUnlock[]> {
    if (await shouldUseRemoteCollection(COLLECTIONS.ACHIEVEMENT_UNLOCKS)) {
      try {
        const records = await documentBackendClient.list(COLLECTIONS.ACHIEVEMENT_UNLOCKS);
        const unlocks = records
          .filter((record) => String(record.learner || record.learnerId || '') === learnerId)
          .map(mapRecordToAchievementUnlock)
          .sort((left, right) => new Date(right.unlockedAt).getTime() - new Date(left.unlockedAt).getTime());
        storage.set(getAchievementUnlocksKey(learnerId), unlocks);
        markCollectionAvailable(COLLECTIONS.ACHIEVEMENT_UNLOCKS);
        return unlocks;
      } catch (error) {
        if (isMissingCollectionError(error)) {
          markCollectionMissing(COLLECTIONS.ACHIEVEMENT_UNLOCKS);
        }
      }
    }

    return this.getCachedByLearner(learnerId);
  },

  async unlock(unlock: AchievementUnlock): Promise<AchievementUnlock> {
    const cacheKey = getAchievementUnlocksKey(unlock.learnerId);
    const existing = storage
      .get<AchievementUnlock[]>(cacheKey, [])
      .find((entry) => entry.achievementId === unlock.achievementId);

    if (existing) {
      return existing;
    }

    updateCachedList(cacheKey, unlock);

    if (await shouldUseRemoteCollection(COLLECTIONS.ACHIEVEMENT_UNLOCKS)) {
      const data = mapAchievementUnlockToRecord(unlock);
      const shouldUpdateRemote = isPocketBaseRecordId(unlock.id);

      try {
        const record = shouldUpdateRemote
          ? await documentBackendClient.update(
              COLLECTIONS.ACHIEVEMENT_UNLOCKS,
              unlock.id,
              omitRecordId(data)
            )
          : await documentBackendClient.create(COLLECTIONS.ACHIEVEMENT_UNLOCKS, omitRecordId(data));

        const savedUnlock = mapRecordToAchievementUnlock(record);
        const cached = storage.get<AchievementUnlock[]>(cacheKey, []);
        storage.set(
          cacheKey,
          cached.map((entry) => (entry.id === unlock.id ? savedUnlock : entry))
        );
        markCollectionAvailable(COLLECTIONS.ACHIEVEMENT_UNLOCKS);
        return savedUnlock;
      } catch (error) {
        if (isMissingCollectionError(error)) {
          markCollectionMissing(COLLECTIONS.ACHIEVEMENT_UNLOCKS);
        } else {
          queueSync(
            COLLECTIONS.ACHIEVEMENT_UNLOCKS,
            shouldUpdateRemote ? 'update' : 'create',
            shouldUpdateRemote ? data : omitRecordId(data)
          );
        }
      }
    }

    return unlock;
  },
};

function normalizePlanningRule(rule: PlanningRule): PlanningRule {
  const supportPodPlans = Array.isArray(rule.supportPodPlans)
    ? rule.supportPodPlans
    : (rule.supportPodIds || []).map((podId) => ({
        podId,
        startDate: rule.periodStart,
        endDate: rule.periodEnd,
      }));

  return {
    ...rule,
    supportPodIds: supportPodPlans.map((plan) => plan.podId),
    supportPodPlans,
  };
}

export const planningRuleDataService = {
  getCachedByLearner(learnerId: string): PlanningRule[] {
    return storage
      .get<PlanningRule[]>(getPlanningRulesKey(learnerId), [])
      .map(normalizePlanningRule);
  },

  getCachedActiveForFamily(
    familyId: string,
    date: string = new Date().toISOString().split('T')[0]
  ): PlanningRule[] {
    try {
      return Object.keys(localStorage)
        .filter((key) => key.includes(`${OFFLINE_KEYS.PLANNING_RULES}-`))
        .flatMap((key) => {
          const raw = localStorage.getItem(key);
          if (!raw) {
            return [];
          }

          const parsed = JSON.parse(raw) as PlanningRule[];
          return Array.isArray(parsed) ? parsed.map(normalizePlanningRule) : [];
        })
        .filter((rule) => {
          if (rule.familyId !== familyId || rule.status !== 'active') {
            return false;
          }

          if (rule.periodStart && rule.periodStart > date) {
            return false;
          }

          if (rule.periodEnd && rule.periodEnd < date) {
            return false;
          }

          return true;
        });
    } catch {
      return [];
    }
  },

  getCachedActiveForLearner(
    familyId: string,
    learnerId: string,
    date: string = new Date().toISOString().split('T')[0]
  ): PlanningRule | null {
    return (
      this.getCachedByLearner(learnerId).find((rule) => {
        if (rule.familyId !== familyId || rule.status !== 'active') {
          return false;
        }

        if (rule.periodStart && rule.periodStart > date) {
          return false;
        }

        if (rule.periodEnd && rule.periodEnd < date) {
          return false;
        }

        return true;
      }) || null
    );
  },

  async getByLearner(learnerId: string): Promise<PlanningRule[]> {
    if (await shouldUseRemoteCollection(COLLECTIONS.PLANNING_RULES)) {
      try {
        const records = await documentBackendClient.list(COLLECTIONS.PLANNING_RULES);
        const rules = records
          .filter((record) => String(record.learner || record.learnerId || '') === learnerId)
          .map(mapRecordToPlanningRule)
          .map(normalizePlanningRule)
          .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
        storage.set(getPlanningRulesKey(learnerId), rules);
        markCollectionAvailable(COLLECTIONS.PLANNING_RULES);
        return rules;
      } catch (error) {
        if (isMissingCollectionError(error)) {
          markCollectionMissing(COLLECTIONS.PLANNING_RULES);
        }
      }
    }

    return this.getCachedByLearner(learnerId);
  },

  async save(rule: PlanningRule): Promise<PlanningRule> {
    const normalizedRule = normalizePlanningRule(rule);
    const cacheKey = getPlanningRulesKey(normalizedRule.learnerId);
    updateCachedList(cacheKey, normalizedRule);

    if (await shouldUseRemoteCollection(COLLECTIONS.PLANNING_RULES)) {
      const data = mapPlanningRuleToRecord(normalizedRule);
      const shouldUpdateRemote = isPocketBaseRecordId(normalizedRule.id);

      try {
        const record = shouldUpdateRemote
          ? await documentBackendClient.update(
              COLLECTIONS.PLANNING_RULES,
              normalizedRule.id,
              omitRecordId(data)
            )
          : await documentBackendClient.create(COLLECTIONS.PLANNING_RULES, omitRecordId(data));

        const savedRule = normalizePlanningRule(mapRecordToPlanningRule(record));
        const cached = storage.get<PlanningRule[]>(cacheKey, []);
        storage.set(
          cacheKey,
          cached.map((entry) => (entry.id === normalizedRule.id ? savedRule : entry))
        );
        markCollectionAvailable(COLLECTIONS.PLANNING_RULES);
        return savedRule;
      } catch (error) {
        if (isMissingCollectionError(error)) {
          markCollectionMissing(COLLECTIONS.PLANNING_RULES);
        } else {
          queueSync(
            COLLECTIONS.PLANNING_RULES,
            shouldUpdateRemote ? 'update' : 'create',
            shouldUpdateRemote ? data : omitRecordId(data)
          );
        }
      }
    }

    return normalizedRule;
  },
};

function mapRecordToProject(record: Record<string, unknown>): LearningProject {
  return {
    id: record.id as string,
    familyId: record.family as string,
    learnerId: record.learner as string,
    podId: record.podId as string | undefined,
    title: record.title as string,
    summary: record.summary as string | undefined,
    goal: record.goal as string | undefined,
    status: (record.status as LearningProject['status']) || 'planned',
    source: (record.source as LearningProject['source']) || 'custom',
    skillLevel: (record.skillLevel as LearningProject['skillLevel']) || 'foundation',
    challengeLevel: (record.challengeLevel as LearningProject['challengeLevel']) || 'core',
    startDate: record.startDate as string,
    targetDate: record.targetDate as string | undefined,
    completedAt: record.completedAt as string | undefined,
    externalPlatformIds: (record.externalPlatformIds as string[]) || [],
    tags: (record.tags as string[]) || [],
    artifactIds: (record.artifactIds as string[]) || [],
    reflectionIds: (record.reflectionIds as string[]) || [],
    lastWorkedAt: record.lastWorkedAt as string | undefined,
    createdAt: record.created as string,
    updatedAt: record.updated as string,
  };
}

function mapProjectToRecord(project: LearningProject): Record<string, unknown> {
  return omitUndefined({
    id: project.id,
    family: project.familyId,
    learner: project.learnerId,
    podId: project.podId,
    title: project.title,
    summary: project.summary,
    goal: project.goal,
    status: project.status,
    source: project.source,
    skillLevel: project.skillLevel,
    challengeLevel: project.challengeLevel,
    startDate: project.startDate,
    targetDate: project.targetDate,
    completedAt: project.completedAt,
    externalPlatformIds: project.externalPlatformIds,
    tags: project.tags,
    artifactIds: project.artifactIds,
    reflectionIds: project.reflectionIds,
    lastWorkedAt: project.lastWorkedAt,
  });
}

function mapRecordToProjectStep(record: Record<string, unknown>): ProjectStep {
  return {
    id: record.id as string,
    familyId: record.family as string,
    learnerId: record.learner as string,
    projectId: record.project as string,
    title: record.title as string,
    description: record.description as string | undefined,
    status: (record.status as ProjectStep['status']) || 'planned',
    orderIndex: (record.orderIndex as number) || 0,
    linkedBlockId: record.linkedBlockId as string | undefined,
    linkedPlatformId: record.linkedPlatformId as string | undefined,
    dueDate: record.dueDate as string | undefined,
    completedAt: record.completedAt as string | undefined,
    evidenceArtifactIds: (record.evidenceArtifactIds as string[]) || [],
    notes: record.notes as string | undefined,
    createdAt: record.created as string,
    updatedAt: record.updated as string,
  };
}

function mapProjectStepToRecord(step: ProjectStep): Record<string, unknown> {
  return omitUndefined({
    id: step.id,
    family: step.familyId,
    learner: step.learnerId,
    project: step.projectId,
    title: step.title,
    description: step.description,
    status: step.status,
    orderIndex: step.orderIndex,
    linkedBlockId: step.linkedBlockId,
    linkedPlatformId: step.linkedPlatformId,
    dueDate: step.dueDate,
    completedAt: step.completedAt,
    evidenceArtifactIds: step.evidenceArtifactIds,
    notes: step.notes,
  });
}

function mapRecordToReflectionEntry(record: Record<string, unknown>): ReflectionEntry {
  return {
    id: record.id as string,
    familyId: record.family as string,
    learnerId: record.learner as string,
    date: record.date as string,
    blockId: record.blockId as string | undefined,
    blockTitle: record.blockTitle as string | undefined,
    projectId: record.project as string | undefined,
    externalSessionId: record.externalSessionId as string | undefined,
    prompt: record.prompt as string | undefined,
    whatLearned: record.whatLearned as string,
    challenge: record.challenge as string | undefined,
    nextStep: record.nextStep as string | undefined,
    confidence: ((record.confidence as number) || 3) as ReflectionEntry['confidence'],
    notes: record.notes as string | undefined,
    quizAnswers: (record.quizAnswers as ReflectionEntry['quizAnswers']) || [],
    evidenceArtifactIds: (record.evidenceArtifactIds as string[]) || [],
    tags: (record.tags as string[]) || [],
    createdAt: record.created as string,
    updatedAt: record.updated as string,
  };
}

function mapReflectionEntryToRecord(entry: ReflectionEntry): Record<string, unknown> {
  return omitUndefined({
    id: entry.id,
    family: entry.familyId,
    learner: entry.learnerId,
    project: entry.projectId,
    externalSessionId: entry.externalSessionId,
    blockId: entry.blockId,
    blockTitle: entry.blockTitle,
    date: entry.date,
    prompt: entry.prompt,
    whatLearned: entry.whatLearned,
    challenge: entry.challenge,
    nextStep: entry.nextStep,
    confidence: entry.confidence,
    notes: entry.notes,
    quizAnswers: entry.quizAnswers,
    evidenceArtifactIds: entry.evidenceArtifactIds,
    tags: entry.tags,
  });
}

function mapRecordToExternalSession(record: Record<string, unknown>): ExternalActivitySession {
  return {
    id: record.id as string,
    familyId: record.family as string,
    learnerId: record.learner as string,
    projectId: record.project as string | undefined,
    platformId: record.platformId as string,
    platformName: record.platformName as string,
    title: record.title as string,
    description: record.description as string | undefined,
    url: record.launchUrl as string | undefined,
    scheduledDate: record.scheduledDate as string,
    scheduledStartTime: record.scheduledStartTime as string | undefined,
    durationMinutes: (record.durationMinutes as number) || 30,
    status: (record.status as ExternalActivitySession['status']) || 'scheduled',
    syncMode: (record.syncMode as ExternalActivitySession['syncMode']) || 'manual',
    importedAccountLabel: record.importedAccountLabel as string | undefined,
    notes: record.notes as string | undefined,
    reflectionId: record.reflectionId as string | undefined,
    evidenceArtifactIds: (record.evidenceArtifactIds as string[]) || [],
    tags: (record.tags as string[]) || [],
    completedAt: record.completedAt as string | undefined,
    blockId: record.blockId as string | undefined,
    lastSyncedAt: record.lastSyncedAt as string | undefined,
    createdAt: record.created as string,
    updatedAt: record.updated as string,
  };
}

function mapExternalSessionToRecord(session: ExternalActivitySession): Record<string, unknown> {
  return omitUndefined({
    id: session.id,
    family: session.familyId,
    learner: session.learnerId,
    project: session.projectId,
    platformId: session.platformId,
    platformName: session.platformName,
    title: session.title,
    description: session.description,
    launchUrl: session.url,
    scheduledDate: session.scheduledDate,
    scheduledStartTime: session.scheduledStartTime,
    durationMinutes: session.durationMinutes,
    status: session.status,
    syncMode: session.syncMode,
    importedAccountLabel: session.importedAccountLabel,
    notes: session.notes,
    reflectionId: session.reflectionId,
    evidenceArtifactIds: session.evidenceArtifactIds,
    tags: session.tags,
    completedAt: session.completedAt,
    blockId: session.blockId,
    lastSyncedAt: session.lastSyncedAt,
  });
}

function mapRecordToAchievementUnlock(record: Record<string, unknown>): AchievementUnlock {
  return {
    id: record.id as string,
    familyId: record.family as string,
    learnerId: record.learner as string,
    achievementId: record.achievementId as string,
    unlockedAt: record.unlockedAt as string,
    sourceType: (record.sourceType as AchievementUnlock['sourceType']) || 'progress',
    sourceId: record.sourceId as string | undefined,
    pointsAwarded: record.pointsAwarded as number | undefined,
    createdAt: record.created as string,
    updatedAt: record.updated as string,
  };
}

function mapAchievementUnlockToRecord(unlock: AchievementUnlock): Record<string, unknown> {
  return omitUndefined({
    id: unlock.id,
    family: unlock.familyId,
    learner: unlock.learnerId,
    achievementId: unlock.achievementId,
    unlockedAt: unlock.unlockedAt,
    sourceType: unlock.sourceType,
    sourceId: unlock.sourceId,
    pointsAwarded: unlock.pointsAwarded,
  });
}

function mapRecordToPlanningRule(record: Record<string, unknown>): PlanningRule {
  const rawSupportPods = Array.isArray(record.supportPodIds) ? record.supportPodIds : [];
  const supportPodPlans: PlannedSupportPod[] = [];

  rawSupportPods.forEach((entry) => {
    if (typeof entry === 'string') {
      supportPodPlans.push({
        podId: entry,
        startDate: record.periodStart as string,
        endDate: record.periodEnd as string | undefined,
      });
      return;
    }

    if (entry && typeof entry === 'object' && typeof (entry as { podId?: unknown }).podId === 'string') {
      const plan = entry as { podId: string; startDate?: string; endDate?: string; plannedWeeks?: number };
      supportPodPlans.push({
        podId: plan.podId,
        startDate: plan.startDate || (record.periodStart as string),
        endDate: plan.endDate as string | undefined,
        plannedWeeks: plan.plannedWeeks as number | undefined,
      });
    }
  });

  return {
    id: record.id as string,
    familyId: record.family as string,
    learnerId: record.learner as string,
    name: record.name as string,
    status: (record.status as PlanningRule['status']) || 'active',
    primaryPodId: record.primaryPodId as string | undefined,
    supportPodIds: supportPodPlans.map((plan) => plan.podId),
    supportPodPlans,
    preferredPlatformIds: (record.preferredPlatformIds as string[]) || [],
    weeklyProjectSessions: (record.weeklyProjectSessions as number) || 0,
    weeklyExternalSessions: (record.weeklyExternalSessions as number) || 0,
    includeMovement: Boolean(record.includeMovement),
    includeFrench: Boolean(record.includeFrench),
    includeWriting: record.includeWriting === undefined ? true : Boolean(record.includeWriting),
    challengeLevel: (record.challengeLevel as PlanningRule['challengeLevel']) || 'balanced',
    periodStart: record.periodStart as string,
    periodEnd: record.periodEnd as string | undefined,
    notes: record.notes as string | undefined,
    createdAt: record.created as string,
    updatedAt: record.updated as string,
  };
}

function mapPlanningRuleToRecord(rule: PlanningRule): Record<string, unknown> {
  return omitUndefined({
    id: rule.id,
    family: rule.familyId,
    learner: rule.learnerId,
    name: rule.name,
    status: rule.status,
    primaryPodId: rule.primaryPodId,
    supportPodIds: rule.supportPodPlans.length > 0 ? rule.supportPodPlans : rule.supportPodIds,
    preferredPlatformIds: rule.preferredPlatformIds,
    weeklyProjectSessions: rule.weeklyProjectSessions,
    weeklyExternalSessions: rule.weeklyExternalSessions,
    includeMovement: rule.includeMovement,
    includeFrench: rule.includeFrench,
    includeWriting: rule.includeWriting,
    challengeLevel: rule.challengeLevel,
    periodStart: rule.periodStart,
    periodEnd: rule.periodEnd,
    notes: rule.notes,
  });
}

export const buildExternalSessionBlockId = (sessionId: string): string => `external-session-${sessionId}`;
export const getExternalSessionBlockStatus = mapSessionStatusToBlockStatus;
export const removeProjectFromCache = (learnerId: string, projectId: string): void => {
  removeCachedItem<LearningProject>(getProjectsKey(learnerId), projectId);
};
