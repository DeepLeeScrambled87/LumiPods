import {
  ACHIEVEMENTS,
  type Achievement,
  type LearnerStats,
  type UnlockedAchievement,
} from '../features/gamification/achievements';
import { artifactDataService, progressDataService } from './dataService';
import {
  achievementUnlockDataService,
  externalActivitySessionDataService,
  projectDataService,
  reflectionEntryDataService,
} from './learningRecordsService';
import { notifyAchievement } from './notificationService';
import { announceLearnerPointsAward } from './pointsFeedbackService';
import { calculateLearnerPointsBreakdown, syncLearnerPointsBalance } from './pointsBalanceService';
import { isLearnerPortfolioArtifact } from '../lib/artifactScope';

const pendingUnlockKeys = new Set<string>();
const pendingCheckKeys = new Map<string, Promise<Achievement[]>>();

export const achievementService = {
  async getUnlocked(familyId: string, learnerId: string): Promise<UnlockedAchievement[]> {
    const unlocks = await achievementUnlockDataService.getByLearner(learnerId);
    return unlocks
      .filter((entry) => entry.familyId === familyId)
      .map((entry) => ({
        achievementId: entry.achievementId,
        learnerId: entry.learnerId,
        unlockedAt: entry.unlockedAt,
      }));
  },

  async unlock(
    familyId: string,
    learnerId: string,
    achievementId: string,
    sourceType: 'progress' | 'artifact' | 'project' | 'reflection' | 'external-session' | 'manual' = 'progress'
  ): Promise<boolean> {
    const unlockKey = `${familyId}:${learnerId}:${achievementId}`;
    if (pendingUnlockKeys.has(unlockKey)) {
      return false;
    }

    const achievement = ACHIEVEMENTS.find((entry) => entry.id === achievementId);
    if (!achievement) {
      return false;
    }

    const existing = await this.getUnlocked(familyId, learnerId);
    if (existing.some((entry) => entry.achievementId === achievementId)) {
      return false;
    }

    pendingUnlockKeys.add(unlockKey);
    try {
      await achievementUnlockDataService.unlock({
        id: `achievement-unlock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        familyId,
        learnerId,
        achievementId,
        unlockedAt: new Date().toISOString(),
        sourceType,
        pointsAwarded: achievement.points,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      notifyAchievement(achievement.title, achievement.points, learnerId);
      if (achievement.points > 0) {
        announceLearnerPointsAward({
          familyId,
          learnerId,
          points: achievement.points,
          label: 'Achievement Unlocked',
          description: `${achievement.title} unlocked`,
          timestamp: new Date().toISOString(),
        });
      }
      return true;
    } finally {
      pendingUnlockKeys.delete(unlockKey);
    }
  },

  async getStats(familyId: string, learnerId: string): Promise<LearnerStats> {
    const [progress, artifacts, projects, reflections, externalSessions, pointsBreakdown] = await Promise.all([
      progressDataService.getForLearner(familyId, learnerId, 180),
      artifactDataService.getByLearner(learnerId),
      projectDataService.getByLearner(learnerId),
      reflectionEntryDataService.getByLearner(learnerId),
      externalActivitySessionDataService.getByLearner(learnerId),
      calculateLearnerPointsBreakdown(familyId, learnerId),
    ]);

    return {
      streakDays: calculateStreak(progress),
      blocksCompleted: progress.reduce((sum, entry) => sum + (entry.blocksCompleted || 0), 0),
      focusMinutes: progress.reduce((sum, entry) => sum + (entry.totalFocusMinutes || 0), 0),
      podsCompleted: countCompletedPods(progress),
      artifactsCreated: artifacts.filter(isLearnerPortfolioArtifact).length,
      totalPoints: pointsBreakdown.totalPoints,
      projectsCompleted: projects.filter((project) => project.status === 'completed').length,
      reflectionsLogged: reflections.length,
      externalSessionsCompleted: externalSessions.filter((session) => session.status === 'completed').length,
    };
  },

  async checkAndUnlock(familyId: string, learnerId: string): Promise<Achievement[]> {
    const checkKey = `${familyId}:${learnerId}`;
    const existingCheck = pendingCheckKeys.get(checkKey);
    if (existingCheck) {
      return existingCheck;
    }

    const checkPromise = (async () => {
    const stats = await this.getStats(familyId, learnerId);
    const unlocked = await this.getUnlocked(familyId, learnerId);
    const unlockedIds = new Set(unlocked.map((entry) => entry.achievementId));
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) {
        continue;
      }

      if (!meetsAchievementRequirement(achievement, stats)) {
        continue;
      }

      const sourceType =
        achievement.requirement.type === 'projects'
          ? 'project'
          : achievement.requirement.type === 'reflections'
          ? 'reflection'
          : achievement.requirement.type === 'externalSessions'
          ? 'external-session'
          : achievement.requirement.type === 'artifacts'
          ? 'artifact'
          : 'progress';

      const didUnlock = await this.unlock(familyId, learnerId, achievement.id, sourceType);
      if (didUnlock) {
        newlyUnlocked.push(achievement);
      }
    }

    await syncLearnerPointsBalance(familyId, learnerId);
    return newlyUnlocked;
    })();

    pendingCheckKeys.set(checkKey, checkPromise);
    try {
      return await checkPromise;
    } finally {
      pendingCheckKeys.delete(checkKey);
    }
  },

  getProgress(achievement: Achievement, stats: LearnerStats): number {
    const current = getRequirementCurrentValue(achievement.requirement.type, stats);
    return Math.min(100, Math.round((current / achievement.requirement.value) * 100));
  },
};

function getRequirementCurrentValue(type: Achievement['requirement']['type'], stats: LearnerStats): number {
  switch (type) {
    case 'streak':
      return stats.streakDays;
    case 'blocks':
      return stats.blocksCompleted;
    case 'minutes':
      return stats.focusMinutes;
    case 'pods':
      return stats.podsCompleted;
    case 'artifacts':
      return stats.artifactsCreated;
    case 'points':
      return stats.totalPoints;
    case 'projects':
      return stats.projectsCompleted;
    case 'reflections':
      return stats.reflectionsLogged;
    case 'externalSessions':
      return stats.externalSessionsCompleted;
    default:
      return 0;
  }
}

function meetsAchievementRequirement(achievement: Achievement, stats: LearnerStats): boolean {
  if (achievement.requirement.type === 'custom') {
    return false;
  }

  return getRequirementCurrentValue(achievement.requirement.type, stats) >= achievement.requirement.value;
}

function calculateStreak(progressRecords: Awaited<ReturnType<typeof progressDataService.getForLearner>>): number {
  if (progressRecords.length === 0) {
    return 0;
  }

  const activeDates = progressRecords
    .filter((record) => (record.blocksCompleted || 0) > 0)
    .map((record) => new Date(record.date).toDateString())
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime());

  if (activeDates.length === 0) {
    return 0;
  }

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (activeDates[0] !== today && activeDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let index = 1; index < activeDates.length; index += 1) {
    const previous = new Date(activeDates[index - 1]);
    const current = new Date(activeDates[index]);
    const diffDays = Math.round((previous.getTime() - current.getTime()) / 86400000);

    if (diffDays === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function countCompletedPods(progressRecords: Awaited<ReturnType<typeof progressDataService.getForLearner>>): number {
  const completedPods = new Set<string>();

  for (const record of progressRecords) {
    if (record.weekNumber && record.weekNumber >= 4 && record.podId) {
      completedPods.add(record.podId);
    }
  }

  return completedPods.size;
}
