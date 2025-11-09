
export default ({ config }) => {
  const apiUrl = process.env.CC_PUBLIC_API_URL || "";
  const socketUrl = process.env.CC_SOCKET_URL || "";
  const socketPath = process.env.CC_SOCKET_PATH || "";
  const googleMapsKey = process.env.CC_GOOGLE_MAPS_API_KEY || "";
  const easProjectId =
    process.env.CC_PROJECT_ID || (config.extra?.eas?.projectId ?? "");

  return {
    ...config,
    name: "CompaniesCenter",
    slug: "companiescenterllc",
    extra: {
      ...(config.extra || {}),
      apiUrl: apiUrl,
      socketUrl: socketUrl,
      socketPath: socketPath,
      googleMapsApiKey: googleMapsKey,
      eas: {
        ...(config.extra?.eas || {}),
        projectId: easProjectId,
      },
    },
    android: {
      ...(config.android || {}),
      config: {
        ...(config.android?.config || {}),
        googleMaps: {
          apiKey: googleMapsKey,
        },
      },
    },
  };
};
