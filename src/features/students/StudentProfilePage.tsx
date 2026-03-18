import React, { useEffect, useMemo, useState } from 'react';
import { Clock, FileText, Folder, Target, TrendingUp, Trophy } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useFamily } from '../family';
import { useAuth } from '../auth';
import type { Learner } from '../../types/learner';
import type { Artifact } from '../../types/artifact';
import type { LearnerCompetency } from '../../types/competency';
import { COMPETENCY_DOMAINS, getCompetencyProgress } from '../../types/competency';
import { portfolioService, competencyService } from '../../services/portfolioService';
import { progressDataService } from '../../services/dataService';
import { scheduleService } from '../../services/scheduleService';
import { foundationalRailService } from '../../services/foundationalRailService';
import { achievementService } from '../../services/achievementService';
import { syncLearnerPointsBalance } from '../../services/pointsBalanceService';
import { planningRuleDataService, projectDataService, projectStepDataService } from '../../services/learningRecordsService';
import {
  ACHIEVEMENTS,
  RARITY_COLORS,
  type LearnerStats as AchievementStats,
} from '../gamification/achievements';
import type { LearningProject, ProjectStep } from '../../types/learning';

type ProfileTab = 'overview' | 'portfolio' | 'projects' | 'achievements' | 'progress';

interface LearnerSummary {
  weeklyPoints: number;
  portfolioCount: number;
}

interface ProgressStats {
  totalBlocks: number;
  totalMinutes: number;
  totalPoints: number;
  avgBlocksPerDay: number;
  currentStreak: number;
}

const EMPTY_STATS: ProgressStats = {
  totalBlocks: 0,
  totalMinutes: 0,
  totalPoints: 0,
  avgBlocksPerDay: 0,
  currentStreak: 0,
};

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

const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <Card className="p-6 text-center text-slate-500">
    <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm">{description}</p>
  </Card>
);

interface StudentCardProps {
  learner: Learner;
  isSelected: boolean;
  onClick: () => void;
  weeklyPoints?: number;
  portfolioCount?: number;
}

const StudentCard: React.FC<StudentCardProps> = ({
  learner,
  isSelected,
  onClick,
  weeklyPoints = 0,
  portfolioCount = 0,
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex flex-col items-center p-4 rounded-xl border-2 transition-all min-w-[140px]',
      isSelected ? 'border-slate-900 bg-white shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300'
    )}
  >
    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-500 text-white text-2xl font-bold mb-2">
      {learner.name.charAt(0)}
    </div>
    <span className="font-semibold text-slate-900">{learner.name}</span>
    <span className="text-xs text-slate-500">Age {learner.age} • {learner.skillLevel}</span>
    <div className="flex items-center gap-1 mt-2">
      <span className="text-yellow-500">⭐</span>
      <span className="text-sm font-medium text-slate-700">{learner.points} points</span>
    </div>
    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1">
      +{weeklyPoints} this week
    </span>
    <span className="text-xs text-slate-400 mt-1">{portfolioCount} portfolio items</span>
  </button>
);

