import type { SkillLevel } from './skillLevel';

export type ProjectStatus = 'planned' | 'active' | 'review' | 'completed' | 'archived';
export type ProjectSource = 'pod' | 'side-quest' | 'external-tool' | 'custom';
export type ProjectChallengeLevel = 'support' | 'core' | 'stretch';

export interface LearningProject {
  id: string;
  familyId: string;
  learnerId: string;
  podId?: string;
  title: string;
  summary?: string;
  goal?: string;
  status: ProjectStatus;
  source: ProjectSource;
  skillLevel: SkillLevel;
  challengeLevel: ProjectChallengeLevel;
  startDate: string;
  targetDate?: string;
  completedAt?: string;
  externalPlatformIds: string[];
  tags: string[];
  artifactIds: string[];
  reflectionIds: string[];
  lastWorkedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStepStatus = 'planned' | 'active' | 'completed' | 'blocked';

export interface ProjectStep {
  id: string;
  familyId: string;
  learnerId: string;
  projectId: string;
  title: string;
  description?: string;
  status: ProjectStepStatus;
  orderIndex: number;
  linkedBlockId?: string;
  linkedPlatformId?: string;
  dueDate?: string;
  completedAt?: string;
  evidenceArtifactIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReflectionQuizAnswer {
  question: string;
  answer: string;
}

export interface ReflectionEntry {
  id: string;
  familyId: string;
  learnerId: string;
  date: string;
  blockId?: string;
  blockTitle?: string;
  projectId?: string;
  externalSessionId?: string;
  prompt?: string;
  whatLearned: string;
  challenge?: string;
  nextStep?: string;
  confidence: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  quizAnswers: ReflectionQuizAnswer[];
  evidenceArtifactIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ExternalActivityStatus = 'scheduled' | 'in-progress' | 'completed' | 'skipped';
export type ExternalSyncMode = 'manual' | 'linked' | 'imported';

export interface ExternalActivitySession {
  id: string;
  familyId: string;
  learnerId: string;
  projectId?: string;
  platformId: string;
  platformName: string;
  title: string;
  description?: string;
  url?: string;
  scheduledDate: string;
  scheduledStartTime?: string;
  durationMinutes: number;
  status: ExternalActivityStatus;
  syncMode: ExternalSyncMode;
  importedAccountLabel?: string;
  notes?: string;
  reflectionId?: string;
  evidenceArtifactIds: string[];
  tags: string[];
  completedAt?: string;
  blockId?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PlanningRuleStatus = 'draft' | 'active' | 'archived';
export type PlanningChallengeMode = 'support' | 'balanced' | 'stretch';

export interface PlannedSupportPod {
  podId: string;
  startDate: string;
  endDate?: string;
  plannedWeeks?: number;
}

export interface PlanningRule {
  id: string;
  familyId: string;
  learnerId: string;
  name: string;
  status: PlanningRuleStatus;
  primaryPodId?: string;
  supportPodIds: string[];
  supportPodPlans: PlannedSupportPod[];
  preferredPlatformIds: string[];
  weeklyProjectSessions: number;
  weeklyExternalSessions: number;
  includeMovement: boolean;
  includeFrench: boolean;
  includeWriting: boolean;
  challengeLevel: PlanningChallengeMode;
  periodStart: string;
  periodEnd?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AchievementSourceType =
  | 'progress'
  | 'artifact'
  | 'project'
  | 'reflection'
  | 'external-session'
  | 'manual';

export interface AchievementUnlock {
  id: string;
  familyId: string;
  learnerId: string;
  achievementId: string;
  unlockedAt: string;
  sourceType: AchievementSourceType;
  sourceId?: string;
  pointsAwarded?: number;
  createdAt: string;
  updatedAt: string;
}
