// Skill Level System - Universal 4-tier configuration
// Decoupled from learners so any family can use these levels

export type SkillLevel = 'foundation' | 'intermediate' | 'advanced' | 'pro';

export interface SkillLevelConfig {
  id: SkillLevel;
  label: string;
  ageRange: string;
  focusMinutes: number;
  breakMinutes: number;
  dailyBlocks: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  capabilities: {
    math: string[];
    coding: string[];
    language: string[];
    science: string[];
  };
}

export const SKILL_LEVELS: Record<SkillLevel, SkillLevelConfig> = {
  foundation: {
    id: 'foundation',
    label: 'Foundation',
    ageRange: 'Ages 5-8',
    focusMinutes: 15,
    breakMinutes: 5,
    dailyBlocks: 3,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Building core skills through hands-on exploration and guided discovery',
    capabilities: {
      math: ['Number bonds', 'Basic counting', 'Simple patterns', 'Shape recognition'],
      coding: ['ScratchJr visual programming', 'Drag-and-drop logic', 'Sequencing'],
      language: ['Word recognition', 'Phonics', 'Simple vocabulary', 'Listening skills'],
      science: ['Sensory experiments', 'Hands-on crafts', 'Observation skills', 'Nature exploration'],
    },
  },
  intermediate: {
    id: 'intermediate',
    label: 'Intermediate',
    ageRange: 'Ages 9-12',
    focusMinutes: 20,
    breakMinutes: 5,
    dailyBlocks: 4,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Expanding knowledge through structured projects and documentation',
    capabilities: {
      math: ['Measurement', 'Fractions', 'Data collection', 'Basic geometry'],
      coding: ['Scratch games', 'Interactive stories', 'Basic algorithms', 'Debugging'],
      language: ['Vocabulary expansion', 'Creative writing', 'Structured communication'],
      science: ['Hypothesis testing', 'Data recording', 'Cause-and-effect', 'Simple experiments'],
    },
  },
  advanced: {
    id: 'advanced',
    label: 'Advanced',
    ageRange: 'Ages 11-14',
    focusMinutes: 25,
    breakMinutes: 5,
    dailyBlocks: 5,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Developing expertise through complex projects and peer collaboration',
    capabilities: {
      math: ['Data analysis', 'Chart creation', 'Statistical thinking', 'Algebraic concepts'],
      coding: ['Python via Replit', 'Debugging', 'Version control', 'API basics'],
      language: ['Research writing', 'Technical documentation', 'Presentation skills'],
      science: ['Experiment logs', 'Variable control', 'Scientific method', 'Lab reports'],
    },
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    ageRange: 'Ages 14-18',
    focusMinutes: 30,
    breakMinutes: 5,
    dailyBlocks: 6,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Mastering skills through independent research and real-world projects',
    capabilities: {
      math: ['Advanced statistics', 'Calculus concepts', 'Mathematical modeling', 'Data science'],
      coding: ['Full-stack development', 'API integration', 'Open source', 'System design'],
      language: ['Technical writing', 'Peer review', 'Cross-cultural communication', 'Mentoring'],
      science: ['Independent research', 'Literature review', 'Data visualization', 'Publication'],
    },
  },
};

export const getSkillLevel = (level: SkillLevel): SkillLevelConfig => SKILL_LEVELS[level];

export const getSkillLevelByAge = (age: number): SkillLevel => {
  if (age <= 8) return 'foundation';
  if (age <= 12) return 'intermediate';
  if (age <= 14) return 'advanced';
  return 'pro';
};

export const SKILL_LEVEL_ORDER: SkillLevel[] = ['foundation', 'intermediate', 'advanced', 'pro'];
