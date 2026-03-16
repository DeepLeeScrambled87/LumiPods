import React from 'react';
import { Modal } from '../ui/Modal';
import { PodLibraryBrowser } from './PodLibraryBrowser';
import type { Learner } from '../../types/learner';
import type { Pod } from '../../types/pod';

interface PodLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pod: Pod | null;
  familyId?: string;
  learners: Learner[];
}

export const PodLibraryModal: React.FC<PodLibraryModalProps> = ({
  isOpen,
  onClose,
  pod,
  familyId,
  learners,
}) => {
  if (!pod) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${pod.title} Library`}
      description="Browse the real learning material, sources, and uploaded pod assets."
      size="full"
    >
      <div className="pr-1">
        <PodLibraryBrowser pod={pod} familyId={familyId} learners={learners} />
      </div>
    </Modal>
  );
};

export default PodLibraryModal;
