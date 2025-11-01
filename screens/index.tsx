import React from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { TopNavbar } from "@/components/layout/Navbar";
import useGlobalStore from "@/store/globalStore";
import HomeView from "./providers/home";
import TaskDisplay from "./clients/home";
import ProfileView from "./profile";
import Chat from "./chat";
import Update from "./providers/update";
import MapView from "./map";
import PostJob from "./providers/post";

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
          (switchRole === "Client" ? <HomeView /> : <Text>Provider Home</Text>)}
        {currentView === "Updates" &&
          (switchRole === "Client" ? <Update /> : <TaskDisplay />)}
        {currentView === "Chat" && <Chat />}
        {currentView === "Profile" && <ProfileView />}
        {currentView === "Map" && <MapView />}
        {currentView === "Job-Post" && <PostJob />}
      </VStack>
    </VStack>
  );
};

export default Screen;
