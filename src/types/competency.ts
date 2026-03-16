// Competency tracking - Portfolio-first assessment model
// Based on Mastery Transcript Consortium approach

export type CompetencyLevel = 'beginning' | 'developing' | 'proficient' | 'expert';

export type CompetencyDomain = 
  | 'critical-thinking'
  | 'communication'
  | 'collaboration'
  | 'creativity'
  | 'scientific-inquiry'
  | 'mathematical-reasoning'
  | 'digital-literacy'
  | 'self-direction';

export interface CompetencyConfig {
  id: CompetencyDomain;
  label: string;
  description: string;
  icon: string;
  color: string;
  indicators: Record<CompetencyLevel, string[]>;
}

export interface LearnerCompetency {
  id: string;
  learnerId: string;
  domain: CompetencyDomain;
  level: CompetencyLevel;
  evidenceIds: string[]; // Links to artifacts that demonstrate this competency
  assessedAt: string;
  assessedBy: 'self' | 'parent' | 'peer' | 'ai';
  notes?: string;
}

export const COMPETENCY_LEVELS: Record<CompetencyLevel, { label: string; color: string; order: number }> = {
  beginning: { label: 'Beginning', color: 'text-slate-500', order: 1 },
  developing: { label: 'Developing', color: 'text-blue-600', order: 2 },
  proficient: { label: 'Proficient', color: 'text-emerald-600', order: 3 },
  expert: { label: 'Expert', color: 'text-purple-600', order: 4 },
};

export const COMPETENCY_DOMAINS: Record<CompetencyDomain, CompetencyConfig> = {
  'critical-thinking': {
    id: 'critical-thinking',
    label: 'Critical Thinking',
    description: 'Analyze, evaluate, and solve complex problems',
    icon: '🧠',
    color: 'bg-purple-100 text-purple-700',
    indicators: {
      beginning: ['Identifies basic problems', 'Asks simple questions'],
      developing: ['Compares options', 'Explains reasoning'],
      proficient: ['Evaluates evidence', 'Draws conclusions'],
      expert: ['Synthesizes complex information', 'Creates novel solutions'],
    },
  },
  'communication': {
    id: 'communication',
    label: 'Communication',
    description: 'Express ideas clearly in multiple formats',
    icon: '💬',
    color: 'bg-blue-100 text-blue-700',
    indicators: {
      beginning: ['Shares ideas verbally', 'Writes simple sentences'],
      developing: ['Organizes thoughts', 'Uses appropriate vocabulary'],
      proficient: ['Adapts to audience', 'Creates clear presentations'],
      expert: ['Persuades effectively', 'Masters multiple formats'],
    },
  },
  'collaboration': {
    id: 'collaboration',
    label: 'Collaboration',
    description: 'Work effectively with others toward shared goals',
    icon: '🤝',
    color: 'bg-amber-100 text-amber-700',
    indicators: {
      beginning: ['Participates in groups', 'Shares materials'],
      developing: ['Listens to others', 'Contributes ideas'],
      proficient: ['Resolves conflicts', 'Supports teammates'],
      expert: ['Leads teams', 'Facilitates group success'],
    },
  },
  'creativity': {
    id: 'creativity',
    label: 'Creativity',
    description: 'Generate original ideas and innovative solutions',
    icon: '🎨',
    color: 'bg-pink-100 text-pink-700',
    indicators: {
      beginning: ['Tries new things', 'Expresses preferences'],
      developing: ['Combines ideas', 'Experiments freely'],
      proficient: ['Creates original work', 'Iterates on designs'],
      expert: ['Innovates consistently', 'Inspires others'],
    },
  },
  'scientific-inquiry': {
    id: 'scientific-inquiry',
    label: 'Scientific Inquiry',
    description: 'Investigate the world through observation and experimentation',
    icon: '🔬',
    color: 'bg-emerald-100 text-emerald-700',
    indicators: {
      beginning: ['Observes carefully', 'Asks "why" questions'],
      developing: ['Forms hypotheses', 'Collects data'],
      proficient: ['Designs experiments', 'Analyzes results'],
      expert: ['Draws valid conclusions', 'Communicates findings'],
    },
  },
  'mathematical-reasoning': {
    id: 'mathematical-reasoning',
    label: 'Mathematical Reasoning',
    description: 'Apply mathematical concepts to solve real problems',
    icon: '📐',
    color: 'bg-indigo-100 text-indigo-700',
    indicators: {
      beginning: ['Recognizes patterns', 'Counts accurately'],
      developing: ['Applies operations', 'Estimates reasonably'],
      proficient: ['Solves multi-step problems', 'Uses data'],
      expert: ['Models complex situations', 'Proves solutions'],
    },
  },
  'digital-literacy': {
    id: 'digital-literacy',
    label: 'Digital Literacy',
    description: 'Use technology effectively and responsibly',
    icon: '💻',
    color: 'bg-cyan-100 text-cyan-700',
    indicators: {
      beginning: ['Uses basic tools', 'Follows digital safety rules'],
      developing: ['Creates digital content', 'Evaluates sources'],
      proficient: ['Codes solutions', 'Manages digital identity'],
      expert: ['Builds applications', 'Teaches others'],
    },
  },
  'self-direction': {
    id: 'self-direction',
    label: 'Self-Direction',
    description: 'Manage own learning and pursue goals independently',
    icon: '🎯',
    color: 'bg-orange-100 text-orange-700',
    indicators: {
      beginning: ['Follows routines', 'Completes assigned tasks'],
      developing: ['Sets simple goals', 'Manages time'],
      proficient: ['Plans projects', 'Reflects on progress'],
      expert: ['Drives own learning', 'Mentors others'],
    },
  },
};

export const getCompetencyProgress = (level: CompetencyLevel): number => {
  return COMPETENCY_LEVELS[level].order * 25;
};
