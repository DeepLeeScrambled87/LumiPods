// Curriculum Service - Bridge between curriculum data and other services
// Connects: PodCurriculum ↔ Schedules ↔ Progress ↔ Portfolio

import { storage } from '../lib/storage';
import { generateId } from '../lib/id';
import { ALL_CURRICULA, getCurriculumByPodId } from '../data/curriculum';
import type {
  PodCurriculum,
  WeekCurriculum,
  SkillLevelId,
  LearnerWeekProgress,
  RubricLevel,
  TaskStep,
  EvidenceItem,
} from '../types/curriculum';
import type { ScheduleBlock, BlockType } from '../types/schedule';

const PROGRESS_KEY = 'learner-curriculum-progress';
const ACTIVE_POD_KEY = 'active-pod';

export interface ActivePodPlan {
  podId: string;
  weekNumber: number;
  startDate: string;
  pacingOptionId?: string;
  plannedWeeks?: number;
  sessionsPerWeek?: number;
  minutesPerSession?: number;
  scheduleMode?: string;
}

// ============ CURRICULUM ACCESS ============

export const curriculumService = {
  // Get all available curricula
  getAllCurricula(): PodCurriculum[] {
    return ALL_CURRICULA;
  },

  // Get curriculum by pod ID
  getCurriculum(podId: string): PodCurriculum | undefined {
    return getCurriculumByPodId(podId);
  },

  // Get week curriculum
  getWeekCurriculum(podId: string, weekNumber: number): WeekCurriculum | undefined {
    const curriculum = this.getCurriculum(podId);
    return curriculum?.weeks.find((w) => w.weekNumber === weekNumber);
  },

  // Get tasks for a learner's skill level
  getTasksForLearner(
    podId: string,
    weekNumber: number,
    skillLevel: SkillLevelId
  ): TaskStep[] {
    const week = this.getWeekCurriculum(podId, weekNumber);
    if (!week) return [];
    return week.tasksBySkillLevel[skillLevel] || week.tasksBySkillLevel.intermediate;
  },

  // Check if code is required for skill level
  isCodeRequired(podId: string, weekNumber: number, skillLevel: SkillLevelId): boolean {
    const week = this.getWeekCurriculum(podId, weekNumber);
    if (!week) return false;
    return week.codeRequiredByLevel[skillLevel] || false;
  },

  // ============ ACTIVE POD MANAGEMENT ============

  // Get family's active pod
  getActivePod(familyId: string): ActivePodPlan | null {
    const key = `${ACTIVE_POD_KEY}-${familyId}`;
    return storage.get(key, null);
  },

  // Set family's active pod
  setActivePod(
    familyId: string,
    podId: string,
    weekNumber: number = 1,
    options: Partial<Omit<ActivePodPlan, 'podId' | 'weekNumber'>> = {}
  ): void {
    const key = `${ACTIVE_POD_KEY}-${familyId}`;
    storage.set(key, {
      podId,
      weekNumber,
      startDate: options.startDate || new Date().toISOString(),
      ...options,
    });
  },

  clearActivePod(familyId: string): void {
    const key = `${ACTIVE_POD_KEY}-${familyId}`;
    storage.remove(key);
  },

  // Advance to next week
  advanceWeek(familyId: string): boolean {
    const active = this.getActivePod(familyId);
    if (!active) return false;

    const curriculum = this.getCurriculum(active.podId);
    if (!curriculum) return false;

    const nextWeek = active.weekNumber + 1;
    if (nextWeek > curriculum.weeks.length) {
      // Pod complete - could trigger completion logic
      return false;
    }

    this.setActivePod(familyId, active.podId, nextWeek, {
      startDate: active.startDate,
      pacingOptionId: active.pacingOptionId,
      plannedWeeks: active.plannedWeeks,
      sessionsPerWeek: active.sessionsPerWeek,
      minutesPerSession: active.minutesPerSession,
      scheduleMode: active.scheduleMode,
    });
    return true;
  },

  // ============ PROGRESS TRACKING ============

  // Get learner's progress for a week
  getLearnerProgress(
    learnerId: string,
    podId: string,
    weekNumber: number
  ): LearnerWeekProgress | null {
    const key = `${PROGRESS_KEY}-${learnerId}-${podId}-${weekNumber}`;
    return storage.get(key, null);
  },

  // Initialize progress for a learner
  initializeProgress(
    learnerId: string,
    podId: string,
    weekNumber: number
  ): LearnerWeekProgress {
    const progress: LearnerWeekProgress = {
      learnerId,
      podId,
      weekNumber,
      tasksCompleted: [],
      evidenceSubmitted: [],
      rubricScores: {},
      completionPercent: 0,
      lastUpdated: new Date().toISOString(),
    };
    this.saveProgress(progress);
    return progress;
  },

  // Save progress
  saveProgress(progress: LearnerWeekProgress): void {
    const key = `${PROGRESS_KEY}-${progress.learnerId}-${progress.podId}-${progress.weekNumber}`;
    storage.set(key, { ...progress, lastUpdated: new Date().toISOString() });
  },

  // Mark task as completed
  completeTask(
    learnerId: string,
    podId: string,
    weekNumber: number,
    taskNumber: number
  ): LearnerWeekProgress {
    let progress = this.getLearnerProgress(learnerId, podId, weekNumber);
    if (!progress) {
      progress = this.initializeProgress(learnerId, podId, weekNumber);
    }

    if (!progress.tasksCompleted.includes(taskNumber)) {
      progress.tasksCompleted.push(taskNumber);
      progress.completionPercent = this.calculateCompletion(progress, podId, weekNumber);
      this.saveProgress(progress);
    }

    return progress;
  },

  // Submit evidence
  submitEvidence(
    learnerId: string,
    podId: string,
    weekNumber: number,
    evidenceId: string
  ): LearnerWeekProgress {
    let progress = this.getLearnerProgress(learnerId, podId, weekNumber);
    if (!progress) {
      progress = this.initializeProgress(learnerId, podId, weekNumber);
    }

    if (!progress.evidenceSubmitted.includes(evidenceId)) {
      progress.evidenceSubmitted.push(evidenceId);
      progress.completionPercent = this.calculateCompletion(progress, podId, weekNumber);
      this.saveProgress(progress);
    }

    return progress;
  },

  // Set rubric score
  setRubricScore(
    learnerId: string,
    podId: string,
    weekNumber: number,
    criterionId: string,
    level: RubricLevel
  ): LearnerWeekProgress {
    let progress = this.getLearnerProgress(learnerId, podId, weekNumber);
    if (!progress) {
      progress = this.initializeProgress(learnerId, podId, weekNumber);
    }

    progress.rubricScores[criterionId] = level;
    progress.completionPercent = this.calculateCompletion(progress, podId, weekNumber);
    this.saveProgress(progress);

    return progress;
  },

  // Calculate overall completion percentage
  calculateCompletion(
    progress: LearnerWeekProgress,
    podId: string,
    weekNumber: number
  ): number {
    const week = this.getWeekCurriculum(podId, weekNumber);
    if (!week) return 0;

    // Weight: Tasks 40%, Evidence 40%, Rubric 20%
    const totalTasks = 4; // Typically 4 task steps
    const totalEvidence = week.evidence.items.filter((e) => e.isRequired).length;
    const totalRubric = week.rubric.criteria.length;

    const taskScore = (progress.tasksCompleted.length / totalTasks) * 40;
    const evidenceScore = (progress.evidenceSubmitted.length / Math.max(totalEvidence, 1)) * 40;
    const rubricScore = (Object.keys(progress.rubricScores).length / Math.max(totalRubric, 1)) * 20;

    return Math.min(100, Math.round(taskScore + evidenceScore + rubricScore));
  },

  // Check if week is unlocked (meets proficiency requirements)
  isWeekUnlocked(
    learnerId: string,
    podId: string,
    weekNumber: number
  ): boolean {
    if (weekNumber === 1) return true; // First week always unlocked

    const prevProgress = this.getLearnerProgress(learnerId, podId, weekNumber - 1);
    if (!prevProgress) return false;

    // Check unlock rule: Average ≥ P across rubric scores
    const scores = Object.values(prevProgress.rubricScores);
    if (scores.length === 0) return false;

    const proficientOrHigher = scores.filter((s) => s === 'P' || s === 'M').length;
    return proficientOrHigher >= Math.ceil(scores.length * 0.8); // 80% at P or M
  },

  // ============ SCHEDULE GENERATION FROM CURRICULUM ============

  // Generate schedule blocks from curriculum daily flow
  generateBlocksFromCurriculum(
    podId: string,
    weekNumber: number,
    dayOfWeek: number, // 1-5 (Mon-Fri)
    skillLevel: SkillLevelId,
    startTime: string = '09:00'
  ): ScheduleBlock[] {
    const week = this.getWeekCurriculum(podId, weekNumber);
    if (!week) return [];

    const dayFlow = week.dailyFlow.days[dayOfWeek - 1];
    if (!dayFlow) return [];

    const blocks: ScheduleBlock[] = [];
    let currentTime = startTime;

    // Parse daily activities and create blocks
    const activities = dayFlow.activities.split(';').map((a) => a.trim());
    const durationPerActivity = Math.floor((dayFlow.duration || 90) / activities.length);

    activities.forEach((activity, index) => {
      const blockType = this.inferBlockType(activity);
      const block: ScheduleBlock = {
        id: generateId(),
        title: this.formatActivityTitle(activity, week.title),
        description: activity,
        startTime: currentTime,
        endTime: this.addMinutes(currentTime, durationPerActivity),
        duration: durationPerActivity,
        type: blockType,
        status: 'scheduled',
        priority: index === 0 ? 'high' : 'medium',
        podId,
        weekNumber,
        objectives: this.getObjectivesForActivity(activity, week, skillLevel),
        materials: week.materials.items.slice(0, 3).map((m) => m.name),
        resources: [],
        source: 'pod',
        energyRequired: blockType === 'learning' ? 'high' : 'medium',
        focusRequired: blockType === 'learning' ? 'high' : 'medium',
        canReschedule: true,
      };

      blocks.push(block);
      currentTime = block.endTime;
    });

    // Add break if duration > 60 min
    if ((dayFlow.duration || 90) > 60 && blocks.length > 1) {
      const breakBlock: ScheduleBlock = {
        id: generateId(),
        title: 'Break',
        startTime: blocks[Math.floor(blocks.length / 2)].endTime,
        endTime: this.addMinutes(blocks[Math.floor(blocks.length / 2)].endTime, 15),
        duration: 15,
        type: 'break',
        status: 'scheduled',
        priority: 'low',
        objectives: ['Rest and recharge'],
        materials: [],
        resources: [],
        source: 'custom',
        energyRequired: 'low',
        focusRequired: 'low',
        canReschedule: true,
      };
      blocks.splice(Math.floor(blocks.length / 2) + 1, 0, breakBlock);
    }

    return blocks;
  },

  // Infer block type from activity description
  inferBlockType(activity: string): BlockType {
    const lower = activity.toLowerCase();
    if (lower.includes('build') || lower.includes('plan') || lower.includes('design')) return 'project';
    if (lower.includes('trial') || lower.includes('test') || lower.includes('experiment')) return 'practice';
    if (lower.includes('analysis') || lower.includes('chart') || lower.includes('data')) return 'learning';
    if (lower.includes('share') || lower.includes('present') || lower.includes('feedback')) return 'reflection';
    if (lower.includes('code') || lower.includes('python') || lower.includes('notebook')) return 'learning';
    if (lower.includes('safety')) return 'learning';
    return 'learning';
  },

  // Format activity into a nice title
  formatActivityTitle(activity: string, weekTitle: string): string {
    const parts = activity.split('+').map((p) => p.trim());
    if (parts.length > 1) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return `${weekTitle}: ${activity.charAt(0).toUpperCase() + activity.slice(1)}`;
  },

  // Get objectives based on activity
  getObjectivesForActivity(
    activity: string,
    week: WeekCurriculum,
    skillLevel: SkillLevelId
  ): string[] {
    const tasks = week.tasksBySkillLevel[skillLevel] || [];
    const lower = activity.toLowerCase();

    // Match activity to relevant tasks
    if (lower.includes('plan') || lower.includes('build')) {
      return tasks.slice(0, 2).map((t) => t.description);
    }
    if (lower.includes('trial') || lower.includes('data')) {
      return tasks.slice(1, 3).map((t) => t.description);
    }
    if (lower.includes('analysis') || lower.includes('chart')) {
      return tasks.slice(2, 4).map((t) => t.description);
    }
    if (lower.includes('share') || lower.includes('present')) {
      return ['Present findings', 'Receive feedback'];
    }

    return tasks.slice(0, 2).map((t) => t.description);
  },

  // Helper: Add minutes to time string
  addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMins = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMins / 60) % 24;
    const newMins = totalMins % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  },

  // ============ EVIDENCE → PORTFOLIO BRIDGE ============

  // Get evidence items that should become portfolio artifacts
  getEvidenceForPortfolio(
    learnerId: string,
    podId: string,
    weekNumber: number
  ): EvidenceItem[] {
    const week = this.getWeekCurriculum(podId, weekNumber);
    const progress = this.getLearnerProgress(learnerId, podId, weekNumber);

    if (!week || !progress) return [];

    return week.evidence.items.filter((item) =>
      progress.evidenceSubmitted.includes(item.id)
    );
  },

  // ============ POD SUMMARY FOR PODS PAGE ============

  // Get curriculum summary for pod card display
  getPodSummary(podId: string): {
    totalWeeks: number;
    subjects: string[];
    hasRubric: boolean;
    evidenceTypes: string[];
  } | null {
    const curriculum = this.getCurriculum(podId);
    if (!curriculum) return null;

    const allSubjects = new Set<string>();
    const allEvidence = new Set<string>();

    curriculum.weeks.forEach((week) => {
      week.subjects.forEach((s) => allSubjects.add(s));
      week.evidence.items.forEach((e) => allEvidence.add(e.label));
    });

    return {
      totalWeeks: curriculum.weeks.length,
      subjects: Array.from(allSubjects),
      hasRubric: true,
      evidenceTypes: Array.from(allEvidence).slice(0, 4),
    };
  },

  // Get learner's overall pod progress
  getLearnerPodProgress(learnerId: string, podId: string): {
    currentWeek: number;
    completedWeeks: number;
    overallPercent: number;
  } {
    const curriculum = this.getCurriculum(podId);
    if (!curriculum) return { currentWeek: 1, completedWeeks: 0, overallPercent: 0 };

    let completedWeeks = 0;
    let totalPercent = 0;

    curriculum.weeks.forEach((week) => {
      const progress = this.getLearnerProgress(learnerId, podId, week.weekNumber);
      if (progress) {
        totalPercent += progress.completionPercent;
        if (progress.completionPercent >= 80) {
          completedWeeks++;
        }
      }
    });

    return {
      currentWeek: completedWeeks + 1,
      completedWeeks,
      overallPercent: Math.round(totalPercent / curriculum.weeks.length),
    };
  },
};

export default curriculumService;
