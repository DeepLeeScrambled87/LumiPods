import type {
  CanonicalMiniLesson,
  PodCurriculum,
  ProjectTemplate,
  QuizQuestion,
  SkillLevelId,
  WeekCurriculum,
} from '../../types/curriculum';

type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

const ALL_LEVELS: SkillLevelId[] = ['foundation', 'intermediate', 'advanced', 'pro'];

const lesson = (
  id: string,
  day: Weekday,
  title: string,
  learningObjective: string,
  explanationSections: string[],
  concreteExample: string,
  quickChecks: string[],
  keyTakeaways: string[],
  estimatedMinutes: number,
  tags: string[],
  relatedActivities: string[]
): CanonicalMiniLesson => ({
  id,
  day,
  title,
  learningObjective,
  explanationSections,
  concreteExample,
  quickChecks,
  keyTakeaways,
  estimatedMinutes,
  tags,
  relatedActivities,
});

const mcq = (
  id: string,
  skillLevels: SkillLevelId[],
  day: Weekday,
  prompt: string,
  options: string[],
  correctAnswer: string,
  hint: string,
  explanation: string
): QuizQuestion => ({
  id,
  prompt,
  type: 'multiple-choice',
  skillLevels,
  day,
  options,
  correctAnswer,
  hint,
  explanation,
});

const projectTemplate = (
  id: string,
  title: string,
  style: ProjectTemplate['style'],
  description: string,
  skillLevels: SkillLevelId[],
  learningGoals: string[],
  materials: string[],
  steps: string[],
  interestHookTemplate: string,
  estimatedTimeMinutes: number
): ProjectTemplate => ({
  id,
  title,
  style,
  description,
  skillLevels,
  learningGoals,
  materials,
  steps,
  interestHookTemplate,
  estimatedTimeMinutes,
});

const WEEK_ONE_QUIZ: QuizQuestion[] = [
  mcq(
    'body-w1-foundation-mon',
    ['foundation'],
    'Monday',
    'Which body system includes your skin, hair, and nails?',
    ['Integumentary system', 'Digestive system', 'Respiratory system', 'Urinary system'],
    'Integumentary system',
    'Think about the system that covers the outside of your body.',
    'The integumentary system includes skin, hair, and nails and helps protect the body.'
  ),
  mcq(
    'body-w1-foundation-tue',
    ['foundation'],
    'Tuesday',
    'What is the main job of bones?',
    ['To pump blood', 'To support and protect the body', 'To digest food', 'To hear sounds'],
    'To support and protect the body',
    'Think about what helps you stand tall and protects your brain.',
    'Bones support the body, help movement, and protect important organs.'
  ),
  mcq(
    'body-w1-foundation-wed',
    ['foundation'],
    'Wednesday',
    'What do we call a group of body parts that work together?',
    ['A hobby', 'An organ system', 'A chemical', 'A machine code'],
    'An organ system',
    'Skin, bones, muscles, and lungs are each part of bigger body teams.',
    'An organ system is a group of organs or body parts working together for a major job.'
  ),
  mcq(
    'body-w1-foundation-thu',
    ['foundation'],
    'Thursday',
    'Which body part protects your brain?',
    ['Rib cage', 'Skull', 'Kidney', 'Liver'],
    'Skull',
    'It is the bony case around your head.',
    'The skull is part of the skeletal system and protects the brain.'
  ),
  mcq(
    'body-w1-foundation-fri',
    ['foundation'],
    'Friday',
    'Why is skin important?',
    ['It keeps the body closed off and helps protect from germs', 'It makes bones hard', 'It pumps oxygen', 'It stores memories'],
    'It keeps the body closed off and helps protect from germs',
    'Think about the body shield on the outside.',
    'Skin protects the body, helps control temperature, and reduces water loss.'
  ),
  mcq(
    'body-w1-intermediate-mon',
    ['intermediate'],
    'Monday',
    'Which sequence shows body organization from smallest to largest?',
    ['Organs -> cells -> tissues -> systems', 'Cells -> tissues -> organs -> systems', 'Systems -> organs -> tissues -> cells', 'Tissues -> systems -> cells -> organs'],
    'Cells -> tissues -> organs -> systems',
    'Start with the microscopic level and build upward.',
    'Cells form tissues, tissues form organs, and organs work together in systems.'
  ),
  mcq(
    'body-w1-intermediate-tue',
    ['intermediate'],
    'Tuesday',
    'Why is cartilage useful in the skeletal system?',
    ['It makes blood', 'It adds flexible support and cushioning', 'It sends nerve signals', 'It breaks down food'],
    'It adds flexible support and cushioning',
    'Think of the softer material in ears, nose, and joints.',
    'Cartilage supports body parts and cushions joints without being as hard as bone.'
  ),
  mcq(
    'body-w1-intermediate-wed',
    ['intermediate'],
    'Wednesday',
    'What is one way the integumentary and skeletal systems work together?',
    ['Skin dissolves bones', 'Skin covers and protects the body while bones support it underneath', 'Bones make hormones for skin color', 'They only work at different times'],
    'Skin covers and protects the body while bones support it underneath',
    'Think about one system on the outside and one system forming the frame.',
    'Skin protects the outer body while bones support the inside structure and protect organs.'
  ),
  mcq(
    'body-w1-intermediate-thu',
    ['intermediate'],
    'Thursday',
    'Which mineral-storage role belongs to bones?',
    ['Bones store calcium and phosphorus', 'Bones store oxygen', 'Bones store memories', 'Bones store carbon dioxide only'],
    'Bones store calcium and phosphorus',
    'Think about important minerals that help build strong bones and teeth.',
    'The skeletal system stores minerals including calcium and phosphorus.'
  ),
  mcq(
    'body-w1-intermediate-fri',
    ['intermediate'],
    'Friday',
    'Why is the skin called part of a protective barrier?',
    ['It helps block germs and reduces water loss', 'It is always made of bone', 'It produces red blood cells', 'It controls every thought'],
    'It helps block germs and reduces water loss',
    'Think about infection and keeping the body balanced.',
    'Skin protects against infection and helps the body avoid losing too much water.'
  ),
  mcq(
    'body-w1-advanced-mon',
    ['advanced'],
    'Monday',
    'Which body system pairing best represents protection plus support?',
    ['Digestive and respiratory', 'Integumentary and skeletal', 'Urinary and endocrine', 'Reproductive and lymphatic'],
    'Integumentary and skeletal',
    'Match the body shield with the body frame.',
    'The integumentary system protects the outside and the skeletal system supports and protects inside structures.'
  ),
  mcq(
    'body-w1-advanced-tue',
    ['advanced'],
    'Tuesday',
    'What is the function of ligaments in the skeletal system?',
    ['They attach muscle to bone', 'They connect bone to bone', 'They filter blood', 'They secrete hormones'],
    'They connect bone to bone',
    'Tendons connect muscle to bone, so choose the other connective job.',
    'Ligaments connect bones to other bones and help stabilize joints.'
  ),
  mcq(
    'body-w1-advanced-wed',
    ['advanced'],
    'Wednesday',
    'Why is the integumentary system important for homeostasis?',
    ['It stores all digested food', 'It helps regulate temperature and forms a barrier', 'It replaces the nervous system', 'It creates urine'],
    'It helps regulate temperature and forms a barrier',
    'Think about sweat, blood flow in skin, and outside protection.',
    'Skin helps the body maintain stable internal conditions by protecting and regulating temperature.'
  ),
  mcq(
    'body-w1-advanced-thu',
    ['advanced'],
    'Thursday',
    'Which structure helps bones meet and move smoothly at a joint?',
    ['Alveoli', 'Cartilage', 'Nephron', 'Pancreas'],
    'Cartilage',
    'Think about cushioning surfaces where bones meet.',
    'Cartilage cushions joints and reduces friction between bones.'
  ),
  mcq(
    'body-w1-advanced-fri',
    ['advanced'],
    'Friday',
    'Why is the skeletal system considered dynamic rather than static?',
    ['Bones never change once formed', 'Bones store minerals and are constantly remodeled', 'Bones only act as decoration', 'Bones work only during sleep'],
    'Bones store minerals and are constantly remodeled',
    'Think about growth, repair, and mineral balance.',
    'Bone tissue is living tissue that changes, repairs, and helps regulate mineral balance.'
  ),
  mcq(
    'body-w1-pro-mon',
    ['pro'],
    'Monday',
    'Which explanation best shows organ-system interdependence in week 1?',
    ['Skin and bone act independently with no overlap', 'Skin provides a barrier while bone provides structural protection and movement leverage', 'Only skin determines posture', 'Only bone controls immune defense'],
    'Skin provides a barrier while bone provides structural protection and movement leverage',
    'Choose the option that shows both systems contributing different but connected roles.',
    'The integumentary and skeletal systems work together by combining barrier protection with structural support and movement.'
  ),
  mcq(
    'body-w1-pro-tue',
    ['pro'],
    'Tuesday',
    'Why is it scientifically useful to distinguish tissues from organs?',
    ['Because tissues always work alone', 'Because levels of organization explain how specialized structures combine into larger functions', 'Because organs are not made of cells', 'Because tissues are only found in plants'],
    'Because levels of organization explain how specialized structures combine into larger functions',
    'Think about hierarchy and how complexity builds.',
    'Distinguishing tissues from organs helps explain how specialized structures scale into organ-system function.'
  ),
  mcq(
    'body-w1-pro-wed',
    ['pro'],
    'Wednesday',
    'What makes skin a multifunctional organ rather than just a covering?',
    ['It only changes appearance', 'It protects, senses, regulates temperature, and reduces water loss', 'It acts only when injured', 'It replaces the skeleton'],
    'It protects, senses, regulates temperature, and reduces water loss',
    'Choose the option with several linked physiological roles.',
    'Skin is multifunctional because it protects, senses, regulates temperature, and supports homeostasis.'
  ),
  mcq(
    'body-w1-pro-thu',
    ['pro'],
    'Thursday',
    'Which claim about the adult skeleton is most accurate?',
    ['It contains 206 bones and also stores minerals', 'It contains 106 bones and only supports posture', 'It has no connection to blood formation', 'It is not living tissue'],
    'It contains 206 bones and also stores minerals',
    'Look for the option that includes structure plus physiological function.',
    'The adult human skeleton has 206 bones and contributes to support, protection, mineral storage, and blood cell formation.'
  ),
  mcq(
    'body-w1-pro-fri',
    ['pro'],
    'Friday',
    'Why is week 1 framed around systems rather than isolated parts?',
    ['Because systems thinking reveals how multiple structures coordinate for survival', 'Because the body has only one real system', 'Because organs do not interact', 'Because isolated memorization always explains physiology better'],
    'Because systems thinking reveals how multiple structures coordinate for survival',
    'Choose the answer that focuses on interaction and coordination.',
    'A systems approach helps learners understand coordinated survival functions rather than memorizing disconnected parts.'
  ),
];

