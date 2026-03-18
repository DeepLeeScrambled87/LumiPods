import { addNotification } from './notificationService';
import { storage } from '../lib/storage';

export const POD_INTEREST_REQUESTS_UPDATED_EVENT = 'lumipods:pod-interest-requests-updated';

export interface PodInterestRequest {
  id: string;
  familyId: string;
  learnerId: string;
  learnerName: string;
  podId: string;
  podTitle: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'dismissed';
}

const STORAGE_KEY = 'pod-interest-requests';

const dispatchUpdated = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(POD_INTEREST_REQUESTS_UPDATED_EVENT));
};

const getAllRequests = (): PodInterestRequest[] => storage.get<PodInterestRequest[]>(STORAGE_KEY, []);

const saveAllRequests = (requests: PodInterestRequest[]): void => {
  storage.set(STORAGE_KEY, requests);
  dispatchUpdated();
};

export const podInterestService = {
  getByFamily(familyId: string): PodInterestRequest[] {
    return getAllRequests()
      .filter((request) => request.familyId === familyId)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  },

  getPendingByFamily(familyId: string): PodInterestRequest[] {
    return this.getByFamily(familyId).filter((request) => request.status === 'pending');
  },

  hasPendingRequest(familyId: string, learnerId: string, podId: string): boolean {
    return this.getPendingByFamily(familyId).some(
      (request) => request.learnerId === learnerId && request.podId === podId
    );
  },

  requestPod(params: {
    familyId: string;
    learnerId: string;
    learnerName: string;
    podId: string;
    podTitle: string;
  }): PodInterestRequest {
    const existing = this.getPendingByFamily(params.familyId).find(
      (request) => request.learnerId === params.learnerId && request.podId === params.podId
    );

    if (existing) {
      return existing;
    }

    const nextRequest: PodInterestRequest = {
      id: `pod-request-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      familyId: params.familyId,
      learnerId: params.learnerId,
      learnerName: params.learnerName,
      podId: params.podId,
      podTitle: params.podTitle,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    saveAllRequests([nextRequest, ...getAllRequests()]);
    addNotification(
      'activity',
      'Pod Request',
      `${params.learnerName} is interested in ${params.podTitle}. Review it in Pods.`,
      {
        learnerId: params.learnerId,
      }
    );

    return nextRequest;
  },

  resolveRequest(requestId: string, status: 'approved' | 'dismissed'): PodInterestRequest | null {
    let resolvedRequest: PodInterestRequest | null = null;

    const nextRequests = getAllRequests().map((request) => {
      if (request.id !== requestId) {
        return request;
      }

      resolvedRequest = {
        ...request,
        status,
      };
      return resolvedRequest;
    });

    saveAllRequests(nextRequests);
    return resolvedRequest;
  },

  resolveMatchingRequests(
    familyId: string,
    podId: string,
    learnerIds: string[],
    status: 'approved' | 'dismissed'
  ): void {
    if (learnerIds.length === 0) {
      return;
    }

    const learnerIdSet = new Set(learnerIds);
    const nextRequests = getAllRequests().map((request) => {
      if (
        request.familyId !== familyId ||
        request.podId !== podId ||
        request.status !== 'pending' ||
        !learnerIdSet.has(request.learnerId)
      ) {
        return request;
      }

      return {
        ...request,
        status,
      };
    });

    saveAllRequests(nextRequests);
  },
};

export default podInterestService;
