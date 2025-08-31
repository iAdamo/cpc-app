import { VStack } from "@/components/ui/vstack";
import ImageHeader from "./ImageHeader";
import ProfileInfo from "./ProfileInfo";
import Highlights from "./Highlights";
import MoreInfo from "./MoreInfo";

const ProfileScreen = () => {
  return (
    <VStack className="flex-1 bg-white">
      <ImageHeader />
      {/* Profile Info Section */}
      <ProfileInfo />
      <Highlights />
      <MoreInfo provider={null} />
    </VStack>
  );
};

export default ProfileScreen;
