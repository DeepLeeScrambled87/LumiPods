import React from 'react';
import { Flame, Star, Settings } from 'lucide-react';
import { m } from 'framer-motion';
import { cn } from '../../lib/cn';
import { Avatar } from '../ui/Avatar';
import { SkillLevelBadge } from './SkillLevelBadge';
import { SKILL_LEVELS } from '../../types/skillLevel';
import type { Learner } from '../../types/learner';

interface LearnerCardProps {
  learner: Learner;
  onEdit?: (learner: Learner) => void;
  onClick?: (learner: Learner) => void;
  selected?: boolean;
  compact?: boolean;
  className?: string;
}

export const LearnerCard: React.FC<LearnerCardProps> = ({
  learner,
  onEdit,
  onClick,
  selected = false,
  compact = false,
  className,
}) => {
  const skillConfig = SKILL_LEVELS[learner.skillLevel];

  if (compact) {
    return (
      <button
        onClick={() => onClick?.(learner)}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-xl border transition-all w-full text-left',
          selected
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
        )}
      >
        <Avatar emoji={learner.avatar} size="sm" />
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium truncate', selected ? 'text-white' : 'text-slate-900')}>
            {learner.name}
          </p>
          <p className={cn('text-xs', selected ? 'text-slate-300' : 'text-slate-500')}>
            {skillConfig.label}
          </p>
        </div>
        <div className={cn('text-sm font-medium', selected ? 'text-white' : 'text-amber-600')}>
          {learner.points} pts
        </div>
      </button>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow',
        selected ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={() => onClick?.(learner)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar emoji={learner.avatar} size="lg" />
          <div>
            <h3 className="font-semibold text-slate-900">{learner.name}</h3>
            <p className="text-sm text-slate-500">Age {learner.age}</p>
          </div>
        </div>
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(learner);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label={`Edit ${learner.name}`}
          >
            <Settings className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <SkillLevelBadge level={learner.skillLevel} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1 text-amber-600">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-sm font-medium">{learner.points} pts</span>
        </div>
        <div className="flex items-center gap-1 text-orange-500">
          <Flame className="h-4 w-4" />
          <span className="text-sm font-medium">{learner.streakDays} day streak</span>
        </div>
      </div>
    </m.div>
  );
};

export default LearnerCard;
