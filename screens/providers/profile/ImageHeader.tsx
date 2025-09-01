import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { AddIcon } from "@/components/ui/icon";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ImageBackground, StyleSheet } from "react-native";
import { ChevronLeftIcon, ThreeDotsIcon } from "@/components/ui/icon";
import { router } from "expo-router";
import { Divider } from "@/components/ui/divider";
import { ProviderData } from "@/types";

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    justifyContent: "space-between",
  },
});
const ImageHeader = ({ provider }: { provider: any | null }) => {
  return (
    <VStack className="h-1/3">
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        }}
        style={styles.header}
      >
        <HStack className="justify-between items-center pt-14 px-4">
          <Button
            variant="outline"
            onPress={() => router.back()}
            className="px-2 border-gray-100/30 bg-gray-800/20 rounded-xl blur-md"
          >
            <ButtonIcon as={ChevronLeftIcon} className="text-white w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            onPress={() => {}}
            className="px-2 border-gray-100/30 bg-gray-800/20 rounded-xl blur-md"
          >
            <ButtonIcon
              as={ThreeDotsIcon}
              className="rotate-90 text-white w-6 h-6"
            />
          </Button>
        </HStack>
        <HStack className="w-full bg-white/20 backdrop-blur-3xl px-4 py-2 justify-between items-center">
          <HStack>
            <VStack>
              <Heading className="text-white">12</Heading>
              <Text className="text-white">reviews</Text>
            </VStack>
            <Divider orientation="vertical" className="mx-4 h-5 self-center" />
            <VStack>
              <Heading className="text-white">30</Heading>
              <Text className="text-white">followers</Text>
            </VStack>
            <Divider orientation="vertical" className="mx-4 h-5 self-center" />
            <VStack>
              <Heading className="text-white">30yrs</Heading>
              <Text className="text-white">exp</Text>
            </VStack>
          </HStack>
          <Button
            size="sm"
            variant="outline"
            className="bg-white rounded-xl border-0 "
          >
            <ButtonIcon as={AddIcon} className="text-brand-primary" />
            <ButtonText className="text-brand-primary">Follow</ButtonText>
          </Button>
        </HStack>
      </ImageBackground>
    </VStack>
  );
};

export default ImageHeader;
