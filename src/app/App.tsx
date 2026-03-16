import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Toaster } from 'sonner';
import * as Tooltip from '@radix-ui/react-tooltip';
import { LazyMotion, domAnimation } from 'framer-motion';
import { FamilyProvider, useFamily } from '../features/family';
import { AuthProvider, useAuth, LoginPage } from '../features/auth';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TutorButton } from '../features/tutor';
// NotificationCenter is used in AppLayout
import { InstallPrompt } from '../components/ui/InstallPrompt';
import { startReminderChecker, stopReminderChecker } from '../services/notificationService';
import { AppLayout, LearnerLayout, type PageId } from './layouts/AppLayout';
import { PageErrorBoundary } from './components/PageErrorBoundary';
import { useExternalSessionTracker } from '../hooks/useExternalSessionTracker';

// Lazy load pages for code splitting
const PlannerView = lazy(() => import('../components/planner/PlannerView'));
const PodsPage = lazy(() => import('../components/pods/PodsPage'));
const PodLibraryPage = lazy(() => import('../features/library/PodLibraryPage'));
const PortfolioPage = lazy(() => import('../features/portfolio/PortfolioPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const RewardsPage = lazy(() => import('../features/rewards/RewardsPage'));
const PartnersPage = lazy(() => import('../features/partners/PartnersPage'));
const MaterialsPage = lazy(() => import('../features/materials/MaterialsPage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));
const CalendarPage = lazy(() => import('../features/calendar/CalendarPage'));
const TutorPage = lazy(() => import('../features/tutor/TutorPage'));
const ProgressDashboard = lazy(() => import('../features/progress/ProgressDashboard'));
const ReportGenerator = lazy(() => import('../features/reports/ReportsPage'));
const AchievementsPage = lazy(() => import('../features/gamification/AchievementsPage'));
const MultiLearnerScheduler = lazy(() => import('../features/scheduling/MultiLearnerScheduler'));
const ResourcesPage = lazy(() => import('../features/resources/ResourcesPage'));
const MonthDetailedPage = lazy(() => import('../features/month-detailed/MonthDetailedPage'));
const StudentProfilePage = lazy(() => import('../features/students/StudentProfilePage'));
const MathsGamesPage = lazy(() => import('../features/maths/MathsGamesPage'));
const FrenchReadingPage = lazy(() => import('../features/french/FrenchReadingPage').then(m => ({ default: m.FrenchReadingPage })));

// Loading fallback
const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="text-center">
      <span className="text-3xl animate-bounce inline-block">🚀</span>
      <p className="text-slate-500 mt-2 text-sm">Loading...</p>
    </div>
  </div>
);

// Parent/Educator view with full access
const ParentAppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  const renderPage = () => {
    const page = (() => {
      switch (currentPage) {
        case 'dashboard':
          return <DashboardPage />;
        case 'planner':
          return <PlannerView />;
        case 'pods':
          return <PodsPage />;
        case 'library':
          return <PodLibraryPage />;
        case 'portfolio':
          return <PortfolioPage />;
        case 'materials':
          return <MaterialsPage />;
        case 'rewards':
          return <RewardsPage />;
        case 'partners':
          return <PartnersPage />;
        case 'calendar':
          return <CalendarPage />;
        case 'settings':
          return <SettingsPage />;
        case 'tutor':
          return <TutorPage onExit={() => setCurrentPage('dashboard')} />;
        case 'progress':
          return <ProgressDashboard />;
        case 'reports':
          return <ReportGenerator />;
        case 'achievements':
          return <AchievementsPage />;
        case 'schedule':
          return <MultiLearnerScheduler />;
        case 'resources':
          return <ResourcesPage />;
        case 'monthDetailed':
          return <MonthDetailedPage />;
        case 'students':
          return <StudentProfilePage />;
        case 'maths':
          return <MathsGamesPage />;
        case 'french':
          return <FrenchReadingPage />;
        default:
          return <DashboardPage />;
      }
    })();

    return <Suspense fallback={<PageLoader />}>{page}</Suspense>;
  };

  return (
    <>
      <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        <PageErrorBoundary resetKey={currentPage}>
          {renderPage()}
        </PageErrorBoundary>
      </AppLayout>
      {/* Floating AI Tutor button */}
      {currentPage !== 'tutor' && <TutorButton />}
    </>
  );
};

// Learner view with limited access
const LearnerAppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  const renderPage = () => {
    const page = (() => {
      switch (currentPage) {
        case 'dashboard':
          return <DashboardPage />;
        case 'pods':
          return <PodsPage />;
        case 'library':
          return <PodLibraryPage />;
        case 'portfolio':
          return <PortfolioPage />;
        case 'rewards':
          return <RewardsPage />;
        case 'tutor':
          return <TutorPage onExit={() => setCurrentPage('dashboard')} />;
        case 'maths':
          return <MathsGamesPage />;
        case 'french':
          return <FrenchReadingPage />;
        default:
          return <DashboardPage />;
      }
    })();

    return <Suspense fallback={<PageLoader />}>{page}</Suspense>;
  };

  return (
    <>
      <LearnerLayout 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        learnerName={user?.name || 'Learner'}
        learnerAvatar={user?.avatar || '🧒'}
      >
        <PageErrorBoundary resetKey={currentPage}>
          {renderPage()}
        </PageErrorBoundary>
      </LearnerLayout>
      {/* Floating AI Tutor button */}
      {currentPage !== 'tutor' && <TutorButton />}
    </>
  );
};

// Main app content with role-based routing
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, isParent } = useAuth();
  const { isLoading: familyLoading } = useFamily();
  useExternalSessionTracker(isAuthenticated);

  const isLoading = authLoading || familyLoading;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-bounce inline-block">🚀</span>
          <p className="text-slate-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Role-based view
  return isParent ? <ParentAppContent /> : <LearnerAppContent />;
};

const App: React.FC = () => {
  // Start notification reminder checker on mount
  useEffect(() => {
    startReminderChecker();
    return () => stopReminderChecker();
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <Tooltip.Provider delayDuration={200}>
        <ThemeProvider>
          <FamilyProvider>
            <AuthProvider>
              <Toaster richColors position="top-right" />
              <AppContent />
              <InstallPrompt />
            </AuthProvider>
          </FamilyProvider>
        </ThemeProvider>
      </Tooltip.Provider>
    </LazyMotion>
  );
};

export default App;
