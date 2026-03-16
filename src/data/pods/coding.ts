// Pod 3: Coding the Future
import type { Pod } from '../../types/pod';

export const codingPod: Pod = {
  id: 'pod-coding',
  title: 'Coding the Future',
  theme: 'coding',
  description: 'Learn programming logic, creative storytelling, and collaboration through building interactive projects.',
  coverImage: '/pods/coding-cover.jpg',
  milestone: 'Develop group interactive story/game',
  artifactTypes: ['Playable code links', 'Project README files', 'Demo videos'],
  learningObjectives: [
    'Understand programming logic and sequences',
    'Create interactive stories and games',
    'Practice debugging and problem-solving',
    'Collaborate on code projects',
    'Document code with README files',
  ],
  weeks: [
    {
      weekNumber: 1,
      title: 'Interactive Stories',
      focus: 'Logic & Creativity',
      milestone: 'Create first interactive story with branching paths',
      days: [
        {
          dayOfWeek: 1,
          title: 'Story Planning',
          description: 'Design your interactive story structure',
          blocks: [],
          frenchPhrase: { term: 'computer', translation: "l'ordinateur", pronunciation: 'lor-dee-nah-TUHR' },
        },
        {
          dayOfWeek: 2,
          title: 'Basic Coding',
          description: 'Learn fundamental coding concepts',
          blocks: [],
        },
        {
          dayOfWeek: 3,
          title: 'Build Characters',
          description: 'Create characters and scenes',
          blocks: [],
        },
        {
          dayOfWeek: 4,
          title: 'Add Interactions',
          description: 'Program user interactions and choices',
          blocks: [],
        },
        {
          dayOfWeek: 5,
          title: 'Playtest & Share',
          description: 'Test with family and gather feedback',
          blocks: [],
        },
      ],
      materials: [
        { id: 'mat-1', name: 'Computer/tablet', quantity: '1 per learner', category: 'basic' },
        { id: 'mat-2', name: 'Scratch account', quantity: '1 per learner', category: 'basic' },
        { id: 'mat-3', name: 'Story planning worksheet', quantity: '1 per learner', category: 'basic' },
      ],
      safetyNotes: ['Take regular screen breaks', 'Practice good posture'],
      vocabulary: [
        { term: 'code', translation: 'le code', pronunciation: 'luh kohd' },
        { term: 'program', translation: 'le programme', pronunciation: 'luh proh-grahm' },
      ],
    },
  ],
};

export default codingPod;
