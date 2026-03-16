import React from 'react';

const LearningAnalytics: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Learning Analytics</h1>
        <p className="text-sm text-slate-600 mt-1">Progress trends, streaks, and skill mastery.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[{label:'Total Points',value:'0'},{label:'Avg Focus',value:'—'},{label:'Active Weeks',value:'1'}].map(s=> (
          <section key={s.label} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="text-xs text-slate-600">{s.label}</div>
            <div className="text-2xl font-semibold text-slate-900 mt-1">{s.value}</div>
          </section>
        ))}
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900">Charts</h2>
        <div className="h-48 mt-3 rounded-xl border border-slate-200 bg-slate-50 grid place-items-center text-slate-500 text-sm">
          Chart placeholder
        </div>
      </section>
    </div>
  );
};

export default LearningAnalytics;
