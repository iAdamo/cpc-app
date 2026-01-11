import { useEffect } from "react";
import useGlobalStore from "@/store/globalStore";
import "../global.css";
import { socketService, PRESENCE_STATUS } from "@/services/socketService";
import { PresenceEvents } from "@/services/socketService";
import { AppState } from "react-native";
export { ErrorBoundary } from "expo-router";

export const useHeartbeat = () => {
  const { currentView, switchRole } = useGlobalStore();
  useEffect(() => {
    // console.log("from layout");
    const socketConnect = async () => {
      const socket = socketService;
      await socket.connect();
    };
    socketConnect();

    // Heartbeat every 30 seconds
    const interval = setInterval(() => {
      socketService.emitEvent(PresenceEvents.HEARTBEAT, {
        status: PRESENCE_STATUS.ONLINE,
        customStatus:
          useGlobalStore.getState().availability?.customStatus ||
          PRESENCE_STATUS.ONLINE,
        lastSeen: Date.now(),
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
        lastSeen: now,
      });
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      clearInterval(interval);
      subscription.remove();

      // socketService.offEvent(SocketEvents.CHAT_MESSAGE_SENT, handleNewMessage);

      // socketService.offEvent(SocketEvents.ERROR, handleMessageError);
    };
  }, [currentView, switchRole]);
};
