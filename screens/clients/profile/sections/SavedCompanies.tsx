import { VStack } from "@/components/ui/vstack";
import { ChevronLeftIcon, Icon } from "@/components/ui/icon";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import SearchBar from "@/components/SearchEngine";
import { ScrollView } from "react-native";
import ProviderCard from "@/components/ProviderCard";
import { router } from "expo-router";
import useGlobalStore from "@/store/globalStore";

const SavedCompanies = () => {
  const { savedProviders, filteredProviders } = useGlobalStore();

  return (
    <VStack className="flex-1 bg-white">
      <VStack className="mt-14 gap-4">
        <Button
          size="xl"
          variant="link"
          onPress={router.back}
          className="w-40 ml-4"
        >
          <ButtonIcon
            as={ChevronLeftIcon}
            className="w-7 h-7 text-typography-700"
          />
          <ButtonText className="text-typography-700 data-[active=true]:no-underline">
            Saved Companies
          </ButtonText>
        </Button>
        <SearchBar providers={savedProviders} />
      </VStack>
      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 16 }}>
        {(filteredProviders && filteredProviders.length > 0
          ? filteredProviders
          : savedProviders
        ).map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </ScrollView>
    </VStack>
  );
};

export default SavedCompanies;
