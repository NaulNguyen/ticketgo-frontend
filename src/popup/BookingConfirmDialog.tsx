import React, { useEffect, useState, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    TextField,
    FormControl,
    Select,
    MenuItem,
    Button,
    Typography,
    InputLabel,
} from "@mui/material";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import { toast } from "react-toastify";
import useAppAccessor from "../hook/useAppAccessor";
import TripSummary from "../components/Customer/TripSummary";
import { EstimatedPrice, TripInfo } from "../global";
import { axiosWithJWT } from "../config/axiosConfig";
import PendingIcon from "@mui/icons-material/Pending";
import PaidIcon from "@mui/icons-material/Paid";
import TimerIcon from "@mui/icons-material/Timer";

interface BookingConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    scheduleId: string;
    selectedSeats: Seat[];
    pickupStopId: number | null;
    dropoffStopId: number | null;
    tripInfo: TripInfo;
    estimatedPrice: EstimatedPrice;
    onReservationExpire: () => void;
}

interface Seat {
    ticketCode: string;
    seatNumber: string;
    isAvailable: boolean;
}

interface AdminBookingRequest {
    scheduleId: string;
    pickupStopId: number;
    dropoffStopId: number;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    ticketCodes: string[];
    price: number;
    paymentStatus: "PENDING" | "PAID";
}

const BookingConfirmDialog = ({
    open,
    onClose,
    scheduleId,
    selectedSeats,
    pickupStopId,
    dropoffStopId,
    tripInfo,
    estimatedPrice,
    onReservationExpire,
}: BookingConfirmDialogProps) => {
    const { getUserInfor } = useAppAccessor();
    const userInfo = getUserInfor();
    const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "PAID">(
        "PENDING"
    );
    const [fullName, setFullName] = useState(userInfo?.user.fullName || "");
    const [phoneNumber, setPhoneNumber] = useState(
        userInfo?.user.phoneNumber || ""
    );
    const [email, setEmail] = useState("");

    const initialTime = useRef(300); // 5 minutes in seconds
    const [countdown, setCountdown] = useState(initialTime.current);

    const createAdminBooking = async (bookingData: AdminBookingRequest) => {
        return await axiosWithJWT.post("/api/v1/admin-booking", bookingData);
    };

    useEffect(() => {
        if (open) {
            setCountdown(initialTime.current);
        }
    }, [open]);

    const handleBooking = async () => {
        if (!fullName || !phoneNumber || !email) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        if (!pickupStopId || !dropoffStopId) {
            toast.error("Vui lòng chọn điểm đón và điểm trả");
            return;
        }

        try {
            await createAdminBooking({
                scheduleId,
                pickupStopId,
                dropoffStopId,
                contactName: fullName,
                contactEmail: email,
                contactPhone: phoneNumber,
                ticketCodes: selectedSeats.map((seat) => seat.ticketCode),
                price: estimatedPrice.totalPrice,
                paymentStatus,
            });

            toast.success("Đặt vé thành công!");
            onClose();
        } catch (error: any) {
            console.error("Error creating booking:", error);
            toast.error(
                error.response?.data?.message || "Có lỗi xảy ra khi đặt vé"
            );
        }
    };

    useEffect(() => {
        let timerInterval: NodeJS.Timeout | null = null;

        if (open && countdown > 0) {
            timerInterval = setInterval(() => {
                setCountdown((prevCount: any) => {
                    if (prevCount <= 1) {
                        if (timerInterval) clearInterval(timerInterval);
                        onReservationExpire();
                        onClose();
                        toast.warning("Hết thời gian giữ ghế!");
                        return 0;
                    }
                    return prevCount - 1;
                });
            }, 1000);
        }

        // Cleanup function
        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [open, onClose, onReservationExpire]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    minWidth: "1000px",
                },
            }}
        >
            <DialogTitle>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h6">
                        Xác nhận thông tin đặt vé
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            bgcolor:
                                countdown <= 60
                                    ? "error.lighter"
                                    : "warning.lighter",
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                        }}
                    >
                        <TimerIcon
                            sx={{
                                color:
                                    countdown <= 60
                                        ? "error.main"
                                        : "warning.main",
                                animation: "pulse 1s infinite",
                            }}
                        />
                        <Typography
                            sx={{
                                color:
                                    countdown <= 60
                                        ? "error.main"
                                        : "warning.main",
                                fontWeight: "bold",
                            }}
                        >
                            {formatTime(countdown)}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        display: "flex",
                        gap: 3,
                        mt: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            width: "500px",
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Thông tin liên hệ
                        </Typography>

                        <TextField
                            label="Tên người đi *"
                            variant="outlined"
                            fullWidth
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <FormControl sx={{ width: "100px" }}>
                                <Select defaultValue="+84">
                                    <MenuItem value="+84">+84</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Số điện thoại *"
                                variant="outlined"
                                type="tel"
                                sx={{ flex: 1 }}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </Box>

                        <TextField
                            label="Email để nhận thông tin đặt chỗ *"
                            variant="outlined"
                            fullWidth
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Box
                            sx={{
                                p: 1.5,
                                display: "flex",
                                alignItems: "center",
                                border: "1px solid #4CAF50",
                                bgcolor: "rgb(238, 251, 244)",
                                borderRadius: 1,
                            }}
                        >
                            <HealthAndSafetyIcon
                                sx={{ color: "#27ae60", mr: 1 }}
                            />
                            <Typography variant="body2">
                                Số điện thoại và email được sử dụng để gửi thông
                                tin đơn hàng và liên hệ khi cần thiết.
                            </Typography>
                        </Box>
                    </Box>

                    <TripSummary
                        tripInfo={tripInfo}
                        estimatedPrice={estimatedPrice}
                    />
                </Box>
            </DialogContent>
            <Box
                sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: "divider",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                }}
            >
                <FormControl sx={{ minWidth: 200, mr: 2 }}>
                    <InputLabel>Trạng thái thanh toán</InputLabel>
                    <Select
                        value={paymentStatus}
                        onChange={(e) =>
                            setPaymentStatus(
                                e.target.value as "PENDING" | "PAID"
                            )
                        }
                        label="Trạng thái thanh toán"
                    >
                        <MenuItem value="PENDING">
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <PendingIcon color="warning" />
                                <Typography>Chưa thanh toán</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem value="PAID">
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <PaidIcon color="success" />
                                <Typography>Đã thanh toán</Typography>
                            </Box>
                        </MenuItem>
                    </Select>
                </FormControl>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        minWidth: 100,
                        textTransform: "none",
                    }}
                >
                    Hủy
                </Button>
                <Button
                    variant="contained"
                    onClick={handleBooking}
                    sx={{
                        bgcolor: "rgb(255, 211, 51)",
                        color: "black",
                        textTransform: "none",
                        fontWeight: "bold",
                        minWidth: 120,
                        "&:hover": {
                            bgcolor: "rgb(255, 200, 30)",
                        },
                    }}
                >
                    Xác nhận đặt vé
                </Button>
            </Box>
        </Dialog>
    );
};

export default BookingConfirmDialog;
