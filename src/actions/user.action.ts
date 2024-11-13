import { ASYNC_USER_INFOR, BOOKING, LOGOUT } from './actionsType';

export const asyncUserInfor = (data : any) => ({
    type: ASYNC_USER_INFOR ,
    payload: data,
});

export const booking = (data : any) => ({
    type: BOOKING ,
    payload: data,
});

export const logout = () => ({
    type: LOGOUT,
});