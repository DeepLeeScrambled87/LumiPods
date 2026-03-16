import type { Pod } from '../../types/pod';

export const humanBodySystemsPod: Pod = {
  id: 'pod-human-body-systems',
  title: 'Human Body Systems: The Living Team Inside You',
  theme: 'wellness',
  description:
    'Explore the 11 major human body systems through models, movement, observation, diagrams, and projects that show how the body protects, powers, repairs, and grows.',
  milestone:
    'Create a body systems museum or explainer showcase that proves how multiple systems work together in real life.',
  artifactTypes: [
    'Body maps',
    'Organ system models',
    'Mini lab notebooks',
    'Explainer posters or comics',
    'Final systems showcase',
  ],
  learningObjectives: [
    'Understand the 11 major human body systems and what each one does',
    'Explain how organs, tissues, and systems work together to keep the body alive',
    'Compare systems that protect, move, transport, signal, filter, and reproduce',
    'Use age-appropriate anatomy, physiology, and health vocabulary accurately',
    'Apply human body knowledge through home projects, diagrams, presentations, and reflection',
  ],
  duration: 6,
  weeks: [
    {
      weekNumber: 1,
      title: 'Body Map: Overview, Skin, and Skeleton',
      focus: 'Protection, support, and body organization',
      milestone: 'Build a body map that shows how skin and bones protect the body.',
      days: [],
      materials: [
        { id: 'body-w1-m1', name: 'Large paper or poster paper', quantity: '1-2 sheets', category: 'basic' },
        { id: 'body-w1-m2', name: 'Washable markers', quantity: '1 set', category: 'basic' },
      ],
      vocabulary: [
        { term: 'la peau', translation: 'skin', pronunciation: 'lah poh' },
        { term: 'le squelette', translation: 'skeleton', pronunciation: 'luh skuh-let' },
      ],
    },
    {
      weekNumber: 2,
      title: 'Movement Team: Muscles and Nerves',
      focus: 'Control, signals, movement, and reaction',
      milestone: 'Demonstrate how nerves and muscles cooperate to move the body.',
      days: [],
      materials: [
        { id: 'body-w2-m1', name: 'String or elastic bands', quantity: '1 set', category: 'basic' },
        { id: 'body-w2-m2', name: 'Stopwatch or timer', quantity: '1', category: 'measurement' },
      ],
      vocabulary: [
        { term: 'le muscle', translation: 'muscle', pronunciation: 'luh mus-kl' },
        { term: 'le nerf', translation: 'nerve', pronunciation: 'luh nerf' },
      ],
    },
    {
      weekNumber: 3,
      title: 'Signals and Supply: Endocrine and Cardiovascular',
      focus: 'Hormones, blood, transport, and regulation',
      milestone: 'Explain how messages and materials travel through the body.',
      days: [],
      materials: [
        { id: 'body-w3-m1', name: 'Red and blue yarn or pipe cleaners', quantity: '1 set', category: 'basic' },
        { id: 'body-w3-m2', name: 'Heart-rate tracker or timer', quantity: '1', category: 'measurement' },
      ],
      vocabulary: [
        { term: 'le coeur', translation: 'heart', pronunciation: 'luh kur' },
        { term: 'l hormone', translation: 'hormone', pronunciation: 'lor-mohn' },
      ],
    },
    {
      weekNumber: 4,
      title: 'Air and Fuel: Respiratory and Digestive',
      focus: 'Breathing, gas exchange, digestion, and energy',
      milestone: 'Trace the journey of air and food through the body.',
      days: [],
      materials: [
        { id: 'body-w4-m1', name: 'Balloons or paper lungs model materials', quantity: '1 set', category: 'basic' },
        { id: 'body-w4-m2', name: 'Crackers or bread for digestion demo', quantity: '1 small pack', category: 'optional' },
      ],
      vocabulary: [
        { term: 'les poumons', translation: 'lungs', pronunciation: 'lay poo-mohn' },
        { term: 'la digestion', translation: 'digestion', pronunciation: 'lah dee-zhes-tyohn' },
      ],
    },
    {
      weekNumber: 5,
      title: 'Defense and Filtration: Immune, Lymphatic, and Urinary',
      focus: 'Protection, cleanup, balance, and waste removal',
      milestone: 'Model how the body detects threats and filters waste.',
      days: [],
      materials: [
        { id: 'body-w5-m1', name: 'Filters, cups, and water', quantity: '1 set', category: 'basic' },
        { id: 'body-w5-m2', name: 'Index cards', quantity: '10+', category: 'basic' },
      ],
      vocabulary: [
        { term: 'le systeme immunitaire', translation: 'immune system', pronunciation: 'luh sees-tem ee-mew-nee-tehr' },
        { term: 'le rein', translation: 'kidney', pronunciation: 'luh ran' },
      ],
    },
    {
      weekNumber: 6,
      title: 'Growth and Life Cycles: Reproductive System and Whole-Body Integration',
      focus: 'Development, life cycles, body respect, and system teamwork',
      milestone: 'Create a final showcase explaining how several body systems work together.',
      days: [],
      materials: [
        { id: 'body-w6-m1', name: 'Presentation board or slides', quantity: '1', category: 'basic' },
        { id: 'body-w6-m2', name: 'Notebook or reflection journal', quantity: '1', category: 'basic' },
      ],
      vocabulary: [
        { term: 'la croissance', translation: 'growth', pronunciation: 'lah kwah-sahns' },
        { term: 'le cycle de vie', translation: 'life cycle', pronunciation: 'luh see-kl duh vee' },
      ],
    },
  ],
};

export default humanBodySystemsPod;
