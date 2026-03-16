// French Language Pods - Based on French National Curriculum
// Cycle 2 (CP, CE1, CE2) = Ages 6-8 = Foundation/Intermediate
// Cycle 3 (CM1, CM2, 6ème) = Ages 9-12 = Advanced/Pro

import type { Pod } from '../../types/pod';

// ============ COMPETENCY DOMAINS FOR FRENCH ============
export interface FrenchCompetency {
  id: string;
  domain: 'oral' | 'reading' | 'writing' | 'grammar' | 'vocabulary' | 'culture';
  name: string;
  nameEn: string;
  description: string;
  cycle: 2 | 3;
  skills: FrenchSkill[];
}

export interface FrenchSkill {
  id: string;
  name: string;
  nameEn: string;
  level: 'foundation' | 'intermediate' | 'advanced' | 'pro';
  weekNumber: number; // Which week this skill is introduced
  activities: string[];
  artifacts: string[];
  isComplete?: boolean;
}

// ============ CYCLE 2 COMPETENCIES (Ages 6-8) ============
export const CYCLE_2_COMPETENCIES: FrenchCompetency[] = [
  {
    id: 'c2-oral',
    domain: 'oral',
    name: 'Langage Oral',
    nameEn: 'Oral Language',
    description: 'Speaking clearly, listening actively, participating in conversations',
    cycle: 2,
    skills: [
      { id: 'c2-o1', name: 'Se présenter', nameEn: 'Introduce yourself', level: 'foundation', weekNumber: 1, 
        activities: ['Record a video introduction', 'Practice with family members', 'Role-play meeting new friends'],
        artifacts: ['Video: My Introduction', 'Audio: Conversation practice'] },
      { id: 'c2-o2', name: 'Poser des questions', nameEn: 'Ask questions', level: 'foundation', weekNumber: 2,
        activities: ['Question word games', 'Interview a family member', '20 Questions in French'],
        artifacts: ['Interview recording', 'Question cards created'] },
      { id: 'c2-o3', name: 'Raconter une histoire', nameEn: 'Tell a story', level: 'intermediate', weekNumber: 4,
        activities: ['Retell a favorite story', 'Create a picture story', 'Story dice game'],
        artifacts: ['Story recording', 'Illustrated story book'] },
      { id: 'c2-o4', name: 'Exprimer ses émotions', nameEn: 'Express emotions', level: 'intermediate', weekNumber: 6,
        activities: ['Emotion charades', 'Feelings journal', 'React to stories'],
        artifacts: ['Emotions poster', 'Feelings video diary'] },
    ]
  },
  {
    id: 'c2-reading',
    domain: 'reading',
    name: 'Lecture',
    nameEn: 'Reading',
    description: 'Decoding words, reading fluently, understanding texts',
    cycle: 2,
    skills: [
      { id: 'c2-r1', name: 'Reconnaître les lettres', nameEn: 'Recognize letters', level: 'foundation', weekNumber: 1,
        activities: ['Alphabet song', 'Letter hunt around house', 'Letter matching game'],
        artifacts: ['Alphabet book', 'Letter collection photos'] },
      { id: 'c2-r2', name: 'Lire des syllabes', nameEn: 'Read syllables', level: 'foundation', weekNumber: 3,
        activities: ['Syllable clapping', 'Build words with syllable cards', 'Syllable bingo'],
        artifacts: ['Syllable cards set', 'Word building video'] },
      { id: 'c2-r3', name: 'Lire des mots simples', nameEn: 'Read simple words', level: 'intermediate', weekNumber: 5,
        activities: ['Flash card practice', 'Label items in room', 'Word treasure hunt'],
        artifacts: ['Room labels photos', 'Word collection journal'] },
      { id: 'c2-r4', name: 'Lire des phrases', nameEn: 'Read sentences', level: 'intermediate', weekNumber: 8,
        activities: ['Simple book reading', 'Sentence building', 'Reading to stuffed animals'],
        artifacts: ['Reading log', 'Sentence creation book'] },
    ]
  },
  {
    id: 'c2-writing',
    domain: 'writing',
    name: 'Écriture',
    nameEn: 'Writing',
    description: 'Forming letters, writing words and simple sentences',
    cycle: 2,
    skills: [
      { id: 'c2-w1', name: 'Tracer les lettres', nameEn: 'Trace letters', level: 'foundation', weekNumber: 1,
        activities: ['Sand writing', 'Air writing', 'Tracing worksheets with fun themes'],
        artifacts: ['Letter practice pages', 'Creative letter art'] },
      { id: 'c2-w2', name: 'Copier des mots', nameEn: 'Copy words', level: 'foundation', weekNumber: 4,
        activities: ['Label drawings', 'Copy favorite words', 'Word art projects'],
        artifacts: ['Labeled artwork', 'Word collection poster'] },
      { id: 'c2-w3', name: 'Écrire des phrases simples', nameEn: 'Write simple sentences', level: 'intermediate', weekNumber: 7,
        activities: ['Caption photos', 'Write about drawings', 'Simple diary entries'],
        artifacts: ['Photo captions book', 'Mini diary'] },
    ]
  },
  {
    id: 'c2-vocab',
    domain: 'vocabulary',
    name: 'Vocabulaire',
    nameEn: 'Vocabulary',
    description: 'Building word knowledge through themes and daily life',
    cycle: 2,
    skills: [
      { id: 'c2-v1', name: 'La famille', nameEn: 'Family', level: 'foundation', weekNumber: 1,
        activities: ['Family tree project', 'Family photo descriptions', 'Role-play family scenes'],
        artifacts: ['Family tree poster', 'Family description recording'] },
      { id: 'c2-v2', name: 'Les couleurs et formes', nameEn: 'Colors and shapes', level: 'foundation', weekNumber: 2,
        activities: ['Color scavenger hunt', 'Shape art', 'I Spy game'],
        artifacts: ['Color collection', 'Shape creature art'] },
      { id: 'c2-v3', name: 'Les animaux', nameEn: 'Animals', level: 'foundation', weekNumber: 3,
        activities: ['Zoo visit/virtual tour', 'Animal sounds game', 'Favorite animal presentation'],
        artifacts: ['Animal fact cards', 'Animal presentation video'] },
      { id: 'c2-v4', name: 'La nourriture', nameEn: 'Food', level: 'intermediate', weekNumber: 5,
        activities: ['Cooking together', 'Restaurant role-play', 'Food sorting games'],
        artifacts: ['Recipe in French', 'Menu creation'] },
      { id: 'c2-v5', name: 'Le corps', nameEn: 'Body parts', level: 'intermediate', weekNumber: 6,
        activities: ['Simon Says', 'Body part song', 'Draw and label'],
        artifacts: ['Body poster', 'Action song video'] },
      { id: 'c2-v6', name: 'Les vêtements', nameEn: 'Clothing', level: 'intermediate', weekNumber: 8,
        activities: ['Fashion show', 'Dress the character', 'Weather-appropriate outfits'],
        artifacts: ['Fashion show video', 'Paper doll with French labels'] },
    ]
  },
];