const WEEK_ONE: WeekCurriculum = {
  weekNumber: 1,
  title: 'Body Map: Overview, Skin, and Skeleton',
  subjects: ['science', 'communication', 'arts', 'integration'],
  overview: {
    weekNumber: 1,
    title: 'Body Map: Overview, Skin, and Skeleton',
    learningTargets: [
      { subject: 'science', icon: '🧬', skills: ['organ systems', 'skin structure', 'bone support'] },
      { subject: 'communication', icon: '🗣️', skills: ['label diagrams', 'explain body jobs', 'compare systems'] },
      { subject: 'arts', icon: '🎨', skills: ['body maps', 'posters', 'model design'] },
      { subject: 'integration', icon: '🔗', skills: ['systems thinking', 'part-to-whole reasoning', 'self-awareness'] },
    ],
    safetyNotes: [
      { text: 'Use body outlines and touch activities respectfully and only with consent.', priority: 'warning' },
      { text: 'Wash hands after handling shared model materials.', priority: 'info' },
    ],
  },
  tasksBySkillLevel: {
    foundation: [
      { stepNumber: 1, description: 'Name the big body teams and match each one to a simple job.' },
      { stepNumber: 2, description: 'Trace or build a body outline and label skin, bones, and a few major organs.' },
      { stepNumber: 3, description: 'Feel safe bony landmarks like elbows and knees and compare them to soft tissue.' },
      { stepNumber: 4, description: 'Explain how skin and bones help protect you every day.' },
    ],
    intermediate: [
      { stepNumber: 1, description: 'Build a whole-body systems map from cells to tissues, organs, and systems.' },
      { stepNumber: 2, description: 'Compare the integumentary and skeletal systems with a simple chart.' },
      { stepNumber: 3, description: 'Measure height, wingspan, or hand size and connect structure to function.' },
      { stepNumber: 4, description: 'Create a labeled defense-and-support poster or notebook spread.' },
    ],
    advanced: [
      { stepNumber: 1, description: 'Explain how body organization scales from cells to systems.' },
      { stepNumber: 2, description: 'Investigate bone, cartilage, ligaments, and skin as specialized tissues.' },
      { stepNumber: 3, description: 'Connect skeletal and integumentary roles to protection, support, and homeostasis.' },
      { stepNumber: 4, description: 'Produce a short scientific explanation of why the body needs more than one protective system.' },
    ],
    pro: [
      { stepNumber: 1, description: 'Analyze the body as a coordinated system of hierarchical structures.' },
      { stepNumber: 2, description: 'Compare hard, flexible, and protective tissues using anatomical vocabulary.' },
      { stepNumber: 3, description: 'Build an evidence-backed explanation of skeletal and integumentary interdependence.' },
      { stepNumber: 4, description: 'Design a clear public-facing body systems overview that avoids common misconceptions.' },
    ],
  },
  codeRequiredByLevel: {
    foundation: false,
    intermediate: false,
    advanced: false,
    pro: false,
  },
  evidence: {
    weekNumber: 1,
    items: [
      { id: 'body-w1-ev1', label: 'Body systems overview map or labeled poster', isRequired: true },
      { id: 'body-w1-ev2', label: 'Skeleton observation notes or photo', isRequired: true },
      { id: 'body-w1-ev3', label: 'Skin protection explanation, voice note, or diagram', isRequired: true },
      { id: 'body-w1-ev4', label: 'Quick check quiz results', isRequired: false },
      { id: 'body-w1-ev5', label: 'Reflection: “What does my body do for me all day?”', isRequired: true },
    ],
  },
  rubric: {
    weekNumber: 1,
    criteria: [
      {
        id: 'body-w1-r1',
        name: 'Systems Thinking',
        description: 'Shows how parts work together inside a body system.',
        levels: {
          E: 'Names parts only.',
          D: 'Shows some connections with help.',
          P: 'Explains how the system works together clearly.',
          M: 'Explains interactions clearly and applies them to real life.',
        },
      },
      {
        id: 'body-w1-r2',
        name: 'Anatomy Vocabulary',
        description: 'Uses accurate age-appropriate terms like skin, bone, cartilage, and organ system.',
        levels: {
          E: 'Uses mostly everyday words.',
          D: 'Uses some correct terms with support.',
          P: 'Uses correct terms accurately.',
          M: 'Uses precise terms confidently and teaches them to others.',
        },
      },
      {
        id: 'body-w1-r3',
        name: 'Diagram and Model Clarity',
        description: 'Builds or labels a clear model or visual explanation.',
        levels: {
          E: 'Model is incomplete.',
          D: 'Model shows main idea but lacks clarity.',
          P: 'Model is clear and informative.',
          M: 'Model is detailed, accessible, and memorable.',
        },
      },
      {
        id: 'body-w1-r4',
        name: 'Reflection',
        description: 'Notices why body protection and support matter.',
        levels: {
          E: 'Needs prompting to reflect.',
          D: 'Shares a simple idea.',
          P: 'Reflects clearly on why the systems matter.',
          M: 'Reflects deeply and raises new questions.',
        },
      },
    ],
    unlockRule:
      'Complete the systems map, submit at least 3 evidence items, and reach P or higher on 3/4 rubric criteria.',
  },
  materials: {
    weekNumber: 1,
    items: [
      { id: 'body-w1-m1', name: 'Poster paper or notebook' },
      { id: 'body-w1-m2', name: 'Markers or pencils' },
      { id: 'body-w1-m3', name: 'Mirror' },
      { id: 'body-w1-m4', name: 'String or tape measure' },
      { id: 'body-w1-m5', name: 'Body system diagrams or cards' },
    ],
  },
  dailyFlow: {
    weekNumber: 1,
    days: [
      { day: 'Monday', activities: 'meet the 11 body systems and create a whole-body map', duration: 40 },
      { day: 'Tuesday', activities: 'explore skin, hair, nails, and body protection', duration: 40 },
      { day: 'Wednesday', activities: 'investigate bones, joints, and support', duration: 45 },
      { day: 'Thursday', activities: 'compare skin and skeleton in a systems chart', duration: 40 },
      { day: 'Friday', activities: 'present the defense-and-support body map', duration: 35 },
    ],
  },
  essentialQuestions: [
    'How is the body organized into systems?',
    'Why do skin and bones both matter for protection and survival?',
  ],
  flashcards: [
    { id: 'body-w1-f1', front: 'Organ system', back: 'A group of organs or body parts that work together for a major job.', skillLevels: ALL_LEVELS },
    { id: 'body-w1-f2', front: 'Integumentary system', back: 'The body system made of skin, hair, and nails.', skillLevels: ALL_LEVELS },
    { id: 'body-w1-f3', front: 'Skeletal system', back: 'Bones, cartilage, and ligaments that support and protect the body.', skillLevels: ALL_LEVELS },
    { id: 'body-w1-f4', front: 'Cartilage', back: 'Flexible tissue that cushions joints and supports parts like the nose and ears.', skillLevels: ['intermediate', 'advanced', 'pro'] },
    { id: 'body-w1-f5', front: 'Ligament', back: 'A connective tissue that links bone to bone.', skillLevels: ['advanced', 'pro'] },
  ],
  canonicalLessonsBySkillLevel: {
    foundation: [
      lesson(
        'body-w1-foundation-lesson',
        'Monday',
        'Your body has teams',
        'By the end, you can explain that the body has different systems that do different jobs.',
        [
          'Bodies are made of parts that work together in teams called systems.',
          'Skin protects the outside and bones help hold the body up and protect what is inside.',
        ],
        'A bike has a frame and a covering on the seat. Your body also needs support and protection.',
        ['What body system covers the outside of you?', 'What helps your body stay upright?'],
        ['Systems are teamwork inside the body.', 'Skin protects.', 'Bones support and protect.'],
        15,
        ['body systems', 'skin', 'bones', 'protection'],
        ['meet the 11 body systems and create a whole-body map']
      ),
    ],
    intermediate: [
      lesson(
        'body-w1-intermediate-lesson',
        'Tuesday',
        'Defense and support',
        'By the end, you can compare the integumentary and skeletal systems using structure and function.',
        [
          'The integumentary system protects the outside of the body and helps reduce water loss.',
          'The skeletal system supports the body, protects organs, and stores minerals.',
        ],
        'Your skull protects your brain while your skin helps block germs from getting inside.',
        ['How do skin and bones protect in different ways?', 'What does the skeletal system store besides shape?'],
        ['Different systems can protect in different ways.', 'Structure helps explain function.', 'The body works as a team.'],
        18,
        ['integumentary', 'skeletal', 'support', 'protection'],
        ['explore skin, hair, nails, and body protection', 'investigate bones, joints, and support']
      ),
    ],
    advanced: [
      lesson(
        'body-w1-advanced-lesson',
        'Wednesday',
        'From tissues to systems',
        'By the end, you can explain how specialized tissues build organs and systems for support and protection.',
        [
          'Body organization matters because cells, tissues, organs, and systems each contribute different levels of function.',
          'Skin and bone are both living tissues with different structures and physiological roles.',
        ],
        'Bone tissue is rigid and mineral-rich, while skin is layered and flexible, yet both help survival.',
        ['Why do scientists care about levels of organization?', 'What makes skin and bone different kinds of tissue?'],
        ['Organization helps explain complexity.', 'Tissues are specialized.', 'Systems coordinate survival functions.'],
        20,
        ['organization', 'tissue', 'bone', 'skin'],
        ['compare skin and skeleton in a systems chart']
      ),
    ],
    pro: [
      lesson(
        'body-w1-pro-lesson',
        'Thursday',
        'Systems thinking in anatomy',
        'By the end, you can defend why anatomy is best learned as interacting systems rather than isolated facts.',
        [
          'The body survives through interaction across systems, not through isolated organs acting alone.',
          'A strong anatomical explanation connects structure, protection, movement, and regulation in one coherent picture.',
        ],
        'Skin, bone, muscle, and blood all contribute when a person avoids injury, heals, and returns to movement.',
        ['Why is systems thinking stronger than memorizing part lists?', 'How do protective systems still depend on other systems?'],
        ['Interaction matters.', 'Structure and function are linked.', 'Anatomy becomes clearer when learned as a network.'],
        22,
        ['systems thinking', 'homeostasis', 'anatomy', 'interaction'],
        ['present the defense-and-support body map']
      ),
    ],
  },
  quizQuestions: WEEK_ONE_QUIZ,
  interactiveTasks: [
    {
      id: 'body-w1-task-map',
      title: 'Label the body systems map',
      type: 'discussion',
      description: 'Use a body outline to place the major systems and explain one job for each.',
      skillLevels: ALL_LEVELS,
      estimatedMinutes: 20,
      resourceUrl: 'https://kidshealth.org/en/parents/body-basics.html',
      evidencePrompt: 'Take a photo or save a screenshot of the completed body map.',
    },
    {
      id: 'body-w1-task-bones',
      title: 'Measure structure and support',
      type: 'experiment',
      description: 'Compare height, wingspan, or hand span and talk about how skeleton structure supports movement.',
      skillLevels: ['intermediate', 'advanced', 'pro'],
      estimatedMinutes: 20,
      resourceUrl: 'https://www.niams.nih.gov/health-topics/kids/healthy-joints',
      evidencePrompt: 'Record one measurement and explain what it taught you about body structure.',
    },
  ],
  projectTemplates: [
    projectTemplate(
      'body-w1-project-poster',
      '{interest} body systems shield poster',
      'poster',
      'Create a poster that shows how skin and bones protect a body using examples from {interest}.',
      ALL_LEVELS,
      [
        'identify key parts of the integumentary and skeletal systems',
        'explain how protection and support work together',
        'communicate anatomy through clear visuals',
      ],
      ['poster paper', 'markers', 'labels', 'reference sheet'],
      [
        'Choose a theme from {interest}.',
        'Draw a body or character and label skin and skeletal protection features.',
        'Add callouts explaining support, structure, and protection.',
        'Share the poster and answer one audience question.',
      ],
      'If the learner already loves {interest}, the body map feels personal instead of abstract.',
      50
    ),
    projectTemplate(
      'body-w1-project-build',
      '{interest} moving skeleton model',
      'build',
      'Build a simple arm, hand, or whole-body frame model that shows how bones create support and movement pathways.',
      ['intermediate', 'advanced', 'pro'],
      [
        'model body structure with household materials',
        'identify joints or flexible connections',
        'explain how structure affects movement',
      ],
      ['cardboard', 'paper fasteners or string', 'markers', 'scissors'],
      [
        'Choose a skeleton part to model.',
        'Sketch the structure and where movement happens.',
        'Build the model and add labels.',
        'Explain how the structure would help in a real body.',
      ],
      'The model turns {interest} into a doorway for anatomy, design, and explanation.',
      60
    ),
  ],
  weeklyProject: {
    title: 'Build a body systems museum card',
    drivingQuestion: 'How can we teach someone else that skin and bones are part of a bigger survival team?',
    deliverables: [
      'A labeled body systems visual',
      'A short explanation of protection and support',
      'One reflection on how your own body uses these systems every day',
    ],
    skillLevelNotes: {
      foundation: 'Keep the model simple and picture-heavy.',
      intermediate: 'Use labels and one compare/contrast sentence.',
      advanced: 'Add anatomy vocabulary and evidence from observation.',
      pro: 'Connect structure, function, and systems interaction explicitly.',
    },
  },
};

