import { LOGIN_FAILURE, LOGIN_REQUEST, LOGIN_SUCCESS, LOGOUT } from "./actionsType";

export const loginRequest = () => ({
    type: LOGIN_REQUEST,
});

export const loginSuccess = (data : any) => ({
    type: LOGIN_SUCCESS,
    payload: data,
});

export const loginFailure = (error : any) => ({
    type: LOGIN_FAILURE,
    payload: error,
});


export const logout = () => ({
    type: LOGOUT,
});
