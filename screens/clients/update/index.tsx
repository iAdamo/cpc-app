import { useEffect, useState, useRef, useCallback } from "react";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import useGlobalStore from "@/store/globalStore";
import { Dimensions } from "react-native";
import SearchBar from "@/components/SearchEngine";
import { JobData } from "@/types";
import { FlatList } from "react-native";
import JobCard from "@/screens/clients/update/JobCard";
import { ListRenderItemInfo } from "react-native";
import { Spinner } from "@/components/ui/spinner";

const ClientsUpdates = () => {
  const { width } = Dimensions.get("window");

  const [jobs, setJobs] = useState<JobData[]>();
  const [page, setPage] = useState<number>(1);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const fetchingRef = useRef<boolean>(false);
  const LIMIT = 30;

  const {
    executeSearch,
    searchResults,
    currentLocation,
    sortBy,
    categories,
    isLoading,
  } = useGlobalStore();
  const { setCachedJobs } = useGlobalStore();

  useEffect(() => {
    // when sort/location/categories change, reset pagination
    setPage(1);
    setHasMore(true);

    const handleJobsSearch = async (p = 1) => {
      await executeSearch({
        model: "jobs",
        page: p,
        limit: 30,
        engine: false,
        sortBy: sortBy,
        lat: currentLocation?.coords.latitude,
        long: currentLocation?.coords.longitude,
        categories: categories,
      });
    };
    // console.log(sortBy, currentLocation, categories);
    handleJobsSearch(1);
  }, [sortBy, currentLocation, categories]);

  // Update jobs when searchResults change
  useEffect(() => {
    if (!searchResults) return;
    const received = searchResults.jobs || [];
    // save the latest response jobs to the simple cache in the store
    setCachedJobs && setCachedJobs(received);
    if (page === 1) setJobs(received);
    else setJobs((prev = []) => [...prev, ...received]);

    // determine if there's more to load based on server metadata when available
    const srPage = (searchResults as any).page as number | undefined;
    const srTotal = (searchResults as any).totalPages as number | undefined;
    if (typeof srPage === "number" && typeof srTotal === "number") {
      setHasMore(srPage < srTotal);
    } else {
      // fallback to length heuristic
      setHasMore((received.length ?? 0) >= LIMIT);
    }
    // reset fetching guard
    fetchingRef.current = false;
    setLoadingMore(false);
    setRefreshing(false);
  }, [searchResults, page]);

  const onRefresh = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setRefreshing(true);
    setHasMore(true);
    try {
      await executeSearch({
        model: "jobs",
        page: 1,
        limit: LIMIT,
        engine: false,
        sortBy: sortBy,
        lat: currentLocation?.coords.latitude,
        long: currentLocation?.coords.longitude,
        categories: categories,
      });
      setPage(1);
    } finally {
      fetchingRef.current = false;
      setRefreshing(false);
    }
  };

  const onEndReached = async () => {
    if (loadingMore || !hasMore || fetchingRef.current) return;
    fetchingRef.current = true;
    setLoadingMore(true);
    const next = page + 1;
    try {
      await executeSearch({
        model: "jobs",
        page: next,
        limit: LIMIT,
        engine: false,
        sortBy: sortBy,
        lat: currentLocation?.coords.latitude,
        long: currentLocation?.coords.longitude,
        categories: categories,
      });
      setPage(next);
    } finally {
      fetchingRef.current = false;
      setLoadingMore(false);
    }
  };
  // console.log({ jobs });

  const renderItem = useCallback(({ item }: ListRenderItemInfo<JobData>) => {
    return <JobCard item={item} />;
  }, []);

  const listHeader = (
    <>
      <SearchBar />
      <Text size="md" className="mt-4 mb-2 px-2 text-typography-600">
        Browse tasks that match your company's experience to a client's hiring
        preferences.
      </Text>
    </>
  );

  if (isLoading) {
    return (
      <VStack className="flex-1 justify-center items-center">
        <Spinner size="large" className="text-brand-secondary w-12 h-12" />
      </VStack>
    );
  }

  return (
    <VStack>
      <FlatList
        data={jobs || []}
        renderItem={renderItem}
        keyExtractor={(item) => item._id ?? item.id ?? String(item.createdAt)}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ paddingBottom: 96, paddingHorizontal: 8 }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReachedThreshold={0.75}
        onEndReached={onEndReached}
        ListFooterComponent={
          loadingMore ? (
            <VStack className="py-4 items-center">
              <Text>Loading more...</Text>
            </VStack>
          ) : null
        }
      />
    </VStack>
  );
};

export default ClientsUpdates;
