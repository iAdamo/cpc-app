import {
  UserRoundIcon,
  BookmarkCheckIcon,
  StarIcon,
  NavigationIcon,
  SettingsIcon,
  BellDotIcon,
  SirenIcon,
  HandshakeIcon,
  MessageCircleQuestionMarkIcon,
  UserStarIcon,
  Building2Icon,
  BriefcaseBusinessIcon
} from "lucide-react-native";
import { router } from "expo-router";

export const ProfileSections = [
  {
    title: "Companies Center",
    items: [
      {
        text: "My Companies",
        icon: Building2Icon,
        action: () =>
          router.push({
            pathname: "/profile",
            params: { section: "my-companies" },
          }),
        showFor: "Provider",
      },
      {
        text: "Personal Information",
        icon: UserRoundIcon,
        action: () =>
          router.push({
            pathname: "/profile",
            params: { section: "personal-info" },
          }),
        showFor: "Both",
      },
      {
        text: "My Services",
        icon: BriefcaseBusinessIcon,
        action: () =>
          router.push({
            pathname: "/profile",
            params: { section: "my-services" },
          }),
        showFor: "Provider",
      },
      {
        text: "Saved Companies",
        icon: BookmarkCheckIcon,
        action: () =>
          router.push({
            pathname: "/profile",
            params: { section: "saved-companies" },
          }),
        showFor: "Client",
      },
      {
        text: "Reviews & Ratings",
        icon: StarIcon,
        action: () =>
          router.push({
            pathname: "/profile",
            params: { section: "reviews-ratings" },
          }),
        showFor: "Both",
      },
      {
        text: "Invite Friends",
        icon: NavigationIcon,
        action: () =>
          router.push({
            pathname: "/profile",
            params: { section: "invite-friends" },
          }),
        showFor: "Both",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        text: "Account",
        icon: SettingsIcon,
        action: () =>
          router.push({
            pathname: "/profile",
            params: { section: "settings" },
          }),
        showFor: "Both",
      },
      {
        text: "Notifications",
        icon: BellDotIcon,
        action: () => router.push("/profile/notifications"),
        showFor: "Both",
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        text: "Customer Support",
        icon: MessageCircleQuestionMarkIcon,
        action: () => router.push("/profile/privacy-policy"),
        showFor: "Both",
      },
      {
        text: "Rate Us",
        icon: UserStarIcon,
        action: () => router.push("/profile/privacy-policy"),
        showFor: "Both",
      },
      {
        text: "Privacy Policy",
        icon: SirenIcon,
        action: () => router.push("/profile/privacy-policy"),
        showFor: "Both",
      },
      {
        text: "Terms & Conditions",
        icon: HandshakeIcon,
        action: () => router.push("/profile/terms"),
        showFor: "Both",
      },
    ],
  },
];
