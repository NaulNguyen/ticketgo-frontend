import { useSelector } from "react-redux";
import { GlobalState } from "../global";

const useAppAccessor = () => {
    const getUser = useSelector((state: GlobalState) => {
        return state.User;
    });

    return {
        getUser: () => getUser,
    };
};

export default useAppAccessor;
