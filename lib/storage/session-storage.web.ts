const SESSION_KEY = 'luggage_depot_session';

export async function getSessionItem(key: string = SESSION_KEY): Promise<string | null> {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setSessionItem(
  value: string,
  key: string = SESSION_KEY
): Promise<void> {
  localStorage.setItem(key, value);
}

export async function removeSessionItem(key: string = SESSION_KEY): Promise<void> {
  localStorage.removeItem(key);
}
