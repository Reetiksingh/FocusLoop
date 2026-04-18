import axios from "axios";

const ACCESS_TOKEN_KEY = "lifepro_access_token";
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true
});

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

let refreshPromise = null;

api.interceptors.request.use(config => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes("/auth/");

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise =
        refreshPromise ||
        axios.post(
          `${baseURL}/auth/refresh`,
          {},
          {
            withCredentials: true
          }
        );

      const refreshResponse = await refreshPromise;
      const nextAccessToken = refreshResponse.data.accessToken;
      setStoredAccessToken(nextAccessToken);
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      setStoredAccessToken(null);
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  }
);
