import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Gift, Star, Check, ShoppingCart, Trophy, Clock, Sparkles, Medal } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '../../lib/cn';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { useFamily } from '../family';
import { useAuth } from '../auth';
import { rewardRedemptionDataService } from '../../services/dataService';
import { achievementService } from '../../services/achievementService';
import {
  LEARNER_POINTS_UPDATED_EVENT,
  calculateLearnerPointsBreakdown,
  getLearnerPointActivity,
  getLearnerRollingPointsSummary,
  getLearnerTodayPointsSummary,
  syncLearnerPointsBalance,
  type LearnerPointActivityItem,
  type LearnerPointsBreakdown,
  type LearnerRollingPointsSummary,
  type LearnerTodayPointsSummary,
} from '../../services/pointsBalanceService';
import { LEARNER_POINTS_AWARDED_EVENT } from '../../services/pointsFeedbackService';
import { 
  DEFAULT_REWARDS, 
  getAffordableRewards, 
  getMilestoneRewards,
  getProgressToReward,
  type ExtendedReward,
  type RewardTier 
} from '../../data/rewards';
import {
  ACHIEVEMENTS,
  RARITY_COLORS,
  type LearnerStats as AchievementStats,
} from '../gamification/achievements';

const TIER_CONFIG: Record<RewardTier, { label: string; color: string; icon: React.ReactNode }> = {
  daily: { label: 'Daily', color: 'bg-emerald-100 text-emerald-700', icon: <Clock className="h-3 w-3" /> },
  weekly: { label: 'Weekly', color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3 w-3" /> },
  monthly: { label: 'Monthly', color: 'bg-purple-100 text-purple-700', icon: <Trophy className="h-3 w-3" /> },
  milestone: { label: 'Milestone', color: 'bg-amber-100 text-amber-700', icon: <Sparkles className="h-3 w-3" /> },
};

const formatActivityTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = Date.now();
  const diffMinutes = Math.floor((now - date.getTime()) / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 24 * 60) return `${Math.floor(diffMinutes / 60)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatActivityDay = (timestamp: string): string =>
  new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

type RewardsViewTab = 'rewards' | 'badges';
type ActivitySortMode = 'newest' | 'day' | 'task';

const EMPTY_ACHIEVEMENT_STATS: AchievementStats = {
  streakDays: 0,
  blocksCompleted: 0,
  focusMinutes: 0,
  podsCompleted: 0,
  artifactsCreated: 0,
  totalPoints: 0,
  projectsCompleted: 0,
  reflectionsLogged: 0,
  externalSessionsCompleted: 0,
};

export const RewardsPage: React.FC = () => {
  const { family, deductPoints } = useFamily();
  const { currentLearnerId, isLearner } = useAuth();
  const [selectedLearner, setSelectedLearner] = useState<string>(currentLearnerId || family?.learners[0]?.id || '');
  const [selectedReward, setSelectedReward] = useState<ExtendedReward | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [filterTier, setFilterTier] = useState<RewardTier | 'all'>('all');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [viewTab, setViewTab] = useState<RewardsViewTab>('rewards');
  const [activitySort, setActivitySort] = useState<ActivitySortMode>('newest');
  const [pointsBreakdown, setPointsBreakdown] = useState<LearnerPointsBreakdown | null>(null);
  const [todaySummary, setTodaySummary] = useState<LearnerTodayPointsSummary | null>(null);
  const [rollingSummary, setRollingSummary] = useState<LearnerRollingPointsSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<LearnerPointActivityItem[]>([]);
  const [syncedPointsByLearner, setSyncedPointsByLearner] = useState<Record<string, number>>({});
  const [achievementStats, setAchievementStats] = useState<AchievementStats>(EMPTY_ACHIEVEMENT_STATS);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<Set<string>>(new Set());

  const learners = useMemo(
    () =>
      isLearner
        ? (family?.learners || []).filter((learner) => learner.id === currentLearnerId)
        : family?.learners || [],
    [currentLearnerId, family?.learners, isLearner]
  );
  const currentLearner = learners.find((l) => l.id === selectedLearner);
  const currentPoints =
    pointsBreakdown?.totalPoints ??
    (selectedLearner ? syncedPointsByLearner[selectedLearner] : undefined) ??
    currentLearner?.points ??
    0;

  const filteredRewards = DEFAULT_REWARDS.filter((r) => {
    if (!r.isAvailable) return false;
    if (filterTier !== 'all' && r.tier !== filterTier) return false;
    return true;
  });

  const affordableRewards = getAffordableRewards(currentPoints);
  const milestoneRewards = getMilestoneRewards();
  const unlockedBadges = useMemo(
    () => ACHIEVEMENTS.filter((achievement) => unlockedAchievementIds.has(achievement.id)),
    [unlockedAchievementIds]
  );
  const sortedRecentActivity = useMemo(() => {
    const nextItems = [...recentActivity];

    if (activitySort === 'task') {
      return nextItems.sort((left, right) => {
        const labelCompare = left.label.localeCompare(right.label);
        if (labelCompare !== 0) {
          return labelCompare;
        }
        return new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime();
      });
    }

    return nextItems.sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
  }, [activitySort, recentActivity]);

  useEffect(() => {
    if (!learners.length) {
      setSelectedLearner('');
      return;
    }

    if (isLearner && currentLearnerId) {
      setSelectedLearner(currentLearnerId);
      return;
    }

    if (!selectedLearner || !learners.some((learner) => learner.id === selectedLearner)) {
      setSelectedLearner(learners[0].id);
    }
  }, [currentLearnerId, isLearner, learners, selectedLearner]);

  const updateSyncedLearnerPoints = useCallback((learnerId: string, points: number) => {
    setSyncedPointsByLearner((current) => {
      if (current[learnerId] === points) {
        return current;
      }
      return {
        ...current,
        [learnerId]: points,
      };
    });
  }, []);

  useEffect(() => {
    if (!family) {
      return;
    }

    let isMounted = true;

    const syncAllLearnerPoints = async () => {
      const breakdowns = await Promise.all(
        family.learners.map(async (learner) => {
          const breakdown = await syncLearnerPointsBalance(family.id, learner.id);
          return {
            learnerId: learner.id,
            totalPoints: breakdown?.totalPoints ?? learner.points,
          };
        })
      );

      if (!isMounted) {
        return;
      }

      const nextPoints = breakdowns.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.learnerId] = entry.totalPoints;
        return acc;
      }, {});

      setSyncedPointsByLearner(nextPoints);
    };

    void syncAllLearnerPoints();

    return () => {
      isMounted = false;
    };
  }, [family]);

  useEffect(() => {
    const handlePointsUpdated = (
      event: Event
    ) => {
      const detail = (event as CustomEvent<{ familyId: string; learnerId: string; points: number }>).detail;
      if (!detail || !family || detail.familyId !== family.id) {
        return;
      }
      updateSyncedLearnerPoints(detail.learnerId, detail.points);
    };

    window.addEventListener(LEARNER_POINTS_UPDATED_EVENT, handlePointsUpdated);
    return () => window.removeEventListener(LEARNER_POINTS_UPDATED_EVENT, handlePointsUpdated);
  }, [family, updateSyncedLearnerPoints]);

  useEffect(() => {
    if (!family || !selectedLearner) {
      setPointsBreakdown(null);
      setTodaySummary(null);
      setRollingSummary(null);
      setRecentActivity([]);
      setAchievementStats(EMPTY_ACHIEVEMENT_STATS);
      setUnlockedAchievementIds(new Set());
      return;
    }

    let isMounted = true;

    const loadPointsData = async () => {
      await syncLearnerPointsBalance(family.id, selectedLearner);
      const [breakdown, today, rolling, activity, stats, unlocked] = await Promise.all([
        calculateLearnerPointsBreakdown(family.id, selectedLearner),
        getLearnerTodayPointsSummary(family.id, selectedLearner),
        getLearnerRollingPointsSummary(family.id, selectedLearner),
        getLearnerPointActivity(family.id, selectedLearner, 14),
        achievementService.getStats(family.id, selectedLearner),
        achievementService.getUnlocked(family.id, selectedLearner),
      ]);

      if (!isMounted) {
        return;
      }

      updateSyncedLearnerPoints(selectedLearner, breakdown.totalPoints);
      setPointsBreakdown(breakdown);
      setTodaySummary(today);
      setRollingSummary(rolling);
      setRecentActivity(activity.slice(0, 12));
      setAchievementStats(stats);
      setUnlockedAchievementIds(new Set(unlocked.map((entry) => entry.achievementId)));
    };

    void loadPointsData();

    const reload = () => {
      void loadPointsData();
    };

    window.addEventListener(LEARNER_POINTS_UPDATED_EVENT, reload);
    window.addEventListener(LEARNER_POINTS_AWARDED_EVENT, reload);
    return () => {
      isMounted = false;
      window.removeEventListener(LEARNER_POINTS_UPDATED_EVENT, reload);
      window.removeEventListener(LEARNER_POINTS_AWARDED_EVENT, reload);
    };
  }, [family, selectedLearner, updateSyncedLearnerPoints]);

  const handleRedeemClick = (reward: ExtendedReward) => {
    setSelectedReward(reward);
    setShowConfirmModal(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !currentLearner || !family) return;

    setIsRedeeming(true);

    try {
      const success = await Promise.resolve(deductPoints(currentLearner.id, selectedReward.cost));
      if (!success) {
        toast.error('Not enough points');
        return;
      }

      const status = selectedReward.requiresParentApproval ? 'pending' : 'approved';
      await rewardRedemptionDataService.create({
        familyId: family.id,
        learnerId: currentLearner.id,
        rewardId: selectedReward.id,
        rewardTitle: selectedReward.title,
        pointsSpent: selectedReward.cost,
        status,
      });
      const nextBreakdown = await syncLearnerPointsBalance(family.id, currentLearner.id);
      if (nextBreakdown) {
        updateSyncedLearnerPoints(currentLearner.id, nextBreakdown.totalPoints);
      }

      toast.success(
        status === 'pending'
          ? `${selectedReward.title} is waiting for parent approval.`
          : `${currentLearner.name} redeemed ${selectedReward.title}!`
      );
      setShowConfirmModal(false);
      setSelectedReward(null);
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      toast.error('Failed to redeem reward');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Gift className="h-6 w-6 text-purple-600" />
                <h1 className="text-2xl font-semibold text-slate-900">Rewards Shop</h1>
              </div>
              <p className="text-sm text-slate-600">
                Earn points through excellence and redeem for meaningful rewards!
              </p>
            </div>
            {currentLearner ? (
              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setViewTab('rewards')}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    viewTab === 'rewards'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  Rewards
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('badges')}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    viewTab === 'badges'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  Badges
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Learner Selector */}
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Select Learner</h3>
              {learners.length === 0 ? (
                <p className="text-sm text-slate-500">Add learners to start earning rewards</p>
              ) : (
                <div className="space-y-2">
                  {learners.map((learner) => (
                    <button
                      key={learner.id}
                      onClick={() => setSelectedLearner(learner.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
                        selectedLearner === learner.id
                          ? 'bg-purple-50 border-2 border-purple-200'
                          : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                      )}
                    >
                      <Avatar emoji={learner.avatar} size="sm" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-slate-900">{learner.name}</p>
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {syncedPointsByLearner[learner.id] ?? learner.points} points
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Current Points */}
            {currentLearner && (
              <Card padding="lg" className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <div className="text-center">
                  <Star className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-amber-700">{currentPoints}</p>
                  <p className="text-sm text-amber-600">Available Points</p>
                </div>
              </Card>
            )}

            {/* Tier Filter */}
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Reward Tiers</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setFilterTier('all')}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    filterTier === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  All Rewards
                </button>
                {(Object.entries(TIER_CONFIG) as [RewardTier, typeof TIER_CONFIG[RewardTier]][]).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setFilterTier(key)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2',
                      filterTier === key
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {config.icon}
                    {config.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {!currentLearner ? (
              <Card className="text-center py-12">
                <Gift className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Select a Learner</h2>
                <p className="text-slate-500">Choose a learner to view their available rewards</p>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <Card padding="lg" className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
                    <div className="flex items-center gap-2 mb-2 text-indigo-700">
                      <Sparkles className="h-4 w-4" />
                      <h2 className="font-semibold">Today&apos;s Points</h2>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{todaySummary?.total || 0}</p>
                    <p className="text-sm text-slate-500 mt-1">What {currentLearner.name} earned today</p>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Sessions</span>
                        <span className="font-semibold">{todaySummary?.blocks || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Games, notes, resources</span>
                        <span className="font-semibold">{todaySummary?.actions || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Achievements</span>
                        <span className="font-semibold">{todaySummary?.achievements || 0}</span>
                      </div>
                    </div>
                  </Card>

                  <Card padding="lg" className="xl:col-span-2">
                    <div className="flex items-center gap-2 mb-3 text-slate-900">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <h2 className="font-semibold">Where Points Come From</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-500">Sessions</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{pointsBreakdown?.progressPoints || 0}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-500">Artifacts</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{pointsBreakdown?.artifactPoints || 0}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-500">Reflections</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{pointsBreakdown?.reflectionPoints || 0}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-500">Projects</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{pointsBreakdown?.projectPoints || 0}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-500">External</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{pointsBreakdown?.externalSessionPoints || 0}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-500">Achievements</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{pointsBreakdown?.achievementPoints || 0}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-500">Actions</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{pointsBreakdown?.actionEventPoints || 0}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-500">Redeemed</p>
                        <p className="mt-1 text-lg font-semibold text-rose-600">-{pointsBreakdown?.redeemedPoints || 0}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      This total is cumulative, so a learner can already have points from earlier days, badges, and portfolio work.
                    </p>
                  </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <Card padding="lg" className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                    <div className="flex items-center gap-2 mb-2 text-emerald-700">
                      <Clock className="h-4 w-4" />
                      <h2 className="font-semibold">Points Summary</h2>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>This week</span>
                        <span className="font-semibold text-slate-900">{rollingSummary?.week || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>This month</span>
                        <span className="font-semibold text-slate-900">{rollingSummary?.month || 0}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-emerald-100 pt-2">
                        <span>Overall</span>
                        <span className="text-lg font-bold text-emerald-700">{rollingSummary?.overall || currentPoints}</span>
                      </div>
                    </div>
                  </Card>

                  <Card padding="lg" className="xl:col-span-2">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 text-slate-900">
                        <Medal className="h-4 w-4 text-indigo-500" />
                        <h2 className="font-semibold">Achieved Badges</h2>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => setViewTab('badges')}>
                        View All Badges
                      </Button>
                    </div>
                    {unlockedBadges.length === 0 ? (
                      <p className="text-sm text-slate-500">No badges unlocked yet. Keep building streaks, projects, and portfolio work.</p>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {unlockedBadges.slice(0, 6).map((achievement) => (
                            <div
                              key={achievement.id}
                              className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm text-indigo-900"
                            >
                              <span>{achievement.icon}</span>
                              <span className="font-medium">{achievement.title}</span>
                            </div>
                          ))}
                        </div>
                        {unlockedBadges.length > 6 ? (
                          <p className="mt-3 text-xs text-slate-500">+{unlockedBadges.length - 6} more unlocked badges</p>
                        ) : null}
                      </>
                    )}
                  </Card>
                </div>

                {viewTab === 'rewards' ? (
                  <>
                    {/* Milestone Goals - Always visible */}
                    <Card padding="lg" className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border-amber-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-amber-600" />
                        <h2 className="font-semibold text-slate-900">Milestone Goals</h2>
                        <span className="text-xs text-slate-500">Excellence rewarded!</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {milestoneRewards.slice(0, 4).map((reward) => {
                          const progress = getProgressToReward(currentPoints, reward.cost);
                          const canAfford = currentPoints >= reward.cost;
                          return (
                            <div
                              key={reward.id}
                              className={cn(
                                'bg-white rounded-xl p-4 border transition-all',
                                canAfford ? 'border-amber-300 shadow-md' : 'border-slate-200'
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">{reward.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-slate-900 text-sm">{reward.title}</h3>
                                  <p className="text-xs text-slate-500 line-clamp-2">{reward.description}</p>
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span className="text-slate-500">{currentPoints} / {reward.cost}</span>
                                      <span className="text-amber-600 font-medium">{progress}%</span>
                                    </div>
                                    <ProgressBar 
                                      value={progress} 
                                      size="sm" 
                                      variant={canAfford ? 'success' : 'warning'} 
                                    />
                                  </div>
                                  {canAfford && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      className="mt-2 w-full"
                                      onClick={() => handleRedeemClick(reward)}
                                    >
                                      Redeem Now!
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    {affordableRewards.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-emerald-700">
                        <Check className="h-4 w-4" />
                        <span>You can afford {affordableRewards.length} reward{affordableRewards.length !== 1 ? 's' : ''}!</span>
                      </div>
                    )}

                    <Card padding="lg">
                      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                        <div>
                          <h2 className="font-semibold text-slate-900">Recent Point Activity</h2>
                          <p className="text-sm text-slate-500">A running trail of what added to the score</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                            {([
                              { id: 'newest', label: 'Newest' },
                              { id: 'day', label: 'Day' },
                              { id: 'task', label: 'Task' },
                            ] as Array<{ id: ActivitySortMode; label: string }>).map((option) => (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setActivitySort(option.id)}
                                className={cn(
                                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                  activitySort === option.id
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                )}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                          <Badge variant="warning">{currentPoints} total</Badge>
                        </div>
                      </div>
                      {recentActivity.length === 0 ? (
                        <p className="text-sm text-slate-500">No point activity recorded yet.</p>
                      ) : (
                        <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                          {activitySort === 'day'
                            ? Object.entries(
                                sortedRecentActivity.reduce<Record<string, LearnerPointActivityItem[]>>((groups, item) => {
                                  const dayLabel = formatActivityDay(item.timestamp);
                                  groups[dayLabel] = groups[dayLabel] || [];
                                  groups[dayLabel].push(item);
                                  return groups;
                                }, {})
                              ).map(([dayLabel, items]) => (
                                <div key={dayLabel}>
                                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    {dayLabel}
                                  </p>
                                  <div className="space-y-3">
                                    {items.map((item) => (
                                      <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <div className="min-w-0">
                                          <p className="font-medium text-slate-900">{item.label}</p>
                                          <p className="text-sm text-slate-500">{item.description}</p>
                                          <p className="mt-1 text-xs text-slate-400">{formatActivityTime(item.timestamp)}</p>
                                        </div>
                                        <span className={cn('text-sm font-bold', item.points >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                                          {item.points >= 0 ? '+' : ''}
                                          {item.points}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            : sortedRecentActivity.map((item) => (
                                <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                  <div className="min-w-0">
                                    <p className="font-medium text-slate-900">{item.label}</p>
                                    <p className="text-sm text-slate-500">{item.description}</p>
                                    <p className="mt-1 text-xs text-slate-400">{formatActivityTime(item.timestamp)}</p>
                                  </div>
                                  <span className={cn('text-sm font-bold', item.points >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                                    {item.points >= 0 ? '+' : ''}
                                    {item.points}
                                  </span>
                                </div>
                              ))}
                        </div>
                      )}
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredRewards.filter(r => r.tier !== 'milestone').map((reward) => {
                        const canAfford = currentPoints >= reward.cost;
                        const tierConfig = TIER_CONFIG[reward.tier];
                        return (
                          <motion.div
                            key={reward.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className={cn(
                              'bg-white border rounded-2xl p-5 transition-all',
                              canAfford
                                ? 'border-emerald-200 shadow-sm hover:shadow-md'
                                : 'border-slate-200 opacity-60'
                            )}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className="text-3xl">{reward.icon}</span>
                              <div className="flex flex-col items-end gap-1">
                                <Badge variant="default" size="sm" className={tierConfig.color}>
                                  {tierConfig.label}
                                </Badge>
                              </div>
                            </div>
                            
                            <h3 className="font-semibold text-slate-900 mb-1">{reward.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">{reward.description}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-amber-600">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-bold">{reward.cost}</span>
                              </div>
                              <Button
                                variant={canAfford ? 'primary' : 'secondary'}
                                size="sm"
                                disabled={!canAfford}
                                onClick={() => handleRedeemClick(reward)}
                                icon={<ShoppingCart className="h-4 w-4" />}
                              >
                                Redeem
                              </Button>
                            </div>

                            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                              {reward.maxRedemptionsPerWeek && (
                                <span>Max {reward.maxRedemptionsPerWeek}x/week</span>
                              )}
                              <span>~{reward.estimatedDaysToEarn} days</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Card padding="lg" className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
                      <div className="flex items-center gap-2 mb-3 text-indigo-700">
                        <Medal className="h-5 w-5" />
                        <h2 className="font-semibold">Badge Guide</h2>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-slate-500">Unlocked</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">{unlockedBadges.length}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-slate-500">Available</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">{ACHIEVEMENTS.length}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-slate-500">Achievement Points</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">{achievementStats.totalPoints}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-slate-500">Current Streak</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">{achievementStats.streakDays}</p>
                        </div>
                      </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {ACHIEVEMENTS.map((achievement) => {
                        const isUnlocked = unlockedAchievementIds.has(achievement.id);
                        const progress = achievementService.getProgress(achievement, achievementStats);
                        return (
                          <div
                            key={achievement.id}
                            className={cn(
                              'rounded-2xl border-2 p-4 transition-all',
                              isUnlocked
                                ? `${RARITY_COLORS[achievement.rarity]} shadow-sm`
                                : 'border-slate-200 bg-white'
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <span className={cn('text-3xl', !isUnlocked && 'grayscale opacity-70')}>{achievement.icon}</span>
                                <div>
                                  <p className="font-semibold text-slate-900">{achievement.title}</p>
                                  <p className="text-sm text-slate-500">{achievement.description}</p>
                                </div>
                              </div>
                              <Badge size="sm" variant="default" className="capitalize">
                                {achievement.rarity}
                              </Badge>
                            </div>
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                <span>{isUnlocked ? 'Unlocked' : 'Progress'}</span>
                                <span>{isUnlocked ? '100%' : `${progress}%`}</span>
                              </div>
                              <ProgressBar value={isUnlocked ? 100 : progress} max={100} size="sm" variant={isUnlocked ? 'success' : 'default'} />
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm">
                              <span className="text-amber-600 font-semibold">+{achievement.points} pts</span>
                              <span className={cn('font-medium', isUnlocked ? 'text-emerald-600' : 'text-slate-400')}>
                                {isUnlocked ? 'Unlocked' : 'Locked'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Redemption Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Redemption"
        size="sm"
      >
        {selectedReward && currentLearner && (
          <div className="text-center">
            <span className="text-5xl block mb-4">{selectedReward.icon}</span>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{selectedReward.title}</h3>
            <p className="text-slate-500 mb-4">{selectedReward.description}</p>
            
            {selectedReward.requiresParentApproval && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-700 flex items-center justify-center gap-2">
                  <span>⚠️</span> Requires parent approval
                </p>
              </div>
            )}
            
            <div className="bg-amber-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-700">
                <span className="font-bold">{currentLearner.name}</span> will spend{' '}
                <span className="font-bold">{selectedReward.cost} points</span>
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Remaining: {currentPoints - selectedReward.cost} points
              </p>
            </div>

            <ModalFooter>
              <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmRedeem} loading={isRedeeming}>
                Confirm
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RewardsPage;
