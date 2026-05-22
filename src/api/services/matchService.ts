import { apiClient } from 'api/axios/client';
import { ENDPOINTS } from 'api/axios/config';
import { Gender, RelationshipType, Zodiac } from 'constants/enum';
import { Coordinates } from 'api/hooks/useLocation';

export interface Candidate {
  id: string;
  displayName: string;
  age: number;
  distanceKm: number;
  photos: { url: string; order: number }[];
  gender?: Gender;
  zodiac?: Zodiac;
  interests?: string[];
  bio?: string;
  relationshipType?: RelationshipType;
}

export interface CandidatesPage {
  candidates: Candidate[];
  nextCursor: string | null;
}

export interface LikeResponse {
  matched: boolean;
  matchId?: string;
}

export const matchService = {
  getCandidates: async (
    coords: Coordinates,
    limit = 20,
    cursor?: string,
  ): Promise<CandidatesPage> => {
    const params: Record<string, string | number> = {
      lat: coords.latitude,
      lng: coords.longitude,
      limit,
    };
    if (cursor) params.cursor = cursor;
    const response = await apiClient.get<{ data: Candidate[]; nextCursor: string | null }>(
      ENDPOINTS.SWIPES.CANDIDATES,
      { params },
    );
    return { candidates: response.data, nextCursor: response.nextCursor };
  },

  like: (candidateId: string): Promise<LikeResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
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
    return Promise.resolve([]);
  },
};
