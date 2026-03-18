// Points & Rewards System

export type PointEventType =
  | 'core_block'
  | 'deep_focus'
  | 'teamwork'
  | 'kindness'
  | 'exceptional'
  | 'artifact'
  | 'streak'
  | 'french'
  | 'vr';
export type RewardCategory = 'screen_time' | 'activity' | 'privilege' | 'item';

export interface PointEvent {
  id: string;
  familyId?: string;
  learnerId: string;
  type: PointEventType;
  points: number;
  blockId?: string;
  artifactId?: string;
  description: string;
  timestamp: string;
  actionId?: string;
  sourceKey?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: RewardCategory;
  icon: string;
  isAvailable: boolean;
  maxRedemptionsPerWeek?: number;
}

export interface RewardRedemption {
  id: string;
  familyId?: string;
  learnerId: string;
  rewardId: string;
  rewardTitle?: string;
  pointsSpent: number;
  redeemedAt: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  fulfilledAt?: string;
  notes?: string;
}

// Points configuration
export const POINTS_CONFIG: Record<PointEventType, { 
  basePoints: number; 
  label: string; 
  icon: string;
  description: string;
}> = {
  core_block: {
    basePoints: 10,
    label: 'Block Completed',
    icon: '✅',
    description: 'Completed a learning block',
  },
  deep_focus: {
    basePoints: 5,
    label: 'Deep Focus',
    icon: '🎯',
    description: 'Maintained focus throughout the block',
  },
  teamwork: {
    basePoints: 5,
    label: 'Teamwork',
    icon: '🤝',
    description: 'Helped a sibling or collaborated well',
  },
  kindness: {
    basePoints: 5,
    label: 'Kindness',
    icon: '💝',
    description: 'Showed kindness to others',
  },
  exceptional: {
    basePoints: 10,
    label: 'Exceptional Work',
    icon: '⭐',
    description: 'Went above and beyond expectations',
  },
  artifact: {
    basePoints: 5,
    label: 'Artifact & Resource',
    icon: '📎',
    description: 'Read, watched, or shared a learning resource',
  },
  streak: {
    basePoints: 10,
    label: 'Consistency Bonus',
    icon: '🔥',
    description: 'Stayed consistent and followed through',
  },
  french: {
    basePoints: 8,
    label: 'French Practice',
    icon: '🇫🇷',
    description: 'Practiced French words, sentences, or conversation',
  },
  vr: {
    basePoints: 8,
    label: 'Immersive Practice',
    icon: '🥽',
    description: 'Completed a game or immersive practice challenge',
  },
};

export const createPointEvent = (
  learnerId: string,
  type: PointEventType,
  description?: string,
  blockId?: string,
  extras?: Partial<Omit<PointEvent, 'id' | 'learnerId' | 'type' | 'points' | 'description' | 'timestamp' | 'blockId'>>
): PointEvent => ({
  id: `points-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  learnerId,
  type,
  points: POINTS_CONFIG[type].basePoints,
  blockId,
  description: description || POINTS_CONFIG[type].description,
  timestamp: new Date().toISOString(),
  ...extras,
});