// ============ CYCLE 3 COMPETENCIES (Ages 9-12) ============
export const CYCLE_3_COMPETENCIES: FrenchCompetency[] = [
  {
    id: 'c3-oral',
    domain: 'oral',
    name: 'Langage Oral Avancé',
    nameEn: 'Advanced Oral Language',
    description: 'Debates, presentations, expressing complex ideas',
    cycle: 3,
    skills: [
      { id: 'c3-o1', name: 'Présenter un exposé', nameEn: 'Give a presentation', level: 'advanced', weekNumber: 2,
        activities: ['Research a topic', 'Create visual aids', 'Practice delivery'],
        artifacts: ['Presentation slides', 'Recorded presentation'] },
      { id: 'c3-o2', name: 'Participer à un débat', nameEn: 'Participate in debate', level: 'advanced', weekNumber: 6,
        activities: ['Learn debate structure', 'Research both sides', 'Practice argumentation'],
        artifacts: ['Debate notes', 'Argument outline'] },
      { id: 'c3-o3', name: 'Exprimer une opinion', nameEn: 'Express an opinion', level: 'pro', weekNumber: 10,
        activities: ['Opinion essays', 'Discuss current events', 'Persuasive speaking'],
        artifacts: ['Opinion video', 'Persuasive speech recording'] },
    ]
  },
  {
    id: 'c3-reading',
    domain: 'reading',
    name: 'Lecture Approfondie',
    nameEn: 'Deep Reading',
    description: 'Analyzing texts, understanding literary devices, critical reading',
    cycle: 3,
    skills: [
      { id: 'c3-r1', name: 'Lire des textes variés', nameEn: 'Read varied texts', level: 'advanced', weekNumber: 1,
        activities: ['Read news articles', 'Explore different genres', 'Compare text types'],
        artifacts: ['Reading journal', 'Genre comparison chart'] },
      { id: 'c3-r2', name: 'Analyser un texte', nameEn: 'Analyze a text', level: 'advanced', weekNumber: 4,
        activities: ['Identify main ideas', 'Find supporting details', 'Discuss author intent'],
        artifacts: ['Text analysis worksheet', 'Discussion recording'] },
      { id: 'c3-r3', name: 'Comprendre la poésie', nameEn: 'Understand poetry', level: 'pro', weekNumber: 8,
        activities: ['Read French poems', 'Identify rhyme/rhythm', 'Write simple poems'],
        artifacts: ['Poetry collection', 'Original poem'] },
    ]
  },
  {
    id: 'c3-writing',
    domain: 'writing',
    name: 'Rédaction',
    nameEn: 'Composition',
    description: 'Writing paragraphs, stories, and structured texts',
    cycle: 3,
    skills: [
      { id: 'c3-w1', name: 'Écrire un paragraphe', nameEn: 'Write a paragraph', level: 'advanced', weekNumber: 2,
        activities: ['Topic sentences', 'Supporting details', 'Concluding sentences'],
        artifacts: ['Paragraph collection', 'Writing portfolio'] },
      { id: 'c3-w2', name: 'Écrire une histoire', nameEn: 'Write a story', level: 'advanced', weekNumber: 5,
        activities: ['Story planning', 'Character development', 'Plot structure'],
        artifacts: ['Short story', 'Story illustrations'] },
      { id: 'c3-w3', name: 'Écrire une lettre', nameEn: 'Write a letter', level: 'pro', weekNumber: 9,
        activities: ['Formal vs informal', 'Pen pal exchange', 'Thank you notes'],
        artifacts: ['Letter collection', 'Pen pal correspondence'] },
    ]
  },
  {
    id: 'c3-grammar',
    domain: 'grammar',
    name: 'Grammaire',
    nameEn: 'Grammar',
    description: 'Understanding sentence structure, verb conjugation, agreement',
    cycle: 3,
    skills: [
      { id: 'c3-g1', name: 'Les temps du verbe', nameEn: 'Verb tenses', level: 'advanced', weekNumber: 3,
        activities: ['Conjugation games', 'Timeline activities', 'Story retelling in different tenses'],
        artifacts: ['Verb chart', 'Tense timeline project'] },
      { id: 'c3-g2', name: 'Les accords', nameEn: 'Agreement', level: 'advanced', weekNumber: 7,
        activities: ['Gender matching', 'Plural practice', 'Adjective agreement'],
        artifacts: ['Agreement rules poster', 'Practice exercises'] },
      { id: 'c3-g3', name: 'La structure de phrase', nameEn: 'Sentence structure', level: 'pro', weekNumber: 11,
        activities: ['Sentence combining', 'Complex sentences', 'Punctuation practice'],
        artifacts: ['Sentence building cards', 'Complex sentence collection'] },
    ]
  },
];

