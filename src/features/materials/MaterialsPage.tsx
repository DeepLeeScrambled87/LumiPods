import React, { useState } from 'react';
import { 
  Package, CheckCircle, Calendar, ChevronDown, ChevronRight,
  ShoppingCart, Printer, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/cn';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { YEARLY_PODS } from '../../data/yearlyPods';

// Material item type
interface MaterialItem {
  id: string;
  name: string;
  quantity?: string;
  category: 'supplies' | 'books' | 'equipment' | 'printables' | 'nature';
  estimatedCost?: string;
  amazonLink?: string;
  notes?: string;
}

// Materials by pod (would come from database in production)
const POD_MATERIALS: Record<string, MaterialItem[]> = {
  'pod-community': [
    { id: 'm1', name: 'Observation journal/notebook', category: 'supplies' },
    { id: 'm2', name: 'Colored pencils or markers', quantity: '12+ colors', category: 'supplies' },
    { id: 'm3', name: 'Large poster board', quantity: '2-3 sheets', category: 'supplies' },
    { id: 'm4', name: 'Camera or phone for photos', category: 'equipment' },
    { id: 'm5', name: 'Local area map (printable)', category: 'printables' },
    { id: 'm6', name: 'Interview question templates', category: 'printables' },
  ],
  'pod-migration': [
    { id: 'm7', name: 'Binoculars', category: 'equipment', notes: 'For bird watching' },
    { id: 'm8', name: 'Bird identification guide', category: 'books' },
    { id: 'm9', name: 'Nature journal', category: 'supplies' },
    { id: 'm10', name: 'World map (large)', category: 'supplies' },
    { id: 'm11', name: 'Push pins or stickers', quantity: '50+', category: 'supplies' },
    { id: 'm12', name: 'Migration tracking printables', category: 'printables' },
  ],
  'pod-food': [
    { id: 'm13', name: 'Seeds for planting', quantity: 'Various types', category: 'nature' },
    { id: 'm14', name: 'Small pots or containers', quantity: '5-10', category: 'supplies' },
    { id: 'm15', name: 'Potting soil', category: 'nature' },
    { id: 'm16', name: 'Measuring cups and spoons', category: 'equipment' },
    { id: 'm17', name: 'Recipe cards (blank)', quantity: '20+', category: 'supplies' },
    { id: 'm18', name: 'Food journal template', category: 'printables' },
  ],
  'pod-light': [
    { id: 'm19', name: 'Flashlights', quantity: '2-3', category: 'equipment' },
    { id: 'm20', name: 'Prisms or crystals', category: 'equipment' },
    { id: 'm21', name: 'Black construction paper', quantity: '20 sheets', category: 'supplies' },
    { id: 'm22', name: 'White paper', quantity: '50 sheets', category: 'supplies' },
    { id: 'm23', name: 'Cardboard boxes (various sizes)', category: 'supplies', notes: 'For camera obscura' },
    { id: 'm24', name: 'Aluminum foil', category: 'supplies' },
  ],
  'pod-time': [
    { id: 'm25', name: 'Sundial kit or materials', category: 'equipment' },
    { id: 'm26', name: 'Timer or stopwatch', category: 'equipment' },
    { id: 'm27', name: 'Calendar (blank)', category: 'printables' },
    { id: 'm28', name: 'Time capsule container', category: 'supplies' },
    { id: 'm29', name: 'History timeline template', category: 'printables' },
  ],
  'pod-communication': [
    { id: 'm30', name: 'Cipher wheel printable', category: 'printables' },
    { id: 'm31', name: 'Morse code chart', category: 'printables' },
    { id: 'm32', name: 'String and cups', quantity: 'For telephone', category: 'supplies' },
    { id: 'm33', name: 'Sign language alphabet poster', category: 'printables' },
    { id: 'm34', name: 'Stamps and ink pad', category: 'supplies' },
  ],
  'pod-patterns': [
    { id: 'm35', name: 'Graph paper', quantity: '50 sheets', category: 'supplies' },
    { id: 'm36', name: 'Ruler and compass', category: 'equipment' },
    { id: 'm37', name: 'Pattern blocks or tiles', category: 'equipment' },
    { id: 'm38', name: 'Nature collection bags', category: 'supplies' },
    { id: 'm39', name: 'Magnifying glass', category: 'equipment' },
  ],
  'pod-sustainability': [
    { id: 'm40', name: 'Recycling sorting bins', quantity: '3-4', category: 'equipment' },
    { id: 'm41', name: 'Gloves for cleanup', category: 'supplies' },
    { id: 'm42', name: 'Trash bags', quantity: '10+', category: 'supplies' },
    { id: 'm43', name: 'Upcycling craft supplies', category: 'supplies' },
    { id: 'm44', name: 'Data tracking sheets', category: 'printables' },
  ],
  'pod-shelter': [
    { id: 'm45', name: 'Building blocks or LEGO', category: 'equipment' },
    { id: 'm46', name: 'Popsicle sticks', quantity: '200+', category: 'supplies' },
    { id: 'm47', name: 'Glue gun and sticks', category: 'equipment' },
    { id: 'm48', name: 'Cardboard sheets', quantity: '10+', category: 'supplies' },
    { id: 'm49', name: 'Measuring tape', category: 'equipment' },
    { id: 'm50', name: 'Architecture books or printables', category: 'books' },
  ],
  'pod-water': [
    { id: 'm51', name: 'Water testing kit', category: 'equipment' },
    { id: 'm52', name: 'Clear containers', quantity: '5-10', category: 'supplies' },
    { id: 'm53', name: 'Food coloring', category: 'supplies' },
    { id: 'm54', name: 'Waterproof notebook', category: 'supplies' },
    { id: 'm55', name: 'Water cycle diagram', category: 'printables' },
  ],
  'pod-power': [
    { id: 'm56', name: 'Voting ballots (printable)', category: 'printables' },
    { id: 'm57', name: 'Debate timer', category: 'equipment' },
    { id: 'm58', name: 'Constitution summary printable', category: 'printables' },
    { id: 'm59', name: 'Campaign poster supplies', category: 'supplies' },
  ],
  'pod-survival': [
    { id: 'm60', name: 'Compass', category: 'equipment' },
    { id: 'm61', name: 'First aid kit (basic)', category: 'equipment' },
    { id: 'm62', name: 'Rope or paracord', quantity: '20 feet', category: 'supplies' },
    { id: 'm63', name: 'Survival guide book', category: 'books' },
    { id: 'm64', name: 'Nature identification cards', category: 'printables' },
  ],
};

const CATEGORY_ICONS: Record<string, string> = {
  supplies: '📦',
  books: '📚',
  equipment: '🔧',
  printables: '🖨️',
  nature: '🌱',
};

export const MaterialsPage: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([new Date().getMonth() + 1]));
  const [viewMode, setViewMode] = useState<'monthly' | 'all'>('monthly');

  const currentMonth = new Date().getMonth() + 1;

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleMonth = (month: number) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  const getMaterialsForPod = (podId: string): MaterialItem[] => {
    return POD_MATERIALS[podId] || [];
  };

  const getMonthProgress = (podId: string): { checked: number; total: number } => {
    const materials = getMaterialsForPod(podId);
    const checked = materials.filter(m => checkedItems.has(m.id)).length;
    return { checked, total: materials.length };
  };

  // Get upcoming months (current + next 2)
  const upcomingPods = YEARLY_PODS.filter(pod => {
    const monthDiff = pod.month - currentMonth;
    return monthDiff >= 0 && monthDiff <= 2;
  });

  // Calculate overall progress
  const allMaterials = Object.values(POD_MATERIALS).flat();
  const totalChecked = allMaterials.filter(m => checkedItems.has(m.id)).length;
  const overallProgress = Math.round((totalChecked / allMaterials.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-6 w-6 text-emerald-600" />
                <h1 className="text-2xl font-semibold text-slate-900">Materials Checklist</h1>
              </div>
              <p className="text-sm text-slate-600">
                Prepare materials in advance for each month's pod. Check items off as you gather them.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" icon={<Printer className="h-4 w-4" />}>
                Print List
              </Button>
              <Button variant="secondary" icon={<ShoppingCart className="h-4 w-4" />}>
                Shopping List
              </Button>
            </div>
          </div>
        </header>

        {/* Overall Progress */}
        <Card padding="lg" className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900">Year-Round Preparation</h2>
            <span className="text-2xl font-bold text-emerald-700">{overallProgress}%</span>
          </div>
          <ProgressBar value={overallProgress} variant="success" size="lg" />
          <p className="text-sm text-slate-600 mt-2">
            {totalChecked} of {allMaterials.length} items ready
          </p>
        </Card>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('monthly')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              viewMode === 'monthly'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Monthly View
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              viewMode === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            <Package className="h-4 w-4 inline mr-2" />
            All Materials
          </button>
        </div>

        {/* Upcoming Months Alert */}
        {upcomingPods.length > 0 && (
          <Card padding="md" className="mb-6 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Prepare Ahead</h3>
                <p className="text-sm text-amber-700">
                  Get materials ready for the next {upcomingPods.length} month(s): {' '}
                  {upcomingPods.map(p => p.title).join(', ')}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Monthly Materials */}
        <div className="space-y-4">
          {YEARLY_PODS.map((pod) => {
            const materials = getMaterialsForPod(pod.id);
            const progress = getMonthProgress(pod.id);
            const isExpanded = expandedMonths.has(pod.month);
            const isCurrentMonth = pod.month === currentMonth;
            const progressPercent = progress.total > 0 
              ? Math.round((progress.checked / progress.total) * 100) 
              : 0;

            return (
              <Card 
                key={pod.id} 
                className={cn(
                  'overflow-hidden transition-all',
                  isCurrentMonth && 'ring-2 ring-emerald-300'
                )}
              >
                {/* Month Header */}
                <button
                  onClick={() => toggleMonth(pod.month)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{pod.icon}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{pod.title}</h3>
                        {isCurrentMonth && (
                          <Badge variant="success" size="sm">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        Month {pod.month} • {materials.length} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {progress.checked}/{progress.total}
                      </p>
                      <ProgressBar 
                        value={progressPercent} 
                        size="sm" 
                        className="w-24"
                        variant={progressPercent === 100 ? 'success' : 'default'}
                      />
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Materials List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100"
                    >
                      <div className="p-4 bg-slate-50">
                        {/* Category Groups */}
                        {(['supplies', 'equipment', 'books', 'printables', 'nature'] as const).map(category => {
                          const categoryItems = materials.filter(m => m.category === category);
                          if (categoryItems.length === 0) return null;

                          return (
                            <div key={category} className="mb-4 last:mb-0">
                              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                                <span>{CATEGORY_ICONS[category]}</span>
                                {category}
                              </h4>
                              <div className="space-y-2">
                                {categoryItems.map((item) => {
                                  const isChecked = checkedItems.has(item.id);
                                  return (
                                    <div
                                      key={item.id}
                                      onClick={() => toggleItem(item.id)}
                                      className={cn(
                                        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all',
                                        isChecked
                                          ? 'bg-emerald-50 border border-emerald-200'
                                          : 'bg-white border border-slate-200 hover:border-slate-300'
                                      )}
                                    >
                                      <div className={cn(
                                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                                        isChecked
                                          ? 'bg-emerald-500 border-emerald-500 text-white'
                                          : 'border-slate-300'
                                      )}>
                                        {isChecked && <CheckCircle className="h-3 w-3" />}
                                      </div>
                                      <div className="flex-1">
                                        <p className={cn(
                                          'font-medium',
                                          isChecked ? 'text-slate-500 line-through' : 'text-slate-900'
                                        )}>
                                          {item.name}
                                        </p>
                                        {(item.quantity || item.notes) && (
                                          <p className="text-xs text-slate-500">
                                            {item.quantity}{item.quantity && item.notes && ' • '}{item.notes}
                                          </p>
                                        )}
                                      </div>
                                      {item.estimatedCost && (
                                        <span className="text-xs text-slate-400">
                                          ~{item.estimatedCost}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MaterialsPage;
