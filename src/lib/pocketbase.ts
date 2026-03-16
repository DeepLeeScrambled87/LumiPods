// PocketBase client configuration
import PocketBase from 'pocketbase';

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

export const pb = new PocketBase(POCKETBASE_URL);

// Disable auto-cancellation for better UX
pb.autoCancellation(false);

// Type-safe collection names
export const COLLECTIONS = {
  USERS: 'users',
  FAMILIES: 'families',
  LEARNERS: 'learners',
  PODS: 'pods',
  BLOCKS: 'blocks',
  ARTIFACTS: 'artifacts',
  PROGRESS: 'progress',
  COMPETENCIES: 'competencies',
  POINTS: 'points',
  REWARD_REDEMPTIONS: 'rewards_redemptions',
  PROJECTS: 'projects',
  PROJECT_STEPS: 'project_steps',
  REFLECTION_ENTRIES: 'reflection_entries',
  EXTERNAL_ACTIVITY_SESSIONS: 'external_activity_sessions',
  ACHIEVEMENT_UNLOCKS: 'achievement_unlocks',
  PLANNING_RULES: 'planning_rules',
} as const;

// Auth helpers
export const isAuthenticated = () => pb.authStore.isValid;
export const currentUser = () => pb.authStore.model;
export const logout = () => pb.authStore.clear();

// Subscribe to auth changes
export const onAuthChange = (callback: (isValid: boolean) => void) => {
  return pb.authStore.onChange(() => {
    callback(pb.authStore.isValid);
  });
};
