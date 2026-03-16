import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
  FolderOpen,
  Gift,
  Settings,
  LogOut,
  Menu,
  X,
  Bot,
  Users,
  TrendingUp,
  FileText,
  Trophy,
  UsersRound,
  Calendar,
  ChevronDown,
  Wrench,
  Package,
  ClipboardList,
  Calculator,
  BookOpen,
  Library,
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/cn';
import { Avatar } from '../../components/ui/Avatar';
import { SyncStatus } from '../../components/ui/SyncStatus';
import { useFamily } from '../../features/family';
import { useAuth } from '../../features/auth';
import { NotificationCenter } from '../../features/notifications';

export type PageId =
  | 'dashboard'
  | 'planner'
  | 'pods'
  | 'library'
  | 'portfolio'
  | 'materials'
  | 'rewards'
  | 'partners'
  | 'calendar'
  | 'settings'
  | 'tutor'
  | 'progress'
  | 'reports'
  | 'achievements'
  | 'schedule'
  | 'resources'
  | 'monthDetailed'
  | 'students'
  | 'maths'
  | 'french';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
  description?: string;
}

// Primary nav - always visible in top bar
const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'pods', label: 'Pods', icon: Layers },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'portfolio', label: 'Portfolio', icon: FolderOpen },
];

// All pages for dropdown menu - organized by category
const ALL_NAV_SECTIONS = [
  {
    title: 'Learning',
    items: [
      { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard, description: 'Overview and daily tasks' },
      { id: 'calendar' as PageId, label: 'Calendar', icon: Calendar, description: 'Daily schedule and blocks' },
      { id: 'schedule' as PageId, label: 'Multi-Learner', icon: UsersRound, description: 'Schedule multiple learners' },
      { id: 'pods' as PageId, label: 'Learning Pods', icon: Layers, description: 'Browse all learning pods' },
      { id: 'library' as PageId, label: 'Pod Library', icon: Library, description: 'Browse full pod material and assets' },
      { id: 'monthDetailed' as PageId, label: 'Month Detailed', icon: FileText, description: 'Detailed pod curriculum view' },
      { id: 'planner' as PageId, label: 'Day Planner', icon: ClipboardList, description: 'Plan daily activities' },
      { id: 'maths' as PageId, label: 'Maths Games', icon: Calculator, description: 'Times tables, conversions & more' },
      { id: 'french' as PageId, label: 'French Reading', icon: BookOpen, description: 'Syllable-based French phonics' },
    ],
  },
  {
    title: 'Progress & Portfolio',
    items: [
      { id: 'students' as PageId, label: 'Student Profiles', icon: Users, description: 'View student profiles and progress' },
      { id: 'progress' as PageId, label: 'Progress', icon: TrendingUp, description: 'Track learning progress' },
      { id: 'portfolio' as PageId, label: 'Portfolio', icon: FolderOpen, description: 'Student work and artifacts' },
      { id: 'achievements' as PageId, label: 'Achievements', icon: Trophy, description: 'Badges and milestones' },
      { id: 'reports' as PageId, label: 'Reports', icon: FileText, description: 'Generate progress reports' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { id: 'resources' as PageId, label: 'Tools & Platforms', icon: Wrench, description: 'AI/ML tools and learning platforms' },
      { id: 'materials' as PageId, label: 'Materials', icon: Package, description: 'Physical materials needed' },
    ],
  },
  {
    title: 'Rewards & Settings',
    items: [
      { id: 'rewards' as PageId, label: 'Rewards', icon: Gift, description: 'Points and rewards shop' },
      { id: 'tutor' as PageId, label: 'AI Tutor', icon: Bot, description: 'Ask Lumi for help' },
      { id: 'settings' as PageId, label: 'Settings', icon: Settings, description: 'App preferences' },
    ],
  },
];

// Simplified navigation for learners
const LEARNER_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'My Day', icon: LayoutDashboard },
  { id: 'pods', label: 'Explore', icon: Layers },
  { id: 'maths', label: 'Maths', icon: Calculator },
  { id: 'french', label: 'French', icon: BookOpen },
  { id: 'portfolio', label: 'My Work', icon: FolderOpen },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'tutor', label: 'Ask Lumi', icon: Bot },
];

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPage,
  onPageChange,
}) => {
  const { family } = useFamily();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (pageId: PageId) => {
    onPageChange(pageId);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Dropdown */}
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <span className="text-lg font-semibold text-slate-900 hidden sm:block">LumiPods</span>
              </div>

              {/* All Pages Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    dropdownOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <Menu className="h-4 w-4" />
                  <span className="hidden sm:inline">All Pages</span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <m.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                    >
                      <div className="max-h-[70vh] overflow-y-auto p-2">
                        {ALL_NAV_SECTIONS.map((section, idx) => (
                          <div key={section.title} className={idx > 0 ? 'mt-2 pt-2 border-t border-slate-100' : ''}>
                            <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              {section.title}
                            </p>
                            {section.items.map((item) => {
                              const Icon = item.icon;
                              const isActive = currentPage === item.id;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => handleNavClick(item.id)}
                                  className={cn(
                                    'flex items-start gap-3 w-full px-3 py-2 rounded-lg text-left transition-colors',
                                    isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                                  )}
                                >
                                  <Icon className={cn('h-5 w-5 mt-0.5', isActive ? 'text-blue-600' : 'text-slate-400')} />
                                  <div>
                                    <p className={cn('text-sm font-medium', isActive ? 'text-blue-700' : 'text-slate-700')}>
                                      {item.label}
                                    </p>
                                    {item.description && (
                                      <p className="text-xs text-slate-500">{item.description}</p>
                                    )}
                                  </div>
                                  {isActive && (
                                    <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                      Current
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Center: Primary Nav Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              {PRIMARY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Sync Status */}
              <div className="hidden md:block">
                <SyncStatus />
              </div>

              {/* Notifications */}
              <NotificationCenter />

              {/* Family info */}
              <div className="hidden sm:flex items-center gap-2 px-2">
                <Avatar emoji="👨‍👩‍👧‍👦" size="sm" />
                <span className="text-sm text-slate-600 max-w-24 truncate">{family?.name}</span>
              </div>

              {/* Quick actions */}
              <div className="flex items-center border-l border-slate-200 pl-2 ml-1">
                <button
                  onClick={() => handleNavClick('tutor')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    currentPage === 'tutor'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                  )}
                  aria-label="AI Tutor"
                  title="AI Tutor"
                >
                  <Bot className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleNavClick('settings')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    currentPage === 'settings'
                      ? 'bg-slate-200 text-slate-900'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  )}
                  aria-label="Settings"
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors ml-1"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>


        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <m.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-slate-200 overflow-hidden"
            >
              <div className="px-4 py-3 max-h-[70vh] overflow-y-auto">
                {ALL_NAV_SECTIONS.map((section, idx) => (
                  <div key={section.title} className={idx > 0 ? 'mt-3 pt-3 border-t border-slate-100' : ''}>
                    <p className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {section.title}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={cn(
                              'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                              isActive
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </m.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          <m.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </m.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// Learner-specific layout with simplified navigation
interface LearnerLayoutProps {
  children: React.ReactNode;
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  learnerName: string;
  learnerAvatar: string;
}

export const LearnerLayout: React.FC<LearnerLayoutProps> = ({
  children,
  currentPage,
  onPageChange,
  learnerName,
  learnerAvatar,
}) => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header - More playful for learners */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              <span className="text-lg font-semibold text-slate-900">LumiPods</span>
            </div>

            {/* Desktop Nav - Bottom tabs style for learners */}
            <nav className="hidden md:flex items-center gap-2">
              {LEARNER_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition-all',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'text-slate-600 hover:bg-indigo-50'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar emoji={learnerAvatar} size="sm" />
                <span className="text-sm font-medium text-slate-900 hidden sm:block">{learnerName}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1 text-sm"
                aria-label="Switch user"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Switch</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <m.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-indigo-100 overflow-hidden"
            >
              <div className="px-4 py-3 grid grid-cols-3 gap-2">
                {LEARNER_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onPageChange(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all',
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:bg-indigo-50'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </m.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          <m.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </m.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AppLayout;
