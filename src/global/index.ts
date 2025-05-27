import { number } from "yup";

export type GlobalState = {
    user: UserState;
};

export type UserState = {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserInformation;
    booking: Booking[];
};

export type UserInformation = {
    userId: string | number;
    email: string;
    role: string;
    imageUrl: string;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
    membershipLevel: string;
    points: number;
};

export type Booking = {
    ticketCodes: string[];
    pickupStopId: string;
    dropOffStopId: string;
    scheduleId: string;
};

export interface PaginatedResponse {
    data: Bus[];
    pagination: {
        totalPages: number;
        currentPage: number;
        totalElements: number;
    };
}

export interface Bus {
    busId: string;
    busImage: string;
    busType: string;
    licensePlate: string;
    totalSeats: number;
    floors: number;
    registrationExpiry: string;
    expirationDate: string;
}

export interface EstimatedPrice {
    totalPrice: number;
    unitPrice: number;
    quantity: number;
    seatNumbers: string[];
}

export interface TripInfo {
    departureTime: string;
    licensePlate: string;
    busType: string;
    pickupTime: string;
    pickupLocation: string;
    dropoffTime: string;
    dropoffLocation: string;
}

export interface BookingHistoryItem {
  bookingId: number;
  bookingDate: string;
  seatInfos: string;
  contactName: string;
  routeName: string;
  departureDate: string;
  pickupTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  licensePlate: string;
  contactEmail: string;
  originalPrice: string;
  discountedPrice: string | null;
  status: string;
  refundAmount: string | null;
  refundStatus: string | null;
  refundReason: string | null;
  refundDate: string | null;
  driverName: string | null;
  driverPhone: string | null;
}
