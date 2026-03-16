// Cross-Subject Learning Blocks - Integrated curriculum with French vocabulary
// Each block connects Math, Science, Art, Tech with related French terms

export interface SubjectBlock {
  id: string;
  title: string;
  subject: 'mathematics' | 'science' | 'coding' | 'french' | 'art' | 'team';
  subjectLabel: string;
  icon: string;
  color: string;
  mode: 'independent' | 'guided';
  objectives: string[];
  duration: number;
  points: number;
  // Cross-subject connections
  frenchVocab?: { term: string; translation: string; pronunciation?: string }[];
  mathConcepts?: string[];
  scienceConcepts?: string[];
  // Skill level variations
  skillLevelVariations: {
    foundation: { objectives: string[]; duration: number };
    intermediate: { objectives: string[]; duration: number };
    advanced: { objectives: string[]; duration: number };
  };
}

export interface WeeklyPodBlocks {
  podId: string;
  podTitle: string;
  weekNumber: number;
  theme: string;
  blocks: SubjectBlock[];
}

// Flight Pod - Week 1 Cross-Subject Blocks
export const FLIGHT_POD_WEEK1: WeeklyPodBlocks = {
  podId: 'flight-pod',
  podTitle: 'Flight & Aerodynamics',
  weekNumber: 1,
  theme: 'Parachute Drop Test',
  blocks: [
    {
      id: 'flight-math-w1',
      title: 'Flight Mathematics',
      subject: 'mathematics',
      subjectLabel: 'Mathematics',
      icon: '📐',
      color: 'text-blue-600',
      mode: 'independent',
      objectives: ['Analyze drop data', 'Create charts', 'Calculate averages'],
      duration: 25,
      points: 10,
      frenchVocab: [
        { term: 'la vitesse', translation: 'speed', pronunciation: 'lah vee-tess' },
        { term: 'la distance', translation: 'distance', pronunciation: 'lah dee-stahns' },
        { term: 'le temps', translation: 'time', pronunciation: 'luh tahn' },
        { term: 'calculer', translation: 'to calculate', pronunciation: 'kal-koo-lay' },
      ],
      mathConcepts: ['Data analysis', 'Graphing', 'Averages', 'Measurement'],
      skillLevelVariations: {
        foundation: {
          objectives: ['Count objects up to 20', 'Recognize basic shapes'],
          duration: 15,
        },
        intermediate: {
          objectives: ['Calculate fall times', 'Measure distances'],
          duration: 20,
        },
        advanced: {
          objectives: ['Analyze drag forces', 'Create charts'],
          duration: 31,
        },
      },
    },
    {
      id: 'flight-science-w1',
      title: 'Aerodynamics Science',
      subject: 'science',
      subjectLabel: 'Science',
      icon: '🔬',
      color: 'text-green-600',
      mode: 'guided',
      objectives: ['Understand air resistance', 'Test parachute designs', 'Record observations'],
      duration: 25,
      points: 10,
      frenchVocab: [
        { term: "l'air", translation: 'air', pronunciation: 'lair' },
        { term: 'la résistance', translation: 'resistance', pronunciation: 'lah ray-zee-stahns' },
        { term: 'tomber', translation: 'to fall', pronunciation: 'tom-bay' },
        { term: 'flotter', translation: 'to float', pronunciation: 'flo-tay' },
      ],
      scienceConcepts: ['Air resistance', 'Gravity', 'Surface area', 'Drag'],
      skillLevelVariations: {
        foundation: {
          objectives: ['Observe how things fall', 'Feel air resistance'],
          duration: 19,
        },
        intermediate: {
          objectives: ['Understand air resistance', 'Test parachute designs'],
          duration: 25,
        },
        advanced: {
          objectives: ['Analyze drag forces', 'Optimize designs'],
          duration: 31,
        },
      },
    },
    {
      id: 'flight-coding-w1',
      title: 'Flight Coding',
      subject: 'coding',
      subjectLabel: 'Coding',
      icon: '💻',
      color: 'text-purple-600',
      mode: 'independent',
      objectives: ['Code simulations', 'Use variables', 'Build interactive games'],
      duration: 25,
      points: 10,
      frenchVocab: [
        { term: 'le code', translation: 'code', pronunciation: 'luh kohd' },
        { term: 'la variable', translation: 'variable', pronunciation: 'lah vah-ree-ahbl' },
        { term: 'la boucle', translation: 'loop', pronunciation: 'lah bookl' },
        { term: 'simuler', translation: 'to simulate', pronunciation: 'see-moo-lay' },
      ],
      skillLevelVariations: {
        foundation: {
          objectives: ['Sequence simple commands', 'Create animations'],
          duration: 15,
        },
        intermediate: {
          objectives: ['Build interactive games', 'Use loops'],
          duration: 20,
        },
        advanced: {
          objectives: ['Code simulations', 'Use variables'],
          duration: 25,
        },
      },
    },
    {
      id: 'flight-french-w1',
      title: 'French Aviation',
      subject: 'french',
      subjectLabel: 'French',
      icon: '🇫🇷',
      color: 'text-rose-600',
      mode: 'guided',
      objectives: ['Learn aviation vocabulary', 'Practice pronunciation', 'Build sentences'],
      duration: 19,
      points: 10,
      frenchVocab: [
        { term: "l'avion", translation: 'airplane', pronunciation: 'lah-vee-on' },
        { term: 'voler', translation: 'to fly', pronunciation: 'vo-lay' },
        { term: 'le parachute', translation: 'parachute', pronunciation: 'luh pa-ra-shoot' },
        { term: 'le pilote', translation: 'pilot', pronunciation: 'luh pee-lot' },
        { term: 'atterrir', translation: 'to land', pronunciation: 'ah-teh-reer' },
      ],
      skillLevelVariations: {
        foundation: {
          objectives: ['Learn 5 aviation words', 'Practice pronunciation'],
          duration: 11,
        },
        intermediate: {
          objectives: ['Build aviation vocabulary', 'Simple sentences'],
          duration: 15,
        },
        advanced: {
          objectives: ['Read aviation texts', 'Discuss in French'],
          duration: 19,
        },
      },
    },
    {
      id: 'flight-team-w1',
      title: 'Team Challenge',
      subject: 'team',
      subjectLabel: 'Team Building',
      icon: '🤝',
      color: 'text-amber-600',
      mode: 'guided',
      objectives: ['Collaborate on design', 'Give feedback', 'Lead a project'],
      duration: 25,
      points: 10,
      frenchVocab: [
        { term: "l'équipe", translation: 'team', pronunciation: 'lay-keep' },
        { term: 'ensemble', translation: 'together', pronunciation: 'on-sombl' },
        { term: 'aider', translation: 'to help', pronunciation: 'ay-day' },
        { term: 'partager', translation: 'to share', pronunciation: 'par-ta-zhay' },
      ],
      skillLevelVariations: {
        foundation: {
          objectives: ['Work together', 'Share materials'],
          duration: 15,
        },
        intermediate: {
          objectives: ['Collaborate on design', 'Give feedback'],
          duration: 20,
        },
        advanced: {
          objectives: ['Lead a project', 'Mentor others'],
          duration: 25,
        },
      },
    },
  ],
};

