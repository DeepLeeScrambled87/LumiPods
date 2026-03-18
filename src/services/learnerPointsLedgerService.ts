import { queueSync } from '../hooks/useDatabase';
import { COLLECTIONS } from '../lib/pocketbase';
import { storage } from '../lib/storage';
import { announceLearnerPointsAward } from './pointsFeedbackService';
import { documentBackendClient } from './documentBackendClient';
import type { PointEvent, PointEventType } from '../types/points';

export type LearnerPointActionId =
  | 'session_note_added'
  | 'maths_game_completed'
  | 'maths_mastery_bonus'
  | 'french_game_completed'
  | 'french_mastery_bonus'
  | 'french_vocab_bonus'
  | 'resource_opened'
  | 'video_resource_opened'
  | 'full_day_completed'
  | 'parent_bonus'
  | 'lumi_deep_dive_30m'
  | 'on_time_start';

export interface LearnerPointActionConfig {
  points: number;
  type: PointEventType;
  label: string;
  description: string;
}

export const ACTION_POINTS_MATRIX: Record<LearnerPointActionId, LearnerPointActionConfig> = {
  session_note_added: {
    points: 4,
    type: 'core_block',
    label: 'Session Notes',
    description: 'Added a useful session note or reflection.',
  },
  maths_game_completed: {
    points: 8,
    type: 'core_block',
    label: 'Maths Game Played',
    description: 'Completed a maths practice game.',
  },
  maths_mastery_bonus: {
    points: 6,
    type: 'exceptional',
    label: 'Maths Mastery Bonus',
    description: 'Reached a new maths game level or beat a personal best.',
  },
  french_game_completed: {
    points: 8,
    type: 'french',
    label: 'French Game Played',
    description: 'Completed a French reading or vocabulary game.',
  },
  french_mastery_bonus: {
    points: 6,
    type: 'french',
    label: 'French Mastery Bonus',
    description: 'Levelled up or beat a personal best in a French game.',
  },
  french_vocab_bonus: {
    points: 5,
    type: 'french',
    label: 'French Vocabulary Bonus',
    description: 'Learned and used new French words during practice.',
  },
  resource_opened: {
    points: 2,
    type: 'artifact',
    label: 'Resource Opened',
    description: 'Opened a linked learning resource.',
  },
  video_resource_opened: {
    points: 5,
    type: 'artifact',
    label: 'Video Watched',
    description: 'Opened a teaching video or walkthrough.',
  },
  full_day_completed: {
    points: 20,
    type: 'streak',
    label: 'Full Day Complete',
    description: 'Completed every tracked block scheduled for the day.',
  },
  parent_bonus: {
    points: 10,
    type: 'exceptional',
    label: 'Parent Bonus',
    description: 'Bonus points awarded by a parent for standout work.',
  },
  lumi_deep_dive_30m: {
    points: 12,
    type: 'deep_focus',
    label: 'Lumi Deep Dive',
    description: 'Spent 30 focused minutes working with Lumi.',
  },
  on_time_start: {
    points: 3,
    type: 'streak',
    label: 'On Time',
    description: 'Started learning on time and stayed on track.',
  },
};

export interface LearnerPointLedgerEvent extends PointEvent {
  familyId: string;
  actionId: LearnerPointActionId;
  sourceKey?: string;
  artifactId?: string;
  awardedAt: string;
}

interface AwardLearnerPointsParams {
  familyId: string;
  learnerId: string;
  actionId: LearnerPointActionId;
  description?: string;
  pointsOverride?: number;
  blockId?: string;
  artifactId?: string;
  sourceKey?: string;
}

const OFFLINE_KEY_PREFIX = 'learner-points-ledger';

const getLedgerKey = (learnerId: string) => `${OFFLINE_KEY_PREFIX}-${learnerId}`;

const checkOnline = async (): Promise<boolean> => {
  return documentBackendClient.isOnline();
};

const buildRemoteDescription = (
  description: string,
  actionId: LearnerPointActionId,
  sourceKey?: string
): string => {
  const metadata = [`action=${actionId}`];
  if (sourceKey) {
    metadata.push(`source=${sourceKey}`);
  }
  return `${description}\n[lumipods:${metadata.join(';')}]`;
};

const upsertCachedEvent = (event: LearnerPointLedgerEvent): LearnerPointLedgerEvent[] => {
  const cached = storage.get<LearnerPointLedgerEvent[]>(getLedgerKey(event.learnerId), []);
  const next = [event, ...cached];
  storage.set(getLedgerKey(event.learnerId), next);
  return next;
};

export const learnerPointsLedgerService = {
  getByLearner(learnerId: string): LearnerPointLedgerEvent[] {
    return storage.get<LearnerPointLedgerEvent[]>(getLedgerKey(learnerId), []);
  },

  getTotalForLearner(learnerId: string): number {
    return this.getByLearner(learnerId).reduce((sum, event) => sum + event.points, 0);
  },

  async award(params: AwardLearnerPointsParams): Promise<LearnerPointLedgerEvent | null> {
    const config = ACTION_POINTS_MATRIX[params.actionId];
    if (!config) {
      return null;
    }

    const existing = this.getByLearner(params.learnerId);
    if (params.sourceKey && existing.some((event) => event.sourceKey === params.sourceKey)) {
      return null;
    }

    const awardedAt = new Date().toISOString();
    const event: LearnerPointLedgerEvent = {
      id: `points-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      familyId: params.familyId,
      learnerId: params.learnerId,
      actionId: params.actionId,
      type: config.type,
      points: params.pointsOverride ?? config.points,
      blockId: params.blockId,
      artifactId: params.artifactId,
      description: params.description || config.description,
      timestamp: awardedAt,
      awardedAt,
      sourceKey: params.sourceKey,
    };

    upsertCachedEvent(event);
    announceLearnerPointsAward({
      familyId: event.familyId,
      learnerId: event.learnerId,
      points: event.points,
      label: config.label,
      description: event.description,
      timestamp: awardedAt,
    });

    const remoteRecord = {
      family: event.familyId,
      learner: event.learnerId,
      type: event.type,
      points: event.points,
      blockId: event.blockId,
      artifactId: event.artifactId,
      description: buildRemoteDescription(event.description, event.actionId, event.sourceKey),
    };

    if (await checkOnline()) {
      try {
        await documentBackendClient.create(COLLECTIONS.POINTS, remoteRecord);
      } catch {
        queueSync(COLLECTIONS.POINTS, 'create', remoteRecord);
      }
    } else {
      queueSync(COLLECTIONS.POINTS, 'create', remoteRecord);
    }

    return event;
  },
};

export default learnerPointsLedgerService;
