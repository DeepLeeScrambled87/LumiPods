import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  CheckCircle,
  Clock,
  Flame,
  Star,
  Calendar,
  BookOpen,
  Pause,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '../../lib/cn';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { useFamily } from '../family';
import { useAuth } from '../auth/AuthContext';
import { getPodById } from '../../data/pods';
import { getCurrentMonthPod, getNextPod } from '../../data/yearlyPods';
import { formatDate, getDayName } from '../../lib/dates';
import { resolveLearnerBanner } from '../../lib/learnerAvatars';
import { finalizeBlockCompletion } from '../../services/blockCompletionService';
import { launchTrackedExternalSession } from '../../services/externalProgressSyncService';
import { foundationalRailService } from '../../services/foundationalRailService';
import { planningRuleDataService } from '../../services/learningRecordsService';
import { scheduleService } from '../../services/scheduleService';
import { syncScheduleProgress } from '../../services/scheduleProgressSync';
import type { BlockCompletionDetails, DailySchedule, ScheduleBlock } from '../../types/schedule';
import { BlockDetailsModal } from '../calendar/BlockDetailsModal';
import { ScheduleBlockCard } from '../calendar/ScheduleBlockCard';

const DELAY_OPTIONS = [
  { label: '15 minutes', minutes: 15 },
  { label: '30 minutes', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: 'After lunch', minutes: 180 },
  { label: 'End of day', minutes: 480 },
];

const ACTIONABLE_STATUSES = new Set<ScheduleBlock['status']>([
  'scheduled',
  'ready',
  'paused',
  'rescheduled',
]);

const toDisplayTime = (time: string): string =>
  new Date(`2000-01-01T${time}:00`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const getCompletionPercentage = (schedule: DailySchedule | null): number => {
  if (!schedule) return 0;
  const trackedBlocks = schedule.blocks.filter((block) => block.type !== 'break');
  if (trackedBlocks.length === 0) return 0;
  const completed = trackedBlocks.filter((block) => block.status === 'completed').length;
  return Math.round((completed / trackedBlocks.length) * 100);
};

const formatCountdown = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const getBlockTimerSnapshot = (block: ScheduleBlock, nowMs: number) => {
  const totalSeconds = block.timerInitialSeconds ?? block.duration * 60;
  const remainingSeconds = scheduleService.getBlockRemainingSeconds(block, new Date(nowMs));
  const elapsedSeconds = Math.max(0, totalSeconds - remainingSeconds);
  const progressPercent = totalSeconds > 0 ? Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 100)) : 0;

  return {
    totalSeconds,
    remainingSeconds,
    elapsedSeconds,
    progressPercent,
    remainingLabel: formatCountdown(remainingSeconds),
  };
};

