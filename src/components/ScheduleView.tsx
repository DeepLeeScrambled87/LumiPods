import React from 'react';

const ScheduleView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Schedule</h1>
        <p className="text-sm text-slate-600 mt-1">Calendar of daily blocks and events.</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900">Today</h2>
        <ul className="mt-3 space-y-2">
          {[
            { time: '09:00', title: 'Morning Aerobics (French Commands)' },
            { time: '09:30', title: 'Flight Mathematics & Data Analysis' },
            { time: '10:30', title: 'Aerodynamics Science Lab' },
          ].map(i => (
            <li key={i.time} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-sm font-medium text-slate-900">{i.time}</span>
              <span className="text-sm text-slate-700 flex-1 ml-3">{i.title}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ScheduleView;
