// VR Learning Sessions - Meta Quest Integration
// Twice weekly immersive learning experiences

export interface VRApp {
  id: string;
  name: string;
  platform: 'meta-quest' | 'meta-quest-2' | 'meta-quest-3' | 'meta-quest-pro';
  category: 'education' | 'exploration' | 'creativity' | 'fitness' | 'language' | 'science' | 'history';
  ageRange: string;
  description: string;
  learningObjectives: string[];
  duration: string;
  isFree: boolean;
  storeUrl: string;
  icon: string;
}

export interface VRSession {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  time: string;
  duration: number; // minutes
  appId: string;
  title: string;
  description: string;
  learnerIds?: string[]; // If empty, all learners
}

// Curated VR Apps for Education
export const VR_APPS: VRApp[] = [
  {
    id: 'wander',
    name: 'Wander',
    platform: 'meta-quest-2',
    category: 'exploration',
    ageRange: '6+',
    description: 'Explore the world in VR using Google Street View. Visit any place on Earth!',
    learningObjectives: ['Geography', 'Cultural awareness', 'Virtual travel', 'Landmark recognition'],
    duration: '15-30 min',
    isFree: false,
    storeUrl: 'https://www.meta.com/experiences/2078376005587859/',
    icon: '🌍',
  },
  {
    id: 'national-geographic-explore',
    name: 'National Geographic Explore VR',
    platform: 'meta-quest-2',
    category: 'exploration',
    ageRange: '8+',
    description: 'Explore Antarctica and Machu Picchu with National Geographic explorers.',
    learningObjectives: ['Natural science', 'History', 'Geography', 'Environmental awareness'],
    duration: '20-40 min',
    isFree: false,
    storeUrl: 'https://www.meta.com/experiences/2046607608728563/',
    icon: '🏔️',
  },
  {
    id: 'anne-frank-house',
    name: 'Anne Frank House VR',
    platform: 'meta-quest-2',
    category: 'history',
    ageRange: '10+',
    description: 'Walk through the Secret Annex where Anne Frank and her family hid during WWII.',
    learningObjectives: ['WWII history', 'Holocaust education', 'Empathy building', 'Historical preservation'],
    duration: '25 min',
    isFree: true,
    storeUrl: 'https://www.meta.com/experiences/1958100334295482/',
    icon: '📖',
  },
  {
    id: 'titans-of-space',
    name: 'Titans of Space PLUS',
    platform: 'meta-quest-2',
    category: 'science',
    ageRange: '6+',
    description: 'Tour our solar system and beyond. See planets, moons, and stars up close.',
    learningObjectives: ['Astronomy', 'Space science', 'Scale and proportion', 'Scientific curiosity'],
    duration: '20-45 min',
    isFree: false,
    storeUrl: 'https://www.meta.com/experiences/2359857214088498/',
    icon: '🚀',
  },
  {
    id: 'mondly-vr',
    name: 'Mondly: Learn Languages in VR',
    platform: 'meta-quest-2',
    category: 'language',
    ageRange: '8+',
    description: 'Practice French and 30+ languages in immersive real-world scenarios.',
    learningObjectives: ['French vocabulary', 'Conversational practice', 'Pronunciation', 'Cultural context'],
    duration: '15-30 min',
    isFree: false,
    storeUrl: 'https://www.meta.com/experiences/2aboratory192920/',
    icon: '🗣️',
  },
  {
    id: 'gravity-sketch',
    name: 'Gravity Sketch',
    platform: 'meta-quest-2',
    category: 'creativity',
    ageRange: '10+',
    description: '3D design and creation tool. Build anything you can imagine in VR.',
    learningObjectives: ['3D design', 'Spatial reasoning', 'Creativity', 'Engineering concepts'],
    duration: '30-60 min',
    isFree: true,
    storeUrl: 'https://www.meta.com/experiences/1587090851394426/',
    icon: '✏️',
  },
  {
    id: 'tilt-brush',
    name: 'Open Brush (Tilt Brush)',
    platform: 'meta-quest-2',
    category: 'creativity',
    ageRange: '6+',
    description: 'Paint in 3D space with virtual reality. Create immersive artwork.',
    learningObjectives: ['Art expression', 'Spatial creativity', 'Color theory', 'Digital art'],
    duration: '20-45 min',
    isFree: true,
    storeUrl: 'https://www.meta.com/experiences/3600360710032222/',
    icon: '🎨',
  },
  {
    id: 'the-body-vr',
    name: 'The Body VR: Journey Inside a Cell',
    platform: 'meta-quest-2',
    category: 'science',
    ageRange: '8+',
    description: 'Shrink down and travel inside the human body to learn about cells and blood.',
    learningObjectives: ['Biology', 'Cell structure', 'Human anatomy', 'Scientific visualization'],
    duration: '15 min',
    isFree: true,
    storeUrl: 'https://www.meta.com/experiences/1560820867302524/',
    icon: '🔬',
  },
  {
    id: 'ocean-rift',
    name: 'Ocean Rift',
    platform: 'meta-quest-2',
    category: 'science',
    ageRange: '6+',
    description: 'Underwater safari park. Swim with dolphins, sharks, and prehistoric creatures.',
    learningObjectives: ['Marine biology', 'Ocean ecosystems', 'Animal behavior', 'Conservation'],
    duration: '20-40 min',
    isFree: false,
    storeUrl: 'https://www.meta.com/experiences/1577126062339671/',
    icon: '🐋',
  },
  {
    id: 'beat-saber',
    name: 'Beat Saber',
    platform: 'meta-quest-2',
    category: 'fitness',
    ageRange: '6+',
    description: 'Rhythm game that gets you moving. Great for brain breaks and coordination.',
    learningObjectives: ['Rhythm and timing', 'Physical coordination', 'Exercise', 'Focus'],
    duration: '15-30 min',
    isFree: false,
    storeUrl: 'https://www.meta.com/experiences/2448060205267927/',
    icon: '⚔️',
  },
  {
    id: 'immersed',
    name: 'Immersed',
    platform: 'meta-quest-2',
    category: 'education',
    ageRange: '12+',
    description: 'Virtual workspace for focused learning. Multiple screens in VR.',
    learningObjectives: ['Focus and productivity', 'Digital workspace', 'Self-directed learning'],
    duration: '30-60 min',
    isFree: true,
    storeUrl: 'https://www.meta.com/experiences/2849273531812512/',
    icon: '💻',
  },
  {
    id: 'first-steps',
    name: 'First Steps',
    platform: 'meta-quest-2',
    category: 'education',
    ageRange: '6+',
    description: 'Introduction to VR. Perfect for first-time users to learn controls.',
    learningObjectives: ['VR basics', 'Hand tracking', 'Spatial awareness', 'Technology literacy'],
    duration: '10-15 min',
    isFree: true,
    storeUrl: 'https://www.meta.com/experiences/3630919580410779/',
    icon: '👋',
  },
];

