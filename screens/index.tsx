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
import { socketService } from "@/services/socketService";

const Screen = () => {
  const { currentView, switchRole } = useGlobalStore();

  useEffect(() => {
    const socketConnect = async () => {
      const socket = socketService;
      await socket.connect();
    };

    socketConnect();
  }, []);

  return (
    <VStack className="flex-1 bg-white">
      {currentView === "Home" ||
      (switchRole === "Provider" && currentView === "Updates") ? (
        <TopNavbar />
      ) : null}
      <VStack className="flex-1">
        {currentView === "Home" &&
          (switchRole === "Client" ? <HomeView /> : <Text>Provider Home</Text>)}
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