// Water Pod - Week 1 Cross-Subject Blocks
export const WATER_POD_WEEK1: WeeklyPodBlocks = {
  podId: 'water-pod',
  podTitle: 'Water & Filtration',
  weekNumber: 1,
  theme: 'Water Cycle & Filtration',
  blocks: [
    {
      id: 'water-math-w1',
      title: 'Water Mathematics',
      subject: 'mathematics',
      subjectLabel: 'Mathematics',
      icon: '📐',
      color: 'text-blue-600',
      mode: 'independent',
      objectives: ['Measure water volumes', 'Calculate flow rates', 'Graph filtration data'],
      duration: 25,
      points: 10,
      frenchVocab: [
        { term: 'le litre', translation: 'liter', pronunciation: 'luh lee-truh' },
        { term: 'mesurer', translation: 'to measure', pronunciation: 'meh-zoo-ray' },
        { term: 'le volume', translation: 'volume', pronunciation: 'luh vo-loom' },
      ],
      mathConcepts: ['Volume measurement', 'Fractions', 'Data recording', 'Percentages'],
      skillLevelVariations: {
        foundation: { objectives: ['Count and pour', 'Compare amounts'], duration: 15 },
        intermediate: { objectives: ['Measure volumes', 'Record data'], duration: 20 },
        advanced: { objectives: ['Calculate flow rates', 'Graph results'], duration: 25 },
      },
    },
    {
      id: 'water-science-w1',
      title: 'Water Science',
      subject: 'science',
      subjectLabel: 'Science',
      icon: '🔬',
      color: 'text-cyan-600',
      mode: 'guided',
      objectives: ['Understand water cycle', 'Build filtration system', 'Test water quality'],
      duration: 30,
      points: 10,
      frenchVocab: [
        { term: "l'eau", translation: 'water', pronunciation: 'loh' },
        { term: 'filtrer', translation: 'to filter', pronunciation: 'feel-tray' },
        { term: 'propre', translation: 'clean', pronunciation: 'propr' },
        { term: 'sale', translation: 'dirty', pronunciation: 'sal' },
      ],
      scienceConcepts: ['Water cycle', 'Filtration', 'Evaporation', 'Condensation'],
      skillLevelVariations: {
        foundation: { objectives: ['Observe water states', 'Simple filtering'], duration: 20 },
        intermediate: { objectives: ['Build filter', 'Test results'], duration: 25 },
        advanced: { objectives: ['Design system', 'Analyze quality'], duration: 30 },
      },
    },
  ],
};

