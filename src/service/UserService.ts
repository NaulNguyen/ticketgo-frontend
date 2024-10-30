import axios from "axios";
import { axiosWithJWT } from "../config/axiosConfig";

class UserService {
    static BASE_URL = "http://localhost:8080";

    static async register(userData: any) {
        try {
            const response = await axios.post(
                `${UserService.BASE_URL}/api/v1/auth/register`,
                userData
            );
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    static async login(userData: any) {
        try {
            const response = await axios.post(
                `${UserService.BASE_URL}/api/v1/auth/login`,
                userData,
                { headers: { "Content-Type": "application/json" } }
            );
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    static async fetchUserInfor() {
        try {
            const response = await axiosWithJWT.get(`/api/v1/users/me`);
            if (response.status === 200) {
                console.log("User info APi:", response.data);
                return response.data; // Return user info directly
            } else {
                throw new Error(`Unexpected response status: ${response.status}`);
            }
        } catch (err: any) {
            // Log the error details
            console.error(
                "Error fetching user info:",
                err.response ? err.response.data : err.message
            );
            throw err;
        }
    }
}

export default UserService;
