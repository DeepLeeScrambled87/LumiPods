// Unified Data Service - PocketBase with localStorage fallback
// Automatically syncs when online, works offline seamlessly

import { pb, COLLECTIONS } from '../lib/pocketbase';
import { storage } from '../lib/storage';
import { queueSync } from '../hooks/useDatabase';
import type { Family } from '../types/family';
import type { Learner } from '../types/learner';
import type { Artifact } from '../types/artifact';
import type { DailyProgress } from '../types/progress';
import type { RewardRedemption } from '../types/points';

// Storage keys for offline data
const OFFLINE_KEYS = {
  FAMILY: 'offline-family',
  LEARNERS: 'offline-learners',
  SCHEDULES: 'offline-schedules',
  BLOCKS: 'offline-blocks',
  ARTIFACTS: 'offline-artifacts',
  PROGRESS: 'offline-progress',
  VR_SESSIONS: 'offline-vr-sessions',
  FRENCH_LESSONS: 'offline-french-lessons',
  REWARD_REDEMPTIONS: 'offline-reward-redemptions',
} as const;

// Check if PocketBase is available
const checkOnline = async (): Promise<boolean> => {
  try {
    await pb.health.check();
    return true;
  } catch {
    return false;
  }
};

const isPocketBaseRecordId = (id: string): boolean => /^[a-z0-9]{15}$/.test(id);

const omitRecordId = (data: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'id'));

const omitUndefined = (data: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));

