import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
// import { Image } from "@/components/ui/image";
import { Button, ButtonIcon } from "@/components/ui/button";
import { ScrollView } from "@/components/ui/scroll-view";
import { ThreeDotsIcon } from "@/components/ui/icon";
import useGlobalStore from "@/store/globalStore";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Dimensions, View, StyleSheet, Image } from "react-native";

const { width } = Dimensions.get("window");

export function ImageScroll({ images }: { images: any[] }) {
  const imageUrls = (images || [])
    .map((img) => (typeof img === "string" ? img : img && (img.uri || img.url)))
    .filter(Boolean) as string[];

  let imageWidth;

  if (imageUrls.length === 1) {
    imageWidth = width; // full width
  } else if (imageUrls.length === 2) {
    imageWidth = width / 2 - 10; // half width per image
  } else {
    imageWidth = width / 3 - 12; // about 3 per view
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {imageUrls.map((img, idx) => (
        <View key={idx} style={[styles.imageContainer, { width: imageWidth }]}>
          <Image
            source={{ uri: img }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      ))}
      {imageUrls.map((img, idx) => (
        <View key={idx} style={[styles.imageContainer, { width: imageWidth }]}>
          <Image
            source={{ uri: img }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 6,
    backgroundColor: "#f9f9f9",
  },
  imageContainer: {
    marginRight: 6,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});

const FeaturedCompanies = () => {
  const { savedProviders: providers } = useGlobalStore();
  return (
    <VStack className="flex-1 mt-8 gap-2">
      <Heading size="xl" className="font-medium px-4 text-brand-primary">
        Featured Companies
      </Heading>
      {providers.map((provider) => (
        <VStack key={provider._id} className="justify-center h-80 bg-white">
          <HStack space="lg" className="items-center p-4 w-full">
            <Avatar size="md">
              <AvatarFallbackText>
                provider.activeRoleId?.providerName
              </AvatarFallbackText>
              <AvatarImage
                source={{
                  uri:
                    typeof provider.providerLogo === "string"
                      ? provider.providerLogo
                      : undefined,
                }}
              />
            </Avatar>
            <VStack className="justify-between">
              <Heading>{provider.providerName}</Heading>
              <Text>{provider.subcategories}</Text>
            </VStack>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto rotate-90 bg-gray-200 border-0"
            >
              <ButtonIcon as={ThreeDotsIcon} />
            </Button>
          </HStack>
          <ImageScroll images={provider.providerImages} />
        </VStack>
      ))}
    </VStack>
  );
};

export default FeaturedCompanies;
