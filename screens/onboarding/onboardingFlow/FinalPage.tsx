import { useEffect } from "react";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
// import { Image } from "@/components/ui/image";
import { Image } from "react-native";
import { useRouter } from "expo-router";
import useGlobalStore from "@/store/globalStore";

const FinalPage = () => {
  const { user, logout } = useGlobalStore();
  const router = useRouter();
  useEffect(() => {
    const finalizeProfile = async () => {
// await logout();
      setTimeout(() => {
        router.replace("/providers");
      }, 3000);
    };

    finalizeProfile();
  }, []);

  return (
    <Center className="h-full bg-white px-6">
      <VStack className="w-full h-full justify-center items-center gap-6">
        <Center className="gap-6">
          <Image
            source={require("@/assets/images/success-img.png")}
            className="w-32 h-32"
          />
          <Heading size="2xl" className="text-brand-primary text-center">
            All Set!
          </Heading>
          <Text size="lg" className="text-gray-600 text-center">
            Your profile has been successfully created. You can now explore and
            use the app.
          </Text>
        </Center>
      </VStack>
    </Center>
  );
};

export default FinalPage;
