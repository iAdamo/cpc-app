import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Icon, ChevronRightIcon } from "@/components/ui/icon";
import { ScrollView } from "@/components/ui/scroll-view";
import { ProfileSections } from "./SectionList";
import useGlobalStore from "@/store/globalStore";

interface SectionProps {
  title: string;
  items: { text: string; icon: any; action: () => void }[];
}

const ProfileSection = () => {
  const { switchRole } = useGlobalStore();
  const role = switchRole; // "Client" or "Provider"

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {ProfileSections.map((section, idnx) => (
        <VStack key={idnx} className="mt-4">
          <Heading
            className={`px-4 mb-4 ${
              switchRole === "Client"
                ? "text-brand-primary"
                : "text-brand-secondary"
            }`}
          >
            {section.title}
          </Heading>
          <VStack className="bg-white border-y border-gray-200">
            {section.items
              .filter(
                (item) => item.showFor === "Both" || item.showFor === role
              )
              .map((item, idx) => (
                <Pressable
                  key={idx}
                  className="flex flex-row items-center gap-4 pl-4 data-[active=true]:bg-gray-100"
                  onPress={item.action}
                >
                  <Icon
                    as={item.icon}
                    className={`w-7 h-7 ${
                      switchRole === "Client"
                        ? "text-brand-primary"
                        : "text-brand-secondary"
                    }`}
                  />
                  <HStack
                    className={`flex-1 py-5 pr-4 items-center justify-between ${
                      idx !== section.items.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    <Text size="xl">{item.text}</Text>
                    <Icon
                      as={ChevronRightIcon}
                      className="w-6 h-6 text-gray-400"
                    />
                  </HStack>
                </Pressable>
              ))}
          </VStack>
        </VStack>
      ))}
    </ScrollView>
  );
};

export default ProfileSection;
