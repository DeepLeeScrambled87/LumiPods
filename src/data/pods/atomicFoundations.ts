import type { Pod } from '../../types/pod';

export const atomicFoundationsPod: Pod = {
  id: 'pod-atomic-foundations',
  title: 'Atomic Foundations: Hidden Building Blocks',
  theme: 'matter',
  description:
    'Learn how matter works from the inside out through models, detective stories, simulations, density challenges, and real-world materials like metals and glucose.',
  milestone: 'Create an atoms-in-real-life showcase that explains invisible science through visible projects and examples.',
  artifactTypes: [
    'Scale posters',
    'Atomic model builds',
    'Periodic table reasoning sheets',
    'Mini museum timeline',
    'Final science showcase',
  ],
  learningObjectives: [
    'Understand matter as made of tiny particles and atoms',
    'Use scale analogies to reason about the microscopic world',
    'Trace how atomic models changed with new evidence',
    'Use the periodic table as a tool for finding atomic information',
    'Explain protons, neutrons, electrons, ions, and isotopes',
    'Connect atomic ideas to density, compounds, metals, glucose, and everyday materials',
  ],
  duration: 4,
  weeks: [
    {
      weekNumber: 1,
      title: 'Matter, Scale, and the Particle Bridge',
      focus: 'Hidden building blocks',
      milestone: 'Build a model that shows why matter can be made of tiny pieces',
      days: [],
      materials: [
        { id: 'atoms-pod-w1-m1', name: 'Paper strips', quantity: '5+', category: 'basic' },
        { id: 'atoms-pod-w1-m2', name: 'Blocks or beads', quantity: '1 set', category: 'basic' },
      ],
      vocabulary: [
        { term: 'la matiere', translation: 'matter', pronunciation: 'lah mah-tee-air' },
        { term: "l'atome", translation: 'atom', pronunciation: 'lah-tom' },
      ],
    },
    {
      weekNumber: 2,
      title: 'Atomic Detectives',
      focus: 'Scientific models change',
      milestone: 'Create a timeline or museum board that tells the history of atomic models',
      days: [],
      materials: [
        { id: 'atoms-pod-w2-m1', name: 'Index cards', quantity: '10+', category: 'basic' },
        { id: 'atoms-pod-w2-m2', name: 'Poster board', quantity: '1', category: 'basic' },
      ],
      vocabulary: [
        { term: 'le modele', translation: 'model', pronunciation: 'luh moh-del' },
        { term: "la preuve", translation: 'evidence', pronunciation: 'lah preuv' },
      ],
    },
    {
      weekNumber: 3,
      title: 'Inside the Atom and the Periodic Table',
      focus: 'Identity, charge, and useful patterns',
      milestone: 'Use the periodic table to solve particle-count clues and build accurate atom models',
      days: [],
      materials: [
        { id: 'atoms-pod-w3-m1', name: 'Periodic table', quantity: '1', category: 'basic' },
        { id: 'atoms-pod-w3-m2', name: 'Colored counters', quantity: '1 set', category: 'basic' },
      ],
      vocabulary: [
        { term: 'le proton', translation: 'proton', pronunciation: 'luh proh-ton' },
        { term: "l'electron", translation: 'electron', pronunciation: 'lay-lek-tron' },
      ],
    },
    {
      weekNumber: 4,
      title: 'Atoms in Everyday Materials',
      focus: 'Density, compounds, metals, glucose, and real life',
      milestone: 'Show how atomic thinking helps explain the materials and systems we use every day',
      days: [],
      materials: [
        { id: 'atoms-pod-w4-m1', name: 'Household objects', quantity: 'assorted', category: 'basic' },
        { id: 'atoms-pod-w4-m2', name: 'Poster or slide deck', quantity: '1', category: 'optional' },
      ],
      vocabulary: [
        { term: 'le metal', translation: 'metal', pronunciation: 'luh may-tal' },
        { term: 'le glucose', translation: 'glucose', pronunciation: 'luh gloo-kohz' },
      ],
    },
  ],
};

export default atomicFoundationsPod;
