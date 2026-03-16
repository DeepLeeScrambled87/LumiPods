import React, { useEffect, useState } from 'react';
import { Layers, Check, ArrowRight, Clock, Target, Star, BookOpen, Info, X, Trash2 } from 'lucide-react';
import { m } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '../../lib/cn';
import { storage } from '../../lib/storage';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal, ModalFooter } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { PodLibraryModal } from './PodLibraryModal';
import { useFamily } from '../../features/family';
import { ALL_PODS, POD_CATEGORIES } from '../../data/pods';
import { POD_THEME_CONFIG } from '../../types/pod';
import { curriculumService } from '../../services/curriculumService';
import { scheduleService } from '../../services/scheduleService';
import { planningRuleDataService } from '../../services/learningRecordsService';
import { podPacingService, type PodPlanningAnswers } from '../../services/podPacingService';
import type { Pod } from '../../types/pod';
import type { PlanningRule } from '../../types/learning';
import type { Learner } from '../../types/learner';

type CategoryFilter = 'all' | 'stem' | 'maths' | 'language' | 'yearly';
type LevelFilter = 'all' | 'foundation' | 'intermediate' | 'advanced' | 'pro';
const MAX_MONTHLY_PODS = 3;
const MONTHLY_MIX_STORAGE_KEY = 'pods-page-monthly-mix';

interface PodMixPlanItem {
  podId: string;
  title: string;
  weeks: number;
  role: 'primary' | 'companion';
}

interface ActivePodAssignment {
  learner: Learner;
  rule: PlanningRule;
  primaryPod: Pod | null;
  supportPods: Pod[];
}

const getPodById = (podId: string): Pod | undefined => ALL_PODS.find((pod) => pod.id === podId);

const getPodDefaultWeeks = (podId: string): number => {
  const curriculum = curriculumService.getCurriculum(podId);
  const pod = getPodById(podId);

  return (
    curriculum?.pacingOptions?.[0]?.totalWeeks ||
    curriculum?.weeks.length ||
    pod?.duration ||
    pod?.weeks?.length ||
    4
  );
};

const buildMonthOccupancy = (
  items: PodMixPlanItem[],
  startDate: Date = new Date()
): Array<{
  key: string;
  label: string;
  count: number;
  pods: PodMixPlanItem[];
}> => {
  if (items.length === 0) {
    return [];
  }

  const monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const monthCount = Math.max(
    1,
    ...items.map((item) => Math.max(1, Math.ceil(item.weeks / 4)))
  );

  return Array.from({ length: monthCount }, (_, index) => {
    const currentMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + index, 1);
    const monthItems = items.filter((item) => index < Math.max(1, Math.ceil(item.weeks / 4)));

    return {
      key: `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`,
      label: currentMonth.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
      count: monthItems.length,
      pods: monthItems,
    };
  });
};

const buildSupportPodPlans = (supportPodIds: string[], startDate: string) =>
  supportPodIds.map((podId) => {
    const plannedWeeks = getPodDefaultWeeks(podId);

    return {
      podId,
      startDate,
      endDate: podPacingService.getPlanEndDate(startDate, plannedWeeks),
      plannedWeeks,
    };
  });

const getActiveSupportPodIdsForDate = (
  supportPodIds: string[],
  supportPodPlans: Array<{ podId: string; startDate: string; endDate?: string }> | undefined,
  date: string
): string[] => {
  if (supportPodPlans?.length) {
    return supportPodPlans
      .filter((plan) => plan.startDate <= date && (!plan.endDate || plan.endDate >= date))
      .map((plan) => plan.podId);
  }

  return supportPodIds;
};

const getMonthlyMixStorageKey = (familyId: string): string => `${MONTHLY_MIX_STORAGE_KEY}-${familyId}`;

const arraysMatch = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

