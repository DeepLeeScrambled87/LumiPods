// Learner - Individual student profile
// Decoupled from skill levels - references by ID

import type { SkillLevel } from './skillLevel';

export interface LearnerPreferences {
  focusTimeOverride?: number;
  breakTimeOverride?: number;
  interests?: string[];
  accommodations?: string[];
  lumiVoice?: string;
}

export interface Learner {
  id: string;
  name: string;
  age: number;
  skillLevel: SkillLevel;
  avatar: string;
  pin?: string;
  points: number;
  streakDays: number;
  preferences?: LearnerPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface LearnerProgress {
  learnerId: string;
  podId: string;
  weekNumber: number;
  blocksCompleted: number;
  blocksTotal: number;
  artifactsSubmitted: number;
  totalFocusMinutes: number;
  lastActivityAt: string;
}

export interface LearnerStats {
  learnerId: string;
  totalPoints: number;
  totalArtifacts: number;
  totalBlocksCompleted: number;
  longestStreak: number;
  currentStreak: number;
  averageFocusScore: number;
}

// Helper to create a new learner with defaults
export const createLearner = (
  name: string,
  age: number,
  skillLevel: SkillLevel,
  avatar?: string,
  pin?: string,
  preferences?: LearnerPreferences
): Learner => ({
  id: `learner-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  name,
  age,
  skillLevel,
  avatar: avatar || getDefaultAvatar(age),
  pin: pin?.trim() || undefined,
  points: 0,
  streakDays: 0,
  preferences,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const getDefaultAvatar = (age: number): string => {
  if (age <= 8) return '🧒';
  if (age <= 12) return '👦';
  if (age <= 14) return '🧑';
  return '🧑‍🎓';
};
