import {
  MATHS_ADVANCED_RAIL,
  MATHS_FOUNDATION_RAIL,
  MATHS_INTERMEDIATE_RAIL,
  MATHS_PRO_RAIL,
} from '../foundationalRails';
import type {
  AgeBandGuidance,
  CanonicalMiniLesson,
  PodCurriculum,
  ProjectBrief,
  ProjectTemplate,
  QuizQuestion,
  SkillLevelId,
  SubjectTag,
  WeekCurriculum,
} from '../../types/curriculum';
import type { FoundationalRailModule, FoundationalRailTrack } from '../../types/foundationalRails';

const ALL_LEVELS: SkillLevelId[] = ['foundation', 'intermediate', 'advanced', 'pro'];
const DAY_SEQUENCE: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

const getWeekSubjects = (skillLevel: SkillLevelId): SubjectTag[] => [
  'math',
  'integration',
  ...(skillLevel === 'advanced' || skillLevel === 'pro' ? (['tech'] as SubjectTag[]) : []),
];

const referencesForLevel = (skillLevel: SkillLevelId) => {
  const shared = [
    {
      id: `maths-ref-desmos-${skillLevel}`,
      title: 'Desmos Graphing Calculator',
      url: 'https://www.desmos.com/calculator',
      category: 'simulation' as const,
      note: 'Use graphing and visual pattern tools to test maths ideas quickly.',
    },
    {
      id: `maths-ref-geogebra-${skillLevel}`,
      title: 'GeoGebra',
      url: 'https://www.geogebra.org/',
      category: 'simulation' as const,
      note: 'Useful for geometry, graphing, and interactive modelling.',
    },
    {
      id: `maths-ref-khan-${skillLevel}`,
      title: 'Khan Academy Math',
      url: 'https://www.khanacademy.org/math',
      category: 'article' as const,
      note: 'Additional worked examples and practice support.',
    },
  ];

  if (skillLevel === 'advanced' || skillLevel === 'pro') {
    return [
      ...shared,
      {
        id: `maths-ref-colab-${skillLevel}`,
        title: 'Google Colab',
        url: 'https://colab.research.google.com/',
        category: 'activity' as const,
        note: 'Notebook space for Python-based maths, modelling, and data work.',
      },
      {
        id: `maths-ref-phet-${skillLevel}`,
        title: 'PhET Simulations',
        url: 'https://phet.colorado.edu/',
        category: 'simulation' as const,
        note: 'Supports modelling and visual sense-making across maths and science.',
      },
    ];
  }

  return shared;
};

const supportStrategiesForLevel = (skillLevel: SkillLevelId): string[] => {
  switch (skillLevel) {
    case 'foundation':
      return [
        'Keep models visible and concrete before moving to symbols.',
        'Use oral explain-it-back or photos in place of long written responses when needed.',
        'Return to one clear pattern at a time with short guided prompts.',
      ];
    case 'intermediate':
      return [
        'Bridge visuals to symbols with tables, sentence stems, and quick comparisons.',
        'Use worked examples before independent practice.',
        'Keep the block structure predictable: see it, try it, explain it.',
      ];
    case 'advanced':
      return [
        'Use notebooks, graphs, and data tools to make reasoning visible.',
        'Offer one stretch variation after core understanding is secure.',
        'Encourage strategy comparison instead of one-method-only work.',
      ];
    case 'pro':
      return [
        'Use notebook checkpoints so longer technical work stays visible and manageable.',
        'Ask learners to justify assumptions, limits, and tradeoffs explicitly.',
        'Balance independent modelling with short mentor-style reflection prompts.',
      ];
  }
};

const extensionStrategiesForLevel = (skillLevel: SkillLevelId): string[] => {
  switch (skillLevel) {
    case 'foundation':
      return ['Turn the idea into a game or teach-back challenge.', 'Look for the same pattern in a different real-life setting.'];
    case 'intermediate':
      return ['Add one extra representation such as a table, graph, or number story.', 'Compare two solving strategies and explain which feels clearer.'];
    case 'advanced':
      return ['Model the same idea with a digital tool.', 'Test a harder or messier version of the problem and document what changes.'];
    case 'pro':
      return ['Build a notebook, spreadsheet, or coded model to explore the pattern at scale.', 'Critique the model’s assumptions and suggest a better version.'];
  }
};

