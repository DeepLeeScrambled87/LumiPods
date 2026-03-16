import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';
import { LearnerCard } from './LearnerCard';
import type { Learner } from '../../types/learner';

interface LearnerListProps {
  learners: Learner[];
  selectedId?: string;
  onSelect?: (learner: Learner) => void;
  onEdit?: (learner: Learner) => void;
  onAdd?: () => void;
  layout?: 'grid' | 'list' | 'compact';
  className?: string;
}

export const LearnerList: React.FC<LearnerListProps> = ({
  learners,
  selectedId,
  onSelect,
  onEdit,
  onAdd,
  layout = 'grid',
  className,
}) => {
  if (learners.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-slate-500 mb-4">No learners added yet</p>
        {onAdd && (
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onAdd}>
            Add First Learner
          </Button>
        )}
      </div>
    );
  }

  if (layout === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        {learners.map((learner) => (
          <LearnerCard
            key={learner.id}
            learner={learner}
            selected={selectedId === learner.id}
            onClick={onSelect}
            compact
          />
        ))}
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add Learner</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        layout === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4',
        className
      )}
    >
      {learners.map((learner) => (
        <LearnerCard
          key={learner.id}
          learner={learner}
          selected={selectedId === learner.id}
          onClick={onSelect}
          onEdit={onEdit}
        />
      ))}
      {onAdd && (
        <button
          onClick={onAdd}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors',
            layout === 'grid' ? 'min-h-[180px]' : 'py-8'
          )}
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-medium">Add Learner</span>
        </button>
      )}
    </div>
  );
};

export default LearnerList;
