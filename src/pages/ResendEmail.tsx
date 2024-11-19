import React from 'react';
import { Footer, Header } from '../components';
import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import UserService from '../service/UserService';

const ResendEmail = () => {
    const location = useLocation();
    const { email, from } = location.state || {};

    const handleResendEmail = async () => {
        try {
            if (from === "forgotPassword") {
                const response = await UserService.forgotPassword({ email });
                if (response.status === 201) {
                    toast.success("Email khôi phục mật khẩu đã được gửi");
                }
            } else if (from === "register") {
                // const response = await UserService.resendActivationEmail({ email });
                // if (response.status === 201) {
                //     toast.success("Email kích hoạt tài khoản đã được gửi lại");
                // }
            }
        } catch (error: any) {
            toast.error("Có lỗi xảy ra khi gửi email");
        }
    };

    return (
        <div>
            <Header />
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="63vh"
                sx={{
                    backgroundColor: '#f0f0f0',
                }}
            >
                <div className="w-fit h-fit p-5 rounded-md shadow-md bg-white flex flex-col justify-center items-center gap-2">
                    <Typography variant="h3" fontWeight="bold">
                        <span className="font-pacifico text-6xl">Thông báo</span>
                    </Typography>
                    <div className="w-full h-[0.5px] bg-white-secondary"></div>
                    <div className="flex flex-col justify-center items-center gap-2">
                        <div className="text-center">
                            <Typography variant="body1" fontSize="18px">
                                Email xác thực sẽ được gửi đến
                            </Typography>
                            <p className="italic text-blue-primary">{email}</p>
                        </div>
                        <div className="flex flex-col justify-center items-center mt-4">
                            <Typography variant="body1" color="grey">
                                Vui lòng kiểm tra hộp thư và xác nhận để hoàn tất quá trình đăng nhập.
                            </Typography>
                            <Typography variant="body1" color="grey">
                                Nếu bạn không nhận được email, hãy kiểm tra thư mục spam hoặc yêu cầu một email mới.
                            </Typography>
                        </div>
                    </div>
                    <div className="w-full h-[1px] bg-white-secondary"></div>
                    <div
                        className="w-fit h-fit px-10 py-2 bg-[#0369c3] hover:bg-[#0369a3] text-center text-white-primary font-bold rounded-sm cursor-pointer"
                        onClick={handleResendEmail}
                    >
                        <span className="text-white">Gửi lại</span>
                    </div>
                </div>
            </Box>
            <Footer />
        </div>
    );
};

export default ResendEmail;
