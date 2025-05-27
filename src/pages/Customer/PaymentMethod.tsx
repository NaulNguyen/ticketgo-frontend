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
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import TripSummary from "../../components/Customer/TripSummary";
import UserService from "../../service/UserService";
import { EstimatedPrice, TripInfo } from "../../global";

const PaymentMethod = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const scheduleId = new URLSearchParams(location.search).get("scheduleId");
    const outboundId = new URLSearchParams(location.search).get("outboundId");
    const returnId = new URLSearchParams(location.search).get("returnId");
    const isRoundTrip = outboundId && returnId;
    const [paymentProcessing, setPaymentProcessing] = useState(false);
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
    const [contactInfo, setContactInfo] = useState({
        fullName: "",
        phoneNumber: "",
        email: "",
    });
    const [selectedPromotion, setSelectedPromotion] = useState<{
        promotionId: number;
        discountPercentage: number;
    } | null>(null);
    const [roundTripData, setRoundTripData] = useState<{
        outbound?: {
            tripInfo: TripInfo;
            estimatedPrice: EstimatedPrice;
        };
        return?: {
            tripInfo: TripInfo;
            estimatedPrice: EstimatedPrice;
        };
    }>({});

    const handlePromotionSelect = (
        promotion: {
            promotionId: number;
            discountPercentage: number;
        } | null
    ) => {
        setSelectedPromotion(promotion);
    };

    useEffect(() => {
        const fetchContactInfo = async () => {
            const contactScheduleId = outboundId || scheduleId;
            if (!contactScheduleId) {
                toast.error("Không tìm thấy thông tin đặt vé");
                return;
            }

            try {
                const response = await UserService.getSavedContactInfo(
                    contactScheduleId
                );
                if (response.data) {
                    setContactInfo({
                        fullName: response.data.contactName || "",
                        phoneNumber: response.data.contactPhone || "",
                        email: response.data.contactEmail || "",
                    });
                }
            } catch (error) {
                console.error("Error fetching contact info:", error);
                toast.error("Không thể tải thông tin liên hệ");
                navigate("/");
            }
        };

        fetchContactInfo();
    }, [outboundId, scheduleId, navigate]);

    const handlePaymentClick = async () => {
        if (
            !contactInfo.fullName ||
            !contactInfo.phoneNumber ||
            !contactInfo.email
        ) {
            toast.error("Vui lòng điền đầy đủ thông tin liên hệ");
            return;
        }

        setIsNavigating(true);
        setPaymentProcessing(true);

        try {
            const paymentData = {
                fullName: contactInfo.fullName,
                email: contactInfo.email,
                phoneNumber: contactInfo.phoneNumber,
                scheduleId: isRoundTrip ? outboundId! : scheduleId!,
                ...(isRoundTrip && { returnScheduleId: returnId }),
                ...(selectedPromotion && {
                    promotionId: selectedPromotion.promotionId,
                }),
            };

            const response = await UserService.vnPay(paymentData);
            if (response.data) {
                window.location.href = response.data;
            } else {
                throw new Error("Invalid payment URL");
            }
        } catch (error) {
            console.error("Payment failed:", error);
            toast.error("Có lỗi xảy ra khi thanh toán");
            setIsNavigating(false);
        } finally {
            setPaymentProcessing(false);
        }
    };

    useEffect(() => {
        const fetchBookingInfo = async () => {
            try {
                if (isRoundTrip) {
                    // Fetch outbound trip info
                    const outboundResponse = await UserService.getBookingInfo(
                        outboundId
                    );
                    const outboundData = outboundResponse.data.data;

                    // Fetch return trip info
                    const returnResponse = await UserService.getBookingInfo(
                        returnId
                    );
                    const returnData = returnResponse.data.data;

                    setRoundTripData({
                        outbound: {
                            tripInfo: outboundData.tripInformation,
                            estimatedPrice: outboundData.prices,
                        },
                        return: {
                            tripInfo: returnData.tripInformation,
                            estimatedPrice: returnData.prices,
                        },
                    });
                } else if (scheduleId) {
                    // Regular one-way trip
                    const response = await UserService.getBookingInfo(
                        scheduleId
                    );
                    const { prices, tripInformation } = response.data.data;
                    setEstimatedPrice(prices);
                    setTripInfo(tripInformation);
                }
            } catch (error) {
                console.error("Error fetching booking info:", error);
                toast.error("Có lỗi xảy ra khi tải thông tin đặt vé");
            }
        };

        fetchBookingInfo();
    }, [isRoundTrip, outboundId, returnId, scheduleId]);

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
                window.history.pushState(
                    null,
                    "/payment-method",
                    window.location.href
                ); // Ngăn quay lại trang trước
                setIsModalOpen(true); // Hiển thị modal tùy chỉnh
            }
        };
        window.history.pushState(null, "/payment-method", window.location.href);
        window.addEventListener("popstate", handlePopState);
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [isNavigating]);

    const handleConfirmExit = async (scheduleId: string | number) => {
        try {
            if (isRoundTrip && outboundId && returnId) {
                // Cancel both reservations for round-trip
                await Promise.all([
                    UserService.cancleTicketReserve(outboundId),
                    UserService.cancleTicketReserve(returnId),
                ]);
            } else if (scheduleId) {
                // Cancel single reservation for one-way trip
                await UserService.cancleTicketReserve(scheduleId);
            }
            toast.success("Đã hủy chỗ đặt thành công");
        } catch (error) {
            console.error("Error canceling reservation:", error);
            toast.error("Có lỗi xảy ra khi hủy chỗ đặt");
        } finally {
            setIsModalOpen(false);
            navigate("/");
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
                }}
            >
                <Header />
                <Container
                    sx={{
                        paddingY: "20px",
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: "1200px !important",
                    }}
                >
                    <Button
                        startIcon={
                            <ArrowBackIosIcon
                                sx={{ fontSize: "8px", color: "#484848" }}
                            />
                        }
                        sx={{
                            fontSize: "16px",
                            textTransform: "none",
                            fontWeight: "bold",
                            alignSelf: "flex-start",
                            "&:hover": { backgroundColor: "transparent" },
                        }}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Quay lại
                    </Button>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 3,
                            justifyContent: "center",
                            marginTop: 2,
                        }}
                    >
                        <Box sx={{ flex: "0 1 650px" }}>
                            <Box
                                sx={{
                                    backgroundColor: "white",
                                    borderRadius: "8px",
                                    border: "1px solid #e0e0e0",
                                    padding: 3,
                                    marginBottom: 2,
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "18px",
                                    }}
                                >
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
                                                    <Typography>
                                                        Thanh toán VNPAY
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    sx={{
                                                        fontSize: "14px",
                                                        color: "gray",
                                                        marginTop: 1,
                                                    }}
                                                >
                                                    Thiết bị cần cài đặt Ứng
                                                    dụng ngân hàng (Mobile
                                                    Banking) hoặc Ví VNPAY
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </Box>
                            <Box
                                sx={{
                                    backgroundColor: "white",
                                    borderRadius: "8px",
                                    border: "1px solid #e0e0e0",
                                    padding: 3,
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "18px",
                                    }}
                                >
                                    Thông tin liên hệ
                                </Typography>
                                <Box>
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                    >
                                        <Typography>Tên người đặt</Typography>
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                fontSize: "16px",
                                                marginBottom: 2,
                                            }}
                                        >
                                            {contactInfo.fullName}
                                        </Typography>
                                    </Box>
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                    >
                                        <Typography>Số điện thoại</Typography>
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                fontSize: "16px",
                                                marginBottom: 2,
                                            }}
                                        >
                                            {contactInfo.phoneNumber}
                                        </Typography>
                                    </Box>
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                    >
                                        <Typography>Email</Typography>
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                fontSize: "16px",
                                                marginBottom: 2,
                                            }}
                                        >
                                            {contactInfo.email}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Trip Summary and Details Box */}
                        <Box sx={{ flex: "0 1 375px" }}>
                            {isRoundTrip ? (
                                <>
                                    <TripSummary
                                        tripInfo={
                                            roundTripData.outbound?.tripInfo!
                                        }
                                        estimatedPrice={
                                            roundTripData.outbound
                                                ?.estimatedPrice!
                                        }
                                        onPromotionSelect={
                                            handlePromotionSelect
                                        }
                                        isOutbound={true}
                                        isPaymentMethod={true}
                                    />
                                    <TripSummary
                                        tripInfo={
                                            roundTripData.return?.tripInfo!
                                        }
                                        estimatedPrice={
                                            roundTripData.return
                                                ?.estimatedPrice!
                                        }
                                        onPromotionSelect={
                                            handlePromotionSelect
                                        }
                                        isReturn={true}
                                        isPaymentMethod={true}
                                    />
                                </>
                            ) : (
                                <TripSummary
                                    tripInfo={tripInfo}
                                    estimatedPrice={estimatedPrice}
                                    onPromotionSelect={handlePromotionSelect}
                                    isPaymentMethod={true}
                                />
                            )}
                        </Box>
                    </Box>
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
                }}
            >
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
                        disabled={paymentProcessing}
                    >
                        Thanh toán
                    </Button>
                    <Typography
                        variant="body2"
                        sx={{ fontSize: "14px", color: "gray" }}
                    >
                        Bằng việc nhấn nút Thanh toán, bạn đồng ý với Chính sách
                        bảo mật thanh toán
                    </Typography>
                </Box>

                <Box marginBottom={3}>
                    <Typography
                        variant="body2"
                        sx={{ fontSize: "14px", color: "gray" }}
                    >
                        Bạn sẽ sớm nhận được biển số xe, số điện thoại tài xế
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ fontSize: "14px", color: "gray" }}
                    >
                        và dễ dàng thay đổi điểm đón trả sau khi đặt.
                    </Typography>
                </Box>
            </Box>
            <Modal
                open={isModalOpen}
                onClose={handleContinuePayment}
                aria-labelledby="confirm-exit-title"
                aria-describedby="confirm-exit-description"
            >
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
                    }}
                >
                    <Typography
                        id="confirm-exit-title"
                        variant="h6"
                        fontWeight={700}
                    >
                        Bạn có chắc muốn thoát?
                    </Typography>
                    <Typography id="confirm-exit-description" sx={{ mt: 2 }}>
                        Nếu bạn không tiến hành thanh toán thì chỗ đặt sẽ bị hủy
                        và bạn cần đặt vé mới!
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 3,
                            gap: 2,
                            flexDirection: "column",
                        }}
                    >
                        <Button
                            color="error"
                            onClick={() => handleConfirmExit(scheduleId!)}
                            sx={{
                                color: "#2474e5",
                                textTransform: "none",
                                textDecoration: "underline",
                            }}
                        >
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
                            }}
                        >
                            Tiếp tục thanh toán
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default PaymentMethod;
