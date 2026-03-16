import React, { useState } from 'react';
import { useFamily } from '../family/FamilyContext';
import { Card, CardHeader, CardContent, Button, Select } from '../../components/ui';
import { progressDataService } from '../../services/dataService';

type ReportPeriod = 'week' | 'month' | 'quarter' | 'year';

const StatBox: React.FC<{ label: string; value: number | string; total?: number }> = ({ label, value, total }) => (
  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <div className="text-2xl font-bold text-gray-900 dark:text-white">
      {value}{total && <span className="text-sm font-normal text-gray-500">/{total}</span>}
    </div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const formatDateRange = (start: string, end: string): string => {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${new Date(start).toLocaleDateString('en-US', opts)} - ${new Date(end).toLocaleDateString('en-US', opts)}`;
};

const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
};

const ReportsPage: React.FC = () => {
  const { family } = useFamily();
  const [selectedLearner, setSelectedLearner] = useState<string>('');
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<{
    name: string;
    period: { start: string; end: string };
    stats: {
      totalDays: number;
      activeDays: number;
      totalBlocks: number;
      totalMinutes: number;
      totalPoints: number;
      avgBlocksPerDay: number;
      currentStreak: number;
    };
  } | null>(null);

  const generateReport = async () => {
    if (!family || !selectedLearner) return;
    setIsGenerating(true);

    try {
      const learner = family.learners.find((item) => item.id === selectedLearner);
      if (!learner) return;

      const endDate = new Date();
      const startDate = new Date();

      if (period === 'week') startDate.setDate(startDate.getDate() - 7);
      else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
      else if (period === 'quarter') startDate.setMonth(startDate.getMonth() - 3);
      else startDate.setFullYear(startDate.getFullYear() - 1);

      const days = Math.max(
        1,
        Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000)
      );

      const progress = await progressDataService.getForLearner(family.id, learner.id, days);

      const activeDays = progress.filter(
        (entry) => (entry.blocksCompleted || 0) > 0 || (entry.totalFocusMinutes || 0) > 0
      ).length;

      const totalBlocks = progress.reduce((sum, entry) => sum + (entry.blocksCompleted || 0), 0);
      const totalMinutes = progress.reduce((sum, entry) => sum + (entry.totalFocusMinutes || 0), 0);
      const totalPoints = progress.reduce((sum, entry) => sum + (entry.pointsEarned || 0), 0);
      const sortedProgress = [...progress].sort(
        (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
      );

      let currentStreak = 0;
      for (const entry of sortedProgress) {
        if ((entry.blocksCompleted || 0) > 0) {
          currentStreak += 1;
        } else {
          break;
        }
      }

      setReportData({
        name: learner.name,
        period: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
        stats: {
          totalDays: days,
          activeDays,
          totalBlocks,
          totalMinutes,
          totalPoints,
          avgBlocksPerDay: activeDays > 0 ? Math.round(totalBlocks / activeDays) : 0,
          currentStreak,
        },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!family) return <div className="p-6 text-center text-gray-500">Please log in</div>;


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Reports</h1>
      <Card>
        <CardHeader><h2 className="text-lg font-semibold">Generate Report</h2></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label="Learner" value={selectedLearner} onChange={(e) => setSelectedLearner(e.target.value)}
              options={[{ value: '', label: 'Select...' }, ...family.learners.map(l => ({ value: l.id, label: l.name }))]} />
            <Select label="Period" value={period} onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
              options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'quarter', label: 'Quarter' }, { value: 'year', label: 'Year' }]} />
            <div className="flex items-end">
              <Button onClick={generateReport} disabled={!selectedLearner || isGenerating} className="w-full">
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {reportData && (
        <div className="space-y-6">
          <Card>
            <CardContent>
              <h2 className="text-xl font-bold">{reportData.name} - Progress Report</h2>
              <p className="text-gray-500">{formatDateRange(reportData.period.start, reportData.period.end)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><h3 className="font-semibold">Statistics</h3></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatBox label="Active Days" value={reportData.stats.activeDays} total={reportData.stats.totalDays} />
                <StatBox label="Blocks" value={reportData.stats.totalBlocks} />
                <StatBox label="Time" value={formatMinutes(reportData.stats.totalMinutes)} />
                <StatBox label="Points" value={reportData.stats.totalPoints} />
                <StatBox label="Streak" value={reportData.stats.currentStreak} />
              </div>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Average pace: {reportData.stats.avgBlocksPerDay} blocks on active days.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
