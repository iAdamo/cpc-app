import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
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

const ProfileView = () => {
  const {
    user,
    currentLocation,
    switchRole,
    setSwitchRole,
    setCurrentStep,
    resetOnboarding,
  } = useGlobalStore();

  // const [toggle, setToggle] = useState(false);
// console.log("user", user);

  const handleCompanyOnboarding = () => {
    if (!user) return false;

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
              <Avatar size="lg">
                <AvatarFallbackText>
                  {`${user?.firstName} ${user?.lastName}`}
                </AvatarFallbackText>
                <AvatarImage
                  source={
                    typeof (switchRole === "Client"
                      ? user?.profilePicture
                      : user?.activeRoleId?.providerLogo) === "string"
                      ? {
                          uri:
                            switchRole === "Client"
                              ? (user?.profilePicture as string | undefined)
                              : (user?.activeRoleId?.providerLogo as
                                  | string
                                  | undefined),
                        }
                      : undefined
                  }
                />
              </Avatar>
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
        <Card className="flex-row rounded-xl justify-between items-center p-0 px-4 mx-4 bottom-6 shadow-lg bg-white">
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