// Default VR schedule - twice weekly
export const DEFAULT_VR_SCHEDULE: VRSession[] = [
  {
    id: 'vr-tuesday',
    dayOfWeek: 2, // Tuesday
    time: '14:00',
    duration: 30,
    appId: 'wander',
    title: 'VR Exploration Tuesday',
    description: 'Explore a new location around the world',
  },
  {
    id: 'vr-friday',
    dayOfWeek: 5, // Friday
    time: '14:00',
    duration: 30,
    appId: 'titans-of-space',
    title: 'VR Discovery Friday',
    description: 'Science and discovery in virtual reality',
  },
];

// Get VR app by ID
export const getVRApp = (appId: string): VRApp | undefined => {
  return VR_APPS.find((app) => app.id === appId);
};

// Get apps by category
export const getVRAppsByCategory = (category: VRApp['category']): VRApp[] => {
  return VR_APPS.filter((app) => app.category === category);
};

// Get free apps
export const getFreeVRApps = (): VRApp[] => {
  return VR_APPS.filter((app) => app.isFree);
};

// Get age-appropriate apps
export const getAgeAppropriateVRApps = (age: number): VRApp[] => {
  return VR_APPS.filter((app) => {
    const minAge = parseInt(app.ageRange.replace('+', ''));
    return age >= minAge;
  });
};

// Suggested VR rotation by pod theme
export const VR_POD_SUGGESTIONS: Record<string, string[]> = {
  'pod-community': ['wander', 'anne-frank-house'],
  'pod-migration': ['wander', 'national-geographic-explore'],
  'pod-food': ['wander', 'the-body-vr'],
  'pod-light': ['titans-of-space', 'gravity-sketch'],
  'pod-time': ['titans-of-space', 'anne-frank-house'],
  'pod-communication': ['mondly-vr', 'immersed'],
  'pod-patterns': ['gravity-sketch', 'tilt-brush'],
  'pod-sustainability': ['national-geographic-explore', 'ocean-rift'],
  'pod-shelter': ['gravity-sketch', 'wander'],
  'pod-water': ['ocean-rift', 'national-geographic-explore'],
  'pod-power': ['anne-frank-house', 'wander'],
  'pod-survival': ['national-geographic-explore', 'the-body-vr'],
};
