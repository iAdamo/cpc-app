import { useState, useRef, ChangeEvent } from "react";
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
  ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { HStack } from "@/components/ui/hstack";
import useGlobalStore from "@/store/globalStore";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { StarIcon } from "@/components/ui/icon";
import { createReview } from "@/services/axios/reviews";
import { ReviewData } from "@/types";
import MediaPicker from "../media/MediaPicker";
import appendFormData from "@/utils/AppendFormData";

interface ReviewModalProps {
  providerId: string;
  providerName: string;
  isOpen: boolean;
  onClose: () => void;
  setNewReviews: (newReview: ReviewData[]) => void;
}

const ReviewActionSheet: React.FC<ReviewModalProps> = (props) => {
  const { isOpen, onClose, providerId, providerName, setNewReviews } = props;
  const [description, setDesc] = useState("");
  const [rating, setRating] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const {
    selectedFiles,
    pickMedia,
    pickDocument,
    removeLocalFile,
    setProgress,
  } = useGlobalStore();

  const handleSubmit = async () => {
    if (!description.trim() || rating === 0) {
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();

      appendFormData(formData, {
        description: description,
        rating: rating.toString(),
        images: selectedFiles,
      });

      // console.log(
      //   "Submitting review with formData:",
      //   Array.from(formData.entries())
      // );

      const newReviews = await createReview(providerId, formData);
      setNewReviews([newReviews]);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setDesc("");
    setRating(0);
    useGlobalStore.setState({ selectedFiles: [] });
    setProgress(0);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Actionsheet
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={false}
    >
      <ActionsheetBackdrop />
      <ActionsheetContent style={{ maxHeight: "60%" }} className="w-full">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <ActionsheetItem>
          <ActionsheetItemText size="xl">
            Review {providerName}
          </ActionsheetItemText>
        </ActionsheetItem>
        <ActionsheetScrollView
          className=""
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          <HStack className="w-full items-center justify-center gap-4 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                variant="link"
                key={star}
                className="border-0 focus:outline-none" // Adjust padding for larger screens
                onPress={() => setRating(star)}
              >
                <ButtonIcon
                  as={StarIcon}
                  className={`${
                    star <= rating
                      ? "fill-yellow-400 stroke-yellow-400"
                      : "fill-transparent stroke-[#D1D5DB]"
                  } w-8 h-8`}
                />
              </Button>
            ))}
          </HStack>

          {/* Review Text */}
          <Textarea className="w-full h-32">
            <TextareaInput
              placeholder={`Share your experience with ${providerName}...`}
              value={description}
              onChangeText={(text) => setDesc(text)}
              className="text-lg"
            />
          </Textarea>

          {/* Image Upload Section */}

          <ActionsheetItem className="mt-4">
            <MediaPicker />
          </ActionsheetItem>
          <ActionsheetItem className="justify-between">
            <Button
              size="md"
              variant="outline"
              onPress={handleClose}
              disabled={isUploading}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size="md"
              className="bg-blue-500"
              onPress={handleSubmit}
              disabled={isUploading}
            >
              <ButtonText>
                {isUploading ? "Submitting..." : "Submit Review"}
              </ButtonText>
            </Button>
          </ActionsheetItem>
        </ActionsheetScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default ReviewActionSheet;
