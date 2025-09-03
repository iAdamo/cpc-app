import React from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { BottomNavbar, TopNavbar } from "@/components/providers/Navbar";
import useGlobalStore from "@/store/globalStore";
import HomeView from "./homeview";
import Profile from "./profile";

const ProvidersScreen = () => {
  const { currentView, setCurrentView } = useGlobalStore();

  return (
    <VStack className="flex-1 bg-white">
      {currentView === "Home" && <TopNavbar title="Service Providers" />}
      <VStack className="flex-1">
        {currentView === "Home" && <HomeView />}
        {currentView === "Updates" && <Text>Updates View</Text>}
        {currentView === "Chat" && <Text>Chat View</Text>}
        {currentView === "Profile" && <Profile />}
      </VStack>
      <BottomNavbar />
    </VStack>
  );
};

export default ProvidersScreen;
