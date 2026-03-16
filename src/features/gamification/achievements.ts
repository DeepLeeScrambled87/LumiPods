export type AchievementRequirementType =
  | 'streak'
  | 'blocks'
  | 'minutes'
  | 'pods'
  | 'artifacts'
  | 'points'
  | 'projects'
  | 'reflections'
  | 'externalSessions'
  | 'custom';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'learning' | 'exploration' | 'mastery' | 'social' | 'special';
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirement: {
    type: AchievementRequirementType;
    value: number;
  };
  secret?: boolean;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
  learnerId: string;
}

export interface LearnerStats {
  streakDays: number;
  blocksCompleted: number;
  focusMinutes: number;
  podsCompleted: number;
  artifactsCreated: number;
  totalPoints: number;
  projectsCompleted: number;
  reflectionsLogged: number;
  externalSessionsCompleted: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'streak-3', title: 'Getting Started', description: 'Complete a 3-day learning streak', icon: '🔥', category: 'streak', points: 25, rarity: 'common', requirement: { type: 'streak', value: 3 } },
  { id: 'streak-7', title: 'Week Warrior', description: 'Complete a 7-day learning streak', icon: '🔥', category: 'streak', points: 50, rarity: 'uncommon', requirement: { type: 'streak', value: 7 } },
  { id: 'streak-30', title: 'Monthly Master', description: 'Complete a 30-day learning streak', icon: '🌟', category: 'streak', points: 250, rarity: 'epic', requirement: { type: 'streak', value: 30 } },

  { id: 'blocks-10', title: 'First Steps', description: 'Complete 10 learning blocks', icon: '📚', category: 'learning', points: 20, rarity: 'common', requirement: { type: 'blocks', value: 10 } },
  { id: 'blocks-100', title: 'Knowledge Seeker', description: 'Complete 100 learning blocks', icon: '🎓', category: 'learning', points: 150, rarity: 'rare', requirement: { type: 'blocks', value: 100 } },
  { id: 'minutes-600', title: 'Ten Hour Club', description: 'Accumulate 10 hours of focus time', icon: '⏰', category: 'learning', points: 100, rarity: 'uncommon', requirement: { type: 'minutes', value: 600 } },

  { id: 'pods-1', title: 'Pod Pioneer', description: 'Complete your first learning pod', icon: '🚀', category: 'exploration', points: 50, rarity: 'common', requirement: { type: 'pods', value: 1 } },
  { id: 'artifacts-10', title: 'Portfolio Builder', description: 'Upload 10 artifacts', icon: '📁', category: 'mastery', points: 75, rarity: 'uncommon', requirement: { type: 'artifacts', value: 10 } },
  { id: 'points-1000', title: 'Thousand Club', description: 'Earn 1,000 points', icon: '💰', category: 'mastery', points: 0, rarity: 'uncommon', requirement: { type: 'points', value: 1000 } },

  { id: 'projects-1', title: 'Quest Starter', description: 'Finish your first real project', icon: '🛠️', category: 'mastery', points: 40, rarity: 'common', requirement: { type: 'projects', value: 1 } },
  { id: 'projects-5', title: 'Builder in Motion', description: 'Finish 5 portfolio-worthy projects', icon: '🏗️', category: 'mastery', points: 180, rarity: 'rare', requirement: { type: 'projects', value: 5 } },

  { id: 'reflections-5', title: 'Thoughtful Thinker', description: 'Log 5 meaningful reflections about your learning', icon: '💭', category: 'learning', points: 35, rarity: 'common', requirement: { type: 'reflections', value: 5 } },
  { id: 'reflections-20', title: 'Growth Mindset', description: 'Log 20 reflections that show your strategy and growth', icon: '🪴', category: 'mastery', points: 120, rarity: 'rare', requirement: { type: 'reflections', value: 20 } },

  { id: 'external-3', title: 'Connected Learner', description: 'Bring 3 outside learning sessions back into LumiPods', icon: '🔗', category: 'exploration', points: 50, rarity: 'common', requirement: { type: 'externalSessions', value: 3 } },
  { id: 'external-15', title: 'Bridge Builder', description: 'Track 15 external sessions and connect them to your portfolio', icon: '🌉', category: 'exploration', points: 180, rarity: 'rare', requirement: { type: 'externalSessions', value: 15 } },

  { id: 'weekend-warrior', title: 'Weekend Warrior', description: 'Learn on both Saturday and Sunday', icon: '🎉', category: 'special', points: 75, rarity: 'rare', requirement: { type: 'custom', value: 1 }, secret: true },
];

export const RARITY_COLORS = {
  common: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-400 dark:border-slate-600',
  uncommon: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 border-emerald-400 dark:border-emerald-600',
  rare: 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-100 border-sky-400 dark:border-sky-600',
  epic: 'bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-100 border-violet-400 dark:border-violet-600',
  legendary: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 border-amber-400 dark:border-amber-600',
};
