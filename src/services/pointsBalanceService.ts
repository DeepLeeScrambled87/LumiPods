import { isLearnerPortfolioArtifact } from '../lib/artifactScope';
import {
  artifactDataService,
  learnerDataService,
  progressDataService,
  rewardRedemptionDataService,
} from './dataService';
import {
  achievementUnlockDataService,
  externalActivitySessionDataService,
  projectDataService,
  reflectionEntryDataService,
} from './learningRecordsService';

export const LEARNER_POINTS_UPDATED_EVENT = 'lumipods:learner-points-updated';

const ARTIFACT_BONUS = 15;
const REFLECTION_BONUS = 10;
const COMPLETED_PROJECT_BONUS = 40;
const EXTERNAL_SESSION_BONUS = 10;
const HISTORY_WINDOW_DAYS = 3650;

export interface LearnerPointsBreakdown {
  progressPoints: number;
  artifactPoints: number;
  reflectionPoints: number;
  projectPoints: number;
  externalSessionPoints: number;
  achievementPoints: number;
  redeemedPoints: number;
  totalPoints: number;
}

const dispatchLearnerPointsUpdated = (familyId: string, learnerId: string, points: number): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(LEARNER_POINTS_UPDATED_EVENT, {
      detail: {
        familyId,
        learnerId,
        points,
      },
    })
  );
};

export const calculateLearnerPointsBreakdown = async (
  familyId: string,
  learnerId: string
): Promise<LearnerPointsBreakdown> => {
  const [progress, artifacts, reflections, projects, externalSessions, unlocks, redemptions] = await Promise.all([
    progressDataService.getForLearner(familyId, learnerId, HISTORY_WINDOW_DAYS),
    artifactDataService.getByLearner(learnerId),
    reflectionEntryDataService.getByLearner(learnerId),
    projectDataService.getByLearner(learnerId),
    externalActivitySessionDataService.getByLearner(learnerId),
    achievementUnlockDataService.getByLearner(learnerId),
    rewardRedemptionDataService.getByLearner(learnerId),
  ]);

  const progressPoints = progress.reduce((sum, entry) => sum + (entry.pointsEarned || 0), 0);
  const artifactPoints = artifacts.filter(isLearnerPortfolioArtifact).length * ARTIFACT_BONUS;
  const reflectionPoints = reflections.length * REFLECTION_BONUS;
  const projectPoints =
    projects.filter((project) => project.status === 'completed').length * COMPLETED_PROJECT_BONUS;
  const externalSessionPoints =
    externalSessions.filter((session) => session.status === 'completed').length * EXTERNAL_SESSION_BONUS;
  const achievementPoints = unlocks.reduce((sum, unlock) => sum + (unlock.pointsAwarded || 0), 0);
  const redeemedPoints = redemptions
    .filter((redemption) => redemption.status !== 'rejected')
    .reduce((sum, redemption) => sum + (redemption.pointsSpent || 0), 0);

  return {
    progressPoints,
    artifactPoints,
    reflectionPoints,
    projectPoints,
    externalSessionPoints,
    achievementPoints,
    redeemedPoints,
    totalPoints: Math.max(
      0,
      progressPoints +
        artifactPoints +
        reflectionPoints +
        projectPoints +
        externalSessionPoints +
        achievementPoints -
        redeemedPoints
    ),
  };
};

export const syncLearnerPointsBalance = async (
  familyId: string,
  learnerId: string
): Promise<LearnerPointsBreakdown | null> => {
  const learners = await learnerDataService.getByFamily(familyId);
  const learner = learners.find((entry) => entry.id === learnerId);

  if (!learner) {
    return null;
  }

  const breakdown = await calculateLearnerPointsBreakdown(familyId, learnerId);

  if (learner.points !== breakdown.totalPoints) {
    await learnerDataService.save(familyId, {
      ...learner,
      points: breakdown.totalPoints,
      updatedAt: new Date().toISOString(),
    });
    dispatchLearnerPointsUpdated(familyId, learnerId, breakdown.totalPoints);
  }

  return breakdown;
};
