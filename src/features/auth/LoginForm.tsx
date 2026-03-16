import React, { useState } from 'react';
import { Rocket, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useFamily } from '../family';

export const LoginForm: React.FC = () => {
  const { login } = useFamily();
  const [familyName, setFamilyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    setIsLoading(true);

    try {
      // Simulate a brief delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));
      await login(familyName.trim());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo & Welcome */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4"
          >
            <Rocket className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">LumiPods</h1>
          <p className="text-slate-400">
            Ship real work every week through structured learning pods
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Welcome!</h2>
          <p className="text-sm text-slate-500 mb-6">
            Enter your family name to get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Family Name"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g., The Smiths"
              autoFocus
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
            >
              Get Started
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Your data is stored locally on this device. No account required.
            </p>
          </div>
        </motion.div>

        {/* Features preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { icon: '📚', label: '4 Themed Pods' },
            { icon: '⭐', label: 'Points & Rewards' },
            { icon: '📁', label: 'Portfolio System' },
          ].map((feature) => (
            <div key={feature.label} className="text-slate-400">
              <span className="text-2xl">{feature.icon}</span>
              <p className="text-xs mt-1">{feature.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
