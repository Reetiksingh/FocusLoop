import { create } from "zustand";
import { api, setStoredAccessToken, getStoredAccessToken } from "../services/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  status: "idle",
  authMode: "login",
  error: "",

  setAuthMode: authMode => set({ authMode, error: "" }),

  hydrate: async () => {
    set({ status: "loading" });

    try {
      if (!getStoredAccessToken()) {
        const refreshResponse = await api.post("/auth/refresh");
        setStoredAccessToken(refreshResponse.data.accessToken);
      }

      try {
        const meResponse = await api.get("/auth/me");
        set({ user: meResponse.data.user, status: "authenticated", error: "" });
      } catch (error) {
        const refreshResponse = await api.post("/auth/refresh");
        setStoredAccessToken(refreshResponse.data.accessToken);
        const meResponse = await api.get("/auth/me");
        set({ user: meResponse.data.user, status: "authenticated", error: "" });
      }
    } catch (error) {
      setStoredAccessToken(null);
      set({ user: null, status: "anonymous", error: "" });
    }
  },

  register: async payload => {
    set({ status: "loading", error: "" });
    try {
      const response = await api.post("/auth/register", payload);
      setStoredAccessToken(response.data.accessToken);
      set({ user: response.data.user, status: "authenticated", error: "" });
    } catch (error) {
      set({
        status: "anonymous",
        error: error.response?.data?.message || "Registration failed."
      });
      throw error;
    }
  },

  login: async payload => {
    set({ status: "loading", error: "" });
    try {
      const response = await api.post("/auth/login", payload);
      setStoredAccessToken(response.data.accessToken);
      set({ user: response.data.user, status: "authenticated", error: "" });
    } catch (error) {
      set({
        status: "anonymous",
        error: error.response?.data?.message || "Login failed."
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      setStoredAccessToken(null);
      set({ user: null, status: "anonymous", error: "", authMode: "login" });
    }
  }
}));
