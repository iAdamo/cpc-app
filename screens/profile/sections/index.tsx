import { VStack } from "@/components/ui/vstack";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ChevronLeftIcon } from "@/components/ui/icon";
import { useLocalSearchParams, router, usePathname } from "expo-router";
import InviteFriends from "@/screens/profile/sections/InviteFriends";
import ProfileInfo from "@/screens/profile/sections/BasicInfo";
import ReviewAndRating from "@/screens/profile/sections/ReviewSection";
import SavedCompanies from "@/screens/profile/sections/SavedCompanies";
import AccountSettings from "@/screens/profile/sections/settings";
import MyCompanies from "@/screens/profile/sections/provider/MyCompanies";
import MyProjects from "@/screens/profile/sections/provider/MyProjects";

const SectionPage = () => {
  const { section } = useLocalSearchParams();
  const pathname = usePathname();

  // Map section values to components
  const renderSection: { [key: string]: React.ComponentType } = {
    "personal-info": ProfileInfo,
    "invite-friends": InviteFriends,
    "reviews-ratings": ReviewAndRating,
    "saved-companies": SavedCompanies,
    "saved-jobs": SavedCompanies,
    settings: AccountSettings,
    "my-companies": MyCompanies,
    "my-projects": MyProjects,
  };
  const SectionComponent: React.ComponentType =
    renderSection[section as string];

  const ButtonTextMap: { [key: string]: string } = {
    "personal-info": "Personal Information",
    "invite-friends": "Invite Friends",
    "reviews-ratings": "Reviews & Ratings",
    "saved-companies": "Saved Companies",
    "saved-jobs": "Saved Jobs",
    settings: "Account Settings",
    "my-companies": "My Companies",
    "my-projects": "My Projects",
  };
  const buttonText = ButtonTextMap[section as string] || "Back";

  const handleBack = () => {
    router.back();
  };

  return SectionComponent ? (
    <VStack className="flex-1 bg-white">
      {pathname === "/profile" && (
        <VStack className="mt-16 mb-4 ml-4">
          <Button size="xl" variant="link" onPress={handleBack} className="">
            <ButtonIcon
              as={ChevronLeftIcon}
              className="w-7 h-7 text-typography-700"
            />
            <ButtonText className="text-typography-700 data-[active=true]:no-underline flex-1">
              {buttonText}
            </ButtonText>
          </Button>
        </VStack>
      )}
      <SectionComponent />
    </VStack>
  ) : null;
};

export default SectionPage;
