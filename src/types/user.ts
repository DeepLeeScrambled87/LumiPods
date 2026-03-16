// User & Authentication Types
// Supports both parent (full access) and learner (individual view) roles

export type UserRole = 'parent' | 'learner';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  avatar: string;
  // For learners, this links to their learner profile
  learnerId?: string;
  // For parents, this is the family they manage
  familyId: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// What each role can access
export const ROLE_PERMISSIONS: Record<UserRole, {
  canViewAllLearners: boolean;
  canEditSettings: boolean;
  canManageLearners: boolean;
  canApproveRewards: boolean;
  canViewAnalytics: boolean;
  canAccessAITutor: boolean;
  visiblePages: string[];
}> = {
  parent: {
    canViewAllLearners: true,
    canEditSettings: true,
    canManageLearners: true,
    canApproveRewards: true,
    canViewAnalytics: true,
    canAccessAITutor: true,
    visiblePages: ['dashboard', 'planner', 'pods', 'portfolio', 'materials', 'rewards', 'partners', 'calendar', 'settings', 'tutor'],
  },
  learner: {
    canViewAllLearners: false,
    canEditSettings: false,
    canManageLearners: false,
    canApproveRewards: false,
    canViewAnalytics: false,
    canAccessAITutor: true,
    visiblePages: ['dashboard', 'pods', 'portfolio', 'rewards', 'tutor'],
  },
};

// Create a parent user
export const createParentUser = (familyId: string, name: string, id?: string): User => ({
  id: id || `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  role: 'parent',
  name,
  avatar: '👨‍👩‍👧‍👦',
  familyId,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
});

// Create a learner user (linked to learner profile)
export const createLearnerUser = (
  familyId: string,
  learnerId: string,
  name: string,
  avatar: string
): User => ({
  id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  role: 'learner',
  name,
  avatar,
  learnerId,
  familyId,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
});
