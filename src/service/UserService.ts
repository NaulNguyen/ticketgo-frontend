import axios from "axios";
import { axiosWithJWT } from "../config/axiosConfig";

interface SaveBookingInfoRequest {
    ticketCodes: string[];
    pickupStopId: number;
    dropoffStopId: number;
    scheduleId: string;
}

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

    static async loginWithGoogle(googleToken: string) {
        try {
            const response = await axios.post(`${UserService.BASE_URL}/api/v1/auth/google-login`, {
                token: googleToken,
            });
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async forgotPassword(data: { email: string }) {
        const response = await axios.post(
            `${UserService.BASE_URL}/api/v1/auth/forgot-password`,
            data
        );
        return response;
    }

    static async resetPassword(data: { password: string; token: string }) {
        const response = await axios.post(
            `${UserService.BASE_URL}/api/v1/auth/reset-password`,
            data
        );
        return response;
    }

    static async ticketReserve(scheduleId: number | string) {
        try {
            const response = await axiosWithJWT.post(
                `${UserService.BASE_URL}/api/v1/seats/reserve`,
                {
                    scheduleId: Number(scheduleId)
                }
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async cancleTicketReserve() {
        try {
            const response = await axiosWithJWT.post(
                `${UserService.BASE_URL}/api/v1/seats/cancel-reserve`
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async bookingHistory() {
        try {
            const response = await axiosWithJWT.get(
                `${UserService.BASE_URL}/api/v1/bookings/history?pageNumber=1&pageSize=5`
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async savePriceAndTripInfo(data: SaveBookingInfoRequest) {
        try {
            const response = await axiosWithJWT.post(
                `${UserService.BASE_URL}/api/v1/bookings/info`, {
                    ticketCodes: data.ticketCodes,
                    pickupStopId: data.pickupStopId,
                    dropoffStopId: data.dropoffStopId,
                    scheduleId: data.scheduleId,
                }
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async getBookingInfo(scheduleId: string) {
        try {
            const response = await axiosWithJWT.get(
                `${UserService.BASE_URL}/api/v1/bookings/info`,
                {
                    params: { scheduleId }
                }
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async getRemainingTime(scheduleId: string, seatNumber: string) {
        try {
            const ticketCode = `TICKET-${scheduleId}-${seatNumber}`;
            const response = await axiosWithJWT.get(
                `${UserService.BASE_URL}/api/v1/tickets/${ticketCode}/remain-time`
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    static async vnPay({ fullName, email, phoneNumber, pickupStopId, dropOffStopId, estimatedPrice }: any) {
        try {
            const response = await axiosWithJWT.post(
                `${UserService.BASE_URL}/api/v1/payment/vnpay`,
                {
                    contactName: fullName,
                    contactEmail: email,
                    contactPhone: phoneNumber,
                    pickupStopId: pickupStopId,
                    dropoffStopId: dropOffStopId,
                    totalPrice: estimatedPrice.totalPrice,
                }
            );
            return response;
        } catch (error) {
            throw error;
        }
    }
}

export default UserService;
