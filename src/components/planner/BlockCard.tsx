import React from 'react';
import { Clock, Star, Play, Check, SkipForward } from 'lucide-react';
import { m } from 'framer-motion';
import { cn } from '../../lib/cn';
import { Badge } from '../ui/Badge';
import { SUBJECT_CONFIG } from '../../types/block';
import { SKILL_LEVELS } from '../../types/skillLevel';
import type { Block, ScheduledBlock, BlockContent } from '../../types/block';
import type { SkillLevel } from '../../types/skillLevel';

interface BlockCardProps {
  block: Block;
  scheduledBlock?: ScheduledBlock;
  skillLevel: SkillLevel;
  onStart?: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
  compact?: boolean;
  className?: string;
}

export const BlockCard: React.FC<BlockCardProps> = ({
  block,
  scheduledBlock,
  skillLevel,
  onStart,
  onComplete,
  onSkip,
  compact = false,
  className,
}) => {
  const subjectConfig = SUBJECT_CONFIG[block.subject];
  const skillConfig = SKILL_LEVELS[skillLevel];
  const content: BlockContent = block.content[skillLevel];
  const status = scheduledBlock?.status || 'pending';

  const statusStyles = {
    pending: 'border-slate-200 bg-white',
    'in-progress': 'border-blue-300 bg-blue-50',
    completed: 'border-emerald-300 bg-emerald-50',
    skipped: 'border-slate-300 bg-slate-50 opacity-60',
  };

  // Adjust duration based on skill level
  const adjustedDuration = Math.round(block.duration * (skillConfig.focusMinutes / 20));

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all',
          statusStyles[status],
          className
        )}
      >
        <span className="text-lg">{subjectConfig.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{block.title}</p>
          <p className="text-xs text-slate-500">{adjustedDuration} min</p>
        </div>
        {status === 'completed' && <Check className="h-4 w-4 text-emerald-600" />}
        {status === 'in-progress' && (
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-2xl border p-4 transition-all',
        statusStyles[status],
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{subjectConfig.icon}</span>
          <div>
            <h4 className="font-medium text-slate-900">{block.title}</h4>
            <p className={cn('text-xs', subjectConfig.color)}>{subjectConfig.label}</p>
          </div>
        </div>
        <Badge
          variant={block.supportLevel === 'guided' ? 'warning' : 'success'}
          size="sm"
        >
          {block.supportLevel === 'guided' ? '⭐ Guided' : '🟢 Independent'}
        </Badge>
      </div>

      {/* Objectives */}
      {content.objectives.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-slate-500 mb-1">Objectives</p>
          <ul className="space-y-1">
            {content.objectives.slice(0, 2).map((obj, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta info */}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {adjustedDuration} min
        </span>
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5" />
          10 pts
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        {status === 'pending' && (
          <>
            <button
              onClick={onStart}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <Play className="h-4 w-4" />
              Start
            </button>
            <button
              onClick={onSkip}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Skip block"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </>
        )}
        {status === 'in-progress' && (
          <button
            onClick={onComplete}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Check className="h-4 w-4" />
            Complete
          </button>
        )}
        {status === 'completed' && (
          <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-emerald-600 text-sm font-medium">
            <Check className="h-4 w-4" />
            Completed
          </div>
        )}
        {status === 'skipped' && (
          <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-slate-400 text-sm">
            Skipped
          </div>
        )}
      </div>
    </m.div>
  );
};

export default BlockCard;
