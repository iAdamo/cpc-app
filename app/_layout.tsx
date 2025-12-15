import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Slot } from "expo-router";
import { StatusBar, Platform } from "react-native";
import Toast from "react-native-toast-message";
import useGlobalStore from "@/store/globalStore";
import { ShareService } from "@/services/shareService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import {
  socketService,
  PRESENCE_STATUS,
  SocketEvents,
} from "@/services/socketService";
import { PresenceEvents } from "@/services/socketService";
import { AppState } from "react-native";
import chatService from "@/services/chatService";
import { replaceTempMessage } from "@/utils/InsertMessageIntoSections";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const checkForReferral = async () => {
    try {
      // Only check on Android
      if (Platform.OS === "android") {
        const referrerId = await ShareService.getInstallReferrer();

        if (referrerId) {
          await AsyncStorage.setItem("referrerId", referrerId);
          console.log("Found referrer:", referrerId);
        }
      }
    } catch (error) {
      console.error("Error checking for referral:", error);
      // Don't throw - we don't want to block app startup for referral errors
    }
  };

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Use proper error handling for the splash screen
      const prepare = async () => {
        try {
          await checkForReferral();
        } catch (e) {
          // Handle error but don't block app
          console.warn("Referral check failed, continuing anyway");
        } finally {
          // Always hide splash screen regardless of referral result
          await SplashScreen.hideAsync();
        }
      };

      prepare();
    }
  }, [loaded]);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const {
    error,
    success,
    clearError,
    clearSuccess,
    info,
    clearInfo,
    currentView,
    switchRole,
  } = useGlobalStore();
  useEffect(() => {
    console.log("from layout");
    const socketConnect = async () => {
      const socket = socketService;
      await socket.connect();
    };
    socketConnect();

    chatService.onNewMessage((envelope) => {
      console.log("from layout", envelope.payload);
      useGlobalStore.setState((state) => ({
        groupedMessages: replaceTempMessage(
          state.groupedMessages,
          envelope.payload
        ),
      }));
    });

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
  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: error,
        visibilityTime: 3000,
        onHide: clearError,
      });
    }
  }, [error, clearError]);

  useEffect(() => {
    if (success) {
      Toast.show({
        type: "success",
        text1: success,
        visibilityTime: 3000,
        onHide: clearSuccess,
      });
    }
  }, [success, clearSuccess]);

  useEffect(() => {
    if (info) {
      Toast.show({
        type: "info",
        text1: info,
        visibilityTime: 3000,
        onHide: clearInfo,
      });
    }
  }, [info, clearInfo]);

  return (
    <GluestackUIProvider>
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor={"transparent"}
      />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white", paddingTop: -50 }}
      >
        <Slot />
        <Toast position="bottom" />
      </SafeAreaView>
    </GluestackUIProvider>
  );
}
