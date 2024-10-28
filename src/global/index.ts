export type GlobalState = {
    login: LoginState;
};

export type LoginState = {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string;
    user: UserInformation;
};

export type UserInformation = {
    email: string;
    role: string;
    imageUrl: string;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
};

export type BusCompany = {
    email: string;
    role: string;
    imageUrl: string;
    busCompanyName: string;
    contactEmail: string;
    address: string;
    description: string;
    isAuthenticated: boolean;
}