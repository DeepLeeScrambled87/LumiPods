import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

interface TimerProps {
  initialMinutes: number;
  breakMinutes?: number;
  onComplete?: () => void;
  onTick?: (remainingSeconds: number) => void;
  autoStart?: boolean;
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

type TimerState = 'idle' | 'running' | 'paused' | 'break' | 'completed';

const sizeStyles = {
  sm: { container: 'w-24 h-24', text: 'text-xl', label: 'text-xs' },
  md: { container: 'w-32 h-32', text: 'text-3xl', label: 'text-sm' },
  lg: { container: 'w-40 h-40', text: 'text-4xl', label: 'text-base' },
};

export const Timer: React.FC<TimerProps> = ({
  initialMinutes,
  breakMinutes = 5,
  onComplete,
  onTick,
  autoStart = false,
  showControls = true,
  size = 'md',
  className,
}) => {
  const [state, setState] = useState<TimerState>(autoStart ? 'running' : 'idle');
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const totalSeconds = isBreak ? breakMinutes * 60 : initialMinutes * 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;

  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setState('running');
    intervalRef.current = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          if (!isBreak) {
            // Focus time complete, start break
            setIsBreak(true);
            setState('break');
            return breakMinutes * 60;
          } else {
            // Break complete
            setState('completed');
            onComplete?.();
            return 0;
          }
        }
        onTick?.(prev - 1);
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, isBreak, breakMinutes, onComplete, onTick]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    setState('paused');
  }, [clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setIsBreak(false);
    setSeconds(initialMinutes * 60);
    setState('idle');
  }, [clearTimer, initialMinutes]);

  const toggleTimer = useCallback(() => {
    if (state === 'running' || state === 'break') {
      pauseTimer();
    } else if (state === 'idle' || state === 'paused') {
      startTimer();
    }
  }, [state, pauseTimer, startTimer]);

  useEffect(() => {
    if (autoStart) startTimer();
    return clearTimer;
  }, [autoStart, startTimer, clearTimer]);

  const styles = sizeStyles[size];
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Circular progress */}
      <div className={cn('relative', styles.container)}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isBreak ? '#10b981' : '#3b82f6'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-mono font-bold text-slate-900', styles.text)}>
            {formatTime(seconds)}
          </span>
          <span className={cn('text-slate-500', styles.label)}>
            {isBreak ? 'Break' : 'Focus'}
          </span>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={resetTimer}
            aria-label="Reset timer"
          />
          <Button
            variant="primary"
            size="md"
            icon={
              state === 'completed' ? (
                <Check className="h-4 w-4" />
              ) : state === 'running' || state === 'break' ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )
            }
            onClick={state === 'completed' ? resetTimer : toggleTimer}
            disabled={state === 'completed'}
          >
            {state === 'completed'
              ? 'Done!'
              : state === 'running' || state === 'break'
              ? 'Pause'
              : 'Start'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Timer;
