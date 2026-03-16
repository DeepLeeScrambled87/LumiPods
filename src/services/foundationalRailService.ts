import { ALL_FOUNDATIONAL_RAILS } from '../data/foundationalRails';
import { generateId } from '../lib/id';
import { storage } from '../lib/storage';
import type { SkillLevelId, CanonicalMiniLesson } from '../types/curriculum';
import type {
  FoundationalRailAssignment,
  FoundationalRailModule,
  FoundationalRailToolStage,
  FoundationalRailTrack,
} from '../types/foundationalRails';

const ASSIGNMENTS_KEY = 'foundational-rail-assignments';

interface DailyRailSessionPlan {
  assignment: FoundationalRailAssignment;
  track: FoundationalRailTrack;
  module: FoundationalRailModule;
  lesson: CanonicalMiniLesson;
  toolStage: FoundationalRailToolStage | null;
  sessionOrdinal: number;
  moduleSessionOrdinal: number;
}

const normalizeDate = (date: string): string =>
  date.includes('T') ? date.split('T')[0] : date;

const toDateAtMidnight = (date: string): Date => {
  const normalized = normalizeDate(date);
  return new Date(`${normalized}T00:00:00`);
};

const isWeekday = (date: Date): boolean => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

const countWeekdaysBetween = (startDate: string, endDate: string): number => {
  const start = toDateAtMidnight(startDate);
  const end = toDateAtMidnight(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }

  const cursor = new Date(start);
  let count = 0;
  while (cursor < end) {
    if (isWeekday(cursor)) {
      count += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
};

const getAssignments = (): FoundationalRailAssignment[] =>
  storage.get<FoundationalRailAssignment[]>(ASSIGNMENTS_KEY, []);

const saveAssignments = (assignments: FoundationalRailAssignment[]): void => {
  storage.set(ASSIGNMENTS_KEY, assignments);
};

const getTrackById = (trackId: string): FoundationalRailTrack | undefined =>
  ALL_FOUNDATIONAL_RAILS.find((track) => track.id === trackId);

const getTrackForSkillLevel = (
  railId: string,
  skillLevel: SkillLevelId
): FoundationalRailTrack | undefined =>
  ALL_FOUNDATIONAL_RAILS.find(
    (track) => track.railId === railId && track.skillLevel === skillLevel
  );

const getFallbackTrack = (railId: string): FoundationalRailTrack | undefined =>
  ALL_FOUNDATIONAL_RAILS.find((track) => track.railId === railId);

const getModuleForSessionOrdinal = (
  track: FoundationalRailTrack,
  sessionOrdinal: number
): { module: FoundationalRailModule; moduleSessionOrdinal: number } => {
  let remaining = Math.max(sessionOrdinal, 0);

  for (const module of track.modules) {
    const moduleSessions = Math.max(module.estimatedWeeks * track.sessionsPerWeek, 1);
    if (remaining < moduleSessions) {
      return { module, moduleSessionOrdinal: remaining };
    }
    remaining -= moduleSessions;
  }

  const finalModule = track.modules[track.modules.length - 1];
  return {
    module: finalModule,
    moduleSessionOrdinal: Math.max(remaining, 0),
  };
};

const getLessonForOrdinal = (
  module: FoundationalRailModule,
  moduleSessionOrdinal: number
): CanonicalMiniLesson => {
  const lessons = module.miniLessons;
  if (lessons.length === 0) {
    return {
      id: `${module.id}-fallback`,
      title: module.title,
      learningObjective: module.summary,
      explanationSections: [module.summary],
      concreteExample: module.realWorldUseCases[0] || module.summary,
      quickChecks: module.coreSkills.slice(0, 2),
      keyTakeaways: module.coreSkills.slice(0, 3),
      estimatedMinutes: 10,
      tags: module.coreSkills,
    };
  }

  return lessons[moduleSessionOrdinal % lessons.length] || lessons[0];
};

export const foundationalRailService = {
  getAllTracks(): FoundationalRailTrack[] {
    return ALL_FOUNDATIONAL_RAILS;
  },

  getTracksForRail(railId: string): FoundationalRailTrack[] {
    return ALL_FOUNDATIONAL_RAILS.filter((track) => track.railId === railId);
  },

  getTrackById(trackId: string): FoundationalRailTrack | undefined {
    return getTrackById(trackId);
  },

  getModule(trackId: string, moduleId: string): FoundationalRailModule | undefined {
    return getTrackById(trackId)?.modules.find((module) => module.id === moduleId);
  },

  getLesson(
    trackId: string,
    moduleId: string,
    lessonId: string
  ): CanonicalMiniLesson | undefined {
    return this.getModule(trackId, moduleId)?.miniLessons.find((lesson) => lesson.id === lessonId);
  },

  getTrackForSkillLevel(railId: string, skillLevel: SkillLevelId): FoundationalRailTrack | undefined {
    return getTrackForSkillLevel(railId, skillLevel) || getFallbackTrack(railId);
  },

  getAssignment(
    familyId: string,
    learnerId: string,
    railId: string
  ): FoundationalRailAssignment | null {
    return (
      getAssignments().find(
        (assignment) =>
          assignment.familyId === familyId &&
          assignment.learnerId === learnerId &&
          assignment.railId === railId &&
          assignment.isActive
      ) || null
    );
  },

  setAssignment(
    familyId: string,
    learnerId: string,
    railId: string,
    trackId: string,
    skillLevel: SkillLevelId,
    startDate: string = new Date().toISOString()
  ): FoundationalRailAssignment | null {
    const track = getTrackById(trackId);
    if (!track) {
      return null;
    }

    const assignments = getAssignments().filter(
      (assignment) =>
        !(
          assignment.familyId === familyId &&
          assignment.learnerId === learnerId &&
          assignment.railId === railId
        )
    );

    const nextAssignment: FoundationalRailAssignment = {
      id: generateId('rail'),
      familyId,
      learnerId,
      railId,
      trackId: track.id,
      skillLevel,
      startDate: normalizeDate(startDate),
      isActive: true,
    };

    saveAssignments([...assignments, nextAssignment]);
    return nextAssignment;
  },

  clearAssignment(familyId: string, learnerId: string, railId: string): void {
    const assignments = getAssignments().filter(
      (assignment) =>
        !(
          assignment.familyId === familyId &&
          assignment.learnerId === learnerId &&
          assignment.railId === railId
        )
    );
    saveAssignments(assignments);
  },

  ensureAssignment(
    familyId: string,
    learnerId: string,
    railId: string,
    skillLevel: SkillLevelId,
    startDate: string
  ): FoundationalRailAssignment | null {
    const existing = this.getAssignment(familyId, learnerId, railId);
    if (existing) {
      const track = getTrackById(existing.trackId);
      if (track) {
        return existing;
      }
    }

    const track = this.getTrackForSkillLevel(railId, skillLevel);
    if (!track) {
      return null;
    }

    return this.setAssignment(familyId, learnerId, railId, track.id, skillLevel, startDate);
  },

  getDailySessionPlan(
    familyId: string,
    learnerId: string,
    railId: string,
    skillLevel: SkillLevelId,
    date: string
  ): DailyRailSessionPlan | null {
    const assignment = this.ensureAssignment(familyId, learnerId, railId, skillLevel, date);
    if (!assignment) {
      return null;
    }

    const track =
      getTrackById(assignment.trackId) || this.getTrackForSkillLevel(railId, skillLevel);
    if (!track || track.modules.length === 0) {
      return null;
    }

    const sessionOrdinal = countWeekdaysBetween(assignment.startDate, date);
    const { module, moduleSessionOrdinal } = getModuleForSessionOrdinal(track, sessionOrdinal);
    const lesson = getLessonForOrdinal(module, moduleSessionOrdinal);
    const toolStage =
      track.toolStages.find((stage) => stage.skillLevels.includes(skillLevel)) || null;

    return {
      assignment,
      track,
      module,
      lesson,
      toolStage,
      sessionOrdinal,
      moduleSessionOrdinal,
    };
  },
};
