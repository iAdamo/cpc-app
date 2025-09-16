import { useState, useEffect } from "react";
import { usePathname, useRouter } from "expo-router";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
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

const ProfileInfo = () => {
  const [newFirstName, setNewFirstName] = useState<string>("");
  const [newLastName, setNewLastName] = useState<string>("");
  const [newHomeAddress, setNewHomeAddress] = useState<string>("");
  const [profilePicUri, setProfilePicUri] = useState<string>("");

  const {
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
  const isProfileEdit = pathname === "/profile/personal-info";

  const handleSave = async () => {
    const formData = new FormData();
    newFirstName && formData.append("firstName", newFirstName);
    newLastName && formData.append("lastName", newLastName);
    newHomeAddress && formData.append("homeAdress", newHomeAddress);
    if (profilePicUri) {
      formData.append("profilePicture", {
        uri: profilePicUri,
        name: "profile.jpg",
        type: "image/jpeg",
      } as any);
    }
    await updateUserProfile("Client", formData);
    router.back();
  };

  const handleContinue = () => {
    // Onboarding logic (unchanged)
    if (user?.activeRole === "Client") {
      if (firstName.length < 2 || lastName.length < 2) {
        setError("First and Last names must be at least 2 characters long.");
        return;
      }
      if (homeAddress && homeAddress.length < 5) {
        setError("Please provide a valid address.");
        return;
      }
      setCurrentStep(0);
      return;
    } else if (user?.activeRole === "Provider") {
      if (firstName.length < 2 || lastName.length < 2) {
        setError("First and Last names must be at least 2 characters long.");
        return;
      } else if (!homeAddress || homeAddress.length < 5) {
        setError("Please provide a valid residential address.");
        return;
      }
      setCurrentStep(currentStep + 1);
      // useGlobalStore.setState((state) => ({
      //   currentStep: state.currentStep + 1,
      // }));
      return;
    }
  };

  return (
    <VStack className="px-6 mt-4 gap-10">
      {isProfileEdit && (
        <HStack className="mt-12 w-full justify-start">
          <Button variant="link" onPress={() => router.back()}>
            <ButtonIcon
              as={ChevronLeftIcon}
              className="text-brand-secondary w-7 h-7"
            />
          </Button>
        </HStack>
      )}
      <VStack space="md">
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
          imageUri={user?.profilePicture}
          onImageSelected={(uri) => setProfilePicUri(uri)}
        />
      </VStack>
      <VStack className="mt-6 h-64 justify-between">
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
        className="bg-brand-primary mt-20 w-full"
        isDisabled={isLoading}
        onPress={isProfileEdit ? handleSave : handleContinue}
      >
        <ButtonText>{isProfileEdit ? "Save" : "Continue"}</ButtonText>
      </Button>
    </VStack>
  );
};

export default ProfileInfo;
