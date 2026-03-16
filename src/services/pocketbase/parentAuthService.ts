import type { Family } from '../../types/family';
import { pb, COLLECTIONS } from '../../lib/pocketbase';
import { familyService } from './familyService';
import { learnerService } from './learnerService';

interface ParentAuthRecord {
  id: string;
  email: string;
  name?: string;
}

export interface ParentSession {
  parentId: string;
  parentName: string;
  email: string;
  family: Family;
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const mapParentAuthError = (error: unknown, fallback: string): string => {
  const message =
    typeof error === 'object' &&
    error &&
    'message' in error &&
    typeof error.message === 'string'
      ? error.message
      : fallback;

  if (message.includes('Failed to authenticate')) {
    return 'Those credentials did not match a parent account. Check your email and password.';
  }

  if (message.includes('No family found for this parent account')) {
    return 'Your account signed in, but no family is linked to it yet. Use Create Account or reconnect this account to a family record.';
  }

  if (message.includes('already exists')) {
    return 'An account with that email already exists. Sign in instead or use password recovery.';
  }

  if (message.includes('Failed to connect to the PocketBase server')) {
    return 'The account server could not be reached. Check that PocketBase is running and try again.';
  }

  return message || fallback;
};

const getCurrentParentRecord = (): ParentAuthRecord => {
  const model = pb.authStore.model as Record<string, unknown> | null;

  if (!model?.id || !model?.email) {
    throw new Error('Parent session is not available');
  }

  return {
    id: model.id as string,
    email: model.email as string,
    name: (model.name as string) || undefined,
  };
};

const loadFamilyForParent = async (ownerId: string): Promise<Family> => {
  const family = await familyService.getByOwner(ownerId);
  if (!family) {
    throw new Error('No family found for this parent account');
  }

  const learners = await learnerService.getByFamily(family.id);
  return { ...family, learners };
};

export const parentAuthService = {
  async signIn(email: string, password: string): Promise<ParentSession> {
    try {
      await pb.collection(COLLECTIONS.USERS).authWithPassword(normalizeEmail(email), password);

      const parent = getCurrentParentRecord();
      const family = await loadFamilyForParent(parent.id);

      return {
        parentId: parent.id,
        parentName: parent.name || parent.email,
        email: parent.email,
        family,
      };
    } catch (error) {
      pb.authStore.clear();
      throw new Error(mapParentAuthError(error, 'Unable to sign in right now.'));
    }
  },

  async signUp(input: {
    parentName: string;
    email: string;
    password: string;
    familyName: string;
  }): Promise<ParentSession> {
    try {
      const email = normalizeEmail(input.email);

      await pb.collection(COLLECTIONS.USERS).create({
        email,
        password: input.password,
        passwordConfirm: input.password,
        emailVisibility: true,
        name: input.parentName,
      });

      await pb.collection(COLLECTIONS.USERS).authWithPassword(email, input.password);

      const parent = getCurrentParentRecord();
      const family = await familyService.create(input.familyName, parent.id);

      return {
        parentId: parent.id,
        parentName: input.parentName || parent.email,
        email: parent.email,
        family,
      };
    } catch (error) {
      pb.authStore.clear();
      throw new Error(mapParentAuthError(error, 'Unable to create your parent account right now.'));
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await pb.collection(COLLECTIONS.USERS).requestPasswordReset(normalizeEmail(email));
    } catch (error) {
      throw new Error(
        mapParentAuthError(error, 'Unable to start password recovery right now.')
      );
    }
  },

  async restoreSession(): Promise<ParentSession | null> {
    if (!pb.authStore.isValid) {
      return null;
    }

    const parent = getCurrentParentRecord();
    const family = await loadFamilyForParent(parent.id);

    return {
      parentId: parent.id,
      parentName: parent.name || parent.email,
      email: parent.email,
      family,
    };
  },

  signOut(): void {
    pb.authStore.clear();
  },
};
