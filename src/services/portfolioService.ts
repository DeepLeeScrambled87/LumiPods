// Portfolio Service - schema-aligned artifact and competency persistence
import { pb, COLLECTIONS } from '../lib/pocketbase';
import { storage } from '../lib/storage';
import {
  AUDIENCE_LEVEL_PREFIX,
  AUDIENCE_LEARNER_PREFIX,
  getArtifactTagValues,
  getSharedGroupId,
  getSupportAssetIds,
  isLearnerPortfolioArtifact,
  isPodLibraryArtifact,
} from '../lib/artifactScope';
import { artifactDataService } from './dataService';
import { syncLearnerPointsBalance } from './pointsBalanceService';
import type { Artifact } from '../types/artifact';
import type { LearnerCompetency } from '../types/competency';
import type { SkillLevel } from '../types/skillLevel';

const COMPETENCIES_KEY = 'learner-competencies';
const CONTENT_MATCH_STOP_WORDS = new Set([
  'the',
  'and',
  'with',
  'from',
  'that',
  'this',
  'into',
  'your',
  'have',
  'will',
  'about',
  'using',
  'today',
  'week',
  'pod',
  'session',
  'learning',
  'related',
  'resource',
  'resources',
]);

const isPocketBaseRecordId = (id: string): boolean => /^[a-z0-9]{15}$/.test(id);
const extractContentKeywords = (...content: Array<string | undefined>): Set<string> => {
  const combined = content.filter(Boolean).join(' ').toLowerCase();
  const normalized = combined.replace(/[^a-z0-9\s-]/g, ' ');
  const tokens = normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !CONTENT_MATCH_STOP_WORDS.has(token));

  return new Set(tokens);
};

const hasKeywordOverlap = (left: Set<string>, right: Set<string>): boolean => {
  for (const token of left) {
    if (right.has(token)) {
      return true;
    }
  }

  return false;
};

// Check if PocketBase is available
const checkOnline = async (): Promise<boolean> => {
  try {
    await pb.health.check();
    return true;
  } catch {
    return false;
  }
};

type CreateArtifactInput = Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'> & {
  file?: File;
};

interface PBCompetencyRecord {
  id: string;
  learner: string;
  domain: LearnerCompetency['domain'];
  level: LearnerCompetency['level'];
  evidenceIds?: string[];
  assessedBy: LearnerCompetency['assessedBy'];
  notes?: string;
  created: string;
  updated: string;
}

