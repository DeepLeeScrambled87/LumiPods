import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  FileText,
  Layers,
  Link2,
  Package,
  Pencil,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { ArtifactCard } from '../../features/portfolio/ArtifactCard';
import { ArtifactUploader, type ArtifactFormData } from '../../features/portfolio/ArtifactUploader';
import {
  AUDIENCE_LEARNER_PREFIX,
  AUDIENCE_LEVEL_PREFIX,
  POD_LIBRARY_TAG,
  SHARED_GROUP_PREFIX,
  SUPPORT_ASSET_PREFIX,
  getArtifactTagValues,
  getSharedGroupId,
  getSupportAssetIds,
} from '../../lib/artifactScope';
import { curriculumService } from '../../services/curriculumService';
import { learningPersonalizationService } from '../../services/learningPersonalizationService';
import { portfolioService } from '../../services/portfolioService';
import { POD_THEME_CONFIG, type Pod } from '../../types/pod';
import type { Artifact } from '../../types/artifact';
import type { SkillLevel } from '../../types/skillLevel';
import type { Learner } from '../../types/learner';
import type { PodCurriculum, SkillLevelId } from '../../types/curriculum';

type LibraryTab = 'content' | 'assets' | 'sources';

interface PodLibraryBrowserProps {
  pod: Pod;
  familyId?: string;
  learners: Learner[];
}

interface GroupedPodAsset {
  id: string;
  artifact: Artifact;
  artifacts: Artifact[];
  learnerIds: string[];
  targetSkillLevels: SkillLevel[];
  totalRecords: number;
}

const TABS: { id: LibraryTab; label: string; icon: React.ElementType }[] = [
  { id: 'content', label: 'Learning Material', icon: BookOpen },
  { id: 'assets', label: 'Pod Assets', icon: Upload },
  { id: 'sources', label: 'Sources & Materials', icon: Link2 },
];

const skillLevelOptions: { value: SkillLevelId; label: string }[] = [
  { value: 'foundation', label: 'Foundation' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'pro', label: 'Pro' },
];

const assetLevelOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'All levels' },
  ...skillLevelOptions,
];

const isVisibleForSkillLevel = (levels: SkillLevelId[], skillLevel: SkillLevelId): boolean =>
  levels.includes(skillLevel);

const groupPodAssets = (artifacts: Artifact[]): GroupedPodAsset[] => {
  const groups = new Map<string, GroupedPodAsset>();

  artifacts.forEach((artifact) => {
    const sharedGroupId = getSharedGroupId(artifact);
    const groupKey = sharedGroupId || artifact.id;
    const taggedLearnerIds = getArtifactTagValues(artifact.tags || [], AUDIENCE_LEARNER_PREFIX);
    const learnerIds = taggedLearnerIds.length > 0 ? taggedLearnerIds : [artifact.learnerId];
    const targetSkillLevels = getArtifactTagValues(
      artifact.tags || [],
      AUDIENCE_LEVEL_PREFIX
    ) as SkillLevel[];

    const existing = groups.get(groupKey);
    if (existing) {
      existing.artifacts.push(artifact);
      existing.learnerIds = Array.from(new Set([...existing.learnerIds, ...learnerIds]));
      existing.targetSkillLevels = Array.from(
        new Set([...existing.targetSkillLevels, ...targetSkillLevels])
      ) as SkillLevel[];
      existing.totalRecords += 1;
      return;
    }

    groups.set(groupKey, {
      id: groupKey,
      artifact,
      artifacts: [artifact],
      learnerIds,
      targetSkillLevels,
      totalRecords: 1,
    });
  });

  return Array.from(groups.values()).sort(
    (left, right) =>
      new Date(right.artifact.createdAt).getTime() - new Date(left.artifact.createdAt).getTime()
  );
};

const stripSystemTags = (tags: string[], podId: string): string[] =>
  tags.filter(
    (tag) =>
      tag !== POD_LIBRARY_TAG &&
      tag !== podId &&
      !tag.startsWith(AUDIENCE_LEARNER_PREFIX) &&
      !tag.startsWith(AUDIENCE_LEVEL_PREFIX) &&
      !tag.startsWith(SHARED_GROUP_PREFIX) &&
      !tag.startsWith(SUPPORT_ASSET_PREFIX)
  );

