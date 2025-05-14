import React, { useEffect, useState } from "react";
import { Box, Button, Divider, Typography } from "@mui/material";
import { Footer, Header } from "../../components";
import UserService from "../../service/UserService";
import { BookingHistoryItem } from "../../global";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelBookingDialog from "../../popup/CancleBookingDialog";
import { axiosWithJWT } from "../../config/axiosConfig";
import { useSnackbar } from "notistack";
import { formatPrice } from "../../utils/formatPrice";

const BookingHistory = () => {
    const [bookingHistoryData, setBookingHistoryData] = useState<
        BookingHistoryItem[]
    >([]);
    const [selectedBooking, setSelectedBooking] =
        useState<BookingHistoryItem | null>(null);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const handleCancelClick = (booking: BookingHistoryItem) => {
        setSelectedBooking(booking);
        setOpenCancelDialog(true);
    };

    const handleConfirmCancel = async (
        bookingId: number,
        amount: number,
        reason: string
    ) => {
        try {
            const response = await axiosWithJWT.post(
                "/api/v1/bookings/cancel",
                {
                    bookingId: bookingId.toString(),
                    amount: amount.toString(),
                    reason: reason,
                }
            );

            if (response.data.status === 200) {
                enqueueSnackbar(
                    "Hủy vé thành công. Số tiền hoàn trả (nếu có) sẽ được xử lý trong vòng 3 ngày",
                    { variant: "success" }
                );
                // Refresh booking list
                fetchBookingHistory();
            }
        } catch (error) {
            enqueueSnackbar("Có lỗi xảy ra khi hủy vé. Vui lòng thử lại.", {
                variant: "error",
            });
        } finally {
            setOpenCancelDialog(false);
            setSelectedBooking(null);
        }
    };

    const fetchBookingHistory = async () => {
        try {
            const response = await UserService.bookingHistory();
            console.log(response.data.data);
            setBookingHistoryData(response.data.data);
        } catch (err) {
            console.log(
                "Failed to load booking history. Please try again later."
            );
        }
    };

    useEffect(() => {
        fetchBookingHistory();
    }, []);

    const isAfterDepartureDate = (departureDate: string): boolean => {
        const [time, date] = departureDate.split(" ");
        const [hours, minutes] = time.split(":");
        const [day, month, year] = date.split("/");

        const departureMoment = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hours),
            Number(minutes)
        );

        return new Date() > departureMoment;
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                backgroundColor: "#f0f0f0",
            }}
        >
            {/* Header */}
            <Header />

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, padding: 2 }}>
                {bookingHistoryData.length > 0 && (
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: "bold", padding: "12px", ml: 34 }}
                    >
                        Lịch sử đặt vé
                    </Typography>
                )}
                {bookingHistoryData.length > 0 ? (
                    bookingHistoryData.map((booking) => (
                        <Box
                            key={booking.bookingId}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                bgcolor: "white",
                                borderRadius: 2,
                                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                                width: "70%",
                                margin: "20px auto",
                                overflow: "hidden",
                            }}
                        >
                            {/* Header */}
                            <Box sx={{ width: "100%" }}>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        backgroundColor: "#2474e5",
                                        color: "white",
                                        padding: "8px 16px",
                                        textAlign: "center",
                                        borderTopLeftRadius: "4px",
                                        borderTopRightRadius: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    {/* Trái: Nút Hủy vé */}
                                    {booking.status === "Đã xác nhận" &&
                                        !isAfterDepartureDate(
                                            booking.departureDate
                                        ) && (
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() =>
                                                    handleCancelClick(booking)
                                                }
                                            >
                                                <DeleteIcon
                                                    sx={{
                                                        color: "white",
                                                        fontSize: "1rem",
                                                    }}
                                                />
                                                <Typography
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "white",
                                                        textTransform: "none",
                                                        fontSize: "0.9rem",
                                                    }}
                                                >
                                                    Hủy vé
                                                </Typography>
                                            </Button>
                                        )}

                                    {/* Giữa: Mã vé (code) */}
                                    <Box
                                        sx={{
                                            flexGrow: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 1,
                                            marginLeft: "50px",
                                            py: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                color: "white",
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "1.2rem",
                                                    opacity: 0.9,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Thông tin đặt vé xe
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                color: "white",
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "0.9rem",
                                                    opacity: 0.9,
                                                }}
                                            >
                                                Mã vé:
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: "1rem",
                                                }}
                                            >
                                                #{booking.bookingId}
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                color: "white",
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "0.9rem",
                                                    opacity: 0.9,
                                                }}
                                            >
                                                Ngày đặt:
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontWeight: 500,
                                                    fontSize: "0.95rem",
                                                }}
                                            >
                                                {booking.bookingDate}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Phải: Trạng thái */}
                                    <span
                                        style={{
                                            fontWeight: "bold",
                                            backgroundColor:
                                                booking.status === "Đã xác nhận"
                                                    ? "#00C853"
                                                    : booking.status ===
                                                      "Đã hoàn thành"
                                                    ? "#FFD700"
                                                    : booking.status ===
                                                      "Đã hủy"
                                                    ? "#FF1744"
                                                    : booking.status ===
                                                      "Đã hoàn tiền"
                                                    ? "#FF9100"
                                                    : "transparent",
                                            color:
                                                booking.status ===
                                                "Đã hoàn thành"
                                                    ? "#000"
                                                    : "#fff",
                                            padding: "4px 12px",
                                            borderRadius: "4px",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {booking.status}
                                    </span>
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 3,
                                        paddingY: 2,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            marginRight: "8px",
                                        }}
                                    >
                                        <span className="font-thin">
                                            Địa điểm đón:
                                        </span>{" "}
                                        {booking.pickupLocation}
                                    </Typography>
                                    {/* Bus icon */}
                                    <svg
                                        width="40px"
                                        height="40px"
                                        viewBox="0 -2.03 20.051 20.051"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <g
                                            id="bus"
                                            transform="translate(-2 -4)"
                                        >
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
                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            marginLeft: "8px",
                                        }}
                                    >
                                        <span className="font-thin">
                                            Địa điểm trả:
                                        </span>{" "}
                                        {booking.dropoffLocation}
                                    </Typography>
                                </Box>
                                <Box
                                    padding={2}
                                    gap={2}
                                    display="flex"
                                    flex={1}
                                >
                                    <Box flex={1} pl={5}>
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                marginBottom: 2,
                                            }}
                                        >
                                            <span className="font-thin">
                                                Biển số xe:{" "}
                                            </span>
                                            {booking.licensePlate}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                marginBottom: 2,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontWeight: "bold",
                                                    marginBottom: 2,
                                                }}
                                            >
                                                <span className="font-thin">
                                                    Số ghế:
                                                </span>{" "}
                                                {booking.seatInfos}
                                            </Typography>
                                        </Typography>
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            <span className="font-thin">
                                                Thời gian đón dự kiến:{" "}
                                            </span>
                                            {booking.departureDate}
                                        </Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem />
                                    <Box flex={1}>
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                marginBottom: 2,
                                            }}
                                        >
                                            <span className="font-thin">
                                                Tên Liên Lạc:
                                            </span>{" "}
                                            {booking.contactName}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                marginBottom: 2,
                                            }}
                                        >
                                            <span className="font-thin">
                                                Email:
                                            </span>{" "}
                                            {booking.contactEmail}
                                        </Typography>
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            <span className="font-thin">
                                                Giá:
                                            </span>{" "}
                                            {formatPrice(
                                                booking.originalPrice,
                                                booking.discountedPrice
                                            )}{" "}
                                            VND
                                            {booking.discountedPrice &&
                                                booking.discountedPrice !==
                                                    booking.originalPrice && (
                                                    <Typography
                                                        component="span"
                                                        sx={{
                                                            textDecoration:
                                                                "line-through",
                                                            color: "text.secondary",
                                                            ml: 1,
                                                            fontSize: "0.9em",
                                                        }}
                                                    >
                                                        (
                                                        {formatPrice(
                                                            booking.originalPrice,
                                                            null
                                                        )}{" "}
                                                        VND)
                                                    </Typography>
                                                )}
                                        </Typography>
                                    </Box>
                                </Box>
                                {(booking.refundStatus ||
                                    booking.refundAmount ||
                                    booking.refundReason ||
                                    booking.refundDate) && (
                                    <Box sx={{ p: 2 }}>
                                        <Box
                                            sx={{
                                                backgroundColor: "#FFF4E5",
                                                borderRadius: 2,
                                                p: 2.5,
                                                border: "1px solid #FFB74D",
                                                position: "relative",
                                                overflow: "hidden",
                                                "&::before": {
                                                    content: '""',
                                                    position: "absolute",
                                                    top: 0,
                                                    left: 0,
                                                    width: "4px",
                                                    height: "100%",
                                                    backgroundColor: "#ED6C02",
                                                },
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    mb: 2,
                                                }}
                                            >
                                                <svg
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M12 2L2 7L12 12L22 7L12 2Z"
                                                        stroke="#ED6C02"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M2 17L12 22L22 17"
                                                        stroke="#ED6C02"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M2 12L12 17L22 12"
                                                        stroke="#ED6C02"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: "#ED6C02",
                                                        ml: 1,
                                                        fontSize: "1.1rem",
                                                    }}
                                                >
                                                    Thông tin hoàn tiền
                                                </Typography>
                                            </Box>

                                            <Box
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "repeat(auto-fit, minmax(200px, 1fr))",
                                                    gap: 2,
                                                    pl: 0.5,
                                                }}
                                            >
                                                {booking.refundStatus && (
                                                    <Box>
                                                        <Typography
                                                            color="text.secondary"
                                                            variant="caption"
                                                            sx={{
                                                                display:
                                                                    "block",
                                                                mb: 0.5,
                                                            }}
                                                        >
                                                            Trạng thái
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {
                                                                booking.refundStatus
                                                            }
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {booking.refundAmount && (
                                                    <Box>
                                                        <Typography
                                                            color="text.secondary"
                                                            variant="caption"
                                                            sx={{
                                                                display:
                                                                    "block",
                                                                mb: 0.5,
                                                            }}
                                                        >
                                                            Số tiền hoàn
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 500,
                                                                color: "#2E7D32",
                                                            }}
                                                        >
                                                            {formatPrice(
                                                                booking.refundAmount,
                                                                null
                                                            )}{" "}
                                                            VND
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {booking.refundReason && (
                                                    <Box>
                                                        <Typography
                                                            color="text.secondary"
                                                            variant="caption"
                                                            sx={{
                                                                display:
                                                                    "block",
                                                                mb: 0.5,
                                                            }}
                                                        >
                                                            Lý do
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {
                                                                booking.refundReason
                                                            }
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {booking.refundDate && (
                                                    <Box>
                                                        <Typography
                                                            color="text.secondary"
                                                            variant="caption"
                                                            sx={{
                                                                display:
                                                                    "block",
                                                                mb: 0.5,
                                                            }}
                                                        >
                                                            Ngày hoàn tiền
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {booking.refundDate}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
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
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: "#ffffff",
                                padding: "30px",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <Typography variant="h3" fontWeight="bold" mb={3}>
                                <span className="font-pacifico text-6xl">
                                    Cảm ơn bạn đã truy cập vào TicketGo!
                                </span>
                            </Typography>
                            <Typography variant="body1" fontSize="18px">
                                Hiện tại bạn chưa có lịch sử đặt vé nào. Hãy đặt
                                vé ngay để trải nghiệm dịch vụ của chúng tôi!
                            </Typography>
                        </Box>
                    </Box>
                )}
                {selectedBooking && (
                    <CancelBookingDialog
                        open={openCancelDialog}
                        onClose={() => {
                            setOpenCancelDialog(false);
                            setSelectedBooking(null);
                        }}
                        bookingId={selectedBooking.bookingId}
                        departureDate={selectedBooking.departureDate}
                        originalPrice={selectedBooking.originalPrice}
                        discountedPrice={selectedBooking.discountedPrice}
                        onConfirmCancel={handleConfirmCancel}
                    />
                )}
            </Box>

            {/* Footer */}
            <Footer />
        </Box>
    );
};

export default BookingHistory;
