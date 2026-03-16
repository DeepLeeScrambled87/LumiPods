// Block - Time-bounded learning session with skill-adaptive content

import type { SkillLevel } from './skillLevel';

export type BlockSubject = 'math' | 'coding' | 'language' | 'science' | 'french' | 'team';
export type SupportLevel = 'guided' | 'independent';

export interface Resource {
  id: string;
  name: string;
  url: string;
  platform?: string; // 'khan-academy', 'scratch', 'replit', etc.
  type: 'video' | 'interactive' | 'reading' | 'tool' | 'worksheet';
}

export interface BlockContent {
  objectives: string[];
  activities: string[];
  resources: Resource[];
  artifactPrompt: string;
  materials?: string[];
  tips?: string[];
}

export interface Block {
  id: string;
  title: string;
  subject: BlockSubject;
  duration: number; // minutes (base duration, adjusted by skill level)
  supportLevel: SupportLevel;
  icon?: string;
  
  // Skill-differentiated content
  content: Record<SkillLevel, BlockContent>;
}

export interface ScheduledBlock {
  id: string;
  blockId: string;
  learnerId: string;
  podId: string;
  weekNumber: number;
  dayOfWeek: number; // 1-5 (Mon-Fri)
  order: number; // Position in day's schedule
  startTime?: string; // Optional specific time
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  completedAt?: string;
  focusScore?: number; // 1-5
  notes?: string;
}

export interface BlockExecution {
  scheduledBlockId: string;
  learnerId: string;
  startedAt: string;
  completedAt?: string;
  pausedDuration: number; // Total paused time in seconds
  focusInterruptions: number;
  artifactId?: string;
  pointsEarned: number;
  bonuses: Array<{
    type: 'deep_focus' | 'teamwork' | 'kindness' | 'exceptional';
    points: number;
  }>;
}

// Subject display config
export const SUBJECT_CONFIG: Record<BlockSubject, { label: string; icon: string; color: string }> = {
  math: { label: 'Mathematics', icon: '🔢', color: 'text-blue-600' },
  coding: { label: 'Coding', icon: '💻', color: 'text-purple-600' },
  language: { label: 'Language Arts', icon: '📝', color: 'text-emerald-600' },
  science: { label: 'Science', icon: '🔬', color: 'text-orange-600' },
  french: { label: 'French', icon: '🇫🇷', color: 'text-rose-600' },
  team: { label: 'Team Building', icon: '🤝', color: 'text-amber-600' },
};
