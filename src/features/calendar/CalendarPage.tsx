import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Layers,
  CheckCircle,
  Gamepad2,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useFamily } from '../family';
import { getPodsForSchoolYear } from '../../data/yearlyPods';
import { EnhancedDailyView } from './EnhancedDailyView';
import { WeeklyOverview } from './WeeklyOverview';
import { ResourceManager } from './ResourceManager';
import { planningRuleDataService } from '../../services/learningRecordsService';
import { scheduleService } from '../../services/scheduleService';

type ViewMode = 'month' | 'year' | 'pods' | 'daily' | 'week';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Event types for calendar
interface ScheduledEvent {
  id: string;
  date: string;
  title: string;
  type: 'block' | 'milestone' | 'exhibition' | 'fieldwork' | 'vr' | 'french';
  time?: string;
  duration?: number;
  learnerId?: string;
  completed?: boolean;
  icon?: string;
}

const generateMonthEvents = (year: number, month: number, learnerIds: string[]): ScheduledEvent[] => {
  const events: ScheduledEvent[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    learnerIds.forEach((learnerId) => {
      const schedule = scheduleService.getDailySchedule(learnerId, dateStr);
      if (!schedule) return;

      schedule.blocks.forEach((block) => {
        events.push({
          id: `${dateStr}-${learnerId}-${block.id}`,
          date: dateStr,
          title: block.title,
          type: block.type === 'vr' ? 'vr' : block.type === 'french' ? 'french' : 'block',
          time: block.suggestedTime || block.startTime,
          duration: block.duration,
          learnerId,
          completed: block.status === 'completed',
          icon: block.type === 'vr' ? '🥽' : block.type === 'french' ? '🇫🇷' : undefined,
        });
      });
    });
  }

  return events;
};

