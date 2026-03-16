import { useState, useCallback, useRef, useEffect } from 'react';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface UseTimerOptions {
  initialSeconds: number;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  seconds: number;
  status: TimerStatus;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setTime: (seconds: number) => void;
  formattedTime: string;
  progress: number;
}

export function useTimer({
  initialSeconds,
  onComplete,
  onTick,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [status, setStatus] = useState<TimerStatus>(autoStart ? 'running' : 'idle');
  const intervalRef = useRef<number | null>(null);
  const initialSecondsRef = useRef(initialSeconds);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setStatus('running');
    
    intervalRef.current = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          setStatus('completed');
          onComplete?.();
          return 0;
        }
        const newValue = prev - 1;
        onTick?.(newValue);
        return newValue;
      });
    }, 1000);
  }, [clearTimer, onComplete, onTick]);

  const pause = useCallback(() => {
    clearTimer();
    setStatus('paused');
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (status === 'paused' && seconds > 0) {
      start();
    }
  }, [status, seconds, start]);

  const reset = useCallback(() => {
    clearTimer();
    setSeconds(initialSecondsRef.current);
    setStatus('idle');
  }, [clearTimer]);

  const setTime = useCallback((newSeconds: number) => {
    setSeconds(newSeconds);
    initialSecondsRef.current = newSeconds;
  }, []);

  // Format time as MM:SS
  const formattedTime = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  // Progress as percentage (0-100)
  const progress = initialSecondsRef.current > 0
    ? ((initialSecondsRef.current - seconds) / initialSecondsRef.current) * 100
    : 0;

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  return {
    seconds,
    status,
    isRunning: status === 'running',
    start,
    pause,
    resume,
    reset,
    setTime,
    formattedTime,
    progress,
  };
}

export default useTimer;
