import React from 'react';
import { Eye, Star, MessageCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ARTIFACT_TYPE_CONFIG } from '../../types/artifact';
import { COMPETENCY_DOMAINS } from '../../types/competency';
import type { Artifact } from '../../types/artifact';
import type { Learner } from '../../types/learner';

interface ArtifactCardProps {
  artifact: Artifact;
  learner?: Learner;
  onClick?: () => void;
  showLearner?: boolean;
  className?: string;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({
  artifact,
  learner,
  onClick,
  showLearner = false,
  className,
}) => {
  const typeConfig = ARTIFACT_TYPE_CONFIG[artifact.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-slate-100">
        {artifact.thumbnailUrl ? (
          <img
            src={artifact.thumbnailUrl}
            alt={artifact.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">{typeConfig.icon}</span>
          </div>
        )}
        
        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="default" size="sm">
            {typeConfig.icon} {typeConfig.label}
          </Badge>
        </div>

        {/* Featured star */}
        {artifact.isFeatured && (
          <div className="absolute top-2 right-2">
            <Star className="h-5 w-5 text-amber-400 fill-current" />
          </div>
        )}

        {/* External link indicator */}
        {artifact.url && (
          <div className="absolute bottom-2 right-2">
            <ExternalLink className="h-4 w-4 text-white drop-shadow" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Learner info */}
        {showLearner && learner && (
          <div className="flex items-center gap-2 mb-2">
            <Avatar emoji={learner.avatar} size="xs" />
            <span className="text-xs text-slate-500">{learner.name}</span>
          </div>
        )}

        <h3 className="font-medium text-slate-900 mb-1 line-clamp-1">{artifact.title}</h3>
        
        {artifact.description && (
          <p className="text-sm text-slate-500 mb-3 line-clamp-2">{artifact.description}</p>
        )}

        {/* Competencies */}
        {artifact.competencies && artifact.competencies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {artifact.competencies.slice(0, 3).map((comp) => (
              <span
                key={comp}
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full',
                  COMPETENCY_DOMAINS[comp]?.color || 'bg-slate-100 text-slate-600'
                )}
              >
                {COMPETENCY_DOMAINS[comp]?.icon} {COMPETENCY_DOMAINS[comp]?.label}
              </span>
            ))}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{new Date(artifact.createdAt).toLocaleDateString()}</span>
          <div className="flex items-center gap-3">
            {artifact.feedbackReceived && artifact.feedbackReceived.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {artifact.feedbackReceived.length}
              </span>
            )}
            {artifact.visibility === 'public' && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Public
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArtifactCard;
