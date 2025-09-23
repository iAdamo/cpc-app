import { useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Link, LinkText } from "@/components/ui/link";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { Input, InputField, InputSlot, InputIcon } from "@/components/ui/input";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
} from "@/assets/icons/CustomIcon";
import {
  Icon,
  ExternalLinkIcon,
  GlobeIcon,
  EditIcon,
  CheckIcon,
  CloseIcon,
} from "@/components/ui/icon";
import { PencilLineIcon } from "lucide-react-native";
import { UserData, ProviderData } from "@/types";
import useGlobalStore from "@/store/globalStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import {
  SocialMediaFormData,
  socialMediaSchema,
} from "@/components/schema/SocialMediaSchema";

type SocialPlatform = keyof SocialMediaFormData;

interface SocialMediaDetailsProps {
  provider: ProviderData;
  isEditable: boolean;
  onUpdate?: (data: SocialMediaFormData) => Promise<void>;
}

interface EditingState {
  platform: SocialPlatform | null;
}

const SocialMediaDetails = ({
  provider,
  isEditable,
}: SocialMediaDetailsProps) => {
  const { updateUserProfile } = useGlobalStore();

  const form = useForm<SocialMediaFormData>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      website: provider?.providerSocialMedia?.website || "",
      facebook: provider?.providerSocialMedia?.facebook || "",
      instagram: provider?.providerSocialMedia?.instagram || "",
      linkedin: provider?.providerSocialMedia?.linkedin || "",
      twitter: provider?.providerSocialMedia?.twitter || "",
      tiktok: provider?.providerSocialMedia?.tiktok || "",
    },
    mode: "onChange",
  });

  const [editingState, setEditingState] = useState<EditingState>({
    platform: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fields = [
    {
      label: "Website",
      platform: "website" as SocialPlatform,
      placeholder: "https://yourprovider.com",
      icon: GlobeIcon,
    },
    {
      label: "Facebook",
      platform: "facebook" as SocialPlatform,
      placeholder: "https://facebook.com/yourpage",
      icon: FacebookIcon,
    },
    {
      label: "Instagram",
      platform: "instagram" as SocialPlatform,
      placeholder: "https://instagram.com/yourprofile",
      icon: InstagramIcon,
    },
    {
      label: "LinkedIn",
      platform: "linkedin" as SocialPlatform,
      placeholder: "https://linkedin.com/in/yourprovider",
      icon: LinkedInIcon,
    },
    {
      label: "Twitter/X",
      platform: "twitter" as SocialPlatform,
      placeholder: "https://x.com/yourhandle",
      icon: TwitterIcon,
    },
    {
      label: "Other",
      platform: "tiktok" as SocialPlatform,
      placeholder: "https://tiktok.com/@yourhandle",
      icon: ExternalLinkIcon,
    },
  ];

  // Sanitize URL by ensuring it has a protocol
  const sanitizeUrl = (url: string): string => {
    if (!url) return "";

    const trimmed = url.trim();
    if (!trimmed) return "";

    // If it already has http:// or https://, return as is
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }

    // Add https:// by default
    return `https://${trimmed}`;
  };

  const handleEditStart = (platform: SocialPlatform) => {
    setEditingState({ platform });
  };

  const handleEditCancel = () => {
    // Reset the field value to original when canceling
    if (editingState.platform) {
      const originalValue =
        provider?.providerSocialMedia?.[editingState.platform] || "";
      form.setValue(editingState.platform, originalValue);
    }
    setEditingState({ platform: null });
  };

  const handleSave = async (platform: SocialPlatform) => {
    try {
      setIsSubmitting(true);

      await form.trigger(platform);
      const hasErrors = form.formState.errors[platform];
      if (hasErrors) return;

      const currentValue = form.getValues(platform);
      const sanitizedValue = sanitizeUrl(currentValue ?? "");
      if (currentValue !== sanitizedValue) {
        form.setValue(platform, sanitizedValue);
      }

      const formDataToSend = new FormData();
      if (sanitizedValue && sanitizedValue.trim() !== "") {
        formDataToSend.append(
          `providerSocialMedia[${platform}]`,
          sanitizedValue
        );
      }
      // console.log(
      //   "Submitting social media:",
      //   Array.from(formDataToSend.entries())
      // );
      await updateUserProfile("Provider", formDataToSend);

      setEditingState({ platform: null });
    } catch (error) {
      console.error("Error updating social media:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const getDisplayUrl = (url: string): string => {
    if (!url) return "";

    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url; // Return original if URL parsing fails
    }
  };

  const getFieldError = (platform: SocialPlatform): string | undefined => {
    return form.formState.errors[platform]?.message;
  };

  const isFieldDirty = (platform: SocialPlatform): boolean => {
    const originalValue = provider?.providerSocialMedia?.[platform] || "";
    const currentValue = form.getValues(platform) || "";
    return originalValue !== currentValue;
  };

  return (
    <Card>
      <HStack className="flex-1 flex-wrap justify-between">
        {fields.map((field) => {
          const isEditing = editingState.platform === field.platform;
          const currentValue = form.watch(field.platform);
          const hasError = !!getFieldError(field.platform);
          // const isDirty = isFieldDirty(field.platform);
          const displayUrl = getDisplayUrl(currentValue ?? "");

          return (
            <VStack key={field.platform} className="mb-4 w-[49%] ">
              <HStack className="items-center gap-3">
                <Icon
                  size="sm"
                  as={field.icon}
                  className={`${
                    field.platform === "tiktok" || field.platform === "website"
                      ? "fill-none text-brand-secondary"
                      : "fill-brand-secondary text-brand-secondary"
                  }`}
                />

                {isEditing ? (
                  <FormControl className="flex-1">
                    <VStack className="flex-1">
                      <Input className="h-10" variant="underlined">
                        <InputField
                          {...form.register(field.platform)}
                          placeholder={field.placeholder}
                          value={currentValue}
                          onChangeText={(formValue) =>
                            form.setValue(field.platform, formValue)
                          }
                          onSubmitEditing={() => handleSave(field.platform)}
                          returnKeyType="done"
                          autoCapitalize="none"
                          autoFocus
                          className={`text-sm ${
                            hasError ? "border-red-500" : ""
                          }`}
                          onBlur={() => {
                            form.setValue(
                              field.platform,
                              sanitizeUrl(currentValue ?? "")
                            ),
                              form.trigger(field.platform);
                          }}
                        />
                      </Input>

                      {hasError && (
                        <Text size="xs" className="text-red-500 mt-1">
                          {getFieldError(field.platform)}
                        </Text>
                      )}
                    </VStack>
                  </FormControl>
                ) : (
                  <HStack className="justify-between items-center flex-1">
                    {currentValue ? (
                      <Link href={currentValue} className="flex-1">
                        <VStack>
                          <LinkText
                            size="md"
                            className="font-semibold no-underline"
                          >
                            {field.label}
                          </LinkText>
                          {/* <Text size="sm" className="text-gray-600 truncate">
                            {displayUrl}
                          </Text> */}
                        </VStack>
                      </Link>
                    ) : (
                      <Text
                        size="md"
                        className="text-gray-500 font-semibold italic flex-1"
                      >
                        No link added
                      </Text>
                    )}

                    {isEditable && (
                      <Button
                        size="xs"
                        variant="link"
                        onPress={() => handleEditStart(field.platform)}
                        className="w-6 h-6 ml-2"
                      >
                        <ButtonIcon as={PencilLineIcon} />
                      </Button>
                    )}
                  </HStack>
                )}
              </HStack>
            </VStack>
          );
        })}
      </HStack>
      {isEditable && editingState.platform && (
        <HStack className="gap-2 mt-2 justify-end">
          <Button
            size="xs"
            variant="outline"
            onPress={() => handleSave(editingState.platform!)}
            isDisabled={
              isSubmitting ||
              !editingState.platform ||
              // !!getFieldError(editingState.platform) ||
              !isFieldDirty(editingState.platform)
            }
            className="bg-brand-secondary/30 border-0"
          >
            <ButtonText>{isSubmitting ? "Saving..." : "Update"}</ButtonText>
          </Button>
          <Button
            size="xs"
            variant="outline"
            onPress={handleEditCancel}
            disabled={isSubmitting}
            className="bg-gray-200/50 border-0"
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
        </HStack>
      )}
    </Card>
  );
};

export default SocialMediaDetails;
