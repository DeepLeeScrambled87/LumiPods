// Enhanced Schedule Types - Learning Management System

import type { QuizQuestion } from './curriculum';

export interface DailySchedule {
  id: string;
  date: string; // YYYY-MM-DD
  learnerId: string;
  familyId: string;
  blocks: ScheduleBlock[];
  totalDuration: number; // minutes
  completedBlocks: number;
  energyLevel: 'high' | 'medium' | 'low';
  focusTime: 'morning' | 'afternoon' | 'evening';
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleBlock {
  id: string;
  title: string;
  description?: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  type: BlockType;
  status: BlockStatus;
  priority: 'low' | 'medium' | 'high';
  
  // Learning content
  podId?: string;
  weekNumber?: number;
  railId?: string;
  railTrackId?: string;
  railModuleId?: string;
  railLessonId?: string;
  objectives: string[];
  materials: string[];
  resources: SharedResource[];
  
  // Expected work output
  expectedWork?: string;
  reflectionPrompt?: string;
  sessionGuide?: string[];
  recommendedTools?: string[];
  sourceLinks?: SessionLink[];
  quizQuestions?: QuizQuestion[];
  
  // French vocabulary integration
  frenchVocab?: FrenchVocabItem[];
  frenchIntegrationGoals?: string[];
  
  // AI Skills development
  aiSkills?: AISkillsData;
  
  // Progress tracking
  completedAt?: string;
  actualDuration?: number;
  timerInitialSeconds?: number;
  timerRemainingSeconds?: number;
  timerStartedAt?: string;
  notes?: string;
  artifacts?: string[];
  source: 'pod' | 'project' | 'external' | 'custom';
  relatedPodIds?: string[];
  projectId?: string;
  projectStepId?: string;
  externalSessionId?: string;
  externalPlatformId?: string;
  externalPlatformName?: string;
  launchUrl?: string;
  
  // Adaptive features
  suggestedTime?: string;
  energyRequired: 'low' | 'medium' | 'high';
  focusRequired: 'low' | 'medium' | 'high';
  canReschedule: boolean;
  dependencies?: string[]; // other block IDs
}

// French vocabulary item for bilingual learning
export interface FrenchVocabItem {
  french: string;
  english: string;
}

// AI Skills development data
export interface AISkillsData {
  title: string;
  description: string;
  tools: string[];
  expectedOutcome: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  levelDescription?: string;
}

export type BlockType = 
  | 'learning'     // Core pod activities
  | 'practice'     // Skill reinforcement
  | 'creative'     // Art, music, writing
  | 'physical'     // Movement, exercise
  | 'external'     // Outside learning tools
  | 'vr'          // VR sessions
  | 'french'      // Language practice
  | 'reflection'  // Journaling, discussion
  | 'break'       // Rest periods
  | 'assessment'  // Evaluation
  | 'project';    // Artifact creation

export type BlockStatus = 
  | 'scheduled'   // Not started
  | 'ready'       // Can start now
  | 'in-progress' // Currently active
  | 'paused'      // Temporarily stopped
  | 'completed'   // Finished
  | 'skipped'     // Intentionally skipped
  | 'rescheduled' // Moved to different time
  | 'blocked';    // Waiting for dependencies

export interface SharedResource {
  id: string;
  name: string;
  type: 'device' | 'material' | 'space' | 'person';
  icon: string;
  isRequired: boolean;
  setupTime?: number;
  cleanupTime?: number;
}

export interface SessionLink {
  id: string;
  title: string;
  url: string;
  type: 'tool' | 'source' | 'activity' | 'simulation' | 'video' | 'worksheet';
  note?: string;
}

export interface SchedulePreferences {
  learnerId: string;
  optimalStartTime: string;
  optimalEndTime: string;
  peakFocusHours: string[];
  breakFrequency: number;
  breakDuration: number;
  maxBlockDuration: number;
  preferredBlockTypes: BlockType[];
  energyPattern: {
    morning: 'high' | 'medium' | 'low';
    afternoon: 'high' | 'medium' | 'low';
    evening: 'high' | 'medium' | 'low';
  };
}

export interface ScheduleMetrics {
  date: string;
  learnerId: string;
  blocksScheduled: number;
  blocksCompleted: number;
  blocksSkipped: number;
  completionRate: number;
  totalScheduledTime: number;
  totalActiveTime: number;
  averageBlockDuration: number;
  focusScore: number;
  energyStart: number;
  energyEnd: number;
}

export interface BlockCompletionDetails {
  notes?: string;
  reflection?: {
    prompt?: string;
    whatLearned?: string;
    challenge?: string;
    nextStep?: string;
    confidence: 1 | 2 | 3 | 4 | 5;
    quickCheckAnswer?: string;
  };
}


// Block type configurations
export const BLOCK_TYPE_CONFIG: Record<BlockType, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  defaultDuration: number;
  energyImpact: number;
  focusRequired: 'low' | 'medium' | 'high';
}> = {
  learning: {
    label: 'Learning',
    icon: '📚',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    defaultDuration: 45,
    energyImpact: -1,
    focusRequired: 'high',
  },
  practice: {
    label: 'Practice',
    icon: '🎯',
    color: 'text-green-700',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    defaultDuration: 30,
    energyImpact: -1,
    focusRequired: 'medium',
  },
  creative: {
    label: 'Creative',
    icon: '🎨',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    defaultDuration: 60,
    energyImpact: 1,
    focusRequired: 'medium',
  },
  physical: {
    label: 'Physical',
    icon: '🏃',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    defaultDuration: 30,
    energyImpact: 2,
    focusRequired: 'low',
  },
  external: {
    label: 'External Tool',
    icon: '🌐',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    defaultDuration: 40,
    energyImpact: -1,
    focusRequired: 'medium',
  },
  vr: {
    label: 'VR Session',
    icon: '🥽',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    defaultDuration: 30,
    energyImpact: 0,
    focusRequired: 'high',
  },
  french: {
    label: 'French',
    icon: '🇫🇷',
    color: 'text-rose-700',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    defaultDuration: 25,
    energyImpact: -1,
    focusRequired: 'medium',
  },
  reflection: {
    label: 'Reflection',
    icon: '💭',
    color: 'text-teal-700',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    defaultDuration: 15,
    energyImpact: 1,
    focusRequired: 'low',
  },
  break: {
    label: 'Break',
    icon: '☕',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    defaultDuration: 15,
    energyImpact: 2,
    focusRequired: 'low',
  },
  assessment: {
    label: 'Assessment',
    icon: '📊',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    defaultDuration: 20,
    energyImpact: -2,
    focusRequired: 'high',
  },
  project: {
    label: 'Project Work',
    icon: '🛠️',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    defaultDuration: 90,
    energyImpact: 0,
    focusRequired: 'medium',
  },
};