const makeAgeBandGuidance = (track: FoundationalRailTrack): AgeBandGuidance[] => [
  {
    skillLevel: track.skillLevel,
    ageRange: track.ageRange,
    focus: track.description,
    essentialQuestions: [
      `How can ${track.railId} help us understand and solve real problems?`,
      `How can we explain the thinking behind a maths strategy clearly?`,
    ],
    supportStrategies: supportStrategiesForLevel(track.skillLevel),
    extensionStrategies: extensionStrategiesForLevel(track.skillLevel),
    capstoneIdea: `Create a final ${track.railId} showcase that teaches one powerful idea from ${track.title}.`,
  },
];

const createSharedProjectTemplate = (
  module: FoundationalRailModule,
  track: FoundationalRailTrack
): ProjectTemplate => ({
  ...(track.sharedProjectTemplates[0] || {
    id: `${module.id}-project`,
    title: `Build with ${module.title}`,
    style: 'build' as const,
    description: `Use ${module.title} to create a visible maths artifact.`,
    skillLevels: ALL_LEVELS,
    learningGoals: module.coreSkills.slice(0, 3),
    materials: ['Notebook', 'Poster board', 'Markers'],
    steps: ['Choose a maths idea.', 'Build or explain it.', 'Share what the maths reveals.'],
    interestHookTemplate: 'Theme the work around one learner interest.',
    estimatedTimeMinutes: 60,
  }),
  id: `${module.id}-project`,
  title: `${module.title} Project Sprint`,
  description: `Turn ${module.title.toLowerCase()} into a visible model, explanation, or project output.`,
  skillLevels: ALL_LEVELS,
});

const buildProjectBrief = (module: FoundationalRailModule): ProjectBrief => ({
  title: `${module.title} Showcase`,
  drivingQuestion: `How can ${module.title.toLowerCase()} help us solve or explain a real problem?`,
  deliverables: [
    'One visible maths artifact or model',
    'A short explain-it-back summary',
    'A real-world connection or use case',
  ],
  skillLevelNotes: {
    foundation: `Keep ${module.title.toLowerCase()} visual, hands-on, and easy to retell.`,
    intermediate: `Use ${module.title.toLowerCase()} to compare, explain, and represent patterns clearly.`,
    advanced: `Use ${module.title.toLowerCase()} with graphs, data, or digital tools where helpful.`,
    pro: `Use ${module.title.toLowerCase()} to justify a model, claim, or technical decision.`,
  },
});

const buildTaskSteps = (module: FoundationalRailModule): Record<SkillLevelId, WeekCurriculum['tasksBySkillLevel'][SkillLevelId]> => ({
  foundation: [
    { stepNumber: 1, description: `Warm up with one visible model for ${module.coreSkills[0]}.` },
    { stepNumber: 2, description: `Try a guided example based on ${module.realWorldUseCases[0] || module.title}.` },
    { stepNumber: 3, description: `Make or draw a model that shows how ${module.title.toLowerCase()} works.` },
    { stepNumber: 4, description: 'Explain one strategy in your own words.' },
  ],
  intermediate: [
    { stepNumber: 1, description: `Preview the core idea: ${module.summary}` },
    { stepNumber: 2, description: `Work through a guided example using ${module.coreSkills.slice(0, 2).join(' and ')}.` },
    { stepNumber: 3, description: `Apply the maths to ${module.realWorldUseCases[0] || 'a real scenario'}.` },
    { stepNumber: 4, description: 'Write or present a short explanation of the strategy used.' },
  ],
  advanced: [
    { stepNumber: 1, description: `Model the key idea behind ${module.title.toLowerCase()}.` },
    { stepNumber: 2, description: `Compare two approaches or representations for the same problem.` },
    { stepNumber: 3, description: `Use a graph, table, or tool to test the maths in context.` },
    { stepNumber: 4, description: 'Document what changed, what held, and what you learned.' },
  ],
  pro: [
    { stepNumber: 1, description: `Frame ${module.title.toLowerCase()} as a model or decision problem.` },
    { stepNumber: 2, description: 'Test assumptions with an example, graph, or notebook workflow.' },
    { stepNumber: 3, description: `Apply the maths to ${module.realWorldUseCases[0] || 'a realistic case'}.` },
    { stepNumber: 4, description: 'Write a concise technical explanation or project note with evidence.' },
  ],
});

