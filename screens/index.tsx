import React from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { TopNavbar } from "@/components/layout/Navbar";
import useGlobalStore from "@/store/globalStore";
import HomeView from "./providers/home";
import ProfileView from "./profile";

const Screen = () => {
  const { currentView, setCurrentView, switchRole } = useGlobalStore();

  return (
    <VStack className="flex-1 bg-white">
      {currentView === "Home" && <TopNavbar />}
      <VStack className="flex-1">
        {currentView === "Home" &&
          (switchRole === "Client" ? (
            <HomeView />
          ) : (
            <Text>Provider Home View</Text>
          ))}
        {currentView === "Updates" &&
          (switchRole === "Client" ? (
            <Text>Client Updates View</Text>
          ) : (
            <Text>Provider Updates View</Text>
          ))}
        {currentView === "Chat" &&
          (switchRole === "Client" ? (
            <Text>Client Messages View</Text>
          ) : (
            <Text>Provider Messages View</Text>
          ))}
        {currentView === "Profile" && <ProfileView />}
      </VStack>
    </VStack>
  );
};

export default Screen;
