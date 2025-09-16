import React from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { TopNavbar } from "@/components/layout/Navbar";
import useGlobalStore from "@/store/globalStore";
import HomeView from "./providers/home";
import ProfileView from "./profile";

const Screen = () => {
  const { currentView, setCurrentView } = useGlobalStore();

  return (
    <VStack className="flex-1 bg-white">
      {currentView === "Home" && <TopNavbar />}
      <VStack className="flex-1">
        {currentView === "Home" && <HomeView />}
        {currentView === "Updates" && <Text>Updates View</Text>}
        {currentView === "Chat" && <Text>Chat View</Text>}
        {currentView === "Profile" && <ProfileView />}
      </VStack>
    </VStack>
  );
};

export default Screen;
