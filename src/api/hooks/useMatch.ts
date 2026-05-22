import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { matchService } from 'api/services/matchService';
import { Coordinates } from 'api/hooks/useLocation';
import ZustandPersist from 'zustand/persist';

export const MATCH_KEYS = {
  candidates: ['match', 'candidates'] as const,
  likedMe: ['match', 'likedMe'] as const,
};

export const useCandidates = (coords: Coordinates | null) => {
  return useInfiniteQuery({
    queryKey: [...MATCH_KEYS.candidates, coords?.latitude, coords?.longitude],
    queryFn: ({ pageParam }) =>
      matchService.getCandidates(coords!, 20, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!coords,
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
