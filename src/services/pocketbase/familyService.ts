// Family Service - PocketBase operations for families
import { pb, COLLECTIONS } from '../../lib/pocketbase';
import type { Family, FamilySettings } from '../../types/family';
import { DEFAULT_FAMILY_SETTINGS } from '../../types/family';

export interface PBFamily {
  id: string;
  name: string;
  owner: string;
  settings: FamilySettings;
  currentPodId: string | null;
  currentWeek: number;
  created: string;
  updated: string;
}

const mapPBToFamily = (pb: PBFamily): Family => ({
  id: pb.id,
  name: pb.name,
  learners: [], // Loaded separately
  currentPodId: pb.currentPodId,
  currentWeek: pb.currentWeek,
  settings: pb.settings || DEFAULT_FAMILY_SETTINGS,
  createdAt: pb.created,
  updatedAt: pb.updated,
});

export const familyService = {
  // Create a new family
  async create(name: string, ownerId: string): Promise<Family> {
    const record = await pb.collection(COLLECTIONS.FAMILIES).create<PBFamily>({
      name,
      owner: ownerId,
      settings: DEFAULT_FAMILY_SETTINGS,
      currentPodId: null,
      currentWeek: 1,
    });
    return mapPBToFamily(record);
  },

  // Get family by ID
  async getById(id: string): Promise<Family | null> {
    try {
      const record = await pb.collection(COLLECTIONS.FAMILIES).getOne<PBFamily>(id);
      return mapPBToFamily(record);
    } catch {
      return null;
    }
  },

  // Get family by owner
  async getByOwner(ownerId: string): Promise<Family | null> {
    try {
      const record = await pb.collection(COLLECTIONS.FAMILIES).getFirstListItem<PBFamily>(
        `owner="${ownerId}"`
      );
      return mapPBToFamily(record);
    } catch {
      return null;
    }
  },

  // Update family
  async update(id: string, data: Partial<Family>): Promise<Family> {
    const record = await pb.collection(COLLECTIONS.FAMILIES).update<PBFamily>(id, {
      name: data.name,
      settings: data.settings,
      currentPodId: data.currentPodId,
      currentWeek: data.currentWeek,
    });
    return mapPBToFamily(record);
  },

  // Update settings only
  async updateSettings(id: string, settings: Partial<FamilySettings>): Promise<Family> {
    const current = await this.getById(id);
    if (!current) throw new Error('Family not found');
    
    return this.update(id, {
      settings: { ...current.settings, ...settings },
    });
  },

  // Set current pod
  async setCurrentPod(id: string, podId: string | null, week: number = 1): Promise<Family> {
    return this.update(id, { currentPodId: podId, currentWeek: week });
  },

  // Delete family
  async delete(id: string): Promise<void> {
    await pb.collection(COLLECTIONS.FAMILIES).delete(id);
  },
};
