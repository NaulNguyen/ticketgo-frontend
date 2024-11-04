import React, { useState } from "react";
import { Button, Modal, Box } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import Registration from "./Register";
import Login from "./Login";

const Header = () => {
    const [modalState, setModalState] = useState({ isRegisterOpen: false, isLoginOpen: false });

    const openModal = (type: any) => {
        setModalState({
            isRegisterOpen: type === "register",
            isLoginOpen: type === "login",
        });
    };

    const closeModal = () => setModalState({ isRegisterOpen: false, isLoginOpen: false });

    return (
        <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
            <div className="flex items-center">
                <span className="font-pacifico text-4xl">TicketGo</span>
            </div>

            <div className="flex space-x-4">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<LoginIcon />}
                    onClick={() => openModal("login")}>
                    Đăng nhập
                </Button>
            </div>

            <Modal
                open={modalState.isRegisterOpen}
                onClose={closeModal}
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
                    <Registration onClose={closeModal} onLoginClick={() => openModal("login")} />
                </Box>
            </Modal>

            <Modal
                open={modalState.isLoginOpen}
                onClose={closeModal}
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
                    <Login onClose={closeModal} onRegisterClick={() => openModal("register")} />
                </Box>
            </Modal>
        </header>
    );
};

export default Header;
