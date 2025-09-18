import Categories from "./Categories";
import { ScrollView } from "react-native";
import { VStack } from "@/components/ui/vstack";
import ContentDisplay from "./ContentDisplay";
import SortBar from "./SortBar";
import useGlobalStore from "@/store/globalStore";
import { TopNavbar } from "@/components/layout/Navbar";
import SearchBar from "@/components/SearchEngine";

const HomeView = () => {
  return (
    <VStack className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <SearchBar />
        <Categories />
        <SortBar />
        <ContentDisplay />
      </ScrollView>
    </VStack>
  );
};

export default HomeView;
