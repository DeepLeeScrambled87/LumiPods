import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Upload, Link, X, Plus } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { formatLearnerAvatarLabel } from '../../lib/learnerAvatars';
import { ARTIFACT_TYPE_CONFIG } from '../../types/artifact';
import { COMPETENCY_DOMAINS } from '../../types/competency';
import type { ArtifactType, ArtifactVisibility } from '../../types/artifact';
import type { CompetencyDomain } from '../../types/competency';
import type { Learner } from '../../types/learner';
import type { SkillLevel } from '../../types/skillLevel';

interface ArtifactUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (artifact: ArtifactFormData) => void;
  learners: Learner[];
  defaultLearnerId?: string;
  defaultPodId?: string;
  podTitle?: string;
  weekOptions?: { value: string; label: string }[];
  title?: string;
  description?: string;
  submitLabel?: string;
  allowMultipleLearners?: boolean;
  enableSkillLevelTargeting?: boolean;
  initialData?: Partial<ArtifactFormData> | null;
}

export interface ArtifactFormData {
  learnerId: string;
  learnerIds: string[];
  targetSkillLevels: SkillLevel[];
  podId?: string;
  weekNumber?: number;
  type: ArtifactType;
  title: string;
  description: string;
  reflection: string;
  url?: string;
  file?: File;
  competencies: CompetencyDomain[];
  visibility: ArtifactVisibility;
  tags: string[];
  createdDate: string; // Allow backdating
}

