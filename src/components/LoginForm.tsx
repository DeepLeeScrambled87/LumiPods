import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Users, Sparkles } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [familyName, setFamilyName] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (familyName.trim()) {
      login(familyName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary-100 p-3 rounded-full">
                <GraduationCap className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to LumiPods
            </h1>
            <p className="text-gray-600">
              Your Homeschooling Control Centre
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-2">
                Family Name
              </label>
              <input
                type="text"
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter your family name"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Start Learning Journey
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <Users className="h-6 w-6 text-primary-600 mb-2" />
                <span className="text-xs text-gray-600">3 Learners</span>
              </div>
              <div className="flex flex-col items-center">
                <Sparkles className="h-6 w-6 text-secondary-600 mb-2" />
                <span className="text-xs text-gray-600">Weekly Pods</span>
              </div>
              <div className="flex flex-col items-center">
                <GraduationCap className="h-6 w-6 text-success-600 mb-2" />
                <span className="text-xs text-gray-600">Real Projects</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Ship real work every week • Build • Learn • Show</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
