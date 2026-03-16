import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { DaySelector } from './DaySelector';
import { LearnerColumn } from './LearnerColumn';
import { LearnerSetup } from '../learners/LearnerSetup';
import { useFamily } from '../../features/family';
import { formatDate, getDayName } from '../../lib/dates';
import type { Learner } from '../../types/learner';
import type { SkillLevel } from '../../types/skillLevel';
import type { Block } from '../../types/block';

// Sample blocks for demo - in real app these come from the selected Pod
const SAMPLE_BLOCKS: Block[] = [
  {
    id: 'block-1',
    title: 'Flight Mathematics',
    subject: 'math',
    duration: 20,
    supportLevel: 'independent',
    content: {
      foundation: {
        objectives: ['Count objects up to 20', 'Recognize basic shapes'],
        activities: ['Counting parachutes', 'Shape sorting game'],
        resources: [],
        artifactPrompt: 'Draw your favorite shape',
      },
      intermediate: {
        objectives: ['Calculate fall times', 'Measure distances'],
        activities: ['Timing parachute drops', 'Recording measurements'],
        resources: [],
        artifactPrompt: 'Create a data table of your measurements',
      },
      advanced: {
        objectives: ['Analyze drop data', 'Create charts'],
        activities: ['Statistical analysis', 'Graph creation'],
        resources: [],
        artifactPrompt: 'Build a chart showing your findings',
      },
      pro: {
        objectives: ['Model air resistance', 'Predict outcomes'],
        activities: ['Mathematical modeling', 'Hypothesis testing'],
        resources: [],
        artifactPrompt: 'Write a report on your predictions vs results',
      },
    },
  },
  {
    id: 'block-2',
    title: 'Aerodynamics Science',
    subject: 'science',
    duration: 25,
    supportLevel: 'guided',
    content: {
      foundation: {
        objectives: ['Observe how things fall', 'Feel air resistance'],
        activities: ['Drop different objects', 'Fan experiments'],
        resources: [],
        artifactPrompt: 'Take a photo of your experiment',
      },
      intermediate: {
        objectives: ['Understand air resistance', 'Test parachute designs'],
        activities: ['Build mini parachutes', 'Compare fall speeds'],
        resources: [],
        artifactPrompt: 'Video your best parachute drop',
      },
      advanced: {
        objectives: ['Analyze drag forces', 'Optimize designs'],
        activities: ['Variable testing', 'Design iterations'],
        resources: [],
        artifactPrompt: 'Document your design process',
      },
      pro: {
        objectives: ['Apply fluid dynamics', 'Engineer solutions'],
        activities: ['Advanced prototyping', 'Peer review'],
        resources: [],
        artifactPrompt: 'Present your engineering solution',
      },
    },
  },
  {
    id: 'block-3',
    title: 'Flight Coding',
    subject: 'coding',
    duration: 20,
    supportLevel: 'independent',
    content: {
      foundation: {
        objectives: ['Sequence simple commands', 'Create animations'],
        activities: ['ScratchJr flying animation'],
        resources: [],
        artifactPrompt: 'Share your animation',
      },
      intermediate: {
        objectives: ['Build interactive games', 'Use loops'],
        activities: ['Scratch parachute game'],
        resources: [],
        artifactPrompt: 'Link to your Scratch project',
      },
      advanced: {
        objectives: ['Code simulations', 'Use variables'],
        activities: ['Python flight simulator'],
        resources: [],
        artifactPrompt: 'Share your Replit project',
      },
      pro: {
        objectives: ['Build data visualizations', 'API integration'],
        activities: ['Full-stack flight tracker'],
        resources: [],
        artifactPrompt: 'Deploy and share your app',
      },
    },
  },
  {
    id: 'block-4',
    title: 'French Aviation',
    subject: 'french',
    duration: 15,
    supportLevel: 'guided',
    content: {
      foundation: {
        objectives: ['Learn 5 aviation words', 'Practice pronunciation'],
        activities: ['Flashcard games', 'Singing songs'],
        resources: [],
        artifactPrompt: 'Record yourself saying the words',
      },
      intermediate: {
        objectives: ['Build aviation vocabulary', 'Simple sentences'],
        activities: ['Duolingo practice', 'Label diagrams'],
        resources: [],
        artifactPrompt: 'Write 3 sentences about flying',
      },
      advanced: {
        objectives: ['Read aviation texts', 'Discuss in French'],
        activities: ['Article reading', 'Conversation practice'],
        resources: [],
        artifactPrompt: 'Summarize an article in French',
      },
      pro: {
        objectives: ['Technical French', 'Present in French'],
        activities: ['Research presentation', 'Peer discussion'],
        resources: [],
        artifactPrompt: 'Give a 2-minute presentation in French',
      },
    },
  },
  {
    id: 'block-5',
    title: 'Team Challenge',
    subject: 'team',
    duration: 20,
    supportLevel: 'guided',
    content: {
      foundation: {
        objectives: ['Work together', 'Share materials'],
        activities: ['Group parachute building'],
        resources: [],
        artifactPrompt: 'Photo of team working together',
      },
      intermediate: {
        objectives: ['Collaborate on design', 'Give feedback'],
        activities: ['Team design challenge'],
        resources: [],
        artifactPrompt: 'Document your team process',
      },
      advanced: {
        objectives: ['Lead a project', 'Mentor others'],
        activities: ['Project management', 'Peer teaching'],
        resources: [],
        artifactPrompt: 'Reflection on leadership',
      },
      pro: {
        objectives: ['Facilitate learning', 'Coach peers'],
        activities: ['Run a workshop', 'Provide feedback'],
        resources: [],
        artifactPrompt: 'Workshop feedback summary',
      },
    },
  },
];

