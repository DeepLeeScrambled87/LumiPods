// Enhanced Daily View - Learning Management Calendar
import { useState, useEffect, useCallback } from 'react';
import { Clock, Pause, Check, Plus, ChevronLeft, ChevronRight, Zap, Brain } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { finalizeBlockCompletion } from '../../services/blockCompletionService';
import { launchTrackedExternalSession } from '../../services/externalProgressSyncService';
import { scheduleService } from '../../services/scheduleService';
import { syncScheduleProgress } from '../../services/scheduleProgressSync';
import { ScheduleBlockCard } from './ScheduleBlockCard';
import { BlockDetailsModal } from './BlockDetailsModal';
import { EnergyTracker } from './EnergyTracker';
import type { BlockCompletionDetails, DailySchedule, ScheduleBlock } from '../../types/schedule';
import { BLOCK_TYPE_CONFIG } from '../../types/schedule';

interface EnhancedDailyViewProps {
  learnerId: string;
  learnerName: string;
  familyId: string;
  podId?: string;
  weekNumber?: number;
  learnerSkillLevel?: 'foundation' | 'intermediate' | 'advanced' | 'pro';
  date: Date;
  onDateChange: (date: Date) => void;
}

export function EnhancedDailyView({
  learnerId,
  learnerName,
  familyId,
  podId,
  weekNumber,
  learnerSkillLevel = 'intermediate',
  date,
  onDateChange,
}: EnhancedDailyViewProps) {
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [activeBlock, setActiveBlock] = useState<ScheduleBlock | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  const dateStr = date.toISOString().split('T')[0];

  // Load schedule
  useEffect(() => {
    const existing = scheduleService.ensureDailySchedule(
      learnerId,
      dateStr,
      familyId,
      podId,
      weekNumber,
      learnerSkillLevel
    );
    setSchedule(existing);
    
    // Find active block
    const active = existing.blocks.find(b => b.status === 'in-progress');
    setActiveBlock(active || null);
  }, [learnerId, dateStr, familyId, podId, weekNumber, learnerSkillLevel]);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Timer for active block
  useEffect(() => {
    if (!activeBlock) {
      setElapsedTime(0);
      return;
    }
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeBlock]);

  const handleLaunchBlock = useCallback(async (block: ScheduleBlock) => {
    if (!block.launchUrl) {
      return;
    }

    const isTrackedExternal = block.type === 'external' || block.source === 'external';
    if (!isTrackedExternal) {
      window.open(block.launchUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    await launchTrackedExternalSession({
      familyId,
      learnerId,
      learnerName,
      date: dateStr,
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

    setSchedule(scheduleService.getDailySchedule(learnerId, dateStr));
  }, [dateStr, familyId, learnerId, learnerName]);

  const handleStartBlock = useCallback(async (block: ScheduleBlock) => {
    if (block.launchUrl && (block.type === 'external' || block.source === 'external')) {
      await handleLaunchBlock(block);
      return;
    }

    const currentBlock = scheduleService
      .getDailySchedule(learnerId, dateStr)
      ?.blocks.find((entry) => entry.id === block.id);
    const updated = currentBlock?.status === 'rescheduled'
      ? scheduleService.resumeBlock(learnerId, dateStr, block.id)
      : scheduleService.startBlock(learnerId, dateStr, block.id);
    if (updated) {
      setActiveBlock(updated);
      setElapsedTime(0);
      setSchedule(scheduleService.getDailySchedule(learnerId, dateStr));
    }
  }, [dateStr, handleLaunchBlock, learnerId]);

  const handlePauseBlock = useCallback((blockId: string) => {
    const updated = scheduleService.pauseBlock(learnerId, dateStr, blockId);
    if (updated) {
      setActiveBlock(null);
      setSchedule(scheduleService.getDailySchedule(learnerId, dateStr));
    }
  }, [learnerId, dateStr]);

  const handleCompleteBlock = useCallback(async (blockId: string, details?: BlockCompletionDetails) => {
    const updated = scheduleService.completeBlock(
      learnerId,
      dateStr,
      blockId,
      elapsedTime,
      details?.notes
    );
    if (updated) {
      await finalizeBlockCompletion({
        familyId,
        learnerId,
        date: dateStr,
        block: updated,
        details,
      });

      setActiveBlock(null);
      setElapsedTime(0);
      const nextSchedule = scheduleService.getDailySchedule(learnerId, dateStr);
      setSchedule(nextSchedule);
      if (nextSchedule) {
        void syncScheduleProgress(nextSchedule);
      }
    }
  }, [dateStr, elapsedTime, familyId, learnerId]);

  const handleSkipBlock = useCallback((blockId: string, reason?: string) => {
    scheduleService.skipBlock(learnerId, dateStr, blockId, reason);
    const nextSchedule = scheduleService.getDailySchedule(learnerId, dateStr);
    setSchedule(nextSchedule);
    if (nextSchedule) {
      void syncScheduleProgress(nextSchedule);
    }
  }, [learnerId, dateStr]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const mins = currentTime.getMinutes();
    return ((hours - 8) * 60 + mins) / (12 * 60) * 100; // 8am to 8pm range
  };

  if (!schedule) {
    return <div className="p-4 text-center">Loading schedule...</div>;
  }

  const completionRate = schedule.blocks.length > 0
    ? Math.round((schedule.completedBlocks / schedule.blocks.length) * 100)
    : 0;

  const totalMinutes = schedule.blocks.reduce((sum, b) => sum + b.duration, 0);
  const completedMinutes = schedule.blocks
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.actualDuration || b.duration), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <p className="text-sm text-slate-500">{learnerName}'s Schedule</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigateDate('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onDateChange(new Date())}>
            Today
          </Button>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Block
          </Button>
        </div>
      </div>


      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Time</p>
              <p className="font-semibold">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Completed</p>
              <p className="font-semibold">{completionRate}%</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Energy</p>
              <p className="font-semibold capitalize">{schedule.energyLevel}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Focus Time</p>
              <p className="font-semibold">{Math.floor(completedMinutes / 60)}h {completedMinutes % 60}m</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Block Timer */}
      {activeBlock && (
        <Card className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{BLOCK_TYPE_CONFIG[activeBlock.type].icon}</div>
              <div>
                <h3 className="font-semibold text-lg">{activeBlock.title}</h3>
                <p className="text-blue-100 text-sm">In Progress</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-mono font-bold">{formatTime(elapsedTime)}</p>
                <p className="text-xs text-blue-200">of {activeBlock.duration} min</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => handlePauseBlock(activeBlock.id)}
                >
                  <Pause className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => void handleCompleteBlock(activeBlock.id)}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${Math.min(100, (elapsedTime / 60 / activeBlock.duration) * 100)}%` }}
            />
          </div>
        </Card>
      )}

      {/* Timeline View */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Today's Schedule
        </h3>
        <p className="mb-4 text-sm text-slate-500">
          Open any block for the full session path, linked tools, sources, and reflection prompts.
        </p>
        
        <div className="relative">
          {/* Current time indicator */}
          {date.toDateString() === new Date().toDateString() && (
            <div
              className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
              style={{ top: `${getCurrentTimePosition()}%` }}
            >
              <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
              <span className="absolute left-4 -top-2.5 text-xs text-red-500 font-medium">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          
          {/* Schedule blocks */}
          <div className="space-y-2">
            {schedule.blocks.map((block) => (
              <ScheduleBlockCard
                key={block.id}
                block={block}
                isActive={activeBlock?.id === block.id}
                onStart={() => void handleStartBlock(block)}
                onPause={() => handlePauseBlock(block.id)}
                onComplete={() => void handleCompleteBlock(block.id)}
                onSkip={() => handleSkipBlock(block.id)}
                onClick={() => {
                  setSelectedBlock(block);
                  setShowBlockModal(true);
                }}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Energy Tracker */}
      <EnergyTracker
        learnerId={learnerId}
        date={dateStr}
        currentEnergy={schedule.energyLevel}
        onEnergyChange={(energy) => {
          scheduleService.adjustScheduleForEnergy(learnerId, dateStr, energy);
          setSchedule(scheduleService.getDailySchedule(learnerId, dateStr));
        }}
      />

      {/* Block Details Modal */}
      {showBlockModal && selectedBlock && (
        <BlockDetailsModal
          block={selectedBlock}
          learnerName={learnerName}
          learnerId={learnerId}
          learnerSkillLevel={learnerSkillLevel}
          scheduleDate={dateStr}
          onClose={() => {
            setShowBlockModal(false);
            setSelectedBlock(null);
          }}
          onStart={() => void handleStartBlock(selectedBlock)}
          onLaunch={() => {
            void handleLaunchBlock(selectedBlock);
          }}
          onComplete={(details) => void handleCompleteBlock(selectedBlock.id, details)}
          onSkip={(reason) => handleSkipBlock(selectedBlock.id, reason)}
          onAddNote={(note) => {
            scheduleService.addNoteToBlock(learnerId, dateStr, selectedBlock.id, note);
            setSchedule(scheduleService.getDailySchedule(learnerId, dateStr));
          }}
        />
      )}
    </div>
  );
}
