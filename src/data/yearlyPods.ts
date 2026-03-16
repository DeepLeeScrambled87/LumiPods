// Year-Round Pod Calendar
// Research-backed curriculum with complexity escalation
// Flexible: Can start any month, pods are sequenced 1-12 relative to start

export interface YearlyPod {
  id: string;
  month: number; // 1-12 (relative to school year start, not calendar)
  sequence: number; // 1-12 order in curriculum
  title: string;
  subtitle: string;
  culturalConnections: string[];
  subjects: string[];
  drivingQuestion: string;
  kickoffExperience: string;
  fieldworkIdeas: string[];
  expertTouchpoints: string[];
  exhibitionIdea: string;
  autonomyLevel: 'structured' | 'guided' | 'self-directed';
  icon: string;
  color: string;
  // Complexity progression
  complexityLevel: 1 | 2 | 3 | 4; // Escalates through year
}

// Pods are sequenced 1-12 for complexity progression
// Month mapping is flexible based on family's school year start
export const YEARLY_PODS: YearlyPod[] = [
  {
    id: 'pod-community',
    month: 9, // Default Sept start, but adjustable
    sequence: 1,
    title: 'Community Mapping: Our Place',
    subtitle: 'Back to school, Constitution Week',
    culturalConnections: ['Constitution Day', 'Labor Day', 'Hispanic Heritage Month begins'],
    subjects: ['Geography', 'Civics', 'Art', 'Coding'],
    drivingQuestion: 'How do the places we live shape who we become?',
    kickoffExperience: 'Neighborhood walk with observation journals',
    fieldworkIdeas: ['Interview local business owners', 'Map community resources', 'Visit city hall'],
    expertTouchpoints: ['Urban planner', 'Local historian', 'City council member'],
    exhibitionIdea: 'Interactive community map presentation for neighbors',
    autonomyLevel: 'structured',
    icon: '🏘️',
    color: 'bg-amber-500',
    complexityLevel: 1,
  },
  {
    id: 'pod-migration',
    month: 10,
    sequence: 2,
    title: 'Migration: Who Moves and Why',
    subtitle: 'Fall bird migration, heritage months',
    culturalConnections: ['Hispanic Heritage Month', 'Indigenous Peoples Day', 'Halloween'],
    subjects: ['Biology', 'History', 'Data', 'Narrative'],
    drivingQuestion: 'What drives living things to move, and what do they carry with them?',
    kickoffExperience: 'Bird watching expedition at dawn',
    fieldworkIdeas: ['Track local bird migrations', 'Interview immigrant families', 'Visit natural history museum'],
    expertTouchpoints: ['Ornithologist', 'Immigration attorney', 'Anthropologist'],
    exhibitionIdea: 'Migration stories documentary screening',
    autonomyLevel: 'structured',
    icon: '🦅',
    color: 'bg-orange-500',
    complexityLevel: 1,
  },
  {
    id: 'pod-food',
    month: 11,
    sequence: 3,
    title: 'Food Systems: Seed to Table',
    subtitle: 'Harvest, Thanksgiving',
    culturalConnections: ['Thanksgiving', 'Native American Heritage Month', 'Diwali'],
    subjects: ['Botany', 'Chemistry', 'Economics', 'Culture'],
    drivingQuestion: 'How does food connect us to the earth and each other?',
    kickoffExperience: 'Farm visit or farmers market exploration',
    fieldworkIdeas: ['Plant a winter garden', 'Visit food bank', 'Interview restaurant owner'],
    expertTouchpoints: ['Farmer', 'Nutritionist', 'Food scientist'],
    exhibitionIdea: 'Community meal with dishes from family heritage',
    autonomyLevel: 'structured',
    icon: '🌾',
    color: 'bg-yellow-600',
    complexityLevel: 1,
  },
  {
    id: 'pod-light',
    month: 12,
    sequence: 4,
    title: 'Light and Shadow: Science of Seeing',
    subtitle: 'Winter solstice, multi-cultural celebrations',
    culturalConnections: ['Hanukkah', 'Christmas', 'Kwanzaa', 'Winter Solstice'],
    subjects: ['Optics', 'Math', 'Art', 'Literature'],
    drivingQuestion: 'How does light reveal and conceal the world around us?',
    kickoffExperience: 'Shadow puppet theater performance',
    fieldworkIdeas: ['Photography walk at golden hour', 'Visit planetarium', 'Build camera obscura'],
    expertTouchpoints: ['Photographer', 'Optometrist', 'Lighting designer'],
    exhibitionIdea: 'Light installation art show',
    autonomyLevel: 'guided',
    icon: '💡',
    color: 'bg-indigo-500',
    complexityLevel: 2,
  },
  {
    id: 'pod-time',
    month: 1,
    sequence: 5,
    title: 'Time: Measuring What We Cannot See',
    subtitle: 'New Year, calendar systems',
    culturalConnections: ['New Year', 'Martin Luther King Jr. Day', 'Lunar New Year prep'],
    subjects: ['Astronomy', 'History', 'Philosophy', 'Coding'],
    drivingQuestion: 'How do humans make sense of something we cannot touch?',
    kickoffExperience: 'Sunrise observation and time capsule creation',
    fieldworkIdeas: ['Visit clock tower or observatory', 'Interview elderly community members', 'Build sundial'],
    expertTouchpoints: ['Astronomer', 'Historian', 'Watchmaker'],
    exhibitionIdea: 'Time capsule ceremony with predictions',
    autonomyLevel: 'guided',
    icon: '⏰',
    color: 'bg-slate-600',
    complexityLevel: 2,
  },
  {
    id: 'pod-communication',
    month: 2,
    sequence: 6,
    title: 'Communication Across Time',
    subtitle: 'Black History Month, Presidents Day',
    culturalConnections: ['Black History Month', 'Presidents Day', 'Lunar New Year'],
    subjects: ['Language evolution', 'Technology', 'Codes'],
    drivingQuestion: 'How have humans found ways to share ideas across distance and time?',
    kickoffExperience: 'Decode a cipher challenge',
    fieldworkIdeas: ['Visit post office or radio station', 'Learn sign language basics', 'Interview translator'],
    expertTouchpoints: ['Linguist', 'Cryptographer', 'Deaf community member'],
    exhibitionIdea: 'Multi-language storytelling performance',
    autonomyLevel: 'guided',
    icon: '📡',
    color: 'bg-purple-500',
    complexityLevel: 2,
  },
  {
    id: 'pod-patterns',
    month: 3,
    sequence: 7,
    title: 'Patterns: Hidden Order of Everything',
    subtitle: 'Spring equinox, growth cycles',
    culturalConnections: ['Womens History Month', 'Spring Equinox', 'Pi Day', 'Holi'],
    subjects: ['Math', 'Nature', 'Music', 'Algorithm design'],
    drivingQuestion: 'What hidden patterns connect math, music, and nature?',
    kickoffExperience: 'Nature walk finding Fibonacci in plants',
    fieldworkIdeas: ['Visit botanical garden', 'Interview musician about rhythm', 'Analyze stock patterns'],
    expertTouchpoints: ['Mathematician', 'Composer', 'Data scientist'],
    exhibitionIdea: 'Pattern art gallery with mathematical explanations',
    autonomyLevel: 'guided',
    icon: '🔢',
    color: 'bg-teal-500',
    complexityLevel: 2,
  },
  {
    id: 'pod-sustainability',
    month: 4,
    sequence: 8,
    title: 'Waste Not: Science of Sustainability',
    subtitle: 'Earth Day',
    culturalConnections: ['Earth Day', 'Arbor Day', 'Passover', 'Easter'],
    subjects: ['Materials science', 'Policy', 'Data visualization'],
    drivingQuestion: 'How can we redesign our world to waste nothing?',
    kickoffExperience: 'Trash audit of household waste',
    fieldworkIdeas: ['Visit recycling facility', 'Interview sustainability officer', 'Beach/park cleanup'],
    expertTouchpoints: ['Environmental engineer', 'Policy maker', 'Zero-waste advocate'],
    exhibitionIdea: 'Upcycled art show with impact data',
    autonomyLevel: 'self-directed',
    icon: '♻️',
    color: 'bg-green-500',
    complexityLevel: 3,
  },
  {
    id: 'pod-shelter',
    month: 5,
    sequence: 9,
    title: 'Building Shelter: Architecture & Engineering',
    subtitle: 'Asian heritage, end-of-year exhibitions',
    culturalConnections: ['Asian American Heritage Month', 'Memorial Day', 'Mothers Day'],
    subjects: ['Physics', 'Geometry', 'Design', 'History'],
    drivingQuestion: 'How do humans create spaces that protect and inspire?',
    kickoffExperience: 'Build a structure that holds weight',
    fieldworkIdeas: ['Architecture walking tour', 'Visit construction site', 'Interview architect'],
    expertTouchpoints: ['Architect', 'Structural engineer', 'Interior designer'],
    exhibitionIdea: 'Model home designs with sustainability features',
    autonomyLevel: 'self-directed',
    icon: '🏗️',
    color: 'bg-stone-500',
    complexityLevel: 3,
  },
  {
    id: 'pod-water',
    month: 6,
    sequence: 10,
    title: 'Water: The Universal Connector',
    subtitle: 'Summer, outdoor learning',
    culturalConnections: ['World Ocean Day', 'Juneteenth', 'Summer Solstice'],
    subjects: ['Ecology', 'Chemistry', 'Storytelling'],
    drivingQuestion: 'How does water shape life, land, and human civilization?',
    kickoffExperience: 'Water source expedition - trace your tap water',
    fieldworkIdeas: ['Visit water treatment plant', 'Kayak/canoe trip', 'Test local water quality'],
    expertTouchpoints: ['Marine biologist', 'Water engineer', 'Fisherman'],
    exhibitionIdea: 'Water documentary film festival',
    autonomyLevel: 'self-directed',
    icon: '💧',
    color: 'bg-cyan-500',
    complexityLevel: 3,
  },
  {
    id: 'pod-power',
    month: 7,
    sequence: 11,
    title: 'Power and Choice: How Decisions Get Made',
    subtitle: 'Independence Day',
    culturalConnections: ['Independence Day', 'Bastille Day', 'Global democracy movements'],
    subjects: ['History', 'Governance', 'Debate', 'Probability'],
    drivingQuestion: 'How do groups of people make decisions that affect everyone?',
    kickoffExperience: 'Simulate a town hall meeting',
    fieldworkIdeas: ['Attend city council meeting', 'Interview elected official', 'Visit courthouse'],
    expertTouchpoints: ['Judge', 'Politician', 'Activist'],
    exhibitionIdea: 'Mock election with student-created platforms',
    autonomyLevel: 'self-directed',
    icon: '⚖️',
    color: 'bg-red-500',
    complexityLevel: 4,
  },
  {
    id: 'pod-survival',
    month: 8,
    sequence: 12,
    title: 'Stories of Survival: Adaptation & Resilience',
    subtitle: 'Preview next year, reflection',
    culturalConnections: ['Back to school prep', 'End of summer reflection'],
    subjects: ['Evolution', 'Biography', 'Documentary'],
    drivingQuestion: 'What can we learn from those who overcame impossible odds?',
    kickoffExperience: 'Survival challenge day (outdoor skills)',
    fieldworkIdeas: ['Visit natural history museum', 'Interview survivor/refugee', 'Wildlife observation'],
    expertTouchpoints: ['Biologist', 'Survival instructor', 'Documentary filmmaker'],
    exhibitionIdea: 'Survival stories podcast series',
    autonomyLevel: 'self-directed',
    icon: '🦎',
    color: 'bg-emerald-600',
    complexityLevel: 4,
  },
];