export const PodsPage: React.FC = () => {
  const { family, setCurrentPod } = useFamily();
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [libraryPod, setLibraryPod] = useState<Pod | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [expandedPod, setExpandedPod] = useState<string | null>(null);
  const [planningAnswers, setPlanningAnswers] = useState<PodPlanningAnswers>({});
  const [selectedMonthlyPodIds, setSelectedMonthlyPodIds] = useState<string[]>([]);
  const [selectedTargetLearnerIds, setSelectedTargetLearnerIds] = useState<string[]>([]);

  const currentPodId = family?.currentPodId;
  const todayDate = new Date().toISOString().split('T')[0];
  const monthlyMixStorageKey = family?.id ? getMonthlyMixStorageKey(family.id) : null;
  const activeAssignments: ActivePodAssignment[] = family?.id
    ? family.learners.flatMap((learner) => {
        const rule = planningRuleDataService.getCachedActiveForLearner(family.id, learner.id, todayDate);
        if (!rule) {
          return [];
        }

        return [
          {
            learner,
            rule,
            primaryPod: rule.primaryPodId ? getPodById(rule.primaryPodId) || null : null,
            supportPods: getActiveSupportPodIdsForDate(rule.supportPodIds, rule.supportPodPlans, todayDate)
              .map((podId) => getPodById(podId))
              .filter((pod): pod is Pod => Boolean(pod)),
          } satisfies ActivePodAssignment,
        ];
      })
    : [];
  const activeMixPodIds = Array.from(
    new Set(
      activeAssignments.flatMap((assignment) => [
        ...(assignment.rule.primaryPodId ? [assignment.rule.primaryPodId] : []),
        ...assignment.supportPods.map((pod) => pod.id),
      ])
    )
  ).slice(0, MAX_MONTHLY_PODS);
  const activePrimaryPodIds = new Set(
    activeAssignments
      .map((assignment) => assignment.rule.primaryPodId)
      .filter((podId): podId is string => Boolean(podId))
  );
  const activeCompanionPodIds = new Set(
    activeAssignments.flatMap((assignment) => assignment.supportPods.map((pod) => pod.id))
  );
  const activeMixSeed = activeMixPodIds.join('|');
  const activeSupportPods = Array.from(
    new Map(
      activeAssignments
        .flatMap((assignment) => assignment.supportPods)
        .map((pod) => [pod.id, pod] as const)
    ).values()
  );
  const selectedCurriculum = selectedPod ? curriculumService.getCurriculum(selectedPod.id) ?? null : null;
  const recommendedPacing = podPacingService.resolveOption(selectedCurriculum, planningAnswers);
  const selectedProgramHours = podPacingService.getProgramHours(selectedCurriculum);
  const selectedTimeframeWeeks =
    podPacingService.getAnswerNumber(planningAnswers.timeframe) || recommendedPacing.totalWeeks;
  const selectedHoursPerWeek = podPacingService.getAnswerNumber(planningAnswers.hoursPerWeek);
  const suggestedHoursPerWeek = podPacingService.estimateWeeklyHours(selectedProgramHours, selectedTimeframeWeeks);
  const estimatedWeeksFromHours = podPacingService.estimateWeeksFromHours(selectedProgramHours, selectedHoursPerWeek);
  const selectedMonthlyPods = selectedMonthlyPodIds
    .map((podId) => getPodById(podId))
    .filter((pod): pod is Pod => Boolean(pod));
  const selectedPodId = selectedPod?.id;
  const shouldKeepCurrentPrimary =
    Boolean(currentPodId) &&
    Boolean(selectedPodId) &&
    selectedPodId !== currentPodId &&
    (selectedPodId ? selectedMonthlyPodIds.includes(selectedPodId) : false) &&
    selectedMonthlyPodIds.includes(currentPodId ?? '');
  const launchMixPodIds = selectedPod
    ? Array.from(
        new Set(
          selectedMonthlyPodIds.includes(selectedPod.id)
            ? selectedMonthlyPodIds
            : selectedMonthlyPodIds.length > 0
              ? [selectedPod.id, ...selectedMonthlyPodIds]
              : [selectedPod.id]
        )
      ).slice(0, MAX_MONTHLY_PODS)
    : [];
  const launchPrimaryPodId = selectedPod
    ? shouldKeepCurrentPrimary && currentPodId
      ? currentPodId
      : selectedPod.id
    : undefined;
  const selectedSupportPodIds = launchPrimaryPodId
    ? launchMixPodIds.filter((podId) => podId !== launchPrimaryPodId)
    : [];
  const pageMixMonthOccupancy = buildMonthOccupancy(
    selectedMonthlyPodIds.map((podId) => ({
      podId,
      title: getPodById(podId)?.title || 'Pod',
      weeks: getPodDefaultWeeks(podId),
      role: 'companion',
    }))
  );
  const launchMixMonthOccupancy = buildMonthOccupancy(
    launchMixPodIds.map((podId) => ({
      podId,
      title: getPodById(podId)?.title || 'Pod',
      weeks:
        launchPrimaryPodId && podId === launchPrimaryPodId
          ? recommendedPacing.totalWeeks
          : getPodDefaultWeeks(podId),
      role: launchPrimaryPodId && podId === launchPrimaryPodId ? 'primary' : 'companion',
    }))
  );

  useEffect(() => {
    if (!monthlyMixStorageKey) {
      setSelectedMonthlyPodIds([]);
      return;
    }

    let nextSelectedPodIds = activeMixPodIds;

    try {
      const raw = localStorage.getItem(`lumipods-${monthlyMixStorageKey}`);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const persistedPodIds = parsed.filter(
            (podId): podId is string => typeof podId === 'string' && Boolean(getPodById(podId))
          );
          nextSelectedPodIds = Array.from(new Set([...activeMixPodIds, ...persistedPodIds])).slice(0, MAX_MONTHLY_PODS);
        }
      }
    } catch {
      nextSelectedPodIds = activeMixPodIds;
    }

    setSelectedMonthlyPodIds((current) => (arraysMatch(current, nextSelectedPodIds) ? current : nextSelectedPodIds));
  }, [activeMixSeed, activeMixPodIds, monthlyMixStorageKey]);

  useEffect(() => {
    if (!monthlyMixStorageKey) {
      return;
    }

    storage.set(monthlyMixStorageKey, selectedMonthlyPodIds);
  }, [monthlyMixStorageKey, selectedMonthlyPodIds]);

  const toggleMonthlyMixPod = (podId: string) => {
    setSelectedMonthlyPodIds((current) => {
      if (current.includes(podId)) {
        return current.filter((id) => id !== podId);
      }

      if (current.length >= MAX_MONTHLY_PODS) {
        toast.error('You can choose up to 3 pods for the monthly mix.');
        return current;
      }

      return [...current, podId];
    });
  };

  const handleSelectPod = (pod: Pod) => {
    const curriculum = curriculumService.getCurriculum(pod.id);

    if (selectedMonthlyPodIds.length >= MAX_MONTHLY_PODS && !selectedMonthlyPodIds.includes(pod.id)) {
      toast.error('Your monthly mix already has 3 pods. Remove one before starting a different pod.');
      return;
    }

    setSelectedPod(pod);
    setPlanningAnswers(podPacingService.getDefaultAnswers(curriculum?.planningQuestions));
    setSelectedTargetLearnerIds(family?.learners.map((learner) => learner.id) || []);
    setShowConfirmModal(true);
  };

  const handleOpenLibrary = (pod: Pod) => {
    setLibraryPod(pod);
  };

  const handleConfirmPod = async () => {
    if (!selectedPod) return;

    if (launchMixMonthOccupancy.some((month) => month.count > MAX_MONTHLY_PODS)) {
      toast.error('This mix would exceed the 3-pod limit in at least one month.');
      return;
    }

    if (family) {
      const targetLearners =
        selectedTargetLearnerIds.length > 0
          ? family.learners.filter((learner) => selectedTargetLearnerIds.includes(learner.id))
          : family.learners;

      if (family.learners.length > 0 && targetLearners.length === 0) {
        toast.error('Choose at least one learner or select All learners.');
        return;
      }

      const primaryPodId = launchPrimaryPodId || selectedPod.id;
      await Promise.resolve(setCurrentPod(primaryPodId));

      const today = new Date();
      const weekStart = new Date(today);
      const dayOffset = (weekStart.getDay() + 6) % 7;
      weekStart.setDate(weekStart.getDate() - dayOffset);
      const weekStartDate = weekStart.toISOString().split('T')[0];
      const planningWeeks =
        recommendedPacing.totalWeeks ||
        selectedCurriculum?.weeks.length ||
        selectedPod.duration ||
        4;
      const endDate = podPacingService.getPlanEndDate(weekStartDate, planningWeeks);
      const supportPodPlans = buildSupportPodPlans(selectedSupportPodIds, weekStartDate);

      curriculumService.setActivePod(family.id, primaryPodId, 1, {
        startDate: weekStart.toISOString(),
        pacingOptionId: recommendedPacing.id,
        plannedWeeks: planningWeeks,
        sessionsPerWeek: recommendedPacing.sessionsPerWeek,
        minutesPerSession: recommendedPacing.minutesPerSession,
        scheduleMode: planningAnswers.scheduleMode,
      });

      if (targetLearners.length > 0) {
        await Promise.all(
          targetLearners.map(async (learner) => {
            const existingRule = await planningRuleDataService.getByLearner(learner.id);
            const activeRule = existingRule.find((rule) => rule.status === 'active');
            await planningRuleDataService.save({
              id: activeRule?.id || `planning-rule-${learner.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              familyId: family.id,
              learnerId: learner.id,
              name:
                selectedSupportPodIds.length > 0
                  ? `${getPodById(primaryPodId)?.title || selectedPod.title} Monthly Mix`
                  : `${getPodById(primaryPodId)?.title || selectedPod.title} Plan`,
              status: 'active',
              primaryPodId,
              supportPodIds: selectedSupportPodIds,
              supportPodPlans,
              preferredPlatformIds: activeRule?.preferredPlatformIds || [],
              weeklyProjectSessions: activeRule?.weeklyProjectSessions || 2,
              weeklyExternalSessions: activeRule?.weeklyExternalSessions || 1,
              includeMovement: activeRule?.includeMovement ?? true,
              includeFrench: activeRule?.includeFrench ?? true,
              includeWriting: activeRule?.includeWriting ?? true,
              challengeLevel: activeRule?.challengeLevel || 'balanced',
              periodStart: weekStartDate,
              periodEnd: endDate,
              notes:
                [
                  activeRule?.notes,
                  `Pod pacing: ${recommendedPacing.label}`,
                  planningAnswers.scheduleMode ? `Schedule mode: ${planningAnswers.scheduleMode}` : null,
                ]
                  .filter(Boolean)
                  .join(' | ') || undefined,
              createdAt: activeRule?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          })
        );

        targetLearners.forEach((learner) => {
          scheduleService.planSchedulesForRange(
            learner.id,
            family.id,
            weekStartDate,
            endDate,
            {
              podId: primaryPodId,
              skillLevel: learner.skillLevel,
              overwriteUntouched: true,
            }
          );
        });

        toast.success(
          selectedSupportPodIds.length > 0
            ? `${getPodById(primaryPodId)?.title || selectedPod.title} is now active for ${targetLearners.length} learner${targetLearners.length === 1 ? '' : 's'} with ${selectedSupportPodIds.length} companion pod${selectedSupportPodIds.length === 1 ? '' : 's'}.`
            : `${getPodById(primaryPodId)?.title || selectedPod.title} is now active for ${targetLearners.length} learner${targetLearners.length === 1 ? '' : 's'} on the ${recommendedPacing.label.toLowerCase()} plan.`
        );
      } else {
        toast.success(`${getPodById(primaryPodId)?.title || selectedPod.title} is active. Add a learner to generate schedules.`);
      }
    } else {
      toast.success(`Started ${selectedPod.title}!`);
    }

    setShowConfirmModal(false);
    setSelectedMonthlyPodIds(launchMixPodIds);
    setSelectedTargetLearnerIds([]);
    setSelectedPod(null);
  };

  const rebuildUntouchedSchedulesForLearner = (learner: Learner, rule: PlanningRule) => {
    if (!family) {
      return;
    }

    const resetEndDate =
      rule.periodEnd && rule.periodEnd >= todayDate
        ? rule.periodEnd
        : podPacingService.getPlanEndDate(todayDate, 12);

    scheduleService.planSchedulesForRange(
      learner.id,
      family.id,
      todayDate,
      resetEndDate,
      {
        skillLevel: learner.skillLevel,
        overwriteUntouched: true,
      }
    );
  };

  const handleUnassignLearnerPod = async (learnerId: string) => {
    if (!family) {
      return;
    }

    const learner = family.learners.find((entry) => entry.id === learnerId);
    const activeRule = learner
      ? planningRuleDataService.getCachedActiveForLearner(family.id, learner.id, todayDate)
      : null;

    if (!learner || !activeRule) {
      return;
    }

    const primaryPodTitle = activeRule.primaryPodId ? getPodById(activeRule.primaryPodId)?.title : null;
    if (!window.confirm(`Unassign ${learner.name} from ${primaryPodTitle || 'this pod plan'}?`)) {
      return;
    }

    await planningRuleDataService.save({
      ...activeRule,
      status: 'archived',
      periodEnd: todayDate < activeRule.periodStart ? activeRule.periodStart : todayDate,
      updatedAt: new Date().toISOString(),
    });

    const remainingAssignments = family.learners
      .map((entry) => planningRuleDataService.getCachedActiveForLearner(family.id, entry.id, todayDate))
      .filter((entry): entry is PlanningRule => Boolean(entry));

    if (remainingAssignments.length === 0) {
      await Promise.resolve(setCurrentPod(null));
    }

    rebuildUntouchedSchedulesForLearner(learner, activeRule);
    toast.success(`${learner.name} was unassigned from ${primaryPodTitle || 'the pod plan'}.`);
  };

  const handleUnassignAllPods = async () => {
    if (!family || activeAssignments.length === 0) {
      return;
    }

    if (!window.confirm('Unassign all currently active pod plans for this family?')) {
      return;
    }

    await Promise.all(
      activeAssignments.map(({ rule }) =>
        planningRuleDataService.save({
          ...rule,
          status: 'archived',
          periodEnd: todayDate < rule.periodStart ? rule.periodStart : todayDate,
          updatedAt: new Date().toISOString(),
        })
      )
    );

    await Promise.resolve(setCurrentPod(null));
    activeAssignments.forEach(({ learner, rule }) => {
      rebuildUntouchedSchedulesForLearner(learner, rule);
    });

    toast.success('All active pod assignments were cleared.');
  };

  const handleAddSupportPod = async () => {
    if (!selectedPod || !family?.currentPodId || !family.learners.length) {
      return;
    }

    try {
      const targetLearners =
        selectedTargetLearnerIds.length > 0
          ? family.learners.filter((learner) => selectedTargetLearnerIds.includes(learner.id))
          : family.learners;

      if (family.learners.length > 0 && targetLearners.length === 0) {
        toast.error('Choose at least one learner or select All learners.');
        return;
      }

      await Promise.all(
        targetLearners.map(async (learner) => {
          const existingRules = await planningRuleDataService.getByLearner(learner.id);
          const activeRule = existingRules.find((rule) => rule.status === 'active');
          const nextSupportPodIds = Array.from(
            new Set([...(activeRule?.supportPodIds || []), selectedPod.id].filter((podId) => podId !== family.currentPodId))
          );
          const existingSupportPlans = activeRule?.supportPodPlans || [];
          const nextSupportPodPlans = [...existingSupportPlans];
          buildSupportPodPlans(
            nextSupportPodIds.filter((podId) => !existingSupportPlans.some((plan) => plan.podId === podId)),
            new Date().toISOString().split('T')[0]
          ).forEach((plan) => {
            if (!nextSupportPodPlans.some((entry) => entry.podId === plan.podId)) {
              nextSupportPodPlans.push(plan);
            }
          });

          if (nextSupportPodIds.length > 2) {
            throw new Error('You can only run up to 3 pods in a monthly mix.');
          }

          await planningRuleDataService.save({
            id: activeRule?.id || `planning-rule-${learner.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            familyId: family.id,
            learnerId: learner.id,
            name: `${ALL_PODS.find((pod) => pod.id === family.currentPodId)?.title || 'Mixed'} Blend`,
            status: 'active',
            primaryPodId: activeRule?.primaryPodId || family.currentPodId || undefined,
            supportPodIds: nextSupportPodIds,
            supportPodPlans: nextSupportPodPlans,
            preferredPlatformIds: activeRule?.preferredPlatformIds || [],
            weeklyProjectSessions: activeRule?.weeklyProjectSessions || 2,
            weeklyExternalSessions: activeRule?.weeklyExternalSessions || 1,
            includeMovement: activeRule?.includeMovement ?? true,
            includeFrench: activeRule?.includeFrench ?? true,
            includeWriting: activeRule?.includeWriting ?? true,
            challengeLevel: activeRule?.challengeLevel || 'balanced',
            periodStart: activeRule?.periodStart || new Date().toISOString().split('T')[0],
            periodEnd: activeRule?.periodEnd,
            notes: activeRule?.notes,
            createdAt: activeRule?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          scheduleService.planSchedulesForRange(
            learner.id,
            family.id,
            new Date().toISOString().split('T')[0],
            new Date(Date.now() + 1000 * 60 * 60 * 24 * 27).toISOString().split('T')[0],
            {
              podId: activeRule?.primaryPodId || family.currentPodId || undefined,
              skillLevel: learner.skillLevel,
              overwriteUntouched: true,
            }
          );
        })
      );

      setSelectedMonthlyPodIds((current) =>
        Array.from(new Set([...current, selectedPod.id])).slice(0, MAX_MONTHLY_PODS)
      );
      toast.success(
        `${selectedPod.title} added as a support pod for ${targetLearners.length} learner${targetLearners.length === 1 ? '' : 's'}.`
      );
      setShowConfirmModal(false);
      setSelectedTargetLearnerIds([]);
      setSelectedPod(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add support pod');
    }
  };

  // Filter pods
  const filteredPods = ALL_PODS.filter(pod => {
    if (categoryFilter === 'stem' && (pod.theme === 'language' || pod.theme === 'maths' || pod.id.startsWith('pod-'))) return false;
    if (categoryFilter === 'maths' && pod.theme !== 'maths') return false;
    if (categoryFilter === 'language' && pod.theme !== 'language') return false;
    if (categoryFilter === 'yearly' && !pod.id.startsWith('pod-')) return false;
    if (levelFilter !== 'all' && pod.skillLevel !== levelFilter) return false;
    return true;
  });

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'foundation': return 'bg-emerald-100 text-emerald-700';
      case 'intermediate': return 'bg-sky-100 text-sky-700';
      case 'advanced': return 'bg-violet-100 text-violet-700';
      case 'pro': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="h-6 w-6 text-slate-600" />
            <h1 className="text-2xl font-semibold text-slate-900">Learning Pods</h1>
          </div>
          <p className="text-slate-600">
            Choose themed learning adventures. Each pod includes hands-on projects, creative activities, and real artifacts to showcase learning.
          </p>
        </header>

        {/* Current Pod Banner */}
        {(activeAssignments.length > 0 || currentPodId) && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-900">
                    {activeAssignments.length > 0
                      ? 'Active pod assignments'
                      : `Currently Active: ${ALL_PODS.find((p) => p.id === currentPodId)?.title}`}
                  </p>
                  <p className="text-xs text-emerald-700">
                    {activeAssignments.length > 0
                      ? `${activeAssignments.length} learner${activeAssignments.length === 1 ? '' : 's'} currently assigned.${activeSupportPods.length > 0 ? ` Companion pods in rotation: ${activeSupportPods.map((pod) => pod.title).join(', ')}` : ''}`
                      : `Week ${family?.currentWeek || 1}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(activeAssignments[0]?.primaryPod || currentPodId) ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const activePod = activeAssignments[0]?.primaryPod || ALL_PODS.find((p) => p.id === currentPodId);
                      if (activePod) {
                        handleOpenLibrary(activePod);
                      }
                    }}
                  >
                    Open Library
                  </Button>
                ) : null}
                {activeAssignments.length > 0 ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => void handleUnassignAllPods()}
                  >
                    Unassign All
                  </Button>
                ) : null}
              </div>
            </div>

            {activeAssignments.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2 mt-4">
                {activeAssignments.map(({ learner, primaryPod, supportPods }) => (
                  <div
                    key={learner.id}
                    className="rounded-xl border border-emerald-200 bg-white/70 px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{learner.name}</p>
                        <p className="text-xs text-slate-600">
                          {primaryPod?.title || 'Custom pod plan'}
                        </p>
                        {supportPods.length > 0 ? (
                          <p className="text-xs text-slate-500 mt-1">
                            Support pods: {supportPods.map((pod) => pod.title).join(', ')}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => void handleUnassignLearnerPod(learner.id)}
                      >
                        Unassign
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </m.div>
        )}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">Monthly Pod Mix</p>
                <Badge variant="info" size="sm">
                  {selectedMonthlyPodIds.length}/{MAX_MONTHLY_PODS} selected
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Pick pods directly on this page, then open one to start it as the primary pod. Companion pods stay
                available for cross-topic application rather than replacing the main lesson spine.
              </p>
            </div>
            {selectedMonthlyPodIds.length > 0 ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedMonthlyPodIds([])}
              >
                Clear Mix
              </Button>
            ) : null}
          </div>

          {selectedMonthlyPods.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedMonthlyPods.map((pod) => (
                  <button
                    key={pod.id}
                    type="button"
                    onClick={() => toggleMonthlyMixPod(pod.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
                  >
                    <span className="font-medium">{pod.title}</span>
                    <X className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-sky-700 mt-0.5" />
                  <div className="text-sm text-sky-900">
                    Companion pods rotate into project, reflection, and language/application blocks to help learners
                    connect ideas across themes. Longer pods keep occupying a slot in every month they span.
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3 mt-4">
                {pageMixMonthOccupancy.map((month) => (
                  <div key={month.key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-slate-900">{month.label}</p>
                      <Badge size="sm" variant={month.count >= MAX_MONTHLY_PODS ? 'info' : 'default'}>
                        {month.count}/{MAX_MONTHLY_PODS} pods
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {month.pods.map((pod) => (
                        <p key={`${month.key}-${pod.podId}`} className="text-xs text-slate-600">
                          {pod.title}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 mt-4">
              Default is one pod. Add up to two more companions on the pod cards below if you want a mixed month.
            </p>
          )}
        </section>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Category Filter */}
          <div className="flex gap-2">
            <span className="text-sm text-slate-500 self-center mr-2">Category:</span>
            {[
              { id: 'all', label: 'All', icon: '📚' },
              { id: 'stem', label: 'STEM', icon: '🔬' },
              { id: 'maths', label: 'Maths', icon: '📐' },
              { id: 'language', label: 'Languages', icon: '🌍' },
              { id: 'yearly', label: 'Year-Round', icon: '📅' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
                  categoryFilter === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                )}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex gap-2">
            <span className="text-sm text-slate-500 self-center mr-2">Level:</span>
            {['all', 'foundation', 'intermediate', 'advanced', 'pro'].map(level => (
              <button
                key={level}
                onClick={() => setLevelFilter(level as LevelFilter)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                  levelFilter === level
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                )}
              >
                {level === 'all' ? 'All Levels' : level}
              </button>
            ))}
          </div>
        </div>


        {/* Pod Categories */}
        {categoryFilter === 'all' && levelFilter === 'all' && (
          <div className="space-y-8 mb-8">
            {POD_CATEGORIES.map(category => (
              <section key={category.id}>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  {category.name}
                  <Badge>{category.pods.length} pods</Badge>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.pods.map(pod => (
                    <EnhancedPodCard
                      key={pod.id}
                      pod={pod}
                      isActive={activePrimaryPodIds.has(pod.id) || currentPodId === pod.id}
                      isCompanionActive={activeCompanionPodIds.has(pod.id)}
                      isInMonthlyMix={selectedMonthlyPodIds.includes(pod.id)}
                      isMonthlyMixFull={selectedMonthlyPodIds.length >= MAX_MONTHLY_PODS}
                      isExpanded={expandedPod === pod.id}
                      onSelect={handleSelectPod}
                      onToggleMonthlyMix={toggleMonthlyMixPod}
                      onOpenLibrary={handleOpenLibrary}
                      onToggleExpand={() => setExpandedPod(expandedPod === pod.id ? null : pod.id)}
                      getLevelColor={getLevelColor}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Filtered Pod Grid */}
        {(categoryFilter !== 'all' || levelFilter !== 'all') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {filteredPods.map(pod => (
              <EnhancedPodCard
                key={pod.id}
                pod={pod}
                isActive={activePrimaryPodIds.has(pod.id) || currentPodId === pod.id}
                isCompanionActive={activeCompanionPodIds.has(pod.id)}
                isInMonthlyMix={selectedMonthlyPodIds.includes(pod.id)}
                isMonthlyMixFull={selectedMonthlyPodIds.length >= MAX_MONTHLY_PODS}
                isExpanded={expandedPod === pod.id}
                onSelect={handleSelectPod}
                onToggleMonthlyMix={toggleMonthlyMixPod}
                onOpenLibrary={handleOpenLibrary}
                onToggleExpand={() => setExpandedPod(expandedPod === pod.id ? null : pod.id)}
                getLevelColor={getLevelColor}
              />
            ))}
          </div>
        )}

        {filteredPods.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No pods match your filters. Try adjusting your selection.</p>
          </div>
        )}

        {/* How Pods Work Section */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">How Pods Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card padding="lg" className="text-center bg-white border border-slate-200">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-medium text-slate-900 mb-2">Project-Based</h3>
              <p className="text-sm text-slate-600">
                Learn by doing real projects, not worksheets
              </p>
            </Card>
            <Card padding="lg" className="text-center bg-white border border-slate-200">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-medium text-slate-900 mb-2">Create Artifacts</h3>
              <p className="text-sm text-slate-600">
                Build a portfolio of real work to showcase
              </p>
            </Card>
            <Card padding="lg" className="text-center bg-white border border-slate-200">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="font-medium text-slate-900 mb-2">Fun First</h3>
              <p className="text-sm text-slate-600">
                Games, experiments, and creative activities
              </p>
            </Card>
            <Card padding="lg" className="text-center bg-white border border-slate-200">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-medium text-slate-900 mb-2">Track Growth</h3>
              <p className="text-sm text-slate-600">
                Watch competencies light up as you learn
              </p>
            </Card>
          </div>
        </section>
      </div>

      {/* Confirm Pod Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={`Start ${selectedPod?.title}?`}
        size="lg"
      >
        {selectedPod && (
          <div>
            <div
              className={cn(
                'h-32 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br',
                POD_THEME_CONFIG[selectedPod.theme].bgGradient
              )}
            >
              <span className="text-5xl">{POD_THEME_CONFIG[selectedPod.theme].icon}</span>
            </div>

            <p className="text-slate-600 mb-4">{selectedPod.description}</p>

            {shouldKeepCurrentPrimary && currentPodId ? (
              <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
                <p className="text-sm font-medium text-sky-900">
                  This pod will be added as a companion to {getPodById(currentPodId)?.title || 'the current primary pod'}.
                </p>
                <p className="text-xs text-sky-700 mt-1">
                  The current primary pod stays in charge of the main lesson spine, and this pod blends into projects,
                  reflection, and cross-topic application blocks.
                </p>
              </div>
            ) : null}

            {family?.learners.length ? (
              <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Assign this pod to</p>
                    <p className="text-xs text-slate-500">
                      Choose specific learners or select all. This pod will only generate schedules for the learners picked here.
                    </p>
                  </div>
                  <Badge variant="info" size="sm">
                    {selectedTargetLearnerIds.length}/{family.learners.length} learners
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTargetLearnerIds(family.learners.map((learner) => learner.id))}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                      selectedTargetLearnerIds.length === family.learners.length
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    )}
                  >
                    All learners
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  {family.learners.map((learner) => {
                    const isSelected = selectedTargetLearnerIds.includes(learner.id);

                    return (
                      <label
                        key={learner.id}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border px-3 py-3 cursor-pointer transition-colors',
                          isSelected
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        )}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedTargetLearnerIds((current) =>
                              current.includes(learner.id)
                                ? current.filter((id) => id !== learner.id)
                                : [...current, learner.id]
                            );
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{learner.name}</p>
                          <p className="text-xs text-slate-500 capitalize">
                            {learner.skillLevel} level
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Pod Details */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Clock className="h-3 w-3" /> Duration
                </div>
                <p className="font-medium text-slate-900">{recommendedPacing.totalWeeks} weeks</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Star className="h-3 w-3" /> Level
                </div>
                <p className="font-medium text-slate-900 capitalize">{selectedPod.skillLevel || 'All levels'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <BookOpen className="h-3 w-3" /> Program
                </div>
                <p className="font-medium text-slate-900">
                  {selectedCurriculum?.programHours ? `${selectedCurriculum.programHours} hours` : 'Flexible'}
                </p>
              </div>
            </div>

            {selectedCurriculum?.planningQuestions?.length ? (
              <div className="mb-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Plan the pod</p>
                    <p className="text-xs text-slate-500">Answer a few questions and the app will spread the pod across a realistic timeframe.</p>
                  </div>
                  <Badge variant="info" size="sm">
                    {recommendedPacing.label}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedCurriculum.planningQuestions.map((question) => {
                    const value =
                      question.type === 'timeframe'
                        ? planningAnswers.timeframe || question.options[0]
                        : question.type === 'hours-per-week'
                          ? planningAnswers.hoursPerWeek || question.options[0]
                          : question.type === 'minutes-per-day'
                            ? planningAnswers.minutesPerDay || question.options[0]
                            : planningAnswers.scheduleMode || question.options[0];

                    return (
                      <Select
                        key={question.id}
                        label={question.prompt}
                        value={value}
                        options={question.options.map((option) => ({ value: option, label: option }))}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setPlanningAnswers((current) => ({
                            ...current,
                            timeframe: question.type === 'timeframe' ? nextValue : current.timeframe,
                            hoursPerWeek: question.type === 'hours-per-week' ? nextValue : current.hoursPerWeek,
                            minutesPerDay: question.type === 'minutes-per-day' ? nextValue : current.minutesPerDay,
                            scheduleMode: question.type === 'schedule-mode' ? nextValue : current.scheduleMode,
                          }));
                        }}
                      />
                    );
                  })}
                </div>
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs font-medium text-emerald-700 mb-1">Recommended pacing</p>
                  <p className="text-sm text-emerald-900">
                    {podPacingService.describePlan(recommendedPacing, selectedCurriculum?.programHours)}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">{recommendedPacing.notes}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                    <p className="text-xs font-medium text-sky-700 mb-1">If you choose {selectedTimeframeWeeks} weeks</p>
                    <p className="text-sm text-sky-900">
                      Aim for about {podPacingService.formatWeeklyHours(suggestedHoursPerWeek)} to stay on track.
                    </p>
                  </div>
                  <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
                    <p className="text-xs font-medium text-violet-700 mb-1">
                      If you can give {podPacingService.formatWeeklyHours(selectedHoursPerWeek)}
                    </p>
                    <p className="text-sm text-violet-900">
                      This pod will take about {estimatedWeeksFromHours || recommendedPacing.totalWeeks} weeks.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-3 mb-4">
              {launchMixPodIds.length > 1 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Monthly pod mix</p>
                      <p className="text-xs text-slate-500">
                        Picked on the Pods page. The primary pod keeps the lesson spine while companions blend into
                        project, reflection, and transfer blocks.
                      </p>
                    </div>
                    <Badge variant="info" size="sm">
                      {launchMixPodIds.length}/{MAX_MONTHLY_PODS} selected
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {launchMixPodIds.map((podId) => {
                      const pod = getPodById(podId);
                      if (!pod) {
                        return null;
                      }

                      return (
                        <Badge key={pod.id} variant={pod.id === launchPrimaryPodId ? 'info' : 'default'} size="sm">
                          {pod.id === launchPrimaryPodId ? `Primary: ${pod.title}` : `Companion: ${pod.title}`}
                        </Badge>
                      );
                    })}
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    {launchMixMonthOccupancy.map((month) => (
                      <div key={month.key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-slate-900">{month.label}</p>
                          <Badge size="sm" variant="default">
                            {month.count}/{MAX_MONTHLY_PODS}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {month.pods.map((pod) => (
                            <p key={`${month.key}-${pod.podId}`} className="text-xs text-slate-600">
                              {pod.role === 'primary' ? 'Primary' : 'Companion'}: {pod.title}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-xs font-medium text-emerald-600 mb-1">🎯 Milestone Project</p>
                <p className="text-sm text-emerald-900">{selectedPod.milestone}</p>
              </div>

              {selectedCurriculum?.segments?.length ? (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Digestible Science Segments</p>
                  <div className="grid gap-2">
                    {selectedCurriculum.segments.map((segment) => (
                      <div key={segment.id} className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-sm font-medium text-slate-900">{segment.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{segment.summary}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          Unlocks: {segment.skillsUnlocked.join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Learning Goals ({selectedPod.learningObjectives.length})</p>
                <ul className="space-y-1">
                  {selectedPod.learningObjectives.slice(0, 7).map((obj, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      {obj}
                    </li>
                  ))}
                  {selectedPod.learningObjectives.length > 7 && (
                    <li className="text-sm text-slate-400">+{selectedPod.learningObjectives.length - 7} more goals</li>
                  )}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Artifacts You'll Create</p>
                <div className="flex flex-wrap gap-1">
                  {selectedPod.artifactTypes.map((type) => (
                    <Badge key={type} variant="info" size="sm">{type}</Badge>
                  ))}
                </div>
              </div>

              {(selectedCurriculum?.references?.length || selectedCurriculum?.supportingAssets?.length) ? (
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <p className="text-xs font-medium text-slate-500 mb-2">Credibility Sources</p>
                    <ul className="space-y-1">
                      {(selectedCurriculum?.references || []).slice(0, 4).map((reference) => (
                        <li key={reference.id} className="text-sm text-slate-700">
                          {reference.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-white">
                    <p className="text-xs font-medium text-slate-500 mb-2">Support Assets</p>
                    <ul className="space-y-1">
                      {(selectedCurriculum?.supportingAssets || []).slice(0, 4).map((asset) => (
                        <li key={asset.id} className="text-sm text-slate-700">
                          {asset.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            <ModalFooter>
              <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleOpenLibrary(selectedPod);
                }}
              >
                Browse Library
              </Button>
              {family?.currentPodId && family.currentPodId !== selectedPod.id && (
                <Button variant="secondary" onClick={() => void handleAddSupportPod()}>
                  Blend as Support Pod
                </Button>
              )}
              <Button
                variant="primary"
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
                onClick={() => void handleConfirmPod()}
              >
                Start Learning
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>

      <PodLibraryModal
        isOpen={Boolean(libraryPod)}
        onClose={() => setLibraryPod(null)}
        pod={libraryPod}
        familyId={family?.id}
        learners={family?.learners || []}
      />
    </div>
  );
};


// Enhanced Pod Card with more details
interface EnhancedPodCardProps {
  pod: Pod;
  isActive: boolean;
  isCompanionActive: boolean;
  isInMonthlyMix: boolean;
  isMonthlyMixFull: boolean;
  isExpanded: boolean;
  onSelect: (pod: Pod) => void;
  onToggleMonthlyMix: (podId: string) => void;
  onOpenLibrary: (pod: Pod) => void;
  onToggleExpand: () => void;
  getLevelColor: (level?: string) => string;
}

const EnhancedPodCard: React.FC<EnhancedPodCardProps> = ({
  pod,
  isActive,
  isCompanionActive,
  isInMonthlyMix,
  isMonthlyMixFull,
  isExpanded,
  onSelect,
  onToggleMonthlyMix,
  onOpenLibrary,
  onToggleExpand,
  getLevelColor,
}) => {
  const themeConfig = POD_THEME_CONFIG[pod.theme];
  const curriculum = curriculumService.getCurriculum(pod.id);
  const weekCount = curriculum?.weeks.length || pod.duration || pod.weeks?.length || 4;
  const programHours = curriculum?.programHours;

  return (
    <m.div
      layout
      className={cn(
        'rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-white',
        isActive
          ? 'border-emerald-500 ring-2 ring-emerald-200'
          : isCompanionActive
            ? 'border-sky-400 ring-2 ring-sky-100'
          : 'border-slate-200 hover:border-slate-300'
      )}
    >
      {/* Header with gradient */}
      <div
        className={cn('h-24 relative bg-gradient-to-br', themeConfig.bgGradient)}
        onClick={onToggleExpand}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">{themeConfig.icon}</span>
        </div>
        {isActive ? (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Check className="h-3 w-3" /> Primary
          </div>
        ) : isCompanionActive ? (
          <div className="absolute top-2 right-2 bg-sky-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Check className="h-3 w-3" /> Companion
          </div>
        ) : null}
        {pod.skillLevel && (
          <div className={cn('absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium capitalize', getLevelColor(pod.skillLevel))}>
            {pod.skillLevel}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">{pod.title}</h3>
        <p className="text-sm text-slate-500 mb-3 line-clamp-2">{pod.description}</p>

        {/* Quick stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {weekCount} weeks
          </span>
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" /> {pod.learningObjectives.length} goals
          </span>
          {programHours ? (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> {programHours} hrs
            </span>
          ) : null}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-100 pt-3 mt-3"
          >
            {/* Learning Goals - Named */}
            <p className="text-xs font-medium text-slate-500 mb-2">Learning Goals:</p>
            <ul className="space-y-1 mb-3">
              {pod.learningObjectives.map((obj, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                  <span className="text-emerald-500 font-medium">{i + 1}.</span> {obj}
                </li>
              ))}
            </ul>

            {/* Milestone */}
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 mb-3">
              <p className="text-xs font-medium text-amber-700 mb-1">🏆 Milestone Project:</p>
              <p className="text-xs text-amber-800">{pod.milestone}</p>
            </div>

            {curriculum?.segments?.length ? (
              <div className="mb-3">
                <p className="text-xs font-medium text-slate-500 mb-2">Segments:</p>
                <div className="flex flex-wrap gap-1">
                  {curriculum.segments.slice(0, 4).map((segment) => (
                    <span key={segment.id} className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded">
                      {segment.title}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Week preview for language pods */}
            {pod.theme === 'language' && pod.weeks && pod.weeks.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-slate-500 mb-2">Weekly Topics:</p>
                <div className="flex flex-wrap gap-1">
                  {pod.weeks.slice(0, 6).map((week, i) => (
                    <span key={i} className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded">
                      {week.title}
                    </span>
                  ))}
                  {pod.weeks.length > 6 && (
                    <span className="text-xs text-slate-400">+{pod.weeks.length - 6} more</span>
                  )}
                </div>
              </div>
            )}
          </m.div>
        )}

        {/* Action button */}
        <div className="mb-2">
          <Button
            variant={isInMonthlyMix ? 'primary' : 'secondary'}
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMonthlyMix(pod.id);
            }}
            disabled={isMonthlyMixFull && !isInMonthlyMix}
          >
            {isInMonthlyMix ? 'In Monthly Mix' : 'Add to Monthly Mix'}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLibrary(pod);
            }}
          >
            View Library
          </Button>
          <Button
            variant={isActive || isCompanionActive ? 'secondary' : 'primary'}
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              if (!isActive) onSelect(pod);
            }}
          >
            {isActive ? 'Continue' : isCompanionActive ? 'Manage Pod' : 'Start Pod'}
          </Button>
        </div>
      </div>
    </m.div>
  );
};

export default PodsPage;
