import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Center } from "@/components/ui/center";
import { ChevronLeftIcon, Icon } from "@/components/ui/icon";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { ScrollView } from "react-native";
import { router } from "expo-router";
import { getReviews } from "@/axios/reviews";
import { ReviewData } from "@/types";
import { MegaphoneIcon, Star } from "lucide-react-native";
import { useLocalSearchParams } from "expo-router";
import RatingSection from "@/components/RatingFunction";
import EmptyState from "@/components/EmptyState";

const ReviewAndRating = () => {
  const [reviews, setReviews] = useState<ReviewData[]>();
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getReviews(id ? id : "");
        if (response) {
          setReviews(response);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchReviews();
  }, []);

  return (
    <VStack className="flex-1 bg-white">
      <VStack className="mt-14 mb-2">
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
            Reviews & Ratings
          </ButtonText>
        </Button>
      </VStack>
      <VStack className="">
        {!id && (
          <Card className="mx-4 border p-2 border-brand-secondary flex-row gap-4 items-center bg-brand-secondary/40">
            <Icon as={MegaphoneIcon} className="text-brand-secondary w-7 h-7" />
            <Text className="flex-1 text-brand-secondary">
              You can edit your reviews within 24 hours of giving that review.
              Reviews can also be deleted permanently
            </Text>
          </Card>
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          // stickyHeaderIndices={[0]}
          style={{ padding: 16 }}
        >
          <Card variant="filled">
            <VStack space="md" className="mb-4">
              <Heading>Review Status</Heading>
              {!id && (
                <Text className="text-typography-600">
                  Reviews and ratings given by you will appear here
                </Text>
              )}
            </VStack>
            <HStack className="justify-between">
              <VStack space="xl" className="w-1/3 justify-center items-center">
                <Heading size="5xl" className="text-brand-primary">
                  {reviews?.length || 0}
                </Heading>
                <Text className="p-2 px-4 bg-brand-primary/40 text-brand-primary rounded-full">
                  Companies
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
                        <ProgressFilledTrack className="bg-brand-primary" />
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
          </Card>
          {reviews && reviews.length > 0 ? (
            reviews.map((review, index) => (
              <Card key={index} variant="filled" className="gap-2 mb-4">
                {/* Render your review details here */}
                <RatingSection rating={review.rating} />
                <Text>{review.description}</Text>
                <HStack space="sm" className="items-center">
                  <Text>{review.createdAt}</Text>
                  <Avatar size="xs">
                    <AvatarFallbackText>
                      {`${review.user?.firstName} ${review.user?.lastName}`}
                    </AvatarFallbackText>
                    <AvatarImage
                      source={{ uri: review.user?.profilePicture }}
                    />
                  </Avatar>
                  <Text>
                    {`${review.user?.firstName} ${review.user?.lastName}`}
                  </Text>
                </HStack>
              </Card>
            ))
          ) : (
            <EmptyState
              header="No reviews available."
              text="No reviews available for this company yet. You can be the first to make a review by giving the company a try and give them your review"
            />
          )}
        </ScrollView>
      </VStack>
    </VStack>
  );
};

export default ReviewAndRating;
