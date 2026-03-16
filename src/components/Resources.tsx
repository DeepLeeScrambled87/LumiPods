import React from 'react';

const Resources: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Resources</h1>
        <p className="text-sm text-slate-600 mt-1">Reference materials, links, and tools.</p>
      </header>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900">Quick Links</h2>
        <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: 'Khan Academy: Physics', url: '#' },
            { name: 'Scratch: Starter Projects', url: '#' },
            { name: 'Replit: JS Templates', url: '#' },
          ].map(r => (
            <li key={r.name} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
              <a className="text-sm text-slate-900 hover:underline" href={r.url}>{r.name}</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Resources;
