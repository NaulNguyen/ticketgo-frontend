import React, { useState } from "react";
import { Button, Modal, Box } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import Registration from "./Register";
import Login from "./Login";

const Header = () => {
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);

    const handleOpenRegisterModal = () => {
        setRegisterModalOpen(true);
        setLoginModalOpen(false); // Close login modal if open
    };

    const handleCloseRegisterModal = () => {
        setRegisterModalOpen(false);
    };

    const handleOpenLoginModal = () => {
        setLoginModalOpen(true);
        setRegisterModalOpen(false); // Close register modal if open
    };

    const handleCloseLoginModal = () => {
        setLoginModalOpen(false);
    };

    return (
        <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
            <div className="flex items-center">
                <img src="/path-to-your-logo.png" alt="TicketGo Logo" className="w-32 h-auto" />
            </div>

            <div className="flex space-x-4">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<LoginIcon />}
                    onClick={handleOpenLoginModal}>
                    Đăng nhập
                </Button>
            </div>

            <Modal
                open={isRegisterModalOpen}
                onClose={handleCloseRegisterModal}
                aria-labelledby="register-modal"
                aria-describedby="modal-register-user-company">
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "100%",
                        maxWidth: "600px",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: "10px",
                    }}>
                    <Registration
                        onClose={handleCloseRegisterModal}
                        onLoginClick={handleOpenLoginModal}
                    />
                </Box>
            </Modal>

            <Modal
                open={isLoginModalOpen}
                onClose={handleCloseLoginModal}
                aria-labelledby="login-modal"
                aria-describedby="modal-login-user">
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "100%",
                        maxWidth: "600px",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: "10px",
                    }}>
                    <Login
                        onClose={handleCloseLoginModal}
                        onRegisterClick={handleOpenRegisterModal}
                    />
                </Box>
            </Modal>
        </header>
    );
};

export default Header;
