// Pod 2: Water & Filtration
import type { Pod } from '../../types/pod';

export const waterPod: Pod = {
  id: 'pod-water',
  title: 'Water & Filtration',
  theme: 'water',
  description: 'Explore water chemistry, environmental science, and measurement through building filtration systems.',
  coverImage: '/pods/water-cover.jpg',
  milestone: 'Create family 2-stage water filter',
  artifactTypes: ['Before/after photos', 'Water quality charts', 'Filter design documentation'],
  learningObjectives: [
    'Understand water chemistry basics',
    'Learn about environmental science and water conservation',
    'Practice precise measurement techniques',
    'Design and iterate on filtration systems',
    'Document scientific processes',
  ],
  weeks: [
    {
      weekNumber: 1,
      title: 'Water Science',
      focus: 'Chemistry & Measurement',
      milestone: 'Complete water quality baseline measurements',
      days: [
        {
          dayOfWeek: 1,
          title: 'Water Properties',
          description: 'Explore the properties of water and why filtration matters',
          blocks: [],
          frenchPhrase: { term: 'water', translation: "l'eau", pronunciation: 'loh' },
        },
        {
          dayOfWeek: 2,
          title: 'Filtration Basics',
          description: 'Learn how different materials filter water',
          blocks: [],
        },
        {
          dayOfWeek: 3,
          title: 'Build Stage 1',
          description: 'Construct first filtration stage',
          blocks: [],
        },
        {
          dayOfWeek: 4,
          title: 'Build Stage 2',
          description: 'Add second filtration stage',
          blocks: [],
        },
        {
          dayOfWeek: 5,
          title: 'Test & Document',
          description: 'Test complete system and document results',
          blocks: [],
        },
      ],
      materials: [
        { id: 'mat-1', name: 'Plastic bottles', quantity: '4-6', category: 'basic' },
        { id: 'mat-2', name: 'Sand', quantity: '2 cups', category: 'basic' },
        { id: 'mat-3', name: 'Gravel', quantity: '2 cups', category: 'basic' },
        { id: 'mat-4', name: 'Cotton balls', quantity: '1 bag', category: 'basic' },
        { id: 'mat-5', name: 'Activated charcoal', quantity: '1 cup', category: 'basic' },
      ],
      safetyNotes: ['Never drink filtered water from experiments', 'Wash hands after handling materials'],
      vocabulary: [
        { term: 'filter', translation: 'le filtre', pronunciation: 'luh feel-truh' },
        { term: 'clean', translation: 'propre', pronunciation: 'proh-pruh' },
      ],
    },
  ],
};

export default waterPod;
