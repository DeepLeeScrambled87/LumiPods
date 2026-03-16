import React from 'react';

const ProgramOverview: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Program Overview</h1>
        <p className="text-sm text-slate-600 mt-1">High-level view of months, themes, and milestones.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[{label:'Months',value:'4'},{label:'Weeks',value:'16'},{label:'Core Milestones',value:'12'}].map(s=> (
          <section key={s.label} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="text-xs text-slate-600">{s.label}</div>
            <div className="text-2xl font-semibold text-slate-900 mt-1">{s.value}</div>
          </section>
        ))}
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-900">Months</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
          {[
            { w: 'Month 1', title: 'Flight & Systems', desc: 'Parachutes, gliders, control' },
            { w: 'Month 2', title: 'Energy & Motion', desc: 'Kinetics, circuits, robotics' },
            { w: 'Month 3', title: 'Data & AI', desc: 'Sensing, modeling, coding' },
            { w: 'Month 4', title: 'Showcase', desc: 'Communication, demos, portfolios' },
          ].map((m)=> (
            <div key={m.w} className="p-4 border border-slate-200 rounded-xl">
              <div className="text-[11px] font-semibold text-slate-700 mb-1">{m.w}</div>
              <div className="text-sm font-semibold text-slate-900">{m.title}</div>
              <div className="text-xs text-slate-600">{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900">Upcoming Milestones</h2>
        <ul className="mt-3 space-y-2">
          {[{d:'Sep 13',t:'Vocabulary Assessment'},{d:'Sep 20',t:'Glider Competition'},{d:'Sep 27',t:'Mini‑Showcase'}].map(e=> (
            <li key={e.t} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-900">{e.d}</span>
              <span className="text-sm text-slate-900 flex-1 ml-3">{e.t}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ProgramOverview;
