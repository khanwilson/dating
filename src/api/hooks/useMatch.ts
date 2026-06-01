import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { matchService } from 'api/services/matchService';
import { Coordinates } from 'api/hooks/useLocation';
import ZustandPersist from 'zustand/persist';

export const MATCH_KEYS = {
  candidates: ['match', 'candidates'] as const,
  likedMe: ['match', 'likedMe'] as const,
  likedByMe: ['match', 'likedByMe'] as const,
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
  return useMutation({
    mutationFn: (candidateId: string) => matchService.like(candidateId),
    onSuccess: (_result, candidateId) => {
      ZustandPersist.getState().addLiked(candidateId);
    },
  });
};

export const usePass = () => {
  return useMutation({
    mutationFn: (candidateId: string) => matchService.pass(candidateId),
    onSuccess: (_result, candidateId) => {
      ZustandPersist.getState().addPassed(candidateId);
    },
  });
};

export const useSuperLike = () => {
  return useMutation({
    mutationFn: (candidateId: string) => matchService.superLike(candidateId),
    onSuccess: (_result, candidateId) => {
      ZustandPersist.getState().addLiked(candidateId);
    },
  });
};

export const useLikedMe = () => {
  return useQuery({
    queryKey: MATCH_KEYS.likedMe,
    queryFn: () => matchService.getLikedMe(),
  });
};

export const useLikedByMe = () => {
  return useQuery({
    queryKey: MATCH_KEYS.likedByMe,
    queryFn: () => matchService.getLikedByMe(),
  });
};

export const useUnmatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => matchService.unmatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCH_KEYS.likedMe });
      queryClient.invalidateQueries({ queryKey: MATCH_KEYS.likedByMe });
    },
  });
};
