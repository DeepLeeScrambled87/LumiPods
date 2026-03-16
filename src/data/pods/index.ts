// Pod data exports
export { flightPod } from './flight';
export { waterPod } from './water';
export { codingPod } from './coding';
export { energyPod } from './energy';
export { atomicFoundationsPod } from './atomicFoundations';
export { humanBodySystemsPod } from './humanBodySystems';
export {
  algebraDataSimulationPod,
  modellingCalculusMlPod,
  numberSensePatternsPod,
  ratiosGraphsModelingPod,
  MATHS_PODS,
} from './maths';
export { FRENCH_PODS, CYCLE_2_COMPETENCIES, CYCLE_3_COMPETENCIES } from './french';

import { flightPod } from './flight';
import { waterPod } from './water';
import { codingPod } from './coding';
import { energyPod } from './energy';
import { atomicFoundationsPod } from './atomicFoundations';
import { humanBodySystemsPod } from './humanBodySystems';
import { MATHS_PODS } from './maths';
import { FRENCH_PODS } from './french';
import { YEARLY_PODS } from '../yearlyPods';
import type { Pod } from '../../types/pod';
import type { YearlyPod } from '../yearlyPods';

// Core STEM pods
export const CORE_PODS: Pod[] = [
  flightPod,
  waterPod,
  codingPod,
  energyPod,
  atomicFoundationsPod,
  humanBodySystemsPod,
];

export const MATHS_CORE_PODS: Pod[] = [...MATHS_PODS];

// Language pods
export const LANGUAGE_PODS: Pod[] = [...FRENCH_PODS];

// Convert yearly pods to Pod format for display
const convertYearlyPodToPod = (yearlyPod: YearlyPod): Pod => {
  // Map yearly pod subjects to appropriate theme
  const getTheme = (subjects: string[]): Pod['theme'] => {
    const subjectStr = subjects.join(' ').toLowerCase();
    if (subjectStr.includes('coding') || subjectStr.includes('algorithm')) return 'coding';
    if (subjectStr.includes('chemistry') || subjectStr.includes('atom') || subjectStr.includes('matter')) return 'matter';
    if (subjectStr.includes('ecology') || subjectStr.includes('sustainability') || subjectStr.includes('environment')) return 'environment';
    if (subjectStr.includes('art') || subjectStr.includes('design') || subjectStr.includes('creative')) return 'arts';
    if (subjectStr.includes('biology') || subjectStr.includes('botany') || subjectStr.includes('chemistry')) return 'water';
    if (subjectStr.includes('physics') || subjectStr.includes('energy')) return 'energy';
    if (subjectStr.includes('language') || subjectStr.includes('communication')) return 'language';
    if (subjectStr.includes('business') || subjectStr.includes('economics')) return 'business';
    return 'environment'; // default for general topics
  };

  return {
    id: yearlyPod.id,
    title: yearlyPod.title,
    description: yearlyPod.drivingQuestion,
    theme: getTheme(yearlyPod.subjects),
    skillLevel: yearlyPod.autonomyLevel === 'structured' ? 'foundation' : 
                yearlyPod.autonomyLevel === 'guided' ? 'intermediate' : 'advanced',
    duration: 4,
    milestone: yearlyPod.exhibitionIdea,
    learningObjectives: [
      yearlyPod.drivingQuestion,
      ...yearlyPod.subjects.map(s => `Explore ${s}`),
      ...yearlyPod.fieldworkIdeas.slice(0, 2),
    ],
    artifactTypes: ['project', 'presentation', 'documentation'],
    weeks: [],
  };
};

// Yearly curriculum pods (12 months)
export const YEARLY_CURRICULUM_PODS: Pod[] = YEARLY_PODS.map(convertYearlyPodToPod);

// All pods combined
export const ALL_PODS: Pod[] = [...CORE_PODS, ...MATHS_CORE_PODS, ...LANGUAGE_PODS, ...YEARLY_CURRICULUM_PODS];

export const getPodById = (id: string): Pod | undefined => {
  return ALL_PODS.find((pod) => pod.id === id);
};

export const getPodByTheme = (theme: string): Pod[] => {
  return ALL_PODS.filter((pod) => pod.theme === theme);
};

export const getPodsBySkillLevel = (level: string): Pod[] => {
  return ALL_PODS.filter((pod) => pod.skillLevel === level);
};

export const POD_CATEGORIES = [
  { id: 'stem', name: 'STEM & Science', icon: '🔬', pods: CORE_PODS },
  { id: 'maths', name: 'Maths & Modelling', icon: '📐', pods: MATHS_CORE_PODS },
  { id: 'language', name: 'Languages', icon: '🌍', pods: LANGUAGE_PODS },
  { id: 'yearly', name: 'Year-Round Curriculum', icon: '📅', pods: YEARLY_CURRICULUM_PODS },
] as const;
