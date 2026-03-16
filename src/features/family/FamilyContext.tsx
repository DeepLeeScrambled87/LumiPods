/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Family, FamilySettings } from '../../types/family';
import type { Learner, LearnerPreferences } from '../../types/learner';
import type { SkillLevel } from '../../types/skillLevel';
import { createLearner } from '../../types/learner';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import { familyDataService, learnerDataService } from '../../services/dataService';
import { LEARNER_POINTS_UPDATED_EVENT } from '../../services/pointsBalanceService';
import { curriculumService } from '../../services/curriculumService';

interface FamilyContextType {
  // State
  family: Family | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Auth actions
  login: (familyName: string) => Promise<Family>;
  logout: () => void;
  hydrateFamily: (family: Family | null) => void;

  // Learner CRUD
  addLearner: (
    name: string,
    age: number,
    skillLevel: SkillLevel,
    avatar?: string,
    pin?: string,
    preferences?: LearnerPreferences
  ) => Learner | Promise<Learner>;
  updateLearner: (learnerId: string, updates: Partial<Learner>) => void | Promise<void>;
  removeLearner: (learnerId: string) => void | Promise<void>;
  getLearner: (learnerId: string) => Learner | undefined;
  verifyLearnerPin: (learnerId: string, pin: string) => boolean;

  // Points management
  addPoints: (learnerId: string, points: number) => void | Promise<void>;
  deductPoints: (learnerId: string, points: number) => boolean | Promise<boolean>;

  // Streak management
  updateStreak: (learnerId: string, days: number) => void | Promise<void>;
  incrementStreak: (learnerId: string) => void | Promise<void>;
  resetStreak: (learnerId: string) => void | Promise<void>;

  // Settings
  updateSettings: (settings: Partial<FamilySettings>) => void | Promise<void>;

  // Pod management
  setCurrentPod: (podId: string | null) => void | Promise<void>;
  setCurrentWeek: (week: number) => void | Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const useFamily = (): FamilyContextType => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};

interface FamilyProviderProps {
  children: ReactNode;
}

