// Comprehensive Curriculum Types for Month Detailed View
// Supports 4-week pods with 6 tabs: Overview, Tasks, Evidence, Rubric, Materials, Daily Flow

export type SkillLevelId = 'foundation' | 'intermediate' | 'advanced' | 'pro';

export type SubjectTag = 'math' | 'science' | 'tech' | 'sel' | 'arts' | 'communication' | 'integration' | 'leadership';

export type RubricLevel = 'E' | 'D' | 'P' | 'M'; // Emerging, Developing, Proficient, Mastery

// ============ WEEK STRUCTURE ============

export interface PodWeekStructure {
  weekNumber: number;
  title: string;
  subjects: SubjectTag[];
  progressIndicators: {
    tasks: number; // percentage
    evidence: number;
    rubric: number;
  };
}

// ============ OVERVIEW TAB ============

export interface LearningTarget {
  subject: SubjectTag;
  icon: string;
  skills: string[];
}

export interface SafetyNote {
  text: string;
  priority: 'warning' | 'info';
}

export interface StudentProgress {
  learnerId: string;
  learnerName: string;
  avatar: string;
  skillLevel: SkillLevelId;
  completionPercent: number;
}

export interface WeekOverview {
  weekNumber: number;
  title: string;
  learningTargets: LearningTarget[];
  safetyNotes: SafetyNote[];
}

// ============ TASKS TAB ============

export interface TaskStep {
  stepNumber: number;
  description: string;
  isCompleted?: boolean;
}

export interface LearnerTasks {
  learnerId: string;
  learnerName: string;
  skillLevel: SkillLevelId;
  weekNumber: number;
  taskSteps: TaskStep[];
  codeRequired: boolean;
  estimatedTime: number; // minutes
}

// ============ EVIDENCE TAB ============

export interface EvidenceItem {
  id: string;
  label: string;
  description?: string;
  isRequired: boolean;
  isCompleted?: boolean;
  artifactUrl?: string;
  submittedAt?: string;
}

export interface WeekEvidence {
  weekNumber: number;
  items: EvidenceItem[];
}

// ============ RUBRIC TAB ============

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  levels: {
    E: string; // Emerging
    D: string; // Developing
    P: string; // Proficient
    M: string; // Mastery
  };
  currentLevel?: RubricLevel;
}

export interface WeekRubric {
  weekNumber: number;
  criteria: RubricCriterion[];
  unlockRule: string;
}

// ============ MATERIALS TAB ============

export interface MaterialItem {
  id: string;
  name: string;
  isAvailable?: boolean;
  alternatives?: string[];
}

export interface WeekMaterials {
  weekNumber: number;
  items: MaterialItem[];
}

// ============ DAILY FLOW TAB ============

export interface DailyActivity {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  activities: string;
  duration?: number; // minutes
}

export interface WeekDailyFlow {
  weekNumber: number;
  days: DailyActivity[];
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  skillLevels: SkillLevelId[];
  prompt?: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: 'multiple-choice' | 'short-answer' | 'match' | 'ordering';
  skillLevels: SkillLevelId[];
  day?: DailyActivity['day'];
  options?: string[];
  correctAnswer: string | string[];
  hint?: string;
  explanation: string;
}

export interface CanonicalMiniLesson {
  id: string;
  title: string;
  day?: DailyActivity['day'];
  learningObjective: string;
  explanationSections: string[];
  concreteExample: string;
  quickChecks: string[];
  keyTakeaways: string[];
  estimatedMinutes: number;
  tags?: string[];
  relatedActivities?: string[];
}

export interface ProjectTemplate {
  id: string;
  title: string;
  style: 'experiment' | 'model' | 'poster' | 'comic' | 'build' | 'presentation' | 'research';
  description: string;
  skillLevels: SkillLevelId[];
  learningGoals: string[];
  materials: string[];
  steps: string[];
  interestHookTemplate: string;
  estimatedTimeMinutes: number;
}

export interface InteractiveTask {
  id: string;
  title: string;
  type: 'simulation' | 'model-build' | 'discussion' | 'game' | 'experiment' | 'reflection';
  description: string;
  skillLevels: SkillLevelId[];
  estimatedMinutes: number;
  resourceUrl?: string;
  evidencePrompt?: string;
}

export interface ProjectBrief {
  title: string;
  drivingQuestion: string;
  deliverables: string[];
  skillLevelNotes: Record<SkillLevelId, string>;
}

export interface PodReference {
  id: string;
  title: string;
  url: string;
  category: 'standard' | 'research' | 'activity' | 'simulation' | 'video' | 'article';
  note?: string;
}

