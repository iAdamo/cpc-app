import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
// import { Pressable } from "@/components/ui/pressable";
import { Button, ButtonText } from "@/components/ui/button";
import useGlobalStore from "@/store/globalStore";
import EmptyState from "@/components/EmptyState";
import { router } from "expo-router";

const MyCompanies = () => {
  const { user } = useGlobalStore();

  const providers = [user?.activeRoleId];
  return (
    <VStack className="flex-1 bg-white">
      {providers && providers.length > 0 ? (
        <VStack className="p-4 space-y-4">
          {providers.map((provider, idx) => (
            <Card key={idx} className="p-4 border border-gray-200">
              <HStack className="justify-between items-start gap-4 flex-wrap">
                <VStack space="xs" className="flex-1 min-w-0">
                  <Heading size="lg" className="text-brand-primary">
                    {provider?.providerName}
                  </Heading>
                  <Text className="text-gray-600 truncate">
                    {provider?.providerEmail}
                  </Text>
                  <Text className="text-gray-600 break-words">
                    {provider?.location?.primary?.address?.address}
                  </Text>
                </VStack>
                <Button
                  onPress={() =>
                    router.push({
                      pathname: "/profile/[id]",
                      params: { id: provider?.owner ?? "" },
                    })
                  }
                  className="bg-brand-primary shadow-xl"
                >
                  <ButtonText className="text-white">View</ButtonText>
                </Button>
              </HStack>
            </Card>
          ))}
        </VStack>
      ) : (
        <VStack className="flex-1 justify-center items-center p-4">
          <EmptyState
            header="No Companies Yet"
            text="You have no companies associated with your account.
            Please contact support if you believe this is an error."
          />
        </VStack>
      )}
    </VStack>
  );
};

export default MyCompanies;
