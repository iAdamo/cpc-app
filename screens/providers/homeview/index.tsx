import Categories from "./Categories";
import { ScrollView } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import ContentDisplay from "./ContentDisplay";
import SortBar from "./SortBar";
//import { SearchBar } from "@/components/providers/SearchBar";

const HomeView = () => {
  return (
    <VStack className="p-4">
      {/* <SearchBar /> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <Categories />
        <SortBar />
        <ContentDisplay />
      </ScrollView>
    </VStack>
  );
};

export default HomeView;
