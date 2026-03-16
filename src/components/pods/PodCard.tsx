import React from 'react';
import { Clock, Target, Package } from 'lucide-react';
import { m } from 'framer-motion';
import { cn } from '../../lib/cn';
import { Badge } from '../ui/Badge';
import { POD_THEME_CONFIG } from '../../types/pod';
import type { Pod } from '../../types/pod';

interface PodCardProps {
  pod: Pod;
  isActive?: boolean;
  onSelect?: (pod: Pod) => void;
  className?: string;
}

export const PodCard: React.FC<PodCardProps> = ({
  pod,
  isActive = false,
  onSelect,
  className,
}) => {
  const themeConfig = POD_THEME_CONFIG[pod.theme];
  const totalWeeks = pod.duration || pod.weeks?.length || 4;
  const totalMaterials = pod.materials?.length || 
    (pod.weeks?.reduce((sum, w) => sum + ('materials' in w ? (w.materials?.length || 0) : 0), 0) || 0);

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect?.(pod)}
      className={cn(
        'relative overflow-hidden rounded-2xl border cursor-pointer transition-shadow',
        isActive
          ? 'border-slate-900 ring-2 ring-slate-900/20 shadow-lg'
          : 'border-slate-200 shadow-sm hover:shadow-md',
        className
      )}
    >
      {/* Gradient Header */}
      <div className={cn('h-32 bg-gradient-to-br', themeConfig.bgGradient)}>
        <div className="h-full flex items-center justify-center">
          <span className="text-5xl">{themeConfig.icon}</span>
        </div>
        {isActive && (
          <div className="absolute top-3 right-3">
            <Badge variant="success" size="md">
              Active
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{pod.title}</h3>
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{pod.description}</p>

        {/* Milestone */}
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs font-medium text-slate-500 mb-1">Milestone</p>
          <p className="text-sm text-slate-700">{pod.milestone}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {totalWeeks} week{totalWeeks !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Target className="h-3.5 w-3.5" />
            {pod.learningObjectives.length} objectives
          </span>
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            {totalMaterials} materials
          </span>
        </div>

        {/* Artifact types */}
        <div className="mt-4 flex flex-wrap gap-1">
          {pod.artifactTypes.slice(0, 3).map((type) => (
            <Badge key={type} variant="default" size="sm">
              {type}
            </Badge>
          ))}
        </div>
      </div>
    </m.div>
  );
};

export default PodCard;
