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
    Popover,
    Tooltip,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import Registration from "./Register";
import Login from "./Login";
import useAppAccessor from "../hook/useAppAccessor";
import Logout from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { asyncUserInfor, logout } from "../actions/user.action";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import UserService from "../service/UserService";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuIcon from "@mui/icons-material/Menu";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MembershipRules from "../popup/MembershipRules";
import { Bus } from "../global";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { axiosWithJWT } from "../config/axiosConfig";

const Header = ({ onToggleDrawer }: { onToggleDrawer?: () => void }) => {
    const [modalState, setModalState] = useState({
        isRegisterOpen: false,
        isLoginOpen: false,
    });
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [timeoutModalOpen, setTimeoutModalOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const [openRules, setOpenRules] = useState(false);
    const scheduleId = searchParams.get("scheduleId");
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const [notificationAnchor, setNotificationAnchor] =
        useState<HTMLElement | null>(null);
    const [expiringBuses, setExpiringBuses] = useState<Bus[]>([]);
    console.log(expiringBuses);

    const dispatch = useDispatch();
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const location = useLocation();

    const isPaymentMethod = location.pathname === "/payment-method";
    const isDashboardPage = location.pathname === "/dashboard";

    const { getUserInfor } = useAppAccessor();
    const userInfo = getUserInfor();

    const getMembershipLevelName = (level: string) => {
        switch (level) {
            case "NEW_PASSENGER":
                return "Hành Khách Mới";
            case "LOYAL_TRAVELER":
                return "Lữ Khách Thân Thiết";
            case "GOLD_COMPANION":
                return "Đồng Hành Vàng";
            case "ELITE_EXPLORER":
                return "Nhà Du Hành Ưu Tú";
            default:
                return "Hành Khách Mới";
        }
    };

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAvatarClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
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

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const fetchAndUpdateBuses = async () => {
            try {
                const response = await axiosWithJWT.get(
                    "/api/v1/buses?pageNumber=1&pageSize=50"
                );
                if (response.data.status === 200) {
                    const buses = response.data.data;
                    const expiring = buses.filter(
                        (bus: Bus) =>
                            bus.registrationExpiringSoon ||
                            bus.usageExpiringSoon
                    );

                    // Only update state if there are changes
                    setExpiringBuses((prevBuses) => {
                        const hasChanges =
                            JSON.stringify(prevBuses) !==
                            JSON.stringify(expiring);
                        return hasChanges ? expiring : prevBuses;
                    });
                }
            } catch (error) {
                console.error("Error fetching expiring buses:", error);
            }
        };

        if (userInfo?.user.role === "ROLE_BUS_COMPANY") {
            fetchAndUpdateBuses();

            intervalId = setInterval(fetchAndUpdateBuses, 5 * 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [userInfo?.user.role]);

    const NotificationPopover = () => (
        <Popover
            open={Boolean(notificationAnchor)}
            anchorEl={notificationAnchor}
            onClose={handleNotificationClose}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            PaperProps={{
                sx: {
                    p: 2,
                    width: 350,
                    maxHeight: 400,
                    overflowY: "auto",
                    borderRadius: 2,
                },
            }}
        >
            <Typography
                variant="h6"
                gutterBottom
                sx={{ borderBottom: 1, borderColor: "divider", pb: 1 }}
            >
                Thông báo xe sắp hết hạn
            </Typography>
            {expiringBuses.length > 0 ? (
                expiringBuses.map((bus) => (
                    <Box
                        key={bus.busId}
                        sx={{
                            p: 1.5,
                            "&:not(:last-child)": {
                                borderBottom: 1,
                                borderColor: "divider",
                            },
                            "&:hover": { bgcolor: "action.hover" },
                            borderRadius: 1,
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: "bold", color: "primary.main" }}
                        >
                            {bus.licensePlate} - {bus.busType}
                        </Typography>
                        {bus.registrationExpiringSoon && (
                            <Typography
                                variant="body2"
                                color="warning.main"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mt: 0.5,
                                }}
                            >
                                <ErrorOutlineIcon fontSize="small" />
                                Hạn đăng kiểm: {bus.registrationExpiry}
                            </Typography>
                        )}
                        {bus.usageExpiringSoon && (
                            <Typography
                                variant="body2"
                                color="error"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mt: 0.5,
                                }}
                            >
                                <ErrorOutlineIcon fontSize="small" />
                                Hạn sử dụng: {bus.expirationDate}
                            </Typography>
                        )}
                    </Box>
                ))
            ) : (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 2 }}
                >
                    Không có thông báo mới
                </Typography>
            )}
        </Popover>
    );

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
                // Get the schedule ID for checking remaining time (use outboundId if round trip)
                const outboundId = new URLSearchParams(location.search).get(
                    "outboundId"
                );
                const singleTripId = new URLSearchParams(location.search).get(
                    "scheduleId"
                );
                const timeCheckId = outboundId || singleTripId;

                if (!timeCheckId) return;

                // Get booking info to get seat numbers
                const bookingInfo = await UserService.getBookingInfo(
                    timeCheckId
                );
                const seatNumber = bookingInfo.data.data.prices.seatNumbers[0];

                // Get remaining time
                const response = await UserService.getRemainingTime(
                    timeCheckId,
                    seatNumber
                );
                const remainingTime = response.data.data.remainingTime;

                if (remainingTime <= 0) {
                    setTimeoutModalOpen(true);
                    return;
                }

                setRemainingTime(remainingTime);

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
            } catch (error: any) {
                console.error("Error fetching remaining time:", error);
                if (
                    error.response?.status === 404 ||
                    error.response?.data?.message?.includes("expired")
                ) {
                    setTimeoutModalOpen(true);
                }
            }
        };

        if (isPaymentMethod) {
            fetchRemainingTime();
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isPaymentMethod, location.search]);

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

    const handleCloseTimeoutModal = async () => {
        try {
            const outboundId = new URLSearchParams(location.search).get(
                "outboundId"
            );
            const returnId = new URLSearchParams(location.search).get(
                "returnId"
            );
            const singleTripId = new URLSearchParams(location.search).get(
                "scheduleId"
            );

            if (outboundId && returnId) {
                // Handle round-trip cancellation
                await UserService.cancleTicketReserve(outboundId, returnId);
            } else if (singleTripId) {
                // Handle one-way trip cancellation
                await UserService.cancleTicketReserve(singleTripId);
            }

            toast.success("Đã hủy chỗ đặt thành công");
        } catch (error) {
            console.error("Error canceling reservation:", error);
            toast.error("Có lỗi xảy ra khi hủy chỗ đặt");
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
                        onClick={handleCloseTimeoutModal}
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {userInfo?.user.role === "ROLE_BUS_COMPANY" && (
                        <Tooltip title="Thông báo" arrow>
                            <IconButton
                                onClick={handleNotificationClick}
                                sx={{
                                    color: "white",
                                    padding: "8px",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        bgcolor: "rgba(255, 255, 255, 0.15)",
                                        transform: "translateY(-2px)",
                                    },
                                    "&:active": {
                                        transform: "translateY(0px)",
                                    },
                                }}
                            >
                                <Badge
                                    badgeContent={expiringBuses.length}
                                    color="error"
                                    sx={{
                                        "& .MuiBadge-badge": {
                                            fontSize: "0.75rem",
                                            height: "20px",
                                            minWidth: "20px",
                                            padding: "0 4px",
                                            backgroundColor: "#ef5350",
                                            boxShadow:
                                                "0 2px 4px rgba(0,0,0,0.2)",
                                        },
                                    }}
                                >
                                    <NotificationsIcon
                                        sx={{
                                            fontSize: "1.75rem",
                                            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.2))",
                                        }}
                                    />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                    )}
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
                    <NotificationPopover />
                </Box>
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
                        <MenuItem
                            sx={{
                                paddingX: "20px",
                                paddingY: "10px",
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <ListItemIcon>
                                    <EmojiEventsIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography>
                                    {getMembershipLevelName(
                                        userInfo.user.membershipLevel
                                    )}
                                    <Typography
                                        component="span"
                                        sx={{
                                            ml: 1,
                                            fontSize: "0.85rem",
                                            color: "text.secondary",
                                        }}
                                    >
                                        ({userInfo.user.points} điểm tích lũy)
                                    </Typography>
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenRules(true);
                                }}
                                sx={{ ml: 1 }}
                            >
                                <HelpOutlineIcon fontSize="small" />
                            </IconButton>
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
            <MembershipRules
                open={openRules}
                onClose={() => setOpenRules(false)}
            />
        </header>
    );
};

export default Header;
