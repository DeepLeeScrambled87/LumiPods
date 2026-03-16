// Rewards Shop Configuration
// Research-backed: meaningful progress indicators, not "pointification"
// Age-differentiated: immediate celebration (5-7), mastery badges (8-11), 
// autonomy (12-14), real-world credentials (15-18)

import type { Reward } from '../types/points';

// Reward tiers based on accumulation time
export type RewardTier = 'daily' | 'weekly' | 'monthly' | 'milestone';

export interface ExtendedReward extends Reward {
  tier: RewardTier;
  estimatedDaysToEarn: number; // At average earning rate
  ageAppropriate: { min: number; max: number };
  requiresParentApproval: boolean;
}

export const DEFAULT_REWARDS: ExtendedReward[] = [
  // === DAILY TIER (30-75 points) - Immediate gratification ===
  {
    id: 'reward-snack',
    title: 'Special Snack',
    description: 'Choose a special treat',
    cost: 30,
    category: 'item',
    icon: '🍪',
    isAvailable: true,
    maxRedemptionsPerWeek: 5,
    tier: 'daily',
    estimatedDaysToEarn: 1,
    ageAppropriate: { min: 5, max: 18 },
    requiresParentApproval: false,
  },
  {
    id: 'reward-screen-30',
    title: '30 Min Screen Time',
    description: 'Extra 30 minutes of screen time',
    cost: 50,
    category: 'screen_time',
    icon: '📱',
    isAvailable: true,
    maxRedemptionsPerWeek: 3,
    tier: 'daily',
    estimatedDaysToEarn: 1,
    ageAppropriate: { min: 5, max: 18 },
    requiresParentApproval: false,
  },
  {
    id: 'reward-project',
    title: 'Personal Project Time',
    description: '1 hour of dedicated project time with parent help',
    cost: 75,
    category: 'privilege',
    icon: '🛠️',
    isAvailable: true,
    maxRedemptionsPerWeek: 2,
    tier: 'daily',
    estimatedDaysToEarn: 2,
    ageAppropriate: { min: 6, max: 14 },
    requiresParentApproval: false,
  },

  // === WEEKLY TIER (100-200 points) - Short-term goals ===
  {
    id: 'reward-screen-60',
    title: '1 Hour Screen Time',
    description: 'Extra hour of screen time',
    cost: 100,
    category: 'screen_time',
    icon: '🎮',
    isAvailable: true,
    maxRedemptionsPerWeek: 2,
    tier: 'weekly',
    estimatedDaysToEarn: 3,
    ageAppropriate: { min: 6, max: 18 },
    requiresParentApproval: false,
  },
  {
    id: 'reward-late-bedtime',
    title: 'Late Bedtime',
    description: 'Stay up 30 minutes later',
    cost: 100,
    category: 'privilege',
    icon: '🌙',
    isAvailable: true,
    maxRedemptionsPerWeek: 1,
    tier: 'weekly',
    estimatedDaysToEarn: 3,
    ageAppropriate: { min: 5, max: 14 },
    requiresParentApproval: false,
  },
  {
    id: 'reward-vr',
    title: 'VR Experience',
    description: '30 minutes of VR time',
    cost: 150,
    category: 'activity',
    icon: '🥽',
    isAvailable: true,
    maxRedemptionsPerWeek: 1,
    tier: 'weekly',
    estimatedDaysToEarn: 4,
    ageAppropriate: { min: 8, max: 18 },
    requiresParentApproval: false,
  },
  {
    id: 'reward-movie',
    title: 'Movie Night Pick',
    description: 'Choose the family movie',
    cost: 200,
    category: 'privilege',
    icon: '🎬',
    isAvailable: true,
    maxRedemptionsPerWeek: 1,
    tier: 'weekly',
    estimatedDaysToEarn: 5,
    ageAppropriate: { min: 5, max: 18 },
    requiresParentApproval: false,
  },

  // === MONTHLY TIER (300-750 points) - Delayed gratification ===
  {
    id: 'reward-friend-playdate',
    title: 'Friend Playdate',
    description: 'Invite a friend over or go to their house',
    cost: 300,
    category: 'activity',
    icon: '👫',
    isAvailable: true,
    maxRedemptionsPerWeek: 1,
    tier: 'monthly',
    estimatedDaysToEarn: 8,
    ageAppropriate: { min: 5, max: 14 },
    requiresParentApproval: true,
  },
  {
    id: 'reward-outing',
    title: 'Special Outing',
    description: 'Choose a family outing destination',
    cost: 500,
    category: 'activity',
    icon: '🎢',
    isAvailable: true,
    maxRedemptionsPerWeek: 1,
    tier: 'monthly',
    estimatedDaysToEarn: 12,
    ageAppropriate: { min: 5, max: 18 },
    requiresParentApproval: true,
  },
  {
    id: 'reward-sleepover',
    title: 'Sleepover',
    description: 'Host or attend a sleepover with a friend',
    cost: 600,
    category: 'activity',
    icon: '🏕️',
    isAvailable: true,
    maxRedemptionsPerWeek: 1,
    tier: 'monthly',
    estimatedDaysToEarn: 15,
    ageAppropriate: { min: 8, max: 16 },
    requiresParentApproval: true,
  },
  {
    id: 'reward-small-purchase',
    title: 'Small Purchase ($10)',
    description: 'Choose something small from the store',
    cost: 750,
    category: 'item',
    icon: '🛍️',
    isAvailable: true,
    maxRedemptionsPerWeek: 1,
    tier: 'monthly',
    estimatedDaysToEarn: 18,
    ageAppropriate: { min: 6, max: 18 },
    requiresParentApproval: true,
  },

  // === MILESTONE TIER (1000+ points) - Excellence rewards ===
  {
    id: 'reward-yes-day',
    title: '✨ YES Day',
    description: 'A full day where parents say YES to (reasonable) requests! Pick activities, meals, and fun.',
    cost: 2000,
    category: 'privilege',
    icon: '🌟',
    isAvailable: true,
    maxRedemptionsPerWeek: 1,
    tier: 'milestone',
    estimatedDaysToEarn: 50,
    ageAppropriate: { min: 5, max: 14 },
    requiresParentApproval: true,
  },
  {
    id: 'reward-reasonable-gift',
    title: '🎁 Reasonable Gift',
    description: 'A gift of your choice (within family budget, ~$25-50). Excellence rewarded!',
    cost: 3000,
    category: 'item',
    icon: '🎁',
    isAvailable: true,
    maxRedemptionsPerWeek: 1,
    tier: 'milestone',
    estimatedDaysToEarn: 75,
    ageAppropriate: { min: 6, max: 18 },
    requiresParentApproval: true,
  },
  {
    id: 'reward-experience-day',
    title: '🎯 Experience Day',
    description: 'Choose a special experience: escape room, trampoline park, mini golf, etc.',
    cost: 2500,
    category: 'activity',
    icon: '🎯',
    isAvailable: true,
    maxRedemptionsPerWeek: 1,
    tier: 'milestone',
    estimatedDaysToEarn: 60,
    ageAppropriate: { min: 7, max: 18 },
    requiresParentApproval: true,
  },
  {
    id: 'reward-tech-time',
    title: '💻 Tech Upgrade Credit',
    description: 'Credit toward a tech item (game, app, accessory). Save up multiple!',
    cost: 1500,
    category: 'item',
    icon: '💻',
    isAvailable: true,
    tier: 'milestone',
    estimatedDaysToEarn: 38,
    ageAppropriate: { min: 10, max: 18 },
    requiresParentApproval: true,
  },
  {
    id: 'reward-passion-project',
    title: '🚀 Passion Project Fund',
    description: 'Funding for a personal project: art supplies, science kit, coding course, etc.',
    cost: 2000,
    category: 'item',
    icon: '🚀',
    isAvailable: true,
    tier: 'milestone',
    estimatedDaysToEarn: 50,
    ageAppropriate: { min: 8, max: 18 },
    requiresParentApproval: true,
  },
];

export const getRewardsByCategory = (category: Reward['category']): ExtendedReward[] => {
  return DEFAULT_REWARDS.filter((r) => r.category === category);
};

export const getRewardsByTier = (tier: RewardTier): ExtendedReward[] => {
  return DEFAULT_REWARDS.filter((r) => r.tier === tier);
};

export const getAffordableRewards = (points: number): ExtendedReward[] => {
  return DEFAULT_REWARDS.filter((r) => r.isAvailable && r.cost <= points);
};

export const getAgeAppropriateRewards = (age: number): ExtendedReward[] => {
  return DEFAULT_REWARDS.filter(
    (r) => age >= r.ageAppropriate.min && age <= r.ageAppropriate.max
  );
};

export const getMilestoneRewards = (): ExtendedReward[] => {
  return DEFAULT_REWARDS.filter((r) => r.tier === 'milestone');
};

// Calculate progress toward a milestone reward
export const getProgressToReward = (currentPoints: number, rewardCost: number): number => {
  return Math.min(100, Math.round((currentPoints / rewardCost) * 100));
};