export interface SupportingAsset {
  id: string;
  title: string;
  type: 'video' | 'mind-map' | 'slide-deck' | 'notebook' | 'worksheet' | 'link';
  description?: string;
  url?: string;
  artifactId?: string;
}

export interface PacingOption {
  id: string;
  label: string;
  totalWeeks: number;
  sessionsPerWeek: number;
  minutesPerSession: number;
  notes: string;
}

export interface PlanningQuestion {
  id: string;
  prompt: string;
  type: 'timeframe' | 'hours-per-week' | 'minutes-per-day' | 'schedule-mode';
  options: string[];
}

export interface AgeBandGuidance {
  skillLevel: SkillLevelId;
  ageRange: string;
  focus: string;
  essentialQuestions: string[];
  supportStrategies: string[];
  extensionStrategies: string[];
  capstoneIdea: string;
}

export interface LearningSegment {
  id: string;
  title: string;
  summary: string;
  guidingQuestions: string[];
  skillsUnlocked: string[];
  realWorldLinks: string[];
}

// ============ COMPLETE WEEK DATA ============

export interface WeekCurriculum {
  weekNumber: number;
  title: string;
  subjects: SubjectTag[];
  overview: WeekOverview;
  tasksBySkillLevel: Record<SkillLevelId, TaskStep[]>;
  codeRequiredByLevel: Record<SkillLevelId, boolean>;
  evidence: WeekEvidence;
  rubric: WeekRubric;
  materials: WeekMaterials;
  dailyFlow: WeekDailyFlow;
  essentialQuestions?: string[];
  flashcards?: FlashcardItem[];
  canonicalLessonsBySkillLevel?: Record<SkillLevelId, CanonicalMiniLesson[]>;
  quizQuestions?: QuizQuestion[];
  interactiveTasks?: InteractiveTask[];
  projectTemplates?: ProjectTemplate[];
  weeklyProject?: ProjectBrief;
}

// ============ COMPLETE POD CURRICULUM ============

export interface PodCurriculum {
  podId: string;
  podTitle: string;
  monthNumber: number;
  description: string;
  unlockRule: string;
  weeks: WeekCurriculum[];
  programHours?: number;
  references?: PodReference[];
  supportingAssets?: SupportingAsset[];
  pacingOptions?: PacingOption[];
  planningQuestions?: PlanningQuestion[];
  ageBandGuidance?: AgeBandGuidance[];
  segments?: LearningSegment[];
}

// ============ LEARNER PROGRESS TRACKING ============

export interface LearnerWeekProgress {
  learnerId: string;
  podId: string;
  weekNumber: number;
  tasksCompleted: number[];
  evidenceSubmitted: string[];
  rubricScores: Record<string, RubricLevel>;
  completionPercent: number;
  lastUpdated: string;
}

// ============ SUBJECT TAG CONFIG ============

export const SUBJECT_TAG_CONFIG: Record<SubjectTag, { label: string; icon: string; color: string }> = {
  math: { label: 'Math', icon: '📐', color: 'bg-blue-100 text-blue-700' },
  science: { label: 'Science', icon: '🔬', color: 'bg-green-100 text-green-700' },
  tech: { label: 'Tech', icon: '💻', color: 'bg-purple-100 text-purple-700' },
  sel: { label: 'SEL', icon: '💚', color: 'bg-pink-100 text-pink-700' },
  arts: { label: 'Arts', icon: '🎨', color: 'bg-orange-100 text-orange-700' },
  communication: { label: 'Communication', icon: '🗣️', color: 'bg-cyan-100 text-cyan-700' },
  integration: { label: 'Integration', icon: '🔗', color: 'bg-indigo-100 text-indigo-700' },
  leadership: { label: 'Leadership', icon: '⭐', color: 'bg-amber-100 text-amber-700' },
};

export const RUBRIC_LEVEL_CONFIG: Record<RubricLevel, { label: string; color: string; bgColor: string }> = {
  E: { label: 'Emerging', color: 'text-red-600', bgColor: 'bg-red-50' },
  D: { label: 'Developing', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  P: { label: 'Proficient', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  M: { label: 'Mastery', color: 'text-green-600', bgColor: 'bg-green-50' },
};

export const SKILL_LEVEL_CONFIG: Record<SkillLevelId, { label: string; color: string }> = {
  foundation: { label: 'Foundation', color: 'bg-emerald-100 text-emerald-700' },
  intermediate: { label: 'Intermediate', color: 'bg-blue-100 text-blue-700' },
  advanced: { label: 'Advanced', color: 'bg-purple-100 text-purple-700' },
  pro: { label: 'Pro', color: 'bg-amber-100 text-amber-700' },
};