const OverviewTab: React.FC<{
  learner: Learner;
  artifacts: Artifact[];
  competencies: LearnerCompetency[];
  stats: ProgressStats;
  currentMathsTrackTitle?: string | null;
  currentMathsTrackSummary?: string | null;
  currentMathsModuleTitle?: string | null;
}> = ({
  learner,
  artifacts,
  competencies,
  stats,
  currentMathsTrackTitle,
  currentMathsTrackSummary,
  currentMathsModuleTitle,
}) => {
  const todaySchedule = scheduleService.getDailySchedule(
    learner.id,
    new Date().toISOString().split('T')[0]
  );
  const recentArtifacts = artifacts.slice(0, 3);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{learner.points}</p>
            <p className="text-xs text-slate-600">Total Points</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.currentStreak}</p>
            <p className="text-xs text-slate-600">Current Streak</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{artifacts.length}</p>
            <p className="text-xs text-slate-600">Portfolio Items</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">{competencies.length}</p>
            <p className="text-xs text-slate-600">Assessed Skills</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
        {recentArtifacts.length === 0 ? (
          <p className="text-sm text-slate-500">No live portfolio evidence yet.</p>
        ) : (
          <div className="space-y-3">
            {recentArtifacts.map((artifact) => (
              <div key={artifact.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                <span className="text-xl">📁</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{artifact.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(artifact.createdAt).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Current Maths Rail</h3>
        {currentMathsTrackTitle ? (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="info">{currentMathsTrackTitle}</Badge>
              {currentMathsModuleTitle && <Badge variant="default">{currentMathsModuleTitle}</Badge>}
            </div>
            <p className="text-sm text-slate-600">
              {currentMathsModuleTitle
                ? `Active module: ${currentMathsModuleTitle}`
                : currentMathsTrackSummary || 'Maths rail assigned and ready to guide the daily maths sessions.'}
            </p>
            {currentMathsTrackSummary && (
              <p className="text-xs text-slate-500 mt-2">{currentMathsTrackSummary}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500">No maths rail assigned yet.</p>
        )}
      </Card>

      <Card className="p-5 md:col-span-2">
        <h3 className="font-semibold text-slate-900 mb-4">Current Learning Focus</h3>
        {!todaySchedule ? (
          <p className="text-sm text-slate-500">
            No live schedule for today yet. Create one from the dashboard or daily calendar view.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge>Today&apos;s Schedule</Badge>
              <Badge>{todaySchedule.completedBlocks}/{todaySchedule.blocks.length} blocks complete</Badge>
              <Badge variant="success">{todaySchedule.energyLevel} energy plan</Badge>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Day Progress</span>
                <span className="font-medium">
                  {todaySchedule.blocks.length > 0
                    ? Math.round((todaySchedule.completedBlocks / todaySchedule.blocks.length) * 100)
                    : 0}
                  %
                </span>
              </div>
              <ProgressBar
                value={
                  todaySchedule.blocks.length > 0
                    ? Math.round((todaySchedule.completedBlocks / todaySchedule.blocks.length) * 100)
                    : 0
                }
                max={100}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

const PortfolioTab: React.FC<{ artifacts: Artifact[] }> = ({ artifacts }) => {
  if (artifacts.length === 0) {
    return (
      <EmptyState
        title="No portfolio work yet"
        description="Artifacts added in the portfolio flow will appear here automatically."
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-900">Learning Portfolio</h3>
        <span className="text-sm text-slate-500">{artifacts.length} items collected</span>
      </div>
      <div className="space-y-4">
        {artifacts.map((artifact) => (
          <Card key={artifact.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📁</span>
                <div>
                  <h4 className="font-semibold text-slate-900">{artifact.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {new Date(artifact.createdAt).toLocaleDateString('en-US')}
                    </span>
                    {artifact.url && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Linked evidence
                      </span>
                    )}
                  </div>
                  {artifact.description && (
                    <p className="text-sm text-slate-600 mt-2">{artifact.description}</p>
                  )}
                  {artifact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {artifact.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ProjectsTab: React.FC<{
  learner: Learner;
  projects: LearningProject[];
  projectSteps: Record<string, ProjectStep[]>;
  onCreateProject: (input: {
    title: string;
    summary?: string;
    source: LearningProject['source'];
    targetDate?: string;
  }) => Promise<void>;
  onAddStep: (projectId: string, title: string) => Promise<void>;
  onToggleStep: (step: ProjectStep) => Promise<void>;
}> = ({ learner, projects, projectSteps, onCreateProject, onAddStep, onToggleStep }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [source, setSource] = useState<LearningProject['source']>('pod');
  const [targetDate, setTargetDate] = useState('');
  const [stepDrafts, setStepDrafts] = useState<Record<string, string>>({});

  const handleCreate = async () => {
    if (!title.trim()) {
      return;
    }

    await onCreateProject({
      title: title.trim(),
      summary: summary.trim() || undefined,
      source,
      targetDate: targetDate || undefined,
    });

    setTitle('');
    setSummary('');
    setSource('pod');
    setTargetDate('');
  };

  if (projects.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Start a live project</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Project title"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
            <select
              value={source}
              onChange={(event) => setSource(event.target.value as LearningProject['source'])}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            >
              <option value="pod">Pod project</option>
              <option value="side-quest">Side quest</option>
              <option value="external-tool">External tool build</option>
              <option value="custom">Custom project</option>
            </select>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="What is the goal or challenge?"
              className="md:col-span-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 min-h-[88px]"
            />
            <input
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
            <Button onClick={() => void handleCreate()}>Create Project</Button>
          </div>
        </Card>
        <EmptyState
          title="No live projects yet"
          description={`${learner.name} can start with a pod build, side quest, or external-tool challenge here.`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-3">New project</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Project title"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
          />
          <select
            value={source}
            onChange={(event) => setSource(event.target.value as LearningProject['source'])}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
          >
            <option value="pod">Pod project</option>
            <option value="side-quest">Side quest</option>
            <option value="external-tool">External tool build</option>
            <option value="custom">Custom project</option>
          </select>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Goal, problem to solve, or build idea"
            className="md:col-span-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 min-h-[88px]"
          />
          <input
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
          />
          <Button onClick={() => void handleCreate()}>Create Project</Button>
        </div>
      </Card>

      {projects.map((project) => {
        const steps = projectSteps[project.id] || [];
        const completedSteps = steps.filter((step) => step.status === 'completed').length;

        return (
          <Card key={project.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900">{project.title}</h3>
                  <Badge variant="default">{project.status}</Badge>
                  <Badge variant="info">{project.source}</Badge>
                </div>
                {project.summary && (
                  <p className="text-sm text-slate-600 mt-2">{project.summary}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-3">
                  <span>{completedSteps}/{steps.length || 0} steps complete</span>
                  {project.targetDate && (
                    <span>Target: {new Date(project.targetDate).toLocaleDateString('en-US')}</span>
                  )}
                  {project.lastWorkedAt && (
                    <span>Last worked: {new Date(project.lastWorkedAt).toLocaleDateString('en-US')}</span>
                  )}
                </div>
              </div>
              <div className="min-w-[140px]">
                <ProgressBar value={completedSteps} max={steps.length || 1} />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {steps.length === 0 ? (
                <p className="text-sm text-slate-500">No steps yet. Add the first next action below.</p>
              ) : (
                steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => void onToggleStep(step)}
                    className="w-full text-left flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
                  >
                    <span className={cn(
                      'mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs',
                      step.status === 'completed'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 text-slate-400'
                    )}>
                      {step.status === 'completed' ? '✓' : ''}
                    </span>
                    <div>
                      <p className={cn('text-sm font-medium', step.status === 'completed' && 'line-through text-slate-400')}>
                        {step.title}
                      </p>
                      {step.description && <p className="text-xs text-slate-500 mt-1">{step.description}</p>}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={stepDrafts[project.id] || ''}
                onChange={(event) =>
                  setStepDrafts((current) => ({ ...current, [project.id]: event.target.value }))
                }
                placeholder="Add the next project step"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
              <Button
                variant="secondary"
                onClick={() => {
                  const nextTitle = stepDrafts[project.id]?.trim();
                  if (!nextTitle) {
                    return;
                  }

                  void onAddStep(project.id, nextTitle);
                  setStepDrafts((current) => ({ ...current, [project.id]: '' }));
                }}
              >
                Add Step
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const AchievementsTab: React.FC<{
  unlockedIds: Set<string>;
  stats: AchievementStats;
}> = ({ unlockedIds, stats }) => {
  const unlockedAchievements = ACHIEVEMENTS.filter((achievement) => unlockedIds.has(achievement.id));
  const nextAchievements = ACHIEVEMENTS.filter((achievement) => !unlockedIds.has(achievement.id) && !achievement.secret)
    .sort((left, right) => achievementService.getProgress(right, stats) - achievementService.getProgress(left, stats))
    .slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 text-center bg-indigo-50">
          <p className="text-2xl font-bold text-indigo-700">{unlockedAchievements.length}</p>
          <p className="text-xs text-indigo-600">Unlocked</p>
        </Card>
        <Card className="p-4 text-center bg-amber-50">
          <p className="text-2xl font-bold text-amber-700">{stats.projectsCompleted}</p>
          <p className="text-xs text-amber-600">Projects Finished</p>
        </Card>
        <Card className="p-4 text-center bg-emerald-50">
          <p className="text-2xl font-bold text-emerald-700">{stats.reflectionsLogged}</p>
          <p className="text-xs text-emerald-600">Reflections Logged</p>
        </Card>
        <Card className="p-4 text-center bg-cyan-50">
          <p className="text-2xl font-bold text-cyan-700">{stats.externalSessionsCompleted}</p>
          <p className="text-xs text-cyan-600">External Sessions</p>
        </Card>
      </div>

      {unlockedAchievements.length === 0 ? (
        <EmptyState
          title="No achievements unlocked yet"
          description="Achievements now unlock from real project, reflection, progress, and external-session data."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {unlockedAchievements.map((achievement) => (
            <Card key={achievement.id} className={`p-4 border ${RARITY_COLORS[achievement.rarity]}`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{achievement.icon}</span>
                <div>
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm opacity-80 mt-1">{achievement.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {nextAchievements.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Next up</h3>
          <div className="space-y-4">
            {nextAchievements.map((achievement) => (
              <div key={achievement.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700">{achievement.icon} {achievement.title}</span>
                  <span className="text-slate-500">{achievementService.getProgress(achievement, stats)}%</span>
                </div>
                <ProgressBar value={achievementService.getProgress(achievement, stats)} max={100} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

const ProgressTab: React.FC<{
  competencies: LearnerCompetency[];
  stats: ProgressStats;
}> = ({ competencies, stats }) => {
  if (competencies.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="No competency assessments yet"
          description="Competency updates from the portfolio flow will appear here once evidence-backed assessments are added."
        />
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Live Progress Snapshot</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{stats.totalBlocks}</p>
              <p className="text-xs text-slate-500">Blocks Completed</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{formatMinutes(stats.totalMinutes)}</p>
              <p className="text-xs text-slate-500">Focus Time</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{stats.totalPoints}</p>
              <p className="text-xs text-slate-500">Earned Points</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{stats.avgBlocksPerDay}</p>
              <p className="text-xs text-slate-500">Avg Active Day</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold text-slate-900 mb-4">Skill Development</h3>
      <Card className="p-5">
        <div className="space-y-5">
          {competencies.map((competency) => {
            const config = COMPETENCY_DOMAINS[competency.domain];
            const progress = getCompetencyProgress(competency.level);

            return (
              <div key={competency.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700">
                    {config.icon} {config.label}
                  </span>
                  <span className="font-medium text-slate-900">{progress}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all bg-slate-900"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export const StudentProfilePage: React.FC = () => {
  const { family } = useFamily();
  const { currentLearnerId, isLearner } = useAuth();
  const learners = useMemo(
    () =>
      isLearner
        ? (family?.learners ?? []).filter((learner) => learner.id === currentLearnerId)
        : family?.learners ?? [],
    [currentLearnerId, family?.learners, isLearner]
  );
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [summaries, setSummaries] = useState<Record<string, LearnerSummary>>({});
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [competencies, setCompetencies] = useState<LearnerCompetency[]>([]);
  const [stats, setStats] = useState<ProgressStats>(EMPTY_STATS);
  const [projects, setProjects] = useState<LearningProject[]>([]);
  const [projectSteps, setProjectSteps] = useState<Record<string, ProjectStep[]>>({});
  const [achievementStats, setAchievementStats] = useState<AchievementStats>(EMPTY_ACHIEVEMENT_STATS);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<Set<string>>(new Set());

  const selectedLearner = learners.find((learner) => learner.id === selectedLearnerId) || learners[0] || null;
  const selectedLearnerTodaySchedule = selectedLearner
    ? scheduleService.getDailySchedule(selectedLearner.id, new Date().toISOString().split('T')[0])
    : null;
  const selectedLearnerMathsBlock =
    selectedLearnerTodaySchedule?.blocks.find((block) => block.railId === 'maths') || null;
  const selectedLearnerMathsTrack =
    selectedLearnerMathsBlock?.railTrackId
      ? foundationalRailService.getTrackById(selectedLearnerMathsBlock.railTrackId) || null
      : selectedLearner && family
        ? (() => {
            const assignment = foundationalRailService.getAssignment(family.id, selectedLearner.id, 'maths');
            if (assignment?.trackId) {
              return foundationalRailService.getTrackById(assignment.trackId) || null;
            }
            return foundationalRailService.getTrackForSkillLevel('maths', selectedLearner.skillLevel) || null;
          })()
        : null;
  const selectedLearnerMathsModule =
    selectedLearnerMathsBlock?.railTrackId && selectedLearnerMathsBlock?.railModuleId
      ? foundationalRailService.getModule(
          selectedLearnerMathsBlock.railTrackId,
          selectedLearnerMathsBlock.railModuleId
        ) || null
      : null;

  useEffect(() => {
    if (!learners.length) {
      setSelectedLearnerId('');
      return;
    }

    if (isLearner && currentLearnerId) {
      setSelectedLearnerId(currentLearnerId);
      return;
    }

    if (!selectedLearnerId || !learners.some((learner) => learner.id === selectedLearnerId)) {
      setSelectedLearnerId(learners[0].id);
    }
  }, [currentLearnerId, isLearner, learners, selectedLearnerId]);

  useEffect(() => {
    if (!family || !learners.length) {
      setSummaries({});
      return;
    }

    const loadSummaries = async () => {
      const entries = await Promise.all(
        learners.map(async (learner) => {
          const [learnerArtifacts, weeklyProgress] = await Promise.all([
            portfolioService.getLearnerPortfolioArtifacts(learner.id),
            progressDataService.getForLearner(family.id, learner.id, 7),
          ]);

          return [
            learner.id,
            {
              portfolioCount: learnerArtifacts.length,
              weeklyPoints: weeklyProgress.reduce(
                (sum, entry) => sum + (entry.pointsEarned || 0),
                0
              ),
            },
          ] as const;
        })
      );

      setSummaries(Object.fromEntries(entries));
    };

    void loadSummaries();
  }, [family, learners]);

  useEffect(() => {
    if (!family || !selectedLearner) {
      setArtifacts([]);
      setCompetencies([]);
      setStats(EMPTY_STATS);
      setProjects([]);
      setProjectSteps({});
      setAchievementStats(EMPTY_ACHIEVEMENT_STATS);
      setUnlockedAchievementIds(new Set());
      return;
    }

    const loadLearnerData = async () => {
      setIsLoading(true);

      try {
        await syncLearnerPointsBalance(family.id, selectedLearner.id);

        const [nextArtifacts, nextCompetencies, nextStats, nextProjects, nextAchievementStats] = await Promise.all([
          portfolioService.getLearnerPortfolioArtifacts(selectedLearner.id),
          competencyService.getCompetencies(selectedLearner.id),
          progressDataService.getStats(family.id, selectedLearner.id),
          projectDataService.getByLearner(selectedLearner.id),
          achievementService.getStats(family.id, selectedLearner.id),
          achievementService.checkAndUnlock(family.id, selectedLearner.id),
        ]);
        const unlocked = await achievementService.getUnlocked(family.id, selectedLearner.id);
        const nextProjectSteps = Object.fromEntries(
          await Promise.all(
            nextProjects.map(async (project) => [project.id, await projectStepDataService.getByProject(project.id)] as const)
          )
        );

        setArtifacts(
          [...nextArtifacts].sort(
            (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
          )
        );
        setCompetencies(nextCompetencies);
        setStats(nextStats);
        setProjects(nextProjects);
        setProjectSteps(nextProjectSteps);
        setAchievementStats(nextAchievementStats);
        setUnlockedAchievementIds(new Set(unlocked.map((entry) => entry.achievementId)));
      } finally {
        setIsLoading(false);
      }
    };

    void loadLearnerData();
  }, [family, selectedLearner]);

  const handleCreateProject = async (input: {
    title: string;
    summary?: string;
    source: LearningProject['source'];
    targetDate?: string;
  }) => {
    if (!family || !selectedLearner) {
      return;
    }

    const timestamp = new Date().toISOString();
    const activeDate = timestamp.split('T')[0];
    const learnerRule = planningRuleDataService.getCachedActiveForLearner(family.id, selectedLearner.id, activeDate);
    const hasFamilyLearnerRules = planningRuleDataService.getCachedActiveForFamily(family.id, activeDate).length > 0;
    const learnerActivePodId =
      learnerRule?.primaryPodId || (hasFamilyLearnerRules ? undefined : family.currentPodId);
    const savedProject = await projectDataService.save({
      id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      familyId: family.id,
      learnerId: selectedLearner.id,
      podId: learnerActivePodId || undefined,
      title: input.title,
      summary: input.summary,
      status: 'planned',
      source: input.source,
      skillLevel: selectedLearner.skillLevel,
      challengeLevel: 'core',
      startDate: timestamp.split('T')[0],
      targetDate: input.targetDate,
      externalPlatformIds: [],
      tags: [],
      artifactIds: [],
      reflectionIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    setProjects((current) => [savedProject, ...current.filter((project) => project.id !== savedProject.id)]);
    setProjectSteps((current) => ({ ...current, [savedProject.id]: current[savedProject.id] || [] }));
  };

  const handleAddProjectStep = async (projectId: string, title: string) => {
    if (!family || !selectedLearner) {
      return;
    }

    const currentSteps = projectSteps[projectId] || [];
    const timestamp = new Date().toISOString();
    const savedStep = await projectStepDataService.save({
      id: `project-step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      familyId: family.id,
      learnerId: selectedLearner.id,
      projectId,
      title,
      status: 'planned',
      orderIndex: currentSteps.length + 1,
      evidenceArtifactIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    setProjectSteps((current) => ({
      ...current,
      [projectId]: [...(current[projectId] || []), savedStep].sort((left, right) => left.orderIndex - right.orderIndex),
    }));
  };

  const handleToggleProjectStep = async (step: ProjectStep) => {
    const nextStatus = step.status === 'completed' ? 'planned' : 'completed';
    const updatedStep = await projectStepDataService.save({
      ...step,
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    });

    const nextSteps = {
      ...projectSteps,
      [step.projectId]: (projectSteps[step.projectId] || []).map((entry) =>
        entry.id === step.id ? updatedStep : entry
      ),
    };
    setProjectSteps(nextSteps);

    const relatedProject = projects.find((project) => project.id === step.projectId);
    if (!relatedProject || !selectedLearner) {
      return;
    }

    const allCompleted = (nextSteps[step.projectId] || []).every((entry) => entry.status === 'completed');
    const savedProject = await projectDataService.touch(step.projectId, selectedLearner.id, {
      status: allCompleted ? 'completed' : 'active',
      completedAt: allCompleted ? new Date().toISOString() : undefined,
      lastWorkedAt: new Date().toISOString(),
    });

    if (savedProject) {
      setProjects((current) =>
        current.map((project) => (project.id === savedProject.id ? savedProject : project))
      );
      if (family) {
        await syncLearnerPointsBalance(family.id, selectedLearner.id);
      }
    }
  };

  const tabs: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'portfolio', label: 'Portfolio', icon: Folder },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  if (learners.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <span className="text-4xl mb-4 block">👨‍👩‍👧‍👦</span>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Students Yet</h2>
          <p className="text-slate-500">Add learners in Settings to see their profiles.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6">
        {learners.map((learner) => (
          <StudentCard
            key={learner.id}
            learner={learner}
            isSelected={selectedLearnerId === learner.id}
            onClick={() => setSelectedLearnerId(learner.id)}
            weeklyPoints={summaries[learner.id]?.weeklyPoints || 0}
            portfolioCount={summaries[learner.id]?.portfolioCount || 0}
          />
        ))}
      </div>

      {selectedLearner && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {selectedLearner.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{selectedLearner.name}&apos;s Profile</h2>
                <p className="text-sm text-slate-500">Age {selectedLearner.age} • {selectedLearner.skillLevel}</p>
              </div>
            </div>
            <Badge variant="default">Live data mode</Badge>
          </div>

          <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-500">Loading learner data...</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  learner={selectedLearner}
                  artifacts={artifacts}
                  competencies={competencies}
                  stats={stats}
                  currentMathsTrackTitle={selectedLearnerMathsTrack?.title || null}
                  currentMathsTrackSummary={selectedLearnerMathsTrack?.description || null}
                  currentMathsModuleTitle={selectedLearnerMathsModule?.title || null}
                />
              )}
              {activeTab === 'portfolio' && <PortfolioTab artifacts={artifacts} />}
              {activeTab === 'projects' && selectedLearner && (
                <ProjectsTab
                  learner={selectedLearner}
                  projects={projects}
                  projectSteps={projectSteps}
                  onCreateProject={handleCreateProject}
                  onAddStep={handleAddProjectStep}
                  onToggleStep={handleToggleProjectStep}
                />
              )}
              {activeTab === 'achievements' && (
                <AchievementsTab
                  unlockedIds={unlockedAchievementIds}
                  stats={achievementStats}
                />
              )}
              {activeTab === 'progress' && <ProgressTab competencies={competencies} stats={stats} />}
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default StudentProfilePage;
