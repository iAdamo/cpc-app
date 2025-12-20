import { useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { TopNavbar } from "@/components/layout/Navbar";
import useGlobalStore from "@/store/globalStore";
import HomeView from "./providers/home";
import ClientsUpdates from "./clients/update";
import ProfileView from "./profile";
import Chat from "./chat";
import Update from "./providers/update";
import MapView from "./map";
import PostJob from "./providers/post";
import { SocketEvents, socketService, PRESENCE_STATUS } from "@/services/socketService";
import { PresenceEvents } from "@/services/socketService";
import { AppState } from "react-native";
import { router } from "expo-router";

const Screen = () => {
  const { currentView, switchRole } = useGlobalStore();

  return (
    <VStack className="flex-1 bg-white">
      {currentView === "Home" ||
      (switchRole === "Provider" && currentView === "Updates") ? (
        <TopNavbar />
      ) : null}
      <VStack className="flex-1">
        {currentView === "Home" &&
          (switchRole === "Client" ? <HomeView /> : <Text>Coming Soon...</Text>)}
        {currentView === "Updates" &&
          (switchRole === "Client" ? <Update /> : <ClientsUpdates />)}
        {currentView === "Chat" && <Chat />}
        {currentView === "Profile" && <ProfileView />}
        {currentView === "Map" && <MapView />}
        {currentView === "Job-Post" && <PostJob />}
      </VStack>
    </VStack>
  );
};

export default Screen;
