// Skill Level Configuration Data
// Re-exports from types for convenience + additional helpers

import { SKILL_LEVELS, SKILL_LEVEL_ORDER, getSkillLevel, getSkillLevelByAge } from '../types/skillLevel';
import type { SkillLevel, SkillLevelConfig } from '../types/skillLevel';

export { SKILL_LEVELS, SKILL_LEVEL_ORDER, getSkillLevel, getSkillLevelByAge };
export type { SkillLevel, SkillLevelConfig };

// Get all skill levels as array for iteration
export const getAllSkillLevels = (): SkillLevelConfig[] => {
  return SKILL_LEVEL_ORDER.map((level) => SKILL_LEVELS[level]);
};

// Get skill level options for select dropdowns
export const getSkillLevelOptions = () => {
  return getAllSkillLevels().map((level) => ({
    value: level.id,
    label: `${level.label} (${level.ageRange})`,
  }));
};

// Get recommended skill level based on age with explanation
export const getRecommendedSkillLevel = (age: number): { level: SkillLevel; reason: string } => {
  const level = getSkillLevelByAge(age);
  const config = SKILL_LEVELS[level];
  return {
    level,
    reason: `Recommended for ${config.ageRange} based on typical developmental stages`,
  };
};
