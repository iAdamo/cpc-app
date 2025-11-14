import React from "react";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";
import { Heading } from "./ui/heading";
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "./ui/avatar";
import { MediaItem, ProviderData, UserData } from "@/types";
import RatingSection from "./RatingFunction";

const getAvatarUri = (maybe: any) => {
  if (!maybe) return undefined;
  if (typeof maybe === "string") return maybe;
  // MediaItem or FileType may have thumbnail or url
  return maybe.thumbnail || maybe.url || undefined;
};

const ProfileAvatar = ({
  user,
  provider,
}: {
  user?: UserData;
  provider?: ProviderData;
}) => {
  // prefer provider if provided, otherwise fall back to user
  const displayName =
    provider?.providerName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const avatarSource = provider?.providerLogo
    ? getAvatarUri(provider.providerLogo)
    : user?.profilePicture
    ? getAvatarUri(user.profilePicture)
    : undefined;
  const rating = provider?.averageRating ?? user?.averageRating ?? 0;
  const reviewCount = provider?.reviewCount ?? user?.reviewCount ?? 0;

  return (
    <HStack className="gap-4 items-start">
      <Avatar size="md">
        <AvatarFallbackText>
          {displayName ? displayName.charAt(0) : "U"}
        </AvatarFallbackText>
        {avatarSource && (
          <AvatarImage
            source={{ uri: avatarSource }}
            accessibilityLabel={`${displayName} avatar`}
          />
        )}
      </Avatar>

      <VStack>
        <Heading className="text-brand-primary">
          {displayName}
        </Heading>
        <RatingSection rating={rating} reviewCount={reviewCount} />
      </VStack>
    </HStack>
  );
};

export default ProfileAvatar;
