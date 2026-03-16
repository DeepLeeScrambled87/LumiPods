import React from 'react';
import { cn } from '../../lib/cn';
import { COMPETENCY_DOMAINS, COMPETENCY_LEVELS, getCompetencyProgress } from '../../types/competency';
import type { CompetencyDomain, CompetencyLevel, LearnerCompetency } from '../../types/competency';

interface CompetencyWheelProps {
  competencies: LearnerCompetency[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { outer: 120, inner: 40, stroke: 12 },
  md: { outer: 200, inner: 60, stroke: 20 },
  lg: { outer: 280, inner: 80, stroke: 28 },
};

export const CompetencyWheel: React.FC<CompetencyWheelProps> = ({
  competencies,
  size = 'md',
  showLabels = true,
  className,
}) => {
  const config = SIZE_CONFIG[size];
  const domains = Object.keys(COMPETENCY_DOMAINS) as CompetencyDomain[];
  const segmentAngle = 360 / domains.length;
  const radius = (config.outer - config.stroke) / 2;
  const center = config.outer / 2;

  const getCompetencyLevel = (domain: CompetencyDomain): CompetencyLevel => {
    const comp = competencies.find((c) => c.domain === domain);
    return comp?.level || 'beginning';
  };

  const polarToCartesian = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };

  const describeArc = (startAngle: number, endAngle: number, r: number) => {
    const start = polarToCartesian(endAngle, r);
    const end = polarToCartesian(startAngle, r);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  return (
    <div className={cn('relative', className)}>
      <svg width={config.outer} height={config.outer} viewBox={`0 0 ${config.outer} ${config.outer}`}>
        {/* Background segments */}
        {domains.map((domain, i) => {
          const startAngle = i * segmentAngle;
          const endAngle = startAngle + segmentAngle - 2; // Small gap between segments
          
          return (
            <path
              key={`bg-${domain}`}
              d={describeArc(startAngle, endAngle, radius)}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={config.stroke}
              strokeLinecap="round"
            />
          );
        })}

        {/* Progress segments */}
        {domains.map((domain, i) => {
          const level = getCompetencyLevel(domain);
          const progress = getCompetencyProgress(level) / 100;
          const startAngle = i * segmentAngle;
          const progressAngle = (segmentAngle - 2) * progress;
          const endAngle = startAngle + progressAngle;
          // Get color based on level
          const levelColors: Record<CompetencyLevel, string> = {
            beginning: '#94a3b8',
            developing: '#3b82f6',
            proficient: '#10b981',
            expert: '#8b5cf6',
          };

          return (
            <path
              key={`progress-${domain}`}
              d={describeArc(startAngle, endAngle, radius)}
              fill="none"
              stroke={levelColors[level]}
              strokeWidth={config.stroke}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          );
        })}

        {/* Center circle */}
        <circle cx={center} cy={center} r={config.inner} fill="white" stroke="#e2e8f0" strokeWidth="2" />
        
        {/* Center text */}
        <text x={center} y={center - 5} textAnchor="middle" className="text-xs font-medium fill-slate-900">
          {competencies.length}
        </text>
        <text x={center} y={center + 10} textAnchor="middle" className="text-[10px] fill-slate-500">
          skills
        </text>
      </svg>

      {/* Labels */}
      {showLabels && size !== 'sm' && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {domains.map((domain) => {
            const level = getCompetencyLevel(domain);
            const domainConfig = COMPETENCY_DOMAINS[domain];
            const levelConfig = COMPETENCY_LEVELS[level];

            return (
              <div key={domain} className="flex items-center gap-2 text-xs">
                <span>{domainConfig.icon}</span>
                <span className="text-slate-600 truncate">{domainConfig.label}</span>
                <span className={cn('ml-auto font-medium', levelConfig.color)}>
                  {levelConfig.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompetencyWheel;