const buildWeeklyQuiz = (module: FoundationalRailModule): QuizQuestion[] =>
  module.quizQuestions.map((question, index) => ({
    ...question,
    skillLevels: ALL_LEVELS,
    day: DAY_SEQUENCE[index % DAY_SEQUENCE.length],
  }));

const buildCanonicalLessons = (
  module: FoundationalRailModule,
  track: FoundationalRailTrack
): Record<SkillLevelId, CanonicalMiniLesson[]> => ({
  foundation: module.miniLessons.map((lesson, index) => ({
    ...lesson,
    day: lesson.day || DAY_SEQUENCE[index % DAY_SEQUENCE.length],
  })),
  intermediate: module.miniLessons.map((lesson, index) => ({
    ...lesson,
    day: lesson.day || DAY_SEQUENCE[index % DAY_SEQUENCE.length],
  })),
  advanced: module.miniLessons.map((lesson, index) => ({
    ...lesson,
    day: lesson.day || DAY_SEQUENCE[index % DAY_SEQUENCE.length],
    explanationSections: lesson.explanationSections.length > 1 ? lesson.explanationSections : [...lesson.explanationSections, track.description],
  })),
  pro: module.miniLessons.map((lesson, index) => ({
    ...lesson,
    day: lesson.day || DAY_SEQUENCE[index % DAY_SEQUENCE.length],
    keyTakeaways: Array.from(new Set([...lesson.keyTakeaways, 'Explain the limits of the model or strategy you used.'])).slice(0, 4),
  })),
});

