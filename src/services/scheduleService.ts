// Schedule Service - Enhanced Learning Management System
import { storage } from '../lib/storage';
import { generateId } from '../lib/id';
import type {
  DailySchedule,
  ScheduleBlock,
  SchedulePreferences,
  ScheduleMetrics,
  BlockStatus,
  BlockType,
  SessionLink,
} from '../types/schedule';
import { BLOCK_TYPE_CONFIG } from '../types/schedule';
import { curriculumService } from './curriculumService';
import { foundationalRailService } from './foundationalRailService';
import type { SkillLevelId } from '../types/curriculum';
import type { ExternalActivitySession, PlanningRule } from '../types/learning';
import { getPodById } from '../data/pods';
import { podPacingService } from './podPacingService';
import {
  buildExternalSessionBlockId,
  externalActivitySessionDataService,
  getExternalSessionBlockStatus,
  planningRuleDataService,
} from './learningRecordsService';
import type {
  CanonicalMiniLesson,
  DailyActivity,
  PodCurriculum,
  PodReference,
  QuizQuestion,
  SupportingAsset,
} from '../types/curriculum';

const SCHEDULES_KEY = 'daily-schedules';
const PREFERENCES_KEY = 'learner-preferences';
const METRICS_KEY = 'schedule-metrics';

const CONTENT_MATCH_STOP_WORDS = new Set([
  'about',
  'across',
  'after',
  'before',
  'build',
  'capture',
  'close',
  'compare',
  'daily',
  'deeper',
  'during',
  'evidence',
  'explain',
  'focus',
  'foundation',
  'from',
  'into',
  'learn',
  'learning',
  'notes',
  'observe',
  'overview',
  'path',
  'practice',
  'program',
  'project',
  'reflection',
  'session',
  'skill',
  'start',
  'step',
  'steps',
  'studio',
  'summary',
  'support',
  'today',
  'tool',
  'tools',
  'using',
  'what',
  'with',
  'word',
  'work',
]);

const SCHEDULE_DAY_NAMES: DailyActivity['day'][] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

// Default learner preferences
const DEFAULT_PREFERENCES: Omit<SchedulePreferences, 'learnerId'> = {
  optimalStartTime: '09:00',
  optimalEndTime: '15:00',
  peakFocusHours: ['09:00', '10:00', '11:00'],
  breakFrequency: 45,
  breakDuration: 15,
  maxBlockDuration: 60,
  preferredBlockTypes: ['learning', 'creative', 'practice'],
  energyPattern: {
    morning: 'high',
    afternoon: 'medium',
    evening: 'low',
  },
};

const DAILY_MATH_CONFIG: Record<
  SkillLevelId,
  {
    duration: number;
    title: string;
    description: string;
    objectives: string[];
    materials: string[];
    expectedWork: string;
  }
> = {
  foundation: {
    duration: 25,
    title: 'Daily Maths Discovery',
    description:
      'Use games, manipulatives, patterns, and visual models to build core number confidence every day.',
    objectives: [
      'Strengthen number sense through hands-on play',
      'Spot patterns, shapes, and simple relationships',
      'Explain one maths idea out loud',
    ],
    materials: ['Counters or blocks', 'Mini whiteboard', 'Math game cards'],
    expectedWork: 'A quick model, game score, or simple explain-it-back demonstration',
  },
  intermediate: {
    duration: 30,
    title: 'Daily Maths Foundation Lab',
    description:
      'Blend visual models, problem solving, and mini investigations so maths is used, tested, and explained.',
    objectives: [
      'Apply measurement, fractions, or patterns to a real scenario',
      'Use visuals or manipulatives to make the maths visible',
      'Show and explain the strategy used',
    ],
    materials: ['Notebook', 'Manipulatives', 'Graph paper or whiteboard'],
    expectedWork: 'A worked example, visual model, or short maths explanation',
  },
  advanced: {
    duration: 35,
    title: 'Daily Maths Strategy Lab',
    description:
      'Build algebraic and data-thinking fluency through modelling, pattern finding, and creative problem solving.',
    objectives: [
      'Connect a maths idea to data, design, or science',
      'Test a strategy and compare it with another method',
      'Present reasoning clearly, not just answers',
    ],
    materials: ['Notebook', 'Graph paper', 'Calculator or spreadsheet'],
    expectedWork: 'A strategy comparison, graph, or applied maths mini-task',
  },
  pro: {
    duration: 40,
    title: 'Daily Maths Modelling Studio',
    description:
      'Use maths as a tool for modelling, prediction, and explanation through deeper real-world applications.',
    objectives: [
      'Model a pattern, system, or data set mathematically',
      'Choose and justify an efficient solving strategy',
      'Communicate conclusions with evidence',
    ],
    materials: ['Notebook', 'Spreadsheet or coding notebook', 'Graphing tools'],
    expectedWork: 'A model, chart, notebook cell, or concise mathematical brief',
  },
};

const ROTATING_SUBJECT_CONFIG: Record<
  number,
  {
    title: string;
    type: 'learning' | 'creative' | 'project' | 'reflection';
    durationBySkillLevel: Record<SkillLevelId, number>;
    materials: string[];
    descriptions: Record<SkillLevelId, string>;
    outcomes: Record<SkillLevelId, string>;
  }
> = {
  1: {
    title: 'Art & Design Studio',
    type: 'creative',
    durationBySkillLevel: {
      foundation: 25,
      intermediate: 30,
      advanced: 35,
      pro: 40,
    },
    materials: ['Sketchbook', 'Art supplies', 'Inspiration images'],
    descriptions: {
      foundation: 'Turn today’s idea into color, shape, movement, or a simple make-and-tell artwork.',
      intermediate: 'Use drawing, collage, or design to show what the pod idea looks like and why it matters.',
      advanced: 'Translate the pod into a visual model, poster, or concept sketch that explains thinking clearly.',
      pro: 'Create a polished visual communication piece that teaches, persuades, or models the core idea.',
    },
    outcomes: {
      foundation: 'A drawing, collage, or visual retell',
      intermediate: 'A labeled sketch, poster, or design note',
      advanced: 'A concept board, diagram, or annotated visual model',
      pro: 'A presentation-ready design artifact or visual brief',
    },
  },
  2: {
    title: 'Home Economics & Life Skills Studio',
    type: 'project',
    durationBySkillLevel: {
      foundation: 30,
      intermediate: 35,
      advanced: 40,
      pro: 45,
    },
    materials: ['Kitchen or making tools', 'Recipe or sewing materials', 'Checklist'],
    descriptions: {
      foundation: 'Practice useful everyday skills like measuring, sorting, preparing, or caring for materials safely.',
      intermediate: 'Use cooking, making, budgeting, or sewing tasks to apply maths and planning in real life.',
      advanced: 'Design and document a practical task with accurate measurement, sequencing, and reflection.',
      pro: 'Plan, execute, and evaluate a real-life project using efficiency, budgeting, and iteration.',
    },
    outcomes: {
      foundation: 'A completed helper task, photo, or oral reflection',
      intermediate: 'A recipe result, checklist, or practical skill note',
      advanced: 'A documented make, improvement list, or measured result',
      pro: 'A project log, costed plan, or evaluated prototype',
    },
  },
  3: {
    title: 'History & Social Studies Studio',
    type: 'learning',
    durationBySkillLevel: {
      foundation: 25,
      intermediate: 30,
      advanced: 35,
      pro: 35,
    },
    materials: ['Timeline cards', 'Notebook', 'Reference images'],
    descriptions: {
      foundation: 'Tell simple then-and-now stories and notice how people, tools, and communities change over time.',
      intermediate: 'Build timelines and connect discoveries, cultures, or events to today’s pod ideas.',
      advanced: 'Trace cause, consequence, and turning points in scientific, cultural, or civic history.',
      pro: 'Evaluate historical decisions, social systems, evidence, and long-term impact across fields.',
    },
    outcomes: {
      foundation: 'A timeline strip, sketch, or oral retell',
      intermediate: 'A timeline with short notes or a discovery comparison',
      advanced: 'A cause-and-effect chain or annotated social-history timeline',
      pro: 'A historical analysis, source note, or reflective argument',
    },
  },
  4: {
    title: 'Geography & Map Lab',
    type: 'learning',
    durationBySkillLevel: {
      foundation: 25,
      intermediate: 30,
      advanced: 35,
      pro: 40,
    },
    materials: ['Atlas or maps', 'Notebook', 'Pins or sticky notes'],
    descriptions: {
      foundation: 'Explore places, land, weather, and movement using maps and real-world examples.',
      intermediate: 'Use maps, routes, and environments to connect place-based thinking to the pod topic.',
      advanced: 'Analyze how geography, resources, and movement influence people, science, and systems.',
      pro: 'Investigate how geography shapes strategy, trade, access, and decision making.',
    },
    outcomes: {
      foundation: 'A labeled map, route, or place match activity',
      intermediate: 'A map note, comparison, or “why here?” explanation',
      advanced: 'A geographic analysis or cause-and-effect sketch',
      pro: 'A spatial argument, annotated map, or strategic explanation',
    },
  },
  5: {
    title: 'Computer Science & Systems Lab',
    type: 'learning',
    durationBySkillLevel: {
      foundation: 30,
      intermediate: 35,
      advanced: 40,
      pro: 45,
    },
    materials: ['Computer or tablet', 'Notebook', 'Coding or logic tools'],
    descriptions: {
      foundation: 'Practice logic, sequencing, and playful problem solving with age-appropriate digital or unplugged tasks.',
      intermediate: 'Use coding, debugging, or digital making to model an idea from the pod and explain how it works.',
      advanced: 'Apply computer science thinking to simulation, data, automation, or structured design challenges.',
      pro: 'Prototype, test, and refine a technical solution that connects the pod to real-world systems or tools.',
    },
    outcomes: {
      foundation: 'A logic puzzle, unplugged algorithm, or simple creation',
      intermediate: 'A short coded task, debugging note, or system explanation',
      advanced: 'A simulation, script, flowchart, or technical notebook entry',
      pro: 'A working prototype, technical demo, or design rationale',
    },
  },
  0: {
    title: 'Open Studio & Showcase',
    type: 'reflection',
    durationBySkillLevel: {
      foundation: 20,
      intermediate: 25,
      advanced: 30,
      pro: 30,
    },
    materials: ['Notebook', 'Prompt cards', 'Presentation materials'],
    descriptions: {
      foundation: 'Share what you noticed this week through story, pictures, and simple explanations.',
      intermediate: 'Present what you learned and connect it to real-world places, people, or problems.',
      advanced: 'Synthesize ideas from the week and explain patterns, tradeoffs, and next-step questions.',
      pro: 'Teach back the week’s ideas through a concise presentation, critique, or strategic proposal.',
    },
    outcomes: {
      foundation: 'A short story, drawing, or spoken recap',
      intermediate: 'A mini presentation, note page, or reflection card',
      advanced: 'A synthesis note, presentation, or challenge question set',
      pro: 'A polished presentation, strategic summary, or critique',
    },
  },
};

