import { VStack } from "@/components/ui/vstack";
import ImageHeader from "./ImageHeader";
import ProfileInfo from "./ProfileInfo";
import Highlights from "./Highlights";
import MoreInfo from "./MoreInfo";
import useGlobalStore from "@/store/globalStore";
import { useLocalSearchParams } from "expo-router";

const ProviderInfo = () => {
  const { searchResults } = useGlobalStore();
  console.log("Search Results in Profile Screen:", searchResults);
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log("Profile ID from params:", id);
const data = [
    {
      id: 1,
      providerName: "John's Plumbing",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription:
        "Expert plumbing services for residential and commercial needs.",
      rating: 4.8,
      reviews: 120,
      location: "New York, NY",
      category: "Plumbing",
    },
    {
      id: 2,
      providerName: "Bright Electricians",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription: "Professional electrical installations and repairs.",
      rating: 4.6,
      reviews: 95,
      location: "Los Angeles, CA",
      category: "Electrical",
    },
    {
      id: 3,
      providerName: "Sparkle Cleaners",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription: "Top-notch cleaning services for homes and offices.",
      rating: 4.9,
      reviews: 150,
      location: "Chicago, IL",
      category: "Cleaning",
    },
    {
      id: 4,
      providerName: "Handy Carpentry",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription: "Custom carpentry solutions for all your needs.",
      rating: 4.7,
      reviews: 80,
      location: "Houston, TX",
      category: "Carpentry",
    },
    {
      id: 5,
      providerName: "Pro Painters",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription:
        "Quality painting services for interiors and exteriors.",
      rating: 4.5,
      reviews: 60,
      location: "Phoenix, AZ",
      category: "Painting",
    },
    {
      id: 6,
      providerName: "Green Thumb Landscaping",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription: "Beautiful landscaping and lawn care services.",
      rating: 4.8,
      reviews: 110,
      location: "Philadelphia, PA",
      category: "Landscaping",
    },
    {
      id: 7,
      providerName: "Swift Movers",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription:
        "Reliable moving services for local and long-distance moves.",
      rating: 4.6,
      reviews: 70,
      location: "San Antonio, TX",
      category: "Moving",
    },
    {
      id: 8,
      providerName: "PestAway Control",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription:
        "Effective pest control solutions for homes and businesses.",
      rating: 4.7,
      reviews: 85,
      location: "San Diego, CA",
      category: "Pest Control",
    },
    {
      id: 9,
      providerName: "Cool Air HVAC",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription: "Expert HVAC installation and repair services.",
      rating: 4.9,
      reviews: 130,
      location: "Dallas, TX",
      category: "HVAC",
    },
    {
      id: 10,
      providerName: "FixIt Appliance Repair",
      profilePicture: "https://randomuser.me/api/portraits",
      providerDescription:
        "Trusted appliance repair services for all major brands.",
      rating: 4.5,
      reviews: 55,
      location: "San Jose, CA",
      category: "Appliance Repair",
    },
  ];
  // check for the id in searchResults or data
  const provider =
    searchResults?.providers.find((p) => p.id === id) ||
    data.find((p) => p.id.toString() === id) ||
    null;
 // const provider = searchResults.providers.find((p) => p.id === id) || null;
  console.log("Provider found:", provider);

  return (
    <VStack className="flex-1 bg-white">
      <ImageHeader provider={provider} />
      {/* Profile Info Section */}
      <ProfileInfo provider={provider} />
      <Highlights provider={provider} />
      <MoreInfo provider={provider} />
    </VStack>
  );
};

export default ProviderInfo;
