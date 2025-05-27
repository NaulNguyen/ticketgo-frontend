import React, { useEffect, useState } from "react";
import { Header } from "../../components";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import useAppAccessor from "../../hook/useAppAccessor";
import TripSummary from "../../components/Customer/TripSummary";
import UserService from "../../service/UserService";
import { EstimatedPrice, TripInfo } from "../../global";
import { toast } from "react-toastify";

interface RoundTripData {
    outbound?: {
        tripInfo: TripInfo;
        estimatedPrice: EstimatedPrice;
    };
    return?: {
        tripInfo: TripInfo;
        estimatedPrice: EstimatedPrice;
    };
}

const BookingConfirm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const scheduleId = new URLSearchParams(location.search).get("scheduleId");
    const { getUserInfor } = useAppAccessor();
    const userInfo = getUserInfor();
    const [fullName, setFullName] = useState(userInfo?.user.fullName || "");
    const [phoneNumber, setPhoneNumber] = useState(
        userInfo?.user.phoneNumber || ""
    );
    const [email, setEmail] = useState(userInfo?.user.email || "");
    const [openModal, setOpenModal] = useState(false);
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

    const [roundTripData, setRoundTripData] = useState<RoundTripData>({});
    const outboundId = new URLSearchParams(location.search).get("outboundId");
    const returnId = new URLSearchParams(location.search).get("returnId");
    const isRoundTrip = outboundId && returnId;

    const handleContinueClick = async () => {
        if (
            (!scheduleId && !isRoundTrip) ||
            (isRoundTrip && (!outboundId || !returnId))
        ) {
            toast.error("Không tìm thấy thông tin chuyến đi");
            return;
        }

        if (!fullName || !phoneNumber || !email) {
            toast.error("Vui lòng điền đầy đủ thông tin liên hệ");
            return;
        }

        try {
            if (isRoundTrip) {
                // Save contact info for both trips
                await UserService.saveContactInfo({
                    scheduleId: outboundId,
                    contactName: fullName,
                    contactPhone: phoneNumber,
                    contactEmail: email,
                });

                await UserService.saveContactInfo({
                    scheduleId: returnId,
                    contactName: fullName,
                    contactPhone: phoneNumber,
                    contactEmail: email,
                });

                // Reserve both tickets with a single call
                await UserService.ticketReserve(outboundId, returnId);
                navigate(
                    `/payment-method?outboundId=${outboundId}&returnId=${returnId}`
                );
            } else {
                // Regular one-way booking
                await UserService.saveContactInfo({
                    scheduleId: scheduleId!,
                    contactName: fullName,
                    contactPhone: phoneNumber,
                    contactEmail: email,
                });

                // Reserve single ticket
                const response = await UserService.ticketReserve(scheduleId!);
                if (response.status === 200) {
                    navigate(`/payment-method?scheduleId=${scheduleId}`);
                }
            }
        } catch (error: any) {
            console.error("Error reserving seat:", error);
            setOpenModal(true);
            if (error.response?.status === 400) {
                toast.error("Ghế đã được đặt, vui lòng chọn ghế khác");
            } else {
                toast.error("Có lỗi xảy ra khi đặt chỗ");
            }
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        navigate(-1);
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
                } else {
                    // Regular one-way trip
                    const response = await UserService.getBookingInfo(
                        scheduleId!
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
    }, [scheduleId, outboundId, returnId]);

    useEffect(() => {
        if (userInfo) {
            setFullName(userInfo.user.fullName);
            setPhoneNumber(userInfo.user.phoneNumber);
            setEmail(userInfo.user.email);
        }
    }, [userInfo]);

    const handleBackClick = () => navigate(-1);

    return (
        <>
            <div
                style={{
                    backgroundColor: "rgb(242, 242, 242)",
                    height: "100%",
                    paddingBottom: "50px",
                }}
            >
                <Header />
                <Box
                    sx={{
                        paddingY: "20px",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        width: "80%",
                        margin: "0 auto", // Add this to center the box
                        maxWidth: "1500px",
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
                            "&:hover": { backgroundColor: "transparent" },
                        }}
                        onClick={handleBackClick}
                    >
                        Quay lại
                    </Button>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-start",
                        }}
                    >
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
                                minHeight: "400px",
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: "bold", fontSize: "18px" }}
                            >
                                Thông tin liên hệ
                            </Typography>

                            <TextField
                                label={
                                    <span>
                                        Tên người đi{" "}
                                        <span style={{ color: "red" }}>*</span>
                                    </span>
                                }
                                variant="outlined"
                                fullWidth
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <FormControl sx={{ width: "100px" }} required>
                                    <Select defaultValue="+84">
                                        <MenuItem value="+84">+84</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    label={
                                        <span>
                                            Số điện thoại{" "}
                                            <span style={{ color: "red" }}>
                                                *
                                            </span>
                                        </span>
                                    }
                                    variant="outlined"
                                    type="tel"
                                    sx={{ flex: 1 }}
                                    value={phoneNumber}
                                    onChange={(e) =>
                                        setPhoneNumber(e.target.value)
                                    }
                                />
                            </Box>

                            <TextField
                                label={
                                    <span>
                                        Email để nhận thông tin đặt chỗ{" "}
                                        <span style={{ color: "red" }}>*</span>
                                    </span>
                                }
                                variant="outlined"
                                fullWidth
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Box
                                sx={{
                                    paddingY: "10px",
                                    paddingX: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px solid #4CAF50",
                                    backgroundColor: "rgb(238, 251, 244)",
                                    borderRadius: "8px",
                                }}
                            >
                                <HealthAndSafetyIcon
                                    sx={{
                                        color: "#27ae60",
                                        marginRight: "8px",
                                    }}
                                />
                                <p style={{ color: "black", margin: 0 }}>
                                    Số điện thoại và email được sử dụng để gửi
                                    thông tin đơn hàng và liên hệ khi cần thiết.
                                </p>
                            </Box>
                        </Box>

                        {isRoundTrip ? (
                            <>
                                <TripSummary
                                    tripInfo={roundTripData.outbound?.tripInfo!}
                                    estimatedPrice={
                                        roundTripData.outbound?.estimatedPrice!
                                    }
                                    isOutbound={true}
                                />
                                <TripSummary
                                    tripInfo={roundTripData.return?.tripInfo!}
                                    estimatedPrice={
                                        roundTripData.return?.estimatedPrice!
                                    }
                                    isReturn={true}
                                />
                            </>
                        ) : (
                            <TripSummary
                                tripInfo={tripInfo}
                                estimatedPrice={estimatedPrice}
                            />
                        )}
                    </Box>
                </Box>
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
                    padding: "10px 20px",
                    height: "100px",
                }}
            >
                <Button
                    variant="contained"
                    size="medium"
                    sx={{
                        py: 1,
                        backgroundColor: "rgb(255, 211, 51)",
                        color: "black",
                        textTransform: "none",
                        fontSize: "16px",
                        width: "700px",
                        fontWeight: "bold",
                    }}
                    onClick={handleContinueClick}
                >
                    Tiếp tục
                </Button>
            </Box>
            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                PaperProps={{
                    sx: {
                        width: "90%",
                        maxWidth: "520px",
                        padding: 4,
                        borderRadius: "10px",
                        textAlign: "center",
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: "700" }}>Tiếc quá!</DialogTitle>
                <DialogContent sx={{ fontSize: "14px" }}>
                    Chỗ bạn chọn đã có người khác nhanh tay mua rồi, bạn hãy
                    chọn chỗ khác nhé!
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseModal}
                        variant="contained"
                        sx={{
                            backgroundColor: "rgb(13, 46, 89)",
                            color: "white",
                            width: "100%",
                            textTransform: "none",
                            fontWeight: "bold",
                            "&:hover": { backgroundColor: "#2474e5" },
                        }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default BookingConfirm;
