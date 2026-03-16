// Resource Manager - Track shared resources across learners
import { useState } from 'react';
import { Package, AlertTriangle, Clock, Users, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { scheduleService } from '../../services/scheduleService';
import { COMMON_RESOURCES, type SharedResource } from '../../types/schedule';

interface ResourceManagerProps {
  date: string;
  learnerIds: string[];
  learnerNames: Record<string, string>;
}

interface ResourceUsage {
  resource: SharedResource;
  usages: {
    learnerId: string;
    blockId: string;
    blockTitle: string;
    startTime: string;
    endTime: string;
  }[];
  hasConflict: boolean;
}

export function ResourceManager({
  date,
  learnerIds,
  learnerNames,
}: ResourceManagerProps) {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  const getResourceUsages = (): ResourceUsage[] => {
    const usageMap = new Map<string, ResourceUsage>();

    // Initialize with common resources
    COMMON_RESOURCES.forEach(resource => {
      usageMap.set(resource.id, {
        resource,
        usages: [],
        hasConflict: false,
      });
    });

    // Collect usages from all learners
    learnerIds.forEach(learnerId => {
      const schedule = scheduleService.getDailySchedule(learnerId, date);
      if (!schedule) return;

      schedule.blocks.forEach(block => {
        block.resources.forEach(resource => {
          const usage = usageMap.get(resource.id);
          if (usage) {
            usage.usages.push({
              learnerId,
              blockId: block.id,
              blockTitle: block.title,
              startTime: block.startTime,
              endTime: block.endTime,
            });
          }
        });
      });
    });

    // Check for conflicts (overlapping times)
    usageMap.forEach(usage => {
      if (usage.usages.length > 1) {
        for (let i = 0; i < usage.usages.length; i++) {
          for (let j = i + 1; j < usage.usages.length; j++) {
            const a = usage.usages[i];
            const b = usage.usages[j];
            if (timesOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
              usage.hasConflict = true;
              break;
            }
          }
          if (usage.hasConflict) break;
        }
      }
    });

    return Array.from(usageMap.values());
  };

  const timesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };
    const s1 = toMinutes(start1), e1 = toMinutes(end1);
    const s2 = toMinutes(start2), e2 = toMinutes(end2);
    return s1 < e2 && s2 < e1;
  };

  const resourceUsages = getResourceUsages();
  const conflictCount = resourceUsages.filter(r => r.hasConflict).length;
  const inUseCount = resourceUsages.filter(r => r.usages.length > 0).length;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-500" />
          Shared Resources
        </h3>
        {conflictCount > 0 && (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {conflictCount} conflict{conflictCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 bg-slate-50 rounded-lg text-center">
          <p className="text-lg font-bold text-slate-700">{COMMON_RESOURCES.length}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg text-center">
          <p className="text-lg font-bold text-blue-700">{inUseCount}</p>
          <p className="text-xs text-blue-500">In Use</p>
        </div>
        <div className={`p-2 rounded-lg text-center ${conflictCount > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
          <p className={`text-lg font-bold ${conflictCount > 0 ? 'text-red-700' : 'text-green-700'}`}>
            {conflictCount > 0 ? conflictCount : '✓'}
          </p>
          <p className={`text-xs ${conflictCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {conflictCount > 0 ? 'Conflicts' : 'No Conflicts'}
          </p>
        </div>
      </div>

      {/* Resource List */}
      <div className="space-y-2">
        {resourceUsages.map(({ resource, usages, hasConflict }) => (
          <div
            key={resource.id}
            className={`
              p-3 rounded-lg border-2 transition-all cursor-pointer
              ${hasConflict ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'}
              ${selectedResource === resource.id ? 'ring-2 ring-blue-500' : ''}
            `}
            onClick={() => setSelectedResource(
              selectedResource === resource.id ? null : resource.id
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{resource.icon}</span>
                <div>
                  <p className="font-medium">{resource.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{resource.type}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {usages.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Users className="w-3 h-3" />
                    {usages.length} use{usages.length > 1 ? 's' : ''}
                  </span>
                )}
                {hasConflict && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                {usages.length === 0 && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>

            {/* Expanded usage details */}
            {selectedResource === resource.id && usages.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                {usages.map((usage) => (
                  <div
                    key={`${usage.learnerId}-${usage.blockId}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                        {learnerNames[usage.learnerId]?.[0] || '?'}
                      </span>
                      <span>{learnerNames[usage.learnerId] || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{usage.startTime} - {usage.endTime}</span>
                    </div>
                  </div>
                ))}
                
                {hasConflict && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                    ⚠️ Time conflict detected! Consider rescheduling one of the blocks.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Setup/Cleanup times */}
      <div className="mt-4 p-3 bg-amber-50 rounded-lg">
        <p className="text-sm font-medium text-amber-700 mb-2">📋 Setup Reminders</p>
        <div className="space-y-1 text-xs text-amber-600">
          {resourceUsages
            .filter(r => r.usages.length > 0 && (r.resource.setupTime || r.resource.cleanupTime))
            .map(({ resource, usages }) => (
              <p key={resource.id}>
                {resource.icon} {resource.name}: 
                {resource.setupTime && ` ${resource.setupTime}min setup`}
                {resource.setupTime && resource.cleanupTime && ','}
                {resource.cleanupTime && ` ${resource.cleanupTime}min cleanup`}
                {' '}(first use: {usages[0].startTime})
              </p>
            ))}
        </div>
      </div>
    </Card>
  );
}
