import React from 'react';

import { useAuth } from '../contexts/AuthContext';

const Students: React.FC = () => {
  const { family } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Students</h1>
        <p className="text-sm text-slate-600 mt-1">Roster, profiles, and quick actions.</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(family?.learners ?? []).map(l => (
            <div key={l.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="text-xl">{l.avatar}</span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{l.name}</div>
                  <div className="text-xs text-slate-600 capitalize">{l.skillLevel}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-600">Points: {l.points}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Students;
