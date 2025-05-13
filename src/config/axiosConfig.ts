import axios, { AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const API_URL = "https://ticketgo.site";

// Axios instances
const axiosWithJWT = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

const axiosWithoutJWT = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Helper to retrieve tokens
const getAccessToken = () => Cookies.get("accessToken");
const getRefreshToken = () => Cookies.get("refreshToken");

// Request interceptor for axiosWithJWT
axiosWithJWT.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();
        if (accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Token refreshing logic
let isRefreshing = false;
let subscribers: ((token: string) => void)[] = [];

const addSubscriber = (callback: (token: string) => void) => {
    subscribers.push(callback);
};

const notifySubscribers = (token: string) => {
    subscribers.forEach((callback) => callback(token));
    subscribers = [];
};

// Response interceptor for axiosWithJWT
axiosWithJWT.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // If the user is logged out, prevent further requests from trying to refresh tokens
        if (!getAccessToken() || !getRefreshToken()) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // Wait for the token to be refreshed
                return new Promise((resolve) => {
                    addSubscriber((newToken) => {
                        if (originalRequest.headers) {
                            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                        }
                        resolve(axiosWithJWT(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    // If there's no refresh token, log the user out
                    throw new Error("Refresh token not available");
                }

                const { data } = await axiosWithoutJWT.post("/api/v1/auth/refresh-token", {
                    refreshToken,
                });
                const newAccessToken = data.data.accessToken;

                // Save the new access token
                Cookies.set("accessToken", newAccessToken);

                notifySubscribers(newAccessToken);

                isRefreshing = false;

                if (originalRequest.headers) {
                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                }

                return axiosWithJWT(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                // Remove tokens and redirect to login
                Cookies.remove("accessToken");
                Cookies.remove("refreshToken");
                toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                window.location.href = "/"; // Redirect to login page
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { axiosWithJWT, axiosWithoutJWT };
