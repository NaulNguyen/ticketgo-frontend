import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgress, Box, Backdrop, Typography } from "@mui/material";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css'; // Import styles for toastify
import { toast } from "react-toastify";

const AccountActivation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const hasActivated = useRef(false); // Ref to track effect execution

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    useEffect(() => {
        if (!hasActivated.current && location.pathname === "/activate") {
            const activateAccount = async () => {
                setIsLoading(true);
                if (token) {
                    try {
                        const response = await axios.put(
                            "http://localhost:8080/api/v1/auth/activate",
                            { token },
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            }
                        );
                        if (response.data.status === 200) {
                            toast.success(response.data.message);
                            setTimeout(() => navigate("/"), 4000);
                        } else if (response.data.status === 410) {
                            toast.error(response.data.message);
                        } else if (response.data.status === 409) {
                            toast.warn(response.data.message);
                        }
                        setErrorMessage(null);
                    } catch (error) {
                        console.error("Lỗi khi kích hoạt tài khoản:", error);
                        setErrorMessage("Có lỗi xảy ra khi kích hoạt tài khoản.");
                        toast.error("Có lỗi xảy ra khi kích hoạt tài khoản.");
                    } finally {
                        setIsLoading(false);
                    }
                }
            };

            activateAccount();
            hasActivated.current = true; 
        }
    }, [token, location.pathname, navigate]);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
            <Backdrop open={isLoading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Typography
                        variant="h4"
                        className="wave-animation"
                        sx={{
                            fontSize: "2rem",
                            cursor: "pointer",
                            color: "white",
                        }}
                    >
                        TicketGo
                    </Typography>
                    <CircularProgress color="inherit" />
                </Box>
            </Backdrop>
            
            {!isLoading && errorMessage && (
                <Typography color="error">{errorMessage}</Typography>
            )}

            <style>
                {`
                    @keyframes wave {
                        0% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                        100% { transform: translateY(0); }
                    }
                    
                    .wave-animation {
                        display: inline-block;
                        animation: wave 1s infinite ease-in-out;
                        font-family: "Pacifico", sans-serif;
                    }
                `}
            </style>
        </Box>
    );
};

export default AccountActivation;
