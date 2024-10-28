import { GET_USER_INFOR } from './actionsType';

export const getUserInfor = (data : any) => ({
    type: GET_USER_INFOR ,
    payload: data,
});