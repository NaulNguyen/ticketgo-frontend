import React, { useState } from "react";
import {
    Button,
    Modal,
    Box,
    Avatar,
    styled,
    Badge,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import Registration from "./Register";
import Login from "./Login";
import useAppAccessor from "../hook/useAppAccessor";
import Logout from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import CommentIcon from "@mui/icons-material/Comment";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { logout } from "../actions/login.action";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const [modalState, setModalState] = useState({ isRegisterOpen: false, isLoginOpen: false });
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const dispatch = useDispatch();
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const { getUserInfor } = useAppAccessor();
    const userInfo = getUserInfor();

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAvatarClose = () => {
        setAnchorEl(null);
    };

    const openModal = (type: any) => {
        setModalState({
            isRegisterOpen: type === "register",
            isLoginOpen: type === "login",
        });
    };

    const handleNavigateClick = () => {
        navigate("/");
    };

    const closeModal = () => setModalState({ isRegisterOpen: false, isLoginOpen: false });

    const StyledBadge = styled(Badge)(({ theme }) => ({
        "& .MuiBadge-badge": {
            backgroundColor: "#44b700",
            color: "#44b700",
            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
            "&::after": {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                animation: "ripple 1.2s infinite ease-in-out",
                border: "1px solid currentColor",
                content: '""',
            },
        },
        "@keyframes ripple": {
            "0%": {
                transform: "scale(.8)",
                opacity: 1,
            },
            "100%": {
                transform: "scale(2.4)",
                opacity: 0,
            },
        },
    }));

    const handleLogout = () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        dispatch(logout());
        toast.success("Đăng xuất thành công");
    };

    return (
        <header className="flex justify-between items-center px-6 py-4 bg-[#0d47a1] shadow-md">
            <div className="flex items-center cursor-pointer" onClick={handleNavigateClick}>
                <span className="font-pacifico text-4xl text-white">TicketGo</span>
            </div>
            {userInfo.isAuthenticated ? (
                <IconButton
                    onClick={handleAvatarClick}
                    aria-controls={open ? "account-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}>
                    <StyledBadge
                        overlap="circular"
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        variant="dot">
                        <Avatar src={userInfo.user.imageUrl} />
                    </StyledBadge>
                </IconButton>
            ) : (
                <div className="flex space-x-4">
                    <Button
                        variant="contained"
                        sx={{backgroundColor: 'white', color: 'black', textTransform: "none", fontWeight: 'bold'}}
                        startIcon={<LoginIcon />}
                        onClick={() => openModal("login")}>
                        Đăng nhập
                    </Button>
                </div>
            )}
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleAvatarClose}
                onClick={handleAvatarClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: "visible",
                            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                            mt: 0.5,
                            borderRadius: "10px",
                            "& .MuiAvatar-root": {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            "&::before": {
                                content: '""',
                                display: "block",
                                position: "absolute",
                                top: 0,
                                right: 14,
                                width: "fit-content",
                                height: 10,
                                bgcolor: "background.paper",
                                transform: "translateY(-50%) rotate(45deg)",
                                zIndex: 0,
                            },
                        },
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                <MenuItem sx={{ paddingX: "20px", paddingY: "10px" }}>
                    <ListItemIcon>
                        <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Thông tin tài khoản
                </MenuItem>
                <MenuItem sx={{ paddingX: "20px", paddingY: "10px" }}>
                    <ListItemIcon>
                        <LoyaltyIcon fontSize="small" />
                    </ListItemIcon>
                    Đơn hàng của tôi
                </MenuItem>
                <MenuItem sx={{ paddingX: "20px", paddingY: "10px" }}>
                    <ListItemIcon>
                        <CommentIcon fontSize="small" />
                    </ListItemIcon>
                    Nhận xét chuyến đi
                </MenuItem>
                <MenuItem sx={{ paddingX: "20px", paddingY: "10px" }} onClick={handleLogout}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Đăng xuất
                </MenuItem>
            </Menu>
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
