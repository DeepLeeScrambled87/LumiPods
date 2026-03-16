import { storage } from '../lib/storage';
import { generateId } from '../lib/id';
import { syncScheduleProgress } from './scheduleProgressSync';
import { scheduleService } from './scheduleService';
import {
  buildExternalSessionBlockId,
  externalActivitySessionDataService,
} from './learningRecordsService';
import type { ExternalActivitySession } from '../types/learning';

const PENDING_EXTERNAL_LAUNCHES_KEY = 'pending-external-launches';

interface PendingExternalLaunch {
  id: string;
  sessionId: string;
  familyId: string;
  learnerId: string;
  learnerName?: string;
  date: string;
  blockId?: string;
  platformName: string;
  launchUrl: string;
  startedAt: string;
}

interface LaunchTrackedExternalSessionParams {
  familyId: string;
  learnerId: string;
  learnerName?: string;
  date: string;
  title: string;
  platformId: string;
  platformName: string;
  launchUrl: string;
  durationMinutes: number;
  description?: string;
  scheduledStartTime?: string;
  projectId?: string;
  blockId?: string;
  notes?: string;
  tags?: string[];
}

export interface SyncedExternalLaunch {
  session: ExternalActivitySession;
  trackedMinutes: number;
  learnerId: string;
  learnerName?: string;
}

const getPendingLaunches = (): PendingExternalLaunch[] =>
  storage.get<PendingExternalLaunch[]>(PENDING_EXTERNAL_LAUNCHES_KEY, []);

const setPendingLaunches = (launches: PendingExternalLaunch[]): void => {
  storage.set(PENDING_EXTERNAL_LAUNCHES_KEY, launches);
};

const addPendingLaunch = (launch: PendingExternalLaunch): void => {
  const launches = getPendingLaunches().filter((entry) => entry.sessionId !== launch.sessionId);
  launches.push(launch);
  setPendingLaunches(launches);
};

const removePendingLaunch = (sessionId: string): void => {
  setPendingLaunches(getPendingLaunches().filter((entry) => entry.sessionId !== sessionId));
};

const createInProgressSession = (
  params: LaunchTrackedExternalSessionParams
): ExternalActivitySession => {
  const timestamp = new Date().toISOString();

  return {
    id: `external-session-${generateId()}`,
    familyId: params.familyId,
    learnerId: params.learnerId,
    projectId: params.projectId,
    platformId: params.platformId,
    platformName: params.platformName,
    title: params.title,
    description: params.description,
    url: params.launchUrl,
    scheduledDate: params.date,
    scheduledStartTime: params.scheduledStartTime,
    durationMinutes: params.durationMinutes,
    status: 'in-progress',
    syncMode: 'linked',
    notes: params.notes,
    evidenceArtifactIds: [],
    tags: params.tags || [],
    blockId: params.blockId,
    lastSyncedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const launchTrackedExternalSession = async (
  params: LaunchTrackedExternalSessionParams
): Promise<ExternalActivitySession> => {
  const cachedSession =
    params.blockId
      ? externalActivitySessionDataService
          .getCachedByLearner(params.learnerId)
          .find((session) => session.blockId === params.blockId || session.id === params.blockId)
      : undefined;

  const nextSession: ExternalActivitySession = cachedSession
    ? {
        ...cachedSession,
        title: params.title,
        description: params.description ?? cachedSession.description,
        url: params.launchUrl,
        scheduledDate: params.date,
        scheduledStartTime: params.scheduledStartTime || cachedSession.scheduledStartTime,
        durationMinutes: params.durationMinutes,
        status: 'in-progress',
        syncMode: 'linked',
        notes: params.notes ?? cachedSession.notes,
        platformId: params.platformId,
        platformName: params.platformName,
        projectId: params.projectId ?? cachedSession.projectId,
        blockId: params.blockId ?? cachedSession.blockId,
        lastSyncedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    : createInProgressSession(params);

  const savedSession = await externalActivitySessionDataService.save(nextSession);

  const baseSchedule =
    scheduleService.getDailySchedule(params.learnerId, params.date) ||
    scheduleService.ensureDailySchedule(params.learnerId, params.date, params.familyId);
  const nextSchedule = scheduleService.upsertExternalSessionBlock(baseSchedule, {
    ...savedSession,
    blockId: params.blockId || savedSession.blockId || buildExternalSessionBlockId(savedSession.id),
  });
  scheduleService.saveDailySchedule(nextSchedule);

  addPendingLaunch({
    id: generateId(),
    sessionId: savedSession.id,
    familyId: params.familyId,
    learnerId: params.learnerId,
    learnerName: params.learnerName,
    date: params.date,
    blockId: params.blockId || savedSession.blockId,
    platformName: params.platformName,
    launchUrl: params.launchUrl,
    startedAt: new Date().toISOString(),
  });

  if (typeof window !== 'undefined') {
    window.open(params.launchUrl, '_blank', 'noopener,noreferrer');
  }

  return savedSession;
};

export const syncReturnedExternalSessions = async (): Promise<SyncedExternalLaunch[]> => {
  const launches = getPendingLaunches();

  if (launches.length === 0) {
    return [];
  }

  const synced: SyncedExternalLaunch[] = [];

  for (const launch of launches) {
    const trackedMinutes = Math.max(
      1,
      Math.round((Date.now() - new Date(launch.startedAt).getTime()) / 60000)
    );

    const cachedSession = externalActivitySessionDataService
      .getCachedByLearner(launch.learnerId)
      .find((session) => session.id === launch.sessionId);

    if (!cachedSession) {
      removePendingLaunch(launch.sessionId);
      continue;
    }

    const now = new Date().toISOString();
    const syncedSession = await externalActivitySessionDataService.save({
      ...cachedSession,
      status: 'completed',
      durationMinutes: trackedMinutes,
      completedAt: now,
      lastSyncedAt: now,
      updatedAt: now,
      notes: cachedSession.notes
        ? `${cachedSession.notes}\n[Auto-sync] Tracked ${trackedMinutes} minutes in ${launch.platformName}.`
        : `[Auto-sync] Tracked ${trackedMinutes} minutes in ${launch.platformName}.`,
    });

    const existingSchedule =
      scheduleService.getDailySchedule(launch.learnerId, launch.date) ||
      scheduleService.ensureDailySchedule(launch.learnerId, launch.date, launch.familyId);

    if (launch.blockId) {
      scheduleService.completeBlock(
        launch.learnerId,
        launch.date,
        launch.blockId,
        trackedMinutes,
        syncedSession.notes
      );
    }

    const nextSchedule = scheduleService.upsertExternalSessionBlock(existingSchedule, syncedSession);
    const savedSchedule = scheduleService.saveDailySchedule(nextSchedule);
    await syncScheduleProgress(savedSchedule);

    removePendingLaunch(launch.sessionId);
    synced.push({
      session: syncedSession,
      trackedMinutes,
      learnerId: launch.learnerId,
      learnerName: launch.learnerName,
    });
  }

  return synced;
};
