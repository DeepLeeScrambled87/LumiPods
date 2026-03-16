import React, { useEffect, useMemo, useState } from 'react';
import {
  Settings,
  User,
  Users,
  Bell,
  Clock,
  Gift,
  Trash2,
  Edit2,
  Plus,
  Save,
  ChevronRight,
  Lock,
  Sun,
  Moon,
  Monitor,
  Palette,
  Brain,
  Mic,
  Volume2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/cn';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { useFamily } from '../family';
import { useTheme } from '../../contexts/ThemeContext';
import { SKILL_LEVELS } from '../../data/skillLevels';
import {
  DEFAULT_LEARNER_AVATAR,
  LEARNER_AVATAR_OPTIONS,
} from '../../lib/learnerAvatars';
import type { Learner } from '../../types/learner';
import type { SkillLevel } from '../../types/skillLevel';
import type { FamilySettings } from '../../types/family';
import { foundationalRailService } from '../../services/foundationalRailService';
import {
  checkOllamaAvailability,
  configureLLM,
  configureSpeech,
  getLLMConfig,
  getOllamaModels,
  getSpeechConfig,
  type LLMProvider,
  type SpeechProvider,
} from '../../services/llmService';

type SettingsTab = 'family' | 'learners' | 'schedule' | 'rewards' | 'notifications' | 'appearance' | 'ai';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'family', label: 'Family', icon: <Users className="h-4 w-4" /> },
  { id: 'learners', label: 'Learners', icon: <User className="h-4 w-4" /> },
  { id: 'schedule', label: 'Schedule', icon: <Clock className="h-4 w-4" /> },
  { id: 'rewards', label: 'Rewards', icon: <Gift className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
  { id: 'ai', label: 'AI & Voice', icon: <Brain className="h-4 w-4" /> },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

export const SettingsPage: React.FC = () => {
  const { family, updateSettings, addLearner, updateLearner, removeLearner } = useFamily();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('family');
  const [showAddLearner, setShowAddLearner] = useState(false);
  const [editingLearner, setEditingLearner] = useState<Learner | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form states
  const [familyName, setFamilyName] = useState(family?.name || '');
  const [newLearnerName, setNewLearnerName] = useState('');
  const [newLearnerAge, setNewLearnerAge] = useState(8);
  const [newLearnerSkill, setNewLearnerSkill] = useState<SkillLevel>('foundation');
  const [newLearnerAvatar, setNewLearnerAvatar] = useState(DEFAULT_LEARNER_AVATAR);
  const [newLearnerPin, setNewLearnerPin] = useState('');
  const [newLearnerInterests, setNewLearnerInterests] = useState('');
  const [llmProvider, setLlmProvider] = useState<LLMProvider>(getLLMConfig().provider);
  const [ollamaUrl, setOllamaUrl] = useState(getLLMConfig().ollamaUrl || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(getLLMConfig().ollamaModel || 'llama3.2');
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);
  const [openaiProxyUrl, setOpenaiProxyUrl] = useState(
    getLLMConfig().openaiProxyUrl || '/api/openai'
  );
  const [openaiApiKey, setOpenaiApiKey] = useState(getLLMConfig().openaiApiKey || '');
  const [openaiModel, setOpenaiModel] = useState(getLLMConfig().openaiModel || 'gpt-4o-mini');
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState(
    getLLMConfig().openaiBaseUrl || 'https://api.openai.com'
  );
  const [speechProvider, setSpeechProvider] = useState<SpeechProvider>(getSpeechConfig().provider);
  const [autoSpeakReplies, setAutoSpeakReplies] = useState(getSpeechConfig().autoSpeakReplies);
  const [openaiVoice, setOpenaiVoice] = useState(getSpeechConfig().openaiVoice || 'alloy');
  const [openaiTtsModel, setOpenaiTtsModel] = useState(getSpeechConfig().openaiTtsModel || 'gpt-4o-mini-tts');
  const [localTtsUrl, setLocalTtsUrl] = useState(getSpeechConfig().localTtsUrl || '');
  const [localTtsVoice, setLocalTtsVoice] = useState(getSpeechConfig().localTtsVoice || 'default');
  const [mathsRailSelections, setMathsRailSelections] = useState<Record<string, string>>({});
  const [railRevision, setRailRevision] = useState(0);

  const settings = family?.settings;
  const learners = useMemo(() => family?.learners || [], [family?.learners]);
  const mathsTracks = useMemo(
    () => foundationalRailService.getTracksForRail('maths'),
    []
  );

  useEffect(() => {
    if (!family) {
      setMathsRailSelections({});
      return;
    }

    const nextSelections = Object.fromEntries(
      learners.map((learner) => {
        const existing = foundationalRailService.getAssignment(family.id, learner.id, 'maths');
        const fallbackTrack = foundationalRailService.getTrackForSkillLevel('maths', learner.skillLevel);
        return [learner.id, existing?.trackId || fallbackTrack?.id || ''];
      })
    );

    setMathsRailSelections(nextSelections);
  }, [family, learners, railRevision]);

  useEffect(() => {
    if (activeTab !== 'ai' || llmProvider !== 'ollama') {
      return;
    }

    setIsCheckingOllama(true);
    Promise.all([checkOllamaAvailability(ollamaUrl), getOllamaModels(ollamaUrl)])
      .then(([available, models]) => {
        if (!available) {
          setOllamaModels([]);
          return;
        }

        setOllamaModels(models);
        if (models.length > 0 && !models.includes(ollamaModel)) {
          setOllamaModel(models[0]);
        }
      })
      .finally(() => setIsCheckingOllama(false));
  }, [activeTab, llmProvider, ollamaUrl, ollamaModel]);

  const handleSaveSettings = (updates: Partial<FamilySettings>) => {
    updateSettings(updates);
    toast.success('Settings saved');
  };

  const handleAddLearner = async () => {
    if (!newLearnerName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      await Promise.resolve(
        addLearner(
          newLearnerName.trim(),
          newLearnerAge,
          newLearnerSkill,
          newLearnerAvatar,
          newLearnerPin.trim() || undefined,
          {
            interests: newLearnerInterests
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
          }
        )
      );
      toast.success(`${newLearnerName.trim()} added!`);
      setShowAddLearner(false);
      setNewLearnerName('');
      setNewLearnerAge(8);
      setNewLearnerSkill('foundation');
      setNewLearnerAvatar(DEFAULT_LEARNER_AVATAR);
      setNewLearnerPin('');
      setNewLearnerInterests('');
    } catch (error) {
      console.error('Failed to add learner:', error);
      toast.error('Could not add learner');
    }
  };

  const handleUpdateLearner = async () => {
    if (!editingLearner) return;

    try {
      await Promise.resolve(updateLearner(editingLearner.id, {
        ...editingLearner,
        pin: editingLearner.pin?.trim() || undefined,
        preferences: {
          ...(editingLearner.preferences || {}),
          interests: (editingLearner.preferences?.interests || []).filter(Boolean),
        },
      }));
      toast.success('Learner updated');
      setEditingLearner(null);
    } catch (error) {
      console.error('Failed to update learner:', error);
      toast.error('Could not update learner');
    }
  };

  const handleDeleteLearner = async (learnerId: string) => {
    try {
      await Promise.resolve(removeLearner(learnerId));
      toast.success('Learner removed');
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to remove learner:', error);
      toast.error('Could not remove learner');
    }
  };

  const handleSaveAISettings = () => {
    configureLLM({
      provider: llmProvider,
      ollamaUrl: ollamaUrl.trim() || 'http://localhost:11434',
      ollamaModel: ollamaModel.trim() || 'llama3.2',
      openaiProxyUrl: openaiProxyUrl.trim() || '',
      openaiApiKey: openaiApiKey.trim(),
      openaiModel: openaiModel.trim() || 'gpt-4o-mini',
      openaiBaseUrl: openaiBaseUrl.trim() || 'https://api.openai.com',
    });

    configureSpeech({
      provider: speechProvider,
      autoSpeakReplies,
      openaiVoice,
      openaiTtsModel: openaiTtsModel.trim() || 'gpt-4o-mini-tts',
      localTtsUrl: localTtsUrl.trim(),
      localTtsVoice: localTtsVoice.trim() || 'default',
    });

    toast.success('AI and voice settings saved');
  };

  const handleAssignMathsRail = (learnerId: string) => {
    if (!family) return;

    const trackId = mathsRailSelections[learnerId];
    const track = mathsTracks.find((entry) => entry.id === trackId);
    if (!track) {
      toast.error('Choose a maths rail track first');
      return;
    }

    foundationalRailService.setAssignment(
      family.id,
      learnerId,
      'maths',
      track.id,
      track.skillLevel,
      new Date().toISOString().split('T')[0]
    );
    setRailRevision((value) => value + 1);
    toast.success(`Assigned ${track.title}`);
  };

  const handleClearMathsRail = (learnerId: string) => {
    if (!family) return;
    foundationalRailService.clearAssignment(family.id, learnerId, 'maths');
    setRailRevision((value) => value + 1);
    toast.success('Maths rail removed for learner');
  };

  const refreshOllamaStatus = async () => {
    setIsCheckingOllama(true);
    try {
      const [available, models] = await Promise.all([
        checkOllamaAvailability(ollamaUrl),
        getOllamaModels(ollamaUrl),
      ]);
      if (!available) {
        setOllamaModels([]);
        toast.error('Could not reach Ollama at the configured URL');
        return;
      }

      setOllamaModels(models);
      if (models.length > 0 && !models.includes(ollamaModel)) {
        setOllamaModel(models[0]);
      }
      toast.success(models.length > 0 ? `Found ${models.length} Ollama models` : 'Ollama is online');
    } finally {
      setIsCheckingOllama(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-6 w-6 text-slate-600" />
            <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          </div>
          <p className="text-sm text-slate-600">
            Manage your family, learners, and preferences
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-56 flex-shrink-0">
            <Card padding="sm">
              <nav className="space-y-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Family Settings */}
            {activeTab === 'family' && (
              <Card padding="lg">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Family Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Family Name
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        placeholder="The Smith Family"
                      />
                      <Button
                        variant="primary"
                        icon={<Save className="h-4 w-4" />}
                        onClick={() => {
                          // Would update family name in context
                          toast.success('Family name updated');
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Timezone
                    </label>
                    <Select
                      value={settings?.timezone || 'America/New_York'}
                      onChange={(e) => handleSaveSettings({ timezone: e.target.value })}
                      options={TIMEZONES}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      School Year Start Month
                    </label>
                    <Select
                      value="9"
                      onChange={() => toast.info('School year configuration coming soon')}
                      options={[
                        { value: '1', label: 'January' },
                        { value: '8', label: 'August' },
                        { value: '9', label: 'September' },
                      ]}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Pods will be sequenced starting from this month
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Learners Management */}
            {activeTab === 'learners' && (
              <>
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Learners</h2>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Plus className="h-4 w-4" />}
                      onClick={() => setShowAddLearner(true)}
                    >
                      Add Learner
                    </Button>
                  </div>

                  {learners.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No learners yet</p>
                      <Button
                        variant="secondary"
                        className="mt-4"
                        onClick={() => setShowAddLearner(true)}
                      >
                        Add Your First Learner
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {learners.map((learner) => (
                        <div
                          key={learner.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar emoji={learner.avatar} size="lg" />
                            <div>
                              <h3 className="font-medium text-slate-900">{learner.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>Age {learner.age}</span>
                                <span>•</span>
                                <Badge variant="default" size="sm">
                                  {SKILL_LEVELS[learner.skillLevel]?.label || learner.skillLevel}
                                </Badge>
                                {learner.pin && (
                                  <Badge variant="default" size="sm" className="bg-slate-200 text-slate-700">
                                    <Lock className="h-3 w-3" />
                                    PIN
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Edit2 className="h-4 w-4" />}
                              onClick={() => setEditingLearner(learner)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="h-4 w-4 text-red-500" />}
                              onClick={() => setShowDeleteConfirm(learner.id)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            )}

            {/* Schedule Settings */}
            {activeTab === 'schedule' && (
              <Card padding="lg">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Schedule Preferences</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Daily Start Time
                      </label>
                      <Input
                        type="time"
                        value={settings?.dailyStartTime || '09:00'}
                        onChange={(e) => handleSaveSettings({ dailyStartTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Daily End Time
                      </label>
                      <Input
                        type="time"
                        value={settings?.dailyEndTime || '14:30'}
                        onChange={(e) => handleSaveSettings({ dailyEndTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Week Starts On
                    </label>
                    <Select
                      value={String(settings?.weekStartsOn || 1)}
                      onChange={(e) => handleSaveSettings({ weekStartsOn: Number(e.target.value) as 0 | 1 })}
                      options={[
                        { value: '0', label: 'Sunday' },
                        { value: '1', label: 'Monday' },
                        { value: '6', label: 'Saturday' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Timer Style
                    </label>
                    <Select
                      value={settings?.timerStyle || 'pomodoro'}
                      onChange={(e) => handleSaveSettings({ timerStyle: e.target.value as 'pomodoro' | 'countdown' | 'stopwatch' })}
                      options={[
                        { value: 'pomodoro', label: 'Pomodoro (25/5 intervals)' },
                        { value: 'countdown', label: 'Countdown Timer' },
                        { value: 'stopwatch', label: 'Stopwatch' },
                      ]}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">Enable Timer</p>
                      <p className="text-sm text-slate-500">Show timer during learning blocks</p>
                    </div>
                    <button
                      onClick={() => handleSaveSettings({ enableTimer: !settings?.enableTimer })}
                      className={cn(
                        'w-12 h-6 rounded-full transition-colors relative',
                        settings?.enableTimer ? 'bg-emerald-500' : 'bg-slate-300'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                          settings?.enableTimer ? 'translate-x-6' : 'translate-x-0.5'
                        )}
                      />
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-200 space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Foundational Rails</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Rails run continuously alongside the monthly pod mix. They do not count against the 3-pod limit.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                      <p className="font-medium text-blue-900">Maths Rail</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Assign a maths rail per learner so daily maths blocks follow the right progression, even while thematic pods change.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {learners.length === 0 ? (
                        <p className="text-sm text-slate-500">Add a learner to start assigning foundational rails.</p>
                      ) : (
                        learners.map((learner) => {
                          const currentAssignment = family
                            ? foundationalRailService.getAssignment(family.id, learner.id, 'maths')
                            : null;
                          const assignedTrack = currentAssignment
                            ? mathsTracks.find((track) => track.id === currentAssignment.trackId)
                            : null;

                          return (
                            <div
                              key={`maths-rail-${learner.id}`}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                  <p className="font-medium text-slate-900">{learner.name}</p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <Badge variant="default" size="sm">
                                      Learner level: {SKILL_LEVELS[learner.skillLevel]?.label || learner.skillLevel}
                                    </Badge>
                                    {assignedTrack ? (
                                      <Badge variant="info" size="sm">
                                        Active rail: {assignedTrack.title}
                                      </Badge>
                                    ) : (
                                      <Badge variant="default" size="sm">
                                        No maths rail assigned
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<Trash2 className="h-4 w-4" />}
                                    onClick={() => handleClearMathsRail(learner.id)}
                                    disabled={!currentAssignment}
                                  >
                                    Unassign
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<Save className="h-4 w-4" />}
                                    onClick={() => handleAssignMathsRail(learner.id)}
                                  >
                                    Save Rail
                                  </Button>
                                </div>
                              </div>

                              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                                <Select
                                  label="Maths rail track"
                                  value={mathsRailSelections[learner.id] || ''}
                                  onChange={(e) =>
                                    setMathsRailSelections((current) => ({
                                      ...current,
                                      [learner.id]: e.target.value,
                                    }))
                                  }
                                  options={mathsTracks.map((track) => ({
                                    value: track.id,
                                    label: `${track.title} (${track.sessionLengthMinutes} min, ${track.sessionsPerWeek}x/week)`,
                                  }))}
                                />
                                <div className="rounded-xl border border-slate-200 bg-white p-3">
                                  <p className="text-xs font-medium text-slate-500 mb-1">Current guidance</p>
                                  <p className="text-sm text-slate-900">
                                    {(mathsTracks.find((track) => track.id === (mathsRailSelections[learner.id] || '')) || assignedTrack)?.description ||
                                      'Choose a maths rail track for this learner.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Rewards Settings */}
            {activeTab === 'rewards' && (
              <Card padding="lg">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Rewards & Points</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">Enable Points System</p>
                      <p className="text-sm text-slate-500">Award points for completing blocks</p>
                    </div>
                    <button
                      onClick={() => handleSaveSettings({ enablePoints: !settings?.enablePoints })}
                      className={cn(
                        'w-12 h-6 rounded-full transition-colors relative',
                        settings?.enablePoints ? 'bg-emerald-500' : 'bg-slate-300'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                          settings?.enablePoints ? 'translate-x-6' : 'translate-x-0.5'
                        )}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">Enable Rewards Shop</p>
                      <p className="text-sm text-slate-500">Allow learners to redeem points</p>
                    </div>
                    <button
                      onClick={() => handleSaveSettings({ enableRewards: !settings?.enableRewards })}
                      className={cn(
                        'w-12 h-6 rounded-full transition-colors relative',
                        settings?.enableRewards ? 'bg-emerald-500' : 'bg-slate-300'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                          settings?.enableRewards ? 'translate-x-6' : 'translate-x-0.5'
                        )}
                      />
                    </button>
                  </div>

                  <div className="pt-4">
                    <Button variant="secondary" icon={<ChevronRight className="h-4 w-4" />}>
                      Manage Custom Rewards
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <Card padding="lg">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">Daily Reminders</p>
                      <p className="text-sm text-slate-500">Get reminded to start learning</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-emerald-500 relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 translate-x-6" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">Streak Alerts</p>
                      <p className="text-sm text-slate-500">Warn when streak is at risk</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-emerald-500 relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 translate-x-6" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">Weekly Summary</p>
                      <p className="text-sm text-slate-500">Email summary of progress</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-slate-300 relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <Card padding="lg">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Appearance</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setTheme('light')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                          theme === 'light'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <Sun className="h-6 w-6 text-amber-500" />
                        <span className="text-sm font-medium text-slate-700">Light</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                          theme === 'dark'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <Moon className="h-6 w-6 text-indigo-500" />
                        <span className="text-sm font-medium text-slate-700">Dark</span>
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                          theme === 'system'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <Monitor className="h-6 w-6 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">System</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {theme === 'system' 
                        ? 'Automatically matches your device settings' 
                        : theme === 'dark' 
                        ? 'Dark mode is easier on the eyes in low light' 
                        : 'Light mode provides the best readability'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-500">
                      More customization options coming soon, including accent colors and font sizes.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'ai' && (
              <Card padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">AI & Voice Runtime</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Configure Lumi chat, local Ollama, and spoken replies. These credentials stay in this browser only.
                    </p>
                  </div>
                  <Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={handleSaveAISettings}>
                    Save AI Settings
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-4 w-4 text-slate-600" />
                      <h3 className="font-medium text-slate-900">Chat Provider</h3>
                    </div>
                    <div className="space-y-4">
                      <Select
                        value={llmProvider}
                        onChange={(e) => setLlmProvider(e.target.value as LLMProvider)}
                        options={[
                          { value: 'ollama', label: 'Ollama (local)' },
                          { value: 'openai', label: 'OpenAI API' },
                          { value: 'mock', label: 'Offline demo mode' },
                        ]}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Ollama URL"
                          value={ollamaUrl}
                          onChange={(e) => setOllamaUrl(e.target.value)}
                          placeholder="http://localhost:11434"
                        />
                        <div className="space-y-2">
                          {ollamaModels.length > 0 ? (
                            <Select
                              label="Ollama model"
                              value={ollamaModel}
                              onChange={(e) => setOllamaModel(e.target.value)}
                              options={ollamaModels.map((model) => ({ value: model, label: model }))}
                            />
                          ) : (
                            <Input
                              label="Ollama model"
                              value={ollamaModel}
                              onChange={(e) => setOllamaModel(e.target.value)}
                              placeholder="llama3.2"
                            />
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void refreshOllamaStatus()}
                            loading={isCheckingOllama}
                          >
                            Check Ollama
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="OpenAI proxy URL"
                          value={openaiProxyUrl}
                          onChange={(e) => setOpenaiProxyUrl(e.target.value)}
                          placeholder="/api/openai"
                          hint="Preferred for production. The browser calls this proxy and the server holds the real OpenAI API key."
                        />
                        <Input
                          label="OpenAI model"
                          value={openaiModel}
                          onChange={(e) => setOpenaiModel(e.target.value)}
                          placeholder="gpt-4o-mini"
                        />
                      </div>

                      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        Production-safe path: keep the proxy URL filled and leave the browser API key blank. Run the proxy server with <code>OPENAI_API_KEY</code> on the server side.
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Direct OpenAI API key"
                          type="password"
                          value={openaiApiKey}
                          onChange={(e) => setOpenaiApiKey(e.target.value)}
                          placeholder="sk-..."
                          hint="Optional local/dev fallback only. Leave blank when using the proxy."
                        />
                        <Input
                          label="Direct OpenAI base URL"
                          value={openaiBaseUrl}
                          onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                          placeholder="https://api.openai.com"
                          hint="Advanced fallback for direct or compatible endpoints. Not needed when using the proxy."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Volume2 className="h-4 w-4 text-slate-600" />
                      <h3 className="font-medium text-slate-900">Speech & Voice</h3>
                    </div>
                    <div className="space-y-4">
                      <Select
                        value={speechProvider}
                        onChange={(e) => setSpeechProvider(e.target.value as SpeechProvider)}
                        options={[
                          { value: 'browser', label: 'Browser voice (local fallback)' },
                          { value: 'openai', label: 'OpenAI natural TTS' },
                          { value: 'local', label: 'Local TTS endpoint' },
                        ]}
                      />

                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">Auto-speak Lumi replies</p>
                          <p className="text-sm text-slate-500">
                            Useful for conversational French and read-aloud support.
                          </p>
                        </div>
                        <button
                          onClick={() => setAutoSpeakReplies((current) => !current)}
                          className={cn(
                            'w-12 h-6 rounded-full transition-colors relative',
                            autoSpeakReplies ? 'bg-emerald-500' : 'bg-slate-300'
                          )}
                        >
                          <div
                            className={cn(
                              'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                              autoSpeakReplies ? 'translate-x-6' : 'translate-x-0.5'
                            )}
                          />
                        </button>
                      </div>

                      {(speechProvider === 'openai' || speechProvider === 'local') && (
                        <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                          Browser mic dictation is still used for voice input. This setting changes how Lumi speaks back.
                        </p>
                      )}

                      {speechProvider === 'openai' && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <Select
                            value={openaiVoice}
                            onChange={(e) => setOpenaiVoice(e.target.value)}
                            options={[
                              { value: 'alloy', label: 'Alloy' },
                              { value: 'ash', label: 'Ash' },
                              { value: 'coral', label: 'Coral' },
                              { value: 'echo', label: 'Echo' },
                              { value: 'fable', label: 'Fable' },
                              { value: 'nova', label: 'Nova' },
                              { value: 'onyx', label: 'Onyx' },
                              { value: 'sage', label: 'Sage' },
                              { value: 'shimmer', label: 'Shimmer' },
                            ]}
                          />
                          <Input
                            label="OpenAI TTS model"
                            value={openaiTtsModel}
                            onChange={(e) => setOpenaiTtsModel(e.target.value)}
                            placeholder="gpt-4o-mini-tts"
                          />
                        </div>
                      )}

                      {speechProvider === 'local' && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <Input
                            label="Local TTS endpoint"
                            value={localTtsUrl}
                            onChange={(e) => setLocalTtsUrl(e.target.value)}
                            placeholder="http://localhost:8880/tts"
                            hint="Point this at a local speech server such as a Piper bridge or another OpenAI-compatible TTS service."
                          />
                          <Input
                            label="Local voice name"
                            value={localTtsVoice}
                            onChange={(e) => setLocalTtsVoice(e.target.value)}
                            placeholder="default"
                          />
                        </div>
                      )}

                      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-900">
                          <Mic className="h-4 w-4 text-slate-500" />
                          <p className="font-medium">Voice input today</p>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          Lumi uses the browser Web Speech microphone for dictation. OpenAI and local settings currently improve reply voice quality, not mic capture.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Learner Modal */}
      <Modal
        isOpen={showAddLearner}
        onClose={() => setShowAddLearner(false)}
        title="Add Learner"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <Input
              value={newLearnerName}
              onChange={(e) => setNewLearnerName(e.target.value)}
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
            <Input
              type="number"
              min={4}
              max={18}
              value={newLearnerAge}
              onChange={(e) => setNewLearnerAge(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Skill Level</label>
            <Select
              value={newLearnerSkill}
              onChange={(e) => setNewLearnerSkill(e.target.value as SkillLevel)}
              options={Object.entries(SKILL_LEVELS).map(([key, config]) => ({
                value: key,
                label: config.label,
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Avatar</label>
            <div className="grid grid-cols-5 gap-2">
              {LEARNER_AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setNewLearnerAvatar(avatar.id)}
                  className={cn(
                    'rounded-xl border p-2 transition-all',
                    newLearnerAvatar === avatar.id
                      ? 'bg-blue-100 ring-2 ring-blue-500'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200'
                  )}
                  title={avatar.label}
                >
                  <Avatar src={avatar.src} alt={avatar.alt} size="md" className="mx-auto" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Learner PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={newLearnerPin}
              onChange={(e) => setNewLearnerPin(e.target.value)}
              placeholder="Optional PIN"
              hint="Leave blank for open learner access on this device."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Interests</label>
            <Input
              value={newLearnerInterests}
              onChange={(e) => setNewLearnerInterests(e.target.value)}
              placeholder="soccer, drawing, space"
              hint="Comma-separated interests used for personalized examples, projects, and Lumi tutor prompts."
            />
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowAddLearner(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddLearner}>
              Add Learner
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Edit Learner Modal */}
      <Modal
        isOpen={!!editingLearner}
        onClose={() => setEditingLearner(null)}
        title="Edit Learner"
        size="md"
      >
        {editingLearner && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <Input
                value={editingLearner.name}
                onChange={(e) => setEditingLearner({ ...editingLearner, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <Input
                type="number"
                min={4}
                max={18}
                value={editingLearner.age}
                onChange={(e) => setEditingLearner({ ...editingLearner, age: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Skill Level</label>
              <Select
                value={editingLearner.skillLevel}
                onChange={(e) => setEditingLearner({ ...editingLearner, skillLevel: e.target.value as SkillLevel })}
                options={Object.entries(SKILL_LEVELS).map(([key, config]) => ({
                  value: key,
                  label: config.label,
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Avatar</label>
              <div className="grid grid-cols-5 gap-2">
                {LEARNER_AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setEditingLearner({ ...editingLearner, avatar: avatar.id })}
                    className={cn(
                      'rounded-xl border p-2 transition-all',
                      editingLearner.avatar === avatar.id
                        ? 'bg-blue-100 ring-2 ring-blue-500'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200'
                    )}
                    title={avatar.label}
                  >
                    <Avatar src={avatar.src} alt={avatar.alt} size="md" className="mx-auto" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Learner PIN</label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={editingLearner.pin || ''}
                onChange={(e) => setEditingLearner({ ...editingLearner, pin: e.target.value })}
                placeholder="Optional PIN"
                hint="Clear the PIN to let this learner open their dashboard without a code."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Interests</label>
              <Input
                value={(editingLearner.preferences?.interests || []).join(', ')}
                onChange={(e) =>
                  setEditingLearner({
                    ...editingLearner,
                    preferences: {
                      ...(editingLearner.preferences || {}),
                      interests: e.target.value
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean),
                    },
                  })
                }
                placeholder="soccer, drawing, space"
                hint="Comma-separated interests used to personalize projects and explanations."
              />
            </div>

            <ModalFooter>
              <Button variant="secondary" onClick={() => setEditingLearner(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdateLearner}>
                Save Changes
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Remove Learner"
        size="sm"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-slate-600 mb-4">
            Are you sure you want to remove this learner? This will delete all their progress and artifacts.
          </p>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => showDeleteConfirm && handleDeleteLearner(showDeleteConfirm)}
            >
              Remove
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
