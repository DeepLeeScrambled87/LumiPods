// Date utilities wrapping date-fns
import { format, formatDistanceToNow, startOfWeek, endOfWeek, addDays, isToday, isSameDay } from 'date-fns';

export const formatDate = (date: Date | string, pattern: string = 'MMM d, yyyy'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern);
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'h:mm a');
};

export const toLocalDateKey = (date: Date | string = new Date()): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
};

export const formatRelative = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const getWeekDays = (date: Date = new Date(), weekStartsOn: 0 | 1 = 1): Date[] => {
  const start = startOfWeek(date, { weekStartsOn });
  return Array.from({ length: 5 }, (_, i) => addDays(start, i + (weekStartsOn === 0 ? 1 : 0)));
};

export const getWeekRange = (date: Date = new Date(), weekStartsOn: 0 | 1 = 1): { start: Date; end: Date } => ({
  start: startOfWeek(date, { weekStartsOn }),
  end: endOfWeek(date, { weekStartsOn }),
});

export const getDayName = (date: Date, short: boolean = false): string => {
  return format(date, short ? 'EEE' : 'EEEE');
};

export const isTodayDate = isToday;
export const isSameDate = isSameDay;

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};
