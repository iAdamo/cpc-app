import { useState, useEffect, use } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Center } from "@/components/ui/center";
import { ChevronLeftIcon, Icon } from "@/components/ui/icon";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import {
  Accordion,
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { ScrollView } from "react-native";
import { Image } from "expo-image";
import { getReviews } from "@/services/axios/reviews";
import { ReviewData, MediaItem } from "@/types";
import { MegaphoneIcon, Star } from "lucide-react-native";
import { useLocalSearchParams, usePathname } from "expo-router";
import RatingSection from "@/components/RatingFunction";
import EmptyState from "@/components/EmptyState";
import useGlobalStore from "@/store/globalStore";
import DateFormatter from "@/utils/DateFormat";
import ReviewActionSheet from "@/components/overlays/GiveReviewModal";
import { Spinner } from "@/components/ui/spinner";
import MediaView from "@/components/media/MediaView";

const ReviewAndRating: React.FC<{ providerName?: string }> = ({
  providerName,
}) => {
  const [reviews, setReviews] = useState<ReviewData[]>();
  const [isReviewSheetOpen, setIsReviewSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMedia, setViewMedia] = useState<{
    isOpen: boolean;
    initialIndex?: number;
  }>({
    isOpen: false,
    initialIndex: 0,
  });

  let { id } = useLocalSearchParams<{ id: string }>();
  const { user, switchRole } = useGlobalStore();

  console.log(usePathname());

  const handleOpenReviewSheet = () => {
    setIsReviewSheetOpen(true);
  };

  const handleCloseReviewSheet = () => {
    setIsReviewSheetOpen(false);
  };

  const handleNewReviews = (newReviews: ReviewData[]) => {
    setReviews((prevReviews) => [...(prevReviews || []), ...newReviews]);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        if (switchRole === "Provider") {
          id = user?._id || "";
        }
        const response = await getReviews(id ? id : "");
        // console.log("Fetched reviews:", response);
        if (response) {
          setReviews(response);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <VStack className="flex-1 bg-white">
      <VStack className="">
        {!id && switchRole === "Client" && (
          <Card className="mx-4 border p-2 border-brand-secondary flex-row gap-4 items-center bg-brand-secondary/20">
            <Icon as={MegaphoneIcon} className="text-brand-secondary w-7 h-7" />
            <Text className="flex-1 text-brand-secondary font-bold">
              You can edit your reviews within 24 hours of giving that review.
              Reviews can also be deleted permanently
            </Text>
          </Card>
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          // stickyHeaderIndices={[0]}
          style={{ padding: 16, gap: 16 }}
        >
          <VStack space="md">
            <Card variant="filled">
              <HStack className="justify-between items-start">
                <VStack space="md" className="mb-4">
                  <Heading>Review Status</Heading>
                  {!id && switchRole === "Client" ? (
                    <Text className="text-typography-600">
                      Reviews and ratings given by you will appear here
                    </Text>
                  ) : (
                    <Text className="text-typography-600">
                      Reviews and ratings given to you will appear here
                    </Text>
                  )}
                </VStack>
                {id && switchRole === "Client" && (
                  <Button size="sm" onPress={handleOpenReviewSheet}>
                    <ButtonText>Give A Review</ButtonText>
                  </Button>
                )}
              </HStack>
              {(switchRole === "Provider" || id) && (
                <HStack className="justify-between">
                  <VStack
                    space="xl"
                    className="w-1/3 justify-center items-center"
                  >
                    <Heading size="5xl" className="text-brand-primary">
                      {reviews?.length || 0}
                    </Heading>
                    <Text className="p-2 px-4 bg-brand-primary/40 text-brand-primary rounded-full">
                      {switchRole === "Client" ? "Provider" : "Client"}
                      {reviews?.length === 1 ? "" : "s"}
                    </Text>
                  </VStack>
                  <VStack className="w-3/5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count =
                        reviews?.filter((review) => review.rating === star)
                          .length || 0;
                      const percent =
                        reviews && reviews.length > 0
                          ? (count / reviews.length) * 100
                          : 0;
                      return (
                        <HStack key={star} className="items-center gap-3 mb-2">
                          <Progress
                            value={percent}
                            className="flex-1 bg-brand-secondary/20"
                          >
                            <ProgressFilledTrack className="bg-brand-primary/80" />
                          </Progress>
                          <HStack space="xs" className="items-center">
                            <Text className="">{star}</Text>
                            <Icon
                              as={Star}
                              className="fill-yellow-500 text-yellow-500"
                            />
                            <Text className="">({count})</Text>
                          </HStack>
                        </HStack>
                      );
                    })}
                  </VStack>
                </HStack>
              )}
            </Card>
            <Accordion
              variant="filled"
              className="shadow-none gap-2 rounded-xl"
            >
              {reviews && reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <AccordionItem
                    value={index.toString()}
                    key={index}
                    className="mb-4 bg-gray-50 border border-gray-200 rounded-md"
                  >
                    <AccordionHeader className="p-2">
                      <AccordionTrigger className="p-0 flex-col items-start gap-2">
                        <Text>
                          {DateFormatter.toShortDate(review.createdAt)}
                        </Text>

                        <HStack className="items-start gap-2">
                          {!id && review._id && (
                            <Avatar size="sm">
                              <AvatarFallbackText>
                                {switchRole === "Provider"
                                  ? review.creator?.firstName +
                                    " " +
                                    review.creator?.lastName
                                  : review.recipient?.activeRoleId
                                      ?.providerName}
                              </AvatarFallbackText>
                              {switchRole === "Client" && (
                                <AvatarImage
                                  source={{
                                    uri: (
                                      review.recipient?.activeRoleId
                                        ?.providerLogo as MediaItem
                                    ).thumbnail,
                                  }}
                                  className=""
                                />
                              )}
                            </Avatar>
                          )}
                          <AccordionTitleText className="text-justify font-medium text-typography-600">
                            {id
                              ? `${review.creator?.firstName ?? ""} ${
                                  review.creator?.lastName ?? ""
                                }`
                              : switchRole === "Client"
                              ? review.recipient?.activeRoleId?.providerName
                              : `${review.creator?.firstName ?? ""} ${
                                  review.creator?.lastName ?? ""
                                }`}
                          </AccordionTitleText>
                          <RatingSection rating={review.rating} />
                        </HStack>
                      </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent className="gap-4">
                      <AccordionContentText>
                        {review.description}
                      </AccordionContentText>
                      {review?.images && review?.images?.length > 0 && (
                        <VStack className="flex-row flex-wrap ">
                          {review.images.map((image, idx: number) => (
                            <Pressable
                              key={idx}
                              onPress={() =>
                                setViewMedia({
                                  isOpen: true,
                                  initialIndex: idx,
                                })
                              }
                              className="m-1 flex-1 w-full"
                            >
                              <Image
                                source={{
                                  uri: image.thumbnail,
                                }}
                                style={{ aspectRatio: 16 / 9, borderRadius: 8 }}
                                contentFit="cover"
                              />
                            </Pressable>
                          ))}

                          <MediaView
                            isOpen={viewMedia.isOpen}
                            onClose={() =>
                              setViewMedia({ isOpen: false, initialIndex: 0 })
                            }
                            mediaList={review.images as MediaItem[]}
                            initialIndex={viewMedia.initialIndex}
                          />
                        </VStack>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : loading ? (
                <Spinner size="small" />
              ) : (
                <EmptyState
                  header="No reviews available."
                  text={`${
                    !id
                      ? "You haven't given any companies reviews yet."
                      : "No reviews available for this company yet. You can be the first to make a review by giving the company a try and give them your review"
                  }`}
                />
              )}
            </Accordion>
          </VStack>
        </ScrollView>
        {/* setNewReviews={(reviews: ReviewData[]) => {
          setNewReviews?.(reviews);
        }} */}
      </VStack>
      {id && (
        <ReviewActionSheet
          providerId={id}
          providerName={providerName ?? ""}
          isOpen={isReviewSheetOpen}
          onClose={handleCloseReviewSheet}
          setNewReviews={handleNewReviews}
        />
      )}
    </VStack>
  );
};

export default ReviewAndRating;
