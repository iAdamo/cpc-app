import * as SecureStore from "expo-secure-store";
import uuid from "react-native-uuid";

export async function getDeviceId() {
  let id = await SecureStore.getItemAsync("deviceId");

  if (!id) {
    id = uuid.v4();
    await SecureStore.setItemAsync("deviceId", id);
  }

  return id;
}

export async function getSessionId() {
  let id = await SecureStore.getItemAsync("sessionId");

  if (!id) {
    id = uuid.v4();
    await SecureStore.setItemAsync("sessionId", id);
  }

  return id;
}
