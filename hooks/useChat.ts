import { useEffect, useCallback, useMemo } from "react";
import { socketService, ChatEvents } from "@/services/socketService";
import useGlobalStore from "@/store/globalStore";
import { Message, Chat } from "@/types";
import chatService from "@/services/chatService";

export const useChat = () => {
  const { user, chats } = useGlobalStore();

  const userId = user?._id;

  /* ---------------- SOCKET HANDLERS ---------------- */

  const handleNewMessage = useCallback(
    (envelope: any) => {
      if (!userId) return;

      const message: Message = envelope.payload;
      const chatId = message.chatId;
      if (!chatId) return;

      useGlobalStore.setState((state) => {
        const updatedChats = [...state.chats];
        const index = updatedChats.findIndex((c) => c._id === chatId);

        // Message from self → no unread increment
        const shouldIncrement = message.senderId !== userId;

        if (index !== -1) {
          const chat = updatedChats[index];

          updatedChats[index] = {
            ...chat,
            lastMessage: {
              messageId: message._id,
              text: message.content?.text ?? "",
              sender: message.senderId,
              createdAt: message.createdAt as string,
            },
            unreadCounts: {
              ...chat.unreadCounts,
              [userId]: shouldIncrement
                ? (chat.unreadCounts?.[userId] ?? 0) + 1
                : chat.unreadCounts?.[userId] ?? 0,
            },
          };
        } else {
          // New chat
          updatedChats.push({
            _id: chatId,
            participants: [],
            type: "direct",
            lastMessage: {
              messageId: message._id,
              text: message.content?.text ?? "",
              sender: message.senderId,
              createdAt: message.createdAt as string,
            },
            unreadCounts: {
              [userId]: shouldIncrement ? 1 : 0,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Chat);
        }

        return { chats: updatedChats };
      });
    },
    [userId]
  );

  const handleUnreadCountUpdate = useCallback(
    (envelope: any) => {
      if (!userId) return;

      const { chatId, unreadCounts } = envelope.payload;

      useGlobalStore.setState((state) => ({
        chats: state.chats.map((chat) =>
          chat._id === chatId ? { ...chat, unreadCounts } : chat
        ),
      }));
    },
    [userId]
  );

  const handleMessageRead = useCallback(
    (envelope: any) => {
      if (!userId) return;

      const { chatId, userId: readerId } = envelope.payload;
      if (readerId !== userId) return;

      useGlobalStore.setState((state) => ({
        chats: state.chats.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                unreadCounts: {
                  ...chat.unreadCounts,
                  [userId]: 0,
                },
              }
            : chat
        ),
      }));
    },
    [userId]
  );

  /* ---------------- EFFECT: SOCKET BINDINGS ---------------- */

  useEffect(() => {
    if (!userId) return;

    socketService.onEvent(ChatEvents.MESSAGE_SENT, handleNewMessage);
    socketService.onEvent(
      ChatEvents.UNREAD_COUNT_UPDATED,
      handleUnreadCountUpdate
    );
    socketService.onEvent(ChatEvents.MARK_AS_READ, handleMessageRead);

    return () => {
      socketService.offEvent(ChatEvents.MESSAGE_SENT, handleNewMessage);
      socketService.offEvent(
        ChatEvents.UNREAD_COUNT_UPDATED,
        handleUnreadCountUpdate
      );
      socketService.offEvent(ChatEvents.MARK_AS_READ, handleMessageRead);
      chatService.leaveCurrentChat();
    };
  }, [userId, handleNewMessage, handleUnreadCountUpdate, handleMessageRead]);

  /* ---------------- DERIVED TOTAL UNREAD ---------------- */

  const totalUnread = useMemo(() => {
    if (!userId) return 0;
    return chats.reduce(
      (sum, chat) => sum + (chat.unreadCounts?.[userId] ?? 0),
      0
    );
  }, [chats, userId]);

  return {
    totalUnread,
    isLoading: !user,
  };
};
