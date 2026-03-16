// Learner Service - PocketBase operations for learners
import { pb, COLLECTIONS } from '../../lib/pocketbase';
import type { Learner, LearnerPreferences } from '../../types/learner';
import type { SkillLevel } from '../../types/skillLevel';

export interface PBLearner {
  id: string;
  family: string;
  name: string;
  age: number;
  skillLevel: SkillLevel;
  avatar: string;
  pin?: string;
  points: number;
  streakDays: number;
  preferences: LearnerPreferences | null;
  created: string;
  updated: string;
}

const mapPBToLearner = (pb: PBLearner): Learner => ({
  id: pb.id,
  name: pb.name,
  age: pb.age,
  skillLevel: pb.skillLevel,
  avatar: pb.avatar,
  pin: pb.pin || undefined,
  points: pb.points,
  streakDays: pb.streakDays,
  preferences: pb.preferences || undefined,
  createdAt: pb.created,
  updatedAt: pb.updated,
});

export const learnerService = {
  // Create a new learner
  async create(
    familyId: string,
    name: string,
    age: number,
    skillLevel: SkillLevel,
    avatar: string,
    pin?: string
  ): Promise<Learner> {
    const record = await pb.collection(COLLECTIONS.LEARNERS).create<PBLearner>({
      family: familyId,
      name,
      age,
      skillLevel,
      avatar,
      pin: pin || '',
      points: 0,
      streakDays: 0,
      preferences: null,
    });
    return mapPBToLearner(record);
  },

  // Get all learners for a family
  async getByFamily(familyId: string): Promise<Learner[]> {
    const records = await pb.collection(COLLECTIONS.LEARNERS).getFullList<PBLearner>({
      filter: `family="${familyId}"`,
      sort: 'name',
    });
    return records.map(mapPBToLearner);
  },

  // Get learner by ID
  async getById(id: string): Promise<Learner | null> {
    try {
      const record = await pb.collection(COLLECTIONS.LEARNERS).getOne<PBLearner>(id);
      return mapPBToLearner(record);
    } catch {
      return null;
    }
  },

  // Update learner
  async update(id: string, data: Partial<Learner>): Promise<Learner> {
    const record = await pb.collection(COLLECTIONS.LEARNERS).update<PBLearner>(id, {
      name: data.name,
      age: data.age,
      skillLevel: data.skillLevel,
      avatar: data.avatar,
      pin: data.pin,
      points: data.points,
      streakDays: data.streakDays,
      preferences: data.preferences,
    });
    return mapPBToLearner(record);
  },

  // Add points
  async addPoints(id: string, points: number): Promise<Learner> {
    const learner = await this.getById(id);
    if (!learner) throw new Error('Learner not found');
    return this.update(id, { points: learner.points + points });
  },

  // Deduct points (for rewards)
  async deductPoints(id: string, points: number): Promise<Learner | null> {
    const learner = await this.getById(id);
    if (!learner || learner.points < points) return null;
    return this.update(id, { points: learner.points - points });
  },

  // Update streak
  async incrementStreak(id: string): Promise<Learner> {
    const learner = await this.getById(id);
    if (!learner) throw new Error('Learner not found');
    return this.update(id, { streakDays: learner.streakDays + 1 });
  },

  async resetStreak(id: string): Promise<Learner> {
    return this.update(id, { streakDays: 0 });
  },

  // Delete learner
  async delete(id: string): Promise<void> {
    await pb.collection(COLLECTIONS.LEARNERS).delete(id);
  },
};
