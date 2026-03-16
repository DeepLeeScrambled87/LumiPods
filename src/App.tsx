import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import Week1Dashboard from './components/Week1Dashboard';
import MaterialsManager from './components/MaterialsManager';
import PortfolioManager from './components/PortfolioManager';
import ProgramOverview from './components/ProgramOverview';
import Month1Detailed from './components/Month1Detailed';
import LearningAnalytics from './components/LearningAnalytics';
import ScheduleView from './components/ScheduleView';
import Students from './components/Students';
import GoalsMilestones from './components/GoalsMilestones';
import Resources from './components/Resources';
import { LayoutDashboard, CalendarDays, Package, FolderOpen, LogOut, Layers, BarChart3, Users, Flag, BookOpen } from 'lucide-react';
import { AnimatePresence, m } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Toaster } from 'sonner';

type PageType =
  | 'dashboard'
  | 'program-overview'
  | 'month1-detailed'
  | 'learning-analytics'
  | 'schedule'
  | 'students'
  | 'goals-milestones'
  | 'portfolio'
  | 'materials'
  | 'resources'
  | 'week1';

const AppContent: React.FC = () => {
  const { isAuthenticated, family, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'program-overview':
        return <ProgramOverview />;
      case 'month1-detailed':
        return <Month1Detailed />;
      case 'learning-analytics':
        return <LearningAnalytics />;
      case 'schedule':
        return <ScheduleView />;
      case 'students':
        return <Students />;
      case 'goals-milestones':
        return <GoalsMilestones />;
      case 'week1':
        return <Week1Dashboard />;
      case 'materials':
        return <MaterialsManager />;
      case 'portfolio':
        return <PortfolioManager />;
      case 'resources':
        return <Resources />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster richColors position="top-right" />
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚀</span>
            <span className="text-lg font-semibold text-slate-900">FuturePods</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-slate-600">{family?.name} Family</span>
            <button onClick={logout} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
        {/* Tabs */}
        <nav className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'program-overview', label: 'Program Overview', icon: Layers },
              { id: 'month1-detailed', label: 'Month 1 Detailed', icon: Layers },
              { id: 'learning-analytics', label: 'Learning Analytics', icon: BarChart3 },
              { id: 'schedule', label: 'Schedule', icon: CalendarDays },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'goals-milestones', label: 'Goals & Milestones', icon: Flag },
              { id: 'portfolio', label: 'Portfolio', icon: FolderOpen },
              { id: 'materials', label: 'Materials', icon: Package },
              { id: 'resources', label: 'Resources', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = currentPage === (tab.id as PageType);
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentPage(tab.id as PageType)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content with page transitions + tooltips provider */}
      <Tooltip.Provider delayDuration={200} skipDelayDuration={300}>
        <main>
          <AnimatePresence mode="wait">
            <m.div
              key={currentPage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </m.div>
          </AnimatePresence>
        </main>
      </Tooltip.Provider>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
