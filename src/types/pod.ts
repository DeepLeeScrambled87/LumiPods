// Pod - Themed weekly learning cycle

import type { Block } from './block';

export type PodTheme =
  | 'flight'
  | 'water'
  | 'maths'
  | 'coding'
  | 'energy'
  | 'language'
  | 'ai'
  | 'arts'
  | 'business'
  | 'environment'
  | 'wellness'
  | 'matter';

export interface Material {
  id: string;
  name: string;
  quantity: string;
  category: 'basic' | 'measurement' | 'safety' | 'optional';
  alternatives?: string[];
  notes?: string;
}

export interface FrenchVocab {
  term: string;
  translation: string;
  pronunciation: string;
  context?: string;
}

export interface PodDay {
  dayOfWeek: number; // 1-5 (Mon-Fri)
  title: string;
  description: string;
  blocks: Block[];
  frenchPhrase?: FrenchVocab;
}

export interface PodWeek {
  weekNumber: number;
  title: string;
  focus: string;
  milestone: string;
  days: PodDay[];
  materials: Material[];
  safetyNotes?: string[];
  vocabulary: FrenchVocab[];
}

export interface Pod {
  id: string;
  title: string;
  theme: PodTheme;
  description: string;
  coverImage?: string;
  milestone: string;
  artifactTypes: string[];
  weeks: PodWeek[] | SimplifiedWeek[];
  learningObjectives: string[];
  duration?: number; // weeks
  skillLevel?: 'foundation' | 'intermediate' | 'advanced' | 'pro';
  materials?: string[];
}

// Simplified week structure for language pods
export interface SimplifiedWeek {
  weekNumber: number;
  title: string;
  focus: string;
  blocks?: SimplifiedBlock[];
}

export interface SimplifiedBlock {
  title: string;
  duration: number;
  type: string;
}

// Theme display config
export const POD_THEME_CONFIG: Record<PodTheme, { 
  label: string; 
  icon: string; 
  color: string;
  bgGradient: string;
}> = {
  flight: { 
    label: 'Flight & Parachutes', 
    icon: '🪂', 
    color: 'text-sky-600',
    bgGradient: 'from-sky-500 to-blue-600',
  },
  water: { 
    label: 'Water & Filtration', 
    icon: '💧', 
    color: 'text-cyan-600',
    bgGradient: 'from-cyan-500 to-teal-600',
  },
  maths: {
    label: 'Maths & Modelling',
    icon: '📐',
    color: 'text-blue-700',
    bgGradient: 'from-blue-500 to-indigo-600',
  },
  coding: { 
    label: 'Coding the Future', 
    icon: '🤖', 
    color: 'text-purple-600',
    bgGradient: 'from-purple-500 to-indigo-600',
  },
  energy: { 
    label: 'Energy & Motion', 
    icon: '⚡', 
    color: 'text-amber-600',
    bgGradient: 'from-amber-500 to-orange-600',
  },
  language: { 
    label: 'Languages', 
    icon: '🇫🇷', 
    color: 'text-rose-600',
    bgGradient: 'from-rose-500 to-pink-600',
  },
  ai: { 
    label: 'AI & Machine Learning', 
    icon: '🤖', 
    color: 'text-violet-600',
    bgGradient: 'from-violet-500 to-purple-600',
  },
  arts: { 
    label: 'Arts & Creativity', 
    icon: '🎨', 
    color: 'text-pink-600',
    bgGradient: 'from-pink-500 to-rose-600',
  },
  business: { 
    label: 'Business & Entrepreneurship', 
    icon: '💼', 
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-500 to-teal-600',
  },
  environment: { 
    label: 'Environment & Sustainability', 
    icon: '🌱', 
    color: 'text-green-600',
    bgGradient: 'from-green-500 to-emerald-600',
  },
  wellness: { 
    label: 'Health & Wellness', 
    icon: '🧘', 
    color: 'text-blue-600',
    bgGradient: 'from-blue-500 to-indigo-600',
  },
  matter: {
    label: 'Matter & Atomic Thinking',
    icon: '⚛️',
    color: 'text-cyan-700',
    bgGradient: 'from-cyan-500 to-sky-600',
  },
};
