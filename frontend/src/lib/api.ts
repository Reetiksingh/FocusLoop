export type ApiEnvelope<T> = {
  data: T;
  timestamp: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("focusloop.accessToken");
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers
    }
  });
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}
