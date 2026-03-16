import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  BookOpen, 
  Users, 
  Target,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { week1ParachuteDropTest } from '../data/week1ParachuteDropTest';
import { levelConfig } from '../data/learners';

const Week1Dashboard: React.FC = () => {
  const { family } = useAuth();
  const [selectedDay, setSelectedDay] = useState(1);
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());

  // Allow page to render even if family context hasn't hydrated yet

  const currentWeekData = week1ParachuteDropTest;
  const selectedDayData = currentWeekData.days.find((day: { day: number }) => day.day === selectedDay);

  const toggleBlockCompletion = (blockId: string) => {
    const newCompleted = new Set(completedBlocks);
    if (newCompleted.has(blockId)) {
      newCompleted.delete(blockId);
    } else {
      newCompleted.add(blockId);
    }
    setCompletedBlocks(newCompleted);
  };

  const getCompletionStats = () => {
    if (!selectedDayData) return { completed: 0, total: 0 };
    const total = selectedDayData.blocks.length;
    const completed = selectedDayData.blocks.filter((block: { id: string }) => 
      completedBlocks.has(`${selectedDay}-${block.id}`)
    ).length;
    return { completed, total };
  };

  const { completed, total } = getCompletionStats();
  const completionPercentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Week 1: Parachute Drop Test 🪂
            </h1>
            <p className="text-gray-600">
              {currentWeekData.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-2xl font-bold text-primary-600">
              {completed}/{total} blocks
            </div>
          </div>
        </div>
      </div>

      {/* Day Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Daily Schedule</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
              disabled={selectedDay === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 bg-primary-100 text-primary-800 rounded-lg font-medium">
              Day {selectedDay}
            </span>
            <button
              onClick={() => setSelectedDay(Math.min(5, selectedDay + 1))}
              disabled={selectedDay === 5}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Day Selection Tabs */}
        <div className="flex space-x-2 mb-6">
          {currentWeekData.days.map((day: { day: number }) => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(day.day)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDay === day.day
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Day {selectedDay} Progress</span>
            <span className="text-sm text-gray-600">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Day Overview */}
        {selectedDayData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{selectedDayData.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{selectedDayData.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-600">{selectedDayData.estimatedTime}</span>
              </div>
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-600">{selectedDayData.blocks.length} blocks</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Learning Blocks */}
      {selectedDayData && (
        <div className="space-y-6">
          {selectedDayData.blocks.map((block: { id: string; title: string; description: string; duration: string; supportLevel: string; type: string; objectives?: string[]; resources?: { name: string; url?: string }[] }) => {
            const blockId = `${selectedDay}-${block.id}`;
            const isCompleted = completedBlocks.has(blockId);
            
            return (
              <div key={block.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <button
                        onClick={() => toggleBlockCompletion(blockId)}
                        className="mr-4 mt-1"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-success-600" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                      <div>
                        <h3 className={`text-lg font-semibold mb-2 ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {block.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">{block.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-gray-600">{block.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-gray-600 capitalize">{block.supportLevel}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            block.type === 'core' ? 'bg-primary-100 text-primary-800' :
                            block.type === 'extension' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {block.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Learning Objectives */}
                  {block.objectives && block.objectives.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Learning Objectives
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-6">
                        {block.objectives.map((objective: string, idx: number) => (
                          <li key={idx}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Resources */}
                  {block.resources && block.resources.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Resources
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                        {block.resources.map((resource: { name: string; url?: string }, idx: number) => (
                          <div key={idx} className="text-sm text-gray-600 flex items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                            {resource.name}
                            {resource.url && (
                              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary-600 hover:text-primary-700">
                                →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Level Differentiation */}
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Level Adaptations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(family?.learners ?? []).map((learner) => (
                        <div key={learner.id} className={`p-3 rounded-lg border ${levelConfig[learner.skillLevel as keyof typeof levelConfig]?.color.replace('text-', 'border-').replace('800', '200') || 'border-gray-200'}`}>
                          <div className="flex items-center mb-2">
                            <span className="text-lg mr-2">{learner.avatar}</span>
                            <div>
                              <div className="font-medium text-gray-900">{learner.name}</div>
                              <div className={`text-xs ${levelConfig[learner.skillLevel as keyof typeof levelConfig]?.color || 'text-gray-600'}`}>
                                {learner.skillLevel}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Focus: {levelConfig[learner.skillLevel as keyof typeof levelConfig]?.focusTime || 20}min
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Alert */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">Safety Reminder</h3>
            <p className="text-amber-800 text-sm">
              Adult supervision required for all parachute testing activities. Review safety protocols in Materials section before starting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Week1Dashboard;
