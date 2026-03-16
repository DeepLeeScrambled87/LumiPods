// Curriculum data exports
export { FLIGHT_CURRICULUM } from './flightCurriculum';
export { ATOMIC_FOUNDATIONS_CURRICULUM } from './atomicFoundationsCurriculum';
export { HUMAN_BODY_SYSTEMS_CURRICULUM } from './humanBodySystemsCurriculum';
export {
  ALGEBRA_DATA_SIMULATION_CURRICULUM,
  MODELLING_CALCULUS_ML_CURRICULUM,
  NUMBER_SENSE_PATTERNS_CURRICULUM,
  RATIOS_GRAPHS_MODELLING_CURRICULUM,
} from './mathsPodCurricula';

import { FLIGHT_CURRICULUM } from './flightCurriculum';
import { ATOMIC_FOUNDATIONS_CURRICULUM } from './atomicFoundationsCurriculum';
import { HUMAN_BODY_SYSTEMS_CURRICULUM } from './humanBodySystemsCurriculum';
import {
  ALGEBRA_DATA_SIMULATION_CURRICULUM,
  MODELLING_CALCULUS_ML_CURRICULUM,
  NUMBER_SENSE_PATTERNS_CURRICULUM,
  RATIOS_GRAPHS_MODELLING_CURRICULUM,
} from './mathsPodCurricula';
import type { PodCurriculum } from '../../types/curriculum';

// All pod curricula - add more as they're created
export const ALL_CURRICULA: PodCurriculum[] = [
  FLIGHT_CURRICULUM,
  ATOMIC_FOUNDATIONS_CURRICULUM,
  HUMAN_BODY_SYSTEMS_CURRICULUM,
  NUMBER_SENSE_PATTERNS_CURRICULUM,
  RATIOS_GRAPHS_MODELLING_CURRICULUM,
  ALGEBRA_DATA_SIMULATION_CURRICULUM,
  MODELLING_CALCULUS_ML_CURRICULUM,
];

export const getCurriculumByPodId = (podId: string): PodCurriculum | undefined => {
  return ALL_CURRICULA.find((c) => c.podId === podId);
};

export const getCurriculumByMonth = (month: number): PodCurriculum | undefined => {
  return ALL_CURRICULA.find((c) => c.monthNumber === month);
};