// Get blocks for a specific skill level
export function getBlocksForSkillLevel(
  blocks: SubjectBlock[],
  skillLevel: 'foundation' | 'intermediate' | 'advanced'
): SubjectBlock[] {
  return blocks.map(block => ({
    ...block,
    objectives: block.skillLevelVariations[skillLevel].objectives,
    duration: block.skillLevelVariations[skillLevel].duration,
  }));
}

// Get all weekly pod blocks
export const ALL_WEEKLY_POD_BLOCKS: WeeklyPodBlocks[] = [
  FLIGHT_POD_WEEK1,
  WATER_POD_WEEK1,
];

// Partner platform sessions that can substitute pod blocks
export interface PartnerSession {
  platformId: string;
  platformName: string;
  icon: string;
  subject: string;
  estimatedDuration: number;
  url: string;
  trackingEnabled: boolean;
}

export const PARTNER_SESSIONS: PartnerSession[] = [
  { platformId: 'khan-math', platformName: 'Khan Academy', icon: '📚', subject: 'Mathematics', estimatedDuration: 30, url: 'https://khanacademy.org/math', trackingEnabled: true },
  { platformId: 'khan-science', platformName: 'Khan Academy', icon: '📚', subject: 'Science', estimatedDuration: 30, url: 'https://khanacademy.org/science', trackingEnabled: true },
  { platformId: 'synthesis', platformName: 'Synthesis Tutor', icon: '🧠', subject: 'Critical Thinking', estimatedDuration: 45, url: 'https://synthesis.com', trackingEnabled: true },
  { platformId: 'brilliant', platformName: 'Brilliant', icon: '✨', subject: 'Math & Science', estimatedDuration: 20, url: 'https://brilliant.org', trackingEnabled: true },
  { platformId: 'duolingo', platformName: 'Duolingo', icon: '🦉', subject: 'French', estimatedDuration: 15, url: 'https://duolingo.com', trackingEnabled: true },
  { platformId: 'scratch', platformName: 'Scratch', icon: '🐱', subject: 'Coding', estimatedDuration: 30, url: 'https://scratch.mit.edu', trackingEnabled: true },
  { platformId: 'code-org', platformName: 'Code.org', icon: '💻', subject: 'Coding', estimatedDuration: 30, url: 'https://code.org', trackingEnabled: true },
];
