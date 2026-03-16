// Progress Dashboard - Visualize learner progress across pods and competencies
import React, { useState, useEffect } from 'react';
import { useFamily } from '../family/FamilyContext';
import { progressDataService } from '../../services/dataService';
import { Card, CardHeader, CardContent, Badge, ProgressBar, Avatar } from '../../components/ui';
import type { Learner } from '../../types/learner';

interface LearnerStats {
  totalBlocks: number;
  totalMinutes: number;
  totalPoints: number;
  avgBlocksPerDay: number;
  currentStreak: number;
}

interface DailyProgress {
  date: string;
  blocksCompleted: number;
  focusMinutes: number;
  pointsEarned: number;
}

export const ProgressDashboard: React.FC = () => {
  const { family } = useFamily();
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [stats, setStats] = useState<LearnerStats | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<DailyProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Select first learner by default
  useEffect(() => {
    if (family?.learners.length && !selectedLearner) {
      setSelectedLearner(family.learners[0]);
    }
  }, [family, selectedLearner]);

  // Load stats when learner changes
  useEffect(() => {
    if (!family || !selectedLearner) return;

    const loadStats = async () => {
      setIsLoading(true);
      try {
        const [learnerStats, progress] = await Promise.all([
          progressDataService.getStats(family.id, selectedLearner.id),
          progressDataService.getForLearner(family.id, selectedLearner.id, 7),
        ]);
        setStats(learnerStats);
        setWeeklyProgress(progress.map(p => ({
          date: p.date,
          blocksCompleted: p.blocksCompleted || 0,
          focusMinutes: p.totalFocusMinutes || 0,
          pointsEarned: p.pointsEarned || 0,
        })));
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [family, selectedLearner]);

  if (!family) {
    return (
      <div className="p-6 text-center text-slate-500">
        Please log in to view progress
      </div>
    );
  }

  const learners = family.learners;

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Progress Dashboard
        </h1>
        
        {/* Learner Selector */}
        {learners.length > 1 && (
          <div className="flex gap-2">
            {learners.map(learner => (
              <button
                key={learner.id}
                onClick={() => setSelectedLearner(learner)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  selectedLearner?.id === learner.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Avatar name={learner.name} emoji={learner.avatar} size="sm" />
                <span className="font-medium text-slate-700">{learner.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : selectedLearner && stats ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              label="Current Streak"
              value={`${stats.currentStreak} days`}
              icon="🔥"
              color="orange"
            />
            <StatCard
              label="Total Points"
              value={selectedLearner.points.toLocaleString()}
              icon="⭐"
              color="yellow"
            />
            <StatCard
              label="Blocks Completed"
              value={stats.totalBlocks.toString()}
              icon="✅"
              color="green"
            />
            <StatCard
              label="Focus Time"
              value={formatMinutes(stats.totalMinutes)}
              icon="⏱️"
              color="blue"
            />
            <StatCard
              label="Avg/Day"
              value={`${stats.avgBlocksPerDay} blocks`}
              icon="📊"
              color="purple"
            />
          </div>

          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">This Week's Activity</h2>
            </CardHeader>
            <CardContent>
              <WeeklyChart data={weeklyProgress} />
            </CardContent>
          </Card>

          {/* Competency Progress */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Competency Progress</h2>
            </CardHeader>
            <CardContent>
              <CompetencyGrid learnerId={selectedLearner.id} />
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Recent Achievements</h2>
            </CardHeader>
            <CardContent>
              <RecentAchievements learner={selectedLearner} />
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12 text-slate-500">
          {learners.length === 0 
            ? 'Add a learner to start tracking progress'
            : 'Select a learner to view their progress'}
        </div>
      )}
    </div>
  );
};


// Stat Card Component
interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  const colorClasses = {
    orange: 'bg-orange-50 border-orange-200',
    yellow: 'bg-amber-50 border-amber-200',
    green: 'bg-emerald-50 border-emerald-200',
    blue: 'bg-sky-50 border-sky-200',
    purple: 'bg-violet-50 border-violet-200',
  };

  const textClasses = {
    orange: 'text-orange-700',
    yellow: 'text-amber-700',
    green: 'text-emerald-700',
    blue: 'text-sky-700',
    purple: 'text-violet-700',
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <span className={`text-sm font-medium ${textClasses[color]}`}>{label}</span>
      </div>
      <div className={`text-2xl font-bold ${textClasses[color]}`}>{value}</div>
    </div>
  );
};

// Weekly Chart Component
interface WeeklyChartProps {
  data: DailyProgress[];
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  // Create 7-day array with data
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayData = data.find(d => d.date === dateStr);
    return {
      day: days[date.getDay()],
      date: dateStr,
      blocks: dayData?.blocksCompleted || 0,
      minutes: dayData?.focusMinutes || 0,
      isToday: i === 6,
    };
  });

  const maxBlocks = Math.max(...weekData.map(d => d.blocks), 5);

  return (
    <div className="space-y-4">
      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-32">
        {weekData.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col items-center justify-end h-24">
              <div
                className={`w-full max-w-8 rounded-t transition-all ${
                  day.isToday 
                    ? 'bg-indigo-500' 
                    : day.blocks > 0 
                      ? 'bg-indigo-300' 
                      : 'bg-slate-200'
                }`}
                style={{ height: `${(day.blocks / maxBlocks) * 100}%`, minHeight: day.blocks > 0 ? '8px' : '4px' }}
              />
            </div>
            <span className={`text-xs ${day.isToday ? 'font-bold text-indigo-600' : 'text-slate-500'}`}>
              {day.day}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex justify-between text-sm text-slate-600 pt-2 border-t border-slate-200">
        <span>Total: {weekData.reduce((sum, d) => sum + d.blocks, 0)} blocks</span>
        <span>{weekData.reduce((sum, d) => sum + d.minutes, 0)} minutes focused</span>
      </div>
    </div>
  );
};

// Competency Grid Component
const CompetencyGrid: React.FC<{ learnerId: string }> = () => {
  const competencies = [
    { id: 'critical-thinking', name: 'Critical Thinking', progress: 65, icon: '🧠' },
    { id: 'creativity', name: 'Creativity', progress: 78, icon: '🎨' },
    { id: 'communication', name: 'Communication', progress: 52, icon: '💬' },
    { id: 'collaboration', name: 'Collaboration', progress: 70, icon: '🤝' },
    { id: 'stem', name: 'STEM Skills', progress: 85, icon: '🔬' },
    { id: 'digital-literacy', name: 'Digital Literacy', progress: 90, icon: '💻' },
    { id: 'self-direction', name: 'Self-Direction', progress: 60, icon: '🎯' },
    { id: 'global-awareness', name: 'Global Awareness', progress: 45, icon: '🌍' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {competencies.map(comp => (
        <div key={comp.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{comp.icon}</span>
            <span className="text-sm font-semibold text-slate-800 truncate">{comp.name}</span>
          </div>
          <ProgressBar value={comp.progress} max={100} size="sm" />
          <span className="text-sm font-medium text-slate-700 mt-2 block">{comp.progress}%</span>
        </div>
      ))}
    </div>
  );
};

// Recent Achievements Component
const RecentAchievements: React.FC<{ learner: Learner }> = ({ learner: _learner }) => {
  const achievements = [
    { id: '1', title: 'First Week Complete', icon: '🏆', date: '2 days ago', points: 100 },
    { id: '2', title: '7-Day Streak', icon: '🔥', date: '3 days ago', points: 50 },
    { id: '3', title: 'Science Explorer', icon: '🔬', date: '1 week ago', points: 75 },
  ];

  if (achievements.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        Complete activities to earn achievements!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {achievements.map(achievement => (
        <div
          key={achievement.id}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
        >
          <span className="text-2xl">{achievement.icon}</span>
          <div className="flex-1">
            <div className="font-semibold text-amber-900">{achievement.title}</div>
            <div className="text-sm text-amber-700">{achievement.date}</div>
          </div>
          <Badge variant="warning">+{achievement.points} pts</Badge>
        </div>
      ))}
    </div>
  );
};

// Helper function
function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default ProgressDashboard;
