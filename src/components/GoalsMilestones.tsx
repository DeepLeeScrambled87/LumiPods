import React from 'react';

const GoalsMilestones: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Goals & Milestones</h1>
        <p className="text-sm text-slate-600 mt-1">Set goals, track progress, and manage achievements.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[{label:'Weekly Goals',value:'12'},{label:'Completed',value:'0'},{label:'Upcoming',value:'3'}].map(s=> (
          <section key={s.label} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="text-xs text-slate-600">{s.label}</div>
            <div className="text-2xl font-semibold text-slate-900 mt-1">{s.value}</div>
          </section>
        ))}
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900">Upcoming Milestones</h2>
        <ul className="mt-3 space-y-2">
          {[{d:'Sep 09',t:'Materials Prep'},{d:'Sep 13',t:'Vocab Assessment'},{d:'Sep 20',t:'Glider Competition'}].map(e=> (
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

export default GoalsMilestones;
