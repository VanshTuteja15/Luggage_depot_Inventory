import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'luggage_depot_session';

export async function getSessionItem(key: string = SESSION_KEY): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setSessionItem(
  value: string,
  key: string = SESSION_KEY
): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function removeSessionItem(key: string = SESSION_KEY): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