// ============ FRENCH PODS BY LEVEL ============
export const FRENCH_PODS: Pod[] = [
  // FOUNDATION LEVEL - Cycle 2 Year 1 (CP equivalent)
  {
    id: 'french-foundation-1',
    title: 'Bonjour! French Foundations',
    description: 'Start your French journey with fun! Learn greetings, family words, colors, and basic sounds through songs, games, and creative projects.',
    theme: 'language',
    duration: 12,
    skillLevel: 'foundation',
    milestone: 'Create a "My French World" scrapbook with labeled photos and recordings',
    learningObjectives: [
      'Introduce yourself in French',
      'Name family members and pets',
      'Identify colors and basic shapes',
      'Recognize and write French letters',
      'Sing 5 French songs',
      'Count to 20',
    ],
    artifactTypes: ['video', 'photo', 'document'],
    materials: [
      'Colored paper and markers',
      'Family photos',
      'Recording device',
      'French picture books',
    ],
    weeks: generateFoundationWeeks(),
  },
  // INTERMEDIATE LEVEL - Cycle 2 Year 2-3 (CE1-CE2 equivalent)
  {
    id: 'french-intermediate-1',
    title: 'Parlons Français! Growing Skills',
    description: 'Build on your foundation with storytelling, simple reading, and writing. Explore animals, food, body parts, and daily routines.',
    theme: 'language',
    duration: 12,
    skillLevel: 'intermediate',
    milestone: 'Perform a short French play or puppet show for family',
    learningObjectives: [
      'Read simple French sentences',
      'Write short descriptions',
      'Tell a simple story in French',
      'Describe daily routines',
      'Express likes and dislikes',
      'Use basic verb conjugations',
    ],
    artifactTypes: ['video', 'document', 'presentation'],
    materials: [
      'Simple French readers',
      'Puppets or stuffed animals',
      'Recipe ingredients',
      'Art supplies',
    ],
    weeks: generateIntermediateWeeks(),
  },
  // ADVANCED LEVEL - Cycle 3 Year 1-2 (CM1-CM2 equivalent)
  {
    id: 'french-advanced-1',
    title: 'Explorons! French Adventures',
    description: 'Dive deeper into French with chapter books, creative writing, and cultural exploration. Learn about French-speaking countries and traditions.',
    theme: 'language',
    duration: 12,
    skillLevel: 'advanced',
    milestone: 'Create a French culture magazine with articles, recipes, and interviews',
    learningObjectives: [
      'Read and discuss chapter books',
      'Write multi-paragraph texts',
      'Give presentations in French',
      'Understand French culture and geography',
      'Use past and future tenses',
      'Engage in conversations on various topics',
    ],
    artifactTypes: ['document', 'video', 'presentation', 'project'],
    materials: [
      'French chapter books',
      'World map',
      'Cooking supplies',
      'Video recording equipment',
    ],
    weeks: generateAdvancedWeeks(),
  },
  // PRO LEVEL - Cycle 3 Year 3 (6ème equivalent)
  {
    id: 'french-pro-1',
    title: 'Maîtrise! French Mastery',
    description: 'Master French with literature analysis, formal writing, debates, and deep cultural immersion. Prepare for bilingual fluency.',
    theme: 'language',
    duration: 12,
    skillLevel: 'pro',
    milestone: 'Host a French cultural evening with presentations, food, and entertainment',
    learningObjectives: [
      'Analyze French literature',
      'Write formal letters and essays',
      'Participate in debates',
      'Understand French media',
      'Master complex grammar',
      'Discuss abstract topics',
    ],
    artifactTypes: ['document', 'video', 'presentation', 'project'],
    materials: [
      'French literature selections',
      'News sources in French',
      'Debate materials',
      'Event planning supplies',
    ],
    weeks: generateProWeeks(),
  },
];


