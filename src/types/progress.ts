// Progress Tracking

export interface DailyProgress {
  learnerId: string;
  date: string; // YYYY-MM-DD
  podId?: string;
  weekNumber?: number;
  blocksCompleted: number;
  blocksTotal: number;
  totalFocusMinutes: number;
  pointsEarned: number;
  artifactsCreated: number;
  streakMaintained: boolean;
}

export interface WeeklyProgress {
  learnerId: string;
  podId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  blocksCompleted: number;
  blocksTotal: number;
  milestoneAchieved: boolean;
  artifactsCreated: number;
  totalPoints: number;
  showcaseCompleted: boolean;
}

export interface PodProgress {
  learnerId: string;
  podId: string;
  startedAt: string;
  completedAt?: string;
  weeksCompleted: number;
  totalWeeks: number;
  overallScore?: number;
  certificateEarned: boolean;
}

// Calculate completion percentage
export const calculateCompletion = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

// Check if streak should continue
export const shouldMaintainStreak = (
  blocksCompleted: number,
  minimumBlocks: number = 1
): boolean => blocksCompleted >= minimumBlocks;
