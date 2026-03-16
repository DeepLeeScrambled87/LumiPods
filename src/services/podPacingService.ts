import type { PlanningQuestion, PodCurriculum, PacingOption } from '../types/curriculum';

export interface PodPlanningAnswers {
  timeframe?: string;
  hoursPerWeek?: string;
  minutesPerDay?: string;
  scheduleMode?: string;
}

const FALLBACK_PACING: PacingOption = {
  id: 'default-4-week',
  label: 'Balanced 4-week path',
  totalWeeks: 4,
  sessionsPerWeek: 4,
  minutesPerSession: 45,
  notes: 'A balanced spread that works well for most families.',
};

const parseLeadingNumber = (value?: string): number | null => {
  if (!value) {
    return null;
  }

  const match = value.match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

const getWeeklyHours = (option: PacingOption): number =>
  (option.sessionsPerWeek * option.minutesPerSession) / 60;

export const podPacingService = {
  getDefaultOption(curriculum?: PodCurriculum | null): PacingOption {
    return curriculum?.pacingOptions?.[0] || FALLBACK_PACING;
  },

  getProgramHours(curriculum?: PodCurriculum | null): number {
    if (curriculum?.programHours) {
      return curriculum.programHours;
    }

    const fallback = this.getDefaultOption(curriculum);
    return Number((fallback.totalWeeks * getWeeklyHours(fallback)).toFixed(1));
  },

  getAnswerNumber(value?: string): number | null {
    return parseLeadingNumber(value);
  },

  estimateWeeklyHours(programHours?: number | null, totalWeeks?: number | null): number | null {
    if (!programHours || !totalWeeks || totalWeeks <= 0) {
      return null;
    }

    return Number((programHours / totalWeeks).toFixed(1));
  },

  estimateWeeksFromHours(programHours?: number | null, weeklyHours?: number | null): number | null {
    if (!programHours || !weeklyHours || weeklyHours <= 0) {
      return null;
    }

    return Math.max(1, Math.ceil(programHours / weeklyHours));
  },

  formatWeeklyHours(hours?: number | null): string {
    if (!hours) {
      return 'Flexible';
    }

    if (Number.isInteger(hours)) {
      return `${hours} hrs/week`;
    }

    return `${hours.toFixed(1)} hrs/week`;
  },

  getDefaultAnswers(questions?: PlanningQuestion[]): PodPlanningAnswers {
    const answers: PodPlanningAnswers = {};

    (questions || []).forEach((question) => {
      const firstOption = question.options[0];
      if (!firstOption) {
        return;
      }

      if (question.type === 'timeframe') {
        answers.timeframe = firstOption;
      } else if (question.type === 'hours-per-week') {
        answers.hoursPerWeek = firstOption;
      } else if (question.type === 'minutes-per-day') {
        answers.minutesPerDay = firstOption;
      } else if (question.type === 'schedule-mode') {
        answers.scheduleMode = firstOption;
      }
    });

    return answers;
  },

  resolveOption(curriculum?: PodCurriculum | null, answers: PodPlanningAnswers = {}): PacingOption {
    const options = curriculum?.pacingOptions?.length ? curriculum.pacingOptions : [FALLBACK_PACING];
    const targetWeeks = parseLeadingNumber(answers.timeframe);
    const targetHours = parseLeadingNumber(answers.hoursPerWeek);
    const targetMinutes = parseLeadingNumber(answers.minutesPerDay);

    let bestOption = options[0];
    let bestScore = Number.POSITIVE_INFINITY;

    options.forEach((option) => {
      const weeklyHours = getWeeklyHours(option);
      const score =
        (targetWeeks === null ? 0 : Math.abs(option.totalWeeks - targetWeeks) * 5) +
        (targetHours === null ? 0 : Math.abs(weeklyHours - targetHours) * 2) +
        (targetMinutes === null ? 0 : Math.abs(option.minutesPerSession - targetMinutes));

      if (score < bestScore) {
        bestScore = score;
        bestOption = option;
      }
    });

    return bestOption;
  },

  mapPlannedWeekToCurriculumWeek(
    plannedWeekNumber: number,
    plannedWeeks: number,
    curriculumWeeks: number
  ): number {
    if (plannedWeeks <= 1 || curriculumWeeks <= 1) {
      return 1;
    }

    const safeWeekIndex = Math.min(Math.max(plannedWeekNumber - 1, 0), plannedWeeks - 1);
    return Math.min(
      curriculumWeeks,
      Math.max(1, Math.floor((safeWeekIndex * curriculumWeeks) / plannedWeeks) + 1)
    );
  },

  getPlanEndDate(startDate: string, totalWeeks: number): string {
    const end = new Date(`${startDate}T00:00:00`);
    end.setDate(end.getDate() + Math.max(totalWeeks, 1) * 7 - 1);
    return end.toISOString().split('T')[0];
  },

  describePlan(option: PacingOption, programHours?: number): string {
    const weeklyHours = getWeeklyHours(option);
    const hoursLabel = programHours ? `${programHours} total hours` : `${weeklyHours.toFixed(1)} hrs/week`;
    return `${option.label}: ${option.totalWeeks} weeks, ${option.sessionsPerWeek} sessions/week, ${option.minutesPerSession} min/session, ${hoursLabel}.`;
  },
};

export default podPacingService;
