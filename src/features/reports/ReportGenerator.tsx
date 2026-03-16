// Report Generator - Progress reports for homeschool documentation
import React, { useState } from 'react';
import { useFamily } from '../family/FamilyContext';
import { Card, CardHeader, CardContent, Button, Select } from '../../components/ui';
import type { Learner } from '../../types/learner';

type ReportPeriod = 'week' | 'month' | 'quarter' | 'year';
type ReportFormat = 'summary' | 'detailed' | 'transcript';

interface ReportData {
  learner: Learner;
  period: { start: string; end: string };
  stats: {
    totalDays: number;
    activeDays: number;
    totalBlocks: number;
    totalMinutes: number;
    totalPoints: number;
    podsCompleted: string[];
    competencyProgress: { name: string; progress: number }[];
  };
  activities: { date: string; subject: string; activity: string; duration: number }[];
}

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

export const ReportGenerator: React.FC = () => {
  const { family } = useFamily();
  const [selectedLearner, setSelectedLearner] = useState<string>('');
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [format, setFormat] = useState<ReportFormat>('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);


  const generateReport = async () => {
    if (!family || !selectedLearner) return;
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const learner = family.learners.find(l => l.id === selectedLearner);
    if (!learner) { setIsGenerating(false); return; }
    const endDate = new Date();
    const startDate = new Date();
    if (period === 'week') startDate.setDate(startDate.getDate() - 7);
    else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
    else if (period === 'quarter') startDate.setMonth(startDate.getMonth() - 3);
    else startDate.setFullYear(startDate.getFullYear() - 1);
    setReportData({
      learner,
      period: { start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] },
      stats: {
        totalDays: Math.floor((endDate.getTime() - startDate.getTime()) / 86400000),
        activeDays: 15, totalBlocks: 67, totalMinutes: 1450, totalPoints: learner.points,
        podsCompleted: ['Flight & Aerodynamics', 'Water Systems'],
        competencyProgress: [
          { name: 'Critical Thinking', progress: 72 }, { name: 'STEM Skills', progress: 85 },
          { name: 'Communication', progress: 65 }, { name: 'Creativity', progress: 78 },
        ],
      },
      activities: [
        { date: '2024-12-09', subject: 'Science', activity: 'Parachute Drop Test', duration: 45 },
        { date: '2024-12-08', subject: 'French', activity: 'Conversation Practice', duration: 20 },
      ],
    });
    setIsGenerating(false);
  };

  if (!family) return <div className="p-6 text-center text-gray-500">Please log in</div>;


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Reports</h1>
      <Card>
        <CardHeader><h2 className="text-lg font-semibold">Generate Report</h2></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select label="Learner" value={selectedLearner} onChange={(e) => setSelectedLearner(e.target.value)}
              options={[{ value: '', label: 'Select...' }, ...family.learners.map(l => ({ value: l.id, label: l.name }))]} />
            <Select label="Period" value={period} onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
              options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'quarter', label: 'Quarter' }, { value: 'year', label: 'Year' }]} />
            <Select label="Format" value={format} onChange={(e) => setFormat(e.target.value as ReportFormat)}
              options={[{ value: 'summary', label: 'Summary' }, { value: 'detailed', label: 'Detailed' }]} />
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
              <h2 className="text-xl font-bold">{reportData.learner.name} - Progress Report</h2>
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
                <StatBox label="Pods" value={reportData.stats.podsCompleted.length} />
              </div>
            </CardContent>
          </Card>
          {format === 'detailed' && (
            <Card>
              <CardHeader><h3 className="font-semibold">Activities</h3></CardHeader>
              <CardContent>
                {reportData.activities.map((a, i) => (
                  <div key={i} className="py-2 border-b last:border-0">
                    <span className="text-gray-500">{a.date}</span> - {a.subject}: {a.activity} ({a.duration}m)
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
// Force recompile
