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
  isMatch: boolean;
  matchId?: string;
}

type SwipeAction = 'LIKE' | 'PASS' | 'SUPERLIKE';

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

  like: async (toUserId: string): Promise<LikeResponse> => {
    const res = await apiClient.post<unknown>(ENDPOINTS.SWIPES.ACTION, {
      toUserId,
      action: 'LIKE' as SwipeAction,
    });
    const data = (res as any)?.data ?? res;
    return { isMatch: data?.isMatch ?? false, matchId: data?.matchId };
  },

  pass: async (toUserId: string): Promise<void> => {
    await apiClient.post<unknown>(ENDPOINTS.SWIPES.ACTION, {
      toUserId,
      action: 'PASS' as SwipeAction,
    });
  },

  superLike: async (toUserId: string): Promise<LikeResponse> => {
    const res = await apiClient.post<unknown>(ENDPOINTS.SWIPES.ACTION, {
      toUserId,
      action: 'SUPERLIKE' as SwipeAction,
    });
    const data = (res as any)?.data ?? res;
    return { isMatch: data?.isMatch ?? false, matchId: data?.matchId };
  },

  getLikedMe: async (): Promise<Candidate[]> => {
    const res = await apiClient.get<unknown>(ENDPOINTS.SWIPES.LIKED_ME);
    return (res as any)?.data ?? res ?? [];
  },

  getLikedByMe: async (): Promise<Candidate[]> => {
    const res = await apiClient.get<unknown>(ENDPOINTS.SWIPES.LIKED_BY_ME);
    return (res as any)?.data ?? res ?? [];
  },

  unmatch: async (matchId: string): Promise<void> => {
    await apiClient.patch<unknown>(ENDPOINTS.MATCHES.UNMATCH(matchId), {
      status: 'unmatched',
    });
  },
};
