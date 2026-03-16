import React from 'react';

const Month1Detailed: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Month 1: Flight & Systems — Detailed</h1>
        <p className="text-sm text-slate-600 mt-1">Week-by-week breakdown with rubrics, evidence, and difficulty levels.</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-900">Weeks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
          {[
            { w: 1, title: 'Parachute Drop Test', meta: 'Data & Analysis' },
            { w: 2, title: 'Glider Build & Lift', meta: 'Engineering Design' },
            { w: 3, title: 'Control Systems Mini', meta: 'Coding & Logic' },
            { w: 4, title: 'Aero Showcase', meta: 'Communication' },
          ].map((wk)=> (
            <div key={wk.w} className="p-4 border border-amber-200 rounded-xl bg-amber-50/40">
              <div className="text-[11px] font-semibold inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">Week {wk.w}</div>
              <div className="text-sm font-semibold text-slate-900 mt-2">{wk.title}</div>
              <div className="text-xs text-slate-600">{wk.meta}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900">Rubrics & Evidence</h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {['4‑Point Rubric', 'Evidence Checklist', 'Progress Tracking'].map((t)=> (
            <div key={t} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <div className="text-sm font-semibold text-slate-900">{t}</div>
              <div className="text-xs text-slate-600 mt-1">Templates and guidance to standardize evaluation.</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Month1Detailed;
