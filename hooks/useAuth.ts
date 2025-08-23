import useGlobalStore from "@/store/globalStore";

export const useAuth = () => {
  const {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    signUp,
    login,
    forgotPassword,
    verifyPhone,
    verifyEmail,
    resetPassword,
    logout,
    clearError,
  } = useGlobalStore();

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    signUp,
    login,
    forgotPassword,
    verifyPhone,
    verifyEmail,
    resetPassword,
    logout,
    clearError,
  };
};