// ============ WEEK GENERATORS ============
function generateFoundationWeeks() {
  return [
    {
      weekNumber: 1,
      title: 'Bonjour! Hello!',
      focus: 'Greetings and introductions',
      blocks: [
        { title: 'Learn greeting songs', duration: 20, type: 'activity' },
        { title: 'Practice "Je m\'appelle..."', duration: 15, type: 'speaking' },
        { title: 'Create name tag in French', duration: 20, type: 'craft' },
        { title: 'Video: Introduce yourself', duration: 15, type: 'artifact' },
      ],
    },
    {
      weekNumber: 2,
      title: 'Ma Famille - My Family',
      focus: 'Family vocabulary',
      blocks: [
        { title: 'Family word flashcards', duration: 15, type: 'vocabulary' },
        { title: 'Draw and label family', duration: 25, type: 'craft' },
        { title: 'Family tree project', duration: 30, type: 'project' },
        { title: 'Describe family in French', duration: 15, type: 'speaking' },
      ],
    },
    {
      weekNumber: 3,
      title: 'Les Couleurs - Colors',
      focus: 'Colors and color mixing',
      blocks: [
        { title: 'Color song and dance', duration: 15, type: 'activity' },
        { title: 'Color scavenger hunt', duration: 20, type: 'game' },
        { title: 'Rainbow art project', duration: 30, type: 'craft' },
        { title: 'Color mixing experiment', duration: 25, type: 'science' },
      ],
    },
    {
      weekNumber: 4,
      title: 'Les Nombres - Numbers 1-10',
      focus: 'Counting and number recognition',
      blocks: [
        { title: 'Number songs', duration: 15, type: 'activity' },
        { title: 'Counting games', duration: 20, type: 'game' },
        { title: 'Number art (dice, dominoes)', duration: 25, type: 'craft' },
        { title: 'Shopping game with numbers', duration: 20, type: 'roleplay' },
      ],
    },
    {
      weekNumber: 5,
      title: 'Les Animaux - Animals',
      focus: 'Animal names and sounds',
      blocks: [
        { title: 'Animal flashcards', duration: 15, type: 'vocabulary' },
        { title: 'Animal sounds in French', duration: 15, type: 'activity' },
        { title: 'Zoo visit or virtual tour', duration: 30, type: 'exploration' },
        { title: 'Favorite animal presentation', duration: 20, type: 'speaking' },
      ],
    },
    {
      weekNumber: 6,
      title: 'Le Corps - My Body',
      focus: 'Body parts vocabulary',
      blocks: [
        { title: 'Head, shoulders song', duration: 15, type: 'activity' },
        { title: 'Simon Says in French', duration: 20, type: 'game' },
        { title: 'Body tracing and labeling', duration: 25, type: 'craft' },
        { title: 'Action video in French', duration: 20, type: 'artifact' },
      ],
    },
    {
      weekNumber: 7,
      title: 'La Nourriture - Food',
      focus: 'Food vocabulary and preferences',
      blocks: [
        { title: 'Food picture dictionary', duration: 20, type: 'vocabulary' },
        { title: 'J\'aime / Je n\'aime pas', duration: 15, type: 'speaking' },
        { title: 'French recipe cooking', duration: 40, type: 'cooking' },
        { title: 'Restaurant roleplay', duration: 20, type: 'roleplay' },
      ],
    },
    {
      weekNumber: 8,
      title: 'Les Vêtements - Clothes',
      focus: 'Clothing vocabulary',
      blocks: [
        { title: 'Clothing flashcards', duration: 15, type: 'vocabulary' },
        { title: 'Dress-up game in French', duration: 20, type: 'game' },
        { title: 'Paper doll with French labels', duration: 25, type: 'craft' },
        { title: 'Fashion show video', duration: 25, type: 'artifact' },
      ],
    },
    {
      weekNumber: 9,
      title: 'La Maison - My Home',
      focus: 'Rooms and furniture',
      blocks: [
        { title: 'Room vocabulary tour', duration: 20, type: 'vocabulary' },
        { title: 'Label items in your room', duration: 25, type: 'activity' },
        { title: 'Dream house drawing', duration: 30, type: 'craft' },
        { title: 'House tour video in French', duration: 20, type: 'artifact' },
      ],
    },
    {
      weekNumber: 10,
      title: 'Le Temps - Weather',
      focus: 'Weather expressions',
      blocks: [
        { title: 'Weather song', duration: 15, type: 'activity' },
        { title: 'Daily weather report', duration: 10, type: 'speaking' },
        { title: 'Weather wheel craft', duration: 25, type: 'craft' },
        { title: 'Week of weather videos', duration: 20, type: 'artifact' },
      ],
    },
    {
      weekNumber: 11,
      title: 'Les Jours et Mois - Days & Months',
      focus: 'Calendar vocabulary',
      blocks: [
        { title: 'Days of week song', duration: 15, type: 'activity' },
        { title: 'Birthday calendar project', duration: 30, type: 'craft' },
        { title: 'Daily calendar routine', duration: 15, type: 'speaking' },
        { title: 'Special dates presentation', duration: 20, type: 'artifact' },
      ],
    },
    {
      weekNumber: 12,
      title: 'Mon Monde Français - My French World',
      focus: 'Review and celebration',
      blocks: [
        { title: 'Review games', duration: 30, type: 'game' },
        { title: 'Complete scrapbook', duration: 40, type: 'project' },
        { title: 'Practice presentation', duration: 20, type: 'speaking' },
        { title: 'Celebration showcase', duration: 30, type: 'celebration' },
      ],
    },
  ];
}

