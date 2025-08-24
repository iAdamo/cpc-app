import { useState, useRef } from "react";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import useGlobalStore from "@/store/globalStore";
import { Button, ButtonText } from "@/components/ui/button";
import { ImageBackground, StyleSheet } from "react-native";
// Removed LinearGradient import, will use View with Tailwind for gradient
import { LinearGradient } from "expo-linear-gradient";
import OnboardingProgess from "@/components/OnboardingProgress";
import PagerView from "react-native-pager-view";
import { Image } from "@/components/ui/image";
import { Link } from "expo-router";

const FirstOnboardingPage = () => {
  const { setCurrentStep } = useGlobalStore();
  const [page, setPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleNext = () => {
    if (page < views.length - 1) {
      setPage(page + 1);
      pagerRef.current?.setPage(page + 1);
    }
  };

  const styles = StyleSheet.create({
    background: {
      width: "100%",
      height: "100%",
    },
    doodleBackground: {
      width: "100%",
      height: "100%",
      opacity: 0.2,
    },
  });

  const views = [
    {
      id: 1,
      title: "Welcome to Companies Center: Your Gateway to Skilled Services",
      description:
        "Seamlessly connect with trusted companies to get things done, anytime, anywhere.",
      image: require("@/assets/images/onboarding-bg.jpg"),
    },
    {
      id: 2,
      title: "Discover and Hire Trusted Companies with Ease",
      description:
        "Browse verified companies, read reviews, and hire the best fit for your needs.",
      image: require("@/assets/images/onboarding-bg2.jpg"),
    },
    {
      id: 3,
      title: "Track Progress and Communicate Seamlessly",
      description:
        "Stay updated with real-time progress tracking and in-app messaging.",
      image: require("@/assets/images/onboarding-bg2.jpg"),
    },
    {
      id: 4,
      title: "Connecting You to Trusted Professionals in Your Area",
      description:
        "Quickly find skilled service providers and get quality services delivered to your doorstep.",
      imagedb: require("@/assets/images/doodle-bg.png"),
    },
  ];

  return (
    <VStack className="h-full">
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {views.map((view: any) => (
          <VStack key={view.id} className="h-full">
            <ImageBackground
              source={view.image}
              style={styles.background}
              resizeMode="cover"
            >
              <VStack
                className={`justify-between h-full p-4 ${
                  page !== views.length - 1 && "bg-black/40"
                }`}
              >
                <Heading
                  size="xl"
                  className={`${
                    page === views.length - 1
                      ? "text-brand-primary"
                      : "text-white"
                  } text-center mt-20`}
                >
                  {view.title}
                </Heading>
                {view.imagedb && (
                  <HStack className="justify-center items-center relative">
                    <Image
                      source={view.imagedb}
                      className="w-96 h-96 absolute opacity-10 z-0 rounded-xl"
                      alt="Doodle Background"
                    />
                    <LinearGradient
                      colors={["#ffffff20", "#2563eb70"]}
                      style={{
                        position: "absolute",
                        width: 320,
                        height: 320,
                        borderRadius: 8,
                        zIndex: 10,
                      }}
                      start={{ x: 1, y: 1 }}
                      end={{ x: 1, y: 0 }}
                    />
                    <Image
                      source={require("@/assets/images/doodle-center.png")}
                      alt="Doodle Center"
                      className="w-80 h-80 absolute "
                    />
                  </HStack>
                )}
                <VStack className="gap-8 mb-10">
                  <Text
                    size="lg"
                    className={`${
                      page === views.length - 1
                        ? "text-typography-600"
                        : "text-white"
                    } text-center font-medium`}
                  >
                    {view.description}
                  </Text>
                  <OnboardingProgess />
                  {page !== views.length - 1 && (
                    <Button
                      size="xl"
                      className="bg-brand-primary"
                      onPress={handleNext}
                    >
                      <ButtonText>Next</ButtonText>
                    </Button>
                  )}
                  <Button
                    size="xl"
                    variant={page === views.length - 1 ? "solid" : "outline"}
                    onPress={() => setCurrentStep(2)}
                    className={`${
                      page === views.length - 1
                        ? "bg-brand-primary"
                        : "border-0 bg-white/20"
                    } w-full data-[hover=true]:bg-gray-100`}
                  >
                    <ButtonText
                      className={`${
                        page !== views.length - 1 && "text-brand-primary"
                      }`}
                    >
                      {page === views.length - 1 ? "Get Started" : "Skip"}
                    </ButtonText>
                  </Button>
                  {page === views.length - 1 && (
                    <Text size="lg" className="font-medium text-center">
                      Already Have an Account?{" "}
                      <Link
                        href="/auth/signin"
                        className="text-brand-secondary"
                      >
                        Login
                      </Link>
                    </Text>
                  )}
                </VStack>
              </VStack>
            </ImageBackground>
          </VStack>
        ))}
      </PagerView>
    </VStack>
  );
};

export default FirstOnboardingPage;
