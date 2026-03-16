import React from 'react';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { m } from 'framer-motion';
import { toast } from 'sonner';
import * as Tooltip from '@radix-ui/react-tooltip';

// Shared UI helpers
const Card: React.FC<React.PropsWithChildren<{ className?: string; title?: string; action?: React.ReactNode }>> = ({ className = '', title, action, children }) => (
  <m.section
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className={`bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${className}`}
  >
    {(title || action) && (
      <div className="flex items-center justify-between px-5 pt-5">
        {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
        {action}
      </div>
    )}
    <div className={`${title ? 'px-5 pb-5 pt-3' : 'p-5'}`}>{children}</div>
  </m.section>
);

// Simple UI helpers kept in case of future reuse

const Dashboard: React.FC = () => {
  useAuth(); // ensure auth context is initialized; family not required for display

  // const totalPoints = family.learners.reduce((sum, l) => sum + (l.points || 0), 0);
  // Read persisted materials progress from MaterialsManager
  const materialsKey = 'lumipods-week1-materials-checked';
  let materialsReadyPct = 0;
  try {
    const raw = localStorage.getItem(materialsKey);
    const checked = raw ? (JSON.parse(raw) as string[]) : [];
    // For denominator, use week1 dataset size if present on window for now; fall back to 20
    const total = (window as any).__W1_MATERIALS_TOTAL__ ?? 20;
    materialsReadyPct = total > 0 ? Math.round((checked.length / total) * 100) : 0;
  } catch {
    materialsReadyPct = 0;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">FuturePods Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">Welcome back! Here's what's happening in your learning pods today.</p>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => {
                      try { localStorage.removeItem(materialsKey); } catch {}
                      toast.success('Metrics reset');
                      // Soft reload to recompute
                      window.location.reload();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-slate-300 text-slate-700 hover:bg-slate-50"
                    aria-label="Reset Metrics"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Metrics
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content sideOffset={8} className="rounded-md bg-slate-900 text-white text-xs px-2 py-1 shadow">
                  Clears local progress and refreshes stats
                </Tooltip.Content>
              </Tooltip.Root>
              <div className="text-right">
                <div className="text-[11px] text-slate-600">Today</div>
                <div className="text-sm font-medium text-slate-900">
                  {new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero banner with gradient background */}
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="mb-6 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"
        >
          <div className="relative h-48 md:h-56 lg:h-64 w-full flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">🚀 FuturePods Learning Experience</h2>
              <p className="text-blue-100 text-sm md:text-base">Exploring flight, engineering, and AI through hands-on discovery</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent" />
          </div>
        </m.div>

        {/* Top Row: 3 clear blocks like Control Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="shadow" title="Weekly Goals">
            <div className="text-3xl font-semibold text-slate-900">0<span className="text-slate-400">/12</span></div>
          </Card>

          <Card className="shadow" title="Materials Ready">
            <div className="text-2xl font-semibold text-emerald-600">{materialsReadyPct}%</div>
            <p className="text-xs text-slate-500 mt-1">For next week</p>
          </Card>

          <Card className="shadow" title="Student Progress">
            <ul className="space-y-1 text-sm">
              {[
                { name: 'Neo', percent: 78, label: 'AI Flight Data Analysis' },
                { name: 'Aimee', percent: 65, label: 'Parachute Engineering' },
                { name: 'Mischa', percent: 82, label: 'French Aviation Vocabulary' },
              ].map((s) => (
                <li key={s.name} className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{s.name}</span>
                  <span className="text-slate-700">{s.percent}%</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Main Grid matching block layout (3 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule (span 2) */}
          <Card className="lg:col-span-2 shadow" title="Today's Schedule" action={<button className="text-xs text-slate-600 hover:text-slate-900">View Full</button>}>
            <ul className="space-y-3">
              {[
                { time: '09:00', title: 'Morning Aerobics (French Commands)', who: 'Neo, Aimee, Mischa' },
                { time: '09:30', title: 'Flight Mathematics & Data Analysis', who: 'Neo, Aimee, Mischa' },
                { time: '10:30', title: 'Aerodynamics Science Lab', who: 'All' },
                { time: '11:30', title: 'AI‑Enhanced Flight Coding', who: 'All' },
                { time: '12:30', title: 'Lunch (French Aviation Discussion)', who: 'All' },
              ].map((item) => (
                <m.li
                  key={item.time}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">{item.time}</div>
                    <div className="text-sm text-slate-700">{item.title}</div>
                  </div>
                  <div className="text-xs text-slate-600">{item.who}</div>
                </m.li>
              ))}
            </ul>
          </Card>

          {/* Upcoming Events */}
          <Card className="lg:col-span-1 shadow" title="Upcoming Events" action={<button className="text-xs text-slate-600 hover:text-slate-900">View All Events</button>}>
            <ul className="space-y-3">
              {[
                { date: 'Sep 06', title: 'Week 1 Flight Physics Research Showcase', tag: 'presentation', color: 'bg-indigo-100 text-indigo-800' },
                { date: 'Sep 09', title: 'Parachute Engineering Materials Prep', tag: 'preparation', color: 'bg-emerald-100 text-emerald-800' },
                { date: 'Sep 13', title: 'French Aviation Vocabulary Assessment', tag: 'assessment', color: 'bg-fuchsia-100 text-fuchsia-800' },
                { date: 'Sep 16', title: 'AI Skills Workshop - Flight Data Analysis', tag: 'workshop', color: 'bg-amber-100 text-amber-800' },
                { date: 'Sep 20', title: 'Glider Design Competition', tag: 'competition', color: 'bg-rose-100 text-rose-800' },
              ].map((e) => (
                <m.li key={e.title} whileHover={{ x: 2 }} transition={{ duration: 0.15 }} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-900">{e.date}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{e.title}</p>
                      <span className={`text-[11px] mt-1 inline-block px-2 py-0.5 rounded-full ${e.color}`}>{e.tag}</span>
                    </div>
                  </div>
                </m.li>
              ))}
            </ul>
          </Card>

          {/* Recent Achievements (stack under events) */}
          <Card className="lg:col-span-1 shadow" title="Recent Achievements">
            <ul className="space-y-3">
              {[
                { who: 'Neo', what: 'Built AI flight data prediction model', pts: 75, when: '1 hour ago' },
                { who: 'Aimee', what: 'Designed interactive Scratch flight game', pts: 60, when: '2 hours ago' },
                { who: 'Mischa', what: 'Learned 10 French aviation words', pts: 40, when: '3 hours ago' },
                { who: 'Neo', what: 'Created bilingual aerodynamics video', pts: 55, when: '1 day ago' },
              ].map((a) => (
                <m.li key={`${a.who}-${a.pts}-${a.when}`} whileHover={{ x: 2 }} transition={{ duration: 0.15 }} className="flex items-center justify-between px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-900"><span className="font-semibold">{a.who}</span> — {a.what}</p>
                    <p className="text-xs text-slate-600">{a.when}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-md bg-white border border-emerald-200 text-emerald-700">{a.pts} pts</span>
                </m.li>
              ))}
            </ul>
          </Card>

          {/* Month 1 Detailed Structure (full width) */}
          <section className="lg:col-span-3">
            <m.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
            >
              <div className="flex items-center justify-between px-5 pt-5">
                <h2 className="text-sm font-semibold text-amber-900">Month 1: Flight & Systems — Detailed Structure</h2>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button className="text-xs text-amber-700 hover:text-amber-900 inline-flex items-center gap-1">Explore Detailed View <ArrowUpRight className="h-3.5 w-3.5" /></button>
                  </Tooltip.Trigger>
                  <Tooltip.Content sideOffset={8} className="rounded-md bg-slate-900 text-white text-xs px-2 py-1 shadow">
                    Open Month 1 structure details
                  </Tooltip.Content>
                </Tooltip.Root>
              </div>
              <div className="px-5 pb-5 pt-3">
                <p className="text-sm text-amber-900/80 mb-4">Comprehensive week‑by‑week structure with rubric assessment, evidence tracking, and difficulty‑differentiated tasks.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { w: 1, title: 'Parachute Drop Test', subtitle: 'Data & Analysis' },
                    { w: 2, title: 'Glider Build & Lift', subtitle: 'Engineering Design' },
                    { w: 3, title: 'Control Systems Mini', subtitle: 'Coding & Logic' },
                    { w: 4, title: 'Aero Showcase', subtitle: 'Communication' },
                  ].map((wk, i) => (
                    <m.div
                      key={wk.w}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * i, duration: 0.25 }}
                      whileHover={{ y: -2 }}
                      className="bg-white border border-amber-200 rounded-xl p-4"
                    >
                      <div className="text-[11px] font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 mb-2">Week {wk.w}</div>
                      <p className="text-sm font-semibold text-slate-900">{wk.title}</p>
                      <p className="text-xs text-slate-600">{wk.subtitle}</p>
                    </m.div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['4‑Point Rubric System', 'Evidence Checklist', 'Difficulty Levels', 'Progress Tracking'].map((chip) => (
                    <span key={chip} className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-amber-200 text-amber-900">{chip}</span>
                  ))}
                </div>
              </div>
            </m.div>
          </section>

          {/* Quick Actions */}
          <section className="lg:col-span-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {['Month 1 Detailed', 'Prep Materials', 'Update Goals', 'Add Portfolio', 'Access Tools'].map((qa) => (
                <button key={qa} className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-slate-300 hover:shadow-sm transition">
                  {qa}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