export const scheduleService = {
  // ============ Daily Schedule Management ============
  
  getDailySchedule(learnerId: string, date: string): DailySchedule | null {
    const key = `${SCHEDULES_KEY}-${learnerId}-${date}`;
    return storage.get<DailySchedule | null>(key, null);
  },

  ensureDailySchedule(
    learnerId: string,
    date: string,
    familyId: string,
    podId?: string,
    weekNumber?: number,
    skillLevel?: SkillLevelId
  ): DailySchedule {
    const planningContext = this.getSchedulePlanningContext(learnerId, familyId, date, podId, weekNumber);
    const existing = this.getDailySchedule(learnerId, date);

    if (existing) {
      const shouldRefreshForPod = Boolean(planningContext.podId) && this.shouldRefreshScheduleForPod(
        existing,
        planningContext.podId!
      );

      if (!shouldRefreshForPod) {
        return this.applyLiveOverlays(existing, skillLevel);
      }
    }

    return this.generateDailySchedule(
      learnerId,
      date,
      familyId,
      planningContext.podId,
      planningContext.weekNumber,
      skillLevel
    );
  },

  saveDailySchedule(schedule: DailySchedule): DailySchedule {
    const updated = { ...schedule, updatedAt: new Date().toISOString() };
    const key = `${SCHEDULES_KEY}-${schedule.learnerId}-${schedule.date}`;
    storage.set(key, updated);
    return updated;
  },

  regenerateDailySchedule(
    learnerId: string,
    date: string,
    familyId: string,
    podId?: string,
    weekNumber?: number,
    skillLevel?: SkillLevelId
  ): DailySchedule {
    return this.generateDailySchedule(learnerId, date, familyId, podId, weekNumber, skillLevel);
  },

  getSchedulePlanningContext(
    learnerId: string,
    familyId: string,
    date: string,
    podId?: string,
    weekNumber?: number
  ): { podId?: string; weekNumber?: number; minutesPerSession?: number; scheduleMode?: string } {
    const learnerRule = planningRuleDataService.getCachedActiveForLearner(familyId, learnerId, date);
    const hasFamilyRules = planningRuleDataService.getCachedActiveForFamily(familyId, date).length > 0;
    const activePod = familyId ? curriculumService.getActivePod(familyId) : null;
    const resolvedPodId = learnerRule?.primaryPodId || (hasFamilyRules ? undefined : (podId || activePod?.podId));

    if (!resolvedPodId) {
      return {};
    }

    const rulePlannedWeeks =
      learnerRule?.periodStart && learnerRule?.periodEnd
        ? Math.max(
            1,
            Math.ceil(
              (new Date(`${learnerRule.periodEnd}T00:00:00`).getTime() -
                new Date(`${learnerRule.periodStart}T00:00:00`).getTime() +
                86400000) /
                (86400000 * 7)
            )
          )
        : undefined;

    const planningStartDate =
      learnerRule?.primaryPodId === resolvedPodId
        ? learnerRule.periodStart
        : activePod?.podId === resolvedPodId
          ? activePod.startDate
          : undefined;

    let resolvedWeekNumber =
      planningStartDate
        ? this.getWeekNumberForDate(planningStartDate, date)
        : weekNumber;

    const curriculum = curriculumService.getCurriculum(resolvedPodId);
    if (curriculum && resolvedWeekNumber) {
      const curriculumWeek =
        planningStartDate
          ? podPacingService.mapPlannedWeekToCurriculumWeek(
              resolvedWeekNumber,
              activePod?.podId === resolvedPodId
                ? activePod.plannedWeeks || curriculum.weeks.length
                : rulePlannedWeeks || curriculum.weeks.length,
              curriculum.weeks.length
            )
          : resolvedWeekNumber;

      resolvedWeekNumber = Math.min(Math.max(curriculumWeek, 1), curriculum.weeks.length);
    }

    return {
      podId: resolvedPodId,
      weekNumber: resolvedWeekNumber,
      minutesPerSession:
        activePod?.podId === resolvedPodId ? activePod.minutesPerSession : undefined,
      scheduleMode:
        activePod?.podId === resolvedPodId ? activePod.scheduleMode : undefined,
    };
  },

  getWeekNumberForDate(startDate: string, targetDate: string): number {
    const start = new Date(startDate);
    const target = new Date(`${targetDate}T00:00:00`);
    start.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.max(0, Math.floor((target.getTime() - start.getTime()) / 86400000));
    return Math.floor(diffDays / 7) + 1;
  },

  isScheduleUntouched(schedule: DailySchedule): boolean {
    return schedule.blocks.every((block) =>
      (block.status === 'scheduled' || block.status === 'ready') &&
      !block.notes &&
      !block.completedAt &&
      !(block.artifacts && block.artifacts.length > 0)
    );
  },

  shouldRefreshScheduleForPod(schedule: DailySchedule, podId: string): boolean {
    const existingPodIds = new Set(
      schedule.blocks.map((block) => block.podId).filter((value): value is string => Boolean(value))
    );

    if (existingPodIds.has(podId)) {
      return false;
    }

    const hasMeaningfulProgress = schedule.blocks.some(
      (block) =>
        block.status === 'completed' ||
        block.status === 'in-progress' ||
        block.status === 'paused' ||
        Boolean(block.completedAt) ||
        Boolean(block.notes) ||
        Boolean(block.artifacts && block.artifacts.length > 0)
    );

    return !hasMeaningfulProgress;
  },

  getAllSchedulesForDate(date: string, learnerIds: string[]): DailySchedule[] {
    return learnerIds
      .map(id => this.getDailySchedule(id, date))
      .filter((s): s is DailySchedule => s !== null);
  },

  planSchedulesForRange(
    learnerId: string,
    familyId: string,
    startDate: string,
    endDate: string,
    options: {
      podId?: string;
      weekNumber?: number;
      skillLevel?: SkillLevelId;
      overwriteUntouched?: boolean;
    } = {}
  ): DailySchedule[] {
    const schedules: DailySchedule[] = [];
    const cursor = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    while (cursor <= end) {
      const day = cursor.getDay();
      if (day !== 0 && day !== 6) {
        const dateStr = cursor.toISOString().split('T')[0];
        const existing = this.getDailySchedule(learnerId, dateStr);
        const shouldOverwrite =
          options.overwriteUntouched &&
          existing &&
          this.isScheduleUntouched(existing);

        schedules.push(
          shouldOverwrite
            ? this.generateDailySchedule(
                learnerId,
                dateStr,
                familyId,
                options.podId,
                options.weekNumber,
                options.skillLevel
              )
            : this.ensureDailySchedule(
                learnerId,
                dateStr,
                familyId,
                options.podId,
                options.weekNumber,
                options.skillLevel
              )
        );
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return schedules;
  },

  // ============ Block Management ============
  
  updateBlockStatus(
    learnerId: string,
    date: string,
    blockId: string,
    status: BlockStatus,
    notes?: string
  ): ScheduleBlock | null {
    const schedule = this.getDailySchedule(learnerId, date);
    if (!schedule) return null;
    
    const blockIndex = schedule.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return null;
    
    const block = schedule.blocks[blockIndex];
    const updatedBlock: ScheduleBlock = {
      ...block,
      status,
      notes: notes || block.notes,
      completedAt: status === 'completed' ? new Date().toISOString() : block.completedAt,
    };
    
    schedule.blocks[blockIndex] = updatedBlock;
    schedule.completedBlocks = schedule.blocks.filter(b => b.status === 'completed').length;
    
    this.saveDailySchedule(schedule);
    return updatedBlock;
  },

  getBlockRemainingSeconds(block: ScheduleBlock, at: Date = new Date()): number {
    const totalSeconds = block.timerInitialSeconds ?? block.duration * 60;
    const baseRemainingSeconds = block.timerRemainingSeconds ?? totalSeconds;

    if (block.status !== 'in-progress' || !block.timerStartedAt) {
      return Math.max(0, Math.min(baseRemainingSeconds, totalSeconds));
    }

    const elapsedSeconds = Math.max(
      0,
      Math.floor((at.getTime() - new Date(block.timerStartedAt).getTime()) / 1000)
    );

    return Math.max(0, baseRemainingSeconds - elapsedSeconds);
  },

  startBlock(learnerId: string, date: string, blockId: string): ScheduleBlock | null {
    const schedule = this.getDailySchedule(learnerId, date);
    if (!schedule) return null;

    const blockIndex = schedule.blocks.findIndex((block) => block.id === blockId);
    if (blockIndex === -1) return null;

    const block = schedule.blocks[blockIndex];
    const totalSeconds = block.timerInitialSeconds ?? block.duration * 60;
    const storedRemainingSeconds = block.timerRemainingSeconds ?? totalSeconds;
    const remainingSeconds = storedRemainingSeconds > 0 ? storedRemainingSeconds : totalSeconds;
    const updatedBlock: ScheduleBlock = {
      ...block,
      status: 'in-progress',
      timerInitialSeconds: totalSeconds,
      timerRemainingSeconds: remainingSeconds,
      timerStartedAt: new Date().toISOString(),
    };

    schedule.blocks[blockIndex] = updatedBlock;
    this.saveDailySchedule(schedule);
    return updatedBlock;
  },

  pauseBlock(learnerId: string, date: string, blockId: string): ScheduleBlock | null {
    const schedule = this.getDailySchedule(learnerId, date);
    if (!schedule) return null;

    const blockIndex = schedule.blocks.findIndex((block) => block.id === blockId);
    if (blockIndex === -1) return null;

    const block = schedule.blocks[blockIndex];
    const updatedBlock: ScheduleBlock = {
      ...block,
      status: 'paused',
      timerInitialSeconds: block.timerInitialSeconds ?? block.duration * 60,
      timerRemainingSeconds: this.getBlockRemainingSeconds(block),
      timerStartedAt: undefined,
    };

    schedule.blocks[blockIndex] = updatedBlock;
    this.saveDailySchedule(schedule);
    return updatedBlock;
  },

  resumeBlock(learnerId: string, date: string, blockId: string): ScheduleBlock | null {
    const schedule = this.getDailySchedule(learnerId, date);
    if (!schedule) return null;

    const blockIndex = schedule.blocks.findIndex((block) => block.id === blockId);
    if (blockIndex === -1) return null;

    const storedRemainingSeconds =
      schedule.blocks[blockIndex].timerRemainingSeconds ??
      schedule.blocks[blockIndex].timerInitialSeconds ??
      schedule.blocks[blockIndex].duration * 60;

    const updatedBlock: ScheduleBlock = {
      ...schedule.blocks[blockIndex],
      status: 'in-progress',
      suggestedTime: undefined,
      timerInitialSeconds: schedule.blocks[blockIndex].timerInitialSeconds ?? schedule.blocks[blockIndex].duration * 60,
      timerRemainingSeconds:
        storedRemainingSeconds > 0
          ? storedRemainingSeconds
          : schedule.blocks[blockIndex].timerInitialSeconds ?? schedule.blocks[blockIndex].duration * 60,
      timerStartedAt: new Date().toISOString(),
    };

    schedule.blocks[blockIndex] = updatedBlock;
    this.saveDailySchedule(schedule);
    return updatedBlock;
  },

  completeBlock(
    learnerId: string,
    date: string,
    blockId: string,
    actualDuration?: number,
    notes?: string
  ): ScheduleBlock | null {
    const schedule = this.getDailySchedule(learnerId, date);
    if (!schedule) return null;
    
    const blockIndex = schedule.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return null;
    
    const block = schedule.blocks[blockIndex];
    const totalSeconds = block.timerInitialSeconds ?? block.duration * 60;
    const remainingSeconds = this.getBlockRemainingSeconds(block);
    const derivedDuration = Math.max(
      1,
      Math.round((totalSeconds - remainingSeconds) / 60)
    );
    const updatedBlock: ScheduleBlock = {
      ...block,
      status: 'completed',
      completedAt: new Date().toISOString(),
      actualDuration: actualDuration || (block.timerStartedAt || block.timerRemainingSeconds !== undefined ? derivedDuration : block.duration),
      timerInitialSeconds: totalSeconds,
      timerRemainingSeconds: 0,
      timerStartedAt: undefined,
      notes: notes || block.notes,
    };
    
    schedule.blocks[blockIndex] = updatedBlock;
    schedule.completedBlocks = schedule.blocks.filter(b => b.status === 'completed').length;
    
    this.saveDailySchedule(schedule);
    this.updateMetrics(learnerId, date, schedule);
    
    return updatedBlock;
  },

  skipBlock(learnerId: string, date: string, blockId: string, reason?: string): ScheduleBlock | null {
    return this.updateBlockStatus(learnerId, date, blockId, 'skipped', reason);
  },

  rescheduleBlock(
    learnerId: string,
    date: string,
    blockId: string,
    suggestedTime: string,
    notes?: string
  ): ScheduleBlock | null {
    const schedule = this.getDailySchedule(learnerId, date);
    if (!schedule) return null;

    const blockIndex = schedule.blocks.findIndex((block) => block.id === blockId);
    if (blockIndex === -1) return null;

    const updatedBlock: ScheduleBlock = {
      ...schedule.blocks[blockIndex],
      status: 'rescheduled',
      suggestedTime,
      timerInitialSeconds: schedule.blocks[blockIndex].timerInitialSeconds ?? schedule.blocks[blockIndex].duration * 60,
      timerRemainingSeconds: this.getBlockRemainingSeconds(schedule.blocks[blockIndex]),
      timerStartedAt: undefined,
      notes: notes || schedule.blocks[blockIndex].notes,
    };

    schedule.blocks[blockIndex] = updatedBlock;
    this.saveDailySchedule(schedule);
    return updatedBlock;
  },

  addNoteToBlock(learnerId: string, date: string, blockId: string, note: string): ScheduleBlock | null {
    const schedule = this.getDailySchedule(learnerId, date);
    if (!schedule) return null;
    
    const blockIndex = schedule.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return null;
    
    const block = schedule.blocks[blockIndex];
    const existingNotes = block.notes ? `${block.notes}\n` : '';
    const updatedBlock: ScheduleBlock = {
      ...block,
      notes: `${existingNotes}[${new Date().toLocaleTimeString()}] ${note}`,
    };
    
    schedule.blocks[blockIndex] = updatedBlock;
    this.saveDailySchedule(schedule);
    
    return updatedBlock;
  },


  // ============ Schedule Generation ============
  
  generateDailySchedule(
    learnerId: string,
    date: string,
    familyId: string,
    podId?: string,
    weekNumber?: number,
    skillLevel?: SkillLevelId
  ): DailySchedule {
    const planningContext = this.getSchedulePlanningContext(learnerId, familyId, date, podId, weekNumber);
    const preferences = this.getLearnerPreferences(learnerId);
    const dayOfWeek = this.getDayOfWeek(date);
    
    // If pod and week specified, generate from curriculum
    let blocks: ScheduleBlock[];
    if (planningContext.podId && planningContext.weekNumber) {
      blocks = this.generateCurriculumBlocks(
        learnerId,
        familyId,
        date,
        planningContext.podId,
        planningContext.weekNumber,
        dayOfWeek,
        skillLevel || 'intermediate',
        preferences.optimalStartTime,
        planningContext.minutesPerSession
      );
    } else {
      blocks = this.generateOptimalBlocks(
        preferences,
        familyId,
        planningContext.podId,
        planningContext.weekNumber,
        skillLevel || 'intermediate',
        dayOfWeek,
        date
      );
    }
    
    const schedule: DailySchedule = {
      id: generateId(),
      date,
      learnerId,
      familyId,
      blocks,
      totalDuration: blocks.reduce((sum, b) => sum + b.duration, 0),
      completedBlocks: 0,
      energyLevel: preferences.energyPattern.morning,
      focusTime: 'morning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.applyLiveOverlays(this.saveDailySchedule(schedule), skillLevel);
  },

  applyLiveOverlays(schedule: DailySchedule, skillLevel: SkillLevelId = 'intermediate'): DailySchedule {
    const withPlanning = this.applyPlanningRuleOverlays(schedule);
    const withExternalSessions = this.applyExternalSessionOverlays(withPlanning);
    const withDailyQuiz = this.applyDailyQuizOverlays(withExternalSessions, skillLevel);
    const withRailBlocks = this.refreshFoundationalRailBlocks(withDailyQuiz, skillLevel);
    const withGuidance = this.recalculateSchedule({
      ...withRailBlocks,
      blocks: withRailBlocks.blocks.map((block) => this.decorateBlockWithGuidance(block, skillLevel)),
    });

    if (JSON.stringify(withGuidance) !== JSON.stringify(schedule)) {
      return this.saveDailySchedule(withGuidance);
    }

    return withGuidance;
  },

  refreshFoundationalRailBlocks(
    schedule: DailySchedule,
    skillLevel: SkillLevelId
  ): DailySchedule {
    const dailyMathTitles = new Set(
      Object.values(DAILY_MATH_CONFIG).map((config) => config.title)
    );

    const blocks = schedule.blocks.map((block) => {
      const isDailyMathBlock = Array.from(dailyMathTitles).some((title) =>
        block.title.startsWith(title)
      );

      if (!isDailyMathBlock) {
        return block;
      }

      const rebuilt = this.buildDailyMathBlock(
        block.startTime,
        skillLevel,
        schedule.learnerId,
        schedule.familyId,
        schedule.date,
        block.podId,
        block.weekNumber
      );

      return {
        ...rebuilt,
        id: block.id,
        endTime: block.endTime,
        duration: block.duration,
        status: block.status,
        priority: block.priority,
        completedAt: block.completedAt,
        actualDuration: block.actualDuration,
        notes: block.notes,
        artifacts: block.artifacts,
        suggestedTime: block.suggestedTime,
        dependencies: block.dependencies,
      } satisfies ScheduleBlock;
    });

    return {
      ...schedule,
      blocks,
    };
  },

  applyDailyQuizOverlays(schedule: DailySchedule, skillLevel: SkillLevelId): DailySchedule {
    if (schedule.completedBlocks > 0) {
      return schedule;
    }

    const primaryPodId = schedule.blocks.find((block) => block.podId)?.podId;
    const weekNumber = schedule.blocks.find((block) => block.weekNumber)?.weekNumber;

    if (!primaryPodId || !weekNumber) {
      return schedule;
    }

    const dayOfWeek = this.getDayOfWeek(schedule.date);
    const quizQuestions = this.getQuizQuestionsForDay(primaryPodId, weekNumber, dayOfWeek, skillLevel);
    if (quizQuestions.length === 0) {
      return schedule;
    }

    const hasQuizBlock = schedule.blocks.some((block) =>
      block.quizQuestions?.some((question) => quizQuestions.some((candidate) => candidate.id === question.id))
    );
    if (hasQuizBlock) {
      return schedule;
    }

    const insertionIndex = schedule.blocks.findIndex((block) => block.type === 'french');
    if (insertionIndex <= 0) {
      return schedule;
    }

    const quizBlock = this.buildQuizBlock(
      schedule.blocks[insertionIndex].startTime,
      primaryPodId,
      weekNumber,
      skillLevel,
      dayOfWeek,
      quizQuestions
    );

    if (!quizBlock) {
      return schedule;
    }

    const blocks = [...schedule.blocks];
    blocks.splice(insertionIndex, 0, quizBlock);

    return {
      ...schedule,
      blocks: this.reflowBlockTimes(blocks),
    };
  },

  applyPlanningRuleOverlays(schedule: DailySchedule): DailySchedule {
    const rule = planningRuleDataService.getCachedActiveForLearner(
      schedule.familyId,
      schedule.learnerId,
      schedule.date
    );

    if (!rule || (rule.supportPodIds.length === 0 && (rule.supportPodPlans || []).length === 0)) {
      return schedule;
    }

    const supportPodId = this.pickSupportPodForDate(rule, schedule.date);
    const supportPod = supportPodId ? getPodById(supportPodId) : null;

    if (!supportPod) {
      return schedule;
    }

    const primaryPodId = rule.primaryPodId || schedule.blocks.find((block) => block.podId)?.podId;
    const primaryPod = primaryPodId ? getPodById(primaryPodId) : null;

    const blocks = schedule.blocks.map((block) => {
      if (block.type === 'project' || block.title.includes('Project') || block.title.includes('Coding')) {
        return {
          ...block,
          source: block.source === 'external' ? block.source : 'project',
          relatedPodIds: Array.from(
            new Set([...(block.relatedPodIds || []), supportPod.id, ...(primaryPodId ? [primaryPodId] : [])])
          ),
          title:
            block.type === 'project'
              ? `Project Lab: ${supportPod.title}`
              : `${block.title} x ${supportPod.title}`,
          description: `${block.description || 'Build with a real-world application.'} Connect it to ${supportPod.title} in an age-aligned, hands-on way.`,
          objectives: Array.from(
            new Set([
              ...block.objectives,
              `Connect today’s ideas to ${supportPod.title}`,
              rule.challengeLevel === 'stretch'
                ? 'Add one stretch idea or tougher version to test your thinking'
                : 'Explain the connection in your own words',
            ])
          ),
          expectedWork:
            block.expectedWork ||
            `A build, prototype, or explanation that links ${primaryPod?.title || 'today’s pod'} to ${supportPod.title}`,
        } satisfies ScheduleBlock;
      }

      if (block.type === 'reflection') {
        return {
          ...block,
          relatedPodIds: Array.from(
            new Set([...(block.relatedPodIds || []), supportPod.id, ...(primaryPodId ? [primaryPodId] : [])])
          ),
          reflectionPrompt: `How did ${supportPod.title} connect to ${primaryPod?.title || 'today’s main idea'}?`,
          objectives: Array.from(
            new Set([
              ...block.objectives,
              `Describe a link between ${supportPod.title} and the main pod`,
              rule.challengeLevel === 'stretch'
                ? 'Suggest one harder next-step experiment or project idea'
                : 'Name one thing you would try next',
            ])
          ),
          expectedWork:
            block.expectedWork ||
            `A reflection that explains how ${supportPod.title} connects to today’s work`,
        } satisfies ScheduleBlock;
      }

      if (block.type === 'french' && !rule.includeFrench) {
        return {
          ...block,
          title: 'Word Lab',
          description: `Use vocabulary and sentence building to describe ${supportPod.title} in English or French.`,
        } satisfies ScheduleBlock;
      }

      if (block.type === 'practice' && !rule.includeWriting) {
        return {
          ...block,
          title: 'Thinking Lab',
          description: `Capture ideas through diagrams, oral explanations, or quick notes linked to ${supportPod.title}.`,
        } satisfies ScheduleBlock;
      }

      return block;
    });

    return this.recalculateSchedule({ ...schedule, blocks });
  },

  applyExternalSessionOverlays(schedule: DailySchedule): DailySchedule {
    const sessions = externalActivitySessionDataService.getCachedForDate(schedule.learnerId, schedule.date);

    if (sessions.length === 0) {
      return schedule;
    }

    let nextSchedule = { ...schedule, blocks: [...schedule.blocks] };
    sessions.forEach((session) => {
      nextSchedule = this.upsertExternalSessionBlock(nextSchedule, session);
    });

    return this.recalculateSchedule(nextSchedule);
  },

  upsertExternalSessionBlock(schedule: DailySchedule, session: ExternalActivitySession): DailySchedule {
    const blockId = session.blockId || buildExternalSessionBlockId(session.id);
    const externalBlock: ScheduleBlock = this.decorateBlockWithGuidance({
      id: blockId,
      title: session.title,
      description:
        session.description ||
        `Work in ${session.platformName}, then bring the learning back here with notes or evidence.`,
      startTime: session.scheduledStartTime || this.suggestOptimalTime(schedule.learnerId, 'external'),
      endTime: this.addMinutes(
        session.scheduledStartTime || this.suggestOptimalTime(schedule.learnerId, 'external'),
        session.durationMinutes
      ),
      duration: session.durationMinutes,
      type: 'external',
      status: getExternalSessionBlockStatus(session.status),
      priority: 'medium',
      objectives: [
        `Complete the planned ${session.platformName} session`,
        'Capture what you learned, built, or practiced',
      ],
      materials: ['Laptop or tablet', 'Headphones if needed'],
      resources: [
        {
          id: `platform-${session.platformId}`,
          name: session.platformName,
          type: 'device',
          icon: '🌐',
          isRequired: false,
        },
      ],
      expectedWork: 'A note, reflection, quiz answer, or linked evidence from the session',
      reflectionPrompt: `What helped you most in ${session.platformName}, and how will you use it next?`,
      notes: session.notes,
      source: 'external',
      relatedPodIds: [],
      projectId: session.projectId,
      externalSessionId: session.id,
      externalPlatformId: session.platformId,
      externalPlatformName: session.platformName,
      launchUrl: session.url,
      completedAt: session.completedAt,
      actualDuration: session.status === 'completed' ? session.durationMinutes : undefined,
      energyRequired: 'medium',
      focusRequired: 'medium',
      canReschedule: true,
    }, 'intermediate');

    const blocks = schedule.blocks.filter(
      (block) => block.id !== blockId && block.externalSessionId !== session.id
    );
    blocks.push(externalBlock);

    return this.recalculateSchedule({
      ...schedule,
      blocks: this.sortBlocks(blocks),
    });
  },

  // Generate blocks from curriculum data
  generateCurriculumBlocks(
    learnerId: string,
    familyId: string,
    date: string,
    podId: string,
    weekNumber: number,
    dayOfWeek: number,
    skillLevel: SkillLevelId,
    startTime: string,
    targetSessionMinutes?: number
  ): ScheduleBlock[] {
    const week = curriculumService.getWeekCurriculum(podId, weekNumber);

    if (!week) {
      return this.generateOptimalBlocks(
        { ...this.getLearnerPreferences('default'), learnerId: 'default' },
        familyId,
        podId,
        weekNumber,
        skillLevel,
        dayOfWeek,
        date
      );
    }

    // Use curriculum service to generate the core pod blocks, then enrich
    // them with movement, language, writing, project, and reflection time.
    const curriculumBlocks = curriculumService.generateBlocksFromCurriculum(
      podId,
      weekNumber,
      dayOfWeek,
      skillLevel,
      this.addMinutes(startTime, 20)
    );

    if (curriculumBlocks.length > 0) {
      const scaledCurriculumBlocks = this.scaleBlocksToDuration(curriculumBlocks, targetSessionMinutes);
      const blocks: ScheduleBlock[] = [];
      let currentTime = startTime;
      const wordOfTheDay = week.subjects[0] || 'patterns';
      const dailyMathBlock = this.buildDailyMathBlock(
        currentTime,
        skillLevel,
        learnerId,
        familyId,
        date,
        podId,
        weekNumber
      );

      blocks.push(
        this.createBlock({
          title: 'Movement Warm-Up',
          description: 'Wake up the body with stretching, coordination, and movement.',
          type: 'physical',
          startTime: currentTime,
          duration: 20,
          podId,
          weekNumber,
          objectives: ['Get moving before deep work', 'Build body awareness and readiness'],
          materials: ['Open floor space', 'Water bottle'],
          energyRequired: 'medium',
          focusRequired: 'low',
          expectedWork: 'Quick movement routine completed',
        })
      );
      currentTime = blocks[blocks.length - 1].endTime;

      blocks.push(dailyMathBlock);
      currentTime = blocks[blocks.length - 1].endTime;

      scaledCurriculumBlocks.forEach((block) => {
        const retimedBlock: ScheduleBlock = {
          ...block,
          startTime: currentTime,
          endTime: this.addMinutes(currentTime, block.duration),
          podId,
          weekNumber,
        };
        blocks.push(retimedBlock);
        currentTime = retimedBlock.endTime;
      });

      const dailyQuizBlock = this.buildQuizBlock(currentTime, podId, weekNumber, skillLevel, dayOfWeek);
      if (dailyQuizBlock) {
        blocks.push(dailyQuizBlock);
        currentTime = blocks[blocks.length - 1].endTime;
      }

      blocks.push(
        this.createBlock({
          title: 'French & Word Lab',
          description: `Use the word of the day around ${wordOfTheDay} in French and English.`,
          type: 'french',
          startTime: currentTime,
          duration: 25,
          podId,
          weekNumber,
          objectives: [
            'Learn and use new vocabulary in context',
            'Say the word of the day in a sentence',
            'Connect today’s pod idea to language',
          ],
          materials: ['Word journal', 'Flashcards', 'Notebook'],
          energyRequired: 'medium',
          focusRequired: 'medium',
          expectedWork: 'A sentence or short oral explanation using the word of the day',
        })
      );
      currentTime = blocks[blocks.length - 1].endTime;

      blocks.push(this.buildRotatingSubjectBlock(currentTime, dayOfWeek, skillLevel, podId, weekNumber));
      currentTime = blocks[blocks.length - 1].endTime;

      blocks.push(
        this.createBlock({
          title: skillLevel === 'foundation' ? 'Handwriting & Story Time' : 'Writing & Grammar Studio',
          description: 'Capture learning through handwriting, sentence building, grammar, and storytelling.',
          type: 'practice',
          startTime: currentTime,
          duration: 30,
          podId,
          weekNumber,
          objectives: [
            'Explain today’s learning in words',
            'Practice sentence structure and handwriting',
            'Build confidence with vocabulary and storytelling',
          ],
          materials: ['Notebook', 'Pencil', 'Prompt card'],
          energyRequired: 'medium',
          focusRequired: 'medium',
          expectedWork: 'A short written response, story, or grammar practice page',
        })
      );
      currentTime = blocks[blocks.length - 1].endTime;

      blocks.push(
        this.createBlock({
          title: 'Lunch & Reset',
          type: 'break',
          startTime: currentTime,
          duration: 45,
          objectives: ['Eat, rest, and reset energy for the afternoon'],
          materials: [],
          energyRequired: 'low',
          focusRequired: 'low',
        })
      );
      currentTime = blocks[blocks.length - 1].endTime;

      blocks.push(
        this.createBlock({
          title: week.codeRequiredByLevel[skillLevel] ? 'Coding & Build Studio' : 'Project & Side Quest Studio',
          description: week.codeRequiredByLevel[skillLevel]
            ? 'Turn today’s ideas into code, simulations, or structured digital work.'
            : 'Build, create, or extend today’s pod work with a hands-on side quest.',
          type: week.codeRequiredByLevel[skillLevel] ? 'learning' : 'project',
          startTime: currentTime,
          duration: 45,
          podId,
          weekNumber,
          objectives: [
            'Apply today’s concept in a real task',
            'Create something tangible or testable',
            'Stretch problem-solving through open-ended work',
          ],
          materials: week.codeRequiredByLevel[skillLevel]
            ? ['Laptop or tablet', 'NotebookLM / coding tool', 'Notes']
            : week.materials.items.slice(0, 4).map((item) => item.name),
          energyRequired: 'medium',
          focusRequired: 'high',
          expectedWork: week.codeRequiredByLevel[skillLevel]
            ? 'A notebook, script, or simulation draft'
            : 'A prototype, model, or project extension',
        })
      );
      currentTime = blocks[blocks.length - 1].endTime;

      blocks.push(
        this.createBlock({
          title: 'Physical Challenge',
          description: 'Build stamina and earn points through movement or outdoor play.',
          type: 'physical',
          startTime: currentTime,
          duration: 25,
          podId,
          weekNumber,
          objectives: ['Move the body', 'Reset attention', 'Build healthy learning rhythm'],
          materials: ['Sports gear or open space'],
          energyRequired: 'medium',
          focusRequired: 'low',
          expectedWork: 'Movement completed and reflected on',
        })
      );
      currentTime = blocks[blocks.length - 1].endTime;

      blocks.push(
        this.createBlock({
          title: 'Reflection & Evidence Capture',
          description: 'Talk about what was learned, add notes, and capture proof of progress.',
          type: 'reflection',
          startTime: currentTime,
          duration: 20,
          podId,
          weekNumber,
          objectives: [
            'Share what you learned today',
            'Record a reflection, note, or quiz response',
            'Capture a photo, file, or artifact idea',
          ],
          materials: ['Notebook', 'Camera or tablet'],
          energyRequired: 'low',
          focusRequired: 'low',
          expectedWork: 'A reflection note, photo, or evidence plan',
        })
      );

      return blocks.map((block) => this.decorateBlockWithGuidance(block, skillLevel));
    }

    // Fallback to default blocks if no curriculum data
    return this.generateOptimalBlocks(
      { ...this.getLearnerPreferences('default'), learnerId: 'default' },
      familyId,
      podId,
      weekNumber,
      skillLevel,
      dayOfWeek,
      date
    );
  },

  // Get day of week (1-5 for Mon-Fri, 0 for weekend)
  getDayOfWeek(dateStr: string): number {
    const date = new Date(dateStr);
    const day = date.getDay();
    // Convert: Sun=0 -> 0, Mon=1 -> 1, ... Fri=5 -> 5, Sat=6 -> 0
    if (day === 0 || day === 6) return 0; // Weekend
    return day;
  },

  generateOptimalBlocks(
    preferences: SchedulePreferences,
    familyId: string,
    podId?: string,
    weekNumber?: number,
    skillLevel: SkillLevelId = 'intermediate',
    dayOfWeek: number = 1,
    date: string = new Date().toISOString().split('T')[0]
  ): ScheduleBlock[] {
    const blocks: ScheduleBlock[] = [];
    let currentTime = preferences.optimalStartTime;
    
    blocks.push(
      this.buildDailyMathBlock(
        currentTime,
        skillLevel,
        preferences.learnerId,
        familyId,
        date,
        podId,
        weekNumber
      )
    );
    currentTime = blocks[blocks.length - 1].endTime;

    blocks.push(this.createBlock({
      title: 'Reset Break',
      type: 'break',
      startTime: currentTime,
      duration: 15,
      objectives: ['Pause, reset, and get ready for the next block'],
      materials: [],
      energyRequired: 'low',
      focusRequired: 'low',
    }));
    currentTime = blocks[blocks.length - 1].endTime;

    // Morning learning block
    blocks.push(this.createBlock({
      title: podId ? 'Pod Learning Session' : 'Morning Learning',
      type: 'learning',
      startTime: currentTime,
      duration: 45,
      podId,
      weekNumber,
      objectives: ['Complete daily learning objectives', 'Practice new concepts'],
      materials: ['Workbook', 'Tablet'],
      energyRequired: 'high',
      focusRequired: 'high',
    }));
    currentTime = blocks[blocks.length - 1].endTime;
    
    // Break
    blocks.push(this.createBlock({
      title: 'Morning Break',
      type: 'break',
      startTime: currentTime,
      duration: 15,
      objectives: ['Rest and recharge'],
      materials: [],
      energyRequired: 'low',
      focusRequired: 'low',
    }));
    currentTime = blocks[blocks.length - 1].endTime;
    
    // Practice block
    blocks.push(this.createBlock({
      title: 'Skill Practice',
      type: 'practice',
      startTime: currentTime,
      duration: 30,
      podId,
      weekNumber,
      objectives: ['Reinforce learned concepts', 'Complete practice exercises'],
      materials: ['Practice worksheets'],
      energyRequired: 'medium',
      focusRequired: 'medium',
    }));
    currentTime = blocks[blocks.length - 1].endTime;
    
    // French block
    blocks.push(this.createBlock({
      title: 'French Practice',
      type: 'french',
      startTime: currentTime,
      duration: 25,
      objectives: ['Daily French vocabulary', 'Conversation practice'],
      materials: ['French workbook', 'Audio resources'],
      energyRequired: 'medium',
      focusRequired: 'medium',
    }));
    currentTime = blocks[blocks.length - 1].endTime;

    if (podId && weekNumber) {
      const dailyQuizBlock = this.buildQuizBlock(currentTime, podId, weekNumber, skillLevel, dayOfWeek);
      if (dailyQuizBlock) {
        blocks.push(dailyQuizBlock);
        currentTime = blocks[blocks.length - 1].endTime;
      }
    }

    blocks.push(this.buildRotatingSubjectBlock(currentTime, dayOfWeek, skillLevel, podId, weekNumber));
    currentTime = blocks[blocks.length - 1].endTime;
    
    // Lunch break
    blocks.push(this.createBlock({
      title: 'Lunch Break',
      type: 'break',
      startTime: currentTime,
      duration: 60,
      objectives: ['Eat lunch', 'Free time'],
      materials: [],
      energyRequired: 'low',
      focusRequired: 'low',
    }));
    currentTime = blocks[blocks.length - 1].endTime;
    
    // Creative block
    blocks.push(this.createBlock({
      title: 'Creative Time',
      type: 'creative',
      startTime: currentTime,
      duration: 45,
      objectives: ['Express creativity', 'Work on art project'],
      materials: ['Art supplies', 'Craft materials'],
      energyRequired: 'medium',
      focusRequired: 'medium',
    }));
    currentTime = blocks[blocks.length - 1].endTime;
    
    // Physical activity
    blocks.push(this.createBlock({
      title: 'Physical Activity',
      type: 'physical',
      startTime: currentTime,
      duration: 30,
      objectives: ['Get moving', 'Outdoor play or exercise'],
      materials: ['Sports equipment'],
      energyRequired: 'high',
      focusRequired: 'low',
    }));
    currentTime = blocks[blocks.length - 1].endTime;
    
    // Reflection
    blocks.push(this.createBlock({
      title: 'Daily Reflection',
      type: 'reflection',
      startTime: currentTime,
      duration: 15,
      objectives: ['Review what was learned', 'Journal thoughts'],
      materials: ['Journal', 'Pencil'],
      energyRequired: 'low',
      focusRequired: 'low',
    }));
    
    return blocks.map((block) => this.decorateBlockWithGuidance(block, skillLevel));
  },

  buildDailyMathBlock(
    startTime: string,
    skillLevel: SkillLevelId,
    learnerId: string,
    familyId: string,
    date: string,
    podId?: string,
    weekNumber?: number
  ): ScheduleBlock {
    const config = DAILY_MATH_CONFIG[skillLevel];
    const railPlan = foundationalRailService.getDailySessionPlan(
      familyId,
      learnerId,
      'maths',
      skillLevel,
      date
    );
    const lesson = railPlan?.lesson;
    const module = railPlan?.module;
    const toolStage = railPlan?.toolStage;
    const duration = railPlan?.track.sessionLengthMinutes || config.duration;
    const recommendedTools = toolStage?.tools?.slice(0, 4) || [];
    const railQuizQuestions = railPlan
      ? this.getRailQuizQuestionsForSession(
          skillLevel,
          date,
          railPlan.moduleSessionOrdinal,
          module?.quizQuestions || []
        )
      : [];

    return this.createBlock({
      title: lesson?.title ? `${config.title}: ${lesson.title}` : config.title,
      description:
        lesson?.learningObjective ||
        `${config.description} Use the day’s main theme as a context only when it genuinely helps.`,
      type: 'practice',
      startTime,
      duration,
      podId,
      weekNumber,
      railId: 'maths',
      railTrackId: railPlan?.track.id,
      railModuleId: module?.id,
      railLessonId: lesson?.id,
      objectives: Array.from(
        new Set([
          ...(lesson?.learningObjective ? [lesson.learningObjective] : []),
          ...config.objectives,
          ...(module?.realWorldUseCases.slice(0, 1) || []).map(
            (useCase) => `Use maths for: ${useCase}`
          ),
        ])
      ).slice(0, 3),
      materials: Array.from(
        new Set([...(config.materials || []), ...((toolStage?.tools || []).slice(0, 2) || [])])
      ).slice(0, 5),
      energyRequired: 'high',
      focusRequired: 'high',
      expectedWork:
        lesson?.concreteExample
          ? `Model or explain: ${lesson.concreteExample}`
          : config.expectedWork,
      sessionGuide: Array.from(
        new Set([
          ...(lesson?.learningObjective ? [`Aim for: ${lesson.learningObjective}`] : []),
          ...(lesson?.explanationSections?.[0] ? [lesson.explanationSections[0]] : []),
          ...(lesson?.concreteExample ? [`Try it with: ${lesson.concreteExample}`] : []),
          ...(toolStage?.tools?.length
            ? [`Use: ${toolStage.tools.slice(0, 2).join(' and ')}.`]
            : []),
          'Close by explaining the pattern or strategy in your own words.',
        ])
      ).slice(0, 4),
      recommendedTools,
      sourceLinks: this.getMathRailSourceLinks(skillLevel, recommendedTools),
      quizQuestions: railQuizQuestions,
      source: 'custom',
      relatedPodIds: podId ? [podId] : undefined,
    });
  },

  buildRotatingSubjectBlock(
    startTime: string,
    dayOfWeek: number,
    skillLevel: SkillLevelId,
    podId?: string,
    weekNumber?: number
  ): ScheduleBlock {
    const theme = ROTATING_SUBJECT_CONFIG[dayOfWeek] || ROTATING_SUBJECT_CONFIG[0];
    const podTitle = podId ? getPodById(podId)?.title : null;

    return this.createBlock({
      title: theme.title,
      description: podTitle
        ? `${theme.descriptions[skillLevel]} Tie it back to this week’s main theme in a tangible way.`
        : theme.descriptions[skillLevel],
      type: theme.type,
      startTime,
      duration: theme.durationBySkillLevel[skillLevel],
      podId,
      weekNumber,
      objectives: [
        theme.descriptions[skillLevel],
        'Use today’s learning in a real-world context',
        'Capture something worth sharing back in the portfolio',
      ],
      materials: [...theme.materials],
      energyRequired: theme.type === 'reflection' ? 'low' : 'medium',
      focusRequired: theme.type === 'project' ? 'medium' : theme.type === 'reflection' ? 'low' : 'medium',
      expectedWork: theme.outcomes[skillLevel],
    });
  },

  getScheduleDayName(dayOfWeek: number): DailyActivity['day'] {
    return SCHEDULE_DAY_NAMES[Math.min(Math.max(dayOfWeek - 1, 0), SCHEDULE_DAY_NAMES.length - 1)] || 'Monday';
  },

  getQuizQuestionsForDay(
    podId: string,
    weekNumber: number,
    dayOfWeek: number,
    skillLevel: SkillLevelId
  ): QuizQuestion[] {
    const week = curriculumService.getWeekCurriculum(podId, weekNumber);
    if (!week?.quizQuestions?.length || dayOfWeek === 0) {
      return [];
    }

    const dayName = this.getScheduleDayName(dayOfWeek);
    return week.quizQuestions
      .filter(
        (question) =>
          question.type === 'multiple-choice' &&
          question.skillLevels.includes(skillLevel) &&
          question.day === dayName
      )
      .slice(0, 2);
  },

  getRailQuizQuestionsForSession(
    skillLevel: SkillLevelId,
    date: string,
    moduleSessionOrdinal: number,
    railQuizQuestions: QuizQuestion[]
  ): QuizQuestion[] {
    const pool = railQuizQuestions.filter(
      (question) =>
        question.type === 'multiple-choice' && question.skillLevels.includes(skillLevel)
    );

    if (pool.length === 0) {
      return [];
    }

    const dayOfWeek = new Date(`${date}T00:00:00`).getDay();
    const weekdayName =
      dayOfWeek >= 1 && dayOfWeek <= 5 ? this.getScheduleDayName(dayOfWeek) : undefined;
    const dayMatched = weekdayName
      ? pool.filter((question) => question.day === weekdayName)
      : [];

    if (dayMatched.length > 0) {
      return dayMatched.slice(0, 2);
    }

    const startIndex = ((moduleSessionOrdinal * 2) % pool.length + pool.length) % pool.length;
    const selected = [pool[startIndex], pool[(startIndex + 1) % pool.length]].filter(
      (question, index, items): question is QuizQuestion =>
        Boolean(question) &&
        items.findIndex((candidate) => candidate?.id === question?.id) === index
    );

    return selected.slice(0, 2);
  },

  getMathRailSourceLinks(
    skillLevel: SkillLevelId,
    recommendedTools: string[]
  ): SessionLink[] {
    const lowerCaseTools = recommendedTools.map((tool) => tool.toLowerCase());
    const toolLinks: Array<SessionLink | null> = [
      lowerCaseTools.some((tool) => tool.includes('desmos'))
        ? {
            id: `maths-tool-desmos-${skillLevel}`,
            title: 'Desmos Graphing Calculator',
            url: 'https://www.desmos.com/calculator',
            type: 'tool',
            note: 'Use graphing and visual pattern tools to test maths ideas quickly.',
          }
        : null,
      lowerCaseTools.some((tool) => tool.includes('geogebra'))
        ? {
            id: `maths-tool-geogebra-${skillLevel}`,
            title: 'GeoGebra',
            url: 'https://www.geogebra.org/',
            type: 'tool',
            note: 'Explore geometry, graphing, and interactive modelling.',
          }
        : null,
      lowerCaseTools.some((tool) => tool.includes('notebooklm'))
        ? {
            id: `maths-tool-notebooklm-${skillLevel}`,
            title: 'NotebookLM',
            url: 'https://notebooklm.google.com/',
            type: 'tool',
            note: 'Turn notes into explanations, summaries, and study prompts.',
          }
        : null,
      lowerCaseTools.some((tool) => tool.includes('python')) ||
      lowerCaseTools.some((tool) => tool.includes('colab'))
        ? {
            id: `maths-tool-colab-${skillLevel}`,
            title: 'Google Colab',
            url: 'https://colab.research.google.com/',
            type: 'tool',
            note: 'Use notebooks for maths modelling, code, charts, and experiments.',
          }
        : null,
      {
        id: `maths-source-khan-${skillLevel}`,
        title: 'Khan Academy Math',
        url: 'https://www.khanacademy.org/math',
        type: 'source',
        note: 'Additional worked examples and practice support.',
      },
    ];

    return toolLinks.filter((link): link is SessionLink => Boolean(link)).slice(0, 4);
  },

  buildQuizBlock(
    startTime: string,
    podId: string,
    weekNumber: number,
    skillLevel: SkillLevelId,
    dayOfWeek: number,
    quizQuestions?: QuizQuestion[]
  ): ScheduleBlock | null {
    const questions = quizQuestions || this.getQuizQuestionsForDay(podId, weekNumber, dayOfWeek, skillLevel);
    if (questions.length === 0) {
      return null;
    }

    const podTitle = getPodById(podId)?.title || 'Pod';
    return this.createBlock({
      title: `${podTitle.split(':')[0]} Quick Check`,
      description: `Answer ${questions.length} quick multiple-choice questions and track today’s score.`,
      type: 'practice',
      startTime,
      duration: 20,
      podId,
      weekNumber,
      objectives: [
        'Check what you understand from today’s lesson',
        'Use the hint if you get stuck and aim for accuracy',
      ],
      materials: ['Quiz prompt', 'Notebook or discussion partner'],
      energyRequired: 'medium',
      focusRequired: 'medium',
      expectedWork: `${questions.length} quiz answers with a daily mark and a running weekly score`,
      reflectionPrompt: 'Which question felt easiest, and which one do you still want to review?',
      quizQuestions: questions,
    });
  },

  mapReferenceToSessionLink(reference: PodReference): SessionLink {
    const typeMap: Record<PodReference['category'], SessionLink['type']> = {
      activity: 'activity',
      article: 'source',
      research: 'source',
      simulation: 'simulation',
      standard: 'source',
      video: 'video',
    };

    return {
      id: reference.id,
      title: reference.title,
      url: reference.url,
      type: typeMap[reference.category],
      note: reference.note,
    };
  },

  mapSupportingAssetToSessionLink(asset: SupportingAsset): SessionLink | null {
    if (!asset.url) {
      return null;
    }

    const typeMap: Record<SupportingAsset['type'], SessionLink['type']> = {
      video: 'video',
      'mind-map': 'worksheet',
      'slide-deck': 'worksheet',
      notebook: 'worksheet',
      worksheet: 'worksheet',
      link: 'source',
    };

    return {
      id: asset.id,
      title: asset.title,
      url: asset.url,
      type: typeMap[asset.type],
      note: asset.description,
    };
  },

  extractContentKeywords(...content: Array<string | undefined>): Set<string> {
    const combined = content.filter(Boolean).join(' ').toLowerCase();
    const normalized = combined.replace(/[^a-z0-9\s-]/g, ' ');
    const tokens = normalized
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !CONTENT_MATCH_STOP_WORDS.has(token));

    return new Set(tokens);
  },

  hasKeywordOverlap(left: Set<string>, right: Set<string>): boolean {
    for (const token of left) {
      if (right.has(token)) {
        return true;
      }
    }

    return false;
  },

  getBlockKeywords(block: ScheduleBlock): Set<string> {
    return this.extractContentKeywords(
      block.title,
      block.description,
      block.expectedWork,
      block.reflectionPrompt,
      ...block.objectives
    );
  },

  isGenericPodScaffoldBlock(block: ScheduleBlock): boolean {
    const title = block.title.toLowerCase();
    const genericTitleMarkers = [
      'movement warm-up',
      'daily maths',
      'french & word lab',
      'writing & grammar studio',
      'lunch & reset',
      'physical challenge',
      'daily reflection',
    ];

    if (block.railId) {
      return true;
    }

    if (block.type === 'physical' || block.type === 'break' || block.type === 'french' || block.type === 'reflection') {
      return true;
    }

    return genericTitleMarkers.some((marker) => title.includes(marker));
  },

  shouldUseCurriculumContext(block: ScheduleBlock): boolean {
    return Boolean(block.podId) && !this.isGenericPodScaffoldBlock(block);
  },

  isSupportingAssetRelevantForBlock(asset: SupportingAsset, block: ScheduleBlock): boolean {
    const blockKeywords = this.getBlockKeywords(block);
    const assetKeywords = this.extractContentKeywords(asset.title, asset.description);

    if (this.hasKeywordOverlap(blockKeywords, assetKeywords)) {
      return true;
    }

    if (block.launchUrl) {
      return asset.type === 'worksheet' || asset.type === 'notebook';
    }

    if (block.type === 'reflection') {
      return asset.type === 'notebook' || asset.type === 'worksheet';
    }

    if (block.type === 'project') {
      return asset.type === 'slide-deck' || asset.type === 'mind-map' || asset.type === 'worksheet';
    }

    if (block.type === 'learning' && block.title.toLowerCase().includes('history')) {
      return asset.type === 'video' || asset.type === 'slide-deck';
    }

    return false;
  },

  isReferenceRelevantForBlock(reference: PodReference, block: ScheduleBlock): boolean {
    const blockKeywords = this.getBlockKeywords(block);
    const referenceKeywords = this.extractContentKeywords(reference.title, reference.note);

    if (this.hasKeywordOverlap(blockKeywords, referenceKeywords)) {
      return true;
    }

    if (block.type === 'external') {
      return reference.category === 'simulation' || reference.category === 'activity';
    }

    if (block.type === 'project') {
      return (
        reference.category === 'activity' ||
        reference.category === 'video' ||
        reference.category === 'simulation'
      );
    }

    if (block.type === 'reflection') {
      return (
        (reference.category === 'research' || reference.category === 'article') &&
        (reference.title.toLowerCase().includes('summary') || (reference.note || '').toLowerCase().includes('reflection'))
      );
    }

    const title = `${block.title} ${block.description || ''}`.toLowerCase();

    if (title.includes('history')) {
      return reference.title.toLowerCase().includes('history');
    }

    if (title.includes('scale') || title.includes('density')) {
      return (
        reference.title.toLowerCase().includes('scale') ||
        (reference.note || '').toLowerCase().includes('scale')
      );
    }

    if (title.includes('atom') || title.includes('particle') || title.includes('electron') || title.includes('proton')) {
      return reference.category === 'simulation' || reference.category === 'activity';
    }

    return false;
  },

  getCurriculumSourceLinks(block: ScheduleBlock, curriculum?: PodCurriculum): SessionLink[] {
    const links: SessionLink[] = [];

    if (block.launchUrl) {
      links.push({
        id: `${block.id}-launch`,
        title: block.externalPlatformName || block.title,
        url: block.launchUrl,
        type: 'tool',
        note: 'Launch the linked learning tool for this session.',
      });
    }

    if (!curriculum || !this.shouldUseCurriculumContext(block)) {
      return links;
    }

    (curriculum.supportingAssets || [])
      .filter((asset) => this.isSupportingAssetRelevantForBlock(asset, block))
      .map((asset) => this.mapSupportingAssetToSessionLink(asset))
      .filter((asset): asset is SessionLink => Boolean(asset))
      .slice(0, 2)
      .forEach((asset) => links.push(asset));

    (curriculum.references || [])
      .filter((reference) => this.isReferenceRelevantForBlock(reference, block))
      .slice(0, 3)
      .map((reference) => this.mapReferenceToSessionLink(reference))
      .forEach((reference) => links.push(reference));

    return Array.from(new Map(links.map((link) => [link.url, link])).values()).slice(0, 4);
  },

  getCanonicalLessonForBlock(
    block: ScheduleBlock,
    curriculum: PodCurriculum | undefined,
    skillLevel: SkillLevelId
  ): CanonicalMiniLesson | null {
    if (!curriculum || !block.weekNumber || !this.shouldUseCurriculumContext(block)) {
      return null;
    }

    const week = curriculum.weeks.find((entry) => entry.weekNumber === block.weekNumber);
    const lessons = week?.canonicalLessonsBySkillLevel?.[skillLevel] || [];
    if (lessons.length === 0) {
      return null;
    }

    const blockKeywords = this.getBlockKeywords(block);
    const match = lessons.find((lesson) =>
      this.hasKeywordOverlap(
        blockKeywords,
        this.extractContentKeywords(
          lesson.title,
          lesson.learningObjective,
          lesson.concreteExample,
          ...lesson.explanationSections,
          ...(lesson.tags || []),
          ...(lesson.relatedActivities || [])
        )
      )
    );

    return match || null;
  },

  buildRecommendedTools(block: ScheduleBlock, curriculum?: PodCurriculum): string[] {
    const tools = new Set<string>(block.recommendedTools || []);

    block.materials.forEach((material) => tools.add(material));
    block.aiSkills?.tools.forEach((tool) => tools.add(tool));

    if (block.externalPlatformName) {
      tools.add(block.externalPlatformName);
    }

    if (curriculum?.supportingAssets?.length && this.shouldUseCurriculumContext(block)) {
      curriculum.supportingAssets
        .filter((asset) => this.isSupportingAssetRelevantForBlock(asset, block))
        .slice(0, 2)
        .forEach((asset) => tools.add(asset.title));
    }

    return Array.from(tools).filter(Boolean).slice(0, 4);
  },

  buildSessionGuide(
    block: ScheduleBlock,
    skillLevel: SkillLevelId,
    recommendedTools: string[],
    canonicalLesson?: CanonicalMiniLesson | null
  ): string[] {
    const guide: string[] = [];

    if (canonicalLesson?.learningObjective) {
      guide.push(`Aim for: ${canonicalLesson.learningObjective}`);
    } else if (block.objectives[0]) {
      guide.push(`Start by focusing on: ${block.objectives[0]}`);
    }

    if (canonicalLesson?.explanationSections[0]) {
      guide.push(canonicalLesson.explanationSections[0]);
    }

    if (canonicalLesson?.concreteExample) {
      guide.push(`Think with this example: ${canonicalLesson.concreteExample}`);
    }

    if (recommendedTools.length > 0) {
      guide.push(`Use: ${recommendedTools.slice(0, 2).join(' and ')}.`);
    }

    if (block.expectedWork) {
      guide.push(`Capture before you finish: ${block.expectedWork}.`);
    }

    if (block.reflectionPrompt) {
      guide.push(`Close with: ${block.reflectionPrompt}`);
    } else if (skillLevel === 'foundation') {
      guide.push('Close by saying or drawing one thing you discovered.');
    } else if (skillLevel === 'pro') {
      guide.push('Close by comparing what worked, what failed, and what you would change next.');
    } else {
      guide.push('Close by explaining what you learned in your own words.');
    }

    return Array.from(new Set(guide)).slice(0, 4);
  },

  decorateBlockWithGuidance(block: ScheduleBlock, skillLevel: SkillLevelId): ScheduleBlock {
    const curriculum =
      block.podId && !block.railId ? curriculumService.getCurriculum(block.podId) : undefined;
    const canonicalLesson = this.getCanonicalLessonForBlock(block, curriculum, skillLevel);
    const generatedSourceLinks = this.getCurriculumSourceLinks(block, curriculum);
    const sourceLinks =
      block.source === 'pod'
        ? generatedSourceLinks
        : Array.from(
            new Map([...(block.sourceLinks || []), ...generatedSourceLinks].map((link) => [link.url, link])).values()
          ).slice(0, 4);
    const recommendedTools =
      block.source === 'pod'
        ? this.buildRecommendedTools(block, curriculum)
        : this.buildRecommendedTools(
            { ...block, recommendedTools: Array.from(new Set(block.recommendedTools || [])) },
            curriculum
          );
    const sessionGuide =
      block.source === 'pod'
        ? this.buildSessionGuide(block, skillLevel, recommendedTools, canonicalLesson)
        : block.sessionGuide && block.sessionGuide.length > 0
          ? block.sessionGuide
          : this.buildSessionGuide(block, skillLevel, recommendedTools, canonicalLesson);

    return {
      ...block,
      sourceLinks,
      recommendedTools,
      sessionGuide,
    };
  },

  createBlock(params: {
    title: string;
    type: BlockType;
    startTime: string;
    duration: number;
    podId?: string;
    weekNumber?: number;
    objectives: string[];
    materials: string[];
    energyRequired: 'low' | 'medium' | 'high';
    focusRequired: 'low' | 'medium' | 'high';
    description?: string;
    expectedWork?: string;
    resources?: ScheduleBlock['resources'];
    priority?: ScheduleBlock['priority'];
    notes?: string;
    source?: ScheduleBlock['source'];
    relatedPodIds?: string[];
    projectId?: string;
    projectStepId?: string;
    externalSessionId?: string;
    externalPlatformId?: string;
    externalPlatformName?: string;
    launchUrl?: string;
    reflectionPrompt?: string;
    sessionGuide?: ScheduleBlock['sessionGuide'];
    recommendedTools?: ScheduleBlock['recommendedTools'];
    sourceLinks?: ScheduleBlock['sourceLinks'];
    quizQuestions?: ScheduleBlock['quizQuestions'];
    railId?: ScheduleBlock['railId'];
    railTrackId?: ScheduleBlock['railTrackId'];
    railModuleId?: ScheduleBlock['railModuleId'];
    railLessonId?: ScheduleBlock['railLessonId'];
  }): ScheduleBlock {
    const endTime = this.addMinutes(params.startTime, params.duration);
    
    return {
      id: generateId(),
      title: params.title,
      description: params.description,
      startTime: params.startTime,
      endTime,
      duration: params.duration,
      type: params.type,
      status: 'scheduled',
      priority: params.priority || 'medium',
      podId: params.podId,
      weekNumber: params.weekNumber,
      railId: params.railId,
      railTrackId: params.railTrackId,
      railModuleId: params.railModuleId,
      railLessonId: params.railLessonId,
      objectives: params.objectives,
      materials: params.materials,
      resources: params.resources || [],
      expectedWork: params.expectedWork,
      reflectionPrompt: params.reflectionPrompt,
      sessionGuide: params.sessionGuide,
      recommendedTools: params.recommendedTools,
      sourceLinks: params.sourceLinks,
      quizQuestions: params.quizQuestions,
      timerInitialSeconds: params.duration * 60,
      timerRemainingSeconds: params.duration * 60,
      notes: params.notes,
      source: params.source || (params.podId ? 'pod' : 'custom'),
      relatedPodIds: params.relatedPodIds,
      projectId: params.projectId,
      projectStepId: params.projectStepId,
      externalSessionId: params.externalSessionId,
      externalPlatformId: params.externalPlatformId,
      externalPlatformName: params.externalPlatformName,
      launchUrl: params.launchUrl,
      energyRequired: params.energyRequired,
      focusRequired: params.focusRequired,
      canReschedule: params.type !== 'assessment',
    };
  },

  scaleBlocksToDuration(blocks: ScheduleBlock[], targetMinutes?: number): ScheduleBlock[] {
    if (!targetMinutes || blocks.length === 0) {
      return blocks;
    }

    const sourceTotal = blocks.reduce((sum, block) => sum + block.duration, 0);
    const minimumTotal = blocks.length * 10;
    const desiredTotal = Math.max(targetMinutes, minimumTotal);

    if (sourceTotal === 0 || sourceTotal === desiredTotal) {
      return blocks;
    }

    let assigned = 0;

    return blocks.map((block, index) => {
      if (index === blocks.length - 1) {
        return {
          ...block,
          duration: Math.max(10, desiredTotal - assigned),
        };
      }

      const scaledDuration = Math.max(
        10,
        Math.round(((block.duration / sourceTotal) * desiredTotal) / 5) * 5
      );
      assigned += scaledDuration;

      return {
        ...block,
        duration: scaledDuration,
      };
    });
  },

  addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMins = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMins / 60) % 24;
    const newMins = totalMins % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  },


  // ============ Learner Preferences ============
  
  getLearnerPreferences(learnerId: string): SchedulePreferences {
    const key = `${PREFERENCES_KEY}-${learnerId}`;
    const stored = storage.get<SchedulePreferences | null>(key, null);
    return stored || { ...DEFAULT_PREFERENCES, learnerId };
  },

  saveLearnerPreferences(preferences: SchedulePreferences): void {
    const key = `${PREFERENCES_KEY}-${preferences.learnerId}`;
    storage.set(key, preferences);
  },

  // ============ Metrics ============
  
  updateMetrics(learnerId: string, date: string, schedule: DailySchedule): void {
    const metrics: ScheduleMetrics = {
      date,
      learnerId,
      blocksScheduled: schedule.blocks.length,
      blocksCompleted: schedule.blocks.filter(b => b.status === 'completed').length,
      blocksSkipped: schedule.blocks.filter(b => b.status === 'skipped').length,
      completionRate: (schedule.completedBlocks / schedule.blocks.length) * 100,
      totalScheduledTime: schedule.totalDuration,
      totalActiveTime: schedule.blocks
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.actualDuration || b.duration), 0),
      averageBlockDuration: schedule.blocks.length > 0
        ? schedule.totalDuration / schedule.blocks.length
        : 0,
      focusScore: this.calculateFocusScore(schedule),
      energyStart: 8,
      energyEnd: 6,
    };
    
    const key = `${METRICS_KEY}-${learnerId}-${date}`;
    storage.set(key, metrics);
  },

  getMetrics(learnerId: string, date: string): ScheduleMetrics | null {
    const key = `${METRICS_KEY}-${learnerId}-${date}`;
    return storage.get<ScheduleMetrics | null>(key, null);
  },

  calculateFocusScore(schedule: DailySchedule): number {
    const completed = schedule.blocks.filter(b => b.status === 'completed');
    if (completed.length === 0) return 0;
    
    let score = 0;
    completed.forEach(block => {
      const config = BLOCK_TYPE_CONFIG[block.type];
      if (config.focusRequired === 'high') score += 3;
      else if (config.focusRequired === 'medium') score += 2;
      else score += 1;
    });
    
    return Math.min(10, Math.round((score / completed.length) * 3));
  },

  // ============ Smart Scheduling ============
  
  suggestOptimalTime(
    learnerId: string,
    blockType: BlockType
  ): string {
    const preferences = this.getLearnerPreferences(learnerId);
    const config = BLOCK_TYPE_CONFIG[blockType];
    
    // High focus tasks in peak hours
    if (config.focusRequired === 'high' && preferences.peakFocusHours.length > 0) {
      return preferences.peakFocusHours[0];
    }
    
    // Physical activities after lunch
    if (blockType === 'physical') {
      return '13:00';
    }
    
    // Creative tasks in afternoon
    if (blockType === 'creative') {
      return '14:00';
    }
    
    // Default to optimal start time
    return preferences.optimalStartTime;
  },

  // ============ Resource Conflicts ============
  
  checkResourceConflicts(
    date: string,
    learnerIds: string[],
    resourceId: string
  ): { learnerId: string; blockId: string; time: string }[] {
    const conflicts: { learnerId: string; blockId: string; time: string }[] = [];
    
    learnerIds.forEach(learnerId => {
      const schedule = this.getDailySchedule(learnerId, date);
      if (!schedule) return;
      
      schedule.blocks.forEach(block => {
        const hasResource = block.resources.some(r => r.id === resourceId);
        if (hasResource && block.status !== 'completed' && block.status !== 'skipped') {
          conflicts.push({
            learnerId,
            blockId: block.id,
            time: block.startTime,
          });
        }
      });
    });
    
    return conflicts;
  },

  // ============ Adaptive Scheduling ============
  
  adjustScheduleForEnergy(
    learnerId: string,
    date: string,
    currentEnergy: 'high' | 'medium' | 'low'
  ): DailySchedule | null {
    const schedule = this.getDailySchedule(learnerId, date);
    if (!schedule) return null;
    
    const updatedBlocks = schedule.blocks.map(block => {
      if (block.status !== 'scheduled') return block;
      
      // If energy is low, suggest rescheduling high-energy tasks
      if (currentEnergy === 'low' && block.energyRequired === 'high') {
        return {
          ...block,
          suggestedTime: this.addMinutes(block.startTime, 60),
        };
      }
      
      return block;
    });
    
    const updatedSchedule = {
      ...schedule,
      blocks: updatedBlocks,
      energyLevel: currentEnergy,
    };
    
    return this.saveDailySchedule(updatedSchedule);
  },

  // ============ Templates ============
  
  getScheduleTemplates(): { id: string; name: string; description: string }[] {
    return [
      { id: 'balanced', name: 'Balanced Day', description: 'Mix of learning, creative, and physical activities' },
      { id: 'focus', name: 'Focus Day', description: 'Extended learning blocks with minimal breaks' },
      { id: 'creative', name: 'Creative Day', description: 'Emphasis on art, music, and creative projects' },
      { id: 'light', name: 'Light Day', description: 'Shorter sessions with more breaks' },
      { id: 'assessment', name: 'Assessment Day', description: 'Review and evaluation focused' },
    ];
  },

  pickSupportPodForDate(rule: PlanningRule, date: string): string | undefined {
    const activePlans = (rule.supportPodPlans || []).filter(
      (plan) => plan.startDate <= date && (!plan.endDate || plan.endDate >= date)
    );

    if (activePlans.length > 0) {
      const dateIndex = new Date(`${date}T00:00:00`).getDate();
      return activePlans[(dateIndex - 1) % activePlans.length]?.podId;
    }

    if (rule.supportPodIds.length === 0) {
      return undefined;
    }

    const dateIndex = new Date(`${date}T00:00:00`).getDate();
    return rule.supportPodIds[(dateIndex - 1) % rule.supportPodIds.length];
  },

  sortBlocks(blocks: ScheduleBlock[]): ScheduleBlock[] {
    return [...blocks].sort((left, right) => left.startTime.localeCompare(right.startTime));
  },

  reflowBlockTimes(blocks: ScheduleBlock[]): ScheduleBlock[] {
    if (blocks.length === 0) {
      return blocks;
    }

    let currentTime = blocks[0].startTime;

    return blocks.map((block, index) => {
      if (index === 0) {
        currentTime = block.startTime;
      }

      const nextBlock: ScheduleBlock = {
        ...block,
        startTime: currentTime,
        endTime: this.addMinutes(currentTime, block.duration),
      };
      currentTime = nextBlock.endTime;
      return nextBlock;
    });
  },

  recalculateSchedule(schedule: DailySchedule): DailySchedule {
    return {
      ...schedule,
      blocks: this.sortBlocks(schedule.blocks),
      totalDuration: schedule.blocks.reduce((sum, block) => sum + block.duration, 0),
      completedBlocks: schedule.blocks.filter((block) => block.status === 'completed').length,
    };
  },
};
