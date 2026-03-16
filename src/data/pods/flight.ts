// Pod 1: Flight & Parachutes
import type { Pod } from '../../types/pod';

export const flightPod: Pod = {
  id: 'pod-flight',
  title: 'Flight & Parachutes',
  theme: 'flight',
  description: 'Explore aerodynamics, data collection, and physics principles through hands-on parachute design and testing.',
  coverImage: '/pods/flight-cover.jpg',
  milestone: 'Build and test gliders/parachutes with family',
  artifactTypes: ['Drop-test videos', 'Data collection sheets', 'Design sketches'],
  learningObjectives: [
    'Understand air resistance and gravity',
    'Apply scientific method through experimentation',
    'Develop design thinking and problem-solving skills',
    'Practice measurement and data collection',
    'Collaborate effectively in team challenges',
  ],
  weeks: [
    {
      weekNumber: 1,
      title: 'Parachute Drop Test',
      focus: 'Data & Analysis',
      milestone: 'Complete first parachute drop test with data collection',
      days: [
        {
          dayOfWeek: 1,
          title: 'Physics Foundations',
          description: 'Introduction to forces, gravity, and air resistance',
          blocks: [],
          frenchPhrase: { term: 'parachute', translation: 'le parachute', pronunciation: 'luh par-ah-SHOOT' },
        },
        {
          dayOfWeek: 2,
          title: 'Build & Test',
          description: 'Construct parachutes and conduct initial drop tests',
          blocks: [],
        },
        {
          dayOfWeek: 3,
          title: 'Data Analysis',
          description: 'Analyze test results and explore patterns',
          blocks: [],
        },
        {
          dayOfWeek: 4,
          title: 'Optimization',
          description: 'Refine designs based on data',
          blocks: [],
        },
        {
          dayOfWeek: 5,
          title: 'Showcase',
          description: 'Present findings to family',
          blocks: [],
        },
      ],
      materials: [
        { id: 'mat-1', name: 'Plastic bags', quantity: '10-15', category: 'basic' },
        { id: 'mat-2', name: 'String', quantity: '5 meters', category: 'basic' },
        { id: 'mat-3', name: 'Small weights', quantity: '20-30', category: 'basic' },
        { id: 'mat-4', name: 'Stopwatch', quantity: '2-3', category: 'measurement' },
        { id: 'mat-5', name: 'Measuring tape', quantity: '2', category: 'measurement' },
      ],
      safetyNotes: ['Adult supervision required for drop tests', 'Clear drop zone before testing'],
      vocabulary: [
        { term: 'gravity', translation: 'la gravité', pronunciation: 'lah grah-vee-TAY' },
        { term: 'air resistance', translation: "la résistance de l'air", pronunciation: 'lah ray-zees-TAHNSS duh lair' },
      ],
    },
  ],
};

export default flightPod;
