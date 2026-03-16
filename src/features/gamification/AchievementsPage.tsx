// Achievements Page - Display badges and progress
import React, { useState, useEffect, useCallback } from 'react';
import { useFamily } from '../family/FamilyContext';
import { Card, CardContent, Avatar, ProgressBar } from '../../components/ui';
import { achievementService } from '../../services/achievementService';
import {
  ACHIEVEMENTS,
  RARITY_COLORS,
  type Achievement,
  type LearnerStats,
} from './achievements';

export const AchievementsPage: React.FC = () => {
  const { family } = useFamily();
  const [selectedLearner, setSelectedLearner] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Light mode by default - clean styling

  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<LearnerStats>({
    streakDays: 0,
    blocksCompleted: 0,
    focusMinutes: 0,
    podsCompleted: 0,
    artifactsCreated: 0,
    totalPoints: 0,
    projectsCompleted: 0,
    reflectionsLogged: 0,
    externalSessionsCompleted: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load achievements and stats
  const loadData = useCallback(async () => {
    if (!family || !selectedLearner) return;
    setIsLoading(true);
    try {
      const [learnerStats] = await Promise.all([
        achievementService.getStats(family.id, selectedLearner),
        achievementService.checkAndUnlock(family.id, selectedLearner),
      ]);
      setStats(learnerStats);
      const unlocked = await achievementService.getUnlocked(family.id, selectedLearner);
      setUnlockedIds(new Set(unlocked.map(u => u.achievementId)));
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [family, selectedLearner]);

  useEffect(() => {
    if (family?.learners.length && !selectedLearner) {
      setSelectedLearner(family.learners[0].id);
    }
  }, [family, selectedLearner]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!family) {
    return <div className="p-6 text-center text-slate-500">Please log in to view achievements</div>;
  }

  // Get learner for potential future use (stats display)
  const learner = family.learners.find(l => l.id === selectedLearner);
  const displayStats = learner && stats.streakDays === 0
    ? { ...stats, streakDays: learner.streakDays, totalPoints: learner.points }
    : stats;

  const categories = ['all', 'streak', 'learning', 'exploration', 'mastery', 'special'];
  
  const filteredAchievements = ACHIEVEMENTS.filter(a => {
    if (a.secret && !unlockedIds.has(a.id)) return false;
    if (filter === 'unlocked' && !unlockedIds.has(a.id)) return false;
    if (filter === 'locked' && unlockedIds.has(a.id)) return false;
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    return true;
  });

  const totalUnlocked = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id)).length;
  const totalPoints = ACHIEVEMENTS.filter(a => unlockedIds.has(a.id)).reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Achievements</h1>
        {family.learners.length > 1 && (
          <div className="flex gap-2">
            {family.learners.map(l => (
              <button key={l.id} onClick={() => setSelectedLearner(l.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  selectedLearner === l.id ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 hover:bg-slate-50'
                }`}>
                <Avatar name={l.name} emoji={l.avatar} size="sm" />
                <span className="font-medium text-slate-700">{l.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="text-center py-5 bg-indigo-50 rounded-xl border border-indigo-200">
          <div className="text-3xl font-bold text-indigo-700">{totalUnlocked}</div>
          <div className="text-sm font-medium text-indigo-600 mt-1">Achievements Unlocked</div>
        </CardContent></Card>
        <Card><CardContent className="text-center py-5 bg-amber-50 rounded-xl border border-amber-200">
          <div className="text-3xl font-bold text-amber-700">{totalPoints}</div>
          <div className="text-sm font-medium text-amber-600 mt-1">Achievement Points</div>
        </CardContent></Card>
        <Card><CardContent className="text-center py-5 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="text-3xl font-bold text-emerald-700">{Math.round((totalUnlocked / ACHIEVEMENTS.length) * 100)}%</div>
          <div className="text-sm font-medium text-emerald-600 mt-1">Completion</div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {(['all', 'unlocked', 'locked'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === c ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              isUnlocked={unlockedIds.has(achievement.id)}
              progress={achievementService.getProgress(achievement, displayStats)}
            />
          ))}
        </div>
      )}

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-slate-500">No achievements match your filters</div>
      )}
    </div>
  );
};


// Achievement Card Component
interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isUnlocked, progress }) => {
  const rarityClass = RARITY_COLORS[achievement.rarity];

  return (
    <div className={`relative p-4 rounded-xl border-2 transition-all ${
      isUnlocked 
        ? `${rarityClass} shadow-md` 
        : 'bg-slate-100 border-slate-300'
    }`}>
      {/* Rarity Badge */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
        isUnlocked 
          ? 'bg-white/50' 
          : 'bg-slate-200 text-slate-600'
      }`}>
        {achievement.rarity}
      </div>

      <div className="flex items-start gap-3">
        <div className={`text-4xl ${isUnlocked ? '' : 'grayscale opacity-60'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-base ${
            isUnlocked ? '' : 'text-slate-600'
          }`}>
            {achievement.title}
          </h3>
          <p className={`text-sm mt-1 ${
            isUnlocked 
              ? 'opacity-80' 
              : 'text-slate-500'
          }`}>
            {achievement.description}
          </p>
          
          {!isUnlocked && (
            <div className="mt-3">
              <ProgressBar value={progress} max={100} size="sm" />
              <span className="text-sm font-medium text-slate-600 mt-1 block">{progress}% complete</span>
            </div>
          )}

          {achievement.points > 0 && (
            <div className={`mt-2 text-sm font-bold ${
              isUnlocked ? 'text-amber-700' : 'text-slate-500'
            }`}>
              +{achievement.points} points
            </div>
          )}
        </div>
      </div>

      {isUnlocked && (
        <div className="absolute -top-2 -left-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