export const portfolioService = {
  async getArtifacts(learnerId: string): Promise<Artifact[]> {
    return artifactDataService.getByLearner(learnerId);
  },

  async getLearnerPortfolioArtifacts(learnerId: string): Promise<Artifact[]> {
    const artifacts = await this.getArtifacts(learnerId);
    return artifacts.filter(isLearnerPortfolioArtifact);
  },

  async getAllFamilyArtifacts(learnerIds: string[]): Promise<Artifact[]> {
    const artifactGroups = await Promise.all(
      learnerIds.map((learnerId) => artifactDataService.getByLearner(learnerId))
    );

    return artifactGroups
      .flat()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAllFamilyPortfolioArtifacts(learnerIds: string[]): Promise<Artifact[]> {
    const artifacts = await this.getAllFamilyArtifacts(learnerIds);
    return artifacts.filter(isLearnerPortfolioArtifact);
  },

  async getPodArtifacts(podId: string, learnerIds: string[]): Promise<Artifact[]> {
    const artifacts = await this.getAllFamilyArtifacts(learnerIds);
    return artifacts.filter((artifact) => artifact.podId === podId);
  },

  async getPodLibraryArtifacts(podId: string, learnerIds: string[]): Promise<Artifact[]> {
    const artifacts = await this.getAllFamilyArtifacts(learnerIds);
    return artifacts.filter(
      (artifact) => artifact.podId === podId && isPodLibraryArtifact(artifact)
    );
  },

  async createArtifact(artifact: CreateArtifactInput): Promise<Artifact> {
    if (!artifact.familyId) {
      throw new Error('Artifacts require a familyId before they can be saved.');
    }

    const timestamp = new Date().toISOString();
    const newArtifact: Artifact = {
      ...artifact,
      id: `artifact-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const savedArtifact = await artifactDataService.save(newArtifact, { file: artifact.file });
    if (savedArtifact.familyId && isLearnerPortfolioArtifact(savedArtifact)) {
      await syncLearnerPointsBalance(savedArtifact.familyId, savedArtifact.learnerId);
    }
    return savedArtifact;
  },

  async updateArtifact(artifact: Artifact, options?: { file?: File }): Promise<Artifact> {
    const savedArtifact = await artifactDataService.save(
      {
        ...artifact,
        updatedAt: new Date().toISOString(),
      },
      options
    );
    if (savedArtifact.familyId && isLearnerPortfolioArtifact(savedArtifact)) {
      await syncLearnerPointsBalance(savedArtifact.familyId, savedArtifact.learnerId);
    }
    return savedArtifact;
  },

  async deleteArtifact(artifact: Artifact): Promise<void> {
    await artifactDataService.delete(artifact);
    if (artifact.familyId && isLearnerPortfolioArtifact(artifact)) {
      await syncLearnerPointsBalance(artifact.familyId, artifact.learnerId);
    }
  },

  async toggleFeatured(artifact: Artifact): Promise<Artifact> {
    return this.updateArtifact({ ...artifact, isFeatured: !artifact.isFeatured });
  },

  async getFeaturedArtifacts(learnerId: string): Promise<Artifact[]> {
    const artifacts = await this.getLearnerPortfolioArtifacts(learnerId);
    return artifacts.filter((artifact) => artifact.isFeatured);
  },

  async getRelevantPodLibraryAssets(params: {
    learnerId: string;
    podId: string;
    weekNumber?: number;
    skillLevel?: SkillLevel;
    supportAssetIds?: string[];
    familyLearnerIds?: string[];
    blockContent?: string[];
  }): Promise<Artifact[]> {
    const {
      learnerId,
      podId,
      weekNumber,
      skillLevel,
      supportAssetIds = [],
      familyLearnerIds = [learnerId],
      blockContent = [],
    } = params;
    const artifacts = await this.getPodLibraryArtifacts(podId, familyLearnerIds);
    const blockKeywords = extractContentKeywords(...blockContent);

    const relevantArtifacts = artifacts
      .filter((artifact) => {
        const targetLevels = getArtifactTagValues(
          artifact.tags || [],
          AUDIENCE_LEVEL_PREFIX
        ) as SkillLevel[];
        const targetLearnerIds = getArtifactTagValues(
          artifact.tags || [],
          AUDIENCE_LEARNER_PREFIX
        );
        const matchingSupportAssetIds = getSupportAssetIds(artifact);
        const assetKeywords = extractContentKeywords(
          artifact.title,
          artifact.description,
          artifact.reflection,
          ...(artifact.tags || [])
        );

        const levelMatch =
          !skillLevel || targetLevels.length === 0 || targetLevels.includes(skillLevel);
        const learnerMatch =
          targetLearnerIds.length === 0 || targetLearnerIds.includes(learnerId);
        const weekMatch =
          !weekNumber || artifact.weekNumber === undefined || artifact.weekNumber === weekNumber;
        const explicitSupportMatch =
          supportAssetIds.length > 0 &&
          matchingSupportAssetIds.some((supportAssetId) => supportAssetIds.includes(supportAssetId));
        const keywordMatch =
          blockKeywords.size > 0 && hasKeywordOverlap(blockKeywords, assetKeywords);
        const supportAssetMatch =
          supportAssetIds.length > 0
            ? explicitSupportMatch
            : matchingSupportAssetIds.length === 0 && keywordMatch;

        return levelMatch && learnerMatch && weekMatch && supportAssetMatch;
      })
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

    const dedupedArtifacts = new Map<string, Artifact>();
    relevantArtifacts.forEach((artifact) => {
      const key = getSharedGroupId(artifact) || artifact.id;
      if (!dedupedArtifacts.has(key)) {
        dedupedArtifacts.set(key, artifact);
      }
    });

    return Array.from(dedupedArtifacts.values());
  },
};

export const competencyService = {
  async getCompetencies(learnerId: string): Promise<LearnerCompetency[]> {
    const isOnline = await checkOnline();

    if (isOnline) {
      try {
        const records = await pb.collection(COLLECTIONS.COMPETENCIES).getFullList<PBCompetencyRecord>({
          filter: `learner = "${learnerId}"`,
          sort: '-updated',
        });
        const competencies = records.map(mapRecordToCompetency);
        storage.set(`${COMPETENCIES_KEY}-${learnerId}`, competencies);
        return competencies;
      } catch (error) {
        console.error('Failed to fetch competencies:', error);
      }
    }

    return storage.get<LearnerCompetency[]>(`${COMPETENCIES_KEY}-${learnerId}`, []);
  },

  async updateCompetency(competency: LearnerCompetency): Promise<LearnerCompetency> {
    const updatedCompetency: LearnerCompetency = {
      ...competency,
      assessedAt: new Date().toISOString(),
    };

    const cached = storage.get<LearnerCompetency[]>(`${COMPETENCIES_KEY}-${competency.learnerId}`, []);
    const localCompetencyId = competency.id;
    const index = cached.findIndex((item) => item.id === localCompetencyId);

    if (index >= 0) {
      cached[index] = updatedCompetency;
    } else {
      cached.push(updatedCompetency);
    }
    storage.set(`${COMPETENCIES_KEY}-${competency.learnerId}`, cached);

    const isOnline = await checkOnline();
    if (!isOnline) {
      return updatedCompetency;
    }

    try {
      const recordData = mapCompetencyToRecord(updatedCompetency);
      const record = isPocketBaseRecordId(localCompetencyId)
        ? await pb.collection(COLLECTIONS.COMPETENCIES).update<PBCompetencyRecord>(
            localCompetencyId,
            recordData
          )
        : await pb.collection(COLLECTIONS.COMPETENCIES).create<PBCompetencyRecord>(recordData);

      const savedCompetency = mapRecordToCompetency(record);
      storage.set(
        `${COMPETENCIES_KEY}-${competency.learnerId}`,
        cached.map((item) => (item.id === localCompetencyId ? savedCompetency : item))
      );
      return savedCompetency;
    } catch (error) {
      console.error('Failed to sync competency:', error);
      return updatedCompetency;
    }
  },

  async addEvidence(competencyId: string, learnerId: string, artifactId: string): Promise<void> {
    const competencies = await this.getCompetencies(learnerId);
    const competency = competencies.find((item) => item.id === competencyId);

    if (!competency) {
      return;
    }

    const evidenceIds = Array.from(new Set([...(competency.evidenceIds || []), artifactId]));
    await this.updateCompetency({ ...competency, evidenceIds });
  },
};

export const uploadArtifactFile = async (file: File, learnerId: string): Promise<string> => {
  const isOnline = await checkOnline();

  if (isOnline) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('learnerId', learnerId);

      const record = await pb.collection('artifact_files').create(formData);
      return pb.files.getURL(record, record.file as string);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  }

  return URL.createObjectURL(file);
};

function mapRecordToCompetency(record: PBCompetencyRecord): LearnerCompetency {
  return {
    id: record.id,
    learnerId: record.learner,
    domain: record.domain,
    level: record.level,
    evidenceIds: record.evidenceIds || [],
    assessedAt: record.updated || record.created,
    assessedBy: record.assessedBy,
    notes: record.notes || undefined,
  };
}

function mapCompetencyToRecord(competency: LearnerCompetency): Record<string, unknown> {
  return {
    learner: competency.learnerId,
    domain: competency.domain,
    level: competency.level,
    evidenceIds: competency.evidenceIds,
    assessedBy: competency.assessedBy,
    notes: competency.notes,
  };
}
