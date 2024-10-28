import axios from 'axios';

// Function to save the new access token
const saveNewAccessToken = (newAccessToken : any) => {
    localStorage.setItem('token', newAccessToken);
};

const AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080'
});

// Add a response interceptor to handle token expiration
AxiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response) {
            console.error("Access token expired. Attempting to refresh token...");

            try {
                const refreshToken = localStorage.getItem('refreshToken'); // Assuming you store refresh token in local storage
                const refreshResponse = await AxiosInstance.post('/auth/refresh', {
                    refreshToken: refreshToken
                });

                const newAccessToken = refreshResponse.data.token;

                // Save new access token
                saveNewAccessToken(newAccessToken);

                // Set new access token in the original request headers
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                // Retry the original request with the new token
                return AxiosInstance(originalRequest);
            } catch (refreshError) {
                console.error("Refresh token expired or invalid. Redirecting to login.");
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default AxiosInstance;
