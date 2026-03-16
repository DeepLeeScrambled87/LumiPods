// Energy Tracker - Monitor and adjust based on learner energy levels
import { useState } from 'react';
import { Zap, BatteryLow, BatteryMedium, BatteryFull, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface EnergyTrackerProps {
  learnerId: string;
  date: string;
  currentEnergy: 'high' | 'medium' | 'low';
  onEnergyChange: (energy: 'high' | 'medium' | 'low') => void;
}

export function EnergyTracker({
  learnerId: _learnerId,
  date: _date,
  currentEnergy,
  onEnergyChange,
}: EnergyTrackerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const energyLevels = [
    { 
      level: 'high' as const, 
      label: 'High Energy', 
      icon: BatteryFull, 
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      description: 'Ready for challenging tasks',
      emoji: '⚡',
    },
    { 
      level: 'medium' as const, 
      label: 'Medium Energy', 
      icon: BatteryMedium, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      description: 'Good for regular activities',
      emoji: '🔋',
    },
    { 
      level: 'low' as const, 
      label: 'Low Energy', 
      icon: BatteryLow, 
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      description: 'Need lighter activities or break',
      emoji: '😴',
    },
  ];

  const currentConfig = energyLevels.find(e => e.level === currentEnergy)!;
  const CurrentIcon = currentConfig.icon;

  const suggestions = {
    high: [
      'Great time for challenging learning blocks',
      'Tackle complex problem-solving activities',
      'Work on projects requiring deep focus',
    ],
    medium: [
      'Good for practice and reinforcement',
      'Creative activities work well now',
      'Consider a short break if needed',
    ],
    low: [
      'Take a break or do light activities',
      'Physical movement can help boost energy',
      'Consider rescheduling demanding tasks',
    ],
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Energy Level
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Details'}
        </Button>
      </div>

      {/* Current energy display */}
      <div className={`p-4 rounded-xl ${currentConfig.bgColor} mb-4`}>
        <div className="flex items-center gap-3">
          <div className="text-3xl">{currentConfig.emoji}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CurrentIcon className={`w-5 h-5 ${currentConfig.color}`} />
              <span className={`font-semibold ${currentConfig.color}`}>
                {currentConfig.label}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {currentConfig.description}
            </p>
          </div>
        </div>
      </div>

      {/* Energy selector */}
      <div className="flex gap-2 mb-4">
        {energyLevels.map((energy) => {
          const Icon = energy.icon;
          const isSelected = currentEnergy === energy.level;
          
          return (
            <button
              key={energy.level}
              onClick={() => onEnergyChange(energy.level)}
              className={`
                flex-1 p-3 rounded-lg border-2 transition-all
                ${isSelected 
                  ? `${energy.bgColor} border-current ${energy.color}` 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }
              `}
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? energy.color : 'text-slate-400'}`} />
              <p className={`text-xs font-medium ${isSelected ? energy.color : 'text-slate-500'}`}>
                {energy.label.split(' ')[0]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Suggestions */}
      {showDetails && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Suggestions for {currentConfig.label}:
          </h4>
          <ul className="space-y-2">
            {suggestions[currentEnergy].map((suggestion, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-amber-500">💡</span>
                <span className="text-slate-600 dark:text-slate-300">{suggestion}</span>
              </li>
            ))}
          </ul>

          {/* Energy trend */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Today's Energy Pattern
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-green-500">Morning</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-yellow-500">Afternoon</span>
                <Minus className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-red-500">Evening</span>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
