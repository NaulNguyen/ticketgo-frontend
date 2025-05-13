import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import Footer from "../Footer";
import Header from "../Header";

const AccountActivation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const hasActivated = useRef(false);

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    useEffect(() => {
        if (!hasActivated.current && location.pathname === "/activate") {
            const activateAccount = async () => {
                if (token) {
                    try {
                        const response = await axios.put(
                            "https://ticketgo.site/api/v1/auth/activate",
                            { token },
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            }
                        );
                        if (response.data.status === 200) {
                            toast.success(
                                "Tài khoản của bạn đã được kích hoạt thành công"
                            );
                            toast.info("Vui lòng đăng nhập để sử dụng dịch vụ");
                            setTimeout(() => navigate("/"), 3000);
                        } else if (response.data.status === 410) {
                            toast.error(
                                "Đường link đã hết hạn. Vui lòng chọn gửi lại đường link mới!"
                            );
                        } else if (response.data.status === 409) {
                            toast.warn("Tài khoản này đã được kích hoạt");
                        }
                    } catch (error) {
                        console.error("Lỗi khi kích hoạt tài khoản:", error);
                        toast.error("Có lỗi xảy ra khi kích hoạt tài khoản.");
                    }
                }
            };

            activateAccount();
            hasActivated.current = true;
        }
    }, [token, location.pathname, navigate]);

    return (
        <div>
            {/* Header */}
            <Header />

            {/* Main Content */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "70vh",
                    textAlign: "center",
                    padding: "20px",
                    backgroundColor: "#f0f0f0",
                }}
            >
                <Box
                    sx={{
                        backgroundColor: "#ffffff",
                        padding: "30px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <Typography variant="h3" fontWeight="bold" mb={3}>
                        <span className="font-pacifico text-6xl">
                            Cảm ơn bạn đã đăng ký tài khoản với TicketGo!
                        </span>
                    </Typography>
                    <Typography variant="body1" fontSize="18px">
                        Vui lòng chờ một chút trong khi chúng tôi kích hoạt tài
                        khoản cho bạn.
                    </Typography>
                </Box>
            </Box>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default AccountActivation;
