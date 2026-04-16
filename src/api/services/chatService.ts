export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  participantId: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface SendMessageRequest {
  conversationId: string;
  text: string;
}

// Mock implementations — swap to real apiClient + WebSocket when backend is ready.
export const chatService = {
  getConversations: (): Promise<Conversation[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock: return empty, ChatScreen builds its own local state from iLiked
        resolve([]);
      }, 300);
    });
  },

  getMessages: (conversationId: string, params?: { before?: number; limit?: number }): Promise<ChatMessage[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 300);
    });
  },

  sendMessage: (req: SendMessageRequest): Promise<ChatMessage> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `msg-${Date.now()}`,
          conversationId: req.conversationId,
          senderId: 'me',
          text: req.text,
          timestamp: Date.now(),
          status: 'sent',
        });
      }, 400);
    });
  },

  markAsRead: (conversationId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(resolve, 200);
    });
  },
};
