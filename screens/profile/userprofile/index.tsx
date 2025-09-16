import { VStack } from "@/components/ui/vstack";
import ImageHeader from "./ImageHeader";
import ProfileInfo from "./ProfileInfo";
import Highlights from "./Highlights";
import MoreInfo from "./MoreInfo";
import useGlobalStore from "@/store/globalStore";
import { useLocalSearchParams } from "expo-router";
import EmptyState from "@/components/EmptyState";
import { ScrollView } from "@/components/ui/scroll-view";

const UserProfile = () => {
  const { searchResults } = useGlobalStore();
  // console.log("Search Results in Profile Screen:", searchResults);
  const { id } = useLocalSearchParams<{ id: string }>();

  // check for the id in searchResults or data
  const provider = searchResults.providers.find((p) => p._id === id);
  // const provider = searchResults.providers.find((p) => p.id === id) || null;
  // console.log("Provider found:", provider);

  return (
    <VStack className="flex-1 bg-white">
      {!provider ? (
        <EmptyState header="" text="" />
      ) : (
        <>
          <ImageHeader provider={provider} />
          {/* Profile Info Section */}
          <ProfileInfo provider={provider} />
          <Highlights provider={provider} />
          <MoreInfo provider={provider} />
        </>
      )}
    </VStack>
  );
};

export default UserProfile;
