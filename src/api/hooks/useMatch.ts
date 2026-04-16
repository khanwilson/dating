import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { matchService } from 'api/services/matchService';
import ZustandPersist from 'zustand/persist';
import { useShallow } from 'zustand/react/shallow';

export const MATCH_KEYS = {
  candidates: ['match', 'candidates'] as const,
  likedMe: ['match', 'likedMe'] as const,
};

export const useCandidates = () => {
  const prefs = ZustandPersist(useShallow((s) => s.matchPreferences));

  return useQuery({
    queryKey: [...MATCH_KEYS.candidates, prefs],
    queryFn: () =>
      matchService.getCandidates({
        lookingFor: prefs?.lookingFor ?? 'everyone',
        ageMin: prefs?.ageMin ?? 18,
        ageMax: prefs?.ageMax ?? 80,
        maxDistanceKm: prefs?.maxDistanceKm ?? 200,
        relationshipType: prefs?.relationshipType ?? 'long_term',
        excludeIds: [
          ...(ZustandPersist.getState().iLiked ?? []),
          ...(ZustandPersist.getState().iPassed ?? []),
        ],
      }),
    enabled: !!prefs,
  });
};

export const useLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (candidateId: string) => matchService.like(candidateId),
    onSuccess: (_result, candidateId) => {
      ZustandPersist.getState().addLiked(candidateId);
      queryClient.invalidateQueries({ queryKey: MATCH_KEYS.candidates });
    },
  });
};

export const usePass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (candidateId: string) => matchService.pass(candidateId),
    onSuccess: (_result, candidateId) => {
      ZustandPersist.getState().addPassed(candidateId);
      queryClient.invalidateQueries({ queryKey: MATCH_KEYS.candidates });
    },
  });
};

export const useLikedMe = () => {
  return useQuery({
    queryKey: MATCH_KEYS.likedMe,
    queryFn: () => matchService.getLikedMe(),
  });
};
