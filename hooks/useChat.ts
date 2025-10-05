// hooks/useChat.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { Chat, Message, UserData } from "@/types";
import chatService  from "@/services/chatService";

interface UseChatReturn {
  chats: Chat[];
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendTextMessage: (text: string, replyTo?: string) => void;
  sendMediaMessage: (type: Message["type"], file: any, options?: any) => void;
  loadMoreMessages: () => void;
  markAsDelivered: () => void;
  startTyping: () => void;
  stopTyping: () => void;
  typingUsers: string[];
  hasMoreMessages: boolean;
}

export const useChat = (chatId?: string): UseChatReturn => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const currentPage = useRef(1);

  // Load user's chats
  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      const userChats = await chatService.getUserChats();
      setChats(userChats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chats");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for specific chat
  const loadMessages = useCallback(
    async (page: number = 1) => {
      if (!chatId) return;

      try {
        setLoading(true);
        const chatMessages = await chatService.getChatMessages(chatId, page);

        if (page === 1) {
          setMessages(chatMessages);
        } else {
          setMessages((prev) => [...chatMessages, ...prev]);
        }

        setHasMoreMessages(chatMessages.length === 100); // Assuming limit is 100
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load messages"
        );
      } finally {
        setLoading(false);
      }
    },
    [chatId]
  );

  // Real-time message handling
  useEffect(() => {
    if (!chatId) return;

    // Join chat room
    chatService.joinChat(chatId);

    // Load initial messages
    loadMessages(1);

    // Set up real-time listeners
    const handleNewMessage = (data: { message: Message }) => {
      setMessages((prev) => [data.message, ...prev]);

      // Update chats list with new last message
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId ? { ...chat, lastMessage: data.message } : chat
        )
      );
    };

    const handleUserTyping = (data: { userId: string; typing: boolean }) => {
      setTypingUsers((prev) =>
        data.typing
          ? [...prev.filter((id) => id !== data.userId), data.userId]
          : prev.filter((id) => id !== data.userId)
      );
    };

    const handleMessageError = (error: any) => {
      setError(error.message || "Failed to send message");
    };

    chatService.onNewMessage(handleNewMessage);
    chatService.onUserTyping(handleUserTyping);
    chatService.onMessageError(handleMessageError);

    return () => {
      chatService.leaveCurrentChat();
      chatService.offEvent("new_message", handleNewMessage);
      chatService.offEvent("user_typing", handleUserTyping);
      chatService.offEvent("message_error", handleMessageError);
    };
  }, [chatId, loadMessages]);

  // Initial load
  useEffect(() => {
    loadChats();
    chatService.connect();

    return () => {
      chatService.disconnect();
    };
  }, [loadChats]);

  const sendTextMessage = useCallback(
    async (text: string, replyTo?: string) => {
      if (!chatId) return;

      try {
        await chatService.sendTextMessage(chatId, text, replyTo);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
      }
    },
    [chatId]
  );

  const sendMediaMessage = useCallback(
    async (type: Message["type"], file: any, options?: any) => {
      if (!chatId) return;

      try {
        setLoading(true);

        // Upload file first
        const uploadResult = await chatService.uploadFile(file);

        // Send media message
        await chatService.sendMediaMessage(
          chatId,
          type,
          uploadResult.data.url,
          { ...options, size: file.size, type: file.type }
        );

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send media");
      } finally {
        setLoading(false);
      }
    },
    [chatId]
  );

  const loadMoreMessages = useCallback(() => {
    if (hasMoreMessages && !loading) {
      currentPage.current += 1;
      loadMessages(currentPage.current);
    }
  }, [hasMoreMessages, loading, loadMessages]);

  const markAsDelivered = useCallback(() => {
    if (chatId) {
      chatService.markMessagesAsDelivered(chatId);
    }
  }, [chatId]);

  const startTyping = useCallback(() => {
    if (chatId) {
      chatService.startTyping(chatId);
    }
  }, [chatId]);

  const stopTyping = useCallback(() => {
    if (chatId) {
      chatService.stopTyping(chatId);
    }
  }, [chatId]);

  return {
    chats,
    messages,
    loading,
    error,
    sendTextMessage,
    sendMediaMessage,
    loadMoreMessages,
    markAsDelivered,
    startTyping,
    stopTyping,
    typingUsers,
    hasMoreMessages,
  };
};
