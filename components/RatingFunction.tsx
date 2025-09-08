import { HStack } from "./ui/hstack";
import { Heading } from "./ui/heading";
import { Star } from "lucide-react-native";
import { Icon } from "./ui/icon";

const RenderStar = (rating: number) => {
  // Show a filled star if rating > 0, else empty
  return (
    <Icon
      as={Star}
      size="xl"
      className={`${rating > 0 ? "text-yellow-500" : "text-gray-500"}`}
    />
    // <Star
    //   size={16}
    //   fill={rating > 0 ? "#FFD700" : "#D1D5DB"}
    //   color={rating > 0 ? "#FFD700" : "#D1D5DB"}
    // />
  );
};

const RatingSection = ({
  rating,
  reviewCount,
}: {
  rating?: number; // Make rating optional
  reviewCount?: number;
}) => (
  <HStack className="gap-2 items-center">
    {rating !== undefined && rating > 0 && (
      <HStack className="gap-1 items-center">
        {RenderStar(rating)}
        <Heading size="sm" className="text-yellow-500">
          {rating.toFixed(1)}
        </Heading>
      </HStack>
    )}
    {reviewCount !== undefined && reviewCount >= 0 && (
      <Heading size="xs" className=" text-yellow-500">
        {reviewCount === 0
          ? "No reviews"
          : `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`}
      </Heading>
    )}
  </HStack>
);

export default RatingSection;
