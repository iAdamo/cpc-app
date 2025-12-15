import { PresenceEvents } from "./../services/socketService";
import { useEffect, useState, useCallback } from "react";
import {
  socketService,
  SocketEvents,
  ChatEvents,
} from "@/services/socketService";
import { EventEnvelope, ResEventEnvelope } from "@/types";
import useGlobalStore from "@/store/globalStore";
import chatService from "@/services/chatService";
import { Message } from "@/types";
import { PresenceResponse } from "@/types";

interface PresenceStatus {
  status: "online" | "offline" | "away" | string;
  lastSeen: number;
}

export function useMessageEvents(userId: string | undefined) {
  const [status, setStatus] = useState<PresenceStatus["status"]>("offline");
  const [lastSeen, setLastSeen] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const { loadMessages, selectedChat, addNewMessage, replaceTempMessage } =
    useGlobalStore();

  useEffect(() => {
    if (!selectedChat) return;
    console.log("Initializing chat...");

    // Load initial messages
    loadMessages();

    // Join chat room via WebSocket
    chatService.joinChat(selectedChat);

    // Handle incoming messages
    const handleNewMessage = (envelope: any) => {
      const message = envelope.payload as Message;

      if (message.chatId === selectedChat._id) {
        // Check if this is replacing a temp message
        const { messages } = useGlobalStore.getState();
        const existingTemp = messages.find(
          (m) =>
            m.isOptimistic &&
            m.senderId._id === message.senderId._id &&
            Math.abs(
              new Date(m.createdAt).getTime() -
                new Date(message.createdAt).getTime()
            ) < 5000
        );

        if (existingTemp) {
          replaceTempMessage(existingTemp._id, message);
        } else {
          addNewMessage(message);
        }
      }
    };

    // Handle typing indicators
    const handleTyping = (envelope: any) => {
      const { userId: typingUserId, typing } = envelope.payload;
      if (typingUserId === userId) {
        setIsTyping(typing);
      }
    };

    chatService.onNewMessage(handleNewMessage);
    chatService.onUserTyping(handleTyping);

    // Request current presence
    socketService.emitEvent(PresenceEvents.GET_STATUS, {
      targetId: userId,
    });

    const handleStatusResponse = (envelope: ResEventEnvelope) => {
      const data: PresenceResponse = envelope.payload;

      if (envelope.targetId !== userId || data.userId !== envelope.targetId)
        return;

      setIsOnline(data.isOnline ? data.isOnline : false);
      setLastSeen(
        data.lastSeen && data.status === "offline"
          ? data.lastSeen.toString()
          : ""
      );
      setStatus(data.status === "offline" ? data.status : data.customStatus);
    };

    // When presence changes
    const handleStatusChange = (envelope: EventEnvelope) => {
      const data = envelope.payload;

      setIsOnline(data.isOnline ? data.isOnline : false);
      setLastSeen(data.lastSeen ? data.lastSeen.toString() : "");
      setStatus(data.status === "offline" ? data.status : data.customStatus);
    };

    socketService.onEvent(PresenceEvents.STATUS_CHANGE, handleStatusChange);
    socketService.onEvent(PresenceEvents.STATUS_RESPONSE, handleStatusResponse);

    return () => {
      socketService.offEvent(PresenceEvents.STATUS_CHANGE, handleStatusChange);
      socketService.offEvent(
        PresenceEvents.STATUS_RESPONSE,
        handleStatusResponse
      );

      // Clear chat service listeners
      chatService.leaveCurrentChat();
      socketService.offEvent(ChatEvents.TYPING_INDICATOR, handleTyping);
      socketService.offEvent(SocketEvents.CHAT_MESSAGE_SENT, handleNewMessage);
    };
  }, [selectedChat, userId, addNewMessage, replaceTempMessage]);

  // Update my own status
  const updateStatus = useCallback(
    (newStatus: string, customStatus?: string) => {
      socketService.emitEvent(PresenceEvents.UPDATE_STATUS, {
        status: newStatus,
        customStatus,
      });
    },
    []
  );

  // Batch presence lookup
  const getBatchStatus = useCallback(async (userIds: string[]) => {
    const responsePromise = socketService.onceEvent<{
      users: Array<{
        userId: string;
        status: string;
        lastSeen: number;
      }>;
    }>(PresenceEvents.BATCH_STATUS_RESPONSE);

    await socketService.emitEvent(PresenceEvents.GET_BATCH_STATUS, {
      userIds,
    });

    const envelope = await responsePromise;
    return envelope.payload;
  }, []);

  return {
    isTyping,
    status,
    lastSeen,
    isOnline,
    updateStatus,
    getBatchStatus,
  };
}
