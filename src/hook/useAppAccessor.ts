import { useSelector } from "react-redux";
import { GlobalState } from "../global";

const useAppAccessor = () => {
    const getUserInfor = useSelector((state: GlobalState) => {
        return state.login;
    });

    return {
        getUserInfor: () => getUserInfor,
    };
};

export default useAppAccessor;