interface PlannerViewProps {
  className?: string;
}

export const PlannerView: React.FC<PlannerViewProps> = ({ className }) => {
  const { family, addLearner, updateLearner, removeLearner } = useFamily();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showLearnerSetup, setShowLearnerSetup] = useState(false);
  const [editingLearner, setEditingLearner] = useState<Learner | null>(null);

  const learners = family?.learners || [];

  const handleAddLearner = (data: {
    name: string;
    age: number;
    skillLevel: SkillLevel;
    avatar: string;
    interests?: string[];
  }) => {
    addLearner(data.name, data.age, data.skillLevel, data.avatar, undefined, {
      interests: data.interests,
    });
  };

  const handleEditLearner = (data: {
    name: string;
    age: number;
    skillLevel: SkillLevel;
    avatar: string;
    interests?: string[];
  }) => {
    if (editingLearner) {
      updateLearner(editingLearner.id, {
        ...data,
        preferences: {
          ...(editingLearner.preferences || {}),
          interests: data.interests,
        },
      });
    }
  };

  const handleDeleteLearner = () => {
    if (editingLearner) {
      removeLearner(editingLearner.id);
      setEditingLearner(null);
    }
  };

  return (
    <div className={cn('min-h-screen bg-slate-50', className)}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Daily Planner</h1>
              <p className="text-sm text-slate-600 mt-1">
                {getDayName(selectedDate)}, {formatDate(selectedDate, 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                icon={<Calendar className="h-4 w-4" />}
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setShowLearnerSetup(true)}
              >
                Add Learner
              </Button>
            </div>
          </div>
        </header>

        {/* Day Selector */}
        <DaySelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          className="mb-6"
        />

        {/* Main Content - 3 Column Planner */}
        {learners.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No learners yet</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Add your first learner to start planning their daily learning blocks.
            </p>
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setShowLearnerSetup(true)}
            >
              Add First Learner
            </Button>
          </Card>
        ) : (
          <div
            className={cn(
              'grid gap-6',
              learners.length === 1 && 'grid-cols-1 max-w-md',
              learners.length === 2 && 'grid-cols-1 md:grid-cols-2',
              learners.length >= 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            )}
          >
            {learners.map((learner) => (
              <LearnerColumn
                key={learner.id}
                learner={learner}
                blocks={SAMPLE_BLOCKS}
                onLearnerClick={() => setEditingLearner(learner)}
                onBlockStart={(blockId) => console.log('Start block:', blockId, 'for', learner.name)}
                onBlockComplete={(blockId) => console.log('Complete block:', blockId, 'for', learner.name)}
                onBlockSkip={(blockId) => console.log('Skip block:', blockId, 'for', learner.name)}
              />
            ))}
            
            {/* Add learner card */}
            {learners.length < 6 && (
              <button
                onClick={() => setShowLearnerSetup(true)}
                className="flex flex-col items-center justify-center gap-3 min-h-[300px] rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors"
              >
                <Plus className="h-8 w-8" />
                <span className="font-medium">Add Learner</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Learner Modal */}
      <LearnerSetup
        isOpen={showLearnerSetup}
        onClose={() => setShowLearnerSetup(false)}
        onSave={handleAddLearner}
      />

      {/* Edit Learner Modal */}
      <LearnerSetup
        isOpen={!!editingLearner}
        onClose={() => setEditingLearner(null)}
        onSave={handleEditLearner}
        onDelete={handleDeleteLearner}
        learner={editingLearner}
      />
    </div>
  );
};

export default PlannerView;