const HUMAN_BODY_WEEKS: WeekCurriculum[] = [
  WEEK_ONE,
  {
    weekNumber: 2,
    title: 'Movement Team: Muscles and Nerves',
    subjects: ['science', 'math', 'communication', 'integration'],
    overview: {
      weekNumber: 2,
      title: 'Movement Team: Muscles and Nerves',
      learningTargets: [
        { subject: 'science', icon: '🧠', skills: ['nervous system', 'muscular system', 'reaction and control'] },
        { subject: 'math', icon: '⏱️', skills: ['reaction timing', 'compare data', 'simple averages'] },
        { subject: 'communication', icon: '🗣️', skills: ['explain signals', 'describe reflexes', 'teach a model'] },
        { subject: 'integration', icon: '🔗', skills: ['cause and effect', 'coordination', 'system interaction'] },
      ],
      safetyNotes: [
        { text: 'Use safe movement only and stop if any activity causes discomfort.', priority: 'warning' },
        { text: 'Do not strike reflex points hard; keep testing gentle and observational.', priority: 'info' },
      ],
    },
    tasksBySkillLevel: {
      foundation: [
        { stepNumber: 1, description: 'Name muscles you use when you walk, smile, and jump.' },
        { stepNumber: 2, description: 'Learn that the brain, spinal cord, and nerves send messages.' },
        { stepNumber: 3, description: 'Do a simple reaction game and talk about fast body signals.' },
        { stepNumber: 4, description: 'Build a puppet, hand model, or movement map.' },
      ],
      intermediate: [
        { stepNumber: 1, description: 'Compare voluntary and involuntary muscle actions.' },
        { stepNumber: 2, description: 'Trace how a message travels from sense organ to brain to muscle.' },
        { stepNumber: 3, description: 'Measure reaction time across a few trials.' },
        { stepNumber: 4, description: 'Explain how the nervous and muscular systems cooperate.' },
      ],
      advanced: [
        { stepNumber: 1, description: 'Describe neurons, spinal cord pathways, and simple reflex arcs.' },
        { stepNumber: 2, description: 'Differentiate skeletal, smooth, and cardiac muscle.' },
        { stepNumber: 3, description: 'Collect and compare reaction-time data or movement observations.' },
        { stepNumber: 4, description: 'Use a model to explain coordinated movement and feedback.' },
      ],
      pro: [
        { stepNumber: 1, description: 'Analyze control loops linking sensation, processing, and motor output.' },
        { stepNumber: 2, description: 'Explain why reflexes can bypass slower conscious pathways.' },
        { stepNumber: 3, description: 'Connect signal speed, muscle action, and training or practice effects.' },
        { stepNumber: 4, description: 'Present a clear movement-systems explanation for a chosen activity.' },
      ],
    },
    codeRequiredByLevel: { foundation: false, intermediate: false, advanced: false, pro: false },
    evidence: {
      weekNumber: 2,
      items: [
        { id: 'body-w2-ev1', label: 'Reaction-time chart or note sheet', isRequired: true },
        { id: 'body-w2-ev2', label: 'Muscle and nerve model or sketch', isRequired: true },
        { id: 'body-w2-ev3', label: 'Explanation of voluntary vs involuntary action', isRequired: true },
        { id: 'body-w2-ev4', label: 'Voice note describing a reflex', isRequired: false },
      ],
    },
    rubric: {
      weekNumber: 2,
      criteria: [
        {
          id: 'body-w2-r1',
          name: 'Signal Path Understanding',
          description: 'Explains how information moves from sensing to action.',
          levels: {
            E: 'Names parts only.',
            D: 'Shows a partial path.',
            P: 'Explains the signal path clearly.',
            M: 'Explains the path and compares variations like reflexes.',
          },
        },
        {
          id: 'body-w2-r2',
          name: 'Movement Model',
          description: 'Shows how muscles and nerves work together.',
          levels: {
            E: 'Model is unclear.',
            D: 'Model shows one idea.',
            P: 'Model shows coordinated movement clearly.',
            M: 'Model is detailed and accurately teaches others.',
          },
        },
        {
          id: 'body-w2-r3',
          name: 'Data Use',
          description: 'Uses simple timing or comparison data.',
          levels: {
            E: 'Data is missing.',
            D: 'Data is collected but not interpreted.',
            P: 'Data is collected and explained.',
            M: 'Data is compared thoughtfully to draw insight.',
          },
        },
        {
          id: 'body-w2-r4',
          name: 'Reflection',
          description: 'Reflects on practice, coordination, and improvement.',
          levels: {
            E: 'Needs prompting.',
            D: 'Shares one simple thought.',
            P: 'Reflects clearly on movement and signals.',
            M: 'Uses reflection to improve the model or explanation.',
          },
        },
      ],
      unlockRule:
        'Complete a movement model, include one timing or observation record, and reach P or higher on 3/4 criteria.',
    },
    materials: {
      weekNumber: 2,
      items: [
        { id: 'body-w2-m1', name: 'String, elastic, or paper fasteners' },
        { id: 'body-w2-m2', name: 'Timer or stopwatch' },
        { id: 'body-w2-m3', name: 'Paper or notebook' },
        { id: 'body-w2-m4', name: 'Markers or labels' },
      ],
    },
    dailyFlow: {
      weekNumber: 2,
      days: [
        { day: 'Monday', activities: 'meet muscles, brain, spinal cord, and nerves', duration: 40 },
        { day: 'Tuesday', activities: 'try reaction-time and reflex observations', duration: 40 },
        { day: 'Wednesday', activities: 'build a hand or arm pull-string model', duration: 45 },
        { day: 'Thursday', activities: 'compare voluntary and involuntary actions', duration: 35 },
        { day: 'Friday', activities: 'teach how messages become movement', duration: 35 },
      ],
    },
    essentialQuestions: [
      'How does the body turn information into movement?',
      'Why do nerves and muscles need each other?',
    ],
    flashcards: [
      { id: 'body-w2-f1', front: 'Neuron', back: 'A cell that carries nerve signals.', skillLevels: ['intermediate', 'advanced', 'pro'] },
      { id: 'body-w2-f2', front: 'Reflex', back: 'A rapid response that can happen before full conscious processing.', skillLevels: ['foundation', 'intermediate', 'advanced', 'pro'] },
      { id: 'body-w2-f3', front: 'Skeletal muscle', back: 'The muscle type that helps move bones.', skillLevels: ALL_LEVELS },
      { id: 'body-w2-f4', front: 'Spinal cord', back: 'A major pathway carrying signals between brain and body.', skillLevels: ALL_LEVELS },
    ],
    canonicalLessonsBySkillLevel: {
      foundation: [
        lesson(
          'body-w2-foundation-lesson',
          'Monday',
          'Messages help us move',
          'By the end, you can explain that the brain and nerves send messages to muscles.',
          [
            'When you decide to move, your body sends messages from the brain through nerves.',
            'Muscles respond to those messages so you can jump, smile, grab, or walk.',
          ],
          'Touch a table and pull your hand away if it feels too hot. Signals and muscles work together quickly.',
          ['What sends the message?', 'What body part does the moving?'],
          ['Messages travel.', 'Muscles respond.', 'Movement is teamwork.'],
          15,
          ['brain', 'nerves', 'muscles', 'movement'],
          ['meet muscles, brain, spinal cord, and nerves']
        ),
      ],
      intermediate: [
        lesson(
          'body-w2-intermediate-lesson',
          'Tuesday',
          'From signal to action',
          'By the end, you can trace a simple path from sensing something to moving in response.',
          [
            'The nervous system gathers information through sense organs and carries it to the brain or spinal cord.',
            'The muscular system uses that information to create movement.',
          ],
          'Seeing a ball come toward you leads to a fast message pathway that helps you catch or avoid it.',
          ['What happens first: sensing or movement?', 'Why does the body need both systems?'],
          ['Information comes before action.', 'Signals and muscles are linked.', 'Reaction can be practiced and measured.'],
          18,
          ['reaction', 'nervous system', 'muscular system'],
          ['try reaction-time and reflex observations']
        ),
      ],
      advanced: [
        lesson(
          'body-w2-advanced-lesson',
          'Wednesday',
          'Control and coordination',
          'By the end, you can compare reflexes, conscious movement, and different muscle types.',
          [
            'Not all movement is controlled the same way. Some actions are voluntary and some are automatic.',
            'Skeletal, smooth, and cardiac muscle each support different movement jobs in the body.',
          ],
          'Blinking to protect your eye is fast and protective, while writing your name takes intentional control.',
          ['How is a reflex different from a planned movement?', 'Which muscles move bones?'],
          ['Control systems vary.', 'Muscles are specialized.', 'Fast responses can protect the body.'],
          20,
          ['reflex', 'skeletal muscle', 'smooth muscle', 'cardiac muscle'],
          ['build a hand or arm pull-string model']
        ),
      ],
      pro: [
        lesson(
          'body-w2-pro-lesson',
          'Thursday',
          'Feedback loops in movement',
          'By the end, you can explain movement as a feedback system involving sensation, processing, and correction.',
          [
            'Complex movement depends on constant updates from the body and environment.',
            'The nervous and muscular systems work as a control loop, not a one-way command.',
          ],
          'Balancing on one foot works only because the body keeps sensing, adjusting, and firing new muscle actions.',
          ['Why is feedback necessary for stable movement?', 'What happens if the loop is delayed?'],
          ['Movement is dynamic.', 'Feedback improves control.', 'Coordination depends on continuous sensing and adjustment.'],
          22,
          ['feedback', 'coordination', 'control loop'],
          ['compare voluntary and involuntary actions']
        ),
      ],
    },
    interactiveTasks: [
      {
        id: 'body-w2-task-reaction',
        title: 'Reaction-time challenge',
        type: 'game',
        description: 'Run a simple reaction-time test and compare repeated trials.',
        skillLevels: ['intermediate', 'advanced', 'pro'],
        estimatedMinutes: 15,
        resourceUrl: 'https://www.ninds.nih.gov/health-information/patient-caregiver-education/brain-basics-know-your-brain',
      },
      {
        id: 'body-w2-task-movement',
        title: 'String-and-cardboard hand model',
        type: 'model-build',
        description: 'Create a hand or arm model that shows how pulling a line can create movement.',
        skillLevels: ALL_LEVELS,
        estimatedMinutes: 25,
      },
    ],
    projectTemplates: [
      projectTemplate(
        'body-w2-project-sport',
        '{interest} reaction lab',
        'experiment',
        'Create a reaction or movement investigation connected to {interest} and explain which systems are cooperating.',
        ['intermediate', 'advanced', 'pro'],
        [
          'measure or compare a movement response',
          'identify nervous and muscular system roles',
          'communicate a result clearly',
        ],
        ['timer', 'paper', '{interest}-related object if available'],
        [
          'Choose a movement connected to {interest}.',
          'Run several short trials.',
          'Record what happened.',
          'Explain which body systems made the movement possible.',
        ],
        'If {interest} already matters to the learner, movement science becomes easier to remember and discuss.',
        45
      ),
      projectTemplate(
        'body-w2-project-comic',
        '{interest} nerve-message comic',
        'comic',
        'Tell the story of a signal moving through the body using a comic, storyboard, or motion sequence themed around {interest}.',
        ALL_LEVELS,
        [
          'trace a signal path',
          'show cause and effect',
          'teach anatomy creatively',
        ],
        ['paper', 'pens', 'speech bubbles or panels'],
        [
          'Choose a movement scene connected to {interest}.',
          'Show the body sensing something.',
          'Show the signal traveling.',
          'Show muscles acting and the final movement.',
        ],
        'The story frame lets {interest} carry the explanation without weakening the science.',
        50
      ),
    ],
    weeklyProject: {
      title: 'Explain a movement',
      drivingQuestion: 'How does the body turn information into action?',
      deliverables: [
        'A movement or nerve-path model',
        'A simple data or observation record',
        'A teach-back explanation',
      ],
      skillLevelNotes: {
        foundation: 'Use pictures, gestures, and a simple talk-through.',
        intermediate: 'Add labels and one timing comparison.',
        advanced: 'Use system vocabulary and explain reflex vs voluntary action.',
        pro: 'Use feedback-loop language and a structured explanation.',
      },
    },
  },
  {
    weekNumber: 3,
    title: 'Signals and Supply: Endocrine and Cardiovascular',
    subjects: ['science', 'math', 'communication', 'integration'],
    overview: {
      weekNumber: 3,
      title: 'Signals and Supply: Endocrine and Cardiovascular',
      learningTargets: [
        { subject: 'science', icon: '🫀', skills: ['heart and vessels', 'blood transport', 'hormone signaling'] },
        { subject: 'math', icon: '📈', skills: ['pulse counting', 'rate comparison', 'simple graphs'] },
        { subject: 'communication', icon: '🗣️', skills: ['transport explanations', 'diagram labels', 'cause and effect'] },
        { subject: 'integration', icon: '🔗', skills: ['message systems', 'transport systems', 'whole-body balance'] },
      ],
      safetyNotes: [
        { text: 'Use gentle exercise only when taking pulse or heart-rate observations.', priority: 'warning' },
      ],
    },
    tasksBySkillLevel: {
      foundation: [
        { stepNumber: 1, description: 'Learn that the heart pumps blood around the body.' },
        { stepNumber: 2, description: 'Notice that glands send chemical messages called hormones.' },
        { stepNumber: 3, description: 'Take a pulse before and after light movement.' },
        { stepNumber: 4, description: 'Build a red-and-blue transport path model.' },
      ],
      intermediate: [
        { stepNumber: 1, description: 'Trace blood flow between heart, lungs, and body.' },
        { stepNumber: 2, description: 'Compare fast nerve signals with slower hormone messages.' },
        { stepNumber: 3, description: 'Graph pulse changes or compare rest vs movement.' },
        { stepNumber: 4, description: 'Explain how transport and signaling support homeostasis.' },
      ],
      advanced: [
        { stepNumber: 1, description: 'Describe the roles of heart, vessels, blood, and key endocrine glands.' },
        { stepNumber: 2, description: 'Connect oxygen, nutrients, hormones, and waste movement to survival.' },
        { stepNumber: 3, description: 'Use evidence from pulse or circulation activities to support explanation.' },
        { stepNumber: 4, description: 'Produce a systems map of messaging and transport.' },
      ],
      pro: [
        { stepNumber: 1, description: 'Compare nervous, endocrine, and cardiovascular communication pathways.' },
        { stepNumber: 2, description: 'Analyze how rate, delivery, and feedback affect whole-body regulation.' },
        { stepNumber: 3, description: 'Interpret simple heart-rate data or transport diagrams critically.' },
        { stepNumber: 4, description: 'Design a high-clarity explanation of hormones and circulation working together.' },
      ],
    },
    codeRequiredByLevel: { foundation: false, intermediate: false, advanced: false, pro: false },
    evidence: {
      weekNumber: 3,
      items: [
        { id: 'body-w3-ev1', label: 'Pulse or movement-rate observation', isRequired: true },
        { id: 'body-w3-ev2', label: 'Heart and blood flow diagram', isRequired: true },
        { id: 'body-w3-ev3', label: 'Hormone signaling explanation', isRequired: true },
        { id: 'body-w3-ev4', label: 'Reflection on body messaging and transport', isRequired: true },
      ],
    },
    rubric: {
      weekNumber: 3,
      criteria: [
        {
          id: 'body-w3-r1',
          name: 'Transport Understanding',
          description: 'Explains how blood moves materials through the body.',
          levels: { E: 'Lists parts only.', D: 'Shows some flow.', P: 'Explains flow clearly.', M: 'Explains flow and links it to survival and regulation.' },
        },
        {
          id: 'body-w3-r2',
          name: 'Signal Comparison',
          description: 'Compares hormone messages with other signaling systems.',
          levels: { E: 'Recognizes signals vaguely.', D: 'Gives one simple comparison.', P: 'Compares accurately.', M: 'Compares pathways and timing with precision.' },
        },
        {
          id: 'body-w3-r3',
          name: 'Use of Evidence',
          description: 'Uses pulse or diagram evidence to support explanation.',
          levels: { E: 'Little evidence used.', D: 'Evidence is partial.', P: 'Evidence supports explanation.', M: 'Evidence is interpreted thoughtfully.' },
        },
        {
          id: 'body-w3-r4',
          name: 'Clarity',
          description: 'Communicates a clear systems map or explanation.',
          levels: { E: 'Difficult to follow.', D: 'Partly clear.', P: 'Clear and organized.', M: 'Very clear, accurate, and teachable.' },
        },
      ],
      unlockRule:
        'Complete a heart or hormone explanation, include one data point or diagram, and reach P or higher on 3/4 criteria.',
    },
    materials: {
      weekNumber: 3,
      items: [
        { id: 'body-w3-m1', name: 'Timer' },
        { id: 'body-w3-m2', name: 'Red and blue yarn or markers' },
        { id: 'body-w3-m3', name: 'Paper or slides' },
        { id: 'body-w3-m4', name: 'Heart diagram reference' },
      ],
    },
    dailyFlow: {
      weekNumber: 3,
      days: [
        { day: 'Monday', activities: 'meet the heart, blood, and vessels', duration: 40 },
        { day: 'Tuesday', activities: 'track pulse before and after light movement', duration: 35 },
        { day: 'Wednesday', activities: 'learn endocrine glands and hormone messages', duration: 40 },
        { day: 'Thursday', activities: 'compare fast and slow body messaging systems', duration: 35 },
        { day: 'Friday', activities: 'build a transport-and-signals systems map', duration: 40 },
      ],
    },
    essentialQuestions: [
      'How does the body move materials and messages where they need to go?',
      'Why do some body messages travel through nerves while others travel through blood?',
    ],
    flashcards: [
      { id: 'body-w3-f1', front: 'Cardiovascular system', back: 'The heart, blood vessels, and blood working together to transport materials.', skillLevels: ALL_LEVELS },
      { id: 'body-w3-f2', front: 'Endocrine system', back: 'A system of glands that regulates the body with hormones.', skillLevels: ALL_LEVELS },
      { id: 'body-w3-f3', front: 'Hormone', back: 'A chemical messenger carried in the bloodstream.', skillLevels: ['intermediate', 'advanced', 'pro'] },
      { id: 'body-w3-f4', front: 'Pulse', back: 'The beat you can feel as the heart pushes blood through arteries.', skillLevels: ALL_LEVELS },
    ],
    canonicalLessonsBySkillLevel: {
      foundation: [
        lesson(
          'body-w3-foundation-lesson',
          'Monday',
          'The heart is a pump',
          'By the end, you can explain that the heart helps move blood around the body.',
          [
            'The heart pumps blood through tubes called blood vessels.',
            'Blood carries oxygen and food to body parts that need them.',
          ],
          'When you run, your heart beats faster because your body parts need supplies more quickly.',
          ['What does blood carry?', 'What happens to your pulse when you move?'],
          ['The heart pumps.', 'Blood transports supplies.', 'Movement changes heart rate.'],
          15,
          ['heart', 'blood', 'pulse'],
          ['meet the heart, blood, and vessels']
        ),
      ],
      intermediate: [
        lesson(
          'body-w3-intermediate-lesson',
          'Wednesday',
          'Chemical messages',
          'By the end, you can explain that endocrine glands send hormones through the bloodstream.',
          [
            'Hormones are chemical messages made by glands like the pancreas and thyroid.',
            'These messages travel more slowly than nerve signals but can affect many parts of the body.',
          ],
          'Feeling hungry or growing taller over time depends on body messages, not just quick nerve signals.',
          ['What is a hormone?', 'How is a hormone message different from a nerve signal?'],
          ['Glands send hormones.', 'Hormones travel in blood.', 'Different message systems have different speeds.'],
          18,
          ['endocrine', 'hormones', 'glands'],
          ['learn endocrine glands and hormone messages']
        ),
      ],
      advanced: [
        lesson(
          'body-w3-advanced-lesson',
          'Thursday',
          'Transport and regulation',
          'By the end, you can explain how cardiovascular and endocrine systems both support homeostasis.',
          [
            'The cardiovascular system transports materials and the endocrine system adjusts body processes with chemical signals.',
            'Together they help maintain balance across energy, growth, stress response, and daily function.',
          ],
          'A hormone can change how tissues use energy, but the bloodstream is what delivers that message everywhere it is needed.',
          ['Why does hormone signaling depend on circulation?', 'What body functions need regulation over time?'],
          ['Transport and regulation are linked.', 'Blood is a delivery route.', 'Homeostasis depends on coordination.'],
          20,
          ['homeostasis', 'circulation', 'hormones'],
          ['compare fast and slow body messaging systems']
        ),
      ],
      pro: [
        lesson(
          'body-w3-pro-lesson',
          'Friday',
          'Networks of communication',
          'By the end, you can compare body communication networks by speed, reach, and function.',
          [
            'The nervous system, endocrine system, and cardiovascular transport network each solve different communication problems.',
            'A mature explanation compares route, timing, target range, and feedback effects.',
          ],
          'A reflex uses fast electrical signaling, while growth regulation uses slower hormones delivered through circulation.',
          ['Why is one body communication system not enough?', 'How do route and speed change function?'],
          ['Different problems need different networks.', 'Timing changes what a system can do.', 'Body regulation depends on layered communication.'],
          22,
          ['communication networks', 'feedback', 'regulation'],
          ['build a transport-and-signals systems map']
        ),
      ],
    },
    interactiveTasks: [
      {
        id: 'body-w3-task-heart',
        title: 'Pulse and transport observation',
        type: 'experiment',
        description: 'Count pulse at rest and after light movement, then explain what changed.',
        skillLevels: ALL_LEVELS,
        estimatedMinutes: 15,
        resourceUrl: 'https://www.nhlbi.nih.gov/health/heart/blood-flow',
      },
      {
        id: 'body-w3-task-route',
        title: 'Red-and-blue blood route build',
        type: 'model-build',
        description: 'Use color to model blood flow to lungs and the rest of the body.',
        skillLevels: ALL_LEVELS,
        estimatedMinutes: 20,
      },
    ],
    projectTemplates: [
      projectTemplate(
        'body-w3-project-map',
        '{interest} delivery-route map',
        'presentation',
        'Turn the body into a delivery-and-messaging network using the theme of {interest}.',
        ALL_LEVELS,
        [
          'model transport and messaging',
          'show paths clearly',
          'teach systems interaction',
        ],
        ['paper or slides', 'markers', 'arrows', 'labels'],
        [
          'Choose a delivery idea from {interest}.',
          'Map how supplies and messages travel.',
          'Label what the heart, blood, and glands do.',
          'Share the map as if you are a guide or commentator.',
        ],
        '{interest} gives the learner a concrete transport story to attach to physiology.',
        50
      ),
      projectTemplate(
        'body-w3-project-graph',
        '{interest} pulse-and-performance graph',
        'research',
        'Collect a small set of pulse data connected to {interest} and explain what it suggests about body response.',
        ['intermediate', 'advanced', 'pro'],
        [
          'collect a simple data set',
          'represent change clearly',
          'connect data to cardiovascular function',
        ],
        ['timer', 'paper or spreadsheet', '{interest}-related movement if appropriate'],
        [
          'Choose a safe movement linked to {interest}.',
          'Take pulse observations.',
          'Record or graph the results.',
          'Explain what the body needed during the activity.',
        ],
        'The project lets {interest} shape the example while the science target stays fixed.',
        45
      ),
    ],
    weeklyProject: {
      title: 'Build a body logistics map',
      drivingQuestion: 'How does the body move both materials and messages fast enough to stay alive?',
      deliverables: [
        'A circulation and signaling model',
        'One explanation of hormones vs blood transport',
        'A short data note or pulse observation',
      ],
      skillLevelNotes: {
        foundation: 'Keep the focus on the heart as a pump and blood as a carrier.',
        intermediate: 'Add one clear hormone example.',
        advanced: 'Connect transport to homeostasis.',
        pro: 'Compare communication systems precisely.',
      },
    },
  },
  {
    weekNumber: 4,
    title: 'Air and Fuel: Respiratory and Digestive',
    subjects: ['science', 'communication', 'arts', 'integration'],
    overview: {
      weekNumber: 4,
      title: 'Air and Fuel: Respiratory and Digestive',
      learningTargets: [
        { subject: 'science', icon: '🫁', skills: ['breathing path', 'gas exchange', 'digestion', 'absorption'] },
        { subject: 'communication', icon: '🗣️', skills: ['trace pathways', 'compare processes', 'explain energy'] },
        { subject: 'arts', icon: '🎨', skills: ['sequence diagrams', 'flow posters'] },
        { subject: 'integration', icon: '🔗', skills: ['oxygen and food links', 'energy reasoning', 'body needs'] },
      ],
      safetyNotes: [
        { text: 'Avoid food-based demos if allergies are present.', priority: 'warning' },
      ],
    },
    tasksBySkillLevel: {
      foundation: [
        { stepNumber: 1, description: 'Trace where air goes when you breathe in.' },
        { stepNumber: 2, description: 'Trace where food goes after you chew and swallow.' },
        { stepNumber: 3, description: 'Build a simple lungs or digestion path model.' },
        { stepNumber: 4, description: 'Explain how air and food help the body make energy.' },
      ],
      intermediate: [
        { stepNumber: 1, description: 'Compare the jobs of lungs and digestive organs.' },
        { stepNumber: 2, description: 'Use a sequence chart for breathing and digestion pathways.' },
        { stepNumber: 3, description: 'Explain gas exchange and nutrient absorption in simple terms.' },
        { stepNumber: 4, description: 'Show how respiratory and digestive systems support cells together.' },
      ],
      advanced: [
        { stepNumber: 1, description: 'Describe trachea, lungs, alveoli, stomach, intestines, and liver with function.' },
        { stepNumber: 2, description: 'Explain how oxygen enters blood and nutrients enter circulation.' },
        { stepNumber: 3, description: 'Analyze the difference between mechanical and chemical digestion.' },
        { stepNumber: 4, description: 'Build a clear whole-pathway explanation from outside world to cell use.' },
      ],
      pro: [
        { stepNumber: 1, description: 'Compare exchange surfaces and transport interfaces in respiratory and digestive systems.' },
        { stepNumber: 2, description: 'Explain why breathing and digestion both depend on circulation to finish the job.' },
        { stepNumber: 3, description: 'Use system links to explain energy availability and waste production.' },
        { stepNumber: 4, description: 'Produce a concise “air and fuel” systems explanation for a public audience.' },
      ],
    },
    codeRequiredByLevel: { foundation: false, intermediate: false, advanced: false, pro: false },
    evidence: {
      weekNumber: 4,
      items: [
        { id: 'body-w4-ev1', label: 'Air-path or food-path diagram', isRequired: true },
        { id: 'body-w4-ev2', label: 'Lungs or digestion model photo', isRequired: true },
        { id: 'body-w4-ev3', label: 'Explanation of oxygen and nutrients reaching the body', isRequired: true },
        { id: 'body-w4-ev4', label: 'Reflection on energy and body needs', isRequired: true },
      ],
    },
    rubric: {
      weekNumber: 4,
      criteria: [
        {
          id: 'body-w4-r1',
          name: 'Pathway Clarity',
          description: 'Accurately traces breathing and digestion pathways.',
          levels: { E: 'Sequence is unclear.', D: 'Partial sequence shown.', P: 'Sequence is clear.', M: 'Sequence is clear and connected to other systems.' },
        },
        {
          id: 'body-w4-r2',
          name: 'Exchange Understanding',
          description: 'Explains what enters the body and where it goes next.',
          levels: { E: 'Gives vague ideas.', D: 'Names some inputs.', P: 'Explains oxygen and nutrient entry clearly.', M: 'Explains entry, transfer, and significance precisely.' },
        },
        {
          id: 'body-w4-r3',
          name: 'Model Quality',
          description: 'Creates a useful visual or physical model.',
          levels: { E: 'Model is incomplete.', D: 'Model shows the basics.', P: 'Model is clear and accurate.', M: 'Model is clear, accurate, and especially teachable.' },
        },
        {
          id: 'body-w4-r4',
          name: 'Integration',
          description: 'Links respiration and digestion to the rest of the body.',
          levels: { E: 'Systems are treated separately only.', D: 'One connection is made.', P: 'Several connections are made clearly.', M: 'Connections are accurate, deep, and real-world relevant.' },
        },
      ],
      unlockRule:
        'Trace both pathways, complete one model, and reach P or higher on 3/4 criteria.',
    },
    materials: {
      weekNumber: 4,
      items: [
        { id: 'body-w4-m1', name: 'Paper or poster board' },
        { id: 'body-w4-m2', name: 'Balloons or model materials' },
        { id: 'body-w4-m3', name: 'Markers' },
        { id: 'body-w4-m4', name: 'Body-system reference sheet' },
      ],
    },
    dailyFlow: {
      weekNumber: 4,
      days: [
        { day: 'Monday', activities: 'follow air into the body and out again', duration: 40 },
        { day: 'Tuesday', activities: 'build or test a simple lungs model', duration: 40 },
        { day: 'Wednesday', activities: 'trace food through digestive organs', duration: 40 },
        { day: 'Thursday', activities: 'compare digestion, absorption, and transport', duration: 40 },
        { day: 'Friday', activities: 'present the air-and-fuel pathway poster', duration: 35 },
      ],
    },
    essentialQuestions: [
      'How do oxygen and food become usable by the body?',
      'Why do breathing and digestion still depend on other systems?',
    ],
    flashcards: [
      { id: 'body-w4-f1', front: 'Respiratory system', back: 'The system that exchanges oxygen and carbon dioxide.', skillLevels: ALL_LEVELS },
      { id: 'body-w4-f2', front: 'Digestive system', back: 'The system that breaks down food and absorbs nutrients.', skillLevels: ALL_LEVELS },
      { id: 'body-w4-f3', front: 'Alveoli', back: 'Tiny air sacs in the lungs where gas exchange happens.', skillLevels: ['intermediate', 'advanced', 'pro'] },
      { id: 'body-w4-f4', front: 'Absorption', back: 'The process of nutrients entering the body from digested food.', skillLevels: ['intermediate', 'advanced', 'pro'] },
    ],
    canonicalLessonsBySkillLevel: {
      foundation: [
        lesson(
          'body-w4-foundation-lesson',
          'Monday',
          'Air in, air out',
          'By the end, you can trace the path air takes into the lungs.',
          [
            'Breathing brings oxygen into the body and helps remove carbon dioxide.',
            'The lungs help the body get the air it needs to stay alive.',
          ],
          'Blowing up a balloon helps you think about air moving into and out of a space, even though lungs are more complex.',
          ['What gas does the body need?', 'What do lungs help us do?'],
          ['Breathing matters.', 'Lungs exchange gases.', 'The body needs oxygen.'],
          15,
          ['lungs', 'breathing', 'oxygen'],
          ['follow air into the body and out again']
        ),
      ],
      intermediate: [
        lesson(
          'body-w4-intermediate-lesson',
          'Wednesday',
          'Food to fuel',
          'By the end, you can explain that digestion breaks food into smaller parts the body can use.',
          [
            'The digestive system breaks down food and helps nutrients enter the body.',
            'Food does not help the body simply by being swallowed; it has to be processed and absorbed.',
          ],
          'Chewing starts digestion, but the stomach and intestines keep the process going.',
          ['Why is chewing not the whole job?', 'What does the body get from digestion?'],
          ['Digestion is a process.', 'Nutrients must be absorbed.', 'Food helps cells only after processing.'],
          18,
          ['digestion', 'absorption', 'food'],
          ['trace food through digestive organs']
        ),
      ],
      advanced: [
        lesson(
          'body-w4-advanced-lesson',
          'Thursday',
          'Exchange and absorption',
          'By the end, you can compare how the respiratory and digestive systems exchange useful materials with the body.',
          [
            'The lungs provide oxygen through gas exchange while the digestive system provides nutrients through absorption.',
            'Neither system works alone because circulation transports those materials onward.',
          ],
          'Alveoli and intestines are both specialized for exchange, even though they handle different substances.',
          ['How are lungs and intestines similar?', 'Why is blood important after exchange happens?'],
          ['Exchange surfaces are specialized.', 'Respiration and digestion connect to circulation.', 'Body systems solve related but different problems.'],
          20,
          ['gas exchange', 'absorption', 'circulation'],
          ['compare digestion, absorption, and transport']
        ),
      ],
      pro: [
        lesson(
          'body-w4-pro-lesson',
          'Friday',
          'Energy as a systems outcome',
          'By the end, you can explain why “breathing” and “eating” are not enough without systems integration.',
          [
            'Oxygen and nutrients become useful only when several systems coordinate: respiratory, digestive, cardiovascular, and cellular processes.',
            'A strong explanation follows materials from the outside world through exchange, transport, and eventual use.',
          ],
          'A meal and a breath both matter, but neither helps muscles work unless materials reach the right places in time.',
          ['Why is “I ate food” not the end of the story?', 'What systems complete the path to usable energy?'],
          ['Energy depends on systems coordination.', 'Pathway thinking matters.', 'Integration gives biology explanatory power.'],
          22,
          ['energy', 'integration', 'transport', 'exchange'],
          ['present the air-and-fuel pathway poster']
        ),
      ],
    },
    interactiveTasks: [
      {
        id: 'body-w4-task-lungs',
        title: 'Simple breathing model',
        type: 'model-build',
        description: 'Build a balloon or paper breathing model to visualize air movement.',
        skillLevels: ALL_LEVELS,
        estimatedMinutes: 20,
        resourceUrl: 'https://www.nhlbi.nih.gov/health/lungs/respiratory-system',
      },
      {
        id: 'body-w4-task-digestive',
        title: 'Food pathway sequence challenge',
        type: 'discussion',
        description: 'Put digestive organs in order and explain what each one contributes.',
        skillLevels: ALL_LEVELS,
        estimatedMinutes: 15,
        resourceUrl: 'https://medlineplus.gov/digestivesystem.html',
      },
    ],
    projectTemplates: [
      projectTemplate(
        'body-w4-project-poster',
        '{interest} air-and-fuel flow poster',
        'poster',
        'Create a visual path showing how air and food support the body through a {interest}-themed story.',
        ALL_LEVELS,
        [
          'trace two body pathways',
          'compare exchange and absorption',
          'communicate systems links clearly',
        ],
        ['poster paper', 'markers', 'labels'],
        [
          'Choose a theme from {interest}.',
          'Map the breathing path.',
          'Map the digestion path.',
          'Show where the two paths connect to the rest of the body.',
        ],
        'Using {interest} turns pathway tracing into a narrative the learner already cares about.',
        50
      ),
      projectTemplate(
        'body-w4-project-model',
        '{interest} lungs or digestion model',
        'model',
        'Build a simple lungs, stomach, or intestine model inspired by {interest} and explain how it works.',
        ALL_LEVELS,
        [
          'construct a model',
          'identify core organs and functions',
          'teach the pathway clearly',
        ],
        ['household craft materials', 'labels', 'notebook'],
        [
          'Pick one system pathway.',
          'Choose a {interest}-inspired design idea.',
          'Build and label the model.',
          'Record a short explanation or demonstration.',
        ],
        'The science stays fixed, while {interest} shapes the look and feel of the project.',
        55
      ),
    ],
    weeklyProject: {
      title: 'Trace the path to energy',
      drivingQuestion: 'How do the body’s air and food pathways become useful to the rest of the body?',
      deliverables: [
        'A pathway visual or model',
        'One explanation linking oxygen, nutrients, and circulation',
        'A short reflection on what the body needs to stay active',
      ],
      skillLevelNotes: {
        foundation: 'Use simple arrows and labels.',
        intermediate: 'Use clear organ names and one compare/contrast statement.',
        advanced: 'Explain exchange and absorption accurately.',
        pro: 'Explain systems integration, not just organ order.',
      },
    },
  },
  {
    weekNumber: 5,
    title: 'Defense and Filtration: Immune, Lymphatic, and Urinary',
    subjects: ['science', 'communication', 'integration', 'leadership'],
    overview: {
      weekNumber: 5,
      title: 'Defense and Filtration: Immune, Lymphatic, and Urinary',
      learningTargets: [
        { subject: 'science', icon: '🛡️', skills: ['immune defense', 'lymphatic return', 'kidney filtration'] },
        { subject: 'communication', icon: '🗣️', skills: ['problem-solution explanation', 'sequence language', 'health vocabulary'] },
        { subject: 'integration', icon: '🔗', skills: ['balance', 'waste removal', 'body protection'] },
        { subject: 'leadership', icon: '⭐', skills: ['self-care understanding', 'explaining wellness choices'] },
      ],
      safetyNotes: [
        { text: 'Use clean water only for filtration demonstrations and do not drink demo liquids.', priority: 'warning' },
      ],
    },
    tasksBySkillLevel: {
      foundation: [
        { stepNumber: 1, description: 'Learn that the immune system helps fight germs.' },
        { stepNumber: 2, description: 'Learn that kidneys help clean blood and make urine.' },
        { stepNumber: 3, description: 'Build a simple filter model.' },
        { stepNumber: 4, description: 'Explain how the body protects and cleans itself.' },
      ],
      intermediate: [
        { stepNumber: 1, description: 'Compare immune defense, lymph return, and urinary filtration.' },
        { stepNumber: 2, description: 'Label kidneys, bladder, lymph nodes, and vessels on a body diagram.' },
        { stepNumber: 3, description: 'Use a filter analogy to explain waste removal and fluid balance.' },
        { stepNumber: 4, description: 'Create a body-defense and cleanup diagram.' },
      ],
      advanced: [
        { stepNumber: 1, description: 'Describe how lymphatic and immune systems cooperate against infection.' },
        { stepNumber: 2, description: 'Explain the role of kidneys in filtration and water balance.' },
        { stepNumber: 3, description: 'Compare filtration, return flow, and defense functions across systems.' },
        { stepNumber: 4, description: 'Produce a clear explanation of how the body detects and removes problems.' },
      ],
      pro: [
        { stepNumber: 1, description: 'Analyze the body as a protection-and-balance network involving multiple feedback systems.' },
        { stepNumber: 2, description: 'Compare immune threat response with urinary and lymphatic maintenance functions.' },
        { stepNumber: 3, description: 'Evaluate the usefulness and limits of simple filter analogies for physiology.' },
        { stepNumber: 4, description: 'Create a polished explanation of defense, drainage, and waste management in one system map.' },
      ],
    },
    codeRequiredByLevel: { foundation: false, intermediate: false, advanced: false, pro: false },
    evidence: {
      weekNumber: 5,
      items: [
        { id: 'body-w5-ev1', label: 'Filter model or demonstration notes', isRequired: true },
        { id: 'body-w5-ev2', label: 'Immune/lymphatic/urinary diagram', isRequired: true },
        { id: 'body-w5-ev3', label: 'Short explanation of how the body manages threats and waste', isRequired: true },
        { id: 'body-w5-ev4', label: 'Reflection on hydration, care, or body balance', isRequired: true },
      ],
    },
    rubric: {
      weekNumber: 5,
      criteria: [
        {
          id: 'body-w5-r1',
          name: 'Protection Understanding',
          description: 'Explains how the body responds to germs or threats.',
          levels: { E: 'Knows germs are bad.', D: 'Gives one partial defense idea.', P: 'Explains defense clearly.', M: 'Explains defense and coordination deeply.' },
        },
        {
          id: 'body-w5-r2',
          name: 'Filtration Understanding',
          description: 'Explains kidneys, urine, and/or fluid balance clearly.',
          levels: { E: 'Gives vague ideas.', D: 'Mentions kidneys simply.', P: 'Explains filtration clearly.', M: 'Explains filtration and regulation precisely.' },
        },
        {
          id: 'body-w5-r3',
          name: 'Model Quality',
          description: 'Uses an analogy or model carefully.',
          levels: { E: 'Model is confusing.', D: 'Model shows the basic idea.', P: 'Model is useful and clear.', M: 'Model is useful, clear, and critically explained.' },
        },
        {
          id: 'body-w5-r4',
          name: 'Integration',
          description: 'Links defense and cleanup functions across systems.',
          levels: { E: 'Systems remain separate.', D: 'One connection is shown.', P: 'Connections are clear.', M: 'Connections are deep and well reasoned.' },
        },
      ],
      unlockRule:
        'Complete a filtration or defense model, submit at least 3 evidence items, and reach P or higher on 3/4 criteria.',
    },
    materials: {
      weekNumber: 5,
      items: [
        { id: 'body-w5-m1', name: 'Coffee filters or strainers' },
        { id: 'body-w5-m2', name: 'Clear cups and water' },
        { id: 'body-w5-m3', name: 'Paper or notebook' },
        { id: 'body-w5-m4', name: 'Markers or labels' },
      ],
    },
    dailyFlow: {
      weekNumber: 5,
      days: [
        { day: 'Monday', activities: 'meet immune defenders and lymph pathways', duration: 40 },
        { day: 'Tuesday', activities: 'learn kidneys, bladder, and filtration', duration: 40 },
        { day: 'Wednesday', activities: 'build a simple filter analogy model', duration: 40 },
        { day: 'Thursday', activities: 'compare defense, drainage, and waste removal', duration: 35 },
        { day: 'Friday', activities: 'present a body cleanup and protection map', duration: 35 },
      ],
    },
    essentialQuestions: [
      'How does the body protect itself from threats?',
      'How does the body remove waste while keeping useful things balanced?',
    ],
    flashcards: [
      { id: 'body-w5-f1', front: 'Immune system', back: 'The system that helps detect and fight infections.', skillLevels: ALL_LEVELS },
      { id: 'body-w5-f2', front: 'Lymphatic system', back: 'A network that helps return fluid and supports immune defense.', skillLevels: ['intermediate', 'advanced', 'pro'] },
      { id: 'body-w5-f3', front: 'Urinary system', back: 'The system that filters blood, forms urine, and helps regulate water balance.', skillLevels: ALL_LEVELS },
      { id: 'body-w5-f4', front: 'Kidney', back: 'An organ that filters blood and helps regulate body fluids.', skillLevels: ALL_LEVELS },
    ],
    canonicalLessonsBySkillLevel: {
      foundation: [
        lesson(
          'body-w5-foundation-lesson',
          'Monday',
          'Protect and clean',
          'By the end, you can explain that the body has systems to fight germs and remove waste.',
          [
            'Your body is not passive. It has defenses that help against infection.',
            'It also has organs that help remove waste and keep balance.',
          ],
          'A house needs both a security team and a cleanup team. The body does too.',
          ['What helps fight germs?', 'What helps clean out waste?'],
          ['The body protects itself.', 'The body removes waste.', 'Different systems solve different problems.'],
          15,
          ['immune', 'kidney', 'waste', 'protection'],
          ['meet immune defenders and lymph pathways']
        ),
      ],
      intermediate: [
        lesson(
          'body-w5-intermediate-lesson',
          'Tuesday',
          'Kidneys and body balance',
          'By the end, you can explain that kidneys filter blood and help manage water balance.',
          [
            'The urinary system removes wastes, but it also helps the body keep the right balance of water.',
            'The kidneys are a major part of that filtering job.',
          ],
          'A filter can remove unwanted material, but the body has to keep useful liquid too, not just throw everything away.',
          ['Why can the body not simply lose all its water?', 'What do kidneys help decide?'],
          ['Kidneys filter blood.', 'Urinary system helps balance fluids.', 'Filtering is selective, not random.'],
          18,
          ['kidney', 'urinary', 'water balance'],
          ['learn kidneys, bladder, and filtration']
        ),
      ],
      advanced: [
        lesson(
          'body-w5-advanced-lesson',
          'Wednesday',
          'Defense, drainage, and filtration',
          'By the end, you can compare the jobs of immune, lymphatic, and urinary systems.',
          [
            'The immune system fights threats, the lymphatic system helps move fluid and supports immune cells, and the urinary system filters wastes from blood.',
            'These systems all help maintain internal balance even though they do not perform the same job.',
          ],
          'A swollen lymph node, the need to hydrate, and recovering from infection can all remind us that body balance depends on more than one system.',
          ['How are lymphatic and immune systems linked?', 'What is different about urinary filtration?'],
          ['Balance involves several systems.', 'Defense and filtering are linked but not identical.', 'Body maintenance is continuous.'],
          20,
          ['immune', 'lymphatic', 'urinary', 'balance'],
          ['build a simple filter analogy model']
        ),
      ],
      pro: [
        lesson(
          'body-w5-pro-lesson',
          'Thursday',
          'Maintenance networks',
          'By the end, you can explain body maintenance as a layered network of defense, drainage, and filtration.',
          [
            'High-level physiology is easier to understand when the body is treated as a maintenance system with multiple coordinated layers.',
            'Immune detection, lymph return, and kidney filtration together reduce threat, manage fluid, and preserve internal stability.',
          ],
          'A body dealing with infection and dehydration at the same time reveals why regulation and protection cannot be understood in isolation.',
          ['Why is a single-system explanation often too weak?', 'What does each maintenance layer contribute?'],
          ['Maintenance is layered.', 'Internal stability depends on coordination.', 'Good explanations compare related functions carefully.'],
          22,
          ['maintenance', 'filtration', 'immune response', 'fluid balance'],
          ['compare defense, drainage, and waste removal']
        ),
      ],
    },
    interactiveTasks: [
      {
        id: 'body-w5-task-filter',
        title: 'Build a cleanup filter analogy',
        type: 'experiment',
        description: 'Use a simple filter model to start a conversation about body cleanup and selection.',
        skillLevels: ALL_LEVELS,
        estimatedMinutes: 20,
        resourceUrl: 'https://medlineplus.gov/kidneysandurinarysystem.html',
      },
      {
        id: 'body-w5-task-immune',
        title: 'Immune defense sketch-notes',
        type: 'discussion',
        description: 'Draw or map how the body might notice and respond to germs.',
        skillLevels: ALL_LEVELS,
        estimatedMinutes: 15,
        resourceUrl: 'https://magazine.medlineplus.gov/multimedia/immune-system',
      },
    ],
    projectTemplates: [
      projectTemplate(
        'body-w5-project-map',
        '{interest} body defense map',
        'poster',
        'Create a map showing how the body protects, drains, and filters using a {interest}-based visual story.',
        ALL_LEVELS,
        [
          'compare related body systems',
          'show protection and cleanup roles',
          'communicate with labels and arrows',
        ],
        ['poster paper', 'markers', 'labels'],
        [
          'Choose a theme from {interest}.',
          'Assign one part of the story to immune defense, one to lymph flow, and one to kidney filtration.',
          'Use arrows and captions.',
          'Present how the systems cooperate.',
        ],
        'A familiar {interest} theme gives the learner a memorable frame for a more abstract biology topic.',
        45
      ),
      projectTemplate(
        'body-w5-project-build',
        '{interest} cleanup station model',
        'build',
        'Build a simple model or station that represents the body sorting threats, waste, and useful materials.',
        ['intermediate', 'advanced', 'pro'],
        [
          'model body maintenance functions',
          'distinguish wanted vs unwanted materials',
          'explain system roles clearly',
        ],
        ['cups', 'filters', 'labels', 'craft materials'],
        [
          'Choose a cleanup or sorting scene related to {interest}.',
          'Decide what stands for threats, wastes, and useful materials.',
          'Build the model.',
          'Explain the analogy and its limits.',
        ],
        '{interest} keeps the build playful while the explanation stays scientifically grounded.',
        50
      ),
    ],
    weeklyProject: {
      title: 'Explain body defense and cleanup',
      drivingQuestion: 'How does the body fight threats while keeping the inside world balanced?',
      deliverables: [
        'A defense/filter model or poster',
        'One explanation of immune, lymphatic, and urinary roles',
        'A short self-care or hydration reflection',
      ],
      skillLevelNotes: {
        foundation: 'Focus on simple protection and cleanup language.',
        intermediate: 'Add labels and one systems comparison.',
        advanced: 'Use terms like filtration, lymphatic, and fluid balance accurately.',
        pro: 'Explain the analogy limits and system coordination clearly.',
      },
    },
  },
  {
    weekNumber: 6,
    title: 'Growth and Life Cycles: Reproductive System and Whole-Body Integration',
    subjects: ['science', 'communication', 'sel', 'integration'],
    overview: {
      weekNumber: 6,
      title: 'Growth and Life Cycles: Reproductive System and Whole-Body Integration',
      learningTargets: [
        { subject: 'science', icon: '🌱', skills: ['life cycles', 'growth', 'reproductive system basics', 'system integration'] },
        { subject: 'communication', icon: '🗣️', skills: ['age-appropriate explanation', 'respectful vocabulary', 'public teaching'] },
        { subject: 'sel', icon: '💚', skills: ['body respect', 'privacy', 'confidence', 'healthy boundaries'] },
        { subject: 'integration', icon: '🔗', skills: ['whole-body reasoning', 'capstone synthesis', 'problem solving'] },
      ],
      safetyNotes: [
        { text: 'Keep reproductive-system discussions age-appropriate, respectful, and parent-guided where needed.', priority: 'warning' },
      ],
    },
    tasksBySkillLevel: {
      foundation: [
        { stepNumber: 1, description: 'Talk about growth, life cycles, and body respect using simple language.' },
        { stepNumber: 2, description: 'Review how many body systems work together every day.' },
        { stepNumber: 3, description: 'Choose a favorite system and explain one job it does.' },
        { stepNumber: 4, description: 'Build a final body museum card or mini showcase.' },
      ],
      intermediate: [
        { stepNumber: 1, description: 'Use age-appropriate reproductive-system and life-cycle vocabulary with respect.' },
        { stepNumber: 2, description: 'Review puberty, growth, and why body changes are part of development.' },
        { stepNumber: 3, description: 'Connect reproductive ideas to endocrine, nervous, and other body systems.' },
        { stepNumber: 4, description: 'Create a capstone explanation showing several systems working together.' },
      ],
      advanced: [
        { stepNumber: 1, description: 'Describe major reproductive structures and their functions in age-appropriate scientific language.' },
        { stepNumber: 2, description: 'Connect reproduction to life cycles, hormones, and growth.' },
        { stepNumber: 3, description: 'Synthesize how multiple systems collaborate in development and health.' },
        { stepNumber: 4, description: 'Produce a final systems portfolio or presentation.' },
      ],
      pro: [
        { stepNumber: 1, description: 'Explain reproductive system basics, development, and regulation with maturity and precision.' },
        { stepNumber: 2, description: 'Compare reproductive function with broader themes of growth, health, and life cycle continuity.' },
        { stepNumber: 3, description: 'Integrate endocrine, cardiovascular, nervous, and reproductive concepts into a final framework.' },
        { stepNumber: 4, description: 'Build a polished capstone that teaches human body systems as an interacting network.' },
      ],
    },
    codeRequiredByLevel: { foundation: false, intermediate: false, advanced: false, pro: false },
    evidence: {
      weekNumber: 6,
      items: [
        { id: 'body-w6-ev1', label: 'Final body systems capstone', isRequired: true },
        { id: 'body-w6-ev2', label: 'Life cycle or growth explanation', isRequired: true },
        { id: 'body-w6-ev3', label: 'Reflection on body respect, growth, and learning', isRequired: true },
        { id: 'body-w6-ev4', label: 'Peer, parent, or self teach-back', isRequired: false },
      ],
    },
    rubric: {
      weekNumber: 6,
      criteria: [
        {
          id: 'body-w6-r1',
          name: 'Respectful Scientific Communication',
          description: 'Uses age-appropriate reproductive and life-cycle language respectfully.',
          levels: { E: 'Needs support with language.', D: 'Uses some terms carefully.', P: 'Uses terms respectfully and clearly.', M: 'Communicates with clarity, maturity, and sensitivity.' },
        },
        {
          id: 'body-w6-r2',
          name: 'Systems Synthesis',
          description: 'Shows how multiple systems work together.',
          levels: { E: 'Systems are mostly isolated.', D: 'Some links are shown.', P: 'Several systems are linked clearly.', M: 'A coherent whole-body explanation is built.' },
        },
        {
          id: 'body-w6-r3',
          name: 'Capstone Quality',
          description: 'Produces a final artifact that teaches others.',
          levels: { E: 'Artifact is incomplete.', D: 'Artifact shows basic understanding.', P: 'Artifact is clear and useful.', M: 'Artifact is compelling, accurate, and portfolio-ready.' },
        },
        {
          id: 'body-w6-r4',
          name: 'Reflection and Confidence',
          description: 'Reflects on learning, growth, and responsible use of knowledge.',
          levels: { E: 'Reflection is minimal.', D: 'Reflection is basic.', P: 'Reflection is thoughtful.', M: 'Reflection is thoughtful and future-oriented.' },
        },
      ],
      unlockRule:
        'Complete the final showcase, submit at least 3 evidence items, and reach P or higher on 3/4 criteria.',
    },
    materials: {
      weekNumber: 6,
      items: [
        { id: 'body-w6-m1', name: 'Presentation board or slides' },
        { id: 'body-w6-m2', name: 'Notebook or journal' },
        { id: 'body-w6-m3', name: 'Markers or labels' },
        { id: 'body-w6-m4', name: 'Reference cards from previous weeks' },
      ],
    },
    dailyFlow: {
      weekNumber: 6,
      days: [
        { day: 'Monday', activities: 'review growth, life cycles, and body respect', duration: 35 },
        { day: 'Tuesday', activities: 'age-appropriate reproductive-system overview', duration: 35 },
        { day: 'Wednesday', activities: 'connect reproduction to hormones and development', duration: 40 },
        { day: 'Thursday', activities: 'build the final whole-body systems showcase', duration: 45 },
        { day: 'Friday', activities: 'present and reflect on the full body systems pod', duration: 40 },
      ],
    },
    essentialQuestions: [
      'How do body systems work together across growth, life cycles, and daily health?',
      'How can we talk about the human body with respect, clarity, and confidence?',
    ],
    flashcards: [
      { id: 'body-w6-f1', front: 'Reproductive system', back: 'The system involved in producing gametes and supporting offspring.', skillLevels: ['intermediate', 'advanced', 'pro'] },
      { id: 'body-w6-f2', front: 'Life cycle', back: 'The stages of living things from beginning through growth and reproduction.', skillLevels: ALL_LEVELS },
      { id: 'body-w6-f3', front: 'Puberty', back: 'A stage of development when the body changes and matures.', skillLevels: ['intermediate', 'advanced', 'pro'] },
      { id: 'body-w6-f4', front: 'Integration', back: 'When several body systems work together toward one outcome.', skillLevels: ALL_LEVELS },
    ],
    canonicalLessonsBySkillLevel: {
      foundation: [
        lesson(
          'body-w6-foundation-lesson',
          'Monday',
          'Bodies grow and deserve respect',
          'By the end, you can explain that bodies grow over time and should be treated with respect.',
          [
            'Living things grow and change during life cycles.',
            'Learning about bodies should always include respect, privacy, and kindness.',
          ],
          'A plant, a puppy, and a person all grow and change over time, even though their life cycles look different.',
          ['What does it mean to respect a body?', 'Do living things stay the same forever?'],
          ['Bodies grow.', 'Life cycles are normal.', 'Respect matters in science and in life.'],
          15,
          ['growth', 'life cycle', 'respect'],
          ['review growth, life cycles, and body respect']
        ),
      ],
      intermediate: [
        lesson(
          'body-w6-intermediate-lesson',
          'Tuesday',
          'Growth, puberty, and body systems',
          'By the end, you can explain that body growth and puberty are regulated by several systems working together.',
          [
            'Growth and puberty are part of development and involve hormones, body changes, and increasing maturity.',
            'The reproductive system does not act alone; endocrine and other systems help regulate development.',
          ],
          'The body does not “suddenly change on its own”; signaling systems help guide development over time.',
          ['What body system sends many of the growth messages?', 'Why is puberty part of development, not just one system acting alone?'],
          ['Growth is regulated.', 'Puberty is part of development.', 'Several systems work together.'],
          18,
          ['puberty', 'growth', 'hormones', 'development'],
          ['age-appropriate reproductive-system overview']
        ),
      ],
      advanced: [
        lesson(
          'body-w6-advanced-lesson',
          'Wednesday',
          'Reproduction in a systems context',
          'By the end, you can place reproductive anatomy inside a wider systems explanation involving hormones, circulation, and development.',
          [
            'Reproductive structures have specific biological roles, but their function depends on broader regulation and body health.',
            'A mature biology explanation links development, hormones, and system coordination rather than isolating anatomy from physiology.',
          ],
          'Reproductive changes during puberty are only understandable when endocrine signaling and overall body development are considered too.',
          ['Why is reproductive anatomy not enough by itself?', 'What other systems help regulate reproductive development?'],
          ['Reproduction is part of a larger biology story.', 'Hormones matter.', 'Whole-body context improves understanding.'],
          20,
          ['reproductive system', 'development', 'endocrine'],
          ['connect reproduction to hormones and development']
        ),
      ],
      pro: [
        lesson(
          'body-w6-pro-lesson',
          'Thursday',
          'The whole body as a coordinated living system',
          'By the end, you can synthesize the pod into one coherent model of human survival, growth, and continuity.',
          [
            'A strong final explanation does not treat body systems as a checklist. It shows interaction, regulation, and purpose across the whole organism.',
            'Growth, protection, movement, signaling, transport, exchange, filtering, defense, and reproduction form one coordinated living network.',
          ],
          'An athlete recovering from illness while still growing is a reminder that body systems are always interacting rather than working in isolation.',
          ['What makes a systems explanation stronger than a list of facts?', 'How do the systems from this pod connect to one another?'],
          ['Synthesis matters.', 'Biology is interaction.', 'Human survival depends on coordinated systems.'],
          22,
          ['synthesis', 'whole-body integration', 'human systems'],
          ['build the final whole-body systems showcase']
        ),
      ],
    },
    interactiveTasks: [
      {
        id: 'body-w6-task-reflect',
        title: 'Systems synthesis sort',
        type: 'discussion',
        description: 'Sort body-system cards into groups and explain how they connect.',
        skillLevels: ALL_LEVELS,
        estimatedMinutes: 15,
      },
      {
        id: 'body-w6-task-lifecycle',
        title: 'Growth and life cycle reflection',
        type: 'reflection',
        description: 'Reflect on growth, body respect, confidence, and what you can now explain.',
        skillLevels: ALL_LEVELS,
        estimatedMinutes: 15,
        resourceUrl: 'https://kidshealth.org/en/kids/body.html',
      },
    ],
    projectTemplates: [
      projectTemplate(
        'body-w6-project-showcase',
        '{interest} whole-body systems showcase',
        'presentation',
        'Create a final exhibit, video, or slide deck that uses {interest} as the style while teaching how the body systems work together.',
        ALL_LEVELS,
        [
          'synthesize multiple systems',
          'teach clearly and respectfully',
          'build portfolio-quality work',
        ],
        ['slides or poster board', 'labels', 'notes', '{interest}-themed design choices'],
        [
          'Choose your showcase format.',
          'Select the systems you want to highlight.',
          'Use {interest} to style the explanation.',
          'Present the whole-body story clearly.',
        ],
        '{interest} gives the capstone identity while the body-systems explanation stays academically solid.',
        75
      ),
      projectTemplate(
        'body-w6-project-museum',
        '{interest} museum of body systems',
        'build',
        'Build a mini museum or card set that introduces several body systems and how they connect to growth and survival.',
        ALL_LEVELS,
        [
          'select key systems',
          'communicate interdependence',
          'reflect on what matters most',
        ],
        ['index cards or cardboard', 'markers', 'optional images'],
        [
          'Choose 4-6 systems to feature.',
          'Create one card or station for each.',
          'Add a final card showing how they work together.',
          'Invite someone to tour your museum and ask questions.',
        ],
        'The museum format lets {interest} shape the visuals and storytelling while the science stays organized.',
        60
      ),
    ],
    weeklyProject: {
      title: 'Publish the body systems story',
      drivingQuestion: 'How can we explain the human body as one coordinated living team?',
      deliverables: [
        'A final body systems capstone',
        'A respectful growth or life-cycle explanation',
        'A reflection on confidence and what you can now teach',
      ],
      skillLevelNotes: {
        foundation: 'Use simple respectful language and visuals.',
        intermediate: 'Connect growth and puberty to other body systems gently and clearly.',
        advanced: 'Use accurate anatomy and system-interaction language.',
        pro: 'Synthesize the full pod into one strong explanatory framework.',
      },
    },
  },
];

