import React, { useEffect, useState } from "react";
import { Header } from "../components";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { LocationRoute } from "../components/IconSVG";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import useAppAccessor from "../hook/useAppAccessor";
import { axiosWithJWT } from "../config/axiosConfig";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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
const BookingConfirm = () => {
    const navigate = useNavigate();

    const { getUserInfor } = useAppAccessor();
    const userInfo = getUserInfor();
    const [fullName, setFullName] = useState(userInfo?.user.fullName || '');
    const [phoneNumber, setPhoneNumber] = useState(userInfo?.user.phoneNumber || '');
    const [email, setEmail] = useState(userInfo?.user.email || '');
    const [showPriceDetails, setShowPriceDetails] = useState(false);
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

    const handlePriceBoxClick = () => {
        setShowPriceDetails((prev) => !prev);
    };

    const handleContinueClick = async () => {
        const lastBooking = userInfo?.booking[userInfo.booking.length - 1]; 
        const allTicketCodes = lastBooking?.ticketCodes || [];

        if (allTicketCodes.length > 0) {
            try {
                const response = await axiosWithJWT.post("http://localhost:8080/api/v1/seats/reserve", {
                    ticketCodes: allTicketCodes 
                });
            
                if (response.status === 200) {
                    navigate("/paymentMethod", { 
                        state: { fullName, phoneNumber, email }
                    });
                } 
                else if (response.status === 400) {
                    setOpenModal(true);
                }
            } catch (error) {
                console.error("Error reserving seat:", error);
            }
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        navigate(-1);
    };

    const departureTime = new Date(tripInfo.departureTime);
    const formattedDepartureTime = departureTime && !isNaN(departureTime.getTime())
    ? format(departureTime, 'EEE, dd/MM/yyyy', { locale: vi })
    : "Ngày không hợp lệ";
    const formatTime = (time: string) => {
        const date = new Date(time);
        return !isNaN(date.getTime()) ? format(date, 'HH:mm') : null; 
      };

      useEffect(() => {
        const fetchTotalPrice = async () => {
          const lastBooking = userInfo?.booking[userInfo.booking.length - 1]; // Get the most recent booking
          const allTicketCodes = lastBooking?.ticketCodes || []; // Get ticketCodes for the latest booking
    
          if (allTicketCodes.length > 0) {
            try {
              const response = await axiosWithJWT.post("http://localhost:8080/api/v1/bookings/estimated-prices", {
                ticketCodes: allTicketCodes 
              });
              setEstimatedPrice(response.data.data);
            } catch (error) {
              console.error("Error fetching estimated prices:", error);
            }
          }
        };
    
        fetchTotalPrice();
      }, [userInfo]);

    useEffect(() => {
        if (userInfo) {
            setFullName(userInfo.user.fullName);
            setPhoneNumber(userInfo.user.phoneNumber);
            setEmail(userInfo.user.email);
        }
    }, [userInfo]);
    
      useEffect(() => {
        const fetchTripInfo = async () => {
          const lastBooking = userInfo?.booking[userInfo.booking.length - 1]; // Get the most recent booking
          const pickupStopId = lastBooking?.pickupStopId;
          const dropOffStopId = lastBooking?.dropOffStopId;
          const scheduleId = lastBooking?.scheduleId;
    
          if (pickupStopId && dropOffStopId && scheduleId) {
            try {
              const response = await axiosWithJWT.get("http://localhost:8080/api/v1/bookings/trip-info", {
                params: { pickupStopId, dropOffStopId, scheduleId }
              });
              setTripInfo(response.data.data);
            } catch (error) {
              console.error("Error fetching trip info:", error);
            }
          }
        };
    
        fetchTripInfo();
      }, [userInfo]);

    const handleBackClick = () => navigate(-1);

    return (
        <>
        <div
            style={{
                backgroundColor: "rgb(242, 242, 242)",
                height: "100%",
                minWidth: "450px",
                paddingBottom: "50px",
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
                    onClick={handleBackClick}>
                    Quay lại
                </Button>
                <Container
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                    }}>
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
                        }}>
                        <Typography variant="h5" sx={{ fontWeight: "bold", fontSize: "18px" }}>
                            Thông tin liên hệ
                        </Typography>

                        <TextField
                            label={
                                <span>
                                    Tên người đi <span style={{ color: "red" }}>*</span>
                                </span>
                            }
                            variant="outlined"
                            fullWidth
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <FormControl sx={{ width: "100px" }} required>
                                <Select defaultValue="+84">
                                    <MenuItem value="+84">+84</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label={
                                    <span>
                                        Số điện thoại <span style={{ color: "red" }}>*</span>
                                    </span>
                                }
                                variant="outlined"
                                type="tel"
                                sx={{ flex: 1 }}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
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
                            }}>
                            <HealthAndSafetyIcon sx={{ color: "#27ae60", marginRight: "8px" }} />
                            <p style={{ color: "black", margin: 0 }}>
                                Số điện thoại và email được sử dụng để gửi thông tin đơn hàng và
                                liên hệ khi cần thiết.
                            </p>
                        </Box>
                    </Box>

                    {/* Trip Summary and Details Box */}
                    <Box
                        sx={{
                            width: "375px",
                            padding: 2,
                            borderRadius: 2,
                        }}>
                        <Box
                            sx={{
                                backgroundColor: "white",
                                alignItems: "center",
                                padding: 2,
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                cursor: "pointer",
                            }}
                            onClick={handlePriceBoxClick}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}>
                                <Typography sx={{ fontWeight: "700", fontSize: "18px" }}>
                                    Tạm tính
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}>
                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#2474e5",
                                            fontSize: "18px",
                                        }}>
                                        {new Intl.NumberFormat("en-US").format(estimatedPrice.totalPrice)}đ
                                    </Typography>
                                    <IconButton
                                        sx={{
                                            "&:hover": {
                                                backgroundColor: "transparent",
                                            },
                                            padding: "0",
                                        }}>
                                        {showPriceDetails ? (
                                            <KeyboardArrowUpIcon />
                                        ) : (
                                            <KeyboardArrowDownIcon />
                                        )}
                                    </IconButton>
                                </Box>
                            </Box>
                            {showPriceDetails && (
                                <Box
                                    sx={{
                                        marginTop: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}>
                                    <Typography sx={{ fontSize: "14px" }}>Giá vé</Typography>
                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        justifyContent="flex-end"
                                        alignItems="flex-end">
                                            <Typography sx={{ fontSize: "14px" }}>
                                                {new Intl.NumberFormat("en-US").format(estimatedPrice.unitPrice)}đ x {estimatedPrice.quantity}
                                            </Typography>
                                        <Typography
                                            sx={{ fontSize: "12px", color: "rgb(133, 133, 133)" }}>
                                            Mã ghế/giường: {estimatedPrice.seatNumbers.join(", ")}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        <Box
                            sx={{
                                marginTop: 2,
                                backgroundColor: "white",
                                padding: "20px",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                minHeight: "300px",
                            }}>
                            <Typography
                                sx={{ fontWeight: "bold", fontSize: "18px", marginBottom: 2 }}>
                                Thông tin chuyến đi
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    borderRadius: "8px",
                                    border: "1px solid #e0e0e0",
                                    fontSize: "12px",
                                }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <DirectionsBusIcon sx={{ color: "#2474e5", ml: 1 }} />
                                    <Typography sx={{ fontWeight: "700", paddingY: "12px" }}>
                                        {formattedDepartureTime}
                                    </Typography>
                                </Box>
                                <Divider />

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        alignItems: "center",
                                        paddingX: "12px",
                                        paddingTop: "12px",
                                    }}>
                                    <img
                                        src="https://static.vexere.com/production/images/1682389349632.jpeg"
                                        alt="xe"
                                        style={{
                                            height: "36px",
                                            width: "58px",
                                            borderRadius: 4,
                                        }}
                                    />
                                    <Box>
                                        <Typography sx={{ fontWeight: "700" }}>
                                            {tripInfo.licensePlate}
                                        </Typography>
                                        <Typography sx={{ color: "gray", fontSize: "14px" }}>
                                            {tripInfo.busType}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ marginY: 2 }} />

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        paddingBottom: "12px",
                                        paddingX: "12px",
                                        gap: "15px",
                                    }}>
                                    <Box display="flex" flexDirection="column" gap={3.5}>
                                        <Typography sx={{ fontWeight: "bold" }}>{formatTime(tripInfo.pickupTime)}</Typography>
                                        <Typography sx={{ fontWeight: "bold" }}>{formatTime(tripInfo.dropoffTime)}</Typography>
                                    </Box>

                                    <LocationRoute />

                                    <Box display="flex" flexDirection="column" gap={3.5}>
                                        <Typography sx={{ fontWeight: "700" }}>
                                            {tripInfo.pickupLocation}
                                        </Typography>
                                        <Typography sx={{ fontWeight: "700" }}>
                                            {tripInfo.dropoffLocation}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
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
                }}>
                    <DialogTitle variant="h6" sx={{ mb: 2, fontWeight: "700" }}>Tiếc quá!</DialogTitle>
                    <DialogContent sx={{ mb: 3, fontSize: "14px" }}>
                        Chỗ bạn chọn đã có người khác nhanh tay mua rồi, bạn hãy chọn chỗ khác nhé!
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
