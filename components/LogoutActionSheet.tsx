import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
} from "@/components/ui/actionsheet";
import { Heading } from "./ui/heading";
import { Text } from "@/components/ui/text";
import useGlobalStore from "@/store/globalStore";
import { router } from "expo-router";

const LogoutActionSheet = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { logout } = useGlobalStore();
  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <Heading className="my-4 text-gray-700 font-medium">
          Are you sure you want to logout?
        </Heading>
        <Text className="mb-4 text-gray-700">
          This action temporarily logs you off this device until you log in
          again.
        </Text>
        <ActionsheetItem
          onPress={onClose}
          className="border border-brand-primary/60 justify-center items-center rounded-xl p-3 mb-4"
        >
          <ActionsheetItemText className="text-brand-primary text-lg">
            Go back
          </ActionsheetItemText>
        </ActionsheetItem>
        <ActionsheetItem
          onPress={() => {
            logout();
            onClose();
            router.replace("/");
          }}
          className="bg-red-500 data-[active=true]:bg-red-400 border border-red-500 justify-center items-center rounded-xl p-3 mb-4"
        >
          <ActionsheetItemText className="text-white text-lg">
            Logout
          </ActionsheetItemText>
        </ActionsheetItem>
      </ActionsheetContent>
    </Actionsheet>
  );
};
export default LogoutActionSheet;
