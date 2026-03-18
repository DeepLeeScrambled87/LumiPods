import { appwriteConfig, appwriteHeaders, isAppwriteConfigured } from '../lib/appwrite';
import { pb, COLLECTIONS, isPocketBaseConfigured } from '../lib/pocketbase';
import type { Family } from '../types/family';
import { familyDataService, learnerDataService } from './dataService';
import { getDataBackendKind } from './documentBackendClient';

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

  if (
    message.includes('Failed to authenticate') ||
    message.includes('Invalid credentials') ||
    message.includes('user_invalid_credentials')
  ) {
    return 'Those credentials did not match a parent account. Check your email and password.';
  }

  if (message.includes('No family found for this parent account')) {
    return 'Your account signed in, but no family is linked to it yet. Use Create Account or reconnect this account to a family record.';
  }

  if (
    message.includes('already exists') ||
    message.includes('user_already_exists') ||
    message.includes('A user with the same id, email, or phone already exists')
  ) {
    return 'An account with that email already exists. Sign in instead or use password recovery.';
  }

  if (
    message.includes('PocketBase server') ||
    message.includes('Failed to fetch') ||
    message.includes('NetworkError')
  ) {
    return 'The account server could not be reached. Check your connection and try again.';
  }

  return message || fallback;
};

const getCurrentPocketBaseParentRecord = (): ParentAuthRecord => {
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

const appwriteAccountRequest = async (
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  const response = await fetch(`${appwriteConfig.endpoint}${path}`, {
    method,
    headers: appwriteHeaders(),
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const text = await response.text();
  const json = text ? (JSON.parse(text) as Record<string, unknown>) : {};

  if (!response.ok) {
    throw new Error(
      typeof json.message === 'string' ? json.message : `Appwrite request failed (${response.status})`
    );
  }

  return json;
};

const getCurrentAppwriteParentRecord = async (): Promise<ParentAuthRecord> => {
  const account = await appwriteAccountRequest('GET', '/account');

  return {
    id: String(account.$id || account.id || ''),
    email: String(account.email || ''),
    name: typeof account.name === 'string' && account.name ? account.name : undefined,
  };
};

const loadFamilyForParent = async (ownerUserId: string): Promise<Family> => {
  const family = await familyDataService.getByOwnerUserId(ownerUserId);
  if (!family) {
    throw new Error('No family found for this parent account');
  }

  const learners = await learnerDataService.getByFamily(family.id);
  return { ...family, learners };
};

const pocketBaseParentAuthService = {
  async signIn(email: string, password: string): Promise<ParentSession> {
    try {
      await pb.collection(COLLECTIONS.USERS).authWithPassword(normalizeEmail(email), password);

      const parent = getCurrentPocketBaseParentRecord();
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

      const parent = getCurrentPocketBaseParentRecord();
      const family = await familyDataService.create(input.familyName, parent.id);

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
      throw new Error(mapParentAuthError(error, 'Unable to start password recovery right now.'));
    }
  },

  async restoreSession(): Promise<ParentSession | null> {
    if (!pb.authStore.isValid) {
      return null;
    }

    const parent = getCurrentPocketBaseParentRecord();
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

const appwriteParentAuthService = {
  async signIn(email: string, password: string): Promise<ParentSession> {
    try {
      await appwriteAccountRequest('POST', '/account/sessions/email', {
        email: normalizeEmail(email),
        password,
      });

      const parent = await getCurrentAppwriteParentRecord();
      const family = await loadFamilyForParent(parent.id);

      return {
        parentId: parent.id,
        parentName: parent.name || parent.email,
        email: parent.email,
        family,
      };
    } catch (error) {
      try {
        await appwriteAccountRequest('DELETE', '/account/sessions/current');
      } catch {
        // Ignore failed cleanup
      }

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

      await appwriteAccountRequest('POST', '/account', {
        userId: 'unique()',
        email,
        password: input.password,
        name: input.parentName,
      });

      await appwriteAccountRequest('POST', '/account/sessions/email', {
        email,
        password: input.password,
      });

      const parent = await getCurrentAppwriteParentRecord();
      const family = await familyDataService.create(input.familyName, parent.id);

      return {
        parentId: parent.id,
        parentName: input.parentName || parent.email,
        email: parent.email,
        family,
      };
    } catch (error) {
      try {
        await appwriteAccountRequest('DELETE', '/account/sessions/current');
      } catch {
        // Ignore failed cleanup
      }

      throw new Error(mapParentAuthError(error, 'Unable to create your parent account right now.'));
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await appwriteAccountRequest('POST', '/account/recovery', {
        email: normalizeEmail(email),
        url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      });
    } catch (error) {
      throw new Error(mapParentAuthError(error, 'Unable to start password recovery right now.'));
    }
  },

  async restoreSession(): Promise<ParentSession | null> {
    try {
      const parent = await getCurrentAppwriteParentRecord();

      if (!parent.id || !parent.email) {
        return null;
      }

      const family = await loadFamilyForParent(parent.id);

      return {
        parentId: parent.id,
        parentName: parent.name || parent.email,
        email: parent.email,
        family,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('missing scope') ||
          error.message.includes('general_unauthorized_scope') ||
          error.message.includes('guest') ||
          error.message.includes('unauthorized') ||
          error.message.includes('not be reached'))
      ) {
        return null;
      }

      throw error;
    }
  },

  async signOut(): Promise<void> {
    try {
      await appwriteAccountRequest('DELETE', '/account/sessions/current');
    } catch {
      // Ignore sign-out failures for expired sessions
    }
  },
};

export const parentAuthService = {
  async signIn(email: string, password: string): Promise<ParentSession> {
    if (getDataBackendKind() === 'appwrite' && isAppwriteConfigured()) {
      return appwriteParentAuthService.signIn(email, password);
    }

    if (isPocketBaseConfigured()) {
      return pocketBaseParentAuthService.signIn(email, password);
    }

    throw new Error('No account backend is configured for parent sign in.');
  },

  async signUp(input: {
    parentName: string;
    email: string;
    password: string;
    familyName: string;
  }): Promise<ParentSession> {
    if (getDataBackendKind() === 'appwrite' && isAppwriteConfigured()) {
      return appwriteParentAuthService.signUp(input);
    }

    if (isPocketBaseConfigured()) {
      return pocketBaseParentAuthService.signUp(input);
    }

    throw new Error('No account backend is configured for parent account creation.');
  },

  async requestPasswordReset(email: string): Promise<void> {
    if (getDataBackendKind() === 'appwrite' && isAppwriteConfigured()) {
      return appwriteParentAuthService.requestPasswordReset(email);
    }

    if (isPocketBaseConfigured()) {
      return pocketBaseParentAuthService.requestPasswordReset(email);
    }

    throw new Error('No account backend is configured for password recovery.');
  },

  async restoreSession(): Promise<ParentSession | null> {
    if (getDataBackendKind() === 'appwrite' && isAppwriteConfigured()) {
      return appwriteParentAuthService.restoreSession();
    }

    if (isPocketBaseConfigured()) {
      return pocketBaseParentAuthService.restoreSession();
    }

    return null;
  },

  async signOut(): Promise<void> {
    if (getDataBackendKind() === 'appwrite' && isAppwriteConfigured()) {
      await appwriteParentAuthService.signOut();
      return;
    }

    if (isPocketBaseConfigured()) {
      pocketBaseParentAuthService.signOut();
    }
  },
};