const createMathsCurriculum = (config: {
  podId: string;
  podTitle: string;
  monthNumber: number;
  description: string;
  track: FoundationalRailTrack;
}): PodCurriculum => ({
  podId: config.podId,
  podTitle: config.podTitle,
  monthNumber: config.monthNumber,
  description: config.description,
  unlockRule: 'Complete the weekly project, submit at least 2 evidence items, and reach P or higher on 3 of 4 rubric criteria.',
  programHours: Math.round((config.track.modules.length * config.track.sessionsPerWeek * config.track.sessionLengthMinutes) / 60),
  pacingOptions: [
    {
      id: `${config.podId}-core`,
      label: 'Core month',
      totalWeeks: config.track.modules.length,
      sessionsPerWeek: config.track.sessionsPerWeek,
      minutesPerSession: config.track.sessionLengthMinutes,
      notes: 'Best when this maths pod is a current focus alongside the regular day schedule.',
    },
    {
      id: `${config.podId}-balanced`,
      label: 'Balanced extension',
      totalWeeks: config.track.modules.length + 2,
      sessionsPerWeek: Math.max(config.track.sessionsPerWeek - 1, 2),
      minutesPerSession: Math.max(config.track.sessionLengthMinutes - 5, 20),
      notes: 'Leaves more room for mixed pods, recovery days, and portfolio building.',
    },
  ],
  planningQuestions: [
    {
      id: `${config.podId}-timeframe`,
      prompt: 'How quickly do you want to move through this maths pod?',
      type: 'timeframe',
      options: [`${config.track.modules.length} weeks`, `${config.track.modules.length + 2} weeks`, `${config.track.modules.length + 4} weeks`],
    },
    {
      id: `${config.podId}-hours`,
      prompt: 'How much focused maths time feels realistic each week?',
      type: 'hours-per-week',
      options: ['2 hours/week', '3 hours/week', '4 hours/week', '5 hours/week'],
    },
    {
      id: `${config.podId}-minutes`,
      prompt: 'What session length usually works best?',
      type: 'minutes-per-day',
      options: ['20 minutes/day', '30 minutes/day', '40 minutes/day', '60 minutes/day'],
    },
    {
      id: `${config.podId}-mode`,
      prompt: 'How should this fit into the schedule?',
      type: 'schedule-mode',
      options: ['Auto-fit into current schedule', 'Maths-priority weeks', 'Light touch alongside other pods'],
    },
  ],
  ageBandGuidance: makeAgeBandGuidance(config.track),
  segments: config.track.modules.map((module) => ({
    id: `${config.podId}-${module.id}`,
    title: module.title,
    summary: module.summary,
    guidingQuestions: [
      `How can ${module.title.toLowerCase()} help us think more clearly?`,
      `Where can we use ${module.title.toLowerCase()} outside a worksheet?`,
    ],
    skillsUnlocked: module.coreSkills,
    realWorldLinks: module.realWorldUseCases,
  })),
  supportingAssets: [
    {
      id: `${config.podId}-asset-overview-video`,
      title: `${config.podTitle} Overview Video`,
      type: 'video',
      description: 'Short walkthrough that introduces the big maths idea for the pod.',
    },
    {
      id: `${config.podId}-asset-slides`,
      title: `${config.podTitle} Slide Deck`,
      type: 'slide-deck',
      description: 'Mini-lesson slides, worked examples, and family-facing summary visuals.',
    },
    {
      id: `${config.podId}-asset-notebook`,
      title: `${config.podTitle} Maths Notebook Template`,
      type: 'notebook',
      description: 'Reusable notebook pages for worked examples, graphs, reflections, and explain-it-back notes.',
    },
    {
      id: `${config.podId}-asset-printables`,
      title: `${config.podTitle} Quick Check Printables`,
      type: 'worksheet',
      description: 'Optional printable quick checks, card sorts, and visual support sheets.',
    },
  ],
  references: referencesForLevel(config.track.skillLevel),
  weeks: config.track.modules.map((module, index): WeekCurriculum => ({
    weekNumber: index + 1,
    title: module.title,
    subjects: getWeekSubjects(config.track.skillLevel),
    overview: {
      weekNumber: index + 1,
      title: module.title,
      learningTargets: [
        { subject: 'math', icon: '📐', skills: module.coreSkills.slice(0, 3) },
        { subject: 'integration', icon: '🔗', skills: module.realWorldUseCases.slice(0, 2) },
      ],
      safetyNotes: [
        {
          text: 'Use short work intervals, visible models, and clear worked examples before moving to independent challenge.',
          priority: 'info',
        },
      ],
    },
    tasksBySkillLevel: buildTaskSteps(module),
    codeRequiredByLevel: {
      foundation: false,
      intermediate: false,
      advanced:
        config.track.skillLevel === 'advanced' &&
        module.title.toLowerCase().includes('coding'),
      pro:
        config.track.skillLevel === 'pro' &&
        (module.title.toLowerCase().includes('regression') ||
          module.title.toLowerCase().includes('simulation') ||
          module.title.toLowerCase().includes('modelling')),
    },
    evidence: {
      weekNumber: index + 1,
      items: [
        {
          id: `${module.id}-evidence-model`,
          label: 'Worked model or visual example',
          description: `Show ${module.title.toLowerCase()} in a visible way.`,
          isRequired: true,
        },
        {
          id: `${module.id}-evidence-explain`,
          label: 'Explain-it-back summary',
          description: 'Record or write how the strategy works.',
          isRequired: true,
        },
        {
          id: `${module.id}-evidence-project`,
          label: 'Project or real-world application',
          description: `Use ${module.title.toLowerCase()} in a real context.`,
          isRequired: false,
        },
      ],
    },
    rubric: {
      weekNumber: index + 1,
      unlockRule: 'Reach P or higher on at least 3 rubric criteria.',
      criteria: [
        {
          id: `${module.id}-reasoning`,
          name: 'Reasoning',
          description: 'Explains why the maths works, not just the final answer.',
          levels: {
            E: 'Needs help to describe the strategy.',
            D: 'Can describe parts of the strategy with support.',
            P: 'Explains the strategy clearly and accurately.',
            M: 'Explains the strategy clearly, accurately, and in transfer to a new context.',
          },
        },
        {
          id: `${module.id}-representation`,
          name: 'Representation',
          description: 'Uses visuals, symbols, or tools to make the maths visible.',
          levels: {
            E: 'Representation is incomplete or unclear.',
            D: 'Representation shows some understanding.',
            P: 'Representation clearly supports the maths thinking.',
            M: 'Representation is clear, efficient, and strengthens explanation.',
          },
        },
        {
          id: `${module.id}-application`,
          name: 'Application',
          description: 'Uses the maths in a real or meaningful context.',
          levels: {
            E: 'Needs support to connect the maths to a context.',
            D: 'Makes a partial or simple connection.',
            P: 'Uses the maths meaningfully in context.',
            M: 'Uses the maths flexibly and justifies choices in context.',
          },
        },
        {
          id: `${module.id}-communication`,
          name: 'Communication',
          description: 'Communicates the learning clearly through speaking, writing, diagrams, or notebook evidence.',
          levels: {
            E: 'Communication is hard to follow.',
            D: 'Communication is partly clear.',
            P: 'Communication is clear and organized.',
            M: 'Communication is polished, confident, and teachable to others.',
          },
        },
      ],
    },
    materials: {
      weekNumber: index + 1,
      items: config.track.toolStages
        .flatMap((stage) => stage.tools)
        .slice(0, 4)
        .map((tool, toolIndex) => ({
          id: `${module.id}-material-${toolIndex + 1}`,
          name: tool,
        })),
    },
    dailyFlow: {
      weekNumber: index + 1,
      days: [
        { day: 'Monday', activities: `mini lesson + worked example + ${module.coreSkills[0]}`, duration: 75 },
        { day: 'Tuesday', activities: `guided practice + visual model + ${module.coreSkills[1] || module.coreSkills[0]}`, duration: 75 },
        { day: 'Wednesday', activities: `tool use + test pattern + ${module.realWorldUseCases[0] || module.title}`, duration: 75 },
        { day: 'Thursday', activities: `project sprint + apply strategy + explain reasoning`, duration: 75 },
        { day: 'Friday', activities: `quick check + reflect + share findings`, duration: 75 },
      ],
    },
    essentialQuestions: [
      `How does ${module.title.toLowerCase()} help us think or solve more clearly?`,
      `What real problems become easier when we understand ${module.title.toLowerCase()}?`,
    ],
    flashcards: module.flashcards.map((item) => ({ ...item, skillLevels: ALL_LEVELS })),
    canonicalLessonsBySkillLevel: buildCanonicalLessons(module, config.track),
    quizQuestions: buildWeeklyQuiz(module),
    interactiveTasks: [
      {
        id: `${module.id}-interactive-1`,
        title: `${module.title} Visual Challenge`,
        type: config.track.skillLevel === 'advanced' || config.track.skillLevel === 'pro' ? 'simulation' : 'game',
        description: `Use ${module.title.toLowerCase()} in a short interactive or model-based challenge.`,
        skillLevels: ALL_LEVELS,
        estimatedMinutes: Math.max(config.track.sessionLengthMinutes - 10, 15),
        evidencePrompt: `Capture one screenshot, sketch, or note showing how you used ${module.title.toLowerCase()}.`,
      },
    ],
    projectTemplates: [createSharedProjectTemplate(module, config.track)],
    weeklyProject: buildProjectBrief(module),
  })),
});

