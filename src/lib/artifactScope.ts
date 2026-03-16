import type { Artifact } from '../types/artifact';

export const POD_LIBRARY_TAG = 'pod-library';
export const SHARED_GROUP_PREFIX = 'shared-group:';
export const AUDIENCE_LEVEL_PREFIX = 'audience-level:';
export const AUDIENCE_LEARNER_PREFIX = 'audience-learner:';
export const SUPPORT_ASSET_PREFIX = 'support-asset:';

export const getArtifactTagValues = (tags: string[], prefix: string): string[] =>
  tags
    .filter((tag) => tag.startsWith(prefix))
    .map((tag) => tag.slice(prefix.length))
    .filter(Boolean);

export const isPodLibraryArtifact = (artifact: Artifact): boolean =>
  (artifact.tags || []).includes(POD_LIBRARY_TAG);

export const isLearnerPortfolioArtifact = (artifact: Artifact): boolean =>
  !isPodLibraryArtifact(artifact);

export const getSharedGroupId = (artifact: Artifact): string | null =>
  getArtifactTagValues(artifact.tags || [], SHARED_GROUP_PREFIX)[0] || null;

export const getSupportAssetIds = (artifact: Artifact): string[] =>
  getArtifactTagValues(artifact.tags || [], SUPPORT_ASSET_PREFIX);
