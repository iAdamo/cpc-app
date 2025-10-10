import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";

interface DateHeaderProps {
  title: string;
}

const DateHeader = ({ title }: DateHeaderProps) => {
  return (
    <HStack className="justify-center items-center my-4 px-4">
      <HStack className="bg-gray-100 px-4 py-2 rounded-full">
        <Text size="sm" className="text-gray-600 font-medium">
          {title}
        </Text>
      </HStack>
    </HStack>
  );
};

export default DateHeader;
