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
  const { setCurrentStep, updateProfile, userProfile } = useGlobalStore();
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
      <VStack className="mt-6 h-60 justify-between">
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>First Name</FormControlLabelText>
          </FormControlLabel>
          <Input className="h-12 border-0">
            <InputField className="border rounded border-gray-300 focus:border-blue-500 focus:bg-blue-50" />
          </Input>
        </FormControl>
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>Last Name</FormControlLabelText>
          </FormControlLabel>
          <Input className="h-12 border-0">
            <InputField className="border rounded border-gray-300 focus:border-blue-500 focus:bg-blue-50" />
          </Input>
        </FormControl>
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText>Address</FormControlLabelText>
          </FormControlLabel>
          <Input className="h-12 border-0">
            <InputField className="border rounded border-gray-300 focus:border-blue-500 focus:bg-blue-50" />
          </Input>
        </FormControl>
      </VStack>
      <Button
        size="xl"
        className="bg-brand-primary mt-20 w-full"
        onPress={() => null}
      >
        <ButtonText>Continue</ButtonText>
      </Button>
    </VStack>
  );
};

export default ProfileInfo;
