import React, { useEffect, useState } from "react";
import { Header } from "../../components";
import {
    Box,
    Button,
    Container,
    FormControlLabel,
    Modal,
    Radio,
    RadioGroup,
    Typography,
} from "@mui/material";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import useAppAccessor from "../../hook/useAppAccessor";
import { axiosWithJWT } from "../../config/axiosConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import TripSummary from "../../components/Customer/TripSummary";

interface EstimatedPrice {
    totalPrice: number;
    unitPrice: number;
    quantity: number;
    seatNumbers: string[];
}

interface TripInfo {
    departureTime: string;
    licensePlate: string;
    busType: string;
    pickupTime: string;
    pickupLocation: string;
    dropoffTime: string;
    dropoffLocation: string;
}
const PaymentMethod = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const { fullName, phoneNumber, email } = location.state || {};
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState<EstimatedPrice>({
        totalPrice: 0,
        unitPrice: 0,
        quantity: 0,
        seatNumbers: [],
    });
    const [tripInfo, setTripInfo] = useState<TripInfo>({
        departureTime: "",
        licensePlate: "",
        busType: "",
        pickupTime: "",
        pickupLocation: "",
        dropoffTime: "",
        dropoffLocation: "",
    });
    const { getUserInfor } = useAppAccessor();
    const userInfo = getUserInfor();

    const handlePaymentClick = async () => {
        setIsNavigating(true);
        setPaymentProcessing(true);
        const lastBooking = userInfo?.booking[userInfo.booking.length - 1]; // Get the most recent booking
        const pickupStopId = lastBooking?.pickupStopId;
        const dropOffStopId = lastBooking?.dropOffStopId;

        try {
            const response = await axiosWithJWT.post(
                "https://ticketgo-app-a139ba17185b.herokuapp.com/api/v1/payment/vnpay",
                {
                    contactName: fullName,
                    contactEmail: email,
                    contactPhone: phoneNumber,
                    pickupStopId: pickupStopId,
                    dropoffStopId: dropOffStopId,
                    totalPrice: estimatedPrice.totalPrice,
                }
            );

            const paymentUrl = response.data;

            window.location.href = paymentUrl;
        } catch (error) {
            console.error("Payment failed", error);
            setIsNavigating(false);
        } finally {
            setPaymentProcessing(false);
        }
    };

    useEffect(() => {
        const fetchTotalPrice = async () => {
            const lastBooking = userInfo?.booking[userInfo.booking.length - 1]; // Get the most recent booking
            const allTicketCodes = lastBooking?.ticketCodes || []; // Get ticketCodes for the latest booking

            if (allTicketCodes.length > 0) {
                try {
                    const response = await axiosWithJWT.post(
                        "https://ticketgo-app-a139ba17185b.herokuapp.com/api/v1/bookings/estimated-prices",
                        {
                            ticketCodes: allTicketCodes,
                        }
                    );
                    setEstimatedPrice(response.data.data);
                } catch (error) {
                    console.error("Error fetching estimated prices:", error);
                }
            }
        };

        fetchTotalPrice();
    }, [userInfo]);

    useEffect(() => {
        const fetchTripInfo = async () => {
            const lastBooking = userInfo?.booking[userInfo.booking.length - 1]; // Get the most recent booking
            const pickupStopId = lastBooking?.pickupStopId;
            const dropOffStopId = lastBooking?.dropOffStopId;
            const scheduleId = lastBooking?.scheduleId;

            if (pickupStopId && dropOffStopId && scheduleId) {
                try {
                    const response = await axiosWithJWT.get(
                        "https://ticketgo-app-a139ba17185b.herokuapp.com/api/v1/bookings/trip-info",
                        {
                            params: { pickupStopId, dropOffStopId, scheduleId },
                        }
                    );
                    setTripInfo(response.data.data);
                } catch (error) {
                    console.error("Error fetching trip info:", error);
                }
            }
        };

        fetchTripInfo();
    }, [userInfo]);

    useEffect(() => {
        const handleBeforeUnload = (e: any) => {
            if (!isNavigating) {
                // Chỉ xử lý nếu không đang điều hướng
                e.preventDefault();
                setIsModalOpen(true); // Hiển thị modal tùy chỉnh
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isNavigating]);

    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            if (!isNavigating) {
                // Chỉ xử lý nếu không đang điều hướng
                window.history.pushState(null, "/payment-method", window.location.href); // Ngăn quay lại trang trước
                setIsModalOpen(true); // Hiển thị modal tùy chỉnh
            }
        };
        window.history.pushState(null, "/payment-method", window.location.href);
        window.addEventListener("popstate", handlePopState);
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [isNavigating]);

    const handleConfirmExit = async () => {
        try {
            await axiosWithJWT.post(
                "https://ticketgo-app-a139ba17185b.herokuapp.com/api/v1/seats/cancel-reserve"
            );
            toast.success("Đã hủy chỗ đặt thành công");
        } catch (error) {
            console.error("Error canceling reservation:", error);
        } finally {
            setIsModalOpen(false);
            navigate("/"); // Navigate back to the previous page
        }
    };

    const handleContinuePayment = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div
                style={{
                    backgroundColor: "rgb(242, 242, 242)",
                    height: "100%",
                    minWidth: "450px",
                    paddingBottom: "80px",
                }}>
                <Header />
                <Container
                    sx={{
                        paddingY: "20px",
                        justifyContent: "center",
                        alignItems: "flex-start",
                    }}>
                    <Button
                        startIcon={<ArrowBackIosIcon sx={{ fontSize: "8px", color: "#484848" }} />}
                        sx={{
                            fontSize: "16px",
                            textTransform: "none",
                            fontWeight: "bold",
                            "&:hover": { backgroundColor: "transparent" },
                        }}
                        onClick={() => setIsModalOpen(true)}>
                        Quay lại
                    </Button>
                    <Container
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-start",
                        }}>
                        <Box display="flex" flexDirection="column">
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    padding: "20px",
                                    backgroundColor: "white",
                                    borderRadius: "8px",
                                    border: "1px solid #e0e0e0",
                                    marginTop: "20px",
                                    width: "700px",
                                    minHeight: "fit-content",
                                }}>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: "bold", fontSize: "18px" }}>
                                    Phương thức thanh toán
                                </Typography>
                                <RadioGroup>
                                    <FormControlLabel
                                        value="vnpay"
                                        checked
                                        control={<Radio />}
                                        label={
                                            <Box>
                                                <Box display="flex" gap={1}>
                                                    <img
                                                        src="https://229a2c9fe669f7b.cmccloud.com.vn/httpImage/vn_pay.svg"
                                                        alt="vnpay"
                                                    />
                                                    <Typography>Thanh toán VNPAY</Typography>
                                                </Box>
                                                <Typography
                                                    sx={{
                                                        fontSize: "14px",
                                                        color: "gray",
                                                        marginTop: 1,
                                                    }}>
                                                    Thiết bị cần cài đặt Ứng dụng ngân hàng (Mobile
                                                    Banking) hoặc Ví VNPAY
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    padding: "20px",
                                    backgroundColor: "white",
                                    borderRadius: "8px",
                                    border: "1px solid #e0e0e0",
                                    marginTop: "20px",
                                    width: "700px",
                                    minHeight: "fit-content",
                                }}>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: "bold", fontSize: "18px" }}>
                                    Thông tin liên hệ
                                </Typography>
                                <Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography>Tên người đặt</Typography>
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                fontSize: "16px",
                                                marginBottom: 2,
                                            }}>
                                            {fullName}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography>Số điện thoại</Typography>
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                fontSize: "16px",
                                                marginBottom: 2,
                                            }}>
                                            {phoneNumber}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography>Email </Typography>
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                fontSize: "16px",
                                                marginBottom: 2,
                                            }}>
                                            {email}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Trip Summary and Details Box */}
                        <TripSummary tripInfo={tripInfo} estimatedPrice={estimatedPrice} />
                    </Container>
                </Container>
            </div>
            <Box
                sx={{
                    width: "100%",
                    backgroundColor: "white",
                    position: "fixed",
                    bottom: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "20px",
                    height: "100px",
                }}>
                <Box sx={{ textAlign: "center", marginRight: "20px" }}>
                    <Button
                        variant="contained"
                        size="medium"
                        sx={{
                            py: 1.5,
                            backgroundColor: "rgb(255, 211, 51)",
                            color: "black",
                            textTransform: "none",
                            fontSize: "16px",
                            width: "700px",
                            fontWeight: "bold",
                            marginBottom: "8px",
                        }}
                        startIcon={<HealthAndSafetyIcon />}
                        onClick={handlePaymentClick}
                        disabled={paymentProcessing}>
                        Thanh toán
                    </Button>
                    <Typography variant="body2" sx={{ fontSize: "14px", color: "gray" }}>
                        Bằng việc nhấn nút Thanh toán, bạn đồng ý với Chính sách bảo mật thanh toán
                    </Typography>
                </Box>

                <Box marginBottom={3}>
                    <Typography variant="body2" sx={{ fontSize: "14px", color: "gray" }}>
                        Bạn sẽ sớm nhận được biển số xe, số điện thoại tài xế
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "14px", color: "gray" }}>
                        và dễ dàng thay đổi điểm đón trả sau khi đặt.
                    </Typography>
                </Box>
            </Box>
            <Modal
                open={isModalOpen}
                onClose={handleContinuePayment}
                aria-labelledby="confirm-exit-title"
                aria-describedby="confirm-exit-description">
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "90%",
                        maxWidth: "520px",
                        height: "250px",
                        bgcolor: "white",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: "10px",
                        textAlign: "center",
                        outline: "none",
                    }}>
                    <Typography id="confirm-exit-title" variant="h6" fontWeight={700}>
                        Bạn có chắc muốn thoát?
                    </Typography>
                    <Typography id="confirm-exit-description" sx={{ mt: 2 }}>
                        Nếu bạn không tiến hành thanh toán thì chỗ đặt sẽ bị hủy và bạn cần đặt vé
                        mới!
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 3,
                            gap: 2,
                            flexDirection: "column",
                        }}>
                        <Button
                            color="error"
                            onClick={handleConfirmExit}
                            sx={{
                                color: "#2474e5",
                                textTransform: "none",
                                textDecoration: "underline",
                            }}>
                            Xác nhận
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleContinuePayment}
                            sx={{
                                backgroundColor: "rgb(255, 211, 51)",
                                textTransform: "none",
                                color: "black",
                                border: "none",
                            }}>
                            Tiếp tục thanh toán
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default PaymentMethod;
