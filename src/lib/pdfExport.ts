// PDF Export Utility for Portfolios
// Uses browser print functionality for reliable cross-platform PDF generation

import type { Artifact } from '../types/artifact';
import type { Learner } from '../types/learner';
import type { LearnerCompetency, CompetencyDomain } from '../types/competency';
import { COMPETENCY_DOMAINS } from '../types/competency';
import { SKILL_LEVELS } from '../data/skillLevels';

interface PortfolioExportData {
  learner: Learner;
  artifacts: Artifact[];
  competencies: LearnerCompetency[];
  familyName: string;
  exportDate: Date;
}

// Generate HTML content for PDF
const generatePortfolioHTML = (data: PortfolioExportData): string => {
  const { learner, artifacts, competencies, familyName, exportDate } = data;
  const skillConfig = SKILL_LEVELS[learner.skillLevel];

  const competencyHTML = competencies
    .map((c) => {
      const domain = COMPETENCY_DOMAINS[c.domain as CompetencyDomain];
      return `
        <div class="competency-item">
          <span class="competency-icon">${domain?.icon || '📊'}</span>
          <span class="competency-name">${domain?.label || c.domain}</span>
          <span class="competency-level level-${c.level}">${c.level}</span>
        </div>
      `;
    })
    .join('');

  const artifactsHTML = artifacts
    .map(
      (artifact) => `
      <div class="artifact-card">
        <div class="artifact-header">
          <span class="artifact-type">${getArtifactIcon(artifact.type)} ${artifact.type}</span>
          <span class="artifact-date">${formatDate(artifact.createdAt)}</span>
        </div>
        <h3 class="artifact-title">${artifact.title}</h3>
        ${artifact.description ? `<p class="artifact-description">${artifact.description}</p>` : ''}
        ${artifact.reflection ? `
          <div class="artifact-reflection">
            <strong>Reflection:</strong> ${artifact.reflection}
          </div>
        ` : ''}
        ${artifact.competencies?.length ? `
          <div class="artifact-competencies">
            ${artifact.competencies.map((c) => {
              const domain = COMPETENCY_DOMAINS[c as CompetencyDomain];
              return `<span class="competency-tag">${domain?.icon || ''} ${domain?.label || c}</span>`;
            }).join('')}
          </div>
        ` : ''}
      </div>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${learner.name}'s Learning Portfolio</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1e293b;
          line-height: 1.6;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }
        .avatar {
          font-size: 64px;
          margin-bottom: 16px;
        }
        .learner-name {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
        }
        .family-name {
          font-size: 16px;
          color: #64748b;
          margin-bottom: 16px;
        }
        .learner-meta {
          display: flex;
          justify-content: center;
          gap: 24px;
          font-size: 14px;
          color: #475569;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .section {
          margin-bottom: 40px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .competencies-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .competency-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .competency-icon {
          font-size: 20px;
        }
        .competency-name {
          flex: 1;
          font-size: 14px;
        }
        .competency-level {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 500;
        }
        .level-beginning { background: #fef3c7; color: #92400e; }
        .level-developing { background: #dbeafe; color: #1e40af; }
        .level-proficient { background: #d1fae5; color: #065f46; }
        .level-exemplary { background: #fae8ff; color: #86198f; }
        .artifact-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          page-break-inside: avoid;
        }
        .artifact-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;
          color: #64748b;
        }
        .artifact-type {
          text-transform: capitalize;
        }
        .artifact-title {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 8px;
        }
        .artifact-description {
          font-size: 14px;
          color: #475569;
          margin-bottom: 12px;
        }
        .artifact-reflection {
          font-size: 14px;
          color: #475569;
          background: #fff;
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid #3b82f6;
          margin-bottom: 12px;
        }
        .artifact-competencies {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .competency-tag {
          font-size: 12px;
          padding: 4px 10px;
          background: #e0e7ff;
          color: #3730a3;
          border-radius: 12px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          text-align: center;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
        }
        .stat-label {
          font-size: 12px;
          color: #64748b;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }
        @media print {
          body { padding: 20px; }
          .artifact-card { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="avatar">${learner.avatar}</div>
        <h1 class="learner-name">${learner.name}'s Learning Portfolio</h1>
        <p class="family-name">${familyName}</p>
        <div class="learner-meta">
          <span class="meta-item">📅 Age ${learner.age}</span>
          <span class="meta-item">📚 ${skillConfig?.label || learner.skillLevel}</span>
          <span class="meta-item">⭐ ${learner.points} points</span>
          <span class="meta-item">🔥 ${learner.streakDays} day streak</span>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">📊 Summary</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${artifacts.length}</div>
            <div class="stat-label">Artifacts</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${competencies.length}</div>
            <div class="stat-label">Skills Tracked</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${learner.points}</div>
            <div class="stat-label">Points Earned</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${learner.streakDays}</div>
            <div class="stat-label">Day Streak</div>
          </div>
        </div>
      </div>

      ${competencies.length > 0 ? `
        <div class="section">
          <h2 class="section-title">🎯 Competencies</h2>
          <div class="competencies-grid">
            ${competencyHTML}
          </div>
        </div>
      ` : ''}

      <div class="section">
        <h2 class="section-title">📁 Portfolio Artifacts</h2>
        ${artifacts.length > 0 ? artifactsHTML : '<p style="color: #64748b;">No artifacts yet</p>'}
      </div>

      <div class="footer">
        <p>Generated by LumiPods on ${formatDate(exportDate.toISOString())}</p>
        <p>🚀 Portfolio-First Learning</p>
      </div>
    </body>
    </html>
  `;
};

const getArtifactIcon = (type: string): string => {
  const icons: Record<string, string> = {
    photo: '📷',
    video: '🎬',
    link: '🔗',
    document: '📄',
    code: '💻',
    presentation: '📊',
    project: '🏗️',
  };
  return icons[type] || '📁';
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Export portfolio as PDF using print dialog
export const exportPortfolioPDF = (data: PortfolioExportData): void => {
  const html = generatePortfolioHTML(data);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
};

// Export as HTML file (alternative to PDF)
export const exportPortfolioHTML = (data: PortfolioExportData): void => {
  const html = generatePortfolioHTML(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.learner.name.toLowerCase().replace(/\s+/g, '-')}-portfolio.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate shareable portfolio link (placeholder for future implementation)
export const generateShareableLink = async (data: PortfolioExportData): Promise<string> => {
  // In production, this would upload to a server and return a public URL
  console.log('Generating shareable link for:', data.learner.name);
  return `https://lumipods.app/portfolio/${data.learner.id}`;
};
