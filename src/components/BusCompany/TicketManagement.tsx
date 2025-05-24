import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    Container,
    Divider,
    Grid,
    Typography,
    Pagination,
    CircularProgress,
    Tooltip,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    IconButton,
    Collapse,
    Paper,
    debounce,
} from "@mui/material";
import { formatPrice } from "../../utils/formatPrice";
import RefreshIcon from "@mui/icons-material/Refresh";
import { axiosWithJWT } from "../../config/axiosConfig";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface Booking {
    bookingId: number;
    bookingDate: string;
    seatInfos: string;
    contactName: string;
    routeName: string;
    departureDate: string;
    pickupTime: string;
    pickupLocation: string;
    dropoffLocation: string;
    licensePlate: string;
    contactEmail: string;
    originalPrice: string;
    discountedPrice: string;
    status: string;
    refundAmount: string | null;
    refundStatus: string | null;
    refundReason: string | null;
    refundDate: string | null;
    driverName: string;
    driverPhone: string;
}

interface PaginationInfo {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

interface FilterState {
    search: string;
    status: string;
    dateRange: {
        from: string | null;
        to: string | null;
    };
}

const TicketManagement = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationInfo>({
        pageNumber: 1,
        pageSize: 5,
        totalPages: 1,
        totalItems: 0,
    });

    const [filters, setFilters] = useState<FilterState>({
        search: "",
        status: "all",
        dateRange: {
            from: null,
            to: null,
        },
    });

    const fetchBookings = async (
        page: number,
        status?: string,
        dateRange?: { from: string | null; to: string | null }
    ) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                pageNumber: page.toString(),
                pageSize: pagination.pageSize.toString(),
            });

            if (status && status !== "all") params.append("status", status);
            if (dateRange?.from) params.append("fromDate", dateRange.from);
            if (dateRange?.to) params.append("toDate", dateRange.to);

            const response = await axiosWithJWT.get(
                `/api/v1/bookings/all-history?${params.toString()}`
            );

            if (response.data.status === 200) {
                setBookings(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Không thể tải danh sách vé");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (event: any) => {
        const status = event.target.value;
        setFilters((prev) => ({ ...prev, status }));
        fetchBookings(1, status, filters.dateRange);
    };

    const handleDateChange = (type: "from" | "to", value: string | null) => {
        setFilters((prev) => ({
            ...prev,
            dateRange: { ...prev.dateRange, [type]: value },
        }));
        fetchBookings(1, filters.status, {
            ...filters.dateRange,
            [type]: value,
        });
    };

    const handleRefundConfirm = async (bookingId: number) => {
        try {
            const response = await axiosWithJWT.put(
                `/api/v1/bookings/${bookingId}/refund`
            );

            if (response.data.status === 200) {
                toast.success("Xác nhận hoàn tiền thành công");
                // Refresh the bookings list
                fetchBookings(pagination.pageNumber);
            }
        } catch (error) {
            console.error("Error confirming refund:", error);
            toast.error("Không thể xác nhận hoàn tiền");
        }
    };

    useEffect(() => {
        fetchBookings(pagination.pageNumber);
    }, []);

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        fetchBookings(value);
    };

    const parseRouteName = (routeName: string) => {
        const [origin, destination] = routeName.split(" - ");
        return { origin, destination };
    };

    const formatPickupDateTime = (dateTime: string) => {
        const [time, date] = dateTime.split(" ");
        return { time, date };
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box
                sx={{
                    mb: 4,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="h4" fontWeight={600} color="primary">
                    Quản lý đặt vé
                </Typography>
                <Stack direction="row" spacing={2}>
                    {/* <IconButton onClick={() => setShowFilters(!showFilters)}>
                        <FilterListIcon />
                    </IconButton> */}
                    <Tooltip title="Làm mới">
                        <Button
                            startIcon={<RefreshIcon />}
                            onClick={() => fetchBookings(pagination.pageNumber)}
                            variant="contained"
                        >
                            Làm mới
                        </Button>
                    </Tooltip>
                </Stack>
            </Box>

            <Paper sx={{ mb: 3, p: 2 }}>
                <Stack spacing={2}>
                    <Box>
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    value={filters.status}
                                    onChange={handleStatusChange}
                                    label="Trạng thái"
                                >
                                    <MenuItem value="all">Tất cả</MenuItem>
                                    <MenuItem value="Đã xác nhận">
                                        Đã xác nhận
                                    </MenuItem>
                                    <MenuItem value="Hoàn thành">
                                        Hoàn thành
                                    </MenuItem>
                                    <MenuItem value="Đã hủy">Đã hủy</MenuItem>
                                </Select>
                            </FormControl>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Từ ngày"
                                    value={
                                        filters.dateRange.from
                                            ? dayjs(filters.dateRange.from)
                                            : null
                                    }
                                    onChange={(value) =>
                                        handleDateChange(
                                            "from",
                                            value?.format("YYYY-MM-DD") || null
                                        )
                                    }
                                    slotProps={{
                                        textField: { fullWidth: true },
                                    }}
                                />
                                <DatePicker
                                    label="Đến ngày"
                                    value={
                                        filters.dateRange.to
                                            ? dayjs(filters.dateRange.to)
                                            : null
                                    }
                                    onChange={(value) =>
                                        handleDateChange(
                                            "to",
                                            value?.format("YYYY-MM-DD") || null
                                        )
                                    }
                                    slotProps={{
                                        textField: { fullWidth: true },
                                    }}
                                />
                            </LocalizationProvider>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>

            {/* Loading State */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Bookings List */}
                    {bookings.map((booking) => (
                        <Box
                            key={booking.bookingId}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                bgcolor: "white",
                                borderRadius: 3,
                                boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
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
                                        gridTemplateColumns: "1fr auto 1fr",
                                        alignItems: "center",
                                    }}
                                >
                                    {/* Left section - Refund Button */}
                                    <Box>
                                        {booking.status === "Đã hủy" &&
                                            booking.refundStatus ===
                                                "Đang chờ hoàn tiền" && (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    onClick={() =>
                                                        handleRefundConfirm(
                                                            booking.bookingId
                                                        )
                                                    }
                                                    sx={{
                                                        backgroundColor:
                                                            "#00C853",
                                                    }}
                                                >
                                                    <CheckCircleIcon
                                                        sx={{
                                                            fontSize: "1rem",
                                                            mr: 0.5,
                                                        }}
                                                    />
                                                    <Typography
                                                        sx={{
                                                            fontSize: "0.9rem",
                                                            textTransform:
                                                                "none",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Xác nhận hoàn tiền
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
                                                    sx={{ fontSize: "0.9rem" }}
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
                                                    sx={{ fontSize: "0.9rem" }}
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
                                                        Thời gian đón dự kiến:{" "}
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
                                                    {booking.dropoffLocation}
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
                                                            {booking.driverName}
                                                        </Typography>
                                                        <Typography
                                                            fontWeight="bold"
                                                            mb={1}
                                                        >
                                                            <span className="font-thin">
                                                                Số điện thoại
                                                                tài xế:{" "}
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
                                                                fontWeight: 600,
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
                                                                fontWeight: 600,
                                                                color: "#00C853",
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
                                                                fontWeight: 600,
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
                                                                fontWeight: 600,
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
                    ))}

                    {/* Pagination */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 4,
                        }}
                    >
                        <Pagination
                            count={pagination.totalPages}
                            page={pagination.pageNumber}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                        />
                    </Box>
                </>
            )}
        </Container>
    );
};

export default TicketManagement;
