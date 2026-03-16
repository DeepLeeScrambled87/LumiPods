// Family - Account that owns learners and settings

import type { Learner } from './learner';

export interface FamilySettings {
  timezone: string;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday
  dailyStartTime: string; // "09:00"
  dailyEndTime: string;   // "14:30"
  enablePoints: boolean;
  enableRewards: boolean;
  enableTimer: boolean;
  timerStyle: 'pomodoro' | 'countdown' | 'stopwatch';
}

export interface Family {
  id: string;
  name: string;
  learners: Learner[];
  currentPodId: string | null;
  currentWeek: number;
  settings: FamilySettings;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_FAMILY_SETTINGS: FamilySettings = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  weekStartsOn: 1, // Monday
  dailyStartTime: '09:00',
  dailyEndTime: '14:30',
  enablePoints: true,
  enableRewards: true,
  enableTimer: true,
  timerStyle: 'pomodoro',
};

export const createFamily = (name: string): Family => ({
  id: `family-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  name,
  learners: [],
  currentPodId: null,
  currentWeek: 1,
  settings: { ...DEFAULT_FAMILY_SETTINGS },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
