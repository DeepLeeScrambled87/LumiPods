export const LEARNER_POINTS_AWARDED_EVENT = 'lumipods:learner-points-awarded';

export interface LearnerPointsAwardDetail {
  familyId: string;
  learnerId: string;
  points: number;
  label: string;
  description: string;
  timestamp: string;
}

export const announceLearnerPointsAward = (detail: LearnerPointsAwardDetail): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(LEARNER_POINTS_AWARDED_EVENT, {
      detail,
    })
  );
};
