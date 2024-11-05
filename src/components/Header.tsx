import React, { useState } from "react";
import { Button, Modal, Box, Avatar, styled, Badge } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import Registration from "./Register";
import Login from "./Login";
import useAppAccessor from '../hook/useAppAccessor';

const Header = () => {
    const [modalState, setModalState] = useState({ isRegisterOpen: false, isLoginOpen: false });
    const { getUserInfor } = useAppAccessor(); 
    const userInfo = getUserInfor();
    console.log("UserInfor: ",userInfo);

    const openModal = (type: any) => {
        setModalState({
            isRegisterOpen: type === "register",
            isLoginOpen: type === "login",
        });
    };

    const closeModal = () => setModalState({ isRegisterOpen: false, isLoginOpen: false });

    const StyledBadge = styled(Badge)(({ theme }) => ({
        '& .MuiBadge-badge': {
          backgroundColor: '#44b700',
          color: '#44b700',
          boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
          '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
          },
        },
        '@keyframes ripple': {
          '0%': {
            transform: 'scale(.8)',
            opacity: 1,
          },
          '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
          },
        },
      }));

    return (
        <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
            <div className="flex items-center">
                <span className="font-pacifico text-4xl">TicketGo</span>
            </div>
            {userInfo.isAuthenticated ? (
                <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
              >
                <Avatar src={userInfo.user.imageUrl} />
                </StyledBadge>
            ) : (
                <div className="flex space-x-4">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<LoginIcon />}
                        onClick={() => openModal("login")}
                    >
                        Đăng nhập
                    </Button>
                </div>
            )}
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
