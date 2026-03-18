import { isLearnerPortfolioArtifact } from '../lib/artifactScope';
import { toLocalDateKey } from '../lib/dates';
import { COLLECTIONS } from '../lib/pocketbase';
import { ACHIEVEMENTS } from '../features/gamification/achievements';
import {
  artifactDataService,
  learnerDataService,
  progressDataService,
  rewardRedemptionDataService,
} from './dataService';
import {
  achievementUnlockDataService,
  externalActivitySessionDataService,
  projectDataService,
  reflectionEntryDataService,
} from './learningRecordsService';
import { ACTION_POINTS_MATRIX, learnerPointsLedgerService } from './learnerPointsLedgerService';
import { documentBackendClient } from './documentBackendClient';
import type { PointEventType } from '../types/points';

export const LEARNER_POINTS_UPDATED_EVENT = 'lumipods:learner-points-updated';

const ARTIFACT_BONUS = 15;
const REFLECTION_BONUS = 10;
const COMPLETED_PROJECT_BONUS = 40;
const EXTERNAL_SESSION_BONUS = 10;
const HISTORY_WINDOW_DAYS = 3650;

const REMOTE_METADATA_PREFIX = '[lumipods:';

interface StoredActionPointEvent {
  id: string;
  learnerId: string;
  timestamp: string;
  points: number;
  type: PointEventType;
  label: string;
  description: string;
  sourceKey?: string;
}

const parseRemotePointDescription = (
  description: string
): { cleanDescription: string; actionId?: keyof typeof ACTION_POINTS_MATRIX; sourceKey?: string } => {
  const metadataStart = description.indexOf(REMOTE_METADATA_PREFIX);
  if (metadataStart === -1) {
    return {
      cleanDescription: description.trim(),
    };
  }

  const cleanDescription = description.slice(0, metadataStart).trim();
  const rawMetadata = description.slice(metadataStart + REMOTE_METADATA_PREFIX.length).replace(/\]$/, '');
  const entries = rawMetadata.split(';').map((entry) => entry.trim()).filter(Boolean);

  let actionId: keyof typeof ACTION_POINTS_MATRIX | undefined;
  let sourceKey: string | undefined;

  for (const entry of entries) {
    const [key, ...valueParts] = entry.split('=');
    const value = valueParts.join('=').trim();

    if (key === 'action' && value in ACTION_POINTS_MATRIX) {
      actionId = value as keyof typeof ACTION_POINTS_MATRIX;
    }

    if (key === 'source' && value) {
      sourceKey = value;
    }
  }

  return {
    cleanDescription,
    actionId,
    sourceKey,
  };
};

const getStoredActionPointEvents = async (
  familyId: string,
  learnerId: string,
  historyWindowDays: number
): Promise<StoredActionPointEvent[]> => {
  const localEvents = learnerPointsLedgerService.getByLearner(learnerId).map((event) => ({
    id: event.id,
    learnerId,
    timestamp: event.timestamp,
    points: event.points,
    type: event.type,
    label: ACTION_POINTS_MATRIX[event.actionId].label,
    description: event.description,
    sourceKey: event.sourceKey,
  }));

  try {
    const isOnline = await documentBackendClient.isOnline();
    if (!isOnline) {
      throw new Error('offline');
    }
    const records = await documentBackendClient.list(COLLECTIONS.POINTS);

    return records
      .filter(
        (record) =>
          String(record.family || record.familyId || '') === familyId &&
          String(record.learner || record.learnerId || '') === learnerId
      )
      .sort((left, right) => new Date(String(right.created || '')).getTime() - new Date(String(left.created || '')).getTime())
      .map((record) => {
      const parsed = parseRemotePointDescription(String(record.description || ''));
      return {
        id: String(record.id),
        learnerId,
        timestamp: String(record.created || new Date().toISOString()),
        points: Number(record.points || 0),
        type: String(record.type || 'core_block') as PointEventType,
        label: parsed.actionId ? ACTION_POINTS_MATRIX[parsed.actionId].label : 'Points Awarded',
        description: parsed.cleanDescription || String(record.description || 'Points earned'),
        sourceKey: parsed.sourceKey,
      };
      });
  } catch {
    const cutoffTime = Date.now() - historyWindowDays * 86400000;
    return localEvents
      .filter((event) => new Date(event.timestamp).getTime() >= cutoffTime)
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
  }
};

export interface LearnerPointsBreakdown {
  progressPoints: number;
  artifactPoints: number;
  reflectionPoints: number;
  projectPoints: number;
  externalSessionPoints: number;
  achievementPoints: number;
  actionEventPoints: number;
  redeemedPoints: number;
  totalPoints: number;
}

export interface LearnerPointActivityItem {
  id: string;
  learnerId: string;
  timestamp: string;
  points: number;
  label: string;
  description: string;
  source:
    | 'actions'
    | 'blocks'
    | 'artifact'
    | 'reflection'
    | 'project'
    | 'external'
    | 'achievement'
    | 'redemption';
}

export interface LearnerTodayPointsSummary {
  total: number;
  blocks: number;
  actions: number;
  artifacts: number;
  reflections: number;
  projects: number;
  external: number;
  achievements: number;
  redemptions: number;
}

