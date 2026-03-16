import React, { useEffect, useMemo, useState } from 'react';
import {
  ExternalLink,
  Star,
  Filter,
  Search,
  Sparkles,
  BookOpen,
  Code,
  Brain,
  Globe,
  Palette,
  Link2,
  Clock3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '../../lib/cn';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import {
  PARTNER_PLATFORMS,
  getFreePlatforms,
  type PlatformCategory,
  type PartnerPlatform,
} from '../../data/partnerPlatforms';
import { useFamily } from '../family';
import { launchTrackedExternalSession } from '../../services/externalProgressSyncService';
import { scheduleService } from '../../services/scheduleService';
import { syncScheduleProgress } from '../../services/scheduleProgressSync';
import {
  externalActivitySessionDataService,
  projectDataService,
} from '../../services/learningRecordsService';
import type { ExternalActivitySession, LearningProject } from '../../types/learning';

const CATEGORY_CONFIG: Record<PlatformCategory, { label: string; icon: React.ReactNode; color: string }> = {
  coding: { label: 'Coding', icon: <Code className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700' },
  math: { label: 'Math', icon: <BookOpen className="h-4 w-4" />, color: 'bg-purple-100 text-purple-700' },
  ai: { label: 'AI & ML', icon: <Brain className="h-4 w-4" />, color: 'bg-rose-100 text-rose-700' },
  science: { label: 'Science', icon: <Sparkles className="h-4 w-4" />, color: 'bg-emerald-100 text-emerald-700' },
  language: { label: 'Language', icon: <Globe className="h-4 w-4" />, color: 'bg-amber-100 text-amber-700' },
  'critical-thinking': { label: 'Critical Thinking', icon: <Brain className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-700' },
  creative: { label: 'Creative', icon: <Palette className="h-4 w-4" />, color: 'bg-pink-100 text-pink-700' },
};

const SKILL_LEVEL_COLORS: Record<string, string> = {
  foundation: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
  pro: 'bg-amber-100 text-amber-700',
};

type SessionMode = 'schedule' | 'log' | 'launch';

interface SessionDraft {
  learnerId: string;
  title: string;
  scheduledDate: string;
  scheduledStartTime: string;
  durationMinutes: string;
  projectId: string;
  notes: string;
}

const todayDate = (): string => new Date().toISOString().split('T')[0];
const currentTime = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const createDefaultDraft = (learnerId = ''): SessionDraft => ({
  learnerId,
  title: '',
  scheduledDate: todayDate(),
  scheduledStartTime: currentTime(),
  durationMinutes: '45',
  projectId: '',
  notes: '',
});

export const PartnersPage: React.FC = () => {
  const { family } = useFamily();
  const learners = useMemo(() => family?.learners || [], [family?.learners]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlatformCategory | 'all'>('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [modalPlatform, setModalPlatform] = useState<PartnerPlatform | null>(null);
  const [modalMode, setModalMode] = useState<SessionMode>('schedule');
  const [draft, setDraft] = useState<SessionDraft>(createDefaultDraft());
  const [recentSessions, setRecentSessions] = useState<ExternalActivitySession[]>([]);
  const [projectsByLearner, setProjectsByLearner] = useState<Record<string, LearningProject[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const filteredPlatforms = PARTNER_PLATFORMS.filter((platform) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        platform.name.toLowerCase().includes(query) ||
        platform.description.toLowerCase().includes(query) ||
        platform.category.some((category) => category.toLowerCase().includes(query));

      if (!matchesSearch) {
        return false;
      }
    }

    if (selectedCategory !== 'all' && !platform.category.includes(selectedCategory)) {
      return false;
    }

    if (showFreeOnly && !platform.isFree && !platform.hasFreeTier) {
      return false;
    }

    return true;
  });

  const freePlatformsCount = getFreePlatforms().length;
  const linkedProjects = useMemo(
    () => projectsByLearner[draft.learnerId] || [],
    [draft.learnerId, projectsByLearner]
  );

  useEffect(() => {
    if (!learners.length) {
      setRecentSessions([]);
      return;
    }

    const loadRecentSessions = async () => {
      const sessions = await Promise.all(
        learners.map((learner) => externalActivitySessionDataService.getByLearner(learner.id))
      );

      setRecentSessions(
        sessions
          .flat()
          .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
          .slice(0, 6)
      );
    };

    void loadRecentSessions();
  }, [learners]);

  useEffect(() => {
    if (!draft.learnerId || projectsByLearner[draft.learnerId]) {
      return;
    }

    void projectDataService.getByLearner(draft.learnerId).then((projects) => {
      setProjectsByLearner((current) => ({ ...current, [draft.learnerId]: projects }));
    });
  }, [draft.learnerId, projectsByLearner]);

  const openSessionModal = (platform: PartnerPlatform, mode: SessionMode) => {
    setModalPlatform(platform);
    setModalMode(mode);
    setDraft((current) =>
      createDefaultDraft(current.learnerId || learners[0]?.id || '')
    );
  };

  const closeSessionModal = () => {
    setModalPlatform(null);
    setDraft(createDefaultDraft(learners[0]?.id || ''));
  };

  const handleSaveSession = async () => {
    if (!family || !modalPlatform || !draft.learnerId) {
      return;
    }

    const learner = learners.find((entry) => entry.id === draft.learnerId);
    if (!learner) {
      return;
    }

    setIsSaving(true);

    try {
      const timestamp = new Date().toISOString();
      const savedSession = await externalActivitySessionDataService.save({
        id: `external-session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        familyId: family.id,
        learnerId: draft.learnerId,
        projectId: draft.projectId || undefined,
        platformId: modalPlatform.id,
        platformName: modalPlatform.name,
        title: draft.title.trim() || `${modalPlatform.name} Session`,
        description: modalPlatform.description,
        url: modalPlatform.url,
        scheduledDate: draft.scheduledDate,
        scheduledStartTime: draft.scheduledStartTime || undefined,
        durationMinutes: Number(draft.durationMinutes) || 45,
        status: modalMode === 'log' ? 'completed' : modalMode === 'launch' ? 'in-progress' : 'scheduled',
        syncMode: modalMode === 'launch' ? 'linked' : 'manual',
        notes: draft.notes.trim() || undefined,
        evidenceArtifactIds: [],
        tags: modalPlatform.category,
        completedAt: modalMode === 'log' ? timestamp : undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      const baseSchedule = scheduleService.ensureDailySchedule(
        draft.learnerId,
        draft.scheduledDate,
        family.id,
        family.currentPodId || undefined,
        family.currentWeek,
        learner.skillLevel
      );
      const updatedSchedule = scheduleService.saveDailySchedule(
        scheduleService.upsertExternalSessionBlock(baseSchedule, savedSession)
      );

      if (modalMode === 'log') {
        await syncScheduleProgress(updatedSchedule);
      }

      if (modalMode === 'launch') {
        await launchTrackedExternalSession({
          familyId: family.id,
          learnerId: draft.learnerId,
          learnerName: learner.name,
          date: draft.scheduledDate,
          title: savedSession.title,
          platformId: modalPlatform.id,
          platformName: modalPlatform.name,
          launchUrl: modalPlatform.url,
          durationMinutes: Number(draft.durationMinutes) || 45,
          description: modalPlatform.description,
          scheduledStartTime: draft.scheduledStartTime || undefined,
          projectId: draft.projectId || undefined,
          blockId: savedSession.blockId || updatedSchedule.blocks.find((block) => block.externalSessionId === savedSession.id)?.id,
          notes: draft.notes.trim() || undefined,
          tags: modalPlatform.category,
        });
      }

      if (savedSession.projectId) {
        await projectDataService.touch(savedSession.projectId, draft.learnerId, {
          lastWorkedAt: timestamp,
          status: 'active',
          externalPlatformIds: Array.from(
            new Set([
              ...(projectsByLearner[draft.learnerId]
                ?.find((project) => project.id === savedSession.projectId)
                ?.externalPlatformIds || []),
              modalPlatform.id,
            ])
          ),
        });
      }

      const reloadedSessions = await externalActivitySessionDataService.getByLearner(draft.learnerId);
      setRecentSessions((current) =>
        [...reloadedSessions, ...current.filter((session) => session.learnerId !== draft.learnerId)]
          .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
          .slice(0, 6)
      );

      toast.success(
        modalMode === 'log'
          ? `Logged ${modalPlatform.name} work for ${learner.name}`
          : modalMode === 'launch'
          ? `Opened ${modalPlatform.name} for ${learner.name} and started tracking`
          : `Scheduled ${modalPlatform.name} for ${learner.name}`
      );
      closeSessionModal();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <header className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-6 w-6 text-indigo-600" />
                <h1 className="text-2xl font-semibold text-slate-900">Partner Platforms</h1>
              </div>
              <p className="text-sm text-slate-600">
                Curated learning tools that integrate with your LumiPods journey.
                Schedule or log outside sessions so they become visible in the learner timeline.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" size="md">
                {freePlatformsCount} Free Tools
              </Badge>
              <Badge variant="info" size="md">
                {recentSessions.length} Live Session{recentSessions.length === 1 ? '' : 's'}
              </Badge>
            </div>
          </div>
        </header>

        {family && recentSessions.length > 0 && (
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="h-4 w-4 text-cyan-600" />
              <h2 className="font-semibold text-slate-900">Recent external learning</h2>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {recentSessions.map((session) => {
                const learner = learners.find((entry) => entry.id === session.learnerId);
                return (
                  <div key={session.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">{session.title}</p>
                      <Badge variant={session.status === 'completed' ? 'success' : 'default'} size="sm">
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {session.platformName} • {learner?.name || 'Learner'}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      {new Date(session.scheduledDate).toLocaleDateString('en-US')} • {session.durationMinutes} min
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search platforms..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                All
              </button>
              {(Object.entries(CATEGORY_CONFIG) as [PlatformCategory, typeof CATEGORY_CONFIG[PlatformCategory]][]).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                    selectedCategory === key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {config.icon}
                  {config.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFreeOnly(!showFreeOnly)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                showFreeOnly
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <Filter className="h-4 w-4" />
              Free Only
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlatforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              isExpanded={expandedPlatform === platform.id}
              onToggleExpand={() => setExpandedPlatform(expandedPlatform === platform.id ? null : platform.id)}
              onLaunch={() => openSessionModal(platform, 'launch')}
              onSchedule={() => openSessionModal(platform, 'schedule')}
              onLog={() => openSessionModal(platform, 'log')}
              canTrack={Boolean(family && learners.length > 0)}
            />
          ))}
        </div>

        {filteredPlatforms.length === 0 && (
          <Card className="text-center py-12">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No platforms found</h2>
            <p className="text-slate-500">Try adjusting your filters or search query</p>
          </Card>
        )}

        <Card className="mt-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-200">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                LumiPods Family Discounts
              </h2>
              <p className="text-slate-600">
                As a LumiPods family, you get exclusive discounts and free trials on select partner platforms.
                Look for the <Badge variant="success" size="sm">LumiPods Deal</Badge> badge.
              </p>
            </div>
            <Button variant="primary">
              View All Deals
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={Boolean(modalPlatform)}
        onClose={closeSessionModal}
        title={
          modalMode === 'log'
            ? 'Log External Session'
            : modalMode === 'launch'
            ? 'Launch & Track External Session'
            : 'Schedule External Session'
        }
        description={
          modalPlatform
            ? modalMode === 'launch'
              ? `${modalPlatform.name} will open in a new tab and sync time back into Lumi when the learner returns.`
              : `${modalPlatform.name} will be tracked inside the learner schedule.`
            : undefined
        }
        size="lg"
      >
        {modalPlatform && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Learner</label>
                <select
                  value={draft.learnerId}
                  onChange={(event) => setDraft((current) => ({ ...current, learnerId: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
                >
                  <option value="">Select learner</option>
                  {learners.map((learner) => (
                    <option key={learner.id} value={learner.id}>
                      {learner.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Session title</label>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder={`${modalPlatform.name} Session`}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Date</label>
                <input
                  type="date"
                  value={draft.scheduledDate}
                  onChange={(event) => setDraft((current) => ({ ...current, scheduledDate: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Start time</label>
                <input
                  type="time"
                  value={draft.scheduledStartTime}
                  onChange={(event) => setDraft((current) => ({ ...current, scheduledStartTime: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Duration</label>
                <select
                  value={draft.durationMinutes}
                  onChange={(event) => setDraft((current) => ({ ...current, durationMinutes: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
                >
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Linked project</label>
                <select
                  value={draft.projectId}
                  onChange={(event) => setDraft((current) => ({ ...current, projectId: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
                >
                  <option value="">No linked project</option>
                  {linkedProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-600 block mb-1">Notes</label>
                <textarea
                  value={draft.notes}
                  onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="What should the learner focus on, notice, or bring back afterward?"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 min-h-[100px]"
                />
              </div>
            </div>

            <ModalFooter>
              <Button variant="secondary" onClick={closeSessionModal}>
                Cancel
              </Button>
              <Button
                onClick={() => void handleSaveSession()}
                disabled={!draft.learnerId || isSaving}
              >
                {isSaving
                  ? 'Saving...'
                  : modalMode === 'log'
                  ? 'Log Session'
                  : modalMode === 'launch'
                  ? 'Launch & Track'
                  : 'Add to Schedule'}
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
};

interface PlatformCardProps {
  platform: PartnerPlatform;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onLaunch: () => void;
  onSchedule: () => void;
  onLog: () => void;
  canTrack: boolean;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  isExpanded,
  onToggleExpand,
  onLaunch,
  onSchedule,
  onLog,
  canTrack,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{platform.icon}</span>
            <div>
              <h3 className="font-semibold text-slate-900">{platform.name}</h3>
              <p className="text-xs text-slate-500">{platform.tagline}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {platform.isFree ? (
              <Badge variant="success" size="sm">Free</Badge>
            ) : platform.hasFreeTier ? (
              <Badge variant="info" size="sm">Free Tier</Badge>
            ) : (
              <Badge variant="default" size="sm">Paid</Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-4">{platform.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {platform.category.map((category) => {
            const config = CATEGORY_CONFIG[category];
            return (
              <span
                key={category}
                className={cn('px-2 py-0.5 rounded-full text-xs font-medium', config.color)}
              >
                {config.label}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-slate-500">Levels:</span>
          <div className="flex gap-1">
            {platform.skillLevels.map((level) => (
              <span
                key={level}
                className={cn('px-2 py-0.5 rounded text-xs font-medium capitalize', SKILL_LEVEL_COLORS[level])}
              >
                {level}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Ages: {platform.ageRange}</span>
          <button
            onClick={onToggleExpand}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
        </div>
      </div>

      {isExpanded && platform.featuredCourses && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-slate-100 bg-slate-50 p-5"
        >
          <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Featured Courses
          </h4>
          <div className="space-y-3">
            {platform.featuredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg p-3 border border-slate-200">
                <h5 className="font-medium text-slate-900 text-sm">{course.title}</h5>
                <p className="text-xs text-slate-500 mt-1">{course.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">{course.duration}</span>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-xs font-medium capitalize',
                    SKILL_LEVEL_COLORS[course.skillLevel]
                  )}>
                    {course.skillLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="border-t border-slate-100 p-4 flex gap-2">
        <Button
          variant="primary"
          fullWidth
          icon={<ExternalLink className="h-4 w-4" />}
          onClick={canTrack ? onLaunch : () => window.open(platform.url, '_blank')}
        >
          {canTrack ? 'Launch & Track' : 'Visit Platform'}
        </Button>
        <Button variant="secondary" onClick={onSchedule} disabled={!canTrack}>
          + Schedule
        </Button>
        <Button variant="secondary" onClick={onLog} disabled={!canTrack}>
          Log Work
        </Button>
      </div>
    </motion.div>
  );
};

export default PartnersPage;
