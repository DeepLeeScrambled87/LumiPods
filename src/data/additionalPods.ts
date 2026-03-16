// Additional Learning Pods - Expanding beyond the core 12
// These can be used as electives, summer pods, or extended curriculum

import type { YearlyPod } from './yearlyPods';

export interface ElectivePod extends Omit<YearlyPod, 'month' | 'sequence'> {
  category: 'stem' | 'arts' | 'language' | 'life-skills' | 'entrepreneurship' | 'wellness';
  duration: '2-weeks' | '4-weeks' | '6-weeks';
  prerequisites?: string[];
}

export const ELECTIVE_PODS: ElectivePod[] = [
  // STEM Electives
  {
    id: 'pod-robotics',
    title: 'Robotics: Building Thinking Machines',
    subtitle: 'Engineering meets creativity',
    category: 'stem',
    duration: '4-weeks',
    culturalConnections: ['National Robotics Week', 'STEM careers'],
    subjects: ['Engineering', 'Programming', 'Physics', 'Problem-solving'],
    drivingQuestion: 'How can we build machines that help solve real problems?',
    kickoffExperience: 'Build a simple robot from household items',
    fieldworkIdeas: ['Visit a robotics lab', 'Interview an engineer', 'Attend a robotics competition'],
    expertTouchpoints: ['Robotics engineer', 'AI researcher', 'Manufacturing specialist'],
    exhibitionIdea: 'Robot showcase demonstrating solutions to everyday problems',
    autonomyLevel: 'guided',
    icon: '🤖',
    color: 'bg-cyan-500',
    complexityLevel: 3,
  },
  {
    id: 'pod-space',
    title: 'Space Explorers: Beyond Earth',
    subtitle: 'Astronomy and space science',
    category: 'stem',
    duration: '4-weeks',
    culturalConnections: ['Moon landing anniversary', 'Space exploration milestones'],
    subjects: ['Astronomy', 'Physics', 'Engineering', 'History'],
    drivingQuestion: 'What would it take for humans to live on another planet?',
    kickoffExperience: 'Night sky observation and star mapping',
    fieldworkIdeas: ['Visit planetarium', 'Build model rockets', 'Track ISS passes'],
    expertTouchpoints: ['Astronomer', 'Aerospace engineer', 'NASA educator'],
    exhibitionIdea: 'Mars colony design presentation',
    autonomyLevel: 'guided',
    icon: '🌌',
    color: 'bg-indigo-600',
    complexityLevel: 2,
  },
  {
    id: 'pod-coding',
    title: 'Code Creators: Building Digital Worlds',
    subtitle: 'Programming fundamentals',
    category: 'stem',
    duration: '6-weeks',
    culturalConnections: ['Hour of Code', 'Computer Science Education Week'],
    subjects: ['Computer Science', 'Logic', 'Math', 'Design'],
    drivingQuestion: 'How can code bring our ideas to life?',
    kickoffExperience: 'Create your first interactive game',
    fieldworkIdeas: ['Visit tech company', 'Interview software developer', 'Hackathon participation'],
    expertTouchpoints: ['Software developer', 'Game designer', 'UX researcher'],
    exhibitionIdea: 'App showcase with live demos',
    autonomyLevel: 'guided',
    icon: '💻',
    color: 'bg-emerald-500',
    complexityLevel: 2,
  },
  {
    id: 'pod-ai',
    title: 'AI Adventures: Teaching Machines to Think',
    subtitle: 'Introduction to artificial intelligence',
    category: 'stem',
    duration: '4-weeks',
    prerequisites: ['pod-coding'],
    culturalConnections: ['AI ethics discussions', 'Future of work'],
    subjects: ['AI/ML', 'Ethics', 'Data Science', 'Critical Thinking'],
    drivingQuestion: 'How do machines learn, and what should they be allowed to decide?',
    kickoffExperience: 'Train a simple image classifier',
    fieldworkIdeas: ['Interview AI researcher', 'Explore AI tools', 'Debate AI ethics'],
    expertTouchpoints: ['AI researcher', 'Data scientist', 'Ethics professor'],
    exhibitionIdea: 'AI project showcase with ethical considerations',
    autonomyLevel: 'self-directed',
    icon: '🧠',
    color: 'bg-purple-600',
    complexityLevel: 4,
  },

  // Arts & Creativity
  {
    id: 'pod-film',
    title: 'Filmmakers: Stories in Motion',
    subtitle: 'Video production and storytelling',
    category: 'arts',
    duration: '4-weeks',
    culturalConnections: ['Film festivals', 'Documentary traditions'],
    subjects: ['Film', 'Storytelling', 'Technology', 'Art'],
    drivingQuestion: 'How do filmmakers use images and sound to change how we see the world?',
    kickoffExperience: 'Create a 1-minute documentary about your family',
    fieldworkIdeas: ['Visit film studio', 'Interview filmmaker', 'Attend film screening'],
    expertTouchpoints: ['Film director', 'Editor', 'Cinematographer'],
    exhibitionIdea: 'Film festival with student documentaries',
    autonomyLevel: 'guided',
    icon: '🎬',
    color: 'bg-rose-500',
    complexityLevel: 2,
  },
  {
    id: 'pod-music',
    title: 'Sound Lab: The Science of Music',
    subtitle: 'Music theory meets physics',
    category: 'arts',
    duration: '4-weeks',
    culturalConnections: ['World music traditions', 'Music history'],
    subjects: ['Music', 'Physics', 'Math', 'Culture'],
    drivingQuestion: 'Why does music move us, and how can we create it?',
    kickoffExperience: 'Build a simple instrument from recycled materials',
    fieldworkIdeas: ['Visit recording studio', 'Attend concert', 'Interview musician'],
    expertTouchpoints: ['Musician', 'Sound engineer', 'Music therapist'],
    exhibitionIdea: 'Original composition performance',
    autonomyLevel: 'guided',
    icon: '🎵',
    color: 'bg-pink-500',
    complexityLevel: 2,
  },

  // Language & Communication
  {
    id: 'pod-french-immersion',
    title: 'Bonjour! French Immersion',
    subtitle: 'Language and culture deep dive',
    category: 'language',
    duration: '6-weeks',
    culturalConnections: ['Francophone cultures', 'French history', 'Bastille Day'],
    subjects: ['French', 'Culture', 'Geography', 'History'],
    drivingQuestion: 'How does learning another language open new worlds?',
    kickoffExperience: 'French breakfast with vocabulary labels',
    fieldworkIdeas: ['Visit French restaurant', 'Video call with French speaker', 'French film viewing'],
    expertTouchpoints: ['French teacher', 'Francophone community member', 'Travel guide'],
    exhibitionIdea: 'French café simulation with student servers',
    autonomyLevel: 'structured',
    icon: '🇫🇷',
    color: 'bg-blue-500',
    complexityLevel: 1,
  },
  {
    id: 'pod-journalism',
    title: 'Young Journalists: Truth Seekers',
    subtitle: 'Media literacy and reporting',
    category: 'language',
    duration: '4-weeks',
    culturalConnections: ['Freedom of press', 'Media ethics'],
    subjects: ['Writing', 'Research', 'Ethics', 'Technology'],
    drivingQuestion: 'How do we find and share truth in an age of information overload?',
    kickoffExperience: 'Analyze news coverage of the same event from different sources',
    fieldworkIdeas: ['Visit newsroom', 'Interview journalist', 'Create school newspaper'],
    expertTouchpoints: ['Journalist', 'Editor', 'Fact-checker'],
    exhibitionIdea: 'Publish a family/community newsletter',
    autonomyLevel: 'guided',
    icon: '📰',
    color: 'bg-slate-600',
    complexityLevel: 3,
  },

  // Life Skills
  {
    id: 'pod-cooking',
    title: 'Kitchen Scientists: Food & Chemistry',
    subtitle: 'Culinary arts meets science',
    category: 'life-skills',
    duration: '4-weeks',
    culturalConnections: ['World cuisines', 'Food traditions'],
    subjects: ['Chemistry', 'Nutrition', 'Math', 'Culture'],
    drivingQuestion: 'What happens when we cook, and how does food connect cultures?',
    kickoffExperience: 'Bake bread and observe the chemistry',
    fieldworkIdeas: ['Visit restaurant kitchen', 'Farmers market trip', 'Interview chef'],
    expertTouchpoints: ['Chef', 'Nutritionist', 'Food scientist'],
    exhibitionIdea: 'International dinner party with student-prepared dishes',
    autonomyLevel: 'structured',
    icon: '👨‍🍳',
    color: 'bg-orange-500',
    complexityLevel: 1,
  },
  {
    id: 'pod-finance',
    title: 'Money Matters: Financial Literacy',
    subtitle: 'Economics for young minds',
    category: 'life-skills',
    duration: '4-weeks',
    culturalConnections: ['Economic systems', 'Entrepreneurship'],
    subjects: ['Math', 'Economics', 'Decision-making', 'Ethics'],
    drivingQuestion: 'How do we make smart decisions about money and resources?',
    kickoffExperience: 'Create a family budget simulation',
    fieldworkIdeas: ['Visit bank', 'Interview small business owner', 'Stock market simulation'],
    expertTouchpoints: ['Financial advisor', 'Entrepreneur', 'Economist'],
    exhibitionIdea: 'Business plan pitch competition',
    autonomyLevel: 'guided',
    icon: '💰',
    color: 'bg-green-600',
    complexityLevel: 3,
  },

  // Entrepreneurship
  {
    id: 'pod-startup',
    title: 'Young Entrepreneurs: From Idea to Impact',
    subtitle: 'Business basics and innovation',
    category: 'entrepreneurship',
    duration: '6-weeks',
    prerequisites: ['pod-finance'],
    culturalConnections: ['Innovation history', 'Social entrepreneurship'],
    subjects: ['Business', 'Marketing', 'Design', 'Communication'],
    drivingQuestion: 'How can we turn ideas into solutions that help others?',
    kickoffExperience: 'Identify a problem in your community worth solving',
    fieldworkIdeas: ['Interview entrepreneurs', 'Visit startup incubator', 'Customer interviews'],
    expertTouchpoints: ['Entrepreneur', 'Marketing expert', 'Investor'],
    exhibitionIdea: 'Shark Tank-style pitch event',
    autonomyLevel: 'self-directed',
    icon: '🚀',
    color: 'bg-amber-600',
    complexityLevel: 4,
  },

  // Wellness
  {
    id: 'pod-mindfulness',
    title: 'Mind & Body: The Science of Wellness',
    subtitle: 'Mental health and physical wellbeing',
    category: 'wellness',
    duration: '4-weeks',
    culturalConnections: ['Wellness traditions worldwide', 'Mental health awareness'],
    subjects: ['Health', 'Psychology', 'Biology', 'Philosophy'],
    drivingQuestion: 'How do our minds and bodies work together, and how can we take care of both?',
    kickoffExperience: 'Guided meditation and journaling',
    fieldworkIdeas: ['Visit yoga studio', 'Interview therapist', 'Nature mindfulness walk'],
    expertTouchpoints: ['Psychologist', 'Yoga instructor', 'Nutritionist'],
    exhibitionIdea: 'Wellness fair with student-led activities',
    autonomyLevel: 'structured',
    icon: '🧘',
    color: 'bg-teal-500',
    complexityLevel: 1,
  },
  {
    id: 'pod-sports-science',
    title: 'Sports Science: The Athlete\'s Edge',
    subtitle: 'Physics and biology of movement',
    category: 'wellness',
    duration: '4-weeks',
    culturalConnections: ['Olympics', 'Sports history'],
    subjects: ['Physics', 'Biology', 'Statistics', 'Health'],
    drivingQuestion: 'What makes athletes perform at their best?',
    kickoffExperience: 'Measure and analyze your own athletic performance',
    fieldworkIdeas: ['Visit sports facility', 'Interview coach', 'Analyze game footage'],
    expertTouchpoints: ['Sports scientist', 'Physical therapist', 'Coach'],
    exhibitionIdea: 'Sports science fair with demonstrations',
    autonomyLevel: 'guided',
    icon: '⚽',
    color: 'bg-red-500',
    complexityLevel: 2,
  },
];

// Get pods by category
export const getElectivePodsByCategory = (category: ElectivePod['category']): ElectivePod[] => {
  return ELECTIVE_PODS.filter((pod) => pod.category === category);
};

// Get pods by duration
export const getElectivePodsByDuration = (duration: ElectivePod['duration']): ElectivePod[] => {
  return ELECTIVE_PODS.filter((pod) => pod.duration === duration);
};

// Get pods by complexity
export const getElectivePodsByComplexity = (level: 1 | 2 | 3 | 4): ElectivePod[] => {
  return ELECTIVE_PODS.filter((pod) => pod.complexityLevel === level);
};

// Get all pods (core + electives)
export const getAllPods = async () => {
  const { YEARLY_PODS } = await import('./yearlyPods');
  return {
    core: YEARLY_PODS,
    electives: ELECTIVE_PODS,
    total: YEARLY_PODS.length + ELECTIVE_PODS.length,
  };
};
