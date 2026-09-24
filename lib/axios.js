import axios from "axios";

// One Axios instance for the whole app. Every API file in lib/api/*
// imports this instead of calling axios directly, so the token
// attachment and error handling below only has to be written once.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://dummyjson.com",
  timeout: 15000,
});

// --- Request interceptor: attach the logged-in user's token ---------
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("pad_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// --- Response interceptor: turn every failure into one shape --------
// Callers always receive: { message, status, isNetworkError }
// so components never need to know Axios's error format.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Requests we cancelled ourselves (e.g. a stale search reply that
    // lost the race to a newer one) should be silently swallow-able
    // by the caller, not turned into a user-facing error.
    if (axios.isCancel(error)) {
      return Promise.reject({ isCancelled: true, message: "Request cancelled" });
    }

    const status = error.response?.status;
    const isNetworkError = !error.response;

    let message = "Something went wrong. Please try again.";
    if (isNetworkError) {
      message = "Can't reach the server. Check your connection and retry.";
    } else if (status === 401) {
      message = "Your session has expired. Please log in again.";
    } else if (status === 404) {
      message = "We couldn't find that.";
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    // A 401 anywhere in the app means the token is no longer valid,
    // so we clear it and send the user back to the login page.
    if (status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("pad_token");
      window.localStorage.removeItem("pad_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject({ message, status, isNetworkError });
  }
);

export default api;
