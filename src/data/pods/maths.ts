import {
  MATHS_ADVANCED_RAIL,
  MATHS_FOUNDATION_RAIL,
  MATHS_INTERMEDIATE_RAIL,
  MATHS_PRO_RAIL,
} from '../foundationalRails';
import type { Pod } from '../../types/pod';
import type { FoundationalRailTrack } from '../../types/foundationalRails';

const createWeekMaterials = (track: FoundationalRailTrack, weekNumber: number) =>
  track.toolStages
    .slice(0, 2)
    .flatMap((stage) => stage.tools.slice(0, 2))
    .slice(0, 3)
    .map((tool, index) => ({
      id: `${track.id}-week-${weekNumber}-mat-${index + 1}`,
      name: tool,
      quantity: '1',
      category: 'basic' as const,
    }));

const createMathsPod = (config: {
  id: string;
  title: string;
  description: string;
  milestone: string;
  artifactTypes: string[];
  track: FoundationalRailTrack;
}): Pod => ({
  id: config.id,
  title: config.title,
  theme: 'maths',
  description: config.description,
  milestone: config.milestone,
  artifactTypes: config.artifactTypes,
  learningObjectives: config.track.objectives,
  duration: config.track.modules.length,
  skillLevel: config.track.skillLevel,
  materials: config.track.toolStages.flatMap((stage) => stage.tools).slice(0, 6),
  weeks: config.track.modules.map((module, index) => ({
    weekNumber: index + 1,
    title: module.title,
    focus: module.summary,
    milestone: `Use ${module.title.toLowerCase()} to explain or solve one real-world maths problem.`,
    days: [],
    materials: createWeekMaterials(config.track, index + 1),
    vocabulary: [],
  })),
});

export const numberSensePatternsPod = createMathsPod({
  id: 'pod-number-sense-patterns',
  title: 'Number Sense & Pattern Power',
  description:
    'Build secure maths foundations through number structure, reversible thinking, games, visual models, and real-world pattern spotting.',
  milestone:
    'Create a teach-back game or visual model that shows how number patterns and operations really work.',
  artifactTypes: ['Maths game', 'Visual model', 'Explainer poster', 'Worked notebook page'],
  track: MATHS_FOUNDATION_RAIL,
});

export const ratiosGraphsModelingPod = createMathsPod({
  id: 'pod-ratios-graphs-modelling',
  title: 'Ratios, Graphs & Modelling',
  description:
    'Use fractions, ratios, variables, graphs, and early data tools to explain how maths helps us compare, predict, and model the world.',
  milestone:
    'Publish a mini maths data story or model that connects numbers to a real-life system or question.',
  artifactTypes: ['Data story', 'Graph board', 'Spreadsheet model', 'Maths journal'],
  track: MATHS_INTERMEDIATE_RAIL,
});

export const algebraDataSimulationPod = createMathsPod({
  id: 'pod-algebra-data-simulation',
  title: 'Algebra, Data & Simulation Studio',
  description:
    'Use algebra, geometry, probability, and digital tools to model change, build simulations, and solve richer problems with evidence.',
  milestone:
    'Build an applied maths showcase using algebra, data, and a simulation or graphing tool.',
  artifactTypes: ['Simulation screenshot', 'Graph portfolio', 'Project report', 'Maths presentation'],
  track: MATHS_ADVANCED_RAIL,
});

export const modellingCalculusMlPod = createMathsPod({
  id: 'pod-modelling-calculus-ml',
  title: 'Modelling, Calculus & ML Foundations',
  description:
    'Treat maths like a professional tool for modelling systems, reasoning with data, exploring calculus, and building early ML intuition.',
  milestone:
    'Publish a portfolio-quality notebook, briefing, or model that explains a real problem through advanced maths.',
  artifactTypes: ['Notebook analysis', 'Regression report', 'Optimization brief', 'Technical presentation'],
  track: MATHS_PRO_RAIL,
});

export const MATHS_PODS: Pod[] = [
  numberSensePatternsPod,
  ratiosGraphsModelingPod,
  algebraDataSimulationPod,
  modellingCalculusMlPod,
];
