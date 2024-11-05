import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css'; // Import styles for toastify
import { toast } from "react-toastify";

const AccountActivation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const hasActivated = useRef(false); // Ref to track effect execution

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    useEffect(() => {
        if (!hasActivated.current && location.pathname === "/activate") {
            const activateAccount = async () => {
                if (token) {
                    try {
                        setIsLoading(true);
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
            hasActivated.current = true; // Set to true after activation
        }
    }, [token, location.pathname, navigate]);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
            {isLoading ? (
                <CircularProgress />
            ) : (
                errorMessage && <div>{errorMessage}</div>
            )}
        </Box>
    );
};

export default AccountActivation;
