import { FlatList, View } from "react-native";
import ProviderCard from "@/components/ProviderCard";
import { ProviderData } from "@/types";
import EmptyState from "@/components/EmptyState";
import { VStack } from "@/components/ui/vstack";
interface ContentDisplayProps {
  providers: ProviderData[];
  handleProvidersSearch: () => void;
  isSearching?: boolean;
  displayStyle?: "Grid" | "List";
}

const ContentDisplay = ({
  providers,
  displayStyle = "Grid",
  handleProvidersSearch,
  isSearching,
}: ContentDisplayProps) => {
  if (!providers || providers.length === 0)
    return <EmptyState header="" text="" />;

  const isGrid = displayStyle === "Grid";

  return (
    <FlatList
      data={providers}
      keyExtractor={(item) => item._id}
      key={isGrid ? "grid" : "list"}
      numColumns={isGrid ? 2 : 1}
      columnWrapperStyle={
        isGrid ? { gap: "6", paddingHorizontal: 6 } : undefined
      }
      renderItem={({ item }) => <ProviderCard provider={item} />}
      onRefresh={handleProvidersSearch}
      refreshing={isSearching}
      contentContainerStyle={{ paddingRight: 6 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState header="" text="" />}
    />
  );
};

export default ContentDisplay;
