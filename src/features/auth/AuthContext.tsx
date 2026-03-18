/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../../types/user';
import { createParentUser, createLearnerUser, ROLE_PERMISSIONS } from '../../types/user';
import { storage } from '../../lib/storage';
import { useFamily } from '../family';
import { parentAuthService } from '../../services/parentAuthService';

const AUTH_STORAGE_KEY = 'lumipods_auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isParent: boolean;
  isLearner: boolean;
  permissions: typeof ROLE_PERMISSIONS.parent;
  loginAsParent: (familyId: string, name: string, parentId?: string) => void;
  signInParent: (email: string, password: string) => Promise<void>;
  signUpParent: (parentName: string, email: string, password: string, familyName: string) => Promise<void>;
  requestParentPasswordReset: (email: string) => Promise<void>;
  loginAsLearner: (familyId: string, learnerId: string, name: string, avatar: string) => void;
  logout: () => void;
  currentLearnerId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { family, isLoading: isFamilyLoading, hydrateFamily } = useFamily();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistUser = useCallback((nextUser: User | null) => {
    setUser(nextUser);
    if (nextUser) {
      storage.set(AUTH_STORAGE_KEY, nextUser);
    } else {
      storage.remove(AUTH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const restoreAuth = async () => {
      try {
        const restoredSession = await parentAuthService.restoreSession();
        if (!isMounted) return;

        if (restoredSession) {
          hydrateFamily(restoredSession.family);
          persistUser(
            createParentUser(
              restoredSession.family.id,
              restoredSession.parentName,
              restoredSession.parentId
            )
          );
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Failed to restore parent session:', error);
        parentAuthService.signOut();
      }

      const savedUser = storage.get<User | null>(AUTH_STORAGE_KEY, null);
      if (!isMounted) return;

      if (savedUser) {
        const updatedUser = { ...savedUser, lastLoginAt: new Date().toISOString() };
        persistUser(updatedUser);
      }

      setIsLoading(false);
    };

    void restoreAuth();

    return () => {
      isMounted = false;
    };
  }, [hydrateFamily, persistUser]);

  const loginAsParent = useCallback((familyId: string, name: string, parentId?: string) => {
    persistUser(createParentUser(familyId, name, parentId));
  }, [persistUser]);

  const signInParent = useCallback(async (email: string, password: string) => {
    const session = await parentAuthService.signIn(email, password);
    hydrateFamily(session.family);
    persistUser(createParentUser(session.family.id, session.parentName, session.parentId));
  }, [hydrateFamily, persistUser]);

  const signUpParent = useCallback(async (
    parentName: string,
    email: string,
    password: string,
    familyName: string
  ) => {
    const session = await parentAuthService.signUp({
      parentName,
      email,
      password,
      familyName,
    });

    hydrateFamily(session.family);
    persistUser(createParentUser(session.family.id, session.parentName, session.parentId));
  }, [hydrateFamily, persistUser]);

  const requestParentPasswordReset = useCallback(async (email: string) => {
    await parentAuthService.requestPasswordReset(email);
  }, []);

  const loginAsLearner = useCallback((
    familyId: string,
    learnerId: string,
    name: string,
    avatar: string
  ) => {
    persistUser(createLearnerUser(familyId, learnerId, name, avatar));
  }, [persistUser]);

  const logout = useCallback(() => {
    void parentAuthService.signOut();
    persistUser(null);
  }, [persistUser]);

  useEffect(() => {
    if (isFamilyLoading) return;

    if (!family) {
      if (user) {
        persistUser(null);
      }
      return;
    }

    if (user && user.familyId !== family.id) {
      persistUser({ ...user, familyId: family.id });
    }
  }, [family, isFamilyLoading, user, persistUser]);

  const isParent = user?.role === 'parent';
  const isLearner = user?.role === 'learner';
  const permissions = user ? ROLE_PERMISSIONS[user.role] : ROLE_PERMISSIONS.parent;
  const currentLearnerId = user?.role === 'learner' ? user.learnerId || null : null;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isParent,
    isLearner,
    permissions,
    loginAsParent,
    signInParent,
    signUpParent,
    requestParentPasswordReset,
    loginAsLearner,
    logout,
    currentLearnerId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
