import React from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { BottomNavbar, TopNavbar } from "@/components/providers/Navbar";
import useGlobalStore from "@/store/globalStore";

const ProvidersScreen = () => {
  const { currentView, setCurrentView } = useGlobalStore();
  return (
    <VStack className="flex-1 bg-white">
      <TopNavbar title="Service Providers" />
      <VStack className="flex-1 p-4">
        {currentView === "Home" && <Text>Home View</Text>}
        {currentView === "Updates" && <Text>Updates View</Text>}
        {currentView === "Chat" && <Text>Chat View</Text>}
        {currentView === "Profile" && <Text>Profile View</Text>}
      </VStack>
      <BottomNavbar />
    </VStack>
  );
};

export default ProvidersScreen;
