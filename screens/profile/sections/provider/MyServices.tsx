import { useState, useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { ScrollView, Keyboard } from "react-native";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Icon, ChevronLeftIcon } from "@/components/ui/icon";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  ModalBackdrop,
  ModalCloseButton,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import useGlobalStore from "@/store/globalStore";
import { SpeakerIcon, MegaphoneIcon } from "lucide-react-native";
import { getServicesByProvider } from "@/axios/service";
import EmptyState from "@/components/EmptyState";
import { ServiceData, FileType } from "@/types";

const MyServices = ({ providerId }: { providerId?: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isLoading } = useGlobalStore();

  // Placeholder for services data
  const [services, setServices] = useState<ServiceData[]>([]);

  useEffect(() => {
    console.log("User ID changed or component mounted, fetching services...");
    const fetchServices = async () => {
      const id = providerId || user?.activeRoleId?._id;

      if (id) {
        try {
          const response = await getServicesByProvider(id);
          if (response.length === 0) {
            setIsModalOpen(true);
            return;
          }
          console.log("Fetched services:", response);
          setServices(response || []);
        } catch (error) {
          console.error("Error fetching services:", error);
        }
      }
    };
    fetchServices();
  }, [providerId, user?.activeRoleId?._id]);

  const isEditable = !providerId;

  return (
    <VStack className="flex-1 bg-white">
      {isEditable && (
        <VStack className="flex-1 bg-white">
          <Button variant="outline" onPress={() => setIsModalOpen(true)}>
            <ButtonText>Add a Project</ButtonText>
          </Button>
          <CreateServiceModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </VStack>
      )}
      <EmptyState header="" text="" />
    </VStack>
  );
};
export default MyServices;

const CreateServiceModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { isLoading } = useGlobalStore();
  return (
    <Modal
      isOpen={!!isOpen}
      onClose={() => {
        onClose();
      }}
      closeOnOverlayClick={false}
    >
      <ModalBackdrop />
      <ModalContent className="flex-1 pt-16 w-full bg-white">
        <ModalHeader className="items-center justify-start gap-2">
          <ModalCloseButton className="flex flex-row items-center gap-2">
            <Icon size="xl" as={ChevronLeftIcon} />
          </ModalCloseButton>
          <Heading>New Service Project</Heading>
        </ModalHeader>
        <ModalBody className="gap-20 flex flex-col">
          <VStack className="mt-4 gap-4 items-center justify-center"></VStack>
        </ModalBody>
        <ModalFooter>
          <VStack className="gap-2 w-full mt-4">
            <Button
              size="xl"
              isDisabled={isLoading}
              className="w-full bg-brand-primary"
              onPress={() => {}}
            >
              <ButtonText>
                {isLoading ? <Spinner /> : "Change Password"}
              </ButtonText>
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