export const NUMBER_SENSE_PATTERNS_CURRICULUM = createMathsCurriculum({
  podId: 'pod-number-sense-patterns',
  podTitle: 'Number Sense & Pattern Power',
  monthNumber: 30,
  description:
    'A maths pod that builds visible confidence through number structure, reversible operations, fractions, measurement, and playful pattern reasoning.',
  track: MATHS_FOUNDATION_RAIL,
});

export const RATIOS_GRAPHS_MODELLING_CURRICULUM = createMathsCurriculum({
  podId: 'pod-ratios-graphs-modelling',
  podTitle: 'Ratios, Graphs & Modelling',
  monthNumber: 31,
  description:
    'A bridge pod from concrete maths to symbolic reasoning using ratios, variables, graphing, and early modelling tools.',
  track: MATHS_INTERMEDIATE_RAIL,
});

export const ALGEBRA_DATA_SIMULATION_CURRICULUM = createMathsCurriculum({
  podId: 'pod-algebra-data-simulation',
  podTitle: 'Algebra, Data & Simulation Studio',
  monthNumber: 32,
  description:
    'An applied maths pod using algebra, geometry, data, and coding-aware tools to model, test, and explain change.',
  track: MATHS_ADVANCED_RAIL,
});

export const MODELLING_CALCULUS_ML_CURRICULUM = createMathsCurriculum({
  podId: 'pod-modelling-calculus-ml',
  podTitle: 'Modelling, Calculus & ML Foundations',
  monthNumber: 33,
  description:
    'A pro-level maths pod for modelling systems, reasoning with data, and building early machine learning and calculus intuition.',
  track: MATHS_PRO_RAIL,
});

export const MATHS_POD_CURRICULA: PodCurriculum[] = [
  NUMBER_SENSE_PATTERNS_CURRICULUM,
  RATIOS_GRAPHS_MODELLING_CURRICULUM,
  ALGEBRA_DATA_SIMULATION_CURRICULUM,
  MODELLING_CALCULUS_ML_CURRICULUM,
];
