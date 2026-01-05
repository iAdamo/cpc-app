import { VStack } from "@/components/ui/vstack";
import SearchBar from "@/components/SearchEngine";
import { ScrollView } from "react-native";
import ProviderCard from "@/components/ProviderCard";
import useGlobalStore from "@/store/globalStore";
import EmptyState from "@/components/EmptyState";

const SavedCompanies = () => {
  const { savedProviders, filteredProviders } = useGlobalStore();

  return (
    <VStack className="flex-1 bg-white">
      <SearchBar providers={savedProviders} />
      {savedProviders && savedProviders.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ padding: 8 }}
        >
          {(filteredProviders && filteredProviders.length > 0
            ? filteredProviders
            : savedProviders
          ).map((provider) => (
            <ProviderCard key={provider._id} provider={provider} />
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          header="No saved companies found."
          text={`You haven't saved any companies yet.\nBrowse and save companies to see them here.`}
        />
      )}
    </VStack>
  );
};

export default SavedCompanies;
