import { useEffect, useRef, useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@/components/ui/spinner";
import ImageHeader from "./ImageHeader";
import ProfileInfo from "./ProfileInfo";
import Highlights from "./Highlights";
import MoreInfo from "./MoreInfo";
import useGlobalStore from "@/store/globalStore";
import { useLocalSearchParams } from "expo-router";
import EmptyState from "@/components/EmptyState";
import { ScrollView } from "@/components/ui/scroll-view";
import { ProviderData, EditableFields } from "@/types";
import appendFormData from "@/utils/AppendFormData";
import { set } from "lodash";

const UserProfile = () => {
  const {
    searchResults,
    user,
    fetchUserProfile,
    otherUser,
    isLoading,
    updateUserProfile,
  } = useGlobalStore();
  if (!searchResults) return <EmptyState header="" text="" />;
  const [isEditable, setIsEditable] = useState(false);
  const [provider, setProvider] = useState<ProviderData>();
  const [isSticky, setIsSticky] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editingFields, setEditingFields] = useState<
    Partial<Record<EditableFields, string>>
  >({});

  const handleEditStart = (fields: Partial<Record<EditableFields, string>>) => {
    setEditingFields(fields);
  };

  const handleCancelEdit = () => {
    setEditingFields({});
  };
  const handleSave = async () => {
    if (Object.keys(editingFields).length === 0) return;
    try {
      const formData = new FormData();
      appendFormData(formData, editingFields);
      console.log(Array.from(formData.entries()));
      await updateUserProfile("Provider", formData);
    } catch (error) {
      console.error("Error saving profile changes:", error);
    }
  };
  const stickyHeaderY = useRef(0);
  const { id } = useLocalSearchParams<{ id: string }>();

  const handleScroll = (event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    if (yOffset >= stickyHeaderY.current && !isSticky) {
      setIsSticky(true);
    } else if (yOffset < stickyHeaderY.current && isSticky) {
      setIsSticky(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      if (typeof id !== "string") return null;
      if (
        user?.activeRoleId &&
        typeof user.activeRoleId._id === "string" &&
        user.activeRoleId._id === id
      ) {
        setIsEditable(true);
        setProvider(user.activeRoleId as ProviderData);
      } else {
        // const foundProvider = searchResults.providers.find(
        //   (p) => p.owner === id
        // );
        // setIsEditable(false);
        // if (foundProvider) {
        //   setProvider(foundProvider);
        // } else {
        await fetchUserProfile(id);
        const other = useGlobalStore.getState().otherUser;
        setIsEditable(false);
        if (other?.activeRoleId && typeof other.activeRoleId._id === "string") {
          setProvider(other.activeRoleId as ProviderData);
        } else {
          setProvider(undefined);
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, [id, user, fetchUserProfile, updateUserProfile]);

  if (isLoading || loading) {
    return (
      <Spinner size="large" className="flex-1 justify-center items-center" />
    );
  }
  if (!provider) {
    return (
      <EmptyState
        header="No Profile Found"
        text="The profile you are looking for does not exist."
      />
    );
  }

  return (
    <VStack className="flex-1 bg-white">
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
          isEditable={isEditable}
          editingFields={editingFields}
          handleSave={handleSave}
          handleEditStart={handleEditStart}
          handleCancelEdit={handleCancelEdit}
          onLayout={(e: any) => {
            stickyHeaderY.current = e.nativeEvent.layout.y;
          }}
        />
        <Highlights provider={provider} />
        <MoreInfo provider={provider} isEditable={isEditable} />
      </ScrollView>
    </VStack>
  );
};

export default UserProfile;
