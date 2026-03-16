// Reference layout imported from user's Downloads
// Used as a block layout guide only; not used in app bundle

import React from "react";

export default function LumiPodsControlCenter() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <header className="flex flex-col items-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">FuturePods Dashboard</h1>
        <p className="text-sm text-gray-600">Welcome back! Here's what's happening in your learning pods today.</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Goals */}
        <section className="bg-white rounded-xl shadow p-4 col-span-1">
          <h2 className="text-lg font-semibold mb-2">Weekly Goals</h2>
          <div className="text-3xl font-bold">0/12</div>
        </section>

        {/* Materials Ready */}
        <section className="bg-white rounded-xl shadow p-4 col-span-1">
          <h2 className="text-lg font-semibold mb-2">Materials Ready</h2>
          <div className="text-2xl text-green-600 font-bold">85%</div>
          <p className="text-xs text-gray-500">For next week</p>
        </section>

        {/* Student Progress */}
        <section className="bg-white rounded-xl shadow p-4 col-span-1">
          <h2 className="text-lg font-semibold mb-2">Student Progress</h2>
          <ul className="space-y-1 text-sm">
            <li><strong>Neo:</strong> AI Flight Data Analysis — <span className="text-blue-500 font-medium">78%</span></li>
            <li><strong>Aimee:</strong> Parachute Engineering — <span className="text-blue-500 font-medium">65%</span></li>
            <li><strong>Mischa:</strong> French Aviation Vocabulary — <span className="text-blue-500 font-medium">82%</span></li>
          </ul>
        </section>

        {/* Today's Schedule */}
        <section className="bg-white rounded-xl shadow p-4 col-span-2">
          <h2 className="text-lg font-semibold mb-2">Today's Schedule</h2>
          <ul className="space-y-2 text-sm">
            <li>09:00 – Morning Aerobics (French Commands)</li>
            <li>09:30 – Flight Mathematics & Data Analysis</li>
            <li>10:30 – Aerodynamics Science Lab</li>
            <li>11:30 – AI-Enhanced Flight Coding</li>
            <li>12:30 – Lunch (French Aviation Discussion)</li>
          </ul>
        </section>

        {/* Upcoming Events */}
        <section className="bg-white rounded-xl shadow p-4 col-span-1">
          <h2 className="text-lg font-semibold mb-2">Upcoming Events</h2>
          <ul className="text-sm space-y-1">
            <li>Sep 06 – Flight Physics Research Showcase</li>
            <li>Sep 09 – Parachute Engineering Prep</li>
            <li>Sep 13 – Vocabulary Assessment</li>
            <li>Sep 16 – AI Workshop</li>
            <li>Sep 20 – Glider Design Competition</li>
          </ul>
        </section>

        {/* Recent Achievements */}
        <section className="bg-white rounded-xl shadow p-4 col-span-1">
          <h2 className="text-lg font-semibold mb-2">Recent Achievements</h2>
          <ul className="text-sm space-y-1">
            <li>Neo – Built AI flight model (75 pts)</li>
            <li>Aimee – Scratch flight game (60 pts)</li>
            <li>Mischa – Learned 10 French words (40 pts)</li>
            <li>Neo – Bilingual aerodynamics video (55 pts)</li>
          </ul>
        </section>

        {/* Month Overview */}
        <section className="bg-orange-50 border-l-4 border-orange-400 rounded-xl shadow p-4 col-span-3">
          <h2 className="text-lg font-semibold mb-2">Month 1: Flight & Systems – Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-2 rounded shadow">Week 1 – Parachute Drop Test</div>
            <div className="bg-white p-2 rounded shadow">Week 2 – Glider Build & Lift</div>
            <div className="bg-white p-2 rounded shadow">Week 3 – Control Systems</div>
            <div className="bg-white p-2 rounded shadow">Week 4 – Aero Showcase</div>
          </div>
          <p className="mt-2 text-xs text-gray-600">Includes rubric system, evidence checklist, difficulty tiers, and progress tracking.</p>
        </section>
      </main>

      <footer className="mt-12 text-center text-xs text-gray-400">
        FuturePods © {new Date().getFullYear()} | Created by Maria Privat & SolCore
      </footer>
    </div>
  );
}