// Helper to get pods based on a flexible school year start
// startMonth: 1-12 (e.g., 9 for September, 1 for January)
export const getPodsForSchoolYear = (startMonth: number = 9): YearlyPod[] => {
  return YEARLY_PODS.map((pod, index) => {
    // Calculate the actual calendar month based on start month and sequence
    const actualMonth = ((startMonth - 1 + index) % 12) + 1;
    return { ...pod, month: actualMonth };
  });
};

export const getCurrentMonthPod = (startMonth: number = 9): YearlyPod | undefined => {
  const currentMonth = new Date().getMonth() + 1;
  const pods = getPodsForSchoolYear(startMonth);
  return pods.find((p) => p.month === currentMonth);
};

export const getNextPod = (startMonth: number = 9): YearlyPod | undefined => {
  const currentMonth = new Date().getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const pods = getPodsForSchoolYear(startMonth);
  return pods.find((p) => p.month === nextMonth);
};

export const getPodByMonth = (month: number, startMonth: number = 9): YearlyPod | undefined => {
  const pods = getPodsForSchoolYear(startMonth);
  return pods.find((p) => p.month === month);
};

export const getPodBySequence = (sequence: number): YearlyPod | undefined => {
  return YEARLY_PODS.find((p) => p.sequence === sequence);
};

export const getPodsByComplexity = (level: 1 | 2 | 3 | 4): YearlyPod[] => {
  return YEARLY_PODS.filter((p) => p.complexityLevel === level);
};

// Get current sequence position in the school year
export const getCurrentSequence = (startMonth: number = 9): number => {
  const currentMonth = new Date().getMonth() + 1;
  const monthsFromStart = (currentMonth - startMonth + 12) % 12;
  return monthsFromStart + 1; // 1-indexed
};
