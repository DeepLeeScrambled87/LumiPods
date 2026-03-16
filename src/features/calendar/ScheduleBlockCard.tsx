// Schedule Block Card - Clean, minimal design
import { Play, Pause, Check, SkipForward, Clock, Target, Package, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { ScheduleBlock } from '../../types/schedule';
import { BLOCK_TYPE_CONFIG, BLOCK_STATUS_CONFIG } from '../../types/schedule';

interface ScheduleBlockCardProps {
  block: ScheduleBlock;
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onClick: () => void;
}

export function ScheduleBlockCard({
  block,
  isActive,
  onStart,
  onPause,
  onComplete,
  onSkip,
  onClick,
}: ScheduleBlockCardProps) {
  const typeConfig = BLOCK_TYPE_CONFIG[block.type];
  const statusConfig = BLOCK_STATUS_CONFIG[block.status];

  const isCompleted = block.status === 'completed';
  const isSkipped = block.status === 'skipped';
  const isPaused = block.status === 'paused';
  const canStart =
    block.status === 'scheduled' ||
    block.status === 'ready' ||
    block.status === 'rescheduled' ||
    isPaused;

  // Simple border color based on state
  const borderColor = isActive
    ? 'border-blue-400'
    : isCompleted
    ? 'border-green-400'
    : isSkipped
    ? 'border-orange-400'
    : 'border-slate-200 hover:border-slate-300';

  const bgColor = isActive
    ? 'bg-blue-50'
    : isCompleted
    ? 'bg-green-50'
    : isSkipped
    ? 'bg-orange-50'
    : 'bg-white';

  return (
    <div
      className={`relative p-4 rounded-xl border ${borderColor} ${bgColor} transition-all cursor-pointer hover:shadow-sm ${
        isCompleted || isSkipped ? 'opacity-70' : ''
      }`}
      onClick={onClick}
    >
      {/* Time badge */}
      <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">
        {block.startTime} - {block.endTime}
      </div>

      <div className="flex items-start gap-4 mt-1">
        {/* Type icon */}
        <div className="p-2.5 rounded-lg bg-slate-100 flex-shrink-0">
          <span className="text-xl">{typeConfig.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4
              className={`font-semibold text-slate-800 ${
                isCompleted || isSkipped ? 'line-through text-slate-400' : ''
              }`}
            >
              {block.title}
            </h4>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>

          {block.description && (
            <p className="text-sm text-slate-500 mb-2 line-clamp-1">{block.description}</p>
          )}

          {/* Quick info row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {block.duration} min
            </span>

            {block.objectives.length > 0 && (
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                {block.objectives.length} objectives
              </span>
            )}

            {block.materials.length > 0 && (
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                {block.materials.length} materials
              </span>
            )}

            {/* Energy indicator - simple text */}
            <span className="text-slate-400">
              ⚡ {block.energyRequired} · 🧠 {block.focusRequired}
            </span>
          </div>

          {/* Notes preview */}
          {block.notes && (
            <p className="mt-2 text-xs text-slate-400 italic truncate">📝 {block.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {canStart && !isActive && (
            <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50" onClick={onStart}>
              <Play className="w-4 h-4" />
            </Button>
          )}

          {isActive && (
            <>
              <Button variant="ghost" size="sm" className="text-amber-600 hover:bg-amber-50" onClick={onPause}>
                <Pause className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50" onClick={onComplete}>
                <Check className="w-4 h-4" />
              </Button>
            </>
          )}

          {!isCompleted && !isSkipped && !isActive && (
            <Button variant="ghost" size="sm" className="text-slate-400 hover:bg-slate-50" onClick={onSkip}>
              <SkipForward className="w-4 h-4" />
            </Button>
          )}

          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>

      {/* Progress indicator for active block */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-100 rounded-b-xl overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse" style={{ width: '50%' }} />
        </div>
      )}
    </div>
  );
}
