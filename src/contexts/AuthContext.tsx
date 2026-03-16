import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Family } from '../types';
import { DEFAULT_FAMILY_SETTINGS } from '../types/family';
import { defaultLearners } from '../data/learners';

interface AuthContextType {
  family: Family | null;
  isAuthenticated: boolean;
  login: (familyName: string) => void;
  logout: () => void;
  updateLearnerPoints: (learnerId: string, points: number) => void;
  updateLearnerStreak: (learnerId: string, days: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [family, setFamily] = useState<Family | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session
    const savedFamily = localStorage.getItem('lumipods-family');
    if (savedFamily) {
      setFamily(JSON.parse(savedFamily));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (familyName: string) => {
    const newFamily: Family = {
      id: 'family-1',
      name: familyName,
      learners: defaultLearners,
      currentPodId: null,
      currentWeek: 1,
      settings: { ...DEFAULT_FAMILY_SETTINGS },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setFamily(newFamily);
    setIsAuthenticated(true);
    localStorage.setItem('lumipods-family', JSON.stringify(newFamily));
  };

  const logout = () => {
    setFamily(null);
    setIsAuthenticated(false);
    localStorage.removeItem('lumipods-family');
  };

  const updateLearnerPoints = (learnerId: string, points: number) => {
    if (!family) return;
    
    const updatedFamily = {
      ...family,
      learners: family.learners.map(learner =>
        learner.id === learnerId
          ? { ...learner, points: learner.points + points }
          : learner
      )
    };
    
    setFamily(updatedFamily);
    localStorage.setItem('lumipods-family', JSON.stringify(updatedFamily));
  };

  const updateLearnerStreak = (learnerId: string, days: number) => {
    if (!family) return;
    
    const updatedFamily = {
      ...family,
      learners: family.learners.map(learner =>
        learner.id === learnerId
          ? { ...learner, streakDays: days }
          : learner
      )
    };
    
    setFamily(updatedFamily);
    localStorage.setItem('lumipods-family', JSON.stringify(updatedFamily));
  };

  const value = {
    family,
    isAuthenticated,
    login,
    logout,
    updateLearnerPoints,
    updateLearnerStreak
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
