import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT } from "../actions/actionsType";
import { LoginState } from "../global";

const initialState: LoginState = {
    isAuthenticated: false,
    isLoading: false,
    error: "",
    user: {
        email: "",
        role: "",
        imageUrl: "",
        fullName: "",
        phoneNumber: "",
        dateOfBirth: "",
    },
};

const loginReducer = (state = initialState, action: any): LoginState => {
    switch (action.type) {
        case LOGIN_REQUEST:
            return { ...state, isLoading: true, error: "" };
        case LOGIN_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                isLoading: false,
                error: "",
                user: { ...action.payload.user }, // Ensure this structure matches your user data
            };
        case LOGIN_FAILURE:
            return { ...state, isLoading: false, error: action.payload };
        case LOGOUT:
            return { ...initialState };
        default:
            return state;
    }
};

export default loginReducer;
