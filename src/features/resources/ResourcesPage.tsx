// Resources Page - AI/ML Tools and Learning Platforms
import { useState } from 'react';
import { ExternalLink, Search, Star, Zap, BookOpen, Code, Brain, Globe } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PARTNER_PLATFORMS, type PlatformCategory, type PartnerPlatform } from '../../data/partnerPlatforms';

type FilterCategory = 'all' | PlatformCategory;

const CATEGORY_CONFIG: Record<FilterCategory, { label: string; icon: React.ReactNode; color: string }> = {
  all: { label: 'All Tools', icon: <Star className="w-4 h-4" />, color: 'bg-slate-100 text-slate-700' },
  ai: { label: 'AI & ML', icon: <Brain className="w-4 h-4" />, color: 'bg-violet-100 text-violet-700' },
  coding: { label: 'Coding', icon: <Code className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
  math: { label: 'Math', icon: <Zap className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700' },
  science: { label: 'Science', icon: <BookOpen className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
  language: { label: 'Languages', icon: <Globe className="w-4 h-4" />, color: 'bg-rose-100 text-rose-700' },
  'critical-thinking': { label: 'Critical Thinking', icon: <Brain className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
  creative: { label: 'Creative', icon: <Star className="w-4 h-4" />, color: 'bg-pink-100 text-pink-700' },
};

export function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  const filteredPlatforms = PARTNER_PLATFORMS.filter(platform => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        platform.name.toLowerCase().includes(query) ||
        platform.description.toLowerCase().includes(query) ||
        platform.tagline.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && !platform.category.includes(categoryFilter)) {
      return false;
    }

    // Free filter
    if (showFreeOnly && !platform.isFree && !platform.hasFreeTier) {
      return false;
    }

    return true;
  });

  // Group AI tools at the top
  const aiTools = filteredPlatforms.filter(p => p.category.includes('ai'));
  const otherTools = filteredPlatforms.filter(p => !p.category.includes('ai'));
  const sortedPlatforms = categoryFilter === 'all' ? [...aiTools, ...otherTools] : filteredPlatforms;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🛠️</span>
            <h1 className="text-2xl font-semibold text-slate-900">Learning Resources</h1>
          </div>
          <p className="text-slate-600">
            Curated tools and platforms for AI, coding, and learning. Many with generous free tiers!
          </p>
        </header>

        {/* Search and Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tools and platforms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_CONFIG) as FilterCategory[]).map(cat => {
                const config = CATEGORY_CONFIG[cat];
                const isActive = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${isActive ? config.color + ' ring-2 ring-offset-1 ring-current' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}
                    `}
                  >
                    {config.icon}
                    {config.label}
                  </button>
                );
              })}
            </div>

            {/* Free filter */}
            <button
              onClick={() => setShowFreeOnly(!showFreeOnly)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${showFreeOnly ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}
              `}
            >
              <Zap className="w-4 h-4" />
              Free / Free Tier
            </button>
          </div>
        </Card>

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-4">
          Showing {sortedPlatforms.length} of {PARTNER_PLATFORMS.length} resources
        </p>

        {/* Platform Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPlatforms.map(platform => (
            <PlatformCard key={platform.id} platform={platform} />
          ))}
        </div>

        {sortedPlatforms.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-slate-500">No resources match your filters</p>
            <Button variant="secondary" className="mt-4" onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setShowFreeOnly(false);
            }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

function PlatformCard({ platform }: { platform: PartnerPlatform }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{platform.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 truncate">{platform.name}</h3>
            {(platform.isFree || platform.hasFreeTier) && (
              <Badge variant="success" size="sm">
                {platform.isFree ? 'Free' : 'Free Tier'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">{platform.tagline}</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{platform.description}</p>

      {/* Categories */}
      <div className="flex flex-wrap gap-1 mb-3">
        {platform.category.map(cat => {
          const config = CATEGORY_CONFIG[cat];
          return (
            <span key={cat} className={`px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          );
        })}
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        <span>Ages {platform.ageRange}</span>
        <span>•</span>
        <span>{platform.skillLevels.map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(', ')}</span>
      </div>

      {/* Featured courses */}
      {platform.featuredCourses && platform.featuredCourses.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {expanded ? 'Hide' : 'Show'} {platform.featuredCourses.length} featured course{platform.featuredCourses.length > 1 ? 's' : ''}
          </button>
          
          {expanded && (
            <div className="mt-2 space-y-2">
              {platform.featuredCourses.map(course => (
                <a
                  key={course.id}
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-700">{course.title}</p>
                  <p className="text-xs text-slate-500">{course.duration} • {course.skillLevel}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action */}
      <a
        href={platform.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
      >
        Open {platform.name}
        <ExternalLink className="w-4 h-4" />
      </a>
    </Card>
  );
}

export default ResourcesPage;