function generateIntermediateWeeks() {
  return [
    { weekNumber: 1, title: 'Ma Journée - My Day', focus: 'Daily routines', blocks: [] },
    { weekNumber: 2, title: 'À l\'École - At School', focus: 'School vocabulary', blocks: [] },
    { weekNumber: 3, title: 'Les Saisons - Seasons', focus: 'Seasons and activities', blocks: [] },
    { weekNumber: 4, title: 'Les Verbes - Action Words', focus: 'Common verbs', blocks: [] },
    { weekNumber: 5, title: 'Au Marché - At the Market', focus: 'Shopping vocabulary', blocks: [] },
    { weekNumber: 6, title: 'Les Émotions - Feelings', focus: 'Expressing emotions', blocks: [] },
    { weekNumber: 7, title: 'Les Transports - Transportation', focus: 'Getting around', blocks: [] },
    { weekNumber: 8, title: 'Les Métiers - Jobs', focus: 'Occupations', blocks: [] },
    { weekNumber: 9, title: 'Raconter une Histoire - Storytelling', focus: 'Narrative skills', blocks: [] },
    { weekNumber: 10, title: 'La Nature - Nature', focus: 'Outdoor vocabulary', blocks: [] },
    { weekNumber: 11, title: 'Les Fêtes - Celebrations', focus: 'French holidays', blocks: [] },
    { weekNumber: 12, title: 'Mon Spectacle - My Show', focus: 'Performance project', blocks: [] },
  ];
}

