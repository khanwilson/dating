import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService, SendMessageRequest } from 'api/services/chatService';

export const CHAT_KEYS = {
  conversations: ['chat', 'conversations'] as const,
  messages: (conversationId: string) => ['chat', 'messages', conversationId] as const,
};

export const useConversations = () => {
  return useQuery({
    queryKey: CHAT_KEYS.conversations,
    queryFn: () => chatService.getConversations(),
  });
};

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: CHAT_KEYS.messages(conversationId),
    queryFn: () => chatService.getMessages(conversationId),
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: SendMessageRequest) => chatService.sendMessage(req),
    onSuccess: (msg) => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.messages(msg.conversationId) });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.conversations });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => chatService.markAsRead(conversationId),
    onSuccess: (_result, conversationId) => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.conversations });
    },
  });
};
