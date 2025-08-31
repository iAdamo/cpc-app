import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";
import { Pressable } from "@/components/ui/pressable";
import { Card } from "@/components/ui/card";
import { ScrollView } from "react-native";

const Highlights = () => {
  const highlights = [
    {
      id: 1,
      title: "Highlight 1",
      imageUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 2,
      title: "Highlight 2",
      imageUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 3,
      title: "Highlight 3",
      imageUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 4,
      title: "Highlight 4",
      imageUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 5,
      title: "Highlight 5",
      imageUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 6,
      title: "Highlight 6",
      imageUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    // Add more highlights as needed
  ];
  return (
    <Card variant="ghost" className="gap-2 py-2 justify-center">
      <Text size="lg" className="text-brand-primary font-medium">
        Highlights
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 4 }}
      >
        <HStack space="md" className="">
          {highlights.map((highlight) => (
            <Pressable
              key={highlight.id}
              className="justify-center items-center gap-1"
            >
              <VStack className="bg-brand-secondary rounded-full p-0.5">
                <Image
                  source={{ uri: highlight.imageUrl }}
                  alt={highlight.title}
                  className="w-14 h-14 rounded-full border-2 border-white"
                />
              </VStack>
              <Text size="md">{highlight.title}</Text>
            </Pressable>
          ))}
        </HStack>
      </ScrollView>
    </Card>
  );
};

export default Highlights;
