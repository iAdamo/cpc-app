import { useRef, useState } from "react";
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
  const [isSticky, setIsSticky] = useState(false);
  const stickyHeaderY = useRef(0);
  const { searchResults } = useGlobalStore();
  // console.log("Search Results in Profile Screen:", searchResults);
  const { id } = useLocalSearchParams<{ id: string }>();

  // check for the id in searchResults or data
  const provider = searchResults.providers.find((p) => p._id === id);
  // const provider = searchResults.providers.find((p) => p.id === id) || null;
  // console.log("Provider found:", provider);
  const handleScroll = (event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    if (yOffset >= stickyHeaderY.current && !isSticky) {
      setIsSticky(true);
    } else if (yOffset < stickyHeaderY.current && isSticky) {
      setIsSticky(false);
    }
  };
  return (
    <VStack className="flex-1 bg-white">
      {!provider ? (
        <EmptyState header="" text="" />
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            stickyHeaderIndices={[1]}
          >
            <ImageHeader provider={provider} />
            {/* Profile Info Section */}
            <ProfileInfo
              provider={provider}
              isSticky={isSticky}
              onLayout={(e: any) => {
                stickyHeaderY.current = e.nativeEvent.layout.y;
              }}
            />
            <Highlights provider={provider} />
            <MoreInfo provider={provider} />
          </ScrollView>
        </>
      )}
    </VStack>
  );
};

export default UserProfile;