// Status configurations
export const BLOCK_STATUS_CONFIG: Record<BlockStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  scheduled: {
    label: 'Scheduled',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    icon: '⏰',
  },
  ready: {
    label: 'Ready',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: '▶️',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: '⏳',
  },
  paused: {
    label: 'Paused',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: '⏸️',
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    icon: '✅',
  },
  skipped: {
    label: 'Skipped',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: '⏭️',
  },
  rescheduled: {
    label: 'Rescheduled',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: '🔄',
  },
  blocked: {
    label: 'Blocked',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: '🚫',
  },
};

// Common shared resources
export const COMMON_RESOURCES: SharedResource[] = [
  { id: 'vr-headset', name: 'VR Headset', type: 'device', icon: '🥽', isRequired: true, setupTime: 5 },
  { id: 'tablet', name: 'Tablet', type: 'device', icon: '📱', isRequired: true },
  { id: 'laptop', name: 'Laptop', type: 'device', icon: '💻', isRequired: true },
  { id: 'art-supplies', name: 'Art Supplies', type: 'material', icon: '🎨', isRequired: true, setupTime: 5, cleanupTime: 10 },
  { id: 'science-kit', name: 'Science Kit', type: 'material', icon: '🔬', isRequired: true, setupTime: 10, cleanupTime: 10 },
  { id: 'outdoor-space', name: 'Outdoor Space', type: 'space', icon: '🌳', isRequired: false },
  { id: 'quiet-room', name: 'Quiet Room', type: 'space', icon: '🤫', isRequired: false },
  { id: 'parent-help', name: 'Parent Assistance', type: 'person', icon: '👨‍👩‍👧', isRequired: false },
];