export interface LearnerRollingPointsSummary {
  today: number;
  week: number;
  month: number;
  overall: number;
}

const dispatchLearnerPointsUpdated = (familyId: string, learnerId: string, points: number): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(LEARNER_POINTS_UPDATED_EVENT, {
      detail: {
        familyId,
        learnerId,
        points,
      },
    })
  );
};

export const calculateLearnerPointsBreakdown = async (
  familyId: string,
  learnerId: string
): Promise<LearnerPointsBreakdown> => {
  const [progress, artifacts, reflections, projects, externalSessions, unlocks, redemptions, actionEvents] = await Promise.all([
    progressDataService.getForLearner(familyId, learnerId, HISTORY_WINDOW_DAYS),
    artifactDataService.getByLearner(learnerId),
    reflectionEntryDataService.getByLearner(learnerId),
    projectDataService.getByLearner(learnerId),
    externalActivitySessionDataService.getByLearner(learnerId),
    achievementUnlockDataService.getByLearner(learnerId),
    rewardRedemptionDataService.getByLearner(learnerId),
    getStoredActionPointEvents(familyId, learnerId, HISTORY_WINDOW_DAYS),
  ]);

  const progressPoints = progress.reduce((sum, entry) => sum + (entry.pointsEarned || 0), 0);
  const artifactPoints = artifacts.filter(isLearnerPortfolioArtifact).length * ARTIFACT_BONUS;
  const reflectionPoints = reflections.length * REFLECTION_BONUS;
  const projectPoints =
    projects.filter((project) => project.status === 'completed').length * COMPLETED_PROJECT_BONUS;
  const externalSessionPoints =
    externalSessions.filter((session) => session.status === 'completed').length * EXTERNAL_SESSION_BONUS;
  const achievementPoints = unlocks.reduce((sum, unlock) => sum + (unlock.pointsAwarded || 0), 0);
  const actionEventPoints = actionEvents.reduce((sum, event) => sum + event.points, 0);
  const redeemedPoints = redemptions
    .filter((redemption) => redemption.status !== 'rejected')
    .reduce((sum, redemption) => sum + (redemption.pointsSpent || 0), 0);

  return {
    progressPoints,
    artifactPoints,
    reflectionPoints,
    projectPoints,
    externalSessionPoints,
    achievementPoints,
    actionEventPoints,
    redeemedPoints,
    totalPoints: Math.max(
      0,
      progressPoints +
        artifactPoints +
        reflectionPoints +
        projectPoints +
        externalSessionPoints +
        achievementPoints -
        redeemedPoints +
        actionEventPoints
    ),
  };
};

export const syncLearnerPointsBalance = async (
  familyId: string,
  learnerId: string
): Promise<LearnerPointsBreakdown | null> => {
  const learners = await learnerDataService.getByFamily(familyId);
  const learner = learners.find((entry) => entry.id === learnerId);

  if (!learner) {
    return null;
  }

  const breakdown = await calculateLearnerPointsBreakdown(familyId, learnerId);

  if (learner.points !== breakdown.totalPoints) {
    await learnerDataService.save(familyId, {
      ...learner,
      points: breakdown.totalPoints,
      updatedAt: new Date().toISOString(),
    });
    dispatchLearnerPointsUpdated(familyId, learnerId, breakdown.totalPoints);
  }

  return breakdown;
};