export const CalendarPage: React.FC = () => {
  const { family } = useFamily();
  const learners = useMemo(() => family?.learners ?? [], [family?.learners]);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schoolYearStart] = useState(9);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(learners[0]?.id || '');

  const pods = getPodsForSchoolYear(schoolYearStart);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    if (!learners.length) {
      setSelectedLearnerId('');
      return;
    }

    if (!selectedLearnerId || !learners.some((learner) => learner.id === selectedLearnerId)) {
      setSelectedLearnerId(learners[0].id);
    }
  }, [learners, selectedLearnerId]);

  const monthEvents = useMemo(
    () => generateMonthEvents(currentYear, currentMonth, selectedLearnerId ? [selectedLearnerId] : learners.map((learner) => learner.id)),
    [currentYear, currentMonth, selectedLearnerId, learners]
  );
  const selectedLearnerRule =
    family && selectedLearnerId
      ? planningRuleDataService.getCachedActiveForLearner(
          family.id,
          selectedLearnerId,
          currentDate.toISOString().split('T')[0]
        )
      : null;
  const hasFamilyLearnerRules = family
    ? planningRuleDataService.getCachedActiveForFamily(family.id, currentDate.toISOString().split('T')[0]).length > 0
    : false;
  const selectedLearnerActivePodId =
    family && selectedLearnerId
      ? selectedLearnerRule?.primaryPodId || (hasFamilyLearnerRules ? undefined : family.currentPodId || undefined)
      : family?.currentPodId || undefined;

  // Navigation
  const goToPrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const getEventsForDate = (date: string) => monthEvents.filter((e) => e.date === date);

  const getCurrentPodForMonth = (month: number) => pods.find((p) => p.month === month + 1);

  // Event type colors
  const getEventColor = (type: ScheduledEvent['type']) => {
    switch (type) {
      case 'block': return 'bg-blue-100 text-blue-700';
      case 'milestone': return 'bg-purple-100 text-purple-700';
      case 'exhibition': return 'bg-amber-100 text-amber-700';
      case 'fieldwork': return 'bg-teal-100 text-teal-700';
      case 'vr': return 'bg-pink-100 text-pink-700';
      case 'french': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 bg-slate-50" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const events = getEventsForDate(dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      const isSelected = selectedDate === dateStr;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(dateStr)}
          className={cn(
            'h-28 border-t border-slate-200 p-1.5 transition-colors cursor-pointer hover:bg-slate-50',
            isToday && 'bg-blue-50',
            isSelected && 'ring-2 ring-blue-500'
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={cn(
                'text-sm font-medium w-6 h-6 flex items-center justify-center',
                isToday && 'bg-blue-600 text-white rounded-full'
              )}
            >
              {day}
            </span>
            {events.some(e => e.type === 'vr') && (
              <Gamepad2 className="h-3 w-3 text-pink-500" />
            )}
          </div>
          <div className="space-y-0.5 overflow-hidden">
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={cn(
                  'text-[10px] px-1 py-0.5 rounded truncate flex items-center gap-1',
                  getEventColor(event.type),
                  event.completed && 'opacity-50 line-through'
                )}
              >
                {event.icon && <span>{event.icon}</span>}
                {event.title}
              </div>
            ))}
            {events.length > 3 && (
              <div className="text-[10px] text-slate-500 px-1">+{events.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  // Render selected date details
  const renderDateDetails = () => {
    if (!selectedDate) return null;
    const events = getEventsForDate(selectedDate);
    const dateObj = new Date(selectedDate + 'T12:00:00');

    return (
      <Card padding="lg" className="mt-4">
        <h3 className="font-semibold text-slate-900 mb-3">
          {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">
            No live events scheduled yet. Open the daily view to create a schedule for this date.
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  getEventColor(event.type)
                )}
              >
                <span className="text-xl">{event.icon || (event.type === 'block' ? '📚' : '📅')}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{event.title}</p>
                  {event.time && (
                    <p className="text-xs opacity-75">
                      {event.time} {event.duration && `• ${event.duration} min`}
                    </p>
                  )}
                </div>
                {event.completed && <CheckCircle className="h-4 w-4 text-emerald-600" />}
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  // Render year overview
  const renderYearOverview = () => (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
      {MONTHS.map((month, index) => {
        const pod = getCurrentPodForMonth(index);
        const isCurrentMonth = index === new Date().getMonth();

        return (
          <Card
            key={month}
            padding="md"
            className={cn(
              'cursor-pointer hover:shadow-md transition-shadow',
              isCurrentMonth && 'ring-2 ring-blue-500'
            )}
            onClick={() => {
              setCurrentDate(new Date(currentYear, index, 1));
              setViewMode('month');
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900">{month}</span>
              {pod && <span className="text-lg">{pod.icon}</span>}
            </div>
            {pod && <p className="text-xs text-slate-500 line-clamp-2">{pod.title}</p>}
            {isCurrentMonth && <Badge variant="info" size="sm" className="mt-2">Current</Badge>}
          </Card>
        );
      })}
    </div>
  );

  // Render pods timeline
  const renderPodsTimeline = () => {
    const currentMonthNum = new Date().getMonth() + 1;

    return (
      <div className="space-y-4">
        {pods.map((pod, index) => {
          const isActive = pod.month === currentMonthNum;
          const isPast = pod.month < currentMonthNum;
          const complexityColors = {
            1: 'bg-green-500',
            2: 'bg-blue-500',
            3: 'bg-purple-500',
            4: 'bg-amber-500',
          };

          return (
            <div
              key={pod.id}
              className={cn(
                'flex gap-4 p-4 rounded-xl border transition-all',
                isActive && 'bg-blue-50 border-blue-200 shadow-sm',
                isPast && 'opacity-60',
                !isActive && !isPast && 'bg-white border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-xl',
                    isActive ? 'bg-blue-600 text-white' : isPast ? 'bg-emerald-100' : 'bg-slate-100'
                  )}
                >
                  {isPast ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : pod.icon}
                </div>
                {index < pods.length - 1 && (
                  <div className={cn('w-0.5 flex-1 mt-2', isPast ? 'bg-emerald-300' : 'bg-slate-200')} />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{pod.title}</h3>
                      {isActive && <Badge variant="info" size="sm">Active</Badge>}
                      {isPast && <Badge variant="success" size="sm">Completed</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 mb-2">
                      Month {pod.sequence} • {MONTHS[pod.month - 1]}
                    </p>
                    <p className="text-sm text-slate-600 mb-3">{pod.drivingQuestion}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <div className={cn('w-2 h-2 rounded-full', complexityColors[pod.complexityLevel])} />
                      <span className="text-xs text-slate-500">Level {pod.complexityLevel}</span>
                    </div>
                    <Badge variant="default" size="sm">{pod.autonomyLevel}</Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {pod.subjects.map((subject) => (
                    <span key={subject} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const currentPod = getCurrentPodForMonth(currentMonth);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CalendarIcon className="h-6 w-6 text-indigo-600" />
                <h1 className="text-2xl font-semibold text-slate-900">Calendar</h1>
              </div>
              <p className="text-sm text-slate-600">
                View your learning schedule, VR sessions, and pod timeline
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('daily')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1',
                  viewMode === 'daily' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <Clock className="h-4 w-4" />
                Daily
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'week' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'month' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('year')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'year' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                Year
              </button>
              <button
                onClick={() => setViewMode('pods')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1',
                  viewMode === 'pods' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <Layers className="h-4 w-4" />
                Pods
              </button>
            </div>
          </div>
        </header>

        {/* Daily View - Enhanced Learning Management */}
        {viewMode === 'daily' && (
          <div className="space-y-4">
            {/* Learner selector */}
            {learners.length > 1 && (
              <Card padding="md">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-600">Learner:</span>
                  <div className="flex gap-2">
                    {learners.map((learner) => (
                      <button
                        key={learner.id}
                        onClick={() => setSelectedLearnerId(learner.id)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          selectedLearnerId === learner.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {learner.name}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )}
            
            {selectedLearnerId && (
              <EnhancedDailyView
                learnerId={selectedLearnerId}
                learnerName={learners.find(l => l.id === selectedLearnerId)?.name || 'Learner'}
                familyId={family?.id || ''}
                podId={selectedLearnerActivePodId}
                weekNumber={family?.currentWeek}
                learnerSkillLevel={
                  learners.find((learner) => learner.id === selectedLearnerId)?.skillLevel as
                    'foundation' | 'intermediate' | 'advanced' | 'pro' | undefined
                }
                date={currentDate}
                onDateChange={setCurrentDate}
              />
            )}
          </div>
        )}

        {/* Weekly View */}
        {viewMode === 'week' && (
          <div className="space-y-4">
            {/* Learner selector */}
            {learners.length > 1 && (
              <Card padding="md">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-600">Learner:</span>
                  <div className="flex gap-2">
                    {learners.map((learner) => (
                      <button
                        key={learner.id}
                        onClick={() => setSelectedLearnerId(learner.id)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          selectedLearnerId === learner.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {learner.name}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )}
            
            {selectedLearnerId && (
              <WeeklyOverview
                learnerId={selectedLearnerId}
                learnerName={learners.find(l => l.id === selectedLearnerId)?.name || 'Learner'}
                familyId={family?.id || ''}
                podId={selectedLearnerActivePodId}
                weekNumber={family?.currentWeek}
                learnerSkillLevel={
                  learners.find((learner) => learner.id === selectedLearnerId)?.skillLevel as
                    'foundation' | 'intermediate' | 'advanced' | 'pro' | undefined
                }
                startDate={currentDate}
                onDaySelect={(date) => {
                  setCurrentDate(date);
                  setViewMode('daily');
                }}
              />
            )}

            {/* Resource Manager */}
            {learners.length > 0 && (
              <ResourceManager
                date={currentDate.toISOString().split('T')[0]}
                learnerIds={learners.map(l => l.id)}
                learnerNames={Object.fromEntries(learners.map(l => [l.id, l.name]))}
              />
            )}
          </div>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <div className="space-y-4">
            <Card padding="md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={goToPrevMonth}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {MONTHS[currentMonth]} {currentYear}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  {currentPod && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-lg">{currentPod.icon}</span>
                      <span>{currentPod.title}</span>
                    </div>
                  )}
                  <Button variant="secondary" size="sm" onClick={goToToday}>Today</Button>
                </div>
              </div>
            </Card>

            {learners.length > 1 && (
              <Card padding="md">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-600">Learner:</span>
                  <div className="flex gap-2 flex-wrap">
                    {learners.map((learner) => (
                      <button
                        key={learner.id}
                        onClick={() => setSelectedLearnerId(learner.id)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          selectedLearnerId === learner.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        {learner.name}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            <Card padding="none" className="overflow-hidden">
              <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                {DAYS.map((day) => (
                  <div key={day} className="py-3 text-center text-sm font-medium text-slate-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">{renderCalendarGrid()}</div>
            </Card>

            {monthEvents.length === 0 && (
              <Card padding="lg" className="border-dashed border-slate-300 bg-white">
                <p className="text-sm text-slate-500">
                  This month is empty until you create live schedules in the daily view.
                </p>
              </Card>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-100" />
                <span className="text-slate-600">Scheduled Block</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-pink-100" />
                <span className="text-slate-600">🥽 VR Session</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-indigo-100" />
                <span className="text-slate-600">🇫🇷 French</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-emerald-600" />
                <span className="text-slate-600">Completed</span>
              </div>
            </div>

            {/* Selected date details */}
            {renderDateDetails()}
          </div>
        )}

        {/* Year View */}
        {viewMode === 'year' && (
          <div className="space-y-6">
            <Card padding="md">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">{currentYear} Overview</h2>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentYear - 1, 0, 1))}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentYear + 1, 0, 1))}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
            {renderYearOverview()}
          </div>
        )}

        {/* Pods Timeline View */}
        {viewMode === 'pods' && (
          <div className="space-y-6">
            <Card padding="md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Learning Pods Timeline</h2>
                  <p className="text-sm text-slate-500">12 themed pods with progressive complexity</p>
                </div>
                <Badge variant="info">School Year: {MONTHS[schoolYearStart - 1]} Start</Badge>
              </div>
            </Card>
            {renderPodsTimeline()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
