import type {
  CanonicalMiniLesson,
  FlashcardItem,
  ProjectTemplate,
  QuizQuestion,
  SkillLevelId,
} from './curriculum';

export interface FoundationalRailToolStage {
  id: string;
  title: string;
  skillLevels: SkillLevelId[];
  purpose: string;
  tools: string[];
  sampleOutputs: string[];
}

export interface FoundationalRailModule {
  id: string;
  title: string;
  summary: string;
  estimatedWeeks: number;
  coreSkills: string[];
  realWorldUseCases: string[];
  miniLessons: CanonicalMiniLesson[];
  flashcards: FlashcardItem[];
  quizQuestions: QuizQuestion[];
}

export interface FoundationalRailTrack {
  id: string;
  railId: string;
  title: string;
  skillLevel: SkillLevelId;
  ageRange: string;
  weeklyCadence: string;
  sessionsPerWeek: number;
  sessionLengthMinutes: number;
  description: string;
  objectives: string[];
  modules: FoundationalRailModule[];
  sharedProjectTemplates: ProjectTemplate[];
  toolStages: FoundationalRailToolStage[];
}

export interface FoundationalRailAssignment {
  id: string;
  familyId: string;
  learnerId: string;
  railId: string;
  trackId: string;
  skillLevel: SkillLevelId;
  startDate: string;
  isActive: boolean;
}
