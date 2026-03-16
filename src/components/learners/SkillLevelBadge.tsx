import React from 'react';
import { cn } from '../../lib/cn';
import { SKILL_LEVELS } from '../../types/skillLevel';
import type { SkillLevel } from '../../types/skillLevel';

interface SkillLevelBadgeProps {
  level: SkillLevel;
  showAge?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const SkillLevelBadge: React.FC<SkillLevelBadgeProps> = ({
  level,
  showAge = false,
  size = 'sm',
  className,
}) => {
  const config = SKILL_LEVELS[level];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.bgColor,
        config.color,
        config.borderColor,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {config.label}
      {showAge && <span className="ml-1 opacity-75">({config.ageRange})</span>}
    </span>
  );
};

export default SkillLevelBadge;