export const ArtifactUploader: React.FC<ArtifactUploaderProps> = ({
  isOpen,
  onClose,
  onSave,
  learners,
  defaultLearnerId,
  defaultPodId,
  podTitle,
  weekOptions = [],
  title = 'Add to Portfolio',
  description = 'Upload work that demonstrates learning',
  submitLabel = 'Add to Portfolio',
  allowMultipleLearners = false,
  enableSkillLevelTargeting = false,
  initialData = null,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstLearnerId = learners[0]?.id || '';
  const defaultAudienceLearnerId = enableSkillLevelTargeting ? '' : defaultLearnerId || firstLearnerId;
  const defaultAudienceLearnerIds = enableSkillLevelTargeting
    ? []
    : defaultLearnerId
      ? [defaultLearnerId]
      : firstLearnerId
        ? [firstLearnerId]
        : [];
  const initialWeekNumber = useMemo(() => {
    const initialValue = weekOptions[0]?.value;
    if (!initialValue || initialValue === 'general') {
      return undefined;
    }
    return Number(initialValue);
  }, [weekOptions]);
  const [formData, setFormData] = useState<ArtifactFormData>({
    learnerId: defaultAudienceLearnerId,
    learnerIds: defaultAudienceLearnerIds,
    targetSkillLevels: [],
    podId: defaultPodId,
    weekNumber: initialWeekNumber,
    type: 'photo',
    title: '',
    description: '',
    reflection: '',
    competencies: [],
    visibility: 'family',
    tags: [],
    createdDate: new Date().toISOString().split('T')[0], // Default to today
  });
  const [tagInput, setTagInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const learnersMatchingTargetLevels = useMemo(() => {
    if (!enableSkillLevelTargeting || formData.targetSkillLevels.length === 0) {
      return learners;
    }

    return learners.filter((learner) => formData.targetSkillLevels.includes(learner.skillLevel));
  }, [enableSkillLevelTargeting, formData.targetSkillLevels, learners]);

  const resetForm = useCallback(() => {
    const nextLearnerId =
      initialData?.learnerId ?? (enableSkillLevelTargeting ? '' : defaultLearnerId || firstLearnerId);
    const nextLearnerIds =
      initialData?.learnerIds ??
      (enableSkillLevelTargeting ? [] : nextLearnerId ? [nextLearnerId] : []);
    setFormData({
      learnerId: nextLearnerId || '',
      learnerIds: nextLearnerIds,
      targetSkillLevels: initialData?.targetSkillLevels || [],
      podId: initialData?.podId || defaultPodId,
      weekNumber:
        initialData?.weekNumber !== undefined ? initialData.weekNumber : initialWeekNumber,
      type: initialData?.type || 'photo',
      title: initialData?.title || '',
      description: initialData?.description || '',
      reflection: initialData?.reflection || '',
      competencies: initialData?.competencies || [],
      visibility: initialData?.visibility || 'family',
      tags: initialData?.tags || [],
      createdDate: initialData?.createdDate || new Date().toISOString().split('T')[0],
      url: initialData?.url,
      file: undefined,
    });
    setTagInput('');
    setPreviewUrl(null);
  }, [
    defaultLearnerId,
    defaultPodId,
    enableSkillLevelTargeting,
    firstLearnerId,
    initialData,
    initialWeekNumber,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    resetForm();
  }, [
    isOpen,
    resetForm,
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const toggleCompetency = (domain: CompetencyDomain) => {
    const current = formData.competencies;
    if (current.includes(domain)) {
      setFormData({ ...formData, competencies: current.filter((c) => c !== domain) });
    } else {
      setFormData({ ...formData, competencies: [...current, domain] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLearnerIds = allowMultipleLearners
      ? formData.learnerIds
      : formData.learnerId
        ? [formData.learnerId]
        : [];

    if (!formData.title.trim()) return;
    if (enableSkillLevelTargeting && formData.targetSkillLevels.length === 0) return;
    if (!enableSkillLevelTargeting && selectedLearnerIds.length === 0) return;

    onSave({
      ...formData,
      learnerId: selectedLearnerIds[0] || '',
      learnerIds: selectedLearnerIds,
    });
    onClose();
    resetForm();
  };

  const toggleLearner = (learnerId: string) => {
    const current = formData.learnerIds;
    const nextLearnerIds = current.includes(learnerId)
      ? current.filter((id) => id !== learnerId)
      : [...current, learnerId];

    setFormData({
      ...formData,
      learnerIds: nextLearnerIds,
      learnerId: nextLearnerIds[0] || '',
    });
  };

  const toggleTargetSkillLevel = (skillLevel: SkillLevel) => {
    const nextTargetSkillLevels = formData.targetSkillLevels.includes(skillLevel)
      ? formData.targetSkillLevels.filter((level) => level !== skillLevel)
      : [...formData.targetSkillLevels, skillLevel];

    const matchingLearnerIds =
      nextTargetSkillLevels.length === 0
        ? formData.learnerIds
        : formData.learnerIds.filter((learnerId) =>
            learners.some(
              (learner) =>
                learner.id === learnerId && nextTargetSkillLevels.includes(learner.skillLevel)
            )
          );

    setFormData({
      ...formData,
      targetSkillLevels: nextTargetSkillLevels,
      learnerIds: matchingLearnerIds,
      learnerId: matchingLearnerIds[0] || '',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {enableSkillLevelTargeting && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Target levels
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Required for pod teaching assets. Choose which age band(s) should see this content.
            </p>
            <div className="flex flex-wrap gap-2">
              {(['foundation', 'intermediate', 'advanced', 'pro'] as SkillLevel[]).map((skillLevel) => {
                const isSelected = formData.targetSkillLevels.includes(skillLevel);
                return (
                  <button
                    key={skillLevel}
                    type="button"
                    onClick={() => toggleTargetSkillLevel(skillLevel)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {skillLevel}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Learner selector */}
        {allowMultipleLearners ? (
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  {enableSkillLevelTargeting ? 'Specific learners (optional)' : 'Learners'}
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  {enableSkillLevelTargeting
                    ? 'Leave blank to make this available to everyone in the selected level(s). Choose specific learners only if you want to narrow the audience.'
                    : 'Choose one or more learners for this pod library item.'}
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
                onClick={() => {
                  const availableLearnerIds = learnersMatchingTargetLevels.map((learner) => learner.id);
                  const shouldSelectAll =
                    formData.learnerIds.length !== availableLearnerIds.length ||
                    availableLearnerIds.some((learnerId) => !formData.learnerIds.includes(learnerId));
                  setFormData({
                    ...formData,
                    learnerIds: shouldSelectAll ? availableLearnerIds : [],
                    learnerId: shouldSelectAll ? availableLearnerIds[0] || '' : '',
                  });
                }}
              >
                {formData.learnerIds.length > 0 ? 'Clear learner narrowing' : 'Select matching learners'}
              </button>
            </div>
            {learnersMatchingTargetLevels.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-2">
                {learnersMatchingTargetLevels.map((learner) => {
                  const isSelected = formData.learnerIds.includes(learner.id);
                  return (
                    <label
                      key={learner.id}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors',
                        isSelected
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleLearner(learner.id)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {`${formatLearnerAvatarLabel(learner.avatar)} ${learner.name}`.trim()}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {learner.skillLevel} level
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                No learners currently match the selected level(s).
              </div>
            )}
          </div>
        ) : (
          <Select
            label="Learner"
            value={formData.learnerId}
            onChange={(e) =>
              setFormData({
                ...formData,
                learnerId: e.target.value,
                learnerIds: e.target.value ? [e.target.value] : [],
              })
            }
            options={learners.map((learner) => ({
              value: learner.id,
              label: `${formatLearnerAvatarLabel(learner.avatar)} ${learner.name}`.trim(),
            }))}
          />
        )}

        {defaultPodId && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-medium text-blue-700 mb-1">Pod library upload</p>
            <p className="text-sm text-blue-900">
              This item will be linked to <span className="font-medium">{podTitle || defaultPodId}</span> so it appears in that pod&apos;s library.
            </p>
          </div>
        )}

        {defaultPodId && weekOptions.length > 0 && (
          <Select
            label="Attach to week"
            value={formData.weekNumber ? String(formData.weekNumber) : 'general'}
            onChange={(e) =>
              setFormData({
                ...formData,
                weekNumber: e.target.value === 'general' ? undefined : Number(e.target.value),
              })
            }
            options={weekOptions}
          />
        )}

        {/* Type selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ARTIFACT_TYPE_CONFIG) as ArtifactType[]).map((type) => {
              const config = ARTIFACT_TYPE_CONFIG[type];
              const isSelected = formData.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={cn(
                    'px-3 py-2 rounded-lg border text-sm transition-all',
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  )}
                >
                  {config.icon} {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* File upload or URL */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
          {formData.type === 'link' || formData.type === 'code' ? (
            <Input
              placeholder="https://..."
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              icon={<Link className="h-4 w-4" />}
            />
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
                previewUrl ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 hover:border-slate-400'
              )}
            >
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrl(null);
                      setFormData({ ...formData, file: undefined });
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF, MP4 up to 50MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={ARTIFACT_TYPE_CONFIG[formData.type].acceptedFormats.join(',')}
              />
            </div>
          )}
        </div>

        {/* Title & Description */}
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="What did you create?"
          required
        />

        {/* Date - allows backdating */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Date Created <span className="text-slate-400 font-normal">(backdate if needed)</span>
          </label>
          <input
            type="date"
            value={formData.createdDate}
            onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your work..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Reflection - key for portfolio-first approach */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Reflection <span className="text-slate-400 font-normal">(What did you learn?)</span>
          </label>
          <textarea
            value={formData.reflection}
            onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
            placeholder="What was challenging? What would you do differently? What are you proud of?"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Competencies */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Skills Demonstrated
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(COMPETENCY_DOMAINS) as CompetencyDomain[]).map((domain) => {
              const config = COMPETENCY_DOMAINS[domain];
              const isSelected = formData.competencies.includes(domain);
              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => toggleCompetency(domain)}
                  className={cn(
                    'px-2 py-1 rounded-full text-xs border transition-all',
                    isSelected ? config.color : 'bg-white text-slate-500 border-slate-200'
                  )}
                >
                  {config.icon} {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags</label>
          <div className="flex gap-2 mb-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <Button type="button" variant="secondary" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="default" size="sm">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Visibility */}
        <Select
          label="Who can see this?"
          value={formData.visibility}
          onChange={(e) => setFormData({ ...formData, visibility: e.target.value as ArtifactVisibility })}
          options={[
            { value: 'private', label: '🔒 Private - Only me' },
            { value: 'family', label: '👨‍👩‍👧‍👦 Family - My family' },
            { value: 'community', label: '👥 Community - Other LumiPods families' },
            { value: 'public', label: '🌍 Public - Anyone with link' },
          ]}
        />

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              !formData.title.trim() ||
              (enableSkillLevelTargeting && formData.targetSkillLevels.length === 0) ||
              (!allowMultipleLearners && !formData.learnerId)
            }
          >
            {submitLabel}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default ArtifactUploader;
