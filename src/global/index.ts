export type GlobalState = {
    user: UserState;
};

export type UserState = {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string;
    user: UserInformation;
    booking : Booking[];
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
