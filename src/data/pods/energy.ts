// Pod 4: Energy & Motion
import type { Pod } from '../../types/pod';

export const energyPod: Pod = {
  id: 'pod-energy',
  title: 'Energy & Motion',
  theme: 'energy',
  description: 'Explore energy transfer, engineering design, and physics through building solar ovens, rubber-band cars, and pinwheels.',
  coverImage: '/pods/energy-cover.jpg',
  milestone: 'Build solar oven/rubber-band car/pinwheel',
  artifactTypes: ['Demo videos', 'Scientific reflection writings', 'Design iterations'],
  learningObjectives: [
    'Understand energy transfer and conversion',
    'Apply engineering design process',
    'Learn about renewable energy sources',
    'Practice scientific observation and reflection',
    'Build functional prototypes',
  ],
  weeks: [
    {
      weekNumber: 1,
      title: 'Solar Power',
      focus: 'Energy & Engineering',
      milestone: 'Build and test a solar oven',
      days: [
        {
          dayOfWeek: 1,
          title: 'Energy Basics',
          description: 'Learn about different forms of energy',
          blocks: [],
          frenchPhrase: { term: 'energy', translation: "l'énergie", pronunciation: 'lay-nehr-ZHEE' },
        },
        {
          dayOfWeek: 2,
          title: 'Solar Science',
          description: 'Understand how solar energy works',
          blocks: [],
        },
        {
          dayOfWeek: 3,
          title: 'Design Phase',
          description: 'Design your solar oven',
          blocks: [],
        },
        {
          dayOfWeek: 4,
          title: 'Build & Test',
          description: 'Construct and test your solar oven',
          blocks: [],
        },
        {
          dayOfWeek: 5,
          title: 'Cook & Reflect',
          description: 'Use your oven and document results',
          blocks: [],
        },
      ],
      materials: [
        { id: 'mat-1', name: 'Cardboard box', quantity: '1 large', category: 'basic' },
        { id: 'mat-2', name: 'Aluminum foil', quantity: '1 roll', category: 'basic' },
        { id: 'mat-3', name: 'Plastic wrap', quantity: '1 roll', category: 'basic' },
        { id: 'mat-4', name: 'Black paper', quantity: '2-3 sheets', category: 'basic' },
        { id: 'mat-5', name: 'Thermometer', quantity: '1', category: 'measurement' },
      ],
      safetyNotes: ['Adult supervision when using solar oven', 'Use oven mitts for hot items'],
      vocabulary: [
        { term: 'sun', translation: 'le soleil', pronunciation: 'luh soh-LAY' },
        { term: 'heat', translation: 'la chaleur', pronunciation: 'lah shah-LUHR' },
      ],
    },
  ],
};

export default energyPod;