function generateAdvancedWeeks() {
  return [
    { weekNumber: 1, title: 'La France - Discover France', focus: 'Geography and regions', blocks: [] },
    { weekNumber: 2, title: 'Les Pays Francophones', focus: 'French-speaking world', blocks: [] },
    { weekNumber: 3, title: 'L\'Histoire - History', focus: 'French history basics', blocks: [] },
    { weekNumber: 4, title: 'La Cuisine Française', focus: 'French cooking', blocks: [] },
    { weekNumber: 5, title: 'Les Arts - French Art', focus: 'Famous artists', blocks: [] },
    { weekNumber: 6, title: 'La Musique - French Music', focus: 'Songs and composers', blocks: [] },
    { weekNumber: 7, title: 'Les Contes - Fairy Tales', focus: 'French stories', blocks: [] },
    { weekNumber: 8, title: 'Le Cinéma - French Films', focus: 'Age-appropriate films', blocks: [] },
    { weekNumber: 9, title: 'Les Sciences - Science in French', focus: 'Scientific vocabulary', blocks: [] },
    { weekNumber: 10, title: 'L\'Environnement - Environment', focus: 'Ecology topics', blocks: [] },
    { weekNumber: 11, title: 'Les Médias - Media Literacy', focus: 'News and media', blocks: [] },
    { weekNumber: 12, title: 'Mon Magazine - My Magazine', focus: 'Magazine project', blocks: [] },
  ];
}

function generateProWeeks() {
  return [
    { weekNumber: 1, title: 'La Littérature - Literature', focus: 'French authors', blocks: [] },
    { weekNumber: 2, title: 'La Poésie - Poetry', focus: 'French poetry', blocks: [] },
    { weekNumber: 3, title: 'Le Théâtre - Theater', focus: 'French drama', blocks: [] },
    { weekNumber: 4, title: 'La Philosophie - Big Ideas', focus: 'French thinkers', blocks: [] },
    { weekNumber: 5, title: 'L\'Actualité - Current Events', focus: 'French news', blocks: [] },
    { weekNumber: 6, title: 'Les Débats - Debates', focus: 'Argumentation', blocks: [] },
    { weekNumber: 7, title: 'La Correspondance - Letters', focus: 'Formal writing', blocks: [] },
    { weekNumber: 8, title: 'Les Essais - Essays', focus: 'Essay writing', blocks: [] },
    { weekNumber: 9, title: 'La Recherche - Research', focus: 'Research skills', blocks: [] },
    { weekNumber: 10, title: 'Les Présentations - Presentations', focus: 'Public speaking', blocks: [] },
    { weekNumber: 11, title: 'La Culture - Deep Dive', focus: 'Cultural immersion', blocks: [] },
    { weekNumber: 12, title: 'La Soirée Française - French Evening', focus: 'Cultural event', blocks: [] },
  ];
}

// ============ COMPETENCY TRACKER ============
export interface FrenchProgress {
  learnerId: string;
  competencyId: string;
  skillId: string;
  isComplete: boolean;
  completedAt?: string;
  artifacts: string[];
  notes?: string;
}

export const calculateFrenchMastery = (progress: FrenchProgress[], cycle: 2 | 3): number => {
  const competencies = cycle === 2 ? CYCLE_2_COMPETENCIES : CYCLE_3_COMPETENCIES;
  const totalSkills = competencies.reduce((sum, c) => sum + c.skills.length, 0);
  const completedSkills = progress.filter(p => p.isComplete).length;
  return Math.round((completedSkills / totalSkills) * 100);
};

export const getCompetencyProgress = (
  progress: FrenchProgress[],
  competencyId: string
): { completed: number; total: number; percentage: number } => {
  const competency = [...CYCLE_2_COMPETENCIES, ...CYCLE_3_COMPETENCIES].find(c => c.id === competencyId);
  if (!competency) return { completed: 0, total: 0, percentage: 0 };
  
  const total = competency.skills.length;
  const completed = progress.filter(p => 
    competency.skills.some(s => s.id === p.skillId) && p.isComplete
  ).length;
  
  return { completed, total, percentage: Math.round((completed / total) * 100) };
};
