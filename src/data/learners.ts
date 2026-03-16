import type { Learner } from '../types';
import type { SkillLevel } from '../types/skillLevel';

export const defaultLearners: Learner[] = [
  {
    id: 'neo',
    name: 'Neo',
    age: 12,
    skillLevel: 'advanced' as SkillLevel,
    points: 0,
    streakDays: 0,
    avatar: '👨‍🎓',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'aimee',
    name: 'Aimee',
    age: 10,
    skillLevel: 'intermediate' as SkillLevel,
    points: 0,
    streakDays: 0,
    avatar: '👩‍🎨',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mischa',
    name: 'Mischa',
    age: 6,
    skillLevel: 'foundation' as SkillLevel,
    points: 0,
    streakDays: 0,
    avatar: '👶‍🔬',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Legacy level config - use SKILL_LEVELS from types/skillLevel.ts instead
export const levelConfig = {
  foundation: {
    color: 'bg-green-100 text-green-800',
    focusTime: 15,
    breakTime: 5,
    dailyBlocks: 3
  },
  intermediate: {
    color: 'bg-blue-100 text-blue-800',
    focusTime: 20,
    breakTime: 5,
    dailyBlocks: 4
  },
  advanced: {
    color: 'bg-purple-100 text-purple-800',
    focusTime: 25,
    breakTime: 5,
    dailyBlocks: 5
  },
  pro: {
    color: 'bg-amber-100 text-amber-800',
    focusTime: 30,
    breakTime: 5,
    dailyBlocks: 6
  }
};
