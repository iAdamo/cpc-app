import { useEffect, useState, useCallback, useRef } from "react";
import {
  socketService,
  SocketEvents,
  ChatEvents,
  PresenceEvents,
} from "@/services/socketService";
import { EventEnvelope, ResEventEnvelope } from "@/types";
import useGlobalStore from "@/store/globalStore";
import chatService from "@/services/chatService";
import { Message } from "@/types";
import { PresenceResponse } from "@/types";
import { AppState } from "react-native";

interface PresenceStatus {
  status: "online" | "offline" | "away" | string;
  lastSeen: number;
}

export function useMessageEvents(userId: string | undefined) {
  const [status, setStatus] = useState<PresenceStatus["status"]>("offline");
  const [lastSeen, setLastSeen] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const { loadMessages, selectedChat, messages, user } = useGlobalStore();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!selectedChat || !user) return;
    console.log("Initializing chat...");

    // Load initial messages
    loadMessages();

    // Join chat room via WebSocket
    chatService.joinChat(selectedChat);

    // Handle typing indicators
    const handleTyping = (envelope: any) => {
      const { userId: typingUserId, typing } = envelope.payload;
      if (typingUserId === userId) {
        setIsTyping(typing);
      }
    };

    // chatService.onNewMessage(handleNewMessage);
    chatService.onUserTyping(handleTyping);

    // Request current presence
    socketService.emitEvent(PresenceEvents.GET_STATUS, {
      targetId: userId,
    });

    const handleStatusResponse = (envelope: ResEventEnvelope) => {
      const data: PresenceResponse = envelope.payload;

      if (envelope.targetId !== userId || data.userId !== envelope.targetId)
        return;
      // console.log({ data });

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

      console.log("From status chang: 74 useMessageEvent", { data });

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
      // socketService.offEvent(SocketEvents.CHAT_MESSAGE_SENT, handleNewMessage);
    };
  }, [selectedChat, userId]);

  useEffect(() => {
    console.log("I ran");
    if (messages && messages.length > 0) {
      console.log("dddddddddddddddddddd", messages[0].status);
      const unreadMessages = messages.filter(
        (message) => !message.status.read.includes(user?._id!)
      );
      const messageIds = unreadMessages.map(
        (unreadMessage) => unreadMessage._id
      );
      if (messageIds.length > 0)
        socketService.emitEvent(ChatEvents.MARK_AS_READ, {
          chatId: selectedChat?._id,
          messageIds,
        });
    }
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [messages]);

  const handleAppStateChange = useCallback((nextAppState: string) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      const unreadMessageIds = messages
        .filter((message) => message.status.read.includes(user?._id!))
        .map((message) => message._id);

      socketService.emitEvent(ChatEvents.MARK_AS_READ, {
        chatId: selectedChat?._id,
        messageIds: unreadMessageIds,
      });
    }
  }, []);

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
