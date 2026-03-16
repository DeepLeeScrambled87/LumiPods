import React, { useState, useEffect } from 'react';
import { User, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal, ModalFooter } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { SkillLevelBadge } from './SkillLevelBadge';
import { getSkillLevelOptions, getRecommendedSkillLevel, SKILL_LEVELS } from '../../data/skillLevels';
import {
  DEFAULT_LEARNER_AVATAR,
  LEARNER_AVATAR_OPTIONS,
} from '../../lib/learnerAvatars';
import type { SkillLevel } from '../../types/skillLevel';
import type { Learner } from '../../types/learner';

const parseInterests = (value: string): string[] =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

interface LearnerSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    age: number;
    skillLevel: SkillLevel;
    avatar: string;
    interests?: string[];
  }) => void;
  onDelete?: () => void;
  learner?: Learner | null;
  title?: string;
}

export const LearnerSetup: React.FC<LearnerSetupProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  learner,
  title,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(8);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('foundation');
  const [avatar, setAvatar] = useState(DEFAULT_LEARNER_AVATAR);
  const [interests, setInterests] = useState('');
  const [showRecommendation, setShowRecommendation] = useState(false);

  const isEditing = !!learner;

  // Reset form when modal opens/closes or learner changes
  useEffect(() => {
    if (isOpen) {
      if (learner) {
        setName(learner.name);
        setAge(learner.age);
        setSkillLevel(learner.skillLevel);
        setAvatar(learner.avatar);
        setInterests((learner.preferences?.interests || []).join(', '));
      } else {
        setName('');
        setAge(8);
        setSkillLevel('foundation');
        setAvatar(DEFAULT_LEARNER_AVATAR);
        setInterests('');
      }
      setShowRecommendation(false);
    }
  }, [isOpen, learner]);

  // Update recommendation when age changes
  useEffect(() => {
    if (!isEditing && age) {
      const { level } = getRecommendedSkillLevel(age);
      setSkillLevel(level);
      setShowRecommendation(true);
    }
  }, [age, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age) return;
    const parsedInterests = parseInterests(interests);
    onSave({
      name: name.trim(),
      age,
      skillLevel,
      avatar,
      interests: parsedInterests.length > 0 ? parsedInterests : undefined,
    });
    onClose();
  };

  const skillConfig = SKILL_LEVELS[skillLevel];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || (isEditing ? `Edit ${learner?.name}` : 'Add New Learner')}
      description={isEditing ? 'Update learner details' : 'Set up a new learner profile'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Avatar</label>
          <div className="grid grid-cols-5 gap-2">
            {LEARNER_AVATAR_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setAvatar(option.id)}
                className={`rounded-xl border p-2 transition-all ${
                  avatar === option.id
                    ? 'bg-slate-900 ring-2 ring-slate-900 ring-offset-2'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200'
                }`}
                title={option.label}
              >
                <Avatar src={option.src} alt={option.alt} size="md" className="mx-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter learner's name"
          icon={<User className="h-4 w-4" />}
          required
        />

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Age</label>
          <input
            type="number"
            min={4}
            max={18}
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            required
          />
        </div>

        {/* Skill Level */}
        <div>
          <Select
            label="Skill Level"
            value={skillLevel}
            onChange={(e) => {
              setSkillLevel(e.target.value as SkillLevel);
              setShowRecommendation(false);
            }}
            options={getSkillLevelOptions()}
          />
          
          {showRecommendation && !isEditing && (
            <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
              <Sparkles className="h-4 w-4" />
              <span>Recommended based on age {age}</span>
            </div>
          )}

          {/* Skill level description */}
          <div className={`mt-3 p-3 rounded-lg ${skillConfig.bgColor} ${skillConfig.borderColor} border`}>
            <div className="flex items-center gap-2 mb-1">
              <SkillLevelBadge level={skillLevel} size="md" />
              <span className="text-xs text-slate-500">{skillConfig.ageRange}</span>
            </div>
            <p className={`text-sm ${skillConfig.color}`}>{skillConfig.description}</p>
            <div className="mt-2 text-xs text-slate-600">
              <span className="font-medium">Focus time:</span> {skillConfig.focusMinutes} min |{' '}
              <span className="font-medium">Daily blocks:</span> {skillConfig.dailyBlocks}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Interests
          </label>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="soccer, drawing, space"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-slate-500">
            Use commas to separate a few interests. Lumi will use these to personalize examples and project ideas.
          </p>
        </div>

        <ModalFooter>
          {isEditing && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (confirm(`Remove ${learner?.name} from your family?`)) {
                  onDelete();
                  onClose();
                }
              }}
              className="mr-auto"
            >
              Remove
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!name.trim() || !age}>
            {isEditing ? 'Save Changes' : 'Add Learner'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default LearnerSetup;
