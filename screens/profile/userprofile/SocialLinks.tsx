import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Link, LinkText } from "@/components/ui/link";
import { Button, ButtonIcon } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
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

type EditableFields = keyof UserData | keyof ProviderData;
type SocialPlatform =
  | "website"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "twitter"
  | "other";

interface SocialMediaDetailsProps {
  provider: ProviderData;
  isEditable: boolean;
  editingFields: Partial<Record<EditableFields, string>>;
  handleSave: () => void;
  handleEditStart: (fields: Partial<Record<EditableFields, string>>) => void;
  handleCancelEdit: () => void;
}

interface EditingState {
  platform: SocialPlatform | null;
  value: string;
}

const SocialMediaDetails = ({
  provider,
  isEditable,
  editingFields,
  handleSave,
  handleEditStart,
  handleCancelEdit,
}: SocialMediaDetailsProps) => {
  const isEditingPlatform = (platform: string) =>
    editingFields.hasOwnProperty(`providerSocialMedia.${platform}`);

  const platformPatterns: Record<string, RegExp> = {
    website: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/i,
    facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/.+/i,
    instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i,
    linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/.+/i,
    twitter: /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/.+/i,
    other: /^(https?:\/\/).+/i,
  };

  const platformPlaceholders: Record<string, string> = {
    website: "https://yourprovider.com",
    facebook: "https://facebook.com/yourpage",
    instagram: "https://instagram.com/yourprofile",
    linkedin: "https://linkedin.com/in/yourprovider",
    twitter: "https://x.com/yourhandle",
    other: "https://example.com",
  };

  const sanitizeAndValidateLink = (
    platform: string,
    link: string
  ): { link: string; isValid: boolean } => {
    let sanitized = link.trim();

    // Add https:// if missing
    if (!sanitized.startsWith("http://") && !sanitized.startsWith("https://")) {
      sanitized = `https://${sanitized}`;
    }

    // Validate against platform pattern
    const isValid = platformPatterns[platform].test(sanitized);

    return { link: sanitized, isValid };
  };

  return (
    <Card>
      <HStack className="flex-1 flex-wrap justify-between">
        {[
          "website",
          "facebook",
          "instagram",
          "linkedin",
          "twitter",
          "other",
        ].map((platform) => {
          const link =
            provider?.providerSocialMedia?.[platform as SocialPlatform];
          const editingKey =
            `providerSocialMedia.${platform}` as EditableFields;
          const isEditing = isEditingPlatform(platform);
          console.log({ platform, isEditing });
          const currentValue = isEditing
            ? editingFields[editingKey] || ""
            : link || "";
          const { isValid } = sanitizeAndValidateLink(platform, currentValue);

          return (
            <HStack key={platform} className="items-center mb-3 gap-1 w-[49%]">
              <Icon
                size="sm"
                as={
                  {
                    website: GlobeIcon,
                    facebook: FacebookIcon,
                    instagram: InstagramIcon,
                    linkedin: LinkedInIcon,
                    twitter: TwitterIcon,
                    other: ExternalLinkIcon,
                  }[platform]
                }
                className={`text-brand-secondary ${
                  platform === "other" || platform === "website"
                    ? "fill-none"
                    : "fill-brand-secondary "
                }`}
              />
              {isEditing ? (
                <FormControl className="items-end gap-2 flex-1">
                  <Input className="w-full h-10" variant="underlined">
                    <InputField
                      value={currentValue}
                      onChangeText={(text) => {
                        const { link: sanitized } = sanitizeAndValidateLink(
                          platform,
                          text
                        );
                        handleEditStart({ [editingKey]: sanitized });
                      }}
                      placeholder={platformPlaceholders[platform]}
                      autoFocus
                      className={`text-sm ${
                        !isValid && currentValue ? "border-red-500" : ""
                      }`}
                    />
                  </Input>
                  {!isValid && currentValue && (
                    <Text size="xs" className="text-red-500 self-start">
                      Please enter a valid {platform} URL
                    </Text>
                  )}
                  <HStack className="gap-2 mb-2">
                    <Button
                      size="sm"
                      variant="link"
                      onPress={handleSave}
                      disabled={!isValid}
                      className="p-0 h-4"
                    >
                      <ButtonIcon as={CheckIcon} />
                    </Button>
                    <Button
                      size="sm"
                      variant="link"
                      onPress={handleCancelEdit}
                      className="p-0 h-4"
                    >
                      <ButtonIcon as={CloseIcon} />
                    </Button>
                  </HStack>
                </FormControl>
              ) : (
                <HStack className="justify-between items-center flex-1">
                  {link ? (
                    <Link href={link}>
                      <LinkText
                        size="md"
                        className="font-semibold no-underline"
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </LinkText>
                    </Link>
                  ) : (
                    <Text
                      size="md"
                      className="text-gray-500 font-semibold italic"
                    >
                      No link added
                    </Text>
                  )}
                  {isEditable && (
                    <Button
                      size="xs"
                      variant="link"
                      onPress={() =>
                        handleEditStart({ [editingKey]: link || "" })
                      }
                      className="w-6 h-6"
                    >
                      <ButtonIcon as={PencilLineIcon} />
                    </Button>
                  )}
                </HStack>
              )}
            </HStack>
          );
        })}
      </HStack>
    </Card>
  );
};

export default SocialMediaDetails;
