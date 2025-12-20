// components/modals/NetworkErrorModal.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import useGlobalStore from "@/store/globalStore";
import { apiClient } from "@/services/axios/conf";

const NetworkErrorModal = () => {
  const { networkError, clearError, failedRequests } = useGlobalStore();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (networkError) {
      setRetryCount(failedRequests.length);
    }
  }, [networkError, failedRequests.length]);

  const handleRetry = useCallback(async () => {
    try {
      setIsRetrying(true);
      await apiClient.manualRetry();

      console.log("All pending requests have been retried.");

      // Wait a moment to show retry animation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      clearError();
    } catch (error) {
      console.error("Retry failed:", error);
    } finally {
      setIsRetrying(false);
    }
  }, [clearError]);

  const handleDismiss = useCallback(() => {
    apiClient.clearAllPendingRequests();
    console.log("All pending requests have been cleared.");

    clearError();
  }, [clearError]);

  if (!networkError) return null;

  return (
    <Modal
      visible={networkError}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        {Platform.OS === "ios" ? (
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            <ModalContent
              isRetrying={isRetrying}
              retryCount={retryCount}
              onRetry={handleRetry}
              onDismiss={handleDismiss}
            />
          </BlurView>
        ) : (
          <View style={[styles.blurContainer, styles.androidBackground]}>
            <ModalContent
              isRetrying={isRetrying}
              retryCount={retryCount}
              onRetry={handleRetry}
              onDismiss={handleDismiss}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

const ModalContent = ({
  isRetrying,
  retryCount,
  onRetry,
  onDismiss,
}: {
  isRetrying: boolean;
  retryCount: number;
  onRetry: () => void;
  onDismiss: () => void;
}) => (
  <View style={styles.modalContent}>
    <View style={styles.iconContainer}>
      <Text style={styles.icon}>📡</Text>
    </View>

    <Text style={styles.title}>No Internet Connection</Text>

    <Text style={styles.message}>
      {/* {retryCount > 0
        ? `${retryCount} request${
            retryCount > 1 ? "s" : ""
          } pending due to network issues.`
        : "Unable to connect to the server. Please check your internet connection."} */}
      Unable to connect. Please check your internet connection.
    </Text>

    {isRetrying ? (
      <View style={styles.retryContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.retryingText}>Retrying...</Text>
      </View>
    ) : (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.dismissButton]}
          onPress={onDismiss}
          activeOpacity={0.7}
          disabled={isRetrying}
        >
          <Text style={styles.dismissButtonText}>
            {retryCount > 0 ? "Cancel All" : "Dismiss"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.retryButton]}
          onPress={onRetry}
          activeOpacity={0.7}
          disabled={isRetrying}
        >
          <Text style={styles.retryButtonText}>
            {retryCount > 0 ? `Retry (${retryCount})` : "Try Again"}
          </Text>
        </TouchableOpacity>
      </View>
    )}

    <Text style={styles.hint}>
      Make sure you're connected to Wi-Fi or cellular data
    </Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blurContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  androidBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  retryContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  retryingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  dismissButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  retryButton: {
    backgroundColor: "#007AFF",
  },
  dismissButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
});

export default NetworkErrorModal;
