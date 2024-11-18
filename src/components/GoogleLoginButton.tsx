import React from 'react';
import { Button } from '@mui/material';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import UserService from '../service/UserService'; // Import the service
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { asyncUserInfor } from '../actions/user.action';

const GoogleLoginButton: React.FC = () => {
    const dispatch = useDispatch();

    const handleGoogleLoginSuccess = async (response: any) => {
        try {
            console.log("Response:", response);

            const googleToken = response.access_token;
            console.log("Google token:", googleToken);
            const googleResponse = await UserService.loginWithGoogle(googleToken);

            if (googleResponse.status === 200) {
                const { accessToken, refreshToken } = googleResponse.data;
                Cookies.set('accessToken', accessToken);
                Cookies.set('refreshToken', refreshToken);
        
                const userInfoResponse = await UserService.fetchUserInfor();
                dispatch(asyncUserInfor(userInfoResponse));
        
                toast.success("Đăng nhập với Google thành công");
            }
        } catch (error: any) {
            const errorMessage = error?.message || "Có lỗi xảy ra";
            toast.error("Đăng nhập với Google thất bại: " + errorMessage);
        }
    };
    

    const login = useGoogleLogin({
        onSuccess: handleGoogleLoginSuccess,
        onError: (error) => toast.error("Google login error: " + error.error_description),
    });

    return (
        <Button
        variant="outlined"
        fullWidth
        onClick={() => login()} // Trigger the Google login
        sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            padding: "8px 16px",
            border: "1px solid rgba(0, 0, 0, 0.2)",
            color: "rgba(0, 0, 0, 0.8)",
            backgroundColor: "#fff",
            "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
            marginX: "auto"
        }}
        >
        <img
            alt="Google logo"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png"
            width={24}
            height={24}
        />
        Đăng nhập với Google
        </Button>
    );
};

export default GoogleLoginButton;
