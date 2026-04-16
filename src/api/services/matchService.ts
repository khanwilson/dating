import { Candidate, getCandidates } from 'src/data/mockCandidates';

export interface LikeResponse {
  matched: boolean;
  matchId?: string;
}

// Mock implementations — swap to real apiClient calls when backend is ready.
export const matchService = {
  getCandidates: (params: {
    lookingFor: string;
    ageMin: number;
    ageMax: number;
    maxDistanceKm: number;
    relationshipType: string;
    excludeIds: string[];
  }): Promise<Candidate[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ZustandPersist = require('zustand/persist').default;
        const state = ZustandPersist.getState();
        const results = getCandidates(
          state.matchPreferences,
          state.userProfile,
          state.iLiked ?? [],
          state.iPassed ?? [],
        );
        resolve(results);
      }, 400);
    });
  },

  like: (candidateId: string): Promise<LikeResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 20% chance of mutual match in mock
        const matched = Math.random() < 0.2;
        resolve({ matched, matchId: matched ? `match-${Date.now()}` : undefined });
      }, 300);
    });
  },

  pass: (candidateId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(resolve, 200);
    });
  },

  getLikedMe: (): Promise<Candidate[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { ALL_CANDIDATES } = require('src/data/mockCandidates');
        resolve(ALL_CANDIDATES.slice(5, 15));
      }, 400);
    });
  },
};
