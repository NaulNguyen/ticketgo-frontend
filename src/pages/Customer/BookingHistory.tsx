import React, { useEffect, useState } from "react";
import { Box, Divider, Typography } from "@mui/material";
import { Footer, Header } from "../../components";
import UserService from "../../service/UserService";
import { BookingHistoryItem } from "../../global";

const BookingHistory = () => {
    const [bookingHistoryData, setBookingHistoryData] = useState<BookingHistoryItem[]>([]);
    const formatPrice = (price: string): string => {
        const number = parseFloat(price);
        if (isNaN(number)) return price;
        return new Intl.NumberFormat("en-US").format(number);
    };
    useEffect(() => {
        const fetchBookingHistory = async () => {
            try {
                const response = await UserService.bookingHistory();
                setBookingHistoryData(response.data.data);
            } catch (err) {
                console.log("Failed to load booking history. Please try again later.");
            }
        };
        fetchBookingHistory();
    }, []);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                backgroundColor: "#f0f0f0",
            }}>
            {/* Header */}
            <Header />

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, padding: 2 }}>
                {bookingHistoryData.length > 0 && (
                    <Typography variant="h5" sx={{ fontWeight: "bold", padding: "12px", ml: 34 }}>
                        Lịch sử đặt vé
                    </Typography>
                )}
                {bookingHistoryData.length > 0 ? (
                    bookingHistoryData.map((booking) => (
                        <Box
                            key={booking.ticketCode}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                fontSize: "12px",
                                backgroundColor: "white",
                                width: "60%",
                                margin: "16px auto",
                            }}>
                            <Box sx={{ width: "100%" }}>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: "#2474e5",
                                        color: "white",
                                        padding: "8px",
                                        textAlign: "center",
                                        borderTopLeftRadius: "4px",
                                        borderTopRightRadius: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        paddingLeft: "374px",
                                    }}>
                                    <span>{booking.ticketCode}</span>
                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            backgroundColor:
                                                booking.status === "Đã xác nhận"
                                                    ? "#b3e5fc" // Light blue
                                                    : booking.status === "Đã hoàn thành"
                                                    ? "#4caf50" // Green
                                                    : booking.status === "Đã hủy"
                                                    ? "#f44336" // Red
                                                    : booking.status === "Đã hoàn tiền"
                                                    ? "#ffeb3b"
                                                    : "transparent", // Yellow
                                            color: "white",
                                            padding: "4px 12px",
                                            borderRadius: "4px",
                                            display: "inline-block",
                                        }}>
                                        {booking.status} {/* Aligned to the right */}
                                    </Typography>
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 3,
                                        paddingY: 2,
                                    }}>
                                    <Typography sx={{ fontWeight: "bold", marginRight: "8px" }}>
                                        <span className="font-thin">Địa điểm đón:</span>{" "}
                                        {booking.pickupLocation}
                                    </Typography>
                                    {/* Bus icon */}
                                    <svg
                                        width="40px"
                                        height="40px"
                                        viewBox="0 -2.03 20.051 20.051"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <g id="bus" transform="translate(-2 -4)">
                                            <path
                                                id="secondary"
                                                fill="#2ca9bc"
                                                d="M21,11H3v5a1,1,0,0,0,1,1H5a2,2,0,0,1,4,0h6a2,2,0,0,1,4,0h1a1,1,0,0,0,1-1V11Z"
                                            />
                                            <path
                                                id="primary"
                                                d="M4.91,17H4a1,1,0,0,1-1-1V6A1,1,0,0,1,4,5H18.28a1,1,0,0,1,.95.68L21,10.85l.05.31V16a1,1,0,0,1-1,1h-.91"
                                                fill="none"
                                                stroke="#000000"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                            />
                                            <path
                                                id="primary-2"
                                                data-name="primary"
                                                d="M3,11H21m-6,6H9.08M9,11h6V5H9Zm0,6a2,2,0,1,1-2-2A2,2,0,0,1,9,17Zm10,0a2,2,0,1,1-2-2A2,2,0,0,1,19,17Z"
                                                fill="none"
                                                stroke="#000000"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                            />
                                            <path
                                                d="M-3,21 H50"
                                                stroke="black"
                                                stroke-dasharray="2,1"
                                            />
                                        </g>
                                    </svg>
                                    <Typography sx={{ fontWeight: "bold", marginLeft: "8px" }}>
                                        <span className="font-thin">Địa điểm trả:</span>{" "}
                                        {booking.dropoffLocation}
                                    </Typography>
                                </Box>
                                <Box padding={2} gap={2} display="flex" flex={1}>
                                    <Box flex={1} pl={5}>
                                        <Typography sx={{ fontWeight: "bold", marginBottom: 2 }}>
                                            <span className="font-thin">Biển số xe: </span>
                                            {booking.licensePlate}
                                        </Typography>
                                        <Typography sx={{ fontWeight: "bold", marginBottom: 2 }}>
                                            <span className="font-thin">Số ghế:</span>{" "}
                                            {booking.seatNumber}
                                        </Typography>
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            <span className="font-thin">
                                                Thời gian đón dự kiến:{" "}
                                            </span>
                                            {booking.pickupTime}
                                        </Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem />
                                    <Box flex={1}>
                                        <Typography sx={{ fontWeight: "bold", marginBottom: 2 }}>
                                            <span className="font-thin">Tên Liên Lạc:</span>{" "}
                                            {booking.contactName}
                                        </Typography>
                                        <Typography sx={{ fontWeight: "bold", marginBottom: 2 }}>
                                            <span className="font-thin">Email:</span>{" "}
                                            {booking.contactEmail}
                                        </Typography>
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            <span className="font-thin">Giá:</span>{" "}
                                            {formatPrice(booking.price)} VND
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    ))
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            padding: "20px",
                            backgroundColor: "#f0f0f0",
                            marginTop: "100px",
                        }}>
                        <Box
                            sx={{
                                backgroundColor: "#ffffff",
                                padding: "30px",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            }}>
                            <Typography variant="h3" fontWeight="bold" mb={3}>
                                <span className="font-pacifico text-6xl">
                                    Cảm ơn bạn đã truy cập vào TicketGo!
                                </span>
                            </Typography>
                            <Typography variant="body1" fontSize="18px">
                                Hiện tại bạn chưa có lịch sử đặt vé nào. Hãy đặt vé ngay để trải
                                nghiệm dịch vụ của chúng tôi!
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Footer */}
            <Footer />
        </Box>
    );
};

export default BookingHistory;
