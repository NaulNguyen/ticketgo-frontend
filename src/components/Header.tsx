import React, { useEffect, useState } from "react";
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
    Typography,
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
import { asyncUserInfor, logout } from "../actions/user.action";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import UserService from "../service/UserService";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuIcon from "@mui/icons-material/Menu";

const Header = ({ onToggleDrawer }: { onToggleDrawer?: () => void }) => {
    const [modalState, setModalState] = useState({
        isRegisterOpen: false,
        isLoginOpen: false,
    });
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [timeoutModalOpen, setTimeoutModalOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const scheduleId = searchParams.get("scheduleId");
    const [remainingTime, setRemainingTime] = useState<number | null>(null);

    const dispatch = useDispatch();
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const location = useLocation();

    const isPaymentMethod = location.pathname === "/payment-method";
    const isDashboardPage = location.pathname === "/dashboard";

    const { getUserInfor } = useAppAccessor();
    const userInfo = getUserInfor();

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAvatarClose = () => {
        setAnchorEl(null);
    };

    const openModal = (type: "register" | "login") => {
        setModalState({
            isRegisterOpen: type === "register",
            isLoginOpen: type === "login",
        });
    };

    const handleNavigateClick = () => {
        navigate("/");
    };

    const closeModal = () =>
        setModalState({ isRegisterOpen: false, isLoginOpen: false });

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
        navigate("/");
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const fetchRemainingTime = async () => {
            try {
                // Get booking info to get seat numbers
                const bookingInfo = await UserService.getBookingInfo(
                    scheduleId!
                );
                const seatNumber = bookingInfo.data.data.prices.seatNumbers[0];

                // Get remaining time
                const response = await UserService.getRemainingTime(
                    scheduleId!,
                    seatNumber
                );
                setRemainingTime(response.data.data.remainingTime);
            } catch (error) {
                console.error("Error fetching remaining time:", error);
                setTimeoutModalOpen(true);
            }
        };

        if (isPaymentMethod && scheduleId) {
            fetchRemainingTime();

            // Start countdown timer
            timer = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev === null || prev <= 0) {
                        clearInterval(timer);
                        setTimeoutModalOpen(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isPaymentMethod, scheduleId]);

    const formatTime = (time: number | null) => {
        if (time === null) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfoResponse = await UserService.fetchUserInfor();
                dispatch(asyncUserInfor(userInfoResponse));
            } catch (error) {
                console.error("Failed to fetch user info", error);
            }
        };

        const accessToken = Cookies.get("accessToken");
        if (accessToken) {
            fetchUserInfo();
        }
    }, [dispatch]);

    const handleCloseTimeoutModal = async (scheduleId: string) => {
        try {
            await UserService.cancleTicketReserve(scheduleId);
            toast.success("Đã hủy chỗ đặt thành công");
        } catch (error) {
            console.error("Error canceling reservation:", error);
        } finally {
            setTimeoutModalOpen(false);
            navigate("/");
        }
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        handleAvatarClose();
    };

    return (
        <header className="flex justify-between items-center px-6 py-4 bg-[#0d47a1] shadow-md z-10">
            <div className="flex items-center gap-4">
                {isDashboardPage && (
                    <IconButton
                        onClick={onToggleDrawer}
                        sx={{
                            color: "white",
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
                <div className="cursor-pointer" onClick={handleNavigateClick}>
                    <span className="font-pacifico text-4xl text-white">
                        TicketGo
                    </span>
                </div>
            </div>

            {!isDashboardPage && !isPaymentMethod && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        flex: 1,
                    }}
                >
                    <Button
                        onClick={() => navigate("/reviews")}
                        sx={{
                            color: "white",
                            textTransform: "none",
                            fontSize: "1rem",
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                        }}
                    >
                        Mọi người nói gì về chúng tôi
                    </Button>
                </Box>
            )}

            {isPaymentMethod && (
                <Box display="flex" gap={1}>
                    <Typography
                        sx={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "20px",
                        }}
                    >
                        Thời gian thanh toán còn lại{" "}
                    </Typography>
                    <Typography
                        sx={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "22px",
                            padding: "0px 4px",
                            backgroundColor: "rgb(235, 87, 87)",
                            borderRadius: "8px",
                        }}
                    >
                        {formatTime(remainingTime)}
                    </Typography>
                </Box>
            )}

            <Modal
                open={timeoutModalOpen}
                onClose={handleCloseTimeoutModal}
                aria-labelledby="timeout-modal"
                aria-describedby="timeout-modal-description"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "90%",
                        maxWidth: "520px",
                        height: "200px",
                        bgcolor: "white",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: "10px",
                        textAlign: "center",
                        outline: "none",
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "700" }}>
                        Thời hạn thanh toán vé đã hết
                    </Typography>
                    <Typography sx={{ mb: 3, fontSize: "14px" }}>
                        Xin quý khách vui lòng đặt lại vé khác. Ticketgo chân
                        thành cảm ơn.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => handleCloseTimeoutModal(scheduleId!)}
                        sx={{
                            backgroundColor: "rgb(13, 46, 89)",
                            color: "white",
                            width: "100%",
                            textTransform: "none",
                            fontWeight: "bold",
                            "&:hover": { backgroundColor: "#2474e5" },
                        }}
                    >
                        Đã hiểu
                    </Button>
                </Box>
            </Modal>
            {userInfo?.isAuthenticated ? (
                <IconButton
                    onClick={handleAvatarClick}
                    aria-controls={open ? "account-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                >
                    <StyledBadge
                        overlap="circular"
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        variant="dot"
                    >
                        <Avatar src={userInfo.user.imageUrl} />
                    </StyledBadge>
                </IconButton>
            ) : (
                <div className="flex space-x-4">
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "white",
                            color: "black",
                            textTransform: "none",
                            fontWeight: "bold",
                        }}
                        startIcon={<LoginIcon />}
                        onClick={() => openModal("login")}
                    >
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
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                <MenuItem
                    sx={{ paddingX: "20px", paddingY: "10px" }}
                    onClick={() => handleNavigation("/profile")}
                >
                    <ListItemIcon>
                        <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Thông tin tài khoản
                </MenuItem>
                {userInfo?.user.role === "ROLE_CUSTOMER" && (
                    <Box>
                        <MenuItem
                            sx={{ paddingX: "20px", paddingY: "10px" }}
                            onClick={() => handleNavigation("/booking-history")}
                        >
                            <ListItemIcon>
                                <LoyaltyIcon fontSize="small" />
                            </ListItemIcon>
                            Lịch sử đặt vé
                        </MenuItem>
                    </Box>
                )}
                {userInfo?.user.role === "ROLE_BUS_COMPANY" && (
                    <MenuItem
                        sx={{ paddingX: "20px", paddingY: "10px" }}
                        onClick={() => handleNavigation("/dashboard")}
                    >
                        <ListItemIcon>
                            <DashboardIcon fontSize="small" />
                        </ListItemIcon>
                        Trang quản lý
                    </MenuItem>
                )}
                <MenuItem
                    sx={{ paddingX: "20px", paddingY: "10px" }}
                    onClick={handleLogout}
                >
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
                aria-describedby="modal-register-user-company"
            >
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
                    }}
                >
                    <Registration
                        onClose={closeModal}
                        onLoginClick={() => openModal("login")}
                    />
                </Box>
            </Modal>

            <Modal
                open={modalState.isLoginOpen}
                onClose={closeModal}
                aria-labelledby="login-modal"
                aria-describedby="modal-login-user"
            >
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
                    }}
                >
                    <Login
                        onClose={closeModal}
                        onRegisterClick={() => openModal("register")}
                    />
                </Box>
            </Modal>
        </header>
    );
};

export default Header;
