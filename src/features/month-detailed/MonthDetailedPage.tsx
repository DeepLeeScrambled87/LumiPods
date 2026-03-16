import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  FileText, 
  ClipboardList, 
  Package, 
  Clock,
  AlertTriangle,
  ChevronRight,
  Rocket,
  Brain,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useFamily } from '../family';
import { ALL_CURRICULA, getCurriculumByPodId } from '../../data/curriculum';
import type { 
  WeekCurriculum, 
  SkillLevelId,
  RubricLevel,
  PodCurriculum,
} from '../../types/curriculum';
import { 
  SUBJECT_TAG_CONFIG, 
  RUBRIC_LEVEL_CONFIG, 
  SKILL_LEVEL_CONFIG 
} from '../../types/curriculum';

type TabId = 'overview' | 'tasks' | 'study' | 'evidence' | 'rubric' | 'materials' | 'dailyFlow' | 'resources';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList },
  { id: 'study', label: 'Study', icon: Brain },
  { id: 'evidence', label: 'Evidence', icon: CheckCircle2 },
  { id: 'rubric', label: 'Rubric', icon: FileText },
  { id: 'materials', label: 'Materials', icon: Package },
  { id: 'dailyFlow', label: 'Daily Flow', icon: Clock },
  { id: 'resources', label: 'Resources', icon: BookOpen },
];

// ============ WEEK CARD COMPONENT ============
interface WeekCardProps {
  week: WeekCurriculum;
  isSelected: boolean;
  onClick: () => void;
  progress: { tasks: number; evidence: number; rubric: number };
}

const WeekCard: React.FC<WeekCardProps> = ({ week, isSelected, onClick, progress }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 min-w-[180px] p-4 rounded-xl border-2 text-left transition-all',
        isSelected 
          ? 'border-slate-900 bg-slate-50 shadow-md' 
          : 'border-slate-200 bg-white hover:border-slate-300'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500">Week {week.weekNumber}</span>
        <div className="flex gap-1">
          <span className={cn('w-2 h-2 rounded-full', progress.tasks > 0 ? 'bg-blue-500' : 'bg-slate-200')} title={`Tasks: ${progress.tasks}%`} />
          <span className={cn('w-2 h-2 rounded-full', progress.evidence > 0 ? 'bg-green-500' : 'bg-slate-200')} title={`Evidence: ${progress.evidence}%`} />
          <span className={cn('w-2 h-2 rounded-full', progress.rubric > 0 ? 'bg-purple-500' : 'bg-slate-200')} title={`Rubric: ${progress.rubric}%`} />
        </div>
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{week.title}</h3>
      <div className="flex flex-wrap gap-1">
        {week.subjects.map((subject) => (
          <span 
            key={subject} 
            className={cn('text-xs px-2 py-0.5 rounded-full', SUBJECT_TAG_CONFIG[subject].color)}
          >
            {subject}
          </span>
        ))}
      </div>
    </button>
  );
};

