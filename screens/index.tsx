import React from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { TopNavbar } from "@/components/layout/Navbar";
import useGlobalStore from "@/store/globalStore";
import HomeView from "./providers/home";
import TaskDisplay from "./clients/home";
import ProfileView from "./profile";
import Chat from "./chat";
import { router } from "expo-router";

const Screen = () => {
  const { currentView, setCurrentView, switchRole } = useGlobalStore();

  return (
    <VStack className="flex-1 bg-white">
      {currentView === "Home" && <TopNavbar />}
      <VStack className="flex-1">
        {currentView === "Home" &&
          (switchRole === "Client" ? <HomeView /> : <TaskDisplay />)}
        {currentView === "Updates" &&
          (switchRole === "Client" ? (
            <Text>Client Updates View</Text>
          ) : (
            <Text>Provider Updates View</Text>
          ))}
        {currentView === "Chat" && switchRole === "Client" && <Chat />}
        {currentView === "Profile" && <ProfileView />}
      </VStack>
    </VStack>
  );
};

export default Screen;
