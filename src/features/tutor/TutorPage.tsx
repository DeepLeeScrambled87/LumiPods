import React from 'react';
import { AITutor } from './AITutor';

interface TutorPageProps {
  onExit?: () => void;
}

export const TutorPage: React.FC<TutorPageProps> = ({ onExit }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
          <AITutor isFullPage onClose={onExit} />
        </div>
      </div>
    </div>
  );
};

export default TutorPage;