export const FamilyProvider: React.FC<FamilyProviderProps> = ({ children }) => {
  const [family, setFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storeFamily = useCallback((nextFamily: Family | null) => {
    setFamily(nextFamily);

    if (nextFamily) {
      storage.set(STORAGE_KEYS.FAMILY, nextFamily);
    } else {
      storage.remove(STORAGE_KEYS.FAMILY);
    }
  }, []);

  // Load family from storage on mount
  useEffect(() => {
    const savedFamily = storage.get<Family | null>(STORAGE_KEYS.FAMILY, null);
    if (savedFamily) {
      storeFamily(savedFamily);
    }
    setIsLoading(false);
  }, [storeFamily]);

  useEffect(() => {
    const handlePointsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ familyId: string; learnerId: string; points: number }>).detail;
      if (!detail || !family || detail.familyId !== family.id) {
        return;
      }

      storeFamily({
        ...family,
        learners: family.learners.map((learner) =>
          learner.id === detail.learnerId
            ? { ...learner, points: detail.points, updatedAt: new Date().toISOString() }
            : learner
        ),
        updatedAt: new Date().toISOString(),
      });
    };

    window.addEventListener(LEARNER_POINTS_UPDATED_EVENT, handlePointsUpdated);
    return () => window.removeEventListener(LEARNER_POINTS_UPDATED_EVENT, handlePointsUpdated);
  }, [family, storeFamily]);

  // Persist family to storage and sync to PocketBase
  const persistFamily = useCallback(async (updatedFamily: Family): Promise<Family> => {
    const withTimestamp = { ...updatedFamily, updatedAt: new Date().toISOString() };
    storeFamily(withTimestamp);

    try {
      const syncedFamily = await familyDataService.save(withTimestamp);
      storeFamily(syncedFamily);
      return syncedFamily;
    } catch (error) {
      console.error('Failed to sync family:', error);
      return withTimestamp;
    }
  }, [storeFamily]);

  // Auth actions
  const login = useCallback(async (familyName: string): Promise<Family> => {
    const newFamily = await familyDataService.create(familyName);
    storeFamily(newFamily);
    return newFamily;
  }, [storeFamily]);

  const logout = useCallback(() => {
    storeFamily(null);
  }, [storeFamily]);

  const hydrateFamily = useCallback((nextFamily: Family | null) => {
    storeFamily(nextFamily);
  }, [storeFamily]);

  // Learner CRUD
  const addLearner = useCallback(async (
    name: string,
    age: number,
    skillLevel: SkillLevel,
    avatar?: string,
    pin?: string,
    preferences?: LearnerPreferences
  ): Promise<Learner> => {
    if (!family) throw new Error('No family logged in');
    
    const newLearner = createLearner(name, age, skillLevel, avatar, pin, preferences);
    const updatedFamily = {
      ...family,
      learners: [...family.learners, newLearner],
    };
    const savedFamily = await persistFamily(updatedFamily);

    try {
      const savedLearner = await learnerDataService.save(savedFamily.id, newLearner);
      storeFamily({
        ...savedFamily,
        learners: savedFamily.learners.map((learner) =>
          learner.id === newLearner.id ? savedLearner : learner
        ),
        updatedAt: new Date().toISOString(),
      });
      return savedLearner;
    } catch (error) {
      console.error('Failed to sync learner:', error);
      return newLearner;
    }
  }, [family, persistFamily, storeFamily]);

  const updateLearner = useCallback(async (learnerId: string, updates: Partial<Learner>) => {
    if (!family) return;
    
    const currentLearner = family.learners.find((learner) => learner.id === learnerId);
    if (!currentLearner) return;

    const optimisticLearner = {
      ...currentLearner,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const updatedFamily = {
      ...family,
      learners: family.learners.map((l) =>
        l.id === learnerId ? optimisticLearner : l
      ),
    };

    const savedFamily = await persistFamily(updatedFamily);

    try {
      const savedLearner = await learnerDataService.save(savedFamily.id, optimisticLearner);
      storeFamily({
        ...savedFamily,
        learners: savedFamily.learners.map((learner) =>
          learner.id === learnerId ? savedLearner : learner
        ),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to sync learner update:', error);
    }
  }, [family, persistFamily, storeFamily]);

  const removeLearner = useCallback(async (learnerId: string) => {
    if (!family) return;
    
    const updatedFamily = {
      ...family,
      learners: family.learners.filter((l) => l.id !== learnerId),
    };
    await persistFamily(updatedFamily);

    try {
      await learnerDataService.delete(learnerId);
    } catch (error) {
      console.error('Failed to delete learner:', error);
    }
  }, [family, persistFamily]);

  const getLearner = useCallback((learnerId: string): Learner | undefined => {
    return family?.learners.find((l) => l.id === learnerId);
  }, [family]);

  const verifyLearnerPin = useCallback((learnerId: string, pin: string): boolean => {
    const learner = family?.learners.find((item) => item.id === learnerId);
    if (!learner) return false;
    if (!learner.pin) return true;
    return learner.pin === pin.trim();
  }, [family]);

  // Points management
  const addPoints = useCallback((learnerId: string, points: number) => {
    updateLearner(learnerId, {
      points: (getLearner(learnerId)?.points || 0) + points,
    });
  }, [updateLearner, getLearner]);

  const deductPoints = useCallback((learnerId: string, points: number): boolean => {
    const learner = getLearner(learnerId);
    if (!learner || learner.points < points) return false;
    
    updateLearner(learnerId, { points: learner.points - points });
    return true;
  }, [updateLearner, getLearner]);

  // Streak management
  const updateStreak = useCallback((learnerId: string, days: number) => {
    updateLearner(learnerId, { streakDays: days });
  }, [updateLearner]);

  const incrementStreak = useCallback((learnerId: string) => {
    const learner = getLearner(learnerId);
    if (learner) {
      updateLearner(learnerId, { streakDays: learner.streakDays + 1 });
    }
  }, [updateLearner, getLearner]);

  const resetStreak = useCallback((learnerId: string) => {
    updateLearner(learnerId, { streakDays: 0 });
  }, [updateLearner]);

  // Settings
  const updateSettings = useCallback((settings: Partial<FamilySettings>) => {
    if (!family) return;
    
    const updatedFamily = {
      ...family,
      settings: { ...family.settings, ...settings },
    };
    persistFamily(updatedFamily);
  }, [family, persistFamily]);

  // Pod management
  const setCurrentPod = useCallback((podId: string | null) => {
    if (!family) return;
    if (!podId) {
      curriculumService.clearActivePod(family.id);
    }
    persistFamily({
      ...family,
      currentPodId: podId,
      currentWeek: podId && podId !== family.currentPodId ? 1 : family.currentWeek,
    });
  }, [family, persistFamily]);

  const setCurrentWeek = useCallback((week: number) => {
    if (!family) return;
    persistFamily({ ...family, currentWeek: week });
  }, [family, persistFamily]);

  const value: FamilyContextType = {
    family,
    isAuthenticated: !!family,
    isLoading,
    login,
    logout,
    hydrateFamily,
    addLearner,
    updateLearner,
    removeLearner,
    getLearner,
    verifyLearnerPin,
    addPoints,
    deductPoints,
    updateStreak,
    incrementStreak,
    resetStreak,
    updateSettings,
    setCurrentPod,
    setCurrentWeek,
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
};

export default FamilyContext;
