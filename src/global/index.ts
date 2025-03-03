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
    email: string;
    role: string;
    imageUrl: string;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
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
    ticketCode: string;
    contactName: string;
    routeName: string;
    departureDate: string;
    pickupTime: string;
    pickupLocation: string;
    dropoffLocation: string;
    seatNumber: string;
    licensePlate: string;
    contactEmail: string;
    price: string;
    status: string;
}
