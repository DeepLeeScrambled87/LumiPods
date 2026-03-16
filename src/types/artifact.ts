// Artifact - Portfolio item created by learner
// Portfolio-first design: every learning block produces something worth sharing

import type { SkillLevel } from './skillLevel';
import type { CompetencyDomain } from './competency';

export type ArtifactType = 'photo' | 'video' | 'link' | 'document' | 'code' | 'presentation' | 'project';

export type ArtifactVisibility = 'private' | 'family' | 'community' | 'public';

export interface Artifact {
  id: string;
  learnerId: string;
  familyId?: string;
  blockId?: string;
  podId?: string;
  weekNumber?: number;
  
  // Core content
  type: ArtifactType;
  title: string;
  description?: string;
  reflection?: string; // Student's own reflection on the work
  
  // Media
  url?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  mimeType?: string;
  
  // Portfolio metadata
  tags: string[];
  competencies: CompetencyDomain[]; // Which competencies this demonstrates
  skillLevel: SkillLevel;
  visibility: ArtifactVisibility;
  isFeatured: boolean; // Highlighted in portfolio
  
  // Process documentation (showing iteration, not just final product)
  iterations?: ArtifactIteration[];
  
  // Assessment
  rubricScore?: ArtifactRubric;
  feedbackReceived?: ArtifactFeedback[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string; // When made public/shared
}

// Track iterations to show growth and process
export interface ArtifactIteration {
  id: string;
  version: number;
  url?: string;
  notes: string;
  createdAt: string;
}

// Feedback from various sources
export interface ArtifactFeedback {
  id: string;
  from: 'parent' | 'peer' | 'mentor' | 'ai';
  fromName?: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
}

export interface ArtifactRubric {
  artifactId: string;
  criteria: string;
  score: 1 | 2 | 3 | 4; // 1=Beginning, 2=Developing, 3=Proficient, 4=Exemplary
  feedback?: string;
  scoredAt: string;
  scoredBy: 'parent' | 'self' | 'peer' | 'ai';
}

// Exhibition - for public showcases (High Tech High "beautiful work" model)
export interface Exhibition {
  id: string;
  familyId: string;
  title: string;
  description: string;
  artifactIds: string[];
  scheduledAt?: string;
  isLive: boolean;
  viewerCount?: number;
  createdAt: string;
}

export const ARTIFACT_TYPE_CONFIG: Record<ArtifactType, {
  label: string;
  icon: string;
  acceptedFormats: string[];
}> = {
  photo: {
    label: 'Photo',
    icon: '📷',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  },
  video: {
    label: 'Video',
    icon: '🎬',
    acceptedFormats: ['video/mp4', 'video/quicktime', 'video/webm'],
  },
  link: {
    label: 'Link',
    icon: '🔗',
    acceptedFormats: [],
  },
  document: {
    label: 'Document',
    icon: '📄',
    acceptedFormats: ['application/pdf', 'text/plain', 'text/markdown'],
  },
  code: {
    label: 'Code',
    icon: '💻',
    acceptedFormats: [],
  },
  presentation: {
    label: 'Presentation',
    icon: '📊',
    acceptedFormats: ['application/pdf'],
  },
  project: {
    label: 'Project',
    icon: '🏗️',
    acceptedFormats: [],
  },
};

export const createArtifact = (
  learnerId: string,
  type: ArtifactType,
  title: string,
  skillLevel: SkillLevel
): Artifact => ({
  id: `artifact-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  learnerId,
  type,
  title,
  tags: [],
  competencies: [],
  skillLevel,
  visibility: 'family',
  isFeatured: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