// ============ OVERVIEW TAB ============
interface OverviewTabProps {
  week: WeekCurriculum;
  learners: { id: string; name: string; avatar: string; skillLevel: string }[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ week, learners }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Learning Targets */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">💡</span>
          <h3 className="font-semibold text-slate-900">Week {week.weekNumber}: {week.title}</h3>
        </div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Learning Targets</h4>
        <div className="space-y-3">
          {week.overview.learningTargets.map((target) => (
            <div key={target.subject} className="flex items-start gap-3">
              <span className="text-lg">{target.icon}</span>
              <div>
                <span className="font-medium text-slate-800 capitalize">{target.subject}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {target.skills.map((skill) => (
                    <span key={skill} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Safety Notes */}
        {week.overview.safetyNotes.length > 0 && (
          <div className="mt-5 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Safety Notes</span>
            </div>
            <ul className="space-y-1">
              {week.overview.safetyNotes.map((note, idx) => (
                <li key={idx} className="text-sm text-amber-700 flex items-center gap-2">
                  <span>•</span> {note.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Student Progress */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">👥</span>
          <h3 className="font-semibold text-slate-900">Student Progress</h3>
        </div>
        <div className="space-y-3">
          {learners.map((learner) => (
            <div key={learner.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="text-2xl">{learner.avatar}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{learner.name}</span>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    SKILL_LEVEL_CONFIG[learner.skillLevel as SkillLevelId]?.color || 'bg-slate-100'
                  )}>
                    {learner.skillLevel}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }} />
                  </div>
                  <span className="text-xs text-slate-500">0% Complete</span>
                </div>
              </div>
            </div>
          ))}
          {learners.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">No learners added yet</p>
          )}
        </div>
      </Card>
    </div>
  );
};

const isVisibleForSkillLevel = (skillLevels: SkillLevelId[], skillLevel: SkillLevelId): boolean =>
  skillLevels.includes(skillLevel);

interface StudyTabProps {
  curriculum: PodCurriculum;
  week: WeekCurriculum;
  selectedLearner: { id: string; name: string; skillLevel: string } | null;
}

const StudyTab: React.FC<StudyTabProps> = ({ curriculum, week, selectedLearner }) => {
  const skillLevel = (selectedLearner?.skillLevel || 'intermediate') as SkillLevelId;
  const visibleFlashcards = (week.flashcards || []).filter((item) => isVisibleForSkillLevel(item.skillLevels, skillLevel));
  const visibleQuestions = (week.quizQuestions || []).filter((item) => isVisibleForSkillLevel(item.skillLevels, skillLevel));
  const visibleTasks = (week.interactiveTasks || []).filter((item) => isVisibleForSkillLevel(item.skillLevels, skillLevel));
  const ageGuidance = curriculum.ageBandGuidance?.find((entry) => entry.skillLevel === skillLevel);

  return (
    <div className="grid xl:grid-cols-2 gap-6">
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Essential Questions</h3>
        </div>
        <div className="space-y-3">
          {(week.essentialQuestions || []).map((question) => (
            <div key={question} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {question}
            </div>
          ))}
          {week.weeklyProject && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-medium text-emerald-700 mb-1">Weekly Project</p>
              <p className="font-medium text-emerald-900">{week.weeklyProject.title}</p>
              <p className="text-sm text-emerald-800 mt-1">{week.weeklyProject.drivingQuestion}</p>
              <ul className="mt-3 space-y-1">
                {week.weeklyProject.deliverables.map((deliverable) => (
                  <li key={deliverable} className="text-sm text-emerald-800">
                    {deliverable}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-emerald-700 mt-3">
                {week.weeklyProject.skillLevelNotes[skillLevel]}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Age-Band Guidance</h3>
        </div>
        {ageGuidance ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">Focus</p>
              <p className="text-sm text-slate-800 mt-1">{ageGuidance.focus}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Support Strategies</p>
              <ul className="space-y-1">
                {ageGuidance.supportStrategies.map((strategy) => (
                  <li key={strategy} className="text-sm text-slate-700">{strategy}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Stretch Ideas</p>
              <ul className="space-y-1">
                {ageGuidance.extensionStrategies.map((strategy) => (
                  <li key={strategy} className="text-sm text-slate-700">{strategy}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No age-band guidance is configured for this learner yet.</p>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Flashcards</h3>
        </div>
        <div className="grid gap-3">
          {visibleFlashcards.map((card) => (
            <div key={card.id} className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Front</p>
                <p className="font-medium text-slate-900">{card.front}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs text-slate-500">Back</p>
                <p className="text-sm text-slate-700">{card.back}</p>
              </div>
            </div>
          ))}
          {visibleFlashcards.length === 0 && (
            <p className="text-sm text-slate-500">No flashcards are configured for this week.</p>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Quick Checks</h3>
        </div>
        <div className="space-y-3">
          {visibleQuestions.map((question) => (
            <div key={question.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">{question.prompt}</p>
              {question.options?.length ? (
                <ul className="mt-2 space-y-1">
                  {question.options.map((option) => (
                    <li key={option} className="text-sm text-slate-700">{option}</li>
                  ))}
                </ul>
              ) : null}
              <p className="text-xs text-slate-500 mt-2">Answer guide: {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(' | ') : question.correctAnswer}</p>
              <p className="text-xs text-slate-600 mt-1">{question.explanation}</p>
            </div>
          ))}
          {visibleQuestions.length === 0 && (
            <p className="text-sm text-slate-500">No quiz prompts are configured for this week.</p>
          )}
        </div>
      </Card>

      <Card className="p-5 xl:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Interactive Tasks</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {visibleTasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{task.title}</p>
                <Badge size="sm">{task.estimatedMinutes} min</Badge>
              </div>
              <p className="text-sm text-slate-600 mt-2">{task.description}</p>
              {task.resourceUrl ? (
                <a
                  href={task.resourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-sm text-sky-700 mt-3"
                >
                  Open resource
                </a>
              ) : null}
              {task.evidencePrompt ? (
                <p className="text-xs text-slate-500 mt-3">Evidence prompt: {task.evidencePrompt}</p>
              ) : null}
            </div>
          ))}
          {visibleTasks.length === 0 && (
            <p className="text-sm text-slate-500">No interactive tasks are configured for this week.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

interface ResourcesTabProps {
  curriculum: PodCurriculum;
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({ curriculum }) => {
  return (
    <div className="grid xl:grid-cols-2 gap-6">
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Sources and References</h3>
        </div>
        <div className="space-y-3">
          {(curriculum.references || []).map((reference) => (
            <div key={reference.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{reference.title}</p>
                <Badge size="sm">{reference.category}</Badge>
              </div>
              {reference.note ? <p className="text-sm text-slate-600 mt-2">{reference.note}</p> : null}
              <a href={reference.url} target="_blank" rel="noreferrer" className="inline-block text-sm text-sky-700 mt-3">
                Open source
              </a>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Support Assets</h3>
        </div>
        <div className="space-y-3">
          {(curriculum.supportingAssets || []).map((asset) => (
            <div key={asset.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{asset.title}</p>
                <Badge size="sm">{asset.type}</Badge>
              </div>
              {asset.description ? <p className="text-sm text-slate-600 mt-2">{asset.description}</p> : null}
              {asset.url ? (
                <a href={asset.url} target="_blank" rel="noreferrer" className="inline-block text-sm text-sky-700 mt-3">
                  Open asset
                </a>
              ) : (
                <p className="text-xs text-slate-500 mt-3">Ready to attach as an uploaded pod artifact later.</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Pacing Options</h3>
        </div>
        <div className="space-y-3">
          {(curriculum.pacingOptions || []).map((option) => (
            <div key={option.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{option.label}</p>
                <Badge size="sm">{option.totalWeeks} weeks</Badge>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                {option.sessionsPerWeek} sessions/week, {option.minutesPerSession} min/session
              </p>
              <p className="text-xs text-slate-500 mt-1">{option.notes}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Science Segments</h3>
        </div>
        <div className="space-y-3">
          {(curriculum.segments || []).map((segment) => (
            <div key={segment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="font-medium text-slate-900">{segment.title}</p>
              <p className="text-sm text-slate-600 mt-2">{segment.summary}</p>
              <p className="text-xs text-slate-500 mt-3">Guiding questions: {segment.guidingQuestions.join(' | ')}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ============ TASKS TAB ============
interface TasksTabProps {
  week: WeekCurriculum;
  selectedLearner: { id: string; name: string; skillLevel: string } | null;
  onSelectLearner: (id: string) => void;
  learners: { id: string; name: string; avatar: string; skillLevel: string }[];
}

const TasksTab: React.FC<TasksTabProps> = ({ week, selectedLearner, onSelectLearner, learners }) => {
  const skillLevel = (selectedLearner?.skillLevel || 'intermediate') as SkillLevelId;
  const tasks = week.tasksBySkillLevel[skillLevel] || week.tasksBySkillLevel.intermediate;
  const codeRequired = week.codeRequiredByLevel[skillLevel];

  return (
    <Card className="p-5">
      {/* Learner Selector */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm text-slate-600">Select Student:</span>
        <select
          value={selectedLearner?.id || ''}
          onChange={(e) => onSelectLearner(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
        >
          {learners.map((l) => (
            <option key={l.id} value={l.id}>
              {l.avatar} {l.name} ({l.skillLevel})
            </option>
          ))}
        </select>
      </div>

      {selectedLearner && (
        <div className="bg-slate-50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
              {selectedLearner.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">{selectedLearner.name} - Week {week.weekNumber}</h4>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                SKILL_LEVEL_CONFIG[skillLevel]?.color
              )}>
                {skillLevel} Level
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-slate-400" />
            <h5 className="font-medium text-slate-800">Task Steps</h5>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.stepNumber} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                  {task.stepNumber}
                </span>
                <span className="text-slate-700 pt-0.5">{task.description}</span>
              </div>
            ))}
          </div>

          {codeRequired && (
            <div className="mt-5 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-medium text-sm">Code Required</span>
              </div>
              <p className="text-xs text-purple-600 mt-1">◇ Yes</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// ============ EVIDENCE TAB ============
interface EvidenceTabProps {
  week: WeekCurriculum;
  selectedLearner: { id: string; name: string } | null;
}

const EvidenceTab: React.FC<EvidenceTabProps> = ({ week, selectedLearner }) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-5">
        <FileText className="h-5 w-5 text-slate-600" />
        <h3 className="font-semibold text-slate-900">Evidence Checklist - Week {week.weekNumber}</h3>
      </div>

      {selectedLearner && (
        <p className="text-sm text-slate-500 mb-4">For: {selectedLearner.name}</p>
      )}

      <div className="space-y-3">
        {week.evidence.items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <input
              type="checkbox"
              checked={checkedItems.has(item.id)}
              onChange={() => toggleItem(item.id)}
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={cn(
              'flex-1',
              checkedItems.has(item.id) ? 'text-slate-500 line-through' : 'text-slate-700'
            )}>
              {item.label}
            </span>
            {!item.isRequired && (
              <span className="text-xs text-slate-400">(optional)</span>
            )}
          </label>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          {checkedItems.size} of {week.evidence.items.length} items completed
        </p>
      </div>
    </Card>
  );
};

// ============ RUBRIC TAB ============
interface RubricTabProps {
  week: WeekCurriculum;
}

const RubricTab: React.FC<RubricTabProps> = ({ week }) => {
  const [scores, setScores] = useState<Record<string, RubricLevel>>({});

  const setScore = (criterionId: string, level: RubricLevel) => {
    setScores((prev) => ({ ...prev, [criterionId]: level }));
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-5">
        <FileText className="h-5 w-5 text-slate-600" />
        <h3 className="font-semibold text-slate-900">Assessment Rubric (4-Point Scale)</h3>
      </div>

      {/* Rubric Level Legend */}
      <div className="flex gap-2 mb-6">
        {(['E', 'D', 'P', 'M'] as RubricLevel[]).map((level) => (
          <div 
            key={level} 
            className={cn('flex-1 text-center py-2 rounded-lg', RUBRIC_LEVEL_CONFIG[level].bgColor)}
          >
            <span className={cn('font-bold text-lg', RUBRIC_LEVEL_CONFIG[level].color)}>{level}</span>
            <p className={cn('text-xs', RUBRIC_LEVEL_CONFIG[level].color)}>
              {RUBRIC_LEVEL_CONFIG[level].label}
            </p>
          </div>
        ))}
      </div>

      {/* Criteria */}
      <div className="space-y-6">
        {week.rubric.criteria.map((criterion) => (
          <div key={criterion.id} className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-slate-50">
              <div>
                <h4 className="font-semibold text-slate-900">{criterion.name}</h4>
                <p className="text-sm text-slate-500">{criterion.description}</p>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {/* Open assessment modal */}}
              >
                Assess
              </Button>
            </div>
            <div className="grid grid-cols-4 divide-x divide-slate-200">
              {(['E', 'D', 'P', 'M'] as RubricLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setScore(criterion.id, level)}
                  className={cn(
                    'p-3 text-left text-xs transition-colors',
                    scores[criterion.id] === level 
                      ? RUBRIC_LEVEL_CONFIG[level].bgColor 
                      : 'hover:bg-slate-50'
                  )}
                >
                  <span className={cn('font-semibold', RUBRIC_LEVEL_CONFIG[level].color)}>
                    {RUBRIC_LEVEL_CONFIG[level].label}
                  </span>
                  <p className="text-slate-600 mt-1">{criterion.levels[level]}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ============ MATERIALS TAB ============
interface MaterialsTabProps {
  week: WeekCurriculum;
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({ week }) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-5">
        <Package className="h-5 w-5 text-slate-600" />
        <h3 className="font-semibold text-slate-900">Core Materials - Week {week.weekNumber}</h3>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {week.materials.items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors text-left',
              checkedItems.has(item.id) 
                ? 'bg-green-50 border-green-300' 
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            )}
          >
            <span className={cn(
              'w-2 h-2 rounded-full',
              checkedItems.has(item.id) ? 'bg-green-500' : 'bg-blue-500'
            )} />
            <span className={cn(
              'text-sm',
              checkedItems.has(item.id) ? 'text-green-700' : 'text-slate-700'
            )}>
              {item.name}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          {checkedItems.size} of {week.materials.items.length} materials ready
        </p>
      </div>
    </Card>
  );
};

// ============ DAILY FLOW TAB ============
interface DailyFlowTabProps {
  week: WeekCurriculum;
}

const DailyFlowTab: React.FC<DailyFlowTabProps> = ({ week }) => {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="h-5 w-5 text-slate-600" />
        <h3 className="font-semibold text-slate-900">Suggested Daily Flow - Week {week.weekNumber}</h3>
      </div>

      <div className="space-y-3">
        {week.dailyFlow.days.map((day) => (
          <div 
            key={day.day} 
            className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="font-semibold text-slate-900 w-28">{day.day}</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <span className="text-slate-700 flex-1">{day.activities}</span>
            {day.duration && (
              <span className="text-xs text-slate-500">{day.duration} min</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

// ============ MAIN PAGE COMPONENT ============
export const MonthDetailedPage: React.FC = () => {
  const { family } = useFamily();
  const learners = useMemo(() => family?.learners ?? [], [family?.learners]);
  
  // State
  const [selectedPodId, setSelectedPodId] = useState<string>(ALL_CURRICULA[0]?.podId || '');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(learners[0]?.id || '');

  // Get curriculum data
  const curriculum = useMemo(() => getCurriculumByPodId(selectedPodId), [selectedPodId]);
  const currentWeek = useMemo(
    () => curriculum?.weeks.find((w) => w.weekNumber === selectedWeek),
    [curriculum, selectedWeek]
  );

  const selectedLearner = useMemo(
    () => learners.find((l) => l.id === selectedLearnerId) || learners[0],
    [learners, selectedLearnerId]
  );

  // Mock progress data (would come from service in real app)
  const weekProgress = { tasks: 0, evidence: 0, rubric: 0 };

  if (!curriculum || !currentWeek) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <Rocket className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Curriculum Available</h2>
          <p className="text-slate-500">Select a pod to view its detailed curriculum.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Month {curriculum.monthNumber}: {curriculum.podTitle}</h1>
              <Badge className="bg-white/20 text-white border-0">Detailed Structure</Badge>
              {curriculum.programHours ? (
                <Badge className="bg-white/20 text-white border-0">{curriculum.programHours} hr program</Badge>
              ) : null}
            </div>
            <p className="text-orange-100 max-w-2xl">{curriculum.description}</p>
          </div>
          <div className="text-right hidden md:block">
            <Button variant="secondary" size="sm" className="bg-white/20 border-0 text-white hover:bg-white/30">
              <Calendar className="h-4 w-4 mr-2" />
              Week {selectedWeek} Detailed
            </Button>
            <p className="text-xs text-orange-200 mt-2">
              <span className="text-orange-100 font-medium">Unlock Rule:</span> {curriculum.unlockRule}
            </p>
          </div>
        </div>
      </div>

      {/* Pod Selector (if multiple curricula) */}
      {ALL_CURRICULA.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedPodId}
            onChange={(e) => {
              setSelectedPodId(e.target.value);
              setSelectedWeek(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg"
          >
            {ALL_CURRICULA.map((c) => (
              <option key={c.podId} value={c.podId}>
                Month {c.monthNumber}: {c.podTitle}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Weekly Structure */}
      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-slate-600" />
          <h2 className="font-semibold text-slate-900">Weekly Structure</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {curriculum.weeks.map((week) => (
            <WeekCard
              key={week.weekNumber}
              week={week}
              isSelected={selectedWeek === week.weekNumber}
              onClick={() => setSelectedWeek(week.weekNumber)}
              progress={weekProgress}
            />
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab 
          week={currentWeek} 
          learners={learners.map(l => ({
            id: l.id,
            name: l.name,
            avatar: l.avatar || '👤',
            skillLevel: l.skillLevel || 'intermediate'
          }))}
        />
      )}
      {activeTab === 'tasks' && (
        <TasksTab
          week={currentWeek}
          selectedLearner={selectedLearner ? {
            id: selectedLearner.id,
            name: selectedLearner.name,
            skillLevel: selectedLearner.skillLevel || 'intermediate'
          } : null}
          onSelectLearner={setSelectedLearnerId}
          learners={learners.map(l => ({
            id: l.id,
            name: l.name,
            avatar: l.avatar || '👤',
            skillLevel: l.skillLevel || 'intermediate'
          }))}
        />
      )}
      {activeTab === 'study' && (
        <StudyTab
          curriculum={curriculum}
          week={currentWeek}
          selectedLearner={selectedLearner ? {
            id: selectedLearner.id,
            name: selectedLearner.name,
            skillLevel: selectedLearner.skillLevel || 'intermediate'
          } : null}
        />
      )}
      {activeTab === 'evidence' && (
        <EvidenceTab 
          week={currentWeek} 
          selectedLearner={selectedLearner ? { id: selectedLearner.id, name: selectedLearner.name } : null}
        />
      )}
      {activeTab === 'rubric' && <RubricTab week={currentWeek} />}
      {activeTab === 'materials' && <MaterialsTab week={currentWeek} />}
      {activeTab === 'dailyFlow' && <DailyFlowTab week={currentWeek} />}
      {activeTab === 'resources' && <ResourcesTab curriculum={curriculum} />}
    </div>
  );
};

export default MonthDetailedPage;
