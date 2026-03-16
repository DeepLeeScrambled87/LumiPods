// Learning Platform Configuration

export interface LearningPlatform {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string;
  subjects: string[];
  skillLevels: ('foundation' | 'intermediate' | 'advanced' | 'pro')[];
  type: 'video' | 'interactive' | 'reading' | 'tool' | 'game';
}

export const LEARNING_PLATFORMS: LearningPlatform[] = [
  {
    id: 'khan-academy',
    name: 'Khan Academy',
    url: 'https://www.khanacademy.org',
    icon: '📚',
    description: 'Free courses in math, science, and more',
    subjects: ['math', 'science', 'language'],
    skillLevels: ['foundation', 'intermediate', 'advanced', 'pro'],
    type: 'video',
  },
  {
    id: 'ixl-french',
    name: 'IXL French',
    url: 'https://www.ixl.com/french',
    icon: '🇫🇷',
    description: 'Interactive French language practice',
    subjects: ['french'],
    skillLevels: ['foundation', 'intermediate', 'advanced'],
    type: 'interactive',
  },
  {
    id: 'duolingo',
    name: 'Duolingo',
    url: 'https://www.duolingo.com',
    icon: '🦉',
    description: 'Gamified language learning',
    subjects: ['french'],
    skillLevels: ['foundation', 'intermediate', 'advanced', 'pro'],
    type: 'game',
  },
  {
    id: 'lalilo',
    name: 'Lalilo',
    url: 'https://www.lalilo.com',
    icon: '📖',
    description: 'Early literacy development',
    subjects: ['language'],
    skillLevels: ['foundation'],
    type: 'interactive',
  },
  {
    id: 'synthesis',
    name: 'Synthesis',
    url: 'https://www.synthesis.com',
    icon: '🧠',
    description: 'Critical thinking games and challenges',
    subjects: ['math', 'coding'],
    skillLevels: ['intermediate', 'advanced', 'pro'],
    type: 'game',
  },
  {
    id: 'scratch',
    name: 'Scratch',
    url: 'https://scratch.mit.edu',
    icon: '🐱',
    description: 'Visual programming for beginners',
    subjects: ['coding'],
    skillLevels: ['foundation', 'intermediate'],
    type: 'tool',
  },
  {
    id: 'scratchjr',
    name: 'ScratchJr',
    url: 'https://www.scratchjr.org',
    icon: '🐣',
    description: 'Coding for young children',
    subjects: ['coding'],
    skillLevels: ['foundation'],
    type: 'tool',
  },
  {
    id: 'replit',
    name: 'Replit',
    url: 'https://replit.com',
    icon: '💻',
    description: 'Online code editor and IDE',
    subjects: ['coding'],
    skillLevels: ['advanced', 'pro'],
    type: 'tool',
  },
  {
    id: 'tinkercad',
    name: 'Tinkercad',
    url: 'https://www.tinkercad.com',
    icon: '🎨',
    description: '3D design and modeling',
    subjects: ['science', 'coding'],
    skillLevels: ['intermediate', 'advanced', 'pro'],
    type: 'tool',
  },
  {
    id: 'twinkl',
    name: 'Twinkl',
    url: 'https://www.twinkl.com',
    icon: '📄',
    description: 'Educational resources and printables',
    subjects: ['math', 'science', 'language'],
    skillLevels: ['foundation', 'intermediate', 'advanced'],
    type: 'reading',
  },
  {
    id: 'abc-mouse',
    name: 'ABC Mouse',
    url: 'https://www.abcmouse.com',
    icon: '🐭',
    description: 'Early learning activities',
    subjects: ['math', 'language'],
    skillLevels: ['foundation'],
    type: 'game',
  },
  {
    id: 'tinytap',
    name: 'TinyTap',
    url: 'https://www.tinytap.com',
    icon: '🎯',
    description: 'Interactive learning games',
    subjects: ['math', 'language', 'science'],
    skillLevels: ['foundation', 'intermediate'],
    type: 'game',
  },
];

export const getPlatformsBySubject = (subject: string): LearningPlatform[] => {
  return LEARNING_PLATFORMS.filter((p) => p.subjects.includes(subject));
};

export const getPlatformsBySkillLevel = (level: string): LearningPlatform[] => {
  return LEARNING_PLATFORMS.filter((p) => p.skillLevels.includes(level as any));
};

export const getPlatformById = (id: string): LearningPlatform | undefined => {
  return LEARNING_PLATFORMS.find((p) => p.id === id);
};
