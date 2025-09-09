import Categories from "./Categories";
import { ScrollView } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import ContentDisplay from "./ContentDisplay";
import SortBar from "./SortBar";
//import { SearchBar } from "@/components/providers/SearchBar";
import useGlobalStore from "@/store/globalStore";

const HomeView = () => {
  return (
    <VStack className="px-4">
      {/* <SearchBar /> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <Categories />
        <SortBar />
        <ContentDisplay/>
      </ScrollView>
    </VStack>
  );
};

export default HomeView;