const inferTargetLevelsFromLearners = (learnerIds: string[], learners: Learner[]): SkillLevel[] =>
  Array.from(
    new Set(
      learnerIds
        .map((learnerId) => learners.find((learner) => learner.id === learnerId)?.skillLevel)
      .filter(Boolean) as SkillLevel[]
    )
  );

const getArtifactCreatedDate = (artifact: Artifact): string => {
  const rawDate = artifact.createdAt || artifact.updatedAt || new Date().toISOString();
  return rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
};

export const PodLibraryBrowser: React.FC<PodLibraryBrowserProps> = ({
  pod,
  familyId,
  learners,
}) => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('content');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevelId>('intermediate');
  const [selectedLearnerPreviewId, setSelectedLearnerPreviewId] = useState<string>('level-only');
  const [assetLevelFilter, setAssetLevelFilter] = useState<string>('all');
  const [showUploader, setShowUploader] = useState(false);
  const [podArtifacts, setPodArtifacts] = useState<Artifact[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [selectedSupportAssetId, setSelectedSupportAssetId] = useState<string | null>(null);
  const [editingAssetGroup, setEditingAssetGroup] = useState<GroupedPodAsset | null>(null);

  const curriculum = useMemo<PodCurriculum | null>(
    () => curriculumService.getCurriculum(pod.id) ?? null,
    [pod.id]
  );
  const currentWeek = useMemo(
    () => curriculum?.weeks.find((week) => week.weekNumber === selectedWeek) ?? null,
    [curriculum, selectedWeek]
  );
  const selectedGuidance = useMemo(
    () => curriculum?.ageBandGuidance?.find((entry) => entry.skillLevel === selectedSkillLevel) ?? null,
    [curriculum, selectedSkillLevel]
  );

  const weekOptions = useMemo(
    () => [
      { value: 'general', label: 'General pod library' },
      ...((curriculum?.weeks || []).map((week) => ({
        value: String(week.weekNumber),
        label: `Week ${week.weekNumber}: ${week.title}`,
      })) || []),
    ],
    [curriculum]
  );

  const groupedPodAssets = useMemo(() => groupPodAssets(podArtifacts), [podArtifacts]);
  const filteredGroupedAssets = useMemo(() => {
    if (assetLevelFilter === 'all') {
      return groupedPodAssets;
    }

    return groupedPodAssets.filter(
      (group) =>
        group.targetSkillLevels.length === 0 ||
        group.targetSkillLevels.includes(assetLevelFilter as SkillLevel)
    );
  }, [assetLevelFilter, groupedPodAssets]);
  const supportAssetGroups = useMemo(() => {
    const groups = new Map<string, GroupedPodAsset[]>();

    filteredGroupedAssets.forEach((group) => {
      getSupportAssetIds(group.artifact).forEach((supportAssetId) => {
        const current = groups.get(supportAssetId) || [];
        current.push(group);
        groups.set(supportAssetId, current);
      });
    });

    return groups;
  }, [filteredGroupedAssets]);

  const loadPodArtifacts = useCallback(async () => {
    if (learners.length === 0) {
      setPodArtifacts([]);
      return;
    }

    setIsLoadingAssets(true);
    try {
      const artifacts = await portfolioService.getPodLibraryArtifacts(
        pod.id,
        learners.map((learner) => learner.id)
      );
      setPodArtifacts(artifacts);
    } catch (error) {
      console.error('Failed to load pod artifacts:', error);
      toast.error('Failed to load pod library assets');
    } finally {
      setIsLoadingAssets(false);
    }
  }, [learners, pod.id]);

  useEffect(() => {
    setActiveTab('content');
    setSelectedWeek(1);
    setSelectedSkillLevel((learners[0]?.skillLevel as SkillLevelId) || 'intermediate');
    setSelectedLearnerPreviewId('level-only');
    setAssetLevelFilter('all');
    setSelectedSupportAssetId(null);
    setEditingAssetGroup(null);
    void loadPodArtifacts();
  }, [learners, loadPodArtifacts, pod.id]);

  const resolveAudienceLearners = (data: ArtifactFormData): Learner[] => {
    const learnersInLevels =
      data.targetSkillLevels.length > 0
        ? learners.filter((learner) => data.targetSkillLevels.includes(learner.skillLevel))
        : learners;

    if (data.learnerIds.length === 0) {
      return learnersInLevels;
    }

    return learnersInLevels.filter((learner) => data.learnerIds.includes(learner.id));
  };

  const getUploaderInitialData = (group: GroupedPodAsset): Partial<ArtifactFormData> => ({
    learnerId: group.learnerIds[0] || '',
    learnerIds: group.learnerIds,
    targetSkillLevels:
      group.targetSkillLevels.length > 0
        ? group.targetSkillLevels
        : inferTargetLevelsFromLearners(group.learnerIds, learners),
    podId: group.artifact.podId,
    weekNumber: group.artifact.weekNumber,
    type: group.artifact.type,
    title: group.artifact.title,
    description: group.artifact.description || '',
    reflection: group.artifact.reflection || '',
    url: group.artifact.url,
    competencies: group.artifact.competencies || [],
    visibility: group.artifact.visibility,
    tags: stripSystemTags(group.artifact.tags || [], pod.id),
    createdDate: getArtifactCreatedDate(group.artifact),
  });

  const handleSaveAsset = async (data: ArtifactFormData) => {
    if (!familyId) {
      toast.error('Family context is missing');
      return;
    }

    const selectedLearners = resolveAudienceLearners(data);

    if (selectedLearners.length === 0) {
      toast.error('Choose at least one target level or matching learner for this pod asset');
      return;
    }

    const sharedGroupId =
      editingAssetGroup
        ? getSharedGroupId(editingAssetGroup.artifact) ||
          (selectedLearners.length > 1
            ? `podasset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            : undefined)
        : selectedLearners.length > 1
          ? `podasset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
          : undefined;

    const baseTags = Array.from(
      new Set([
        ...(data.tags || []),
        POD_LIBRARY_TAG,
        pod.id,
        ...selectedLearners.map((learner) => `${AUDIENCE_LEARNER_PREFIX}${learner.id}`),
        ...data.targetSkillLevels.map((skillLevel) => `${AUDIENCE_LEVEL_PREFIX}${skillLevel}`),
        ...(selectedSupportAssetId ? [`${SUPPORT_ASSET_PREFIX}${selectedSupportAssetId}`] : []),
        ...(sharedGroupId ? [`${SHARED_GROUP_PREFIX}${sharedGroupId}`] : []),
      ])
    );

    try {
      if (editingAssetGroup) {
        const desiredLearnerIds = new Set(selectedLearners.map((learner) => learner.id));
        const existingByLearnerId = new Map(
          editingAssetGroup.artifacts.map((artifact) => [artifact.learnerId, artifact])
        );

        for (const learner of selectedLearners) {
          const existingArtifact = existingByLearnerId.get(learner.id);
          const nextArtifact: Artifact = {
            ...(existingArtifact || editingAssetGroup.artifact),
            learnerId: learner.id,
            familyId,
            podId: pod.id,
            weekNumber: data.weekNumber,
            type: data.type,
            title: data.title,
            description: data.description,
            reflection: data.reflection,
            url: data.url,
            competencies: data.competencies,
            tags: baseTags,
            skillLevel: data.targetSkillLevels[0] || learner.skillLevel,
            visibility: data.visibility,
            updatedAt: new Date().toISOString(),
          };

          if (existingArtifact) {
            await portfolioService.updateArtifact(nextArtifact, { file: data.file });
          } else {
            await portfolioService.createArtifact({
              ...nextArtifact,
              file: data.file,
            });
          }
        }

        await Promise.all(
          editingAssetGroup.artifacts
            .filter((artifact) => !desiredLearnerIds.has(artifact.learnerId))
            .map((artifact) => portfolioService.deleteArtifact(artifact))
        );
      } else {
        for (const learner of selectedLearners) {
          await portfolioService.createArtifact({
            familyId,
            learnerId: learner.id,
            podId: pod.id,
            weekNumber: data.weekNumber,
            type: data.type,
            title: data.title,
            description: data.description,
            reflection: data.reflection,
            url: data.url,
            file: data.file,
            competencies: data.competencies,
            tags: baseTags,
            skillLevel: data.targetSkillLevels[0] || (learner.skillLevel as SkillLevel),
            visibility: data.visibility,
            isFeatured: false,
          });
        }
      }

      await loadPodArtifacts();
      setShowUploader(false);
      setSelectedSupportAssetId(null);
      setEditingAssetGroup(null);
      toast.success(
        editingAssetGroup
          ? 'Pod asset updated'
          : data.targetSkillLevels.length > 0
            ? `Added to ${data.targetSkillLevels.join(', ')}`
            : 'Added to the pod library'
      );
    } catch (error) {
      console.error('Failed to save pod artifact:', error);
      toast.error('Failed to save pod asset');
    }
  };

  const handleDeleteAssetGroup = async (group: GroupedPodAsset) => {
    try {
      await Promise.all(group.artifacts.map((artifact) => portfolioService.deleteArtifact(artifact)));
      await loadPodArtifacts();
      if (editingAssetGroup?.id === group.id) {
        setEditingAssetGroup(null);
      }
      toast.success('Pod asset removed');
    } catch (error) {
      console.error('Failed to delete pod asset group:', error);
      toast.error('Failed to remove pod asset');
    }
  };

  const theme = POD_THEME_CONFIG[pod.theme];
  const visibleFlashcards = (currentWeek?.flashcards || []).filter((item) =>
    isVisibleForSkillLevel(item.skillLevels, selectedSkillLevel)
  );
  const visibleCanonicalLessons =
    currentWeek?.canonicalLessonsBySkillLevel?.[selectedSkillLevel] || [];
  const visibleQuestions = (currentWeek?.quizQuestions || []).filter((item) =>
    isVisibleForSkillLevel(item.skillLevels, selectedSkillLevel)
  );
  const visibleTasks = (currentWeek?.interactiveTasks || []).filter((item) =>
    isVisibleForSkillLevel(item.skillLevels, selectedSkillLevel)
  );
  const previewLearner =
    selectedLearnerPreviewId === 'level-only'
      ? null
      : learners.find((learner) => learner.id === selectedLearnerPreviewId) || null;
  const personalizedProjectSuggestions = learningPersonalizationService.getProjectSuggestionsFromWeek(
    currentWeek,
    selectedSkillLevel,
    previewLearner
  );

  return (
    <>
      <div className="space-y-6">
        <div className={`rounded-2xl bg-gradient-to-br ${theme.bgGradient} p-5 text-white`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{theme.icon}</span>
                <h2 className="text-2xl font-semibold">{pod.title}</h2>
              </div>
              <p className="max-w-3xl text-white/90 text-sm">{pod.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {curriculum?.programHours ? (
                <Badge className="bg-white/15 text-white border-white/20">
                  {curriculum.programHours} hr program
                </Badge>
              ) : null}
              <Badge className="bg-white/15 text-white border-white/20">
                {curriculum?.weeks.length || pod.duration || 4} weeks
              </Badge>
              <Badge className="bg-white/15 text-white border-white/20">
                {pod.artifactTypes.length} artifact types
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={
                  activeTab === tab.id
                    ? 'inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white'
                    : 'inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200'
                }
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'content' && (
          <div className="space-y-6">
            {curriculum?.segments?.length ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="h-5 w-5 text-slate-600" />
                  <h3 className="font-semibold text-slate-900">Segment Map</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {curriculum.segments.map((segment) => (
                    <Card key={segment.id} className="p-4">
                      <p className="font-medium text-slate-900">{segment.title}</p>
                      <p className="text-sm text-slate-600 mt-2">{segment.summary}</p>
                      <p className="text-xs text-slate-500 mt-3">
                        Questions: {segment.guidingQuestions.join(' | ')}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Problems you can solve: {segment.realWorldLinks.join(', ')}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null}

            {curriculum?.weeks?.length ? (
              <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-6">
                <Card className="p-4 space-y-4">
                  <Select
                    label="Week"
                    value={String(selectedWeek)}
                    onChange={(event) => setSelectedWeek(Number(event.target.value))}
                    options={curriculum.weeks.map((week) => ({
                      value: String(week.weekNumber),
                      label: `Week ${week.weekNumber}: ${week.title}`,
                    }))}
                  />
                  <Select
                    label="Age band"
                    value={selectedSkillLevel}
                    onChange={(event) => setSelectedSkillLevel(event.target.value as SkillLevelId)}
                    options={skillLevelOptions}
                  />
                  <Select
                    label="Personalization preview"
                    value={selectedLearnerPreviewId}
                    onChange={(event) => setSelectedLearnerPreviewId(event.target.value)}
                    options={[
                      { value: 'level-only', label: 'Level only (canonical view)' },
                      ...learners.map((learner) => ({
                        value: learner.id,
                        label: `${learner.name}${learner.preferences?.interests?.length ? ` • ${learner.preferences.interests.join(', ')}` : ''}`,
                      })),
                    ]}
                  />
                  {selectedGuidance ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-500">Age focus</p>
                      <p className="text-sm text-slate-800 mt-1">{selectedGuidance.focus}</p>
                    </div>
                  ) : null}
                  {previewLearner?.preferences?.interests?.length ? (
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                      <p className="text-xs font-medium text-indigo-600">Learner interests</p>
                      <p className="text-sm text-indigo-900 mt-1">
                        {previewLearner.preferences.interests.join(', ')}
                      </p>
                    </div>
                  ) : null}
                </Card>

                {currentWeek ? (
                  <div className="space-y-4">
                    <Card className="p-5">
                      <p className="text-xs font-medium text-slate-500 mb-2">
                        Week {currentWeek.weekNumber}
                      </p>
                      <h3 className="text-xl font-semibold text-slate-900">{currentWeek.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {currentWeek.subjects.map((subject) => (
                          <Badge key={subject} variant="info">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 space-y-3">
                        {(currentWeek.essentialQuestions || []).map((question) => (
                          <div
                            key={question}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
                          >
                            {question}
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <ClipboardList className="h-5 w-5 text-slate-600" />
                        <h4 className="font-semibold text-slate-900">Actual learning steps</h4>
                      </div>
                      <div className="space-y-3">
                        {currentWeek.tasksBySkillLevel[selectedSkillLevel].map((task) => (
                          <div key={task.stepNumber} className="flex items-start gap-3">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs text-white">
                              {task.stepNumber}
                            </span>
                            <p className="text-sm text-slate-700">{task.description}</p>
                          </div>
                        ))}
                      </div>
                      {currentWeek.weeklyProject ? (
                        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                          <p className="text-xs font-medium text-emerald-700 mb-1">Weekly project</p>
                          <p className="font-medium text-emerald-900">
                            {currentWeek.weeklyProject.title}
                          </p>
                          <p className="text-sm text-emerald-800 mt-1">
                            {currentWeek.weeklyProject.drivingQuestion}
                          </p>
                          <ul className="mt-3 space-y-1">
                            {currentWeek.weeklyProject.deliverables.map((deliverable) => (
                              <li key={deliverable} className="text-sm text-emerald-800">
                                {deliverable}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </Card>

                    <Card className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="h-5 w-5 text-slate-600" />
                        <h4 className="font-semibold text-slate-900">Canonical mini-lessons</h4>
                      </div>
                      <div className="space-y-4">
                        {visibleCanonicalLessons.map((lesson) => (
                          <div key={lesson.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-slate-900">{lesson.title}</p>
                                <p className="text-sm text-slate-600 mt-1">{lesson.learningObjective}</p>
                              </div>
                              <Badge>{lesson.estimatedMinutes} min</Badge>
                            </div>
                            <div className="mt-3 space-y-2">
                              {lesson.explanationSections.map((section) => (
                                <p key={section} className="text-sm text-slate-700">
                                  {section}
                                </p>
                              ))}
                            </div>
                            <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3">
                              <p className="text-xs font-medium text-sky-700">Concrete example</p>
                              <p className="text-sm text-sky-900 mt-1">{lesson.concreteExample}</p>
                            </div>
                            <div className="mt-3 grid md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs font-medium text-slate-500 mb-2">Key takeaways</p>
                                <ul className="space-y-1">
                                  {lesson.keyTakeaways.map((takeaway) => (
                                    <li key={takeaway} className="text-sm text-slate-700">
                                      {takeaway}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-slate-500 mb-2">Quick checks</p>
                                <ul className="space-y-1">
                                  {lesson.quickChecks.map((check) => (
                                    <li key={check} className="text-sm text-slate-700">
                                      {check}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                        {visibleCanonicalLessons.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            No canonical mini-lessons are authored for this week and age band yet.
                          </p>
                        ) : null}
                      </div>
                    </Card>

                    <Card className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-slate-600" />
                        <h4 className="font-semibold text-slate-900">
                          Project pathways {previewLearner ? `for ${previewLearner.name}` : 'for this level'}
                        </h4>
                      </div>
                      <div className="grid xl:grid-cols-2 gap-4">
                        {personalizedProjectSuggestions.map((project) => (
                          <div key={project.id} className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-medium text-slate-900">{project.title}</p>
                                <p className="text-xs text-slate-500 mt-1 capitalize">{project.style}</p>
                              </div>
                              <Badge>{project.estimatedTimeMinutes} min</Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-3">{project.description}</p>
                            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                              <p className="text-xs font-medium text-amber-700">Interest hook</p>
                              <p className="text-sm text-amber-900 mt-1">{project.interestHook}</p>
                            </div>
                            <div className="mt-3">
                              <p className="text-xs font-medium text-slate-500 mb-2">Learning goals</p>
                              <ul className="space-y-1">
                                {project.learningGoals.map((goal) => (
                                  <li key={goal} className="text-sm text-slate-700">{goal}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                        {personalizedProjectSuggestions.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            No project templates are authored for this week and level yet.
                          </p>
                        ) : null}
                      </div>
                    </Card>

                    <div className="grid xl:grid-cols-2 gap-4">
                      <Card className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="h-5 w-5 text-slate-600" />
                          <h4 className="font-semibold text-slate-900">Flashcards</h4>
                        </div>
                        <div className="space-y-3">
                          {visibleFlashcards.map((card) => (
                            <div key={card.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <p className="text-sm font-medium text-slate-900">{card.front}</p>
                              <p className="text-sm text-slate-600 mt-2">{card.back}</p>
                            </div>
                          ))}
                          {visibleFlashcards.length === 0 ? (
                            <p className="text-sm text-slate-500">
                              No flashcards for this week and level yet.
                            </p>
                          ) : null}
                        </div>
                      </Card>

                      <Card className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="h-5 w-5 text-slate-600" />
                          <h4 className="font-semibold text-slate-900">Quick checks</h4>
                        </div>
                        <div className="space-y-3">
                          {visibleQuestions.map((question) => (
                            <div key={question.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <p className="text-sm font-medium text-slate-900">{question.prompt}</p>
                              {question.options?.length ? (
                                <p className="text-xs text-slate-500 mt-2">
                                  {question.options.join(' | ')}
                                </p>
                              ) : null}
                              <p className="text-xs text-slate-600 mt-2">
                                Answer guide:{' '}
                                {Array.isArray(question.correctAnswer)
                                  ? question.correctAnswer.join(' | ')
                                  : question.correctAnswer}
                              </p>
                            </div>
                          ))}
                          {visibleQuestions.length === 0 ? (
                            <p className="text-sm text-slate-500">
                              No quick checks for this week and level yet.
                            </p>
                          ) : null}
                        </div>
                      </Card>
                    </div>

                    <Card className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-slate-600" />
                        <h4 className="font-semibold text-slate-900">Interactive tasks</h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {visibleTasks.map((task) => (
                          <div key={task.id} className="rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-slate-900">{task.title}</p>
                              <Badge>{task.estimatedMinutes} min</Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">{task.description}</p>
                            {task.resourceUrl ? (
                              <a
                                href={task.resourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block text-sm text-sky-700 mt-3"
                              >
                                Open linked activity
                              </a>
                            ) : null}
                          </div>
                        ))}
                        {visibleTasks.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            No interactive tasks for this week and level yet.
                          </p>
                        ) : null}
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Card className="p-5">
                    <p className="text-sm text-slate-500">
                      No detailed curriculum is available for this pod yet.
                    </p>
                  </Card>
                )}
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-semibold text-slate-900">Uploaded pod assets</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Slide decks, videos, links, documents, and shared support assets tied to this pod.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="min-w-[180px]">
                  <Select
                    label="Show assets for"
                    value={assetLevelFilter}
                    onChange={(event) => setAssetLevelFilter(event.target.value)}
                    options={assetLevelOptions}
                  />
                </div>
                <Button
                  variant="primary"
                  icon={<Upload className="h-4 w-4" />}
                  onClick={() => {
                    setSelectedSupportAssetId(null);
                    setEditingAssetGroup(null);
                    setShowUploader(true);
                  }}
                  disabled={!familyId || learners.length === 0}
                >
                  Upload to Pod Library
                </Button>
              </div>
            </div>

            {curriculum?.supportingAssets?.length ? (
              <Card className="p-5">
                <h4 className="font-semibold text-slate-900 mb-3">Authored support assets</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {curriculum.supportingAssets.map((asset) => (
                    <div key={asset.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-900">{asset.title}</p>
                        <Badge>{asset.type}</Badge>
                      </div>
                      {asset.description ? (
                        <p className="text-sm text-slate-600 mt-2">{asset.description}</p>
                      ) : null}
                      {asset.url ? (
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block text-sm text-sky-700 mt-3"
                        >
                          Open asset
                        </a>
                      ) : (
                        <p className="text-xs text-slate-500 mt-3">No uploaded file linked yet.</p>
                      )}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">
                          {(supportAssetGroups.get(asset.id) || []).length > 0
                            ? `${(supportAssetGroups.get(asset.id) || []).length} linked upload${
                                (supportAssetGroups.get(asset.id) || []).length === 1 ? '' : 's'
                              }`
                            : 'No linked uploads yet'}
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Upload className="h-4 w-4" />}
                          onClick={() => {
                            setSelectedSupportAssetId(asset.id);
                            setShowUploader(true);
                          }}
                          disabled={!familyId || learners.length === 0}
                        >
                          Attach Upload
                        </Button>
                      </div>
                      {(supportAssetGroups.get(asset.id) || []).length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {(supportAssetGroups.get(asset.id) || []).map((group) => (
                            <button
                              key={`${asset.id}-${group.id}`}
                              type="button"
                              onClick={() => {
                                if (group.artifact.url) {
                                  window.open(group.artifact.url, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:border-slate-300"
                            >
                              <p className="text-sm font-medium text-slate-900">{group.artifact.title}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {group.targetSkillLevels.length > 0
                                  ? `Levels: ${group.targetSkillLevels.join(', ')}`
                                  : 'All selected levels'}
                              </p>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            <Card className="p-5">
              <h4 className="font-semibold text-slate-900 mb-3">Live pod library assets</h4>
              {isLoadingAssets ? (
                <p className="text-sm text-slate-500">Loading pod assets...</p>
              ) : filteredGroupedAssets.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredGroupedAssets.map((group) => {
                    const targetLevels =
                      group.targetSkillLevels.length > 0
                        ? group.targetSkillLevels
                        : inferTargetLevelsFromLearners(group.learnerIds, learners);
                    const learnerNames = group.learnerIds
                      .map((learnerId) => learners.find((learner) => learner.id === learnerId)?.name)
                      .filter(Boolean) as string[];
                    const audienceLearnerIds =
                      targetLevels.length > 0
                        ? learners
                            .filter((learner) => targetLevels.includes(learner.skillLevel))
                            .map((learner) => learner.id)
                        : group.learnerIds;
                    const isLearnerNarrowed =
                      audienceLearnerIds.length > 0 &&
                      group.learnerIds.length > 0 &&
                      group.learnerIds.length < audienceLearnerIds.length;

                    return (
                      <div key={group.id} className="space-y-3">
                        <ArtifactCard
                          artifact={group.artifact}
                          learner={
                            group.learnerIds.length === 1
                              ? learners.find((learner) => learner.id === group.learnerIds[0])
                              : undefined
                          }
                          showLearner={group.learnerIds.length === 1}
                          onClick={() => {
                            if (group.artifact.url) {
                              window.open(group.artifact.url, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        />
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-medium text-slate-500 mb-2">Audience</p>
                              <p className="text-sm font-medium capitalize text-slate-800">
                                {targetLevels.length > 0
                                  ? `Levels: ${targetLevels.join(', ')}`
                                  : 'All levels in this pod'}
                              </p>
                              {isLearnerNarrowed ? (
                                <p className="text-xs text-slate-500 mt-1">
                                  Specific learners: {learnerNames.join(', ')}
                                </p>
                              ) : null}
                              <p className="text-sm text-slate-700">
                                {group.artifact.weekNumber
                                  ? `Attached to week ${group.artifact.weekNumber}`
                                  : 'General pod library asset'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={<Pencil className="h-4 w-4" />}
                                className="h-8 w-8 p-0"
                                aria-label={`Edit ${group.artifact.title}`}
                                title="Edit asset"
                                onClick={() => {
                                  setSelectedSupportAssetId(getSupportAssetIds(group.artifact)[0] || null);
                                  setEditingAssetGroup(group);
                                  setShowUploader(true);
                                }}
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                icon={<Trash2 className="h-4 w-4" />}
                                className="h-8 w-8 p-0"
                                aria-label={`Remove ${group.artifact.title}`}
                                title="Remove asset"
                                onClick={() => {
                                  if (confirm(`Remove "${group.artifact.title}" from the pod library?`)) {
                                    void handleDeleteAssetGroup(group);
                                  }
                                }}
                              />
                            </div>
                          </div>
                          {targetLevels.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {targetLevels.map((skillLevel) => (
                                <Badge key={skillLevel} variant="info" size="sm">
                                  {skillLevel}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                          {group.totalRecords > 1 ? (
                            <p className="text-xs text-slate-500 mt-2">
                              Shared once across {group.totalRecords} level-matched learner records
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                  <p className="text-sm text-slate-500">No uploaded pod assets yet.</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Use the upload button to attach videos, documents, links, mind maps, and slide decks
                    directly to this pod library.
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="grid xl:grid-cols-2 gap-6">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="h-5 w-5 text-slate-600" />
                <h3 className="font-semibold text-slate-900">Credibility sources</h3>
              </div>
              <div className="space-y-3">
                {(curriculum?.references || []).map((reference) => (
                  <div key={reference.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{reference.title}</p>
                      <Badge>{reference.category}</Badge>
                    </div>
                    {reference.note ? (
                      <p className="text-sm text-slate-600 mt-2">{reference.note}</p>
                    ) : null}
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-sm text-sky-700 mt-3"
                    >
                      Open source
                    </a>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-slate-600" />
                <h3 className="font-semibold text-slate-900">Week materials and flow</h3>
              </div>
              {currentWeek ? (
                <div className="space-y-4">
                  <Select
                    label="Week"
                    value={String(selectedWeek)}
                    onChange={(event) => setSelectedWeek(Number(event.target.value))}
                    options={(curriculum?.weeks || []).map((week) => ({
                      value: String(week.weekNumber),
                      label: `Week ${week.weekNumber}: ${week.title}`,
                    }))}
                  />
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Materials</p>
                    <div className="flex flex-wrap gap-2">
                      {currentWeek.materials.items.map((item) => (
                        <Badge key={item.id} variant="info">
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Daily flow</p>
                    <div className="space-y-2">
                      {currentWeek.dailyFlow.days.map((day) => (
                        <div key={day.day} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="text-sm font-medium text-slate-900">{day.day}</p>
                          <p className="text-sm text-slate-600 mt-1">{day.activities}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No weekly materials or flow are available for this pod yet.
                </p>
              )}
            </Card>
          </div>
        )}
      </div>

      <ArtifactUploader
        isOpen={showUploader}
        onClose={() => {
          setShowUploader(false);
          setSelectedSupportAssetId(null);
          setEditingAssetGroup(null);
        }}
        onSave={(data) => void handleSaveAsset(data)}
        learners={learners}
        defaultLearnerId={learners[0]?.id}
        defaultPodId={pod.id}
        initialData={editingAssetGroup ? getUploaderInitialData(editingAssetGroup) : null}
        podTitle={pod.title}
        weekOptions={weekOptions}
        title={
          editingAssetGroup
            ? `Edit ${editingAssetGroup.artifact.title}`
            : selectedSupportAssetId
            ? `Attach to ${
                curriculum?.supportingAssets?.find((asset) => asset.id === selectedSupportAssetId)?.title ||
                'support asset'
              }`
            : `Upload to ${pod.title}`
        }
        description={
          editingAssetGroup
            ? 'Update the audience, files, links, or metadata for this pod teaching asset.'
            : selectedSupportAssetId
            ? 'Attach a shared file or link directly to this authored support asset.'
            : 'Attach supporting documents, links, videos, slide decks, or shared teaching assets directly to this pod library.'
        }
        submitLabel={
          editingAssetGroup
            ? 'Save Asset Changes'
            : selectedSupportAssetId
              ? 'Attach to Support Asset'
              : 'Add to Pod Library'
        }
        allowMultipleLearners
        enableSkillLevelTargeting
      />
    </>
  );
};

export default PodLibraryBrowser;
