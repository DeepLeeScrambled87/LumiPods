import React, { useState } from 'react';
import { 
  FolderOpen, 
  Upload, 
  Star, 
  Filter, 
  Search, 
  Calendar, 
  User, 
  Award,
  Eye,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Artifact {
  id: string;
  title: string;
  description: string;
  type: 'photo' | 'video' | 'document' | 'reflection';
  learner: string;
  date: string;
  week: number;
  rubricScores?: {
    criteria: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  tags: string[];
}

const PortfolioManager: React.FC = () => {
  const { family } = useAuth();
  const [selectedLearner, setSelectedLearner] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Sample artifacts data - in real app this would come from backend
  const [artifacts] = useState<Artifact[]>([
    {
      id: '1',
      title: 'Initial Parachute Design Sketch',
      description: 'First attempt at designing a parachute with measurements and material notes',
      type: 'photo',
      learner: 'neo',
      date: '2024-01-15',
      week: 1,
      rubricScores: [
        { criteria: 'Design Thinking', score: 4, maxScore: 5, feedback: 'Shows clear understanding of air resistance concepts' },
        { criteria: 'Documentation', score: 3, maxScore: 5, feedback: 'Good detail, could include more measurements' }
      ],
      tags: ['design', 'physics', 'creativity']
    },
    {
      id: '2',
      title: 'Parachute Test Results Video',
      description: 'Recording of first parachute drop test with timing and observations',
      type: 'video',
      learner: 'aimee',
      date: '2024-01-16',
      week: 1,
      rubricScores: [
        { criteria: 'Scientific Method', score: 5, maxScore: 5, feedback: 'Excellent hypothesis and observation skills' },
        { criteria: 'Communication', score: 4, maxScore: 5, feedback: 'Clear explanation of results' }
      ],
      tags: ['experiment', 'observation', 'science']
    },
    {
      id: '3',
      title: 'Learning Reflection Journal',
      description: 'Written reflection on what was learned about air resistance and gravity',
      type: 'reflection',
      learner: 'mischa',
      date: '2024-01-17',
      week: 1,
      rubricScores: [
        { criteria: 'Self-Reflection', score: 4, maxScore: 5, feedback: 'Thoughtful analysis of learning process' },
        { criteria: 'Writing Skills', score: 3, maxScore: 5, feedback: 'Good ideas, work on organization' }
      ],
      tags: ['reflection', 'writing', 'metacognition']
    }
  ]);

  if (!family) return null;

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesLearner = selectedLearner === 'all' || artifact.learner === selectedLearner;
    const matchesType = selectedType === 'all' || artifact.type === selectedType;
    const matchesSearch = searchTerm === '' || 
      artifact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artifact.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artifact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesLearner && matchesType && matchesSearch;
  });

  const getAverageScore = (artifact: Artifact) => {
    if (!artifact.rubricScores || artifact.rubricScores.length === 0) return null;
    const total = artifact.rubricScores.reduce((sum, score) => sum + score.score, 0);
    const maxTotal = artifact.rubricScores.reduce((sum, score) => sum + score.maxScore, 0);
    return { score: total, maxScore: maxTotal, percentage: (total / maxTotal) * 100 };
  };

  const getLearnerById = (learnerId: string) => {
    return family.learners.find(learner => learner.id === learnerId);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'photo': return '📸';
      case 'video': return '🎥';
      case 'document': return '📄';
      case 'reflection': return '💭';
      default: return '📁';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Portfolio Manager 📁
            </h1>
            <p className="text-gray-600">
              Collect, assess, and celebrate learning artifacts
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Artifact
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Artifacts</p>
              <p className="text-2xl font-bold text-gray-900">{artifacts.length}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {artifacts.filter(a => a.week === 1).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-success-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assessed</p>
              <p className="text-2xl font-bold text-gray-900">
                {artifacts.filter(a => a.rubricScores && a.rubricScores.length > 0).length}
              </p>
            </div>
            <Award className="h-8 w-8 text-secondary-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">85%</p>
            </div>
            <Star className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search artifacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Learner Filter */}
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <select
              value={selectedLearner}
              onChange={(e) => setSelectedLearner(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Learners</option>
              {family.learners.map(learner => (
                <option key={learner.id} value={learner.id}>{learner.name}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="photo">Photos</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
              <option value="reflection">Reflections</option>
            </select>
          </div>
        </div>
      </div>

      {/* Artifacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtifacts.map((artifact) => {
          const learner = getLearnerById(artifact.learner);
          const averageScore = getAverageScore(artifact);
          
          return (
            <div key={artifact.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Artifact Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getTypeIcon(artifact.type)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{artifact.title}</h3>
                      <p className="text-sm text-gray-600">Week {artifact.week}</p>
                    </div>
                  </div>
                  {averageScore && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        {Math.round(averageScore.percentage)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {averageScore.score}/{averageScore.maxScore}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3">{artifact.description}</p>

                {/* Learner & Date */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{learner?.avatar}</span>
                    <span className="text-gray-700">{learner?.name}</span>
                  </div>
                  <span className="text-gray-500">{new Date(artifact.date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {artifact.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rubric Scores */}
              {artifact.rubricScores && artifact.rubricScores.length > 0 && (
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Assessment</h4>
                  <div className="space-y-2">
                    {artifact.rubricScores.map((score, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-700">{score.criteria}</span>
                          <span className="text-sm font-medium">
                            {score.score}/{score.maxScore}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${(score.score / score.maxScore) * 100}%` }}
                          />
                        </div>
                        {score.feedback && (
                          <p className="text-xs text-gray-600 mt-1">{score.feedback}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-4 bg-gray-50 flex justify-between">
                <button className="flex items-center px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </button>
                <button className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Star className="h-4 w-4 mr-2" />
                  Assess
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredArtifacts.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No artifacts found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedLearner !== 'all' || selectedType !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Start collecting learning artifacts to build your portfolio.'}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload First Artifact
          </button>
        </div>
      )}

      {/* Upload Modal Placeholder */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Artifact</h3>
            <p className="text-gray-600 mb-4">
              Upload functionality will be implemented with backend integration.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
