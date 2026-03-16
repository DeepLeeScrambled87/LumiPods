// Weekly Overview - See the whole week at a glance
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Clock, Target } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { scheduleService } from '../../services/scheduleService';
import type { DailySchedule } from '../../types/schedule';
import { BLOCK_TYPE_CONFIG } from '../../types/schedule';

interface WeeklyOverviewProps {
  learnerId: string;
  learnerName: string;
  familyId: string;
  podId?: string;
  weekNumber?: number;
  learnerSkillLevel?: 'foundation' | 'intermediate' | 'advanced' | 'pro';
  startDate: Date;
  onDaySelect: (date: Date) => void;
}

export function WeeklyOverview({
  learnerId,
  learnerName,
  familyId,
  podId,
  weekNumber,
  learnerSkillLevel = 'intermediate',
  startDate,
  onDaySelect,
}: WeeklyOverviewProps) {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(startDate);
    d.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
    return d;
  });

  const getWeekDays = () => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const getScheduleForDay = (date: Date): DailySchedule | null => {
    const dateStr = date.toISOString().split('T')[0];
    if (date.getDay() === 0 || date.getDay() === 6) {
      return scheduleService.getDailySchedule(learnerId, dateStr);
    }

    return (
      scheduleService.getDailySchedule(learnerId, dateStr) ||
      scheduleService.ensureDailySchedule(
        learnerId,
        dateStr,
        familyId,
        podId,
        weekNumber,
        learnerSkillLevel
      )
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + (direction === 'next' ? 7 : -7));
    setWeekStart(newStart);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getWeekStats = () => {
    let totalBlocks = 0;
    let completedBlocks = 0;
    let totalMinutes = 0;
    let completedMinutes = 0;

    weekDays.forEach(day => {
      const schedule = getScheduleForDay(day);
      if (schedule) {
        totalBlocks += schedule.blocks.length;
        completedBlocks += schedule.completedBlocks;
        totalMinutes += schedule.totalDuration;
        completedMinutes += schedule.blocks
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.actualDuration || b.duration), 0);
      }
    });

    return { totalBlocks, completedBlocks, totalMinutes, completedMinutes };
  };

  const stats = getWeekStats();
  const completionRate = stats.totalBlocks > 0 
    ? Math.round((stats.completedBlocks / stats.totalBlocks) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h2>
            <p className="text-sm text-slate-500">{learnerName}'s Week</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigateWeek('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Week Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <p className="text-2xl font-bold">{stats.totalBlocks}</p>
          <p className="text-xs text-slate-500">Total Blocks</p>
        </Card>
        <Card className="p-3 text-center">
          <Target className="w-5 h-5 mx-auto mb-1 text-green-500" />
          <p className="text-2xl font-bold">{stats.completedBlocks}</p>
          <p className="text-xs text-slate-500">Completed</p>
        </Card>
        <Card className="p-3 text-center">
          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-purple-500" />
          <p className="text-2xl font-bold">{completionRate}%</p>
          <p className="text-xs text-slate-500">Completion</p>
        </Card>
        <Card className="p-3 text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-amber-500" />
          <p className="text-2xl font-bold">{Math.floor(stats.completedMinutes / 60)}h</p>
          <p className="text-xs text-slate-500">Learning Time</p>
        </Card>
      </div>

      {/* Week Grid */}
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const schedule = getScheduleForDay(day);
            const dayCompletion = schedule && schedule.blocks.length > 0
              ? Math.round((schedule.completedBlocks / schedule.blocks.length) * 100)
              : 0;
            const isWeekend = index === 0 || index === 6;

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDaySelect(day)}
                className={`
                  p-3 rounded-xl cursor-pointer transition-all
                  ${isToday(day) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                  ${isWeekend ? 'bg-slate-50' : 'bg-white'}
                  hover:shadow-md border border-slate-200
                `}
              >
                <div className="text-center mb-2">
                  <p className="text-xs text-slate-500">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className={`text-lg font-semibold ${isToday(day) ? 'text-blue-600' : ''}`}>
                    {day.getDate()}
                  </p>
                </div>

                {schedule && schedule.blocks.length > 0 ? (
                  <>
                    {/* Mini block indicators */}
                    <div className="flex flex-wrap gap-1 mb-2 justify-center">
                      {schedule.blocks.slice(0, 6).map((block) => {
                        const config = BLOCK_TYPE_CONFIG[block.type];
                        return (
                          <span
                            key={block.id}
                            className={`w-2 h-2 rounded-full ${
                              block.status === 'completed' ? 'bg-green-500' :
                              block.status === 'skipped' ? 'bg-orange-500' :
                              'bg-slate-300'
                            }`}
                            title={`${config.icon} ${block.title}`}
                          />
                        );
                      })}
                      {schedule.blocks.length > 6 && (
                        <span className="text-xs text-slate-400">+{schedule.blocks.length - 6}</span>
                      )}
                    </div>

                    {/* Completion bar */}
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          dayCompletion === 100 ? 'bg-green-500' :
                          dayCompletion > 50 ? 'bg-blue-500' :
                          dayCompletion > 0 ? 'bg-amber-500' :
                          'bg-slate-300'
                        }`}
                        style={{ width: `${dayCompletion}%` }}
                      />
                    </div>
                    <p className="text-xs text-center mt-1 text-slate-500">
                      {schedule.completedBlocks}/{schedule.blocks.length}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-center text-slate-400 py-2">
                    {isWeekend ? 'Weekend' : 'No schedule'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