export const HUMAN_BODY_SYSTEMS_CURRICULUM: PodCurriculum = {
  podId: 'pod-human-body-systems',
  podTitle: 'Human Body Systems: The Living Team Inside You',
  monthNumber: 3,
  description:
    'A structured six-week biology pod that teaches the 11 major human body systems through age-banded mini-lessons, diagrams, projects, movement, and systems thinking.',
  unlockRule:
    'Complete the weekly project, submit at least 3 evidence items each week, and finish the final whole-body showcase.',
  programHours: 18,
  pacingOptions: [
    {
      id: 'body-6-week',
      label: 'Focused 6-week path',
      totalWeeks: 6,
      sessionsPerWeek: 4,
      minutesPerSession: 45,
      notes: 'Best when the pod is one of the main science focuses for the month and beyond.',
    },
    {
      id: 'body-8-week',
      label: 'Balanced 8-week path',
      totalWeeks: 8,
      sessionsPerWeek: 3,
      minutesPerSession: 40,
      notes: 'A good pace for mixed-pod months or learners needing more consolidation time.',
    },
    {
      id: 'body-10-week',
      label: 'Gentle 10-week path',
      totalWeeks: 10,
      sessionsPerWeek: 3,
      minutesPerSession: 30,
      notes: 'Useful for younger learners, lighter schedules, or families wanting more project days.',
    },
    {
      id: 'body-12-week',
      label: 'Term-long deep dive',
      totalWeeks: 12,
      sessionsPerWeek: 2,
      minutesPerSession: 35,
      notes: 'Best for deep portfolio building and regular revisit or recovery days.',
    },
  ],
  planningQuestions: [
    {
      id: 'body-timeframe',
      prompt: 'How quickly do you want to move through the Human Body Systems pod?',
      type: 'timeframe',
      options: ['6 weeks', '8 weeks', '10 weeks', '12 weeks'],
    },
    {
      id: 'body-hours',
      prompt: 'How much time can you give this pod each week?',
      type: 'hours-per-week',
      options: ['2 hours/week', '3 hours/week', '4 hours/week', '5 hours/week'],
    },
    {
      id: 'body-minutes',
      prompt: 'What session length feels manageable for this learner?',
      type: 'minutes-per-day',
      options: ['25 minutes/day', '40 minutes/day', '60 minutes/day', '90 minutes/day'],
    },
    {
      id: 'body-mode',
      prompt: 'How should this pod fit into the rest of the schedule?',
      type: 'schedule-mode',
      options: ['Auto-fit into current schedule', 'Science-priority weeks', 'Light touch across the term'],
    },
  ],
  ageBandGuidance: [
    {
      skillLevel: 'foundation',
      ageRange: 'Ages 7-8',
      focus: 'Big body-system ideas, concrete diagrams, movement, body awareness, and respectful vocabulary.',
      essentialQuestions: [
        'What are the big body teams and what do they do?',
        'How does my body protect, move, and grow?',
      ],
      supportStrategies: [
        'Use body outlines, gestures, songs, and simple models before heavy anatomy language.',
        'Keep explanations short and visual.',
        'Treat week 6 as life cycles, growth, and body respect rather than detailed reproductive anatomy.',
      ],
      extensionStrategies: [
        'Invite learners to teach one body system using a toy, poster, or puppet.',
        'Add one “What would happen if this system stopped working?” question.',
      ],
      capstoneIdea: 'Create a child-friendly “my body teams” museum board.',
    },
    {
      skillLevel: 'intermediate',
      ageRange: 'Ages 9-11',
      focus: 'Clear system comparisons, simple physiology, diagrams, data, and personal health awareness.',
      essentialQuestions: [
        'How do body systems work together instead of alone?',
        'What can body systems teach us about health and growth?',
      ],
      supportStrategies: [
        'Use sentence stems for compare-and-contrast work.',
        'Let learners talk through diagrams before writing longer notes.',
        'Keep puberty and reproduction respectful, age-appropriate, and linked to growth.',
      ],
      extensionStrategies: [
        'Add pulse, reaction-time, or measurement mini-investigations.',
        'Ask learners to connect one system to a sport, hobby, or real-life challenge.',
      ],
      capstoneIdea: 'Present a systems showcase with labeled visuals and simple evidence.',
    },
    {
      skillLevel: 'advanced',
      ageRange: 'Ages 11-14',
      focus: 'Anatomy plus physiology, inter-system reasoning, homeostasis, and structured evidence.',
      essentialQuestions: [
        'How does structure relate to function across organ systems?',
        'How does the body maintain balance while adapting to change?',
      ],
      supportStrategies: [
        'Use worked models for more complex system interactions.',
        'Pair each week with a diagram and a teach-back task.',
        'Treat reproductive content scientifically, respectfully, and in context with development.',
      ],
      extensionStrategies: [
        'Add data tables, cause-and-effect explanations, or model-critique tasks.',
        'Ask learners to compare body systems with engineering or network systems.',
      ],
      capstoneIdea: 'Produce an “inside the body” explainer portfolio or presentation.',
    },
    {
      skillLevel: 'pro',
      ageRange: 'Ages 14-16+',
      focus: 'Systems synthesis, regulation, precise scientific communication, and real-world application.',
      essentialQuestions: [
        'What makes a whole-body explanation more powerful than isolated anatomy facts?',
        'How can biology knowledge be used to solve health, design, or performance problems?',
      ],
      supportStrategies: [
        'Use milestones to keep the big pod visible and manageable.',
        'Invite mentor-style teaching, presentation, and self-directed project choices.',
        'Frame reproductive content with maturity, context, and scientific precision.',
      ],
      extensionStrategies: [
        'Compare physiology to control systems, logistics networks, or data flows.',
        'Add independent research using trustworthy health sources.',
      ],
      capstoneIdea: 'Publish a polished body systems exhibit, video essay, or interdisciplinary systems model.',
    },
  ],
  segments: [
    {
      id: 'body-segment-overview',
      title: 'Body Organization and Protective Systems',
      summary: 'Introduces the body as a coordinated set of organ systems and anchors learning in the integumentary and skeletal systems.',
      guidingQuestions: [
        'How is the body organized from cells to systems?',
        'What keeps the body supported and protected?',
      ],
      skillsUnlocked: ['Body mapping', 'Diagram labeling', 'Structure-function reasoning'],
      realWorldLinks: ['Posture', 'Helmets and skin care', 'Bone injuries and healing'],
    },
    {
      id: 'body-segment-movement',
      title: 'Movement, Control, and Coordination',
      summary: 'Explores how nervous and muscular systems turn information into motion.',
      guidingQuestions: [
        'How do messages become movement?',
        'What makes reflexes and practiced skills different?',
      ],
      skillsUnlocked: ['Signal tracing', 'Reaction testing', 'Movement modeling'],
      realWorldLinks: ['Sports', 'Dance', 'Typing, drawing, and balance'],
    },
    {
      id: 'body-segment-signals',
      title: 'Messaging and Transport',
      summary: 'Pairs endocrine and cardiovascular systems to explain slower chemical signaling and rapid body transport.',
      guidingQuestions: [
        'How does the body deliver supplies and messages?',
        'Why are multiple communication systems needed?',
      ],
      skillsUnlocked: ['Pulse tracking', 'Transport mapping', 'Homeostasis reasoning'],
      realWorldLinks: ['Exercise', 'Growth', 'Stress response'],
    },
    {
      id: 'body-segment-air-fuel',
      title: 'Respiration, Digestion, and Energy',
      summary: 'Shows how air and food become useful to the body through exchange, absorption, and transport.',
      guidingQuestions: [
        'How do oxygen and nutrients reach the body’s cells?',
        'Why is eating or breathing only part of the story?',
      ],
      skillsUnlocked: ['Pathway tracing', 'Energy reasoning', 'Systems comparison'],
      realWorldLinks: ['Breathing during exercise', 'Digestion after meals', 'Energy for movement and thinking'],
    },
    {
      id: 'body-segment-maintenance',
      title: 'Defense, Filtering, and Balance',
      summary: 'Treats immune, lymphatic, and urinary systems as a maintenance network that protects and stabilizes the body.',
      guidingQuestions: [
        'How does the body detect problems and remove waste?',
        'How does it keep useful fluids while cleaning itself?',
      ],
      skillsUnlocked: ['Model analogy', 'Defense explanation', 'Balance and regulation'],
      realWorldLinks: ['Hydration', 'Sickness and recovery', 'Body maintenance habits'],
    },
    {
      id: 'body-segment-growth',
      title: 'Growth, Life Cycles, and Whole-Body Integration',
      summary: 'Brings reproductive-system basics into an age-appropriate framework of growth, development, respect, and systems synthesis.',
      guidingQuestions: [
        'How do body systems support growth and life cycles?',
        'How can we explain the whole body clearly and respectfully?',
      ],
      skillsUnlocked: ['Respectful scientific communication', 'Capstone synthesis', 'Portfolio teaching'],
      realWorldLinks: ['Puberty education', 'Healthy development', 'Science communication'],
    },
  ],
  supportingAssets: [
    {
      id: 'body-asset-overview-video',
      title: 'Human Body Systems Overview Video',
      type: 'video',
      description: 'A short guided walkthrough introducing the 11 body systems and the structure of the pod.',
    },
    {
      id: 'body-asset-systems-slides',
      title: 'Body Systems Slide Deck',
      type: 'slide-deck',
      description: 'Slides for mini-lessons, parent walkthroughs, or learner showcase weeks.',
    },
    {
      id: 'body-asset-notebook',
      title: 'Anatomy Lab Notebook',
      type: 'notebook',
      description: 'Reusable observation pages, labeling sheets, and reflection prompts for the pod.',
    },
    {
      id: 'body-asset-cards',
      title: 'Body Systems Cards and Labels',
      type: 'worksheet',
      description: 'Printable labels, card sorts, and flashcard sheets for each system cluster.',
    },
    {
      id: 'body-asset-lifecycle-pack',
      title: 'Growth and Life Cycles Guidance Pack',
      type: 'link',
      description: 'Age-banded support materials for week 6 discussions on growth, life cycles, and respectful body knowledge.',
    },
  ],
  references: [
    {
      id: 'body-ref-kidshealth-parents',
      title: 'Nemours KidsHealth: Body Basics for Parents',
      url: 'https://kidshealth.org/en/parents/body-basics.html',
      category: 'article',
      note: 'Kid-friendly overview hub for major body systems and anatomy topics.',
    },
    {
      id: 'body-ref-kidshealth-kids',
      title: 'Nemours KidsHealth: Your Body',
      url: 'https://kidshealth.org/en/kids/body.html',
      category: 'article',
      note: 'Learner-facing entry point with videos and body-system explainers.',
    },
    {
      id: 'body-ref-niams-kids',
      title: 'NIAMS Kids Pages',
      url: 'https://www.niams.nih.gov/health-topics/kids-pages',
      category: 'activity',
      note: 'Kid-accessible pages on bones, joints, muscles, and related body science.',
    },
    {
      id: 'body-ref-niams-joints',
      title: 'NIAMS: Healthy Joints for Kids',
      url: 'https://www.niams.nih.gov/health-topics/kids/healthy-joints',
      category: 'article',
      note: 'Useful for skeletal-system movement and support lessons.',
    },
    {
      id: 'body-ref-niams-muscles',
      title: 'NIAMS: Healthy Muscles for Kids',
      url: 'https://www.niams.nih.gov/health-topics/kids/healthy-muscles',
      category: 'article',
      note: 'Supports muscular-system explanations with accessible language.',
    },
    {
      id: 'body-ref-ninds-brain',
      title: 'NINDS: Brain Basics - Know Your Brain',
      url: 'https://www.ninds.nih.gov/health-information/patient-caregiver-education/brain-basics-know-your-brain',
      category: 'article',
      note: 'Strong background resource for nervous-system structure and function.',
    },
    {
      id: 'body-ref-nhlbi-lungs',
      title: 'NHLBI: The Respiratory System',
      url: 'https://www.nhlbi.nih.gov/health/lungs/respiratory-system',
      category: 'article',
      note: 'Clear overview of breathing structures and gas exchange.',
    },
    {
      id: 'body-ref-nhlbi-heart',
      title: 'NHLBI: How Blood Flows Through the Heart',
      url: 'https://www.nhlbi.nih.gov/health/heart/blood-flow',
      category: 'article',
      note: 'Helpful for modeling circulation and cardiovascular pathways.',
    },
    {
      id: 'body-ref-medline-digestive',
      title: 'MedlinePlus: Digestive System',
      url: 'https://medlineplus.gov/digestivesystem.html',
      category: 'article',
      note: 'Background and reference material for digestion, organs, and common questions.',
    },
    {
      id: 'body-ref-medline-endocrine',
      title: 'MedlinePlus: Endocrine System',
      url: 'https://medlineplus.gov/endocrinesystem.html',
      category: 'article',
      note: 'Useful for hormone-system basics and gland overview.',
    },
    {
      id: 'body-ref-medline-urinary',
      title: 'MedlinePlus: Kidneys and Urinary System',
      url: 'https://medlineplus.gov/kidneysandurinarysystem.html',
      category: 'article',
      note: 'Supports filtration, waste removal, and kidney lessons.',
    },
    {
      id: 'body-ref-medline-immune',
      title: 'MedlinePlus Magazine: Immune System',
      url: 'https://magazine.medlineplus.gov/multimedia/immune-system',
      category: 'video',
      note: 'Short multimedia support for immune-system understanding.',
    },
  ],
  weeks: HUMAN_BODY_WEEKS,
};

export default HUMAN_BODY_SYSTEMS_CURRICULUM;
