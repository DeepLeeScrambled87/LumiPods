import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Grid, List, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/cn';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { ArtifactCard } from './ArtifactCard';
import { ArtifactUploader, type ArtifactFormData } from './ArtifactUploader';
import { CompetencyWheel } from './CompetencyWheel';
import { useFamily } from '../family';
import { COMPETENCY_DOMAINS } from '../../types/competency';
import { formatLearnerAvatarLabel } from '../../lib/learnerAvatars';
import { exportPortfolioPDF } from '../../lib/pdfExport';
import { portfolioService, competencyService } from '../../services/portfolioService';
import type { Artifact } from '../../types/artifact';
import type { LearnerCompetency, CompetencyDomain } from '../../types/competency';

export const PortfolioPage: React.FC = () => {
  const { family } = useFamily();
  const [showUploader, setShowUploader] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCompetency, setFilterCompetency] = useState<string>('all');
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [competencies, setCompetencies] = useState<LearnerCompetency[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const learners = family?.learners || [];

  // Load artifacts when learner selection changes
  const loadArtifacts = useCallback(async () => {
    if (!family) return;
    setIsLoading(true);
    try {
      const learnerIds = family.learners.map(l => l.id);
      const allArtifacts = await portfolioService.getAllFamilyPortfolioArtifacts(learnerIds);
      setArtifacts(allArtifacts);
      
      if (selectedLearner !== 'all') {
        const learnerCompetencies = await competencyService.getCompetencies(selectedLearner);
        setCompetencies(learnerCompetencies);
      } else {
        setCompetencies([]);
      }
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [family, selectedLearner]);

  useEffect(() => {
    loadArtifacts();
  }, [loadArtifacts]);

  // Filter artifacts
  const filteredArtifacts = artifacts.filter((a) => {
    if (selectedLearner !== 'all' && a.learnerId !== selectedLearner) return false;
    if (filterCompetency !== 'all' && !a.competencies?.includes(filterCompetency as CompetencyDomain)) return false;
    return true;
  });

  const handleSaveArtifact = async (data: ArtifactFormData) => {
    if (!family) {
      toast.error('Family data is not available yet');
      return;
    }

    try {
      const newArtifact = await portfolioService.createArtifact({
        familyId: family.id,
        learnerId: data.learnerId,
        podId: data.podId,
        weekNumber: data.weekNumber,
        type: data.type,
        title: data.title,
        description: data.description,
        reflection: data.reflection,
        url: data.url,
        file: data.file,
        tags: data.tags || [],
        competencies: data.competencies || [],
        skillLevel: learners.find(l => l.id === data.learnerId)?.skillLevel || 'foundation',
        visibility: data.visibility || 'family',
        isFeatured: false,
      });
      
      setArtifacts(prev => [newArtifact, ...prev]);
      toast.success('Added to portfolio!');
    } catch (error) {
      console.error('Failed to save artifact:', error);
      toast.error('Failed to save artifact');
    }
  };

  const handleExportPDF = () => {
    const learner = selectedLearnerData || learners[0];
    if (!learner || !family) {
      toast.error('Select a learner to export');
      return;
    }
    
    const learnerArtifacts = artifacts.filter(a => a.learnerId === learner.id);
    const learnerCompetencies = competencies.filter(c => c.learnerId === learner.id);
    
    exportPortfolioPDF({
      learner,
      artifacts: learnerArtifacts,
      competencies: learnerCompetencies,
      familyName: family.name,
      exportDate: new Date(),
    });
    
    toast.success('Generating PDF...');
  };

  const handleDeleteArtifact = async (artifact: Artifact) => {
    try {
      await portfolioService.deleteArtifact(artifact);
      setArtifacts(prev => prev.filter(a => a.id !== artifact.id));
      toast.success('Artifact deleted');
    } catch {
      toast.error('Failed to delete artifact');
    }
  };

  const handleToggleFeatured = async (artifact: Artifact) => {
    try {
      const updated = await portfolioService.toggleFeatured(artifact);
      setArtifacts(prev => prev.map(a => a.id === artifact.id ? updated : a));
      toast.success(updated.isFeatured ? 'Added to featured' : 'Removed from featured');
    } catch {
      toast.error('Failed to update artifact');
    }
  };

  // Log handlers for debugging (remove in production)
  console.debug('Portfolio handlers:', { handleDeleteArtifact, handleToggleFeatured });

  const selectedLearnerData = learners.find((l) => l.id === selectedLearner);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Portfolio</h1>
              <p className="text-sm text-slate-600 mt-1">
                Showcase learning through artifacts that demonstrate real skills
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                icon={<Download className="h-4 w-4" />}
                onClick={handleExportPDF}
              >
                Export PDF
              </Button>
              <Button variant="secondary" icon={<Share2 className="h-4 w-4" />}>
                Share
              </Button>
              <Button
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setShowUploader(true)}
              >
                Add Work
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Competency Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Learner Filter */}
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Filter by Learner</h3>
              <Select
                value={selectedLearner}
                onChange={(e) => setSelectedLearner(e.target.value)}
                options={[
                  { value: 'all', label: 'All Learners' },
                  ...learners.map((learner) => ({
                    value: learner.id,
                    label: `${formatLearnerAvatarLabel(learner.avatar)} ${learner.name}`.trim(),
                  })),
                ]}
              />
            </Card>

            {/* Competency Wheel */}
            {selectedLearner !== 'all' && (
              <Card padding="lg">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                  {selectedLearnerData?.name}'s Skills
                </h3>
                <CompetencyWheel
                  competencies={competencies.filter((c) => c.learnerId === selectedLearner)}
                  size="md"
                />
              </Card>
            )}

            {/* Competency Filter */}
            <Card padding="lg">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Filter by Skill</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilterCompetency('all')}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    filterCompetency === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  All Skills
                </button>
                {(Object.keys(COMPETENCY_DOMAINS) as CompetencyDomain[]).map((domain) => {
                  const config = COMPETENCY_DOMAINS[domain];
                  return (
                    <button
                      key={domain}
                      onClick={() => setFilterCompetency(domain)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2',
                        filterCompetency === domain
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      <span>{config.icon}</span>
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Main Content - Artifacts Grid */}
          <div className="lg:col-span-3">
            {/* View controls */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                {filteredArtifacts.length} artifact{filteredArtifacts.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'grid' ? 'bg-slate-200' : 'hover:bg-slate-100'
                  )}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'list' ? 'bg-slate-200' : 'hover:bg-slate-100'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Artifacts */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : filteredArtifacts.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-4xl mb-4">📁</div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">No artifacts yet</h2>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Start building your portfolio by adding photos, videos, code, and other work.
                </p>
                <Button
                  variant="primary"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => setShowUploader(true)}
                >
                  Add First Artifact
                </Button>
              </Card>
            ) : (
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'space-y-4'
                )}
              >
                {filteredArtifacts.map((artifact) => (
                  <ArtifactCard
                    key={artifact.id}
                    artifact={artifact}
                    learner={learners.find((l) => l.id === artifact.learnerId)}
                    showLearner={selectedLearner === 'all'}
                    onClick={() => console.log('View artifact:', artifact.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Uploader Modal */}
      <ArtifactUploader
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        onSave={handleSaveArtifact}
        learners={learners}
      />
    </div>
  );
};

export default PortfolioPage;
