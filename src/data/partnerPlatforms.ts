// Partner Platforms - External learning resources we spotlight/integrate
// These can be scheduled into daily blocks and tracked

export type PlatformCategory = 'coding' | 'math' | 'ai' | 'science' | 'language' | 'critical-thinking' | 'creative';

export interface PartnerPlatform {
  id: string;
  name: string;
  url: string;
  logo?: string;
  icon: string;
  description: string;
  tagline: string;
  category: PlatformCategory[];
  skillLevels: ('foundation' | 'intermediate' | 'advanced' | 'pro')[];
  ageRange: string;
  isFree: boolean;
  hasFreeTier: boolean;
  featuredCourses?: FeaturedCourse[];
  integrationLevel: 'link' | 'embed' | 'api'; // How deeply we integrate
  partnerStatus: 'curated' | 'partner' | 'sponsored';
}

export interface FeaturedCourse {
  id: string;
  title: string;
  url: string;
  duration: string;
  description: string;
  skillLevel: 'foundation' | 'intermediate' | 'advanced' | 'pro';
}

export const PARTNER_PLATFORMS: PartnerPlatform[] = [
  {
    id: 'synthesis',
    name: 'Synthesis Tutor',
    url: 'https://www.synthesis.com',
    icon: '🧠',
    description: 'AI-powered tutoring with Socratic method. Critical thinking games and challenges.',
    tagline: 'Think like a genius',
    category: ['critical-thinking', 'math'],
    skillLevels: ['intermediate', 'advanced', 'pro'],
    ageRange: '8-14',
    isFree: false,
    hasFreeTier: false,
    integrationLevel: 'link',
    partnerStatus: 'curated',
    featuredCourses: [
      { id: 'syn-1', title: 'Superhuman Problem Solving', url: 'https://synthesis.com/courses/problem-solving', duration: '8 weeks', description: 'Learn to break down complex problems', skillLevel: 'intermediate' },
    ],
  },
  {
    id: 'khan-academy',
    name: 'Khan Academy',
    url: 'https://www.khanacademy.org',
    icon: '📚',
    description: 'Free world-class education. Math, science, computing, and more.',
    tagline: 'You can learn anything',
    category: ['math', 'science', 'coding'],
    skillLevels: ['foundation', 'intermediate', 'advanced', 'pro'],
    ageRange: '4-18+',
    isFree: true,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
    featuredCourses: [
      { id: 'khan-1', title: 'Rediscovering Math', url: 'https://khanacademy.org/math', duration: 'Self-paced', description: 'Master math from arithmetic to calculus', skillLevel: 'foundation' },
      { id: 'khan-2', title: 'Physics Fundamentals', url: 'https://khanacademy.org/science/physics', duration: 'Self-paced', description: 'Understand how the universe works', skillLevel: 'intermediate' },
    ],
  },
  {
    id: 'code-org',
    name: 'Code.org',
    url: 'https://code.org',
    icon: '💻',
    description: 'Learn computer science. Change the world. Hour of Code and beyond.',
    tagline: 'Anybody can learn',
    category: ['coding'],
    skillLevels: ['foundation', 'intermediate'],
    ageRange: '4-18',
    isFree: true,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
    featuredCourses: [
      { id: 'code-1', title: 'Hour of Code', url: 'https://code.org/hourofcode', duration: '1 hour', description: 'Your first step into coding', skillLevel: 'foundation' },
      { id: 'code-2', title: 'CS Fundamentals', url: 'https://code.org/educate/curriculum/cs-fundamentals', duration: '20 hours', description: 'Complete intro to computer science', skillLevel: 'foundation' },
    ],
  },
  {
    id: 'deeplearning-ai',
    name: 'DeepLearning.AI',
    url: 'https://www.deeplearning.ai',
    icon: '🤖',
    description: 'AI education from Andrew Ng. Learn machine learning and deep learning.',
    tagline: 'AI is the new electricity',
    category: ['ai', 'coding'],
    skillLevels: ['advanced', 'pro'],
    ageRange: '14+',
    isFree: false,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
    featuredCourses: [
      { id: 'dl-1', title: 'AI for Everyone', url: 'https://www.deeplearning.ai/courses/ai-for-everyone/', duration: '6 hours', description: 'Non-technical intro to AI', skillLevel: 'advanced' },
      { id: 'dl-2', title: 'ChatGPT Prompt Engineering', url: 'https://www.deeplearning.ai/short-courses/', duration: '1 hour', description: 'Master AI prompting', skillLevel: 'advanced' },
    ],
  },
  {
    id: 'kaggle',
    name: 'Kaggle',
    url: 'https://www.kaggle.com',
    icon: '📊',
    description: 'Data science community. Competitions, datasets, and notebooks.',
    tagline: 'Your Machine Learning and Data Science Community',
    category: ['ai', 'coding', 'math'],
    skillLevels: ['advanced', 'pro'],
    ageRange: '13+',
    isFree: true,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
    featuredCourses: [
      { id: 'kag-1', title: 'Intro to Machine Learning', url: 'https://www.kaggle.com/learn/intro-to-machine-learning', duration: '3 hours', description: 'Build your first ML model', skillLevel: 'advanced' },
      { id: 'kag-2', title: 'Python', url: 'https://www.kaggle.com/learn/python', duration: '5 hours', description: 'Essential Python for data science', skillLevel: 'intermediate' },
    ],
  },
  {
    id: 'scratch',
    name: 'Scratch',
    url: 'https://scratch.mit.edu',
    icon: '🐱',
    description: 'Create stories, games, and animations. Share with others around the world.',
    tagline: 'Imagine, Program, Share',
    category: ['coding', 'creative'],
    skillLevels: ['foundation', 'intermediate'],
    ageRange: '8-16',
    isFree: true,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
  },
  {
    id: 'brilliant',
    name: 'Brilliant',
    url: 'https://brilliant.org',
    icon: '✨',
    description: 'Learn by doing. Interactive courses in math, science, and computer science.',
    tagline: 'Learn to think',
    category: ['math', 'science', 'coding'],
    skillLevels: ['intermediate', 'advanced', 'pro'],
    ageRange: '10+',
    isFree: false,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
  },
  {
    id: 'duolingo',
    name: 'Duolingo',
    url: 'https://www.duolingo.com',
    icon: '🦉',
    description: 'Learn a language for free. Forever.',
    tagline: 'The free, fun, and effective way to learn a language',
    category: ['language'],
    skillLevels: ['foundation', 'intermediate', 'advanced', 'pro'],
    ageRange: '4+',
    isFree: true,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
  },
  {
    id: 'google-colab',
    name: 'Google Colab',
    url: 'https://colab.research.google.com',
    icon: '🔬',
    description: 'Free Jupyter notebooks in the cloud with GPU access. Perfect for ML experiments.',
    tagline: 'Code, run, and share ML notebooks',
    category: ['ai', 'coding'],
    skillLevels: ['intermediate', 'advanced', 'pro'],
    ageRange: '12+',
    isFree: true,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
    featuredCourses: [
      { id: 'colab-1', title: 'Welcome to Colab', url: 'https://colab.research.google.com/notebooks/intro.ipynb', duration: '30 min', description: 'Get started with Colab notebooks', skillLevel: 'intermediate' },
      { id: 'colab-2', title: 'ML Crash Course', url: 'https://colab.research.google.com/github/google/eng-edu/blob/main/ml/cc/exercises/intro_to_ml.ipynb', duration: '2 hours', description: 'Google ML fundamentals', skillLevel: 'advanced' },
    ],
  },
  {
    id: 'pytorch',
    name: 'PyTorch',
    url: 'https://pytorch.org',
    icon: '🔥',
    description: 'Open source ML framework. From research to production with dynamic computation.',
    tagline: 'From Research to Production',
    category: ['ai', 'coding'],
    skillLevels: ['advanced', 'pro'],
    ageRange: '14+',
    isFree: true,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
    featuredCourses: [
      { id: 'pt-1', title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/', duration: 'Self-paced', description: 'Official PyTorch learning path', skillLevel: 'advanced' },
      { id: 'pt-2', title: '60 Minute Blitz', url: 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html', duration: '1 hour', description: 'Quick intro to PyTorch', skillLevel: 'advanced' },
    ],
  },
  {
    id: 'notebooklm',
    name: 'NotebookLM',
    url: 'https://notebooklm.google.com',
    icon: '📓',
    description: 'AI-powered research assistant. Upload documents and have conversations with your sources.',
    tagline: 'Your AI research companion',
    category: ['ai', 'critical-thinking'],
    skillLevels: ['intermediate', 'advanced', 'pro'],
    ageRange: '10+',
    isFree: true,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
    featuredCourses: [
      { id: 'nlm-1', title: 'Getting Started', url: 'https://notebooklm.google.com', duration: '15 min', description: 'Upload your first source and start exploring', skillLevel: 'intermediate' },
    ],
  },
  {
    id: 'antigravity-ide',
    name: 'Antigravity IDE',
    url: 'https://antigravity.dev',
    icon: '🚀',
    description: 'AI-native development environment. Build apps with natural language and visual tools.',
    tagline: 'Code at the speed of thought',
    category: ['ai', 'coding'],
    skillLevels: ['intermediate', 'advanced', 'pro'],
    ageRange: '12+',
    isFree: false,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
    featuredCourses: [
      { id: 'ag-1', title: 'Build Your First App', url: 'https://antigravity.dev/learn', duration: '30 min', description: 'Create an app with AI assistance', skillLevel: 'intermediate' },
    ],
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    url: 'https://huggingface.co',
    icon: '🤗',
    description: 'The AI community. Models, datasets, and spaces for machine learning.',
    tagline: 'The AI community building the future',
    category: ['ai', 'coding'],
    skillLevels: ['advanced', 'pro'],
    ageRange: '14+',
    isFree: true,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
    featuredCourses: [
      { id: 'hf-1', title: 'NLP Course', url: 'https://huggingface.co/learn/nlp-course', duration: '20 hours', description: 'Master NLP with Transformers', skillLevel: 'pro' },
      { id: 'hf-2', title: 'Deep RL Course', url: 'https://huggingface.co/learn/deep-rl-course', duration: '15 hours', description: 'Learn reinforcement learning', skillLevel: 'pro' },
    ],
  },
  {
    id: 'replit',
    name: 'Replit',
    url: 'https://replit.com',
    icon: '⚡',
    description: 'Build software collaboratively in the browser. AI-powered coding assistant included.',
    tagline: 'Build software faster',
    category: ['coding', 'ai'],
    skillLevels: ['foundation', 'intermediate', 'advanced', 'pro'],
    ageRange: '8+',
    isFree: false,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
    featuredCourses: [
      { id: 'rep-1', title: '100 Days of Code', url: 'https://replit.com/learn/100-days-of-python', duration: '100 days', description: 'Learn Python through daily projects', skillLevel: 'foundation' },
    ],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    url: 'https://cursor.sh',
    icon: '🖱️',
    description: 'The AI-first code editor. Built for pair programming with AI.',
    tagline: 'Build software faster with AI',
    category: ['coding', 'ai'],
    skillLevels: ['intermediate', 'advanced', 'pro'],
    ageRange: '12+',
    isFree: false,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    url: 'https://github.com/features/copilot',
    icon: '🐙',
    description: 'AI pair programmer. Get suggestions for whole lines or entire functions.',
    tagline: 'Your AI pair programmer',
    category: ['coding', 'ai'],
    skillLevels: ['intermediate', 'advanced', 'pro'],
    ageRange: '13+',
    isFree: false,
    hasFreeTier: true,
    integrationLevel: 'link',
    partnerStatus: 'curated',
  },
];

export const getPlatformsByCategory = (category: PlatformCategory): PartnerPlatform[] => {
  return PARTNER_PLATFORMS.filter((p) => p.category.includes(category));
};

export const getPlatformsBySkillLevel = (level: string): PartnerPlatform[] => {
  return PARTNER_PLATFORMS.filter((p) => p.skillLevels.includes(level as any));
};

export const getFreePlatforms = (): PartnerPlatform[] => {
  return PARTNER_PLATFORMS.filter((p) => p.isFree || p.hasFreeTier);
};
