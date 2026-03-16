import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
  Package, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  Download
} from 'lucide-react';
import { week1ParachuteDropTest } from '../data/week1ParachuteDropTest';

const MaterialsManager: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showSafetyNotes, setShowSafetyNotes] = useState(true);

  const materials = week1ParachuteDropTest.materials;
  // Expose total count for Dashboard (quick integration without a store)
  try { (window as any).__W1_MATERIALS_TOTAL__ = materials.length; } catch {}
  const STORAGE_KEY = 'lumipods-week1-materials-checked';

  // Load persisted checked items
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        setCheckedItems(new Set(arr));
      }
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      const arr = Array.from(checkedItems);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch {}
  }, [checkedItems]);
  const safetyProtocols = week1ParachuteDropTest.safetyProtocols ?? [];

  const toggleItemCheck = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const getProgressStats = () => {
    const total = materials.length;
    const completed = materials.filter((item: { id: string }) => checkedItems.has(item.id)).length;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  const { completed, total, percentage } = getProgressStats();

  const generateShoppingList = () => {
    const uncheckedItems = materials.filter((item: { id: string }) => !checkedItems.has(item.id));
    const listText = uncheckedItems.map((item: { name: string; quantity: string; category: string }) => 
      `• ${item.name} (${item.quantity}) - ${item.category}`
    ).join('\n');
    
    const blob = new Blob([`LumiPods Week 1 Shopping List\n\n${listText}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lumipods-week1-shopping-list.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Shopping list downloaded');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Materials Manager 📦
            </h1>
            <p className="text-gray-600">
              Week 1: Parachute Drop Test - Equipment & Safety
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Materials Ready</div>
            <div className="text-2xl font-bold text-primary-600">
              {completed}/{total}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Preparation Progress</h2>
          <button
            onClick={generateShoppingList}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Shopping List
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">{Math.round(percentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary-600">{completed}</div>
            <div className="text-sm text-primary-700">Items Ready</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-amber-600">{total - completed}</div>
            <div className="text-sm text-amber-700">Still Needed</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{safetyProtocols.length}</div>
            <div className="text-sm text-green-700">Safety Protocols</div>
          </div>
        </div>
      </div>

      {/* Safety Protocols */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-amber-600 mr-3" />
            <h2 className="text-xl font-semibold text-amber-900">Safety Protocols</h2>
          </div>
          <button
            onClick={() => setShowSafetyNotes(!showSafetyNotes)}
            className="flex items-center px-3 py-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
          >
            {showSafetyNotes ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showSafetyNotes ? 'Hide' : 'Show'}
          </button>
        </div>

        {showSafetyNotes && (
          <div className="space-y-3">
            {safetyProtocols.map((protocol: string, index: number) => (
              <div key={index} className="flex items-start">
                <div className="w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-amber-800">{protocol}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Materials Checklist */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Materials Checklist
          </h2>
        </div>

        <div className="p-6">
          {/* Category Groups */}
          {['Basic Materials', 'Measurement Tools', 'Safety Equipment', 'Optional Enhancements'].map(category => {
            const categoryItems = materials.filter((item: { category: string }) => item.category === category);
            const categoryCompleted = categoryItems.filter((item: { id: string }) => checkedItems.has(item.id)).length;
            const categoryPercentage = categoryItems.length > 0 ? (categoryCompleted / categoryItems.length) * 100 : 0;

            return (
              <div key={category} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {categoryCompleted}/{categoryItems.length}
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${categoryPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {categoryItems.map((item: { id: string; name: string; quantity: string; description?: string; alternatives?: string[] }) => {
                    const isChecked = checkedItems.has(item.id);
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`flex items-center p-4 rounded-lg border transition-colors ${
                          isChecked 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <button
                          onClick={() => toggleItemCheck(item.id)}
                          className="mr-4"
                        >
                          {isChecked ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          ) : (
                            <Circle className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${isChecked ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                              {item.name}
                            </h4>
                            <span className="text-sm text-gray-600">{item.quantity}</span>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                          
                          {item.alternatives && item.alternatives.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">Alternatives: </span>
                              <span className="text-xs text-gray-600">
                                {item.alternatives.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={() => { setCheckedItems(new Set()); try { localStorage.removeItem(STORAGE_KEY); } catch {}; toast.success('All items reset'); }}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset All
        </button>
        <button
          onClick={() => { const all = new Set<string>(materials.map((item: { id: string }) => item.id)); setCheckedItems(all); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(all))); } catch {}; toast.success('All items marked ready'); }}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Mark All Ready
        </button>
      </div>
    </div>
  );
};

export default MaterialsManager;
