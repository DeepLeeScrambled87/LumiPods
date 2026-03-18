import { progressDataService } from './dataService';
import { learnerPointsLedgerService } from './learnerPointsLedgerService';
import { syncLearnerPointsBalance } from './pointsBalanceService';
import type { DailySchedule } from '../types/schedule';
import type { DailyProgress } from '../types/progress';

const POINTS_PER_COMPLETED_BLOCK = 10;

const isTrackedBlock = (type: DailySchedule['blocks'][number]['type']): boolean => type !== 'break';

export const buildDailyProgressFromSchedule = (
  schedule: DailySchedule
): Omit<DailyProgress, 'learnerId'> => {
  const trackedBlocks = schedule.blocks.filter((block) => isTrackedBlock(block.type));
  const completedBlocks = trackedBlocks.filter((block) => block.status === 'completed');

  const focusMinutes = completedBlocks.reduce(
    (sum, block) => sum + (block.actualDuration || block.duration),
    0
  );

  const pointsEarned = completedBlocks.reduce(
    (sum, block) => sum + (isTrackedBlock(block.type) ? POINTS_PER_COMPLETED_BLOCK : 0),
    0
  );

  const artifactsCreated = completedBlocks.reduce(
    (sum, block) => sum + (block.artifacts?.length || 0),
    0
  );

  return {
    date: schedule.date,
    podId: trackedBlocks.find((block) => block.podId)?.podId,
    weekNumber: trackedBlocks.find((block) => block.weekNumber)?.weekNumber,
    blocksCompleted: completedBlocks.length,
    blocksTotal: trackedBlocks.length,
    totalFocusMinutes: focusMinutes,
    pointsEarned,
    artifactsCreated,
    streakMaintained: completedBlocks.length > 0,
  };
};

export const syncScheduleProgress = async (schedule: DailySchedule): Promise<void> => {
  await progressDataService.recordDaily(
    schedule.familyId,
    schedule.learnerId,
    buildDailyProgressFromSchedule(schedule)
  );

  const trackedBlocks = schedule.blocks.filter((block) => isTrackedBlock(block.type));
  const completedTrackedBlocks = trackedBlocks.filter((block) => block.status === 'completed');

  if (trackedBlocks.length > 0 && completedTrackedBlocks.length === trackedBlocks.length) {
    await learnerPointsLedgerService.award({
      familyId: schedule.familyId,
      learnerId: schedule.learnerId,
      actionId: 'full_day_completed',
      description: `Completed the full learning day on ${schedule.date}.`,
      sourceKey: `full-day:${schedule.learnerId}:${schedule.date}`,
    });
  }

  await syncLearnerPointsBalance(schedule.familyId, schedule.learnerId);
};
