import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Layers } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { PodLibraryBrowser } from '../../components/pods/PodLibraryBrowser';
import { useFamily } from '../family';
import { ALL_PODS } from '../../data/pods';
import { POD_THEME_CONFIG } from '../../types/pod';

export const PodLibraryPage: React.FC = () => {
  const { family } = useFamily();
  const learners = family?.learners || [];
  const activePod = useMemo(
    () => ALL_PODS.find((pod) => pod.id === family?.currentPodId) || ALL_PODS[0] || null,
    [family?.currentPodId]
  );
  const [selectedPodId, setSelectedPodId] = useState(activePod?.id || '');

  useEffect(() => {
    if (!selectedPodId && activePod) {
      setSelectedPodId(activePod.id);
      return;
    }

    if (activePod && !ALL_PODS.some((pod) => pod.id === selectedPodId)) {
      setSelectedPodId(activePod.id);
    }
  }, [activePod, selectedPodId]);

  const selectedPod = ALL_PODS.find((pod) => pod.id === selectedPodId) || activePod;

  if (!selectedPod) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <Card className="p-8 text-center">
            <h1 className="text-xl font-semibold text-slate-900">Pod Library</h1>
            <p className="text-sm text-slate-500 mt-2">
              No pods are available yet. Add or enable a pod to start building the library.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const theme = POD_THEME_CONFIG[selectedPod.theme];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-slate-700" />
              <h1 className="text-2xl font-semibold text-slate-900">Pod Library</h1>
            </div>
            <p className="text-slate-600 mt-2 max-w-3xl">
              Browse the full learning material for each pod, manage support assets, and keep
              shared resources visible outside the Pods screen.
            </p>
          </div>
          <div className="min-w-[260px]">
            <Select
              label="Open pod library"
              value={selectedPod.id}
              onChange={(event) => setSelectedPodId(event.target.value)}
              options={ALL_PODS.map((pod) => ({
                value: pod.id,
                label: pod.title,
              }))}
            />
          </div>
        </header>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className={`rounded-2xl bg-gradient-to-br ${theme.bgGradient} p-4 text-white`}>
                <span className="text-3xl">{theme.icon}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.2em]">
                  {family?.currentPodId === selectedPod.id ? 'Active pod' : 'Selected pod'}
                </p>
                <h2 className="text-xl font-semibold text-slate-900 mt-1">{selectedPod.title}</h2>
                <p className="text-sm text-slate-600 mt-2 max-w-2xl">{selectedPod.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">
                <Layers className="h-3.5 w-3.5 mr-1" />
                {learners.length} learners
              </Badge>
              <Badge>{selectedPod.skillLevel || 'All levels'}</Badge>
              {family?.currentPodId === selectedPod.id ? <Badge variant="success">In rotation</Badge> : null}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <PodLibraryBrowser
            pod={selectedPod}
            familyId={family?.id}
            learners={learners}
          />
        </Card>
      </div>
    </div>
  );
};

export default PodLibraryPage;
