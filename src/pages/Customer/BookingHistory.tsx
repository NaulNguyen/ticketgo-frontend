import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Divider,
    Grid,
    Paper,
    Skeleton,
    Typography,
} from "@mui/material";
import { Footer, Header } from "../../components";
import UserService from "../../service/UserService";
import { BookingHistoryItem } from "../../global";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelBookingDialog from "../../popup/CancleBookingDialog";
import { axiosWithJWT } from "../../config/axiosConfig";
import { useSnackbar } from "notistack";
import { formatPrice } from "../../utils/formatPrice";
import useAppAccessor from "../../hook/useAppAccessor";
import RateReviewIcon from "@mui/icons-material/RateReview";
import ReviewDialog from "../../popup/ReviewDialog";

const BookingHistory = () => {
    const [bookingHistoryData, setBookingHistoryData] = useState<
        BookingHistoryItem[]
    >([]);
    const [loading, setLoading] = useState(true);
    const { getUserInfor } = useAppAccessor();

    const [selectedBooking, setSelectedBooking] =
        useState<BookingHistoryItem | null>(null);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState<
        number | null
    >(null);

    const { enqueueSnackbar } = useSnackbar();

    const handleCancelClick = (booking: BookingHistoryItem) => {
        setSelectedBooking(booking);
        setOpenCancelDialog(true);
    };

    const formatPickupDateTime = (pickupTime: string) => {
        const [time, date] = pickupTime.split(" ");
        return { time, date };
    };

    const parseRouteName = (
        routeName: string
    ): { origin: string; destination: string } => {
        const [origin, destination] = routeName.split(" - ");
        return { origin, destination };
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
                    { variant: "success", autoHideDuration: 3000 }
                );
                // Refresh booking list
                fetchBookingHistory();
            }
        } catch (error) {
            enqueueSnackbar("Có lỗi xảy ra khi hủy vé. Vui lòng thử lại.", {
                variant: "error",
                autoHideDuration: 3000,
            });
        } finally {
            setOpenCancelDialog(false);
            setSelectedBooking(null);
        }
    };

    const fetchBookingHistory = async () => {
        try {
            setLoading(true);
            const response = await UserService.bookingHistory();
            setBookingHistoryData(response.data.data);
        } catch (err) {
            console.log(
                "Failed to load booking history. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (rating: number, comment: string) => {
        if (!selectedBookingForReview) {
            enqueueSnackbar("Có lỗi xảy ra, vui lòng thử lại", {
                variant: "error",
                autoHideDuration: 3000,
            });
            return false;
        }

        const userInfo = getUserInfor();
        if (!userInfo) {
            enqueueSnackbar("Vui lòng đăng nhập để đánh giá", {
                variant: "error",
                autoHideDuration: 3000,
            });
            return false;
        }

        try {
            setLoading(true); // Add loading state

            const response = await axiosWithJWT.post("/api/v1/reviews", {
                bookingId: selectedBookingForReview,
                rating,
                comment,
                userId: userInfo.user.userId,
            });

            if (response.data.status === 200) {
                enqueueSnackbar(
                    response.data.message || "Cảm ơn bạn đã đánh giá!",
                    {
                        variant: "success",
                        autoHideDuration: 3000,
                    }
                );
                setReviewDialogOpen(false);
                setSelectedBookingForReview(null);

                // Refresh booking list to update status
                await fetchBookingHistory();
                return true;
            }
            return false;
        } catch (error: any) {
            console.error("Error submitting review:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Có lỗi xảy ra khi gửi đánh giá";
            enqueueSnackbar(errorMessage, {
                variant: "error",
                autoHideDuration: 3000,
            });
            return false;
        } finally {
            setLoading(false);
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

    const LoadingSkeleton = () => (
        <Box
            sx={{
                width: "75%",
                margin: "24px auto",
            }}
        >
            {[1, 2, 3].map((item) => (
                <Paper
                    key={item}
                    sx={{
                        bgcolor: "white",
                        borderRadius: 3,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                        mb: 3,
                        overflow: "hidden",
                    }}
                >
                    {/* Header Skeleton */}
                    <Box
                        sx={{
                            p: 3,
                            bgcolor: "#1976d2",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Skeleton
                            variant="rectangular"
                            width={100}
                            height={36}
                            sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
                        />
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <Skeleton
                                variant="text"
                                width={200}
                                sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
                            />
                            <Skeleton
                                variant="text"
                                width={150}
                                sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
                            />
                        </Box>
                        <Skeleton
                            variant="rectangular"
                            width={100}
                            height={36}
                            sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
                        />
                    </Box>

                    {/* Body Skeleton */}
                    <Box sx={{ p: 3 }}>
                        {/* Route Info */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mb: 3,
                            }}
                        >
                            <Skeleton
                                variant="rectangular"
                                width={200}
                                height={40}
                            />
                        </Box>

                        {/* Journey Info */}
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={5}>
                                <Skeleton variant="text" height={40} />
                            </Grid>
                            <Grid
                                item
                                xs={2}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <Skeleton
                                    variant="circular"
                                    width={40}
                                    height={40}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <Skeleton variant="text" height={40} />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Details Section */}
                        <Grid container spacing={3}>
                            <Grid item md={5}>
                                <Skeleton
                                    variant="text"
                                    width={200}
                                    sx={{ mb: 2 }}
                                />
                                {[1, 2, 3, 4].map((line) => (
                                    <Skeleton
                                        key={line}
                                        variant="text"
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                            </Grid>
                            <Grid item md={0.5}>
                                <Divider orientation="vertical" />
                            </Grid>
                            <Grid item md={3}>
                                <Skeleton
                                    variant="text"
                                    width={200}
                                    sx={{ mb: 2 }}
                                />
                                {[1, 2, 3].map((line) => (
                                    <Skeleton
                                        key={line}
                                        variant="text"
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                            </Grid>
                            <Grid item md={0.5}>
                                <Divider orientation="vertical" />
                            </Grid>
                            <Grid item md={3}>
                                <Skeleton
                                    variant="text"
                                    width={200}
                                    sx={{ mb: 2 }}
                                />
                                {[1, 2].map((line) => (
                                    <Skeleton
                                        key={line}
                                        variant="text"
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            ))}
        </Box>
    );

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
                {loading ? (
                    <LoadingSkeleton />
                ) : bookingHistoryData.length > 0 ? (
                    <>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: "bold", padding: "12px", ml: 34 }}
                        >
                            Lịch sử đặt vé
                        </Typography>

                        {bookingHistoryData.map((booking) => (
                            <Box
                                key={booking.bookingId}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    bgcolor: "white",
                                    borderRadius: 3,
                                    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                                    width: "75%",
                                    margin: "24px auto",
                                    overflow: "hidden",
                                    transition: "transform 0.2s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                    },
                                }}
                            >
                                <Box sx={{ width: "100%" }}>
                                    {/* Header */}
                                    <Box
                                        sx={{
                                            backgroundColor: "#1976d2",
                                            backgroundImage:
                                                "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
                                            color: "white",
                                            padding: "16px 24px",
                                            borderBottom:
                                                "1px solid rgba(255,255,255,0.1)",
                                            display: "grid",
                                            gridTemplateColumns: "1fr auto 1fr", // Create 3 equal columns
                                            alignItems: "center",
                                        }}
                                    >
                                        {/* Left section - Cancel Button */}
                                        <Box>
                                            {booking.status === "Đã xác nhận" &&
                                                !isAfterDepartureDate(
                                                    booking.departureDate
                                                ) && (
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={() =>
                                                            handleCancelClick(
                                                                booking
                                                            )
                                                        }
                                                    >
                                                        <DeleteIcon
                                                            sx={{
                                                                fontSize:
                                                                    "1rem",
                                                                mr: 0.5,
                                                            }}
                                                        />
                                                        <Typography
                                                            sx={{
                                                                fontSize:
                                                                    "0.9rem",
                                                                textTransform:
                                                                    "none",
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            Hủy vé
                                                        </Typography>
                                                    </Button>
                                                )}
                                        </Box>

                                        {/* Center section - Booking Info */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "1.25rem",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Thông tin đặt vé xe
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: 3,
                                                    opacity: 0.9,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontSize: "0.9rem",
                                                        }}
                                                    >
                                                        Mã vé:
                                                    </Typography>
                                                    <Typography
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        #{booking.bookingId}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontSize: "0.9rem",
                                                        }}
                                                    >
                                                        Ngày đặt:
                                                    </Typography>
                                                    <Typography
                                                        sx={{ fontWeight: 500 }}
                                                    >
                                                        {booking.bookingDate}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Right section - Status Badge */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "flex-end",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    fontWeight: "bold",
                                                    backgroundColor:
                                                        booking.status ===
                                                        "Đã xác nhận"
                                                            ? "#00C853"
                                                            : booking.status ===
                                                              "Hoàn thành"
                                                            ? "#FFD700"
                                                            : booking.status ===
                                                              "Đã hủy"
                                                            ? "#FF1744"
                                                            : "transparent",
                                                    color:
                                                        booking.status ===
                                                        "Hoàn thành"
                                                            ? "#000"
                                                            : "#fff",
                                                    padding: "4px 12px",
                                                    borderRadius: "4px",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        color:
                                                            booking.status ===
                                                            "Hoàn thành"
                                                                ? "#000"
                                                                : "#fff",
                                                        fontWeight: 600,
                                                        fontSize: "0.9rem",
                                                    }}
                                                >
                                                    {booking.status}
                                                </Typography>
                                            </Box>
                                            {booking.status ===
                                                "Hoàn thành" && (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedBookingForReview(
                                                            booking.bookingId
                                                        );
                                                        setReviewDialogOpen(
                                                            true
                                                        );
                                                    }}
                                                    startIcon={
                                                        <RateReviewIcon />
                                                    }
                                                    sx={{
                                                        bgcolor: "#9C27B0",
                                                        "&:hover": {
                                                            bgcolor: "#7B1FA2",
                                                        },
                                                        display: "flex",
                                                        justifyContent:
                                                            "flex-end",
                                                        ml: 2,
                                                    }}
                                                    disabled={loading}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontSize: "0.9rem",
                                                            textTransform:
                                                                "none",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {loading
                                                            ? "Đang gửi..."
                                                            : "Đánh giá"}
                                                    </Typography>
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                    {/* Body */}
                                    <Box sx={{ pt: 2 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "1.1rem",
                                                    fontWeight: 600,
                                                    color: "#1976d2",
                                                    backgroundColor:
                                                        "rgba(25, 118, 210, 0.08)",
                                                    padding: "8px 24px",
                                                    borderRadius: "20px",
                                                    boxShadow:
                                                        "0 2px 8px rgba(25, 118, 210, 0.15)",
                                                }}
                                            >
                                                Ngày khởi hành:{" "}
                                                {
                                                    formatPickupDateTime(
                                                        booking.departureDate
                                                    ).date
                                                }
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ px: 3, py: 2 }}>
                                        {/* ==== Thông tin hành trình ==== */}
                                        <Grid
                                            container
                                            alignItems="center"
                                            spacing={3}
                                        >
                                            <Grid item xs={5}>
                                                <Typography
                                                    fontSize="1.5rem"
                                                    lineHeight={1.5}
                                                    fontWeight={600}
                                                    textAlign={"center"}
                                                    ml={5}
                                                >
                                                    {
                                                        parseRouteName(
                                                            booking.routeName
                                                        ).origin
                                                    }
                                                </Typography>
                                            </Grid>

                                            <Grid
                                                item
                                                xs={2}
                                                container
                                                justifyContent="center"
                                            >
                                                <svg
                                                    width="40"
                                                    height="40"
                                                    viewBox="0 -2.03 20.051 20.051"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <g
                                                        id="bus"
                                                        transform="translate(-2 -4)"
                                                    >
                                                        <path
                                                            fill="#2ca9bc"
                                                            d="M21,11H3v5a1,1,0,0,0,1,1H5a2,2,0,0,1,4,0h6a2,2,0,0,1,4,0h1a1,1,0,0,0,1-1V11Z"
                                                        />
                                                        <path
                                                            fill="none"
                                                            stroke="#000"
                                                            strokeWidth="2"
                                                            d="M4.91,17H4a1,1,0,0,1-1-1V6A1,1,0,0,1,4,5H18.28a1,1,0,0,1,.95.68L21,10.85l.05.31V16a1,1,0,0,1-1,1h-.91"
                                                        />
                                                        <path
                                                            fill="none"
                                                            stroke="#000"
                                                            strokeWidth="2"
                                                            d="M3,11H21m-6,6H9.08M9,11h6V5H9Zm0,6a2,2,0,1,1-2-2A2,2,0,0,1,9,17Zm10,0a2,2,0,1,1-2-2A2,2,0,0,1,19,17Z"
                                                        />
                                                        <path
                                                            d="M-3,21 H50"
                                                            stroke="black"
                                                            strokeDasharray="2,1"
                                                        />
                                                    </g>
                                                </svg>
                                            </Grid>

                                            <Grid item xs={5} textAlign="right">
                                                <Typography
                                                    fontSize="1.5rem"
                                                    lineHeight={1.5}
                                                    fontWeight={600}
                                                    textAlign={"center"}
                                                    mr={5}
                                                >
                                                    {
                                                        parseRouteName(
                                                            booking.routeName
                                                        ).destination
                                                    }
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 3 }} />

                                        {/* ==== Thông tin xe & liên lạc ==== */}
                                        <Grid container spacing={1}>
                                            {/* Thông tin xe */}
                                            <Grid
                                                item
                                                md={
                                                    booking.status !== "Đã hủy"
                                                        ? 5
                                                        : 6
                                                }
                                            >
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={600}
                                                    color="primary"
                                                    mb={2}
                                                    textAlign="center"
                                                >
                                                    Thông tin xe
                                                </Typography>
                                                <Box sx={{ pl: 2 }}>
                                                    <Typography
                                                        fontWeight="bold"
                                                        mb={1}
                                                    >
                                                        <span className="font-thin">
                                                            Biển số xe:{" "}
                                                        </span>{" "}
                                                        {booking.licensePlate}
                                                    </Typography>
                                                    <Typography
                                                        fontWeight="bold"
                                                        mb={1}
                                                    >
                                                        <span className="font-thin">
                                                            Số ghế:{" "}
                                                        </span>{" "}
                                                        {booking.seatInfos}
                                                    </Typography>
                                                    <Typography
                                                        fontWeight="bold"
                                                        mb={1}
                                                    >
                                                        <span className="font-thin">
                                                            Thời gian đón dự
                                                            kiến:{" "}
                                                        </span>{" "}
                                                        {
                                                            formatPickupDateTime(
                                                                booking.pickupTime
                                                            ).time
                                                        }
                                                    </Typography>
                                                    <Typography
                                                        fontWeight="bold"
                                                        mb={1}
                                                    >
                                                        <span className="font-thin">
                                                            Điểm đón:{" "}
                                                        </span>{" "}
                                                        {booking.pickupLocation}
                                                    </Typography>
                                                    <Typography
                                                        fontWeight="bold"
                                                        mb={1}
                                                    >
                                                        <span className="font-thin">
                                                            Điểm trả:{" "}
                                                        </span>{" "}
                                                        {
                                                            booking.dropoffLocation
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid
                                                item
                                                md={0.5}
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Divider
                                                    orientation="vertical"
                                                    flexItem
                                                    sx={{
                                                        height: "100%",
                                                        borderRightWidth: 2,
                                                        borderColor:
                                                            "rgba(0, 0, 0, 0.1)",
                                                    }}
                                                />
                                            </Grid>
                                            {/* Thông tin liên hệ */}
                                            <Grid
                                                item
                                                md={
                                                    booking.status !== "Đã hủy"
                                                        ? 3
                                                        : 5.5
                                                }
                                            >
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={600}
                                                    color="primary"
                                                    mb={2}
                                                    textAlign="center"
                                                >
                                                    Thông tin liên hệ
                                                </Typography>
                                                <Box sx={{ pl: 2 }}>
                                                    <Typography
                                                        fontWeight="bold"
                                                        mb={1}
                                                    >
                                                        <span className="font-thin">
                                                            Tên liên lạc:{" "}
                                                        </span>{" "}
                                                        {booking.contactName}
                                                    </Typography>
                                                    <Typography
                                                        fontWeight="bold"
                                                        mb={1}
                                                    >
                                                        <span className="font-thin">
                                                            Email:{" "}
                                                        </span>{" "}
                                                        {booking.contactEmail}
                                                    </Typography>
                                                    <Typography fontWeight="bold">
                                                        <span className="font-thin">
                                                            Giá:{" "}
                                                        </span>
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
                                                                        fontSize:
                                                                            "0.9em",
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
                                            </Grid>
                                            {/* Thông tin tài xế */}
                                            {booking.status !== "Đã hủy" && (
                                                <>
                                                    <Grid
                                                        item
                                                        md={0.5}
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent:
                                                                "center",
                                                        }}
                                                    >
                                                        <Divider
                                                            orientation="vertical"
                                                            flexItem
                                                            sx={{
                                                                height: "100%",
                                                                borderRightWidth: 2,
                                                                borderColor:
                                                                    "rgba(0, 0, 0, 0.1)",
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item md={3}>
                                                        <Typography
                                                            variant="subtitle1"
                                                            fontWeight={600}
                                                            color="primary"
                                                            mb={2}
                                                            textAlign="center"
                                                        >
                                                            Thông tin tài xế
                                                        </Typography>
                                                        <Box sx={{ pl: 2 }}>
                                                            <Typography
                                                                fontWeight="bold"
                                                                mb={1}
                                                            >
                                                                <span className="font-thin">
                                                                    Tên tài xế:{" "}
                                                                </span>{" "}
                                                                {
                                                                    booking.driverName
                                                                }
                                                            </Typography>
                                                            <Typography
                                                                fontWeight="bold"
                                                                mb={1}
                                                            >
                                                                <span className="font-thin">
                                                                    Số điện
                                                                    thoại tài
                                                                    xế:{" "}
                                                                </span>{" "}
                                                                {
                                                                    booking.driverPhone
                                                                }
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </>
                                            )}
                                        </Grid>
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
                                                        backgroundColor:
                                                            "#ED6C02",
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
                                                                {
                                                                    booking.refundDate
                                                                }
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </>
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
                {reviewDialogOpen && (
                    <ReviewDialog
                        open={reviewDialogOpen}
                        onClose={() => {
                            setReviewDialogOpen(false);
                            setSelectedBookingForReview(null);
                        }}
                        onSubmit={handleReviewSubmit}
                    />
                )}
            </Box>

            {/* Footer */}
            <Footer />
        </Box>
    );
};

export default BookingHistory;
