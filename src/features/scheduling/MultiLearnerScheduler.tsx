// Multi-Learner Scheduler - Coordinate schedules when sharing resources like VR headset
import React, { useState, useMemo } from 'react';
import { useFamily } from '../family/FamilyContext';
import { Card, CardContent, Button, Avatar, Badge } from '../../components/ui';
import type { Learner } from '../../types/learner';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  learnerId: string;
  activity: string;
  type: 'vr' | 'french' | 'shared-resource' | 'regular';
  resource?: string;
}

interface Conflict {
  slot1: TimeSlot;
  slot2: TimeSlot;
  resource: string;
}

const SHARED_RESOURCES = [
  { id: 'vr-headset', name: 'VR Headset', icon: '🥽' },
  { id: 'tablet', name: 'Learning Tablet', icon: '📱' },
  { id: 'microscope', name: 'Microscope', icon: '🔬' },
  { id: 'art-supplies', name: 'Art Supplies', icon: '🎨' },
  { id: 'parent-time', name: 'Parent Instruction', icon: '👨‍👩‍👧' },
];

export const MultiLearnerScheduler: React.FC = () => {
  const { family } = useFamily();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showConflictResolver, setShowConflictResolver] = useState(false);

  // Mock schedule data - in real app, fetch from database
  const [schedules, setSchedules] = useState<Record<string, TimeSlot[]>>(() => {
    if (!family) return {};
    const initial: Record<string, TimeSlot[]> = {};
    family.learners.forEach(l => {
      initial[l.id] = generateMockSchedule(l.id);
    });
    return initial;
  });

  // Detect conflicts
  const conflicts = useMemo(() => {
    const found: Conflict[] = [];
    const allSlots = Object.values(schedules).flat();
    
    for (let i = 0; i < allSlots.length; i++) {
      for (let j = i + 1; j < allSlots.length; j++) {
        const slot1 = allSlots[i];
        const slot2 = allSlots[j];
        
        if (slot1.learnerId === slot2.learnerId) continue;
        if (!slot1.resource || !slot2.resource) continue;
        if (slot1.resource !== slot2.resource) continue;
        
        // Check time overlap
        if (timesOverlap(slot1.startTime, slot1.endTime, slot2.startTime, slot2.endTime)) {
          found.push({ slot1, slot2, resource: slot1.resource });
        }
      }
    }
    return found;
  }, [schedules]);

  const resolveConflict = (conflict: Conflict, keepSlot: 'slot1' | 'slot2') => {
    const slotToMove = keepSlot === 'slot1' ? conflict.slot2 : conflict.slot1;
    
    // Find next available time
    const newStartTime = addMinutes(slotToMove.endTime, 30);
    const duration = getMinutesDiff(slotToMove.startTime, slotToMove.endTime);
    const newEndTime = addMinutes(newStartTime, duration);
    
    setSchedules(prev => ({
      ...prev,
      [slotToMove.learnerId]: prev[slotToMove.learnerId].map(s =>
        s.id === slotToMove.id ? { ...s, startTime: newStartTime, endTime: newEndTime } : s
      ),
    }));
  };

  if (!family || family.learners.length === 0) {
    return <div className="p-6 text-center text-gray-500">Add learners to use the scheduler</div>;
  }

  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Family Schedule</h1>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
          {conflicts.length > 0 && (
            <Button variant="secondary" onClick={() => setShowConflictResolver(true)}>
              ⚠️ {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </div>

      {/* Resource Legend */}
      <div className="flex flex-wrap gap-2">
        {SHARED_RESOURCES.map(r => (
          <Badge key={r.id}>
            {r.icon} {r.name}
          </Badge>
        ))}
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid border-b dark:border-gray-700" style={{ gridTemplateColumns: `80px repeat(${family.learners.length}, 1fr)` }}>
              <div className="p-3 font-medium text-gray-500 text-sm">Time</div>
              {family.learners.map(learner => (
                <div key={learner.id} className="p-3 border-l dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Avatar name={learner.name} emoji={learner.avatar} size="sm" />
                    <span className="font-medium">{learner.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Time Rows */}
            {hours.map(hour => (
              <div
                key={hour}
                className="grid border-b dark:border-gray-700"
                style={{ gridTemplateColumns: `80px repeat(${family.learners.length}, 1fr)`, minHeight: '60px' }}
              >
                <div className="p-2 text-sm text-gray-500 border-r dark:border-gray-700">
                  {formatHour(hour)}
                </div>
                {family.learners.map(learner => (
                  <div key={learner.id} className="relative border-l dark:border-gray-700 p-1">
                    {schedules[learner.id]?.filter(s => getHour(s.startTime) === hour).map(slot => (
                      <ScheduleBlock
                        key={slot.id}
                        slot={slot}
                        hasConflict={conflicts.some(c => c.slot1.id === slot.id || c.slot2.id === slot.id)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conflict Resolver Modal */}
      {showConflictResolver && conflicts.length > 0 && (
        <ConflictResolver
          conflicts={conflicts}
          learners={family.learners}
          onResolve={resolveConflict}
          onClose={() => setShowConflictResolver(false)}
        />
      )}
    </div>
  );
};


// Schedule Block Component
interface ScheduleBlockProps {
  slot: TimeSlot;
  hasConflict: boolean;
}

const ScheduleBlock: React.FC<ScheduleBlockProps> = ({ slot, hasConflict }) => {
  const typeColors = {
    vr: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 text-purple-800 dark:text-purple-200',
    french: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 text-blue-800 dark:text-blue-200',
    'shared-resource': 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 text-amber-800 dark:text-amber-200',
    regular: 'bg-gray-100 dark:bg-gray-800 border-gray-300 text-gray-800 dark:text-gray-200',
  };

  return (
    <div className={`p-2 rounded-lg border text-xs ${typeColors[slot.type]} ${hasConflict ? 'ring-2 ring-red-500' : ''}`}>
      <div className="font-medium truncate">{slot.activity}</div>
      <div className="text-[10px] opacity-75">{slot.startTime} - {slot.endTime}</div>
      {slot.resource && (
        <div className="mt-1 flex items-center gap-1">
          <span>{SHARED_RESOURCES.find(r => r.id === slot.resource)?.icon}</span>
        </div>
      )}
    </div>
  );
};

// Conflict Resolver Component
interface ConflictResolverProps {
  conflicts: Conflict[];
  learners: Learner[];
  onResolve: (conflict: Conflict, keep: 'slot1' | 'slot2') => void;
  onClose: () => void;
}

const ConflictResolver: React.FC<ConflictResolverProps> = ({ conflicts, learners, onResolve, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const conflict = conflicts[currentIndex];

  const getLearnerName = (id: string) => learners.find(l => l.id === id)?.name || 'Unknown';
  const resource = SHARED_RESOURCES.find(r => r.id === conflict.resource);

  const handleResolve = (keep: 'slot1' | 'slot2') => {
    onResolve(conflict, keep);
    if (currentIndex < conflicts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Resolve Schedule Conflict</h2>
          <span className="text-sm text-gray-500">{currentIndex + 1} of {conflicts.length}</span>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-medium">
            <span>⚠️</span>
            <span>{resource?.icon} {resource?.name} is double-booked</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 border rounded-lg dark:border-gray-700">
            <div className="font-medium mb-2">{getLearnerName(conflict.slot1.learnerId)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{conflict.slot1.activity}</div>
            <div className="text-sm text-gray-500">{conflict.slot1.startTime} - {conflict.slot1.endTime}</div>
            <Button size="sm" className="mt-3 w-full" onClick={() => handleResolve('slot1')}>
              Keep This
            </Button>
          </div>
          <div className="p-4 border rounded-lg dark:border-gray-700">
            <div className="font-medium mb-2">{getLearnerName(conflict.slot2.learnerId)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{conflict.slot2.activity}</div>
            <div className="text-sm text-gray-500">{conflict.slot2.startTime} - {conflict.slot2.endTime}</div>
            <Button size="sm" className="mt-3 w-full" onClick={() => handleResolve('slot2')}>
              Keep This
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center">
          The other activity will be moved to the next available time slot.
        </p>

        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={onClose}>Skip All</Button>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function generateMockSchedule(learnerId: string): TimeSlot[] {
  const slots: TimeSlot[] = [
    { id: `${learnerId}-1`, startTime: '09:00', endTime: '09:45', learnerId, activity: 'Math Practice', type: 'regular' },
    { id: `${learnerId}-2`, startTime: '10:00', endTime: '10:30', learnerId, activity: 'VR Science', type: 'vr', resource: 'vr-headset' },
    { id: `${learnerId}-3`, startTime: '11:00', endTime: '11:30', learnerId, activity: 'French with Lumi', type: 'french' },
    { id: `${learnerId}-4`, startTime: '13:00', endTime: '14:00', learnerId, activity: 'Project Work', type: 'shared-resource', resource: 'art-supplies' },
  ];
  return slots;
}

function timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const s1 = toMins(start1), e1 = toMins(end1), s2 = toMins(start2), e2 = toMins(end2);
  return s1 < e2 && s2 < e1;
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function getMinutesDiff(start: string, end: string): number {
  const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  return toMins(end) - toMins(start);
}

function formatHour(hour: number): string {
  return hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
}

function getHour(time: string): number {
  return parseInt(time.split(':')[0], 10);
}

export default MultiLearnerScheduler;
