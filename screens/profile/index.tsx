import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Icon, ThreeDotsIcon } from "@/components/ui/icon";
import { MapPinIcon } from "lucide-react-native";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import useGlobalStore from "@/store/globalStore";
import ProfileSection from "./ProfileSection";
import { router } from "expo-router";
import ProfilePic from "@/components/profile/ProfilePic";
import { FileType, MediaItem } from "@/types";

const ProfileView = () => {
  const [profilePic, setProfilePic] = useState<FileType | null>(null);

  const {
    user,
    currentLocation,
    switchRole,
    setSwitchRole,
    setCurrentStep,
    resetOnboarding,
    updateUserProfile,
  } = useGlobalStore();

  useEffect(() => {
    // console.log("I ran");
    if (profilePic) {
      const updateProfilePicture = async () => {
        if (!user) return;
        const formData = new FormData();
        formData.append(
          switchRole === "Client" ? "profilePicture" : "providerLogo",
          {
            uri: profilePic.uri,
            name: profilePic.name || "logo.jpg",
            type: "image/jpeg",
          } as any
        );

        await updateUserProfile(switchRole, formData);
        setProfilePic(null);
      };
      updateProfilePicture();
    }
  }, [setProfilePic, profilePic]);

  const handleCompanyOnboarding = () => {
    if (!user) return false;
    console.log(switchRole);
    if (user.activeRoleId?.owner && switchRole === "Client") {
      setSwitchRole("Provider");
      router.push("/clients");
      return true;
    } else if (user.activeRoleId?.owner && switchRole === "Provider") {
      setSwitchRole("Client");
      router.push("/providers");
      return true;
    } else if (!user.activeRoleId?.owner && switchRole === "Client") {
      resetOnboarding();
      setCurrentStep(7);
      router.push({
        pathname: "/onboarding",
        params: { from: "/providers" },
      });
      return true;
    }
    return false;
  };

  // console.log(switchRole, user?.activeRoleId?.owner);

  return (
    <VStack className="flex-1 bg-white">
      {/* Header */}
      <VStack className="relative">
        <VStack
          className={`h-48 pt-20 ${
            switchRole === "Client"
              ? "bg-brand-secondary/70"
              : "bg-brand-primary/40"
          }`}
        >
          <HStack className="w-full px-4 justify-between items-center">
            <HStack space="md" className="items-center">
              <ProfilePic
                size="xs"
                isEditable={true}
                showChangeButton={false}
                isLogo={true}
                imageUri={
                  switchRole === "Client"
                    ? typeof user?.profilePicture?.thumbnail === "string"
                      ? user?.profilePicture.thumbnail
                      : undefined
                    : user?.activeRoleId?.providerLogo
                    ? typeof (user?.activeRoleId?.providerLogo as MediaItem)
                        ?.thumbnail === "string"
                      ? (user?.activeRoleId?.providerLogo as MediaItem)
                          .thumbnail
                      : undefined
                    : undefined
                }
                onImageSelected={(file) => setProfilePic(file)}
              />

              <VStack>
                <Heading
                  className={`${
                    switchRole === "Client"
                      ? "text-yellow-900"
                      : "text-brand-primary"
                  }`}
                >{`${
                  switchRole === "Client"
                    ? `${user?.firstName} ${user?.lastName}`
                    : `${user?.activeRoleId?.providerName}`
                }`}</Heading>
                <HStack space="xs" className="items-center">
                  <Icon
                    size="sm"
                    as={MapPinIcon}
                    className={`${
                      switchRole === "Client"
                        ? "text-yellow-900"
                        : "text-brand-primary"
                    }`}
                  />
                  <Text
                    className={`${
                      switchRole === "Client"
                        ? "text-yellow-900"
                        : "text-brand-primary"
                    }`}
                  >
                    {`${
                      switchRole === "Client"
                        ? `${currentLocation?.region} ${currentLocation?.country}`
                        : `${user?.activeRoleId?.location?.primary?.address?.city}, ${user?.activeRoleId?.location?.primary?.address?.state}`
                    }`}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
            <Button
              variant="outline"
              className="px-2 border-gray-100/30 bg-white/20 rounded-xl"
            >
              <ButtonIcon
                as={ThreeDotsIcon}
                className={`rotate-90 w-6 h-6 ${
                  switchRole === "Client"
                    ? "text-yellow-900"
                    : "text-brand-primary"
                }`}
              />
            </Button>
          </HStack>
        </VStack>
        <Card className="flex-row rounded-xl justify-between items-center p-3 px-4 mx-4 bottom-6 shadow-lg bg-white">
          <Text size="lg" className="font-medium">
            Switch to {switchRole === "Client" ? "Company" : "Client"}
          </Text>
          <Switch
            size="md"
            value={false}
            onToggle={() => handleCompanyOnboarding()}
          />
        </Card>
      </VStack>

      {/* Sections */}
      <ProfileSection />
    </VStack>
  );
};

export default ProfileView;
