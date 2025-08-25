import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import ProfilePic from "@/components/profile/ProfilePic";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import useGlobalStore from "@/store/globalStore";

const ProfileInfo = () => {
  const { setCurrentStep, currentStep, updateProfile, userProfile, setError } =
    useGlobalStore();

  const firstName = userProfile.firstName || "";
  const lastName = userProfile.lastName || "";
  const homeAddress = userProfile.homeAddress || "";

  const handleContinue = () => {
    if (userProfile.activeRole === "Client") {
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
    } else if (userProfile.activeRole === "Provider") {
      if (firstName.length < 2 || lastName.length < 2) {
        setError("First and Last names must be at least 2 characters long.");
        return;
      } else if (!homeAddress || homeAddress.length < 5) {
        setError("Please provide a valid residential address.");
        return;
      }
      setCurrentStep(currentStep + 1);
      return;
    }
  };

  return (
    <VStack className="px-6 mt-4 gap-10">
      <VStack space="md">
        <Heading size="3xl" className="text-brand-primary">
          Add Profile Information
        </Heading>
        <Text size="xl" className=" text-typography-600 pr-10">
          Please add your personal profile details here
        </Text>
      </VStack>
      <VStack>
        <ProfilePic
          size="lg"
          isEditable={true}
          showChangeButton={false}
          onImageSelected={(uri) => console.log("Selected image URI:", uri)}
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
              onChangeText={(text) => updateProfile({ firstName: text })}
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
              onChangeText={(text) => updateProfile({ lastName: text })}
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
              onChangeText={(text) => updateProfile({ address: text })}
              className="border-2 rounded border-brand-primary/30 focus:border-brand-primary focus:bg-blue-50"
            />
          </Input>
        </FormControl>
      </VStack>
      <Button
        size="xl"
        className="bg-brand-primary mt-20 w-full"
        onPress={handleContinue}
      >
        <ButtonText>Continue</ButtonText>
      </Button>
    </VStack>
  );
};

export default ProfileInfo;
