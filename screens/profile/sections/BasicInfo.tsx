import { useState, useEffect } from "react";
import { usePathname, useRouter } from "expo-router";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import ProfilePic from "@/components/profile/ProfilePic";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import useGlobalStore from "@/store/globalStore";
import { ChevronLeftIcon } from "@/components/ui/icon";
import { FileType } from "@/types";

const ProfileInfo = () => {
  const [newFirstName, setNewFirstName] = useState<string>("");
  const [newLastName, setNewLastName] = useState<string>("");
  const [newHomeAddress, setNewHomeAddress] = useState<string>("");
  const [profilePic, setProfilePic] = useState<FileType>();

  const {
    switchRole,
    updateProfile,
    user,
    setError,
    updateUserProfile,
    isLoading,
    currentStep,
    setCurrentStep,
  } = useGlobalStore();
  const router = useRouter();
  const pathname = usePathname();

  // Local state for optional fields
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const homeAddress = user?.homeAddress || "";

  // If editing from /profile-info, all fields are optional and onboarding is skipped
  const isProfileEdit = pathname === "/profile";

  const handleSave = async () => {
    try {
      const formData = new FormData();
      newFirstName && formData.append("firstName", newFirstName);
      newLastName && formData.append("lastName", newLastName);
      newHomeAddress && formData.append("homeAdress", newHomeAddress);
      if (profilePic) {
        formData.append("profilePicture", {
          uri: profilePic.uri,
          name: profilePic.name || "profile.jpg",
          type: "image/jpeg",
        } as any);
      }
      console.log(
        "Updating profile with data:",
        Array.from(formData.entries())
      );
      await updateUserProfile("Client", formData);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleContinue = async () => {
    // Onboarding logic (unchanged)
    if (firstName.length < 2 || lastName.length < 2) {
      setError("First and Last names must be at least 2 characters long.");
      return;
    }
    if (homeAddress && homeAddress.length < 5) {
      setError("Please provide a valid address.");
      return;
    }
    await handleSave();
    if (user?.activeRole === "Client") {
      setCurrentStep(0);
      return;
    } else if (user?.activeRole === "Provider") {
      setCurrentStep(currentStep + 1);
      return;
    }
  };

  // console.log("Rendering ProfileInfo with user:", user);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-10 justify-between"
      className="px-6 mt-4"
    >
      <VStack>
        <Heading size="3xl" className="text-brand-primary">
          {isProfileEdit
            ? "Edit Profile Information"
            : "Add Profile Information"}
        </Heading>
        <Text size="xl" className=" text-typography-600 pr-10">
          {isProfileEdit
            ? "Update your personal profile details here"
            : "Please add your personal profile details here"}
        </Text>
      </VStack>
      <VStack>
        <ProfilePic
          size="lg"
          isEditable={true}
          showChangeButton={false}
          button={true}
          imageUri={user?.profilePicture?.thumbnail}
          onImageSelected={(file) => setProfilePic(file)}
        />
      </VStack>
      <VStack className="h-64 justify-between">
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>First Name</FormControlLabelText>
          </FormControlLabel>
          <Input className="h-12 border-0">
            <InputField
              placeholder="First Name"
              autoCapitalize="words"
              value={firstName}
              onChangeText={(text) => {
                updateProfile({ firstName: text }), setNewFirstName(text);
              }}
              className="border-2 rounded border-brand-primary/30 focus:border-brand-primary focus:bg-blue-50"
              placeholderClassName="text-red-400"
            />
          </Input>
        </FormControl>
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>Last Name</FormControlLabelText>
          </FormControlLabel>
          <Input className="h-12 border-0">
            <InputField
              placeholder="Last Name"
              autoCapitalize="words"
              value={lastName}
              onChangeText={(text) => {
                updateProfile({ lastName: text }), setNewLastName(text);
              }}
              className="border-2 rounded border-brand-primary/30 focus:border-brand-primary focus:bg-blue-50"
            />
          </Input>
        </FormControl>
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>Residential Address</FormControlLabelText>
          </FormControlLabel>
          <Input className="h-12 border-0">
            <InputField
              placeholder="Address"
              autoCapitalize="words"
              value={homeAddress}
              onChangeText={(text) => {
                updateProfile({ homeAddress: text }), setNewHomeAddress(text);
              }}
              className="border-2 rounded border-brand-primary/30 focus:border-brand-primary focus:bg-blue-50"
            />
          </Input>
        </FormControl>
      </VStack>
      <Button
        size="xl"
        className="bg-brand-primary w-full mt-10"
        isDisabled={isLoading}
        onPress={
          isProfileEdit
            ? async () => {
                await handleSave();
                router.back();
              }
            : handleContinue
        }
      >
        <ButtonText>{isProfileEdit ? "Save" : "Continue"}</ButtonText>
      </Button>
    </ScrollView>
  );
};

export default ProfileInfo;
