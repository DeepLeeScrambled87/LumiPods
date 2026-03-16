import React from 'react';
import { Flame, Star, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Avatar } from '../ui/Avatar';
import { ProgressBar } from '../ui/ProgressBar';
import { SkillLevelBadge } from '../learners/SkillLevelBadge';
import { BlockCard } from './BlockCard';
import { SKILL_LEVELS } from '../../types/skillLevel';
import type { Learner } from '../../types/learner';
import type { Block, ScheduledBlock } from '../../types/block';

interface LearnerColumnProps {
  learner: Learner;
  blocks: Block[];
  scheduledBlocks?: ScheduledBlock[];
  onBlockStart?: (blockId: string) => void;
  onBlockComplete?: (blockId: string) => void;
  onBlockSkip?: (blockId: string) => void;
  onLearnerClick?: () => void;
  className?: string;
}

export const LearnerColumn: React.FC<LearnerColumnProps> = ({
  learner,
  blocks,
  scheduledBlocks = [],
  onBlockStart,
  onBlockComplete,
  onBlockSkip,
  onLearnerClick,
  className,
}) => {
  const skillConfig = SKILL_LEVELS[learner.skillLevel];
  
  // Calculate progress
  const completedBlocks = scheduledBlocks.filter((sb) => sb.status === 'completed').length;
  const totalBlocks = blocks.length || skillConfig.dailyBlocks;
  const progressPercent = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;

  // Get scheduled block status for each block
  const getScheduledBlock = (blockId: string): ScheduledBlock | undefined => {
    return scheduledBlocks.find((sb) => sb.blockId === blockId);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Learner Header */}
      <div
        className={cn(
          'bg-white border border-slate-200 rounded-2xl p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow',
          skillConfig.borderColor
        )}
        onClick={onLearnerClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar emoji={learner.avatar} size="lg" />
            <div>
              <h3 className="font-semibold text-slate-900">{learner.name}</h3>
              <SkillLevelBadge level={learner.skillLevel} />
            </div>
          </div>
          <button
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="More options"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-amber-600">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{learner.points}</span>
          </div>
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-medium">{learner.streakDays}d</span>
          </div>
        </div>

        {/* Daily progress */}
        <ProgressBar
          value={progressPercent}
          variant={progressPercent === 100 ? 'success' : 'default'}
          size="md"
          label={`${completedBlocks}/${totalBlocks} blocks`}
          showLabel
        />
      </div>

      {/* Blocks list */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {blocks.length > 0 ? (
          blocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              scheduledBlock={getScheduledBlock(block.id)}
              skillLevel={learner.skillLevel}
              onStart={() => onBlockStart?.(block.id)}
              onComplete={() => onBlockComplete?.(block.id)}
              onSkip={() => onBlockSkip?.(block.id)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No blocks scheduled</p>
            <p className="text-xs mt-1">Select a pod to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerColumn;
