import React from 'react';
import { m } from 'framer-motion';
import { cn } from '../../lib/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
  padding = 'md',
  hover = false,
  onClick,
}) => {
  const Component = hover ? m.div : 'div';
  const motionProps = hover
    ? {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        whileHover: { y: -2 },
        transition: { duration: 0.25, ease: 'easeOut' },
      }
    : {};

  return (
    <Component
      className={cn(
        'bg-white border border-slate-200 rounded-2xl shadow-sm',
        hover && 'hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-5">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn(title ? 'px-5 pb-5 pt-3' : paddingStyles[padding])}>{children}</div>
    </Component>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn('px-5 pt-5', className)}>{children}</div>;

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn('px-5 pb-5', className)}>{children}</div>;

export default Card;
