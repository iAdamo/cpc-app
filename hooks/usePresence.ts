import { PresenceEvents } from "./../services/socketService";
import { useEffect, useState, useCallback } from "react";
import { AppState } from "react-native";
import {
  socketService,
  SocketEvents,
  ChatEvents,
} from "@/services/socketService";
import { EventEnvelope, ResEventEnvelope } from "@/types";
import useGlobalStore from "@/store/globalStore";
import chatService from "@/services/chatService";
import { Message, MessageSection } from "@/types";

interface PresenceStatus {
  status: "online" | "offline" | "away" | string;
  lastSeen: number;
}

export function usePresence(userId: string | undefined) {
  const [status, setStatus] = useState<PresenceStatus["status"]>("offline");
  const [lastSeen, setLastSeen] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const {
    selectedChat,
    loadMessages,
  } = useGlobalStore();

  useEffect(() => {
    if (!userId) return;

    if (!selectedChat) return;
    console.log("Initializing chat...");

    // Join chat room via WebSocket
    chatService.joinChat(selectedChat);

    // Load initial messages
    loadMessages(1);

    const handleNewMessage = ({ message }: { message: Message }) => {
      // remove all optimistic messages
      useGlobalStore.setState((state) => ({
        groupedMessages: state.groupedMessages.map(
          (section: MessageSection) => ({
            ...section,
            data: section.data.filter((msg) => !msg.isOptimistic),
          })
        ),
      }));

      // add to groupMessage without duplicates
      useGlobalStore.setState((state) => ({
        groupedMessages: (() => {
          const todayTitle = "Today";
          const existingSection = state.groupedMessages.find(
            (section: MessageSection) => section.title === todayTitle
          );
          if (existingSection) {
            // Avoid duplicates
            if (
              existingSection.data.find(
                (msg: Message) => msg._id === message._id
              )
            ) {
              return state.groupedMessages;
            }
            return state.groupedMessages.map((section: MessageSection) =>
              section.title === todayTitle
                ? { ...section, data: [message, ...section.data] }
                : section
            );
          } else {
            return [
              { title: todayTitle, data: [message] },
              ...state.groupedMessages,
            ];
          }
        })(),
      }));
    };

    const handleMessageError = (error: any) => {
      console.error("Message error:", error);
    };

    // Set up event listeners
    chatService.onNewMessage((envelope) => {
      const message = envelope.payload.message;
      handleNewMessage({ message });
    });
    chatService.onUserTyping((envelop) => {
      const isTyping = envelop.payload.typing;
      setIsTyping(isTyping);
    });
    chatService.onMessageError(handleMessageError);

    // Request current presence
    socketService.emitEvent(PresenceEvents.GET_STATUS, {
      targetId: userId,
    });

    // When presence changes
    const handleStatusChange = (envelope: EventEnvelope) => {
      // console.log("change", { envelope });

      const data = envelope.payload;
      if (data.userId !== userId) return;
      console.log(envelope.payload);

      setStatus(data.status);
      setLastSeen(data.lastSeen);
      setIsOnline(data.status === "online");
    };

    // 4️⃣ Initial response for get_status
    const handleStatusResponse = (envelope: ResEventEnvelope) => {
      const data = envelope.payload;

      if (envelope.targetId !== userId || !envelope.payload) return;

      setStatus(data.status);
      setLastSeen(data.lastSeen);
      setIsOnline(data.status === "online");
    };

    socketService.onEvent(PresenceEvents.STATUS_CHANGE, handleStatusChange);
    socketService.onEvent(PresenceEvents.STATUS_RESPONSE, handleStatusResponse);

    // Heartbeat every 30 seconds
    const interval = setInterval(() => {
      socketService.emitEvent(PresenceEvents.HEARTBEAT, {
        timestamp: Date.now(),
      });
    }, 25000);

    // AppState activity detection
    let lastActivity = 0;

    const handleAppStateChange = (nextState: string) => {
      const now = Date.now();
      if (now - lastActivity < 2000) return; // ignore spam
      lastActivity = now;

      socketService.emitEvent(PresenceEvents.USER_ACTIVITY, {
        state: nextState,
        timestamp: now,
      });
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      socketService.offEvent(PresenceEvents.STATUS_CHANGE, handleStatusChange);
      socketService.offEvent(
        PresenceEvents.STATUS_RESPONSE,
        handleStatusResponse
      );

      clearInterval(interval);
      subscription.remove();

      socketService.emitEvent(PresenceEvents.UNSUBSCRIBE, {
        userIds: [userId],
      });

      console.log("Cleaning up chat...");
      chatService.leaveCurrentChat();
      socketService.offEvent(SocketEvents.CHAT_MESSAGE_SENT, handleNewMessage);
      socketService.offEvent(ChatEvents.TYPING_INDICATOR, (envelop) => {
        const isTyping = envelop.payload.typing;
        setIsTyping(isTyping);
      });
      socketService.offEvent(SocketEvents.ERROR, handleMessageError);
    };
  }, [userId, selectedChat]);

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
    // Wait for a single response event
    const responsePromise = socketService.onceEvent<{
      users: Array<{
        userId: string;
        status: string;
        lastSeen: number;
      }>;
    }>(PresenceEvents.BATCH_STATUS_RESPONSE);

    // Trigger the request
    await socketService.emitEvent(PresenceEvents.GET_BATCH_STATUS, {
      userIds,
    });

    // Wait and return the envelope payload
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
