import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { getWeekDays, getDayName, isTodayDate, formatDate } from '../../lib/dates';

interface DaySelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  weekStartsOn?: 0 | 1;
  className?: string;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDate,
  onDateChange,
  weekStartsOn = 1,
  className,
}) => {
  const weekDays = getWeekDays(selectedDate, weekStartsOn);

  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className={cn('bg-white border border-slate-200 rounded-2xl p-4', className)}>
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousWeek}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div className="text-center">
          <p className="text-sm font-medium text-slate-900">
            {formatDate(weekDays[0], 'MMM d')} - {formatDate(weekDays[4], 'MMM d, yyyy')}
          </p>
          <button
            onClick={goToToday}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            Go to today
          </button>
        </div>

        <button
          onClick={goToNextWeek}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Next week"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day buttons */}
      <div className="flex gap-2">
        {weekDays.map((day) => {
          const isSelected = formatDate(day, 'yyyy-MM-dd') === formatDate(selectedDate, 'yyyy-MM-dd');
          const isToday = isTodayDate(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateChange(day)}
              className={cn(
                'flex-1 py-2 px-1 rounded-xl text-center transition-all',
                isSelected
                  ? 'bg-slate-900 text-white'
                  : isToday
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              )}
            >
              <p className="text-xs font-medium">{getDayName(day, true)}</p>
              <p className={cn('text-lg font-semibold', isSelected ? 'text-white' : 'text-slate-900')}>
                {day.getDate()}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DaySelector;