export const DashboardPage: React.FC = () => {
  const { family } = useFamily();
  const { isLearner, currentLearnerId } = useAuth();
  const learners = useMemo(() => family?.learners ?? [], [family?.learners]);
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0];
  const currentPod = getCurrentMonthPod();
  const nextPod = getNextPod();

  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [dailySchedule, setDailySchedule] = useState<DailySchedule | null>(null);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [blockToDelay, setBlockToDelay] = useState<ScheduleBlock | null>(null);
  const [showMaterialsPreview, setShowMaterialsPreview] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(null);
  const [showBlockDetails, setShowBlockDetails] = useState(false);
  const [timerNow, setTimerNow] = useState(() => Date.now());

  const selectedLearner = learners.find((learner) => learner.id === selectedLearnerId) || learners[0] || null;
  const selectedLearnerRule =
    selectedLearner && family
      ? planningRuleDataService.getCachedActiveForLearner(family.id, selectedLearner.id, dateKey)
      : null;
  const hasFamilyLearnerRules = family
    ? planningRuleDataService.getCachedActiveForFamily(family.id, dateKey).length > 0
    : false;
  const activePodId =
    selectedLearner && family
      ? selectedLearnerRule?.primaryPodId || (hasFamilyLearnerRules ? null : family.currentPodId)
      : family?.currentPodId || null;
  const activePod = activePodId ? getPodById(activePodId) || null : null;

  useEffect(() => {
    if (!learners.length) {
      setSelectedLearnerId('');
      return;
    }

    if (isLearner && currentLearnerId && learners.some((learner) => learner.id === currentLearnerId)) {
      setSelectedLearnerId(currentLearnerId);
      return;
    }

    if (!selectedLearnerId || !learners.some((learner) => learner.id === selectedLearnerId)) {
      setSelectedLearnerId(learners[0].id);
    }
  }, [currentLearnerId, isLearner, learners, selectedLearnerId]);

  useEffect(() => {
    if (!selectedLearner || !family) {
      setDailySchedule(null);
      return;
    }

    setDailySchedule(
      scheduleService.ensureDailySchedule(
        selectedLearner.id,
        dateKey,
        family.id,
        activePodId || undefined,
        family.currentWeek,
        selectedLearner.skillLevel
      )
    );
  }, [activePodId, dateKey, family, selectedLearner]);

  useEffect(() => {
    const activeBlock = dailySchedule?.blocks.find((block) => block.status === 'in-progress');
    if (!activeBlock) {
      return;
    }

    setTimerNow(Date.now());
    const intervalId = window.setInterval(() => {
      setTimerNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [dailySchedule]);

  const loadSelectedSchedule = (): DailySchedule | null => {
    if (!selectedLearner || !family) {
      setDailySchedule(null);
      return null;
    }

    const nextSchedule = scheduleService.ensureDailySchedule(
      selectedLearner.id,
      dateKey,
      family.id,
      activePodId || undefined,
      family.currentWeek,
      selectedLearner.skillLevel
    );
    setDailySchedule(nextSchedule);
    return nextSchedule;
  };

  const createTodaySchedule = () => {
    if (!family || !selectedLearner) return;

    const hasExistingSchedule = Boolean(scheduleService.getDailySchedule(selectedLearner.id, dateKey));
    const nextSchedule = hasExistingSchedule
      ? scheduleService.regenerateDailySchedule(
          selectedLearner.id,
          dateKey,
          family.id,
          activePodId || undefined,
          family.currentWeek,
          selectedLearner.skillLevel
        )
      : scheduleService.ensureDailySchedule(
          selectedLearner.id,
          dateKey,
          family.id,
          activePodId || undefined,
          family.currentWeek,
          selectedLearner.skillLevel
        );

    setDailySchedule(nextSchedule);
    toast.success(
      hasExistingSchedule
        ? `Refreshed today's schedule for ${selectedLearner.name}`
        : `Created today's schedule for ${selectedLearner.name}`
    );
  };

  const launchBlock = async (block: ScheduleBlock) => {
    if (!selectedLearner || !family || !block.launchUrl) {
      return;
    }

    const isTrackedExternal = block.type === 'external' || block.source === 'external';
    if (!isTrackedExternal) {
      window.open(block.launchUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    await launchTrackedExternalSession({
      familyId: family.id,
      learnerId: selectedLearner.id,
      learnerName: selectedLearner.name,
      date: dateKey,
      title: block.title,
      platformId: block.externalPlatformId || block.id,
      platformName: block.externalPlatformName || block.title,
      launchUrl: block.launchUrl,
      durationMinutes: block.duration,
      description: block.description,
      scheduledStartTime: block.startTime,
      projectId: block.projectId,
      blockId: block.id,
      notes: block.notes,
      tags: block.relatedPodIds || [],
    });

    loadSelectedSchedule();
    toast.success(`Opened ${block.externalPlatformName || block.title} and started tracking`);
  };

  const startBlock = async (block: ScheduleBlock) => {
    if (!selectedLearner) return;

    if (block.launchUrl && (block.type === 'external' || block.source === 'external')) {
      await launchBlock(block);
      return;
    }

    const currentBlock = scheduleService
      .getDailySchedule(selectedLearner.id, dateKey)
      ?.blocks.find((item) => item.id === block.id);
    const updated = currentBlock?.status === 'rescheduled'
      ? scheduleService.resumeBlock(selectedLearner.id, dateKey, block.id)
      : scheduleService.startBlock(selectedLearner.id, dateKey, block.id);
    if (updated) {
      loadSelectedSchedule();
      toast.success(`Started "${updated.title}"`);
    }
  };

  const completeBlock = async (blockId: string, details?: BlockCompletionDetails) => {
    if (!selectedLearner || !family) return;

    const updated = scheduleService.completeBlock(
      selectedLearner.id,
      dateKey,
      blockId,
      undefined,
      details?.notes
    );
    if (!updated) return;

    await finalizeBlockCompletion({
      familyId: family.id,
      learnerId: selectedLearner.id,
      date: dateKey,
      block: updated,
      details,
    });

    const nextSchedule = loadSelectedSchedule();
    if (nextSchedule) {
      await syncScheduleProgress(nextSchedule);
    }

    toast.success('Block completed');
  };

  const handleDelayBlock = (block: ScheduleBlock) => {
    setBlockToDelay(block);
    setShowDelayModal(true);
  };

  const confirmDelay = (minutes: number) => {
    if (!selectedLearner || !blockToDelay) return;

    const delayTime = new Date();
    delayTime.setMinutes(delayTime.getMinutes() + minutes);
    const delayedUntil = toDisplayTime(
      `${String(delayTime.getHours()).padStart(2, '0')}:${String(delayTime.getMinutes()).padStart(2, '0')}`
    );

    scheduleService.rescheduleBlock(
      selectedLearner.id,
      dateKey,
      blockToDelay.id,
      delayedUntil,
      `Delayed from dashboard until ${delayedUntil}`
    );

    const nextSchedule = scheduleService.getDailySchedule(selectedLearner.id, dateKey);
    const nextActionable = nextSchedule?.blocks.find(
      (block) => block.id !== blockToDelay.id && ACTIONABLE_STATUSES.has(block.status)
    );

    if (blockToDelay.status === 'in-progress' && nextActionable) {
      scheduleService.startBlock(selectedLearner.id, dateKey, nextActionable.id);
    }

    loadSelectedSchedule();
    toast.success(`"${blockToDelay.title}" delayed until ${delayedUntil}`);
    setShowDelayModal(false);
    setBlockToDelay(null);
  };

  const resumeDelayedBlock = (block: ScheduleBlock) => {
    if (!selectedLearner) return;

    const updated = scheduleService.resumeBlock(selectedLearner.id, dateKey, block.id);
    if (updated) {
      loadSelectedSchedule();
      toast.success(`Resuming "${block.title}"`);
    }
  };

  const handleSkipBlock = async (blockId: string, reason?: string) => {
    if (!selectedLearner) return;

    scheduleService.skipBlock(selectedLearner.id, dateKey, blockId, reason);
    const nextSchedule = loadSelectedSchedule();
    if (nextSchedule) {
      await syncScheduleProgress(nextSchedule);
    }
  };

  const trackedBlocks = dailySchedule?.blocks.filter((block) => block.type !== 'break') || [];
  const completedBlocks = trackedBlocks.filter((block) => block.status === 'completed').length;
  const totalBlocks = trackedBlocks.length;
  const currentBlock = dailySchedule?.blocks.find((block) => block.status === 'in-progress') || null;
  const nextBlock = dailySchedule?.blocks.find((block) => ACTIONABLE_STATUSES.has(block.status)) || null;
  const rescheduledBlocks = dailySchedule?.blocks.filter((block) => block.status === 'rescheduled') || [];
  const uniqueMaterials = Array.from(
    new Set((dailySchedule?.blocks || []).flatMap((block) => block.materials).filter(Boolean))
  );
  const learnerBanner = resolveLearnerBanner(selectedLearner?.avatar);
  const currentMathsBlock = dailySchedule?.blocks.find((block) => block.railId === 'maths') || null;
  const currentMathsTrack =
    currentMathsBlock?.railTrackId
      ? foundationalRailService.getTrackById(currentMathsBlock.railTrackId) || null
      : selectedLearner && family
        ? (() => {
            const assignment = foundationalRailService.getAssignment(family.id, selectedLearner.id, 'maths');
            if (assignment?.trackId) {
              return foundationalRailService.getTrackById(assignment.trackId) || null;
            }
            return foundationalRailService.getTrackForSkillLevel('maths', selectedLearner.skillLevel) || null;
          })()
        : null;
  const currentMathsModule =
    currentMathsBlock?.railTrackId && currentMathsBlock?.railModuleId
      ? foundationalRailService.getModule(currentMathsBlock.railTrackId, currentMathsBlock.railModuleId) || null
      : null;
  const currentBlockTimer = currentBlock ? getBlockTimerSnapshot(currentBlock, timerNow) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {selectedLearner && (
          <div
            className={cn(
              'mb-6 overflow-hidden rounded-[28px] border border-slate-200',
              learnerBanner ? 'shadow-xl shadow-slate-200/70' : 'bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500'
            )}
          >
            <div
              className="relative min-h-[380px] px-6 py-7 lg:min-h-[520px] lg:px-8 lg:py-8"
            >
              {learnerBanner && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${learnerBanner})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#0f172a',
                  }}
                />
              )}
              {learnerBanner && <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/45 to-slate-950/25" />}
              {!learnerBanner && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.28),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.2),_transparent_32%)]" />
              )}
              <div className="relative flex min-h-[380px] flex-col gap-6 text-white lg:min-h-[520px]">
                <div className="flex items-center gap-3">
                  <Avatar emoji={selectedLearner.avatar} size="xl" className="border-[3px] border-white/60 shadow-lg" />
                  <div>
                    <p className="text-sm font-medium text-white/80">{isLearner ? 'My Day' : 'Today with'}</p>
                    <h2 className="text-3xl font-semibold">{selectedLearner.name}</h2>
                  </div>
                </div>

                <div className="mt-auto grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/70">Today</p>
                    <p className="mt-2 text-lg font-semibold">{formatDate(today, 'MMMM d, yyyy')}</p>
                  </div>
                  <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/70">Active Pod</p>
                    <p className="mt-2 text-lg font-semibold">{activePod?.title || currentPod?.title || 'Ready to learn'}</p>
                  </div>
                  <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/70">Progress</p>
                    <p className="mt-2 text-lg font-semibold">{completedBlocks}/{totalBlocks || 0} blocks complete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedLearner && (
          <header className="mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm text-slate-500">{getDayName(today)}</p>
                <h1 className="text-2xl font-semibold text-slate-900">
                  {formatDate(today, 'MMMM d, yyyy')}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Today's Progress</p>
                <p className="text-2xl font-bold text-slate-900">
                  {completedBlocks}/{totalBlocks || 0}
                </p>
              </div>
            </div>
          </header>
        )}

        {!isLearner && learners.length > 1 && (
          <div className="mb-6 flex gap-2 flex-wrap">
            {learners.map((learner) => (
              <button
                key={learner.id}
                onClick={() => setSelectedLearnerId(learner.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  selectedLearnerId === learner.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                )}
              >
                {learner.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {!selectedLearner ? (
              <Card className="text-center py-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Add a learner to begin</h2>
                <p className="text-slate-500">Schedules and progress appear here once a learner exists.</p>
              </Card>
            ) : !dailySchedule ? (
              <Card className="text-center py-10">
                <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">No live schedule yet</h2>
                <p className="text-slate-500 mb-5">
                  Create today&apos;s schedule for {selectedLearner.name} to start generating real progress data.
                </p>
                <Button
                  variant="primary"
                  icon={<Play className="h-4 w-4" />}
                  onClick={createTodaySchedule}
                >
                  Create Today&apos;s Schedule
                </Button>
              </Card>
            ) : currentBlock ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="info" className="bg-white/20 text-white border-white/30">
                    Now
                  </Badge>
                  <span className="text-blue-100 text-sm">{toDisplayTime(currentBlock.startTime)}</span>
                </div>
                <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{currentBlock.title}</h2>
                    <p className="text-blue-100">{currentBlock.duration} min • Focus time</p>
                  </div>

                  {currentBlockTimer && (
                    <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                      <motion.div
                        animate={
                          currentBlockTimer.remainingSeconds > 0
                            ? { scale: [1, 1.03, 1] }
                            : { scale: [1, 1.08, 1] }
                        }
                        transition={{
                          duration: currentBlockTimer.remainingSeconds > 0 ? 2.8 : 1.4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="relative h-20 w-20 shrink-0"
                      >
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="rgba(255,255,255,0.18)"
                            strokeWidth="8"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="rgba(255,255,255,0.95)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 42}
                            strokeDashoffset={(2 * Math.PI * 42) * (1 - currentBlockTimer.progressPercent / 100)}
                            className="transition-all duration-1000 ease-linear"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-blue-100/90">
                            Left
                          </span>
                          <span className="font-mono text-lg font-semibold text-white">
                            {currentBlockTimer.remainingLabel}
                          </span>
                        </div>
                      </motion.div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-100/80">
                          Session Timer
                        </p>
                        <p className="text-sm text-white/95">
                          {currentBlockTimer.progressPercent}% of this block completed
                        </p>
                        <p className="text-xs text-blue-100/80">
                          Delay pauses the timer. Resume picks up where this session stopped.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    variant="primary"
                    className="!bg-white !text-blue-700 hover:!bg-blue-50 border-white/80 shadow-sm"
                    icon={<Pause className="h-4 w-4" />}
                    onClick={() => handleDelayBlock(currentBlock)}
                  >
                    Delay
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    icon={<CheckCircle className="h-4 w-4" />}
                    onClick={() => void completeBlock(currentBlock.id)}
                  >
                    Complete
                  </Button>
                </div>
              </motion.div>
            ) : nextBlock ? (
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <Badge variant="info" className="mb-4">Ready To Start</Badge>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{nextBlock.title}</h2>
                <p className="text-slate-600 mb-6">
                  {nextBlock.status === 'rescheduled' && nextBlock.suggestedTime
                    ? `Rescheduled for ${nextBlock.suggestedTime}`
                    : `${toDisplayTime(nextBlock.startTime)} • ${nextBlock.duration} min`}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    variant="primary"
                    icon={<Play className="h-4 w-4" />}
                    onClick={() =>
                      nextBlock.status === 'rescheduled'
                        ? resumeDelayedBlock(nextBlock)
                        : void startBlock(nextBlock)
                    }
                  >
                    Start Block
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<Pause className="h-4 w-4" />}
                    onClick={() => handleDelayBlock(nextBlock)}
                  >
                    Delay
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">All done for today</h2>
                <p className="text-slate-500">This schedule is complete and the day&apos;s progress has been saved.</p>
              </Card>
            )}

            <AnimatePresence>
              {rescheduledBlocks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card padding="md" className="bg-amber-50 border-amber-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <h3 className="font-medium text-amber-800">Rescheduled Blocks</h3>
                    </div>
                    <div className="space-y-2">
                      {rescheduledBlocks.map((block) => (
                        <div key={block.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div>
                            <p className="font-medium text-slate-900">{block.title}</p>
                            <p className="text-xs text-amber-600">
                              Return at {block.suggestedTime || toDisplayTime(block.startTime)}
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => resumeDelayedBlock(block)}
                          >
                            Resume Now
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {dailySchedule && (
              <Card title="Today's Schedule" padding="lg">
                <p className="mb-3 text-sm text-slate-500">
                  Click any block to see the full session path, tools, sources, notes, and reflection prompts.
                </p>
                <div className="space-y-3">
                  {dailySchedule.blocks.map((block) => (
                    <ScheduleBlockCard
                      key={block.id}
                      block={block}
                      isActive={currentBlock?.id === block.id}
                      onStart={() =>
                        block.status === 'rescheduled'
                          ? resumeDelayedBlock(block)
                          : void startBlock(block)
                      }
                      onPause={() => handleDelayBlock(block)}
                      onComplete={() => void completeBlock(block.id)}
                      onSkip={() => void handleSkipBlock(block.id)}
                      onClick={() => {
                        setSelectedBlock(block);
                        setShowBlockDetails(true);
                      }}
                    />
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {selectedLearner && currentMathsTrack && (
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📐</span>
                  <div>
                    <p className="text-xs text-slate-500">Current Maths Rail</p>
                    <h3 className="font-semibold text-slate-900">{currentMathsTrack.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  {currentMathsModule
                    ? `Current module: ${currentMathsModule.title}`
                    : currentMathsTrack.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="default" size="sm">
                    {currentMathsTrack.sessionsPerWeek}x/week
                  </Badge>
                  <Badge variant="default" size="sm">
                    {currentMathsTrack.sessionLengthMinutes} min sessions
                  </Badge>
                  {currentMathsModule && (
                    <Badge variant="info" size="sm">
                      {currentMathsModule.coreSkills[0] || 'Maths focus'}
                    </Badge>
                  )}
                </div>
              </Card>
            )}

            <Card title="Learners" padding="lg">
              <div className="space-y-4">
                {learners.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">Add learners to get started</p>
                ) : (
                  learners.map((learner) => {
                    const learnerSchedule = scheduleService.getDailySchedule(learner.id, dateKey);
                    const progress = getCompletionPercentage(learnerSchedule);

                    return (
                      <div
                        key={learner.id}
                        className={cn(
                          'flex items-center gap-3 rounded-xl p-2 transition-colors',
                          selectedLearnerId === learner.id && 'bg-slate-50'
                        )}
                      >
                        <Avatar emoji={learner.avatar} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{learner.name}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 text-amber-600">
                              <Star className="h-3 w-3 fill-current" />
                              {learner.points}
                            </span>
                            <span className="flex items-center gap-1 text-orange-500">
                              <Flame className="h-3 w-3" />
                              {learner.streakDays}d
                            </span>
                          </div>
                        </div>
                        <div className="w-20">
                          <ProgressBar value={progress} size="sm" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-500" />
                  <h3 className="font-semibold text-slate-900 text-sm">Today&apos;s Materials</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowMaterialsPreview(true)}>
                  View All
                </Button>
              </div>
              {uniqueMaterials.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Create a schedule to surface the real materials needed today.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {uniqueMaterials.slice(0, 4).map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    {uniqueMaterials.length} real materials pulled from today&apos;s blocks
                  </p>
                </>
              )}
            </Card>

            {(activePod || currentPod) && (
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{activePod ? '🎯' : currentPod?.icon}</span>
                  <div>
                    <p className="text-xs text-slate-500">
                      {activePod ? 'Active Learning Pod' : 'This Month&apos;s Pod'}
                    </p>
                    <h3 className="font-semibold text-slate-900">
                      {activePod ? activePod.title : currentPod?.title}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  {activePod ? activePod.description : currentPod?.drivingQuestion}
                </p>
                <div className="flex flex-wrap gap-1">
                  {(activePod
                    ? activePod.learningObjectives.slice(0, 3)
                    : currentPod?.subjects.slice(0, 3) || []
                  ).map((subject) => (
                    <Badge key={subject} variant="default" size="sm">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            <Card title="Quick Actions" padding="lg">
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  fullWidth
                  icon={<Calendar className="h-4 w-4" />}
                  onClick={createTodaySchedule}
                  disabled={!selectedLearner}
                >
                  {dailySchedule ? 'Refresh Today\'s Schedule' : 'Create Today\'s Schedule'}
                </Button>
                <Button variant="secondary" fullWidth icon={<BookOpen className="h-4 w-4" />}>
                  Resources
                </Button>
              </div>
            </Card>

            {nextPod && (
              <Card padding="lg" className="bg-gradient-to-br from-slate-50 to-slate-100">
                <p className="text-xs text-slate-500 mb-1">Coming Next Month</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{nextPod.icon}</span>
                  <h3 className="font-medium text-slate-900">{nextPod.title}</h3>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {showBlockDetails && selectedBlock && selectedLearner && (
        <BlockDetailsModal
          block={selectedBlock}
          learnerName={selectedLearner.name}
          learnerId={selectedLearner.id}
          learnerSkillLevel={selectedLearner.skillLevel}
          scheduleDate={dateKey}
          onClose={() => {
            setShowBlockDetails(false);
            setSelectedBlock(null);
          }}
          onStart={() => {
            if (selectedBlock.status === 'rescheduled') {
              resumeDelayedBlock(selectedBlock);
            } else {
              void startBlock(selectedBlock);
            }
            setShowBlockDetails(false);
          }}
          onLaunch={() => {
            void launchBlock(selectedBlock);
          }}
          onComplete={(details) => {
            void completeBlock(selectedBlock.id, details);
            setShowBlockDetails(false);
          }}
          onSkip={(reason) => {
            void handleSkipBlock(selectedBlock.id, reason);
            setShowBlockDetails(false);
          }}
          onAddNote={(note) => {
            scheduleService.addNoteToBlock(selectedLearner.id, dateKey, selectedBlock.id, note);
            loadSelectedSchedule();
            const nextSelectedBlock = scheduleService
              .getDailySchedule(selectedLearner.id, dateKey)
              ?.blocks.find((block) => block.id === selectedBlock.id);
            setSelectedBlock(nextSelectedBlock || null);
          }}
        />
      )}

      <Modal
        isOpen={showDelayModal}
        onClose={() => setShowDelayModal(false)}
        title="Delay Block"
        size="sm"
      >
        {blockToDelay && (
          <div>
            <p className="text-slate-600 mb-4">
              When would you like to return to <strong>&quot;{blockToDelay.title}&quot;</strong>?
            </p>
            <div className="space-y-2">
              {DELAY_OPTIONS.map((option) => (
                <button
                  key={option.minutes}
                  onClick={() => confirmDelay(option.minutes)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <span className="font-medium text-slate-900">{option.label}</span>
                </button>
              ))}
            </div>
            <ModalFooter>
              <Button variant="secondary" onClick={() => setShowDelayModal(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showMaterialsPreview}
        onClose={() => setShowMaterialsPreview(false)}
        title={`${selectedLearner?.name || 'Today'} Materials`}
        size="md"
      >
        <div>
          <p className="text-sm text-slate-600 mb-4">
            These materials are pulled directly from the live blocks scheduled for today.
          </p>
          {uniqueMaterials.length === 0 ? (
            <Card className="p-6 text-center text-slate-500">
              Create a schedule first to generate a real materials list.
            </Card>
          ) : (
            <div className="space-y-3">
              {uniqueMaterials.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-white border-slate-200"
                >
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="flex-1 text-slate-900">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
