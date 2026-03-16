import React from 'react';
import { cn } from '../../lib/cn';
import { resolveLearnerAvatar } from '../../lib/learnerAvatars';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  emoji?: string;
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-sm',
  sm: 'h-8 w-8 text-base',
  md: 'h-10 w-10 text-lg',
  lg: 'h-12 w-12 text-xl',
  xl: 'h-16 w-16 text-2xl',
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const Avatar: React.FC<AvatarProps> = ({
  emoji,
  src,
  alt,
  name,
  size = 'md',
  className,
}) => {
  const resolvedSrc = src || resolveLearnerAvatar(emoji);

  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt={alt || name || 'Avatar'}
        className={cn(
          'rounded-full object-cover bg-slate-100',
          sizeStyles[size],
          className
        )}
      />
    );
  }

  if (emoji) {
    return (
      <div
        className={cn(
          'rounded-full bg-slate-100 flex items-center justify-center',
          sizeStyles[size],
          className
        )}
        role="img"
        aria-label={name || 'Avatar'}
      >
        {emoji}
      </div>
    );
  }

  // Fallback to initials
  return (
    <div
      className={cn(
        'rounded-full bg-slate-200 flex items-center justify-center font-medium text-slate-600',
        sizeStyles[size],
        className
      )}
      role="img"
      aria-label={name || 'Avatar'}
    >
      {name ? getInitials(name) : '?'}
    </div>
  );
};

export default Avatar;