export const getLearnerPointActivity = async (
  familyId: string,
  learnerId: string,
  historyWindowDays = 14
): Promise<LearnerPointActivityItem[]> => {
  const [progress, artifacts, reflections, projects, externalSessions, unlocks, redemptions, actionEvents] = await Promise.all([
    progressDataService.getForLearner(familyId, learnerId, historyWindowDays),
    artifactDataService.getByLearner(learnerId),
    reflectionEntryDataService.getByLearner(learnerId),
    projectDataService.getByLearner(learnerId),
    externalActivitySessionDataService.getByLearner(learnerId),
    achievementUnlockDataService.getByLearner(learnerId),
    rewardRedemptionDataService.getByLearner(learnerId),
    getStoredActionPointEvents(familyId, learnerId, historyWindowDays),
  ]);

  const actionItems: LearnerPointActivityItem[] = actionEvents.map((event) => ({
    id: `action-${event.id}`,
    learnerId,
    timestamp: event.timestamp,
    points: event.points,
    label: event.label,
    description: event.description,
    source: 'actions',
  }));

  const blockItems: LearnerPointActivityItem[] = progress
    .filter((entry) => (entry.pointsEarned || 0) > 0)
    .map((entry) => ({
      id: `progress-${learnerId}-${entry.date}`,
      learnerId,
      timestamp: `${entry.date}T23:59:59.000Z`,
      points: entry.pointsEarned || 0,
      label: 'Session Completion',
      description: `${entry.blocksCompleted || 0} completed blocks on ${entry.date}`,
      source: 'blocks',
    }));

  const artifactItems: LearnerPointActivityItem[] = artifacts
    .filter(isLearnerPortfolioArtifact)
    .map((artifact) => ({
      id: `artifact-${artifact.id}`,
      learnerId,
      timestamp: artifact.createdAt,
      points: ARTIFACT_BONUS,
      label: 'Portfolio Artifact',
      description: artifact.title,
      source: 'artifact',
    }));

  const reflectionItems: LearnerPointActivityItem[] = reflections.map((reflection) => ({
    id: `reflection-${reflection.id}`,
    learnerId,
    timestamp: reflection.createdAt,
    points: REFLECTION_BONUS,
    label: 'Reflection Added',
    description: reflection.blockTitle || reflection.whatLearned,
    source: 'reflection',
  }));

  const projectItems: LearnerPointActivityItem[] = projects
    .filter((project) => project.status === 'completed' && project.completedAt)
    .map((project) => ({
      id: `project-${project.id}`,
      learnerId,
      timestamp: project.completedAt || project.updatedAt,
      points: COMPLETED_PROJECT_BONUS,
      label: 'Project Submitted',
      description: project.title,
      source: 'project',
    }));

  const externalItems: LearnerPointActivityItem[] = externalSessions
    .filter((session) => session.status === 'completed' && session.completedAt)
    .map((session) => ({
      id: `external-${session.id}`,
      learnerId,
      timestamp: session.completedAt || session.updatedAt,
      points: EXTERNAL_SESSION_BONUS,
      label: 'External Learning Synced',
      description: session.platformName || session.title,
      source: 'external',
    }));

  const achievementItems: LearnerPointActivityItem[] = unlocks
    .filter((unlock) => unlock.familyId === familyId && (unlock.pointsAwarded || 0) > 0)
    .map((unlock) => ({
      id: `achievement-${unlock.id}`,
      learnerId,
      timestamp: unlock.unlockedAt,
      points: unlock.pointsAwarded || 0,
      label: 'Achievement Unlocked',
      description:
        ACHIEVEMENTS.find((achievement) => achievement.id === unlock.achievementId)?.title ||
        unlock.achievementId,
      source: 'achievement',
    }));

  const redemptionItems: LearnerPointActivityItem[] = redemptions
    .filter((redemption) => redemption.status !== 'rejected')
    .map((redemption) => ({
      id: `redemption-${redemption.id}`,
      learnerId,
      timestamp: redemption.redeemedAt,
      points: -(redemption.pointsSpent || 0),
      label: 'Reward Redeemed',
      description: redemption.rewardTitle || redemption.rewardId,
      source: 'redemption',
    }));

  const cutoffTime = Date.now() - historyWindowDays * 86400000;

  return [
    ...actionItems,
    ...blockItems,
    ...artifactItems,
    ...reflectionItems,
    ...projectItems,
    ...externalItems,
    ...achievementItems,
    ...redemptionItems,
  ]
    .filter((item) => new Date(item.timestamp).getTime() >= cutoffTime)
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
};

export const getLearnerTodayPointsSummary = async (
  familyId: string,
  learnerId: string
): Promise<LearnerTodayPointsSummary> => {
  const today = toLocalDateKey();
  const activity = await getLearnerPointActivity(familyId, learnerId, 2);
  const todayItems = activity.filter((item) => item.timestamp.startsWith(today));

  const summary = todayItems.reduce<LearnerTodayPointsSummary>(
    (acc, item) => {
      acc.total += item.points;
      switch (item.source) {
        case 'blocks':
          acc.blocks += item.points;
          break;
        case 'actions':
          acc.actions += item.points;
          break;
        case 'artifact':
          acc.artifacts += item.points;
          break;
        case 'reflection':
          acc.reflections += item.points;
          break;
        case 'project':
          acc.projects += item.points;
          break;
        case 'external':
          acc.external += item.points;
          break;
        case 'achievement':
          acc.achievements += item.points;
          break;
        case 'redemption':
          acc.redemptions += item.points;
          break;
      }
      return acc;
    },
    {
      total: 0,
      blocks: 0,
      actions: 0,
      artifacts: 0,
      reflections: 0,
      projects: 0,
      external: 0,
      achievements: 0,
      redemptions: 0,
    }
  );

  return summary;
};

export const getLearnerRollingPointsSummary = async (
  familyId: string,
  learnerId: string
): Promise<LearnerRollingPointsSummary> => {
  const [activity, breakdown] = await Promise.all([
    getLearnerPointActivity(familyId, learnerId, 31),
    calculateLearnerPointsBreakdown(familyId, learnerId),
  ]);

  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekCutoff = now - 7 * 86400000;
  const monthCutoff = now - 30 * 86400000;

  return activity.reduce<LearnerRollingPointsSummary>(
    (summary, item) => {
      const timestamp = new Date(item.timestamp).getTime();
      if (timestamp >= todayStart.getTime()) {
        summary.today += item.points;
      }
      if (timestamp >= weekCutoff) {
        summary.week += item.points;
      }
      if (timestamp >= monthCutoff) {
        summary.month += item.points;
      }
      return summary;
    },
    {
      today: 0,
      week: 0,
      month: 0,
      overall: breakdown.totalPoints,
    }
  );
};