// ============ Family Service ============
export const familyDataService = {
  async get(familyId: string): Promise<Family | null> {
    const isOnline = await checkOnline();
    
    if (isOnline) {
      try {
        const record = await pb.collection(COLLECTIONS.FAMILIES).getOne(familyId);
        const family = mapRecordToFamily(record);
        storage.set(OFFLINE_KEYS.FAMILY, family);
        return family;
      } catch {
        // Fall through to offline
      }
    }
    
    return storage.get<Family | null>(OFFLINE_KEYS.FAMILY, null);
  },

  async save(family: Family): Promise<Family> {
    storage.set(OFFLINE_KEYS.FAMILY, family);
    
    const isOnline = await checkOnline();
    const data = mapFamilyToRecord(family);
    const shouldUpdateRemote = isPocketBaseRecordId(family.id);

    if (isOnline) {
      try {
        if (shouldUpdateRemote) {
          const record = await pb.collection(COLLECTIONS.FAMILIES).update(family.id, omitRecordId(data));
          const savedFamily = { ...mapRecordToFamily(record), learners: family.learners };
          storage.set(OFFLINE_KEYS.FAMILY, savedFamily);
          return savedFamily;
        }

        const record = await pb.collection(COLLECTIONS.FAMILIES).create(omitRecordId(data));
        const savedFamily = { ...mapRecordToFamily(record), learners: family.learners };
        storage.set(OFFLINE_KEYS.FAMILY, savedFamily);
        return savedFamily;
      } catch {
        queueSync(
          COLLECTIONS.FAMILIES,
          shouldUpdateRemote ? 'update' : 'create',
          shouldUpdateRemote ? data : omitRecordId(data)
        );
      }
    } else {
      queueSync(
        COLLECTIONS.FAMILIES,
        shouldUpdateRemote ? 'update' : 'create',
        shouldUpdateRemote ? data : omitRecordId(data)
      );
    }
    
    return family;
  },

  async create(name: string): Promise<Family> {
    const family: Family = {
      id: `family-${Date.now()}`,
      name,
      learners: [],
      currentPodId: null,
      currentWeek: 1,
      settings: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        weekStartsOn: 1,
        dailyStartTime: '09:00',
        dailyEndTime: '14:30',
        enablePoints: true,
        enableRewards: true,
        enableTimer: true,
        timerStyle: 'pomodoro',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.set(OFFLINE_KEYS.FAMILY, family);
    
    const isOnline = await checkOnline();
    const createPayload = omitRecordId(mapFamilyToRecord(family));
    if (isOnline) {
      try {
        const record = await pb.collection(COLLECTIONS.FAMILIES).create(createPayload);
        const savedFamily = { ...mapRecordToFamily(record), learners: family.learners };
        storage.set(OFFLINE_KEYS.FAMILY, savedFamily);
        return savedFamily;
      } catch {
        queueSync(COLLECTIONS.FAMILIES, 'create', createPayload);
      }
    } else {
      queueSync(COLLECTIONS.FAMILIES, 'create', createPayload);
    }
    
    return family;
  },
};

// ============ Learner Service ============
export const learnerDataService = {
  async getByFamily(familyId: string): Promise<Learner[]> {
    const isOnline = await checkOnline();
    
    if (isOnline) {
      try {
        const records = await pb.collection(COLLECTIONS.LEARNERS).getFullList({
          filter: `family = "${familyId}"`,
          sort: 'name',
        });
        const learners = records.map(mapRecordToLearner);
        storage.set(OFFLINE_KEYS.LEARNERS, learners);
        return learners;
      } catch {
        // Fall through to offline
      }
    }
    
    return storage.get<Learner[]>(OFFLINE_KEYS.LEARNERS, []);
  },

  async save(familyId: string, learner: Learner): Promise<Learner> {
    const localLearnerId = learner.id;

    // Update local cache
    const learners = storage.get<Learner[]>(OFFLINE_KEYS.LEARNERS, []);
    const index = learners.findIndex(l => l.id === localLearnerId);
    if (index >= 0) {
      learners[index] = learner;
    } else {
      learners.push(learner);
    }
    storage.set(OFFLINE_KEYS.LEARNERS, learners);
    
    const isOnline = await checkOnline();
    const data = mapLearnerToRecord(familyId, learner);
    const shouldUpdateRemote = isPocketBaseRecordId(localLearnerId);
    let savedLearner = learner;
    
    if (isOnline) {
      try {
        if (shouldUpdateRemote) {
          const record = await pb.collection(COLLECTIONS.LEARNERS).update(localLearnerId, omitRecordId(data));
          savedLearner = mapRecordToLearner(record);
        } else {
          const record = await pb.collection(COLLECTIONS.LEARNERS).create(omitRecordId(data));
          savedLearner = mapRecordToLearner(record);
        }
      } catch {
        queueSync(
          COLLECTIONS.LEARNERS,
          shouldUpdateRemote ? 'update' : 'create',
          shouldUpdateRemote ? data : omitRecordId(data)
        );
        return learner;
      }
    } else {
      queueSync(
        COLLECTIONS.LEARNERS,
        shouldUpdateRemote ? 'update' : 'create',
        shouldUpdateRemote ? data : omitRecordId(data)
      );
      return learner;
    }

    storage.set(
      OFFLINE_KEYS.LEARNERS,
      learners.map((cachedLearner) =>
        cachedLearner.id === localLearnerId ? savedLearner : cachedLearner
      )
    );
    
    return savedLearner;
  },

  async delete(learnerId: string): Promise<void> {
    const learners = storage.get<Learner[]>(OFFLINE_KEYS.LEARNERS, []);
    storage.set(OFFLINE_KEYS.LEARNERS, learners.filter(l => l.id !== learnerId));
    
    const isOnline = await checkOnline();
    if (isOnline) {
      try {
        await pb.collection(COLLECTIONS.LEARNERS).delete(learnerId);
      } catch {
        queueSync(COLLECTIONS.LEARNERS, 'delete', { id: learnerId });
      }
    } else {
      queueSync(COLLECTIONS.LEARNERS, 'delete', { id: learnerId });
    }
  },

  async addPoints(learnerId: string, points: number): Promise<Learner | null> {
    const learners = storage.get<Learner[]>(OFFLINE_KEYS.LEARNERS, []);
    const learner = learners.find(l => l.id === learnerId);
    if (!learner) return null;
    
    learner.points += points;
    learner.updatedAt = new Date().toISOString();
    storage.set(OFFLINE_KEYS.LEARNERS, learners);
    
    const isOnline = await checkOnline();
    if (isOnline) {
      try {
        await pb.collection(COLLECTIONS.LEARNERS).update(learnerId, { points: learner.points });
      } catch {
        queueSync(COLLECTIONS.LEARNERS, 'update', { id: learnerId, points: learner.points });
      }
    } else {
      queueSync(COLLECTIONS.LEARNERS, 'update', { id: learnerId, points: learner.points });
    }
    
    return learner;
  },
};


// ============ Progress Service ============
export const progressDataService = {
  async getForLearner(familyId: string, learnerId: string, days = 30): Promise<DailyProgress[]> {
    const isOnline = await checkOnline();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    if (isOnline) {
      try {
        const records = await pb.collection(COLLECTIONS.PROGRESS).getFullList({
          filter: `family = "${familyId}" && learner = "${learnerId}" && date >= "${startDate.toISOString().split('T')[0]}"`,
          sort: '-date',
        });
        const progress = records.map(mapRecordToProgress);
        storage.set(`${OFFLINE_KEYS.PROGRESS}-${learnerId}`, progress);
        return progress;
      } catch {
        // Fall through
      }
    }
    
    return storage.get<DailyProgress[]>(`${OFFLINE_KEYS.PROGRESS}-${learnerId}`, []);
  },

  async recordDaily(familyId: string, learnerId: string, data: Omit<DailyProgress, 'learnerId'>): Promise<DailyProgress> {
    const progress: DailyProgress = {
      learnerId,
      ...data,
    };
    
    // Update local cache
    const cached = storage.get<DailyProgress[]>(`${OFFLINE_KEYS.PROGRESS}-${learnerId}`, []);
    const existingIndex = cached.findIndex(p => p.date === data.date);
    if (existingIndex >= 0) {
      cached[existingIndex] = progress;
    } else {
      cached.unshift(progress);
    }
    storage.set(`${OFFLINE_KEYS.PROGRESS}-${learnerId}`, cached);
    
    const isOnline = await checkOnline();
    const recordData = {
      family: familyId,
      learner: learnerId,
      ...data,
    };
    let existingRecordId: string | undefined;
    
    if (isOnline) {
      try {
        const existing = await pb.collection(COLLECTIONS.PROGRESS).getList(1, 1, {
          filter: `family = "${familyId}" && learner = "${learnerId}" && date = "${data.date}"`,
        });
        existingRecordId = existing.items[0]?.id as string | undefined;

        if (existingRecordId) {
          await pb.collection(COLLECTIONS.PROGRESS).update(existingRecordId, recordData);
        } else {
          await pb.collection(COLLECTIONS.PROGRESS).create(recordData);
        }
      } catch {
        queueSync(
          COLLECTIONS.PROGRESS,
          existingRecordId ? 'update' : 'create',
          existingRecordId ? { id: existingRecordId, ...recordData } : recordData
        );
      }
    } else {
      queueSync(COLLECTIONS.PROGRESS, 'create', recordData);
    }
    
    return progress;
  },

  async getStats(familyId: string, learnerId: string): Promise<{
    totalBlocks: number;
    totalMinutes: number;
    totalPoints: number;
    avgBlocksPerDay: number;
    currentStreak: number;
  }> {
    const progress = await this.getForLearner(familyId, learnerId, 30);
    
    const totalBlocks = progress.reduce((sum, p) => sum + (p.blocksCompleted || 0), 0);
    const totalMinutes = progress.reduce((sum, p) => sum + (p.totalFocusMinutes || 0), 0);
    const totalPoints = progress.reduce((sum, p) => sum + (p.pointsEarned || 0), 0);
    const daysWithActivity = progress.filter(p => (p.blocksCompleted || 0) > 0).length;
    
    // Calculate streak
    let currentStreak = 0;
    const sortedProgress = [...progress].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (const p of sortedProgress) {
      if ((p.blocksCompleted || 0) > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return {
      totalBlocks,
      totalMinutes,
      totalPoints,
      avgBlocksPerDay: daysWithActivity > 0 ? Math.round(totalBlocks / daysWithActivity) : 0,
      currentStreak,
    };
  },
};


// ============ Artifact Service ============
export const artifactDataService = {
  async getByLearner(learnerId: string): Promise<Artifact[]> {
    const isOnline = await checkOnline();
    
    if (isOnline) {
      try {
        const records = await pb.collection(COLLECTIONS.ARTIFACTS).getFullList({
          filter: `learner = "${learnerId}"`,
          sort: '-created',
        });
        const artifacts = records.map(mapRecordToArtifact);
        storage.set(`${OFFLINE_KEYS.ARTIFACTS}-${learnerId}`, artifacts);
        return artifacts;
      } catch {
        // Fall through
      }
    }
    
    return storage.get<Artifact[]>(`${OFFLINE_KEYS.ARTIFACTS}-${learnerId}`, []);
  },

  async save(artifact: Artifact, options?: { file?: File }): Promise<Artifact> {
    const cached = storage.get<Artifact[]>(`${OFFLINE_KEYS.ARTIFACTS}-${artifact.learnerId}`, []);
    const localArtifactId = artifact.id;
    const index = cached.findIndex((item) => item.id === localArtifactId);
    if (index >= 0) {
      cached[index] = artifact;
    } else {
      cached.unshift(artifact);
    }
    storage.set(`${OFFLINE_KEYS.ARTIFACTS}-${artifact.learnerId}`, cached);
    
    const isOnline = await checkOnline();
    const data = mapArtifactToRecord(artifact);
    const shouldUpdateRemote = isPocketBaseRecordId(localArtifactId);
    const canQueueSync = !options?.file;
    let savedArtifact = artifact;
    
    if (isOnline) {
      try {
        if (shouldUpdateRemote) {
          const record = await pb.collection(COLLECTIONS.ARTIFACTS).update(
            localArtifactId,
            options?.file
              ? mapArtifactToFormData(artifact, options.file)
              : omitRecordId(data)
          );
          savedArtifact = mapRecordToArtifact(record);
        } else {
          const record = await pb.collection(COLLECTIONS.ARTIFACTS).create(
            options?.file
              ? mapArtifactToFormData(artifact, options.file)
              : omitRecordId(data)
          );
          savedArtifact = mapRecordToArtifact(record);
        }
      } catch {
        if (canQueueSync) {
          queueSync(
            COLLECTIONS.ARTIFACTS,
            shouldUpdateRemote ? 'update' : 'create',
            shouldUpdateRemote ? data : omitRecordId(data)
          );
        }
        return artifact;
      }
    } else if (canQueueSync) {
      queueSync(
        COLLECTIONS.ARTIFACTS,
        shouldUpdateRemote ? 'update' : 'create',
        shouldUpdateRemote ? data : omitRecordId(data)
      );
    }

    storage.set(
      `${OFFLINE_KEYS.ARTIFACTS}-${artifact.learnerId}`,
      cached.map((cachedArtifact) =>
        cachedArtifact.id === localArtifactId ? savedArtifact : cachedArtifact
      )
    );

    return savedArtifact;
  },

  async delete(artifact: Artifact): Promise<void> {
    const cached = storage.get<Artifact[]>(`${OFFLINE_KEYS.ARTIFACTS}-${artifact.learnerId}`, []);
    storage.set(`${OFFLINE_KEYS.ARTIFACTS}-${artifact.learnerId}`, cached.filter(a => a.id !== artifact.id));
    
    if (!isPocketBaseRecordId(artifact.id)) {
      return;
    }

    const isOnline = await checkOnline();
    if (isOnline) {
      try {
        await pb.collection(COLLECTIONS.ARTIFACTS).delete(artifact.id);
      } catch {
        queueSync(COLLECTIONS.ARTIFACTS, 'delete', { id: artifact.id });
      }
    } else {
      queueSync(COLLECTIONS.ARTIFACTS, 'delete', { id: artifact.id });
    }
  },
};

// ============ Reward Redemption Service ============
export const rewardRedemptionDataService = {
  async getByLearner(learnerId: string): Promise<RewardRedemption[]> {
    const isOnline = await checkOnline();

    if (isOnline) {
      try {
        const records = await pb.collection(COLLECTIONS.REWARD_REDEMPTIONS).getFullList({
          filter: `learner = "${learnerId}"`,
          sort: '-created',
        });
        const redemptions = records.map(mapRecordToRewardRedemption);
        storage.set(`${OFFLINE_KEYS.REWARD_REDEMPTIONS}-${learnerId}`, redemptions);
        return redemptions;
      } catch {
        // Fall through
      }
    }

    return storage.get<RewardRedemption[]>(`${OFFLINE_KEYS.REWARD_REDEMPTIONS}-${learnerId}`, []);
  },

  async create(redemption: Omit<RewardRedemption, 'id' | 'redeemedAt'>): Promise<RewardRedemption> {
    const localRedemption: RewardRedemption = {
      ...redemption,
      id: `reward-redemption-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      redeemedAt: new Date().toISOString(),
    };

    const cached = storage.get<RewardRedemption[]>(
      `${OFFLINE_KEYS.REWARD_REDEMPTIONS}-${redemption.learnerId}`,
      []
    );
    cached.unshift(localRedemption);
    storage.set(`${OFFLINE_KEYS.REWARD_REDEMPTIONS}-${redemption.learnerId}`, cached);

    const isOnline = await checkOnline();
    const data = mapRewardRedemptionToRecord(localRedemption);

    if (isOnline) {
      try {
        const record = await pb.collection(COLLECTIONS.REWARD_REDEMPTIONS).create(omitRecordId(data));
        const savedRedemption = mapRecordToRewardRedemption(record);
        storage.set(
          `${OFFLINE_KEYS.REWARD_REDEMPTIONS}-${redemption.learnerId}`,
          cached.map((item) => (item.id === localRedemption.id ? savedRedemption : item))
        );
        return savedRedemption;
      } catch {
        queueSync(COLLECTIONS.REWARD_REDEMPTIONS, 'create', omitRecordId(data));
      }
    } else {
      queueSync(COLLECTIONS.REWARD_REDEMPTIONS, 'create', omitRecordId(data));
    }

    return localRedemption;
  },
};

// ============ Record Mappers ============
function mapRecordToFamily(record: Record<string, unknown>): Family {
  return {
    id: record.id as string,
    name: record.name as string,
    learners: [],
    currentPodId: (record.currentPodId as string) || null,
    currentWeek: (record.currentWeek as number) || 1,
    settings: (record.settings as Family['settings']) || {
      timezone: 'UTC',
      weekStartsOn: 1,
      dailyStartTime: '09:00',
      dailyEndTime: '14:30',
      enablePoints: true,
      enableRewards: true,
      enableTimer: true,
      timerStyle: 'pomodoro',
    },
    createdAt: record.created as string,
    updatedAt: record.updated as string,
  };
}

function mapFamilyToRecord(family: Family): Record<string, unknown> {
  return {
    id: family.id,
    name: family.name,
    currentPodId: family.currentPodId,
    currentWeek: family.currentWeek,
    settings: family.settings,
  };
}

function mapRecordToLearner(record: Record<string, unknown>): Learner {
  return {
    id: record.id as string,
    name: record.name as string,
    age: record.age as number,
    skillLevel: record.skillLevel as Learner['skillLevel'],
    avatar: (record.avatar as string) || '🧒',
    pin: (record.pin as string) || undefined,
    points: (record.points as number) || 0,
    streakDays: (record.streakDays as number) || 0,
    preferences: record.preferences as Learner['preferences'],
    createdAt: record.created as string,
    updatedAt: record.updated as string,
  };
}

function mapLearnerToRecord(familyId: string, learner: Learner): Record<string, unknown> {
  return {
    id: learner.id,
    family: familyId,
    name: learner.name,
    age: learner.age,
    skillLevel: learner.skillLevel,
    avatar: learner.avatar,
    pin: learner.pin,
    points: learner.points,
    streakDays: learner.streakDays,
    preferences: learner.preferences,
  };
}


function mapRecordToProgress(record: Record<string, unknown>): DailyProgress {
  return {
    learnerId: record.learner as string,
    date: record.date as string,
    podId: record.podId as string | undefined,
    weekNumber: record.weekNumber as number | undefined,
    blocksCompleted: (record.blocksCompleted as number) || 0,
    blocksTotal: (record.blocksTotal as number) || 0,
    totalFocusMinutes: (record.focusMinutes as number) || 0,
    pointsEarned: (record.pointsEarned as number) || 0,
    artifactsCreated: (record.artifactsCreated as number) || 0,
    streakMaintained: (record.streakMaintained as boolean) || false,
  };
}

function mapRecordToArtifact(record: Record<string, unknown>): Artifact {
  const externalUrl = record.externalUrl as string | undefined;
  const fileName = record.file as string | undefined;

  return {
    id: record.id as string,
    learnerId: record.learner as string,
    familyId: (record.family as string) || undefined,
    blockId: (record.blockId as string) || undefined,
    podId: (record.podId as string) || undefined,
    weekNumber: record.weekNumber as number | undefined,
    title: record.title as string,
    description: (record.description as string) || undefined,
    reflection: (record.reflection as string) || undefined,
    type: record.type as Artifact['type'],
    url: externalUrl || (fileName ? pb.files.getURL(record, fileName) : undefined),
    thumbnailUrl: (record.thumbnailUrl as string) || undefined,
    competencies: (record.competencies as Artifact['competencies']) || [],
    tags: (record.tags as string[]) || [],
    skillLevel: (record.skillLevel as Artifact['skillLevel']) || 'foundation',
    visibility: (record.visibility as Artifact['visibility']) || 'family',
    isFeatured: (record.isFeatured as boolean) || false,
    createdAt: record.created as string,
    updatedAt: record.updated as string,
  };
}

function mapArtifactToRecord(artifact: Artifact): Record<string, unknown> {
  return omitUndefined({
    id: artifact.id,
    family: artifact.familyId,
    learner: artifact.learnerId,
    blockId: artifact.blockId,
    podId: artifact.podId,
    weekNumber: artifact.weekNumber,
    title: artifact.title,
    description: artifact.description,
    reflection: artifact.reflection,
    type: artifact.type,
    externalUrl: artifact.url,
    thumbnailUrl: artifact.thumbnailUrl,
    competencies: artifact.competencies,
    tags: artifact.tags,
    skillLevel: artifact.skillLevel,
    visibility: artifact.visibility,
    isFeatured: artifact.isFeatured,
  });
}

function mapArtifactToFormData(artifact: Artifact, file: File): FormData {
  const formData = new FormData();
  const data = omitRecordId(mapArtifactToRecord(artifact));

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value) || typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  formData.append('file', file);
  return formData;
}

function mapRecordToRewardRedemption(record: Record<string, unknown>): RewardRedemption {
  return {
    id: record.id as string,
    familyId: (record.family as string) || undefined,
    learnerId: record.learner as string,
    rewardId: record.rewardId as string,
    rewardTitle: (record.rewardTitle as string) || undefined,
    pointsSpent: (record.pointsSpent as number) || 0,
    redeemedAt: (record.created as string) || new Date().toISOString(),
    status: ((record.status as RewardRedemption['status']) || 'pending'),
    approvedBy: (record.approvedBy as string) || undefined,
    approvedAt: (record.approvedAt as string) || undefined,
    fulfilledAt: (record.fulfilledAt as string) || undefined,
    notes: (record.notes as string) || undefined,
  };
}

function mapRewardRedemptionToRecord(redemption: RewardRedemption): Record<string, unknown> {
  return omitUndefined({
    id: redemption.id,
    family: redemption.familyId,
    learner: redemption.learnerId,
    rewardId: redemption.rewardId,
    rewardTitle: redemption.rewardTitle,
    pointsSpent: redemption.pointsSpent,
    status: redemption.status,
    approvedBy: redemption.approvedBy,
    approvedAt: redemption.approvedAt,
    fulfilledAt: redemption.fulfilledAt,
    notes: redemption.notes,
  });
}

// ============ Sync Status Component Helper ============
export const getSyncStatus = (): { pending: number; lastSync: string | null } => {
  const queue = storage.get<unknown[]>('sync-queue', []);
  const lastSync = storage.get<string | null>('last-sync', null);
  return { pending: queue.length, lastSync };
};
