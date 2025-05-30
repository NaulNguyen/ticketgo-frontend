import { LOGOUT, ASYNC_USER_INFOR, BOOKING } from "../actions/actionsType";
import { Booking, UserState } from "../global";

const initialState: UserState = {
    isAuthenticated: false,
    isLoading: false,
    user: {
        userId: "",
        email: "",
        role: "",
        imageUrl: "",
        fullName: "",
        phoneNumber: "",
        dateOfBirth: "",
        membershipLevel: "",
        points: 0,
    },
    booking: [] as Booking[],
};

const userReducer = (state = initialState, action: any): UserState => {
    switch (action.type) {
        case ASYNC_USER_INFOR:
            return {
                ...state,
                isAuthenticated: true,
                isLoading: false,
                user: { ...action.payload.data },
            };
        case BOOKING:
            return {
                ...state,
                booking: [...state.booking, action.payload],
            };
        case LOGOUT:
            return { ...initialState };
        default:
            return state;
    }
};

export default userReducer;
