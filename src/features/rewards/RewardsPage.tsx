import React, { useState } from 'react';
import { Gift, Star, Check, ShoppingCart, Trophy, Clock, Sparkles } from 'lucide-react';
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
import { rewardRedemptionDataService } from '../../services/dataService';
import { syncLearnerPointsBalance } from '../../services/pointsBalanceService';
import { 
  DEFAULT_REWARDS, 
  getAffordableRewards, 
  getMilestoneRewards,
  getProgressToReward,
  type ExtendedReward,
  type RewardTier 
} from '../../data/rewards';

const TIER_CONFIG: Record<RewardTier, { label: string; color: string; icon: React.ReactNode }> = {
  daily: { label: 'Daily', color: 'bg-emerald-100 text-emerald-700', icon: <Clock className="h-3 w-3" /> },
  weekly: { label: 'Weekly', color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3 w-3" /> },
  monthly: { label: 'Monthly', color: 'bg-purple-100 text-purple-700', icon: <Trophy className="h-3 w-3" /> },
  milestone: { label: 'Milestone', color: 'bg-amber-100 text-amber-700', icon: <Sparkles className="h-3 w-3" /> },
};

export const RewardsPage: React.FC = () => {
  const { family, deductPoints } = useFamily();
  const [selectedLearner, setSelectedLearner] = useState<string>(family?.learners[0]?.id || '');
  const [selectedReward, setSelectedReward] = useState<ExtendedReward | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [filterTier, setFilterTier] = useState<RewardTier | 'all'>('all');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const learners = family?.learners || [];
  const currentLearner = learners.find((l) => l.id === selectedLearner);
  const currentPoints = currentLearner?.points || 0;

  const filteredRewards = DEFAULT_REWARDS.filter((r) => {
    if (!r.isAvailable) return false;
    if (filterTier !== 'all' && r.tier !== filterTier) return false;
    return true;
  });

  const affordableRewards = getAffordableRewards(currentPoints);
  const milestoneRewards = getMilestoneRewards();

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
      await syncLearnerPointsBalance(family.id, currentLearner.id);

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
                          {learner.points} points
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

                {/* Affordable Rewards Highlight */}
                {affordableRewards.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <Check className="h-4 w-4" />
                    <span>You can afford {affordableRewards.length} reward{affordableRewards.length !== 1 ? 's' : ''}!</span>
                  </div>
                )}

                {/* Rewards Grid */}
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
