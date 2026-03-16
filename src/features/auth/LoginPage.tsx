import React, { useState } from 'react';
import { Rocket, ArrowRight, Users, User, ChevronLeft, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from './AuthContext';
import { useFamily } from '../family';
import type { Learner } from '../../types/learner';

type LoginMode = 'select' | 'parent' | 'learner' | 'learner-pin';
type ParentAccessMode = 'signin' | 'signup' | 'local';

const PARENT_MODE_LABELS: Record<ParentAccessMode, { title: string; description: string }> = {
  signin: {
    title: 'Parent Sign In',
    description: 'Access your live family account.',
  },
  signup: {
    title: 'Create Parent Account',
    description: 'Set up a real family account backed by PocketBase.',
  },
  local: {
    title: 'Device-Only Setup',
    description: 'Use local testing mode on this device only.',
  },
};

export const LoginPage: React.FC = () => {
  const {
    loginAsParent,
    signInParent,
    signUpParent,
    requestParentPasswordReset,
    loginAsLearner,
  } = useAuth();
  const { family, login: createFamily, verifyLearnerPin } = useFamily();
  const [mode, setMode] = useState<LoginMode>('select');
  const [parentMode, setParentMode] = useState<ParentAccessMode>('signin');
  const [familyName, setFamilyName] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [learnerPin, setLearnerPin] = useState('');
  const [parentError, setParentError] = useState('');
  const [parentNotice, setParentNotice] = useState('');
  const [learnerPinError, setLearnerPinError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);

  const learners = family?.learners || [];

  const resetParentForm = () => {
    setParentError('');
    setParentNotice('');
    setParentPassword('');
  };

  const handleParentAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentError('');
    setParentNotice('');

    if (parentMode === 'signin') {
      if (!parentEmail.trim() || !parentPassword.trim()) {
        setParentError('Enter your email and password to sign in.');
        return;
      }
    }

    if (parentMode === 'signup') {
      if (!parentName.trim() || !familyName.trim() || !parentEmail.trim() || !parentPassword.trim()) {
        setParentError('Complete all account fields to create your family account.');
        return;
      }
    }

    if (parentMode === 'local' && !familyName.trim()) {
      setParentError('Enter a family name for device-only setup.');
      return;
    }

    setIsLoading(true);

    try {
      if (parentMode === 'signin') {
        await signInParent(parentEmail.trim(), parentPassword);
      } else if (parentMode === 'signup') {
        await signUpParent(
          parentName.trim(),
          parentEmail.trim(),
          parentPassword,
          familyName.trim()
        );
      } else {
        const createdFamily = await createFamily(familyName.trim());
        loginAsParent(createdFamily.id, createdFamily.name);
      }
    } catch (error) {
      console.error('Parent authentication failed:', error);
      setParentError(error instanceof Error ? error.message : 'Unable to continue with parent access.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setParentError('');
    setParentNotice('');

    if (!parentEmail.trim()) {
      setParentError('Enter your parent email first so we know where to send the reset link.');
      return;
    }

    setIsRecoveringPassword(true);

    try {
      await requestParentPasswordReset(parentEmail.trim());
      setParentNotice(
        `If an account exists for ${parentEmail.trim()}, a password reset link has been requested.`
      );
    } catch (error) {
      console.error('Password reset request failed:', error);
      setParentError(
        error instanceof Error ? error.message : 'Unable to start password recovery right now.'
      );
    } finally {
      setIsRecoveringPassword(false);
    }
  };

  const handleLearnerSelect = (learner: Learner) => {
    if (!family) return;

    if (learner.pin) {
      setSelectedLearner(learner);
      setLearnerPin('');
      setLearnerPinError('');
      setMode('learner-pin');
      return;
    }

    loginAsLearner(family.id, learner.id, learner.name, learner.avatar);
  };

  const handleLearnerPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!family || !selectedLearner) return;

    if (!verifyLearnerPin(selectedLearner.id, learnerPin)) {
      setLearnerPinError('That PIN does not match. Try again.');
      return;
    }

    loginAsLearner(family.id, selectedLearner.id, selectedLearner.name, selectedLearner.avatar);
  };

  const parentModeMeta = PARENT_MODE_LABELS[parentMode];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
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
          <p className="text-slate-400">Portfolio-first learning for homeschool families</p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Welcome!</h2>
              <p className="text-sm text-slate-500 mb-2">Who&apos;s learning today?</p>
              {family && (
                <p className="text-xs text-slate-400 mb-6">
                  Current device family: {family.name}
                </p>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setMode('parent');
                    resetParentForm();
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-slate-900">Parent / Educator</h3>
                    <p className="text-sm text-slate-500">Sign in or manage all learners</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>

                <button
                  onClick={() => setMode('learner')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-slate-900">I&apos;m a Learner</h3>
                    <p className="text-sm text-slate-500">Use my learner profile and PIN if needed</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'parent' && (
            <motion.div
              key="parent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <button
                onClick={() => setMode('select')}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{parentModeMeta.title}</h2>
                  <p className="text-sm text-slate-500">{parentModeMeta.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 rounded-xl bg-slate-100 p-1">
                {(['signin', 'signup', 'local'] as ParentAccessMode[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setParentMode(option);
                      setParentError('');
                    }}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      parentMode === option
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {option === 'signin' ? 'Sign In' : option === 'signup' ? 'Create' : 'Device'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleParentAuth} className="space-y-4">
                {parentMode === 'signup' && (
                  <Input
                    label="Parent Name"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Your name"
                    autoFocus
                    required
                  />
                )}

                {(parentMode === 'signup' || parentMode === 'local') && (
                  <Input
                    label="Family Name"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g., The Smiths"
                    autoFocus={parentMode === 'local'}
                    required
                  />
                )}

                {parentMode !== 'local' && (
                  <>
                    <Input
                      label="Email"
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="parent@example.com"
                      autoComplete="email"
                      autoFocus={parentMode === 'signin'}
                      required
                    />
                    <Input
                      label="Password"
                      type="password"
                      value={parentPassword}
                      onChange={(e) => setParentPassword(e.target.value)}
                      placeholder="Enter password"
                      autoComplete={parentMode === 'signin' ? 'current-password' : 'new-password'}
                      required
                    />
                    {parentMode === 'signin' && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => void handleForgotPassword()}
                          disabled={isRecoveringPassword}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-400"
                        >
                          {isRecoveringPassword ? 'Sending reset link...' : 'Forgot password?'}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {parentError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {parentError}
                  </div>
                )}

                {parentNotice && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {parentNotice}
                  </div>
                )}

                {parentMode === 'local' && (
                  <p className="text-xs text-slate-500">
                    Device-only setup is for local testing and does not create a real parent account.
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={isLoading}
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                >
                  {parentMode === 'signin'
                    ? 'Sign In'
                    : parentMode === 'signup'
                      ? 'Create Family Account'
                      : 'Continue on This Device'}
                </Button>
              </form>
            </motion.div>
          )}

          {mode === 'learner' && (
            <motion.div
              key="learner"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <button
                onClick={() => setMode('select')}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Who are you?</h2>
                  <p className="text-sm text-slate-500">Select your profile</p>
                </div>
              </div>

              {learners.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🧒</div>
                  <p className="text-slate-600 mb-4">No learners set up yet</p>
                  <p className="text-sm text-slate-500 mb-4">Ask a parent to sign in and add you first.</p>
                  <Button variant="secondary" onClick={() => setMode('parent')}>
                    Parent Sign In
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {learners.map((learner) => (
                    <button
                      key={learner.id}
                      onClick={() => handleLearnerSelect(learner)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                    >
                      <Avatar emoji={learner.avatar} size="lg" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{learner.name}</h3>
                          {learner.pin && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                              <Lock className="h-3 w-3" />
                              PIN
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">Age {learner.age}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-amber-600">⭐ {learner.points}</p>
                        <p className="text-xs text-slate-400">🔥 {learner.streakDays}d streak</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {mode === 'learner-pin' && selectedLearner && (
            <motion.div
              key="learner-pin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <button
                onClick={() => {
                  setMode('learner');
                  setLearnerPin('');
                  setLearnerPinError('');
                }}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <div className="text-center mb-6">
                <Avatar emoji={selectedLearner.avatar} size="xl" className="mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-slate-900">{selectedLearner.name}</h2>
                <p className="text-sm text-slate-500">Enter your learner PIN to continue</p>
              </div>

              <form onSubmit={handleLearnerPinSubmit} className="space-y-4">
                <Input
                  label="Learner PIN"
                  type="password"
                  inputMode="numeric"
                  value={learnerPin}
                  onChange={(e) => {
                    setLearnerPin(e.target.value);
                    setLearnerPinError('');
                  }}
                  placeholder="Enter PIN"
                  autoFocus
                  required
                  error={learnerPinError || undefined}
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                >
                  Open My Dashboard
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { icon: '🤖', label: 'AI Tutor' },
            { icon: '⭐', label: 'Earn Rewards' },
            { icon: '📁', label: 'Build Portfolio' },
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

export default LoginPage;
