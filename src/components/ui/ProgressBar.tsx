import React from 'react';
import { cn } from '../../lib/cn';

type ProgressVariant = 'default' | 'success' | 'warning' | 'info';
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

const variantStyles: Record<ProgressVariant, string> = {
  default: 'bg-slate-600',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

const sizeStyles: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  className,
  animated = false,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-xs text-slate-600">{label}</span>}
          {showLabel && <span className="text-xs font-medium text-slate-700">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-200 rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantStyles[variant],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
