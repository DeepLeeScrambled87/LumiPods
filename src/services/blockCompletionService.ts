import type { ScheduleBlock, BlockCompletionDetails } from '../types/schedule';
import { achievementService } from './achievementService';
import {
  externalActivitySessionDataService,
  projectDataService,
  reflectionEntryDataService,
} from './learningRecordsService';

const hasStructuredReflection = (details?: BlockCompletionDetails): boolean => {
  const reflection = details?.reflection;
  if (!reflection) {
    return false;
  }

  return Boolean(
    reflection.whatLearned?.trim() ||
      reflection.challenge?.trim() ||
      reflection.nextStep?.trim() ||
      reflection.quickCheckAnswer?.trim()
  );
};

export const finalizeBlockCompletion = async (params: {
  familyId: string;
  learnerId: string;
  date: string;
  block: ScheduleBlock;
  details?: BlockCompletionDetails;
}): Promise<void> => {
  const { familyId, learnerId, date, block, details } = params;
  const timestamp = new Date().toISOString();
  let reflectionId: string | undefined;

  if (hasStructuredReflection(details)) {
    const reflection = details?.reflection;
    const savedEntry = await reflectionEntryDataService.create({
      id: `reflection-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      familyId,
      learnerId,
      date,
      blockId: block.id,
      blockTitle: block.title,
      projectId: block.projectId,
      externalSessionId: block.externalSessionId,
      prompt: reflection?.prompt || block.reflectionPrompt,
      whatLearned: reflection?.whatLearned?.trim() || details?.notes?.trim() || block.title,
      challenge: reflection?.challenge?.trim() || undefined,
      nextStep: reflection?.nextStep?.trim() || undefined,
      confidence: reflection?.confidence || 3,
      notes: details?.notes?.trim() || undefined,
      quizAnswers: reflection?.quickCheckAnswer?.trim()
        ? [{ question: 'Quick check', answer: reflection.quickCheckAnswer.trim() }]
        : [],
      evidenceArtifactIds: block.artifacts || [],
      tags: Array.from(
        new Set(
          [
            block.type,
            block.source,
            block.externalPlatformId ? `platform:${block.externalPlatformId}` : null,
            block.podId ? `pod:${block.podId}` : null,
          ].filter((value): value is string => Boolean(value))
        )
      ),
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    reflectionId = savedEntry.id;
  }

  if (block.projectId) {
    const cachedProject = projectDataService
      .getCachedByLearner(learnerId)
      .find((project) => project.id === block.projectId);

    if (cachedProject) {
      await projectDataService.touch(block.projectId, learnerId, {
        status: cachedProject.status === 'planned' ? 'active' : cachedProject.status,
        lastWorkedAt: timestamp,
        reflectionIds: reflectionId
          ? Array.from(new Set([...(cachedProject.reflectionIds || []), reflectionId]))
          : cachedProject.reflectionIds,
      });
    }
  }

  if (block.externalSessionId) {
    const cachedSession = externalActivitySessionDataService
      .getCachedByLearner(learnerId)
      .find((session) => session.id === block.externalSessionId);

    if (cachedSession) {
      await externalActivitySessionDataService.save({
        ...cachedSession,
        status: block.status === 'skipped' ? 'skipped' : 'completed',
        blockId: block.id,
        notes: details?.notes?.trim() || cachedSession.notes,
        reflectionId: reflectionId || cachedSession.reflectionId,
        evidenceArtifactIds: block.artifacts || cachedSession.evidenceArtifactIds,
        completedAt: block.completedAt || timestamp,
        updatedAt: timestamp,
      });
    }
  }

  await achievementService.checkAndUnlock(familyId, learnerId);
};
