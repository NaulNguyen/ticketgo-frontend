import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    TextField,
    Button,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Autocomplete,
    Menu,
    ListItemText,
    DialogContentText,
    ListItemIcon,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { axiosWithJWT } from "../../config/axiosConfig";
import { toast } from "react-toastify";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MoneyIcon from "@mui/icons-material/Money";

interface BookingHistory {
    bookingId: number;
    bookingDate: string;
    seatInfos: string;
    contactName: string;
    contactEmail: string;
    routeName: string;
    departureDate: string;
    pickupTime: string;
    pickupLocation: string;
    dropoffLocation: string;
    licensePlate: string;
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

interface Pagination {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

interface ApiResponse {
    status: number;
    message: string;
    data: BookingHistory[];
    pagination: Pagination;
}

interface FilterOptions {
    bookingId?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    routeName?: string;
    status?: string;
    refundStatus?: string;
    fromDate?: Dayjs | null;
    toDate?: Dayjs | null;
    paymentStatus?: string;
    departureDate?: Dayjs | null;
}

interface RouteOption {
    routeId: number;
    routeName: string;
}

const BookingManagement = () => {
    const [bookings, setBookings] = useState<BookingHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
    const [routes, setRoutes] = useState<RouteOption[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedBooking, setSelectedBooking] =
        useState<BookingHistory | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<
        "refund" | "payment" | "cancel" | null
    >(null);

    const fetchRoutes = async () => {
        try {
            const response = await axiosWithJWT.get("/api/v1/routes");
            if (response.data && Array.isArray(response.data.data)) {
                const routeOptions = response.data.data.map((route: any) => ({
                    routeId: route.routeId,
                    routeName: route.routeName,
                }));
                setRoutes(routeOptions);
            } else {
                console.error("Routes data is not an array:", response.data);
                setRoutes([]);
            }
        } catch (error) {
            console.error("Error fetching routes:", error);
            setRoutes([]);
        }
    };

    // Handle action menu open
    const handleMenuOpen = (
        event: React.MouseEvent<HTMLElement>,
        booking: BookingHistory
    ) => {
        setAnchorEl(event.currentTarget);
        setSelectedBooking(booking);
    };

    // Handle action menu close
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Handle action confirmation dialog
    const handleConfirmDialogOpen = (
        action: "refund" | "payment" | "cancel"
    ) => {
        setConfirmAction(action);
        setConfirmDialogOpen(true);
        handleMenuClose();
    };

    // Close confirmation dialog
    const handleConfirmDialogClose = () => {
        setConfirmDialogOpen(false);
        setConfirmAction(null);
    };

    // Execute confirmed action
    const handleConfirmAction = async () => {
        if (!selectedBooking || !confirmAction) return;

        try {
            switch (confirmAction) {
                case "refund":
                    await axiosWithJWT.put(
                        `/api/v1/bookings/${selectedBooking.bookingId}/refund`
                    );
                    toast.success("Đã xác nhận hoàn tiền thành công");
                    break;

                case "payment":
                    await axiosWithJWT.put(
                        `/api/v1/admin-payment-confirm?bookingId=${selectedBooking.bookingId}`
                    );
                    toast.success("Đã xác nhận thanh toán thành công");
                    break;

                case "cancel":
                    await axiosWithJWT.post(`/api/v1/bookings/cancel`, {
                        bookingId: selectedBooking.bookingId,
                    });
                    toast.success("Đã hủy đặt vé thành công");
                    break;
            }

            // Refresh bookings after action
            fetchBookings();
        } catch (error: any) {
            console.error(`Error performing ${confirmAction} action:`, error);
            toast.error(
                error.response?.data?.message ||
                    `Không thể thực hiện thao tác. Vui lòng thử lại sau.`
            );
        } finally {
            handleConfirmDialogClose();
        }
    };

    // Get confirmation dialog content based on action
    const getConfirmDialogContent = () => {
        if (!selectedBooking) return null;

        switch (confirmAction) {
            case "refund":
                return {
                    title: "Xác nhận hoàn tiền",
                    content: `Bạn có chắc chắn muốn xác nhận hoàn tiền cho đặt vé #${selectedBooking.bookingId} không?`,
                    confirmButton: "Xác nhận hoàn tiền",
                    color: "success" as const,
                };

            case "payment":
                return {
                    title: "Xác nhận thanh toán",
                    content: `Bạn có chắc chắn muốn xác nhận thanh toán cho đặt vé #${selectedBooking.bookingId} không?`,
                    confirmButton: "Xác nhận thanh toán",
                    color: "success" as const,
                };

            case "cancel":
                return {
                    title: "Xác nhận hủy đặt vé",
                    content: `Bạn có chắc chắn muốn hủy đặt vé #${selectedBooking.bookingId} không? Hành động này không thể hoàn tác.`,
                    confirmButton: "Hủy đặt vé",
                    color: "error" as const,
                };

            default:
                return {
                    title: "",
                    content: "",
                    confirmButton: "",
                    color: "primary" as const,
                };
        }
    };

    const isAwaitingRefund = (booking: BookingHistory) => {
        return (
            booking.status === "Đã hủy" &&
            booking.refundStatus === "Đang chờ hoàn tiền"
        );
    };

    const isAwaitingPayment = (booking: BookingHistory) => {
        return booking.status === "Đã xác nhận" && !booking.refundStatus;
    };

    const canBeCancelled = (booking: BookingHistory) => {
        return booking.status !== "Đã hủy" && booking.status !== "Hoàn thành";
    };

    const hasAvailableActions = (booking: BookingHistory) => {
        const canRefund = isAwaitingRefund(booking);
        const canConfirmPayment = isAwaitingPayment(booking);
        const canCancel = canBeCancelled(booking);

        return canRefund || canConfirmPayment || canCancel;
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            // Build query params from filterOptions
            const queryParams = new URLSearchParams();
            queryParams.append("pageNumber", page.toString());
            queryParams.append("pageSize", pageSize.toString());

            if (searchTerm) queryParams.append("search", searchTerm);
            if (filterOptions.bookingId)
                queryParams.append("bookingId", filterOptions.bookingId);
            if (filterOptions.contactName)
                queryParams.append("contactName", filterOptions.contactName);
            if (filterOptions.contactEmail)
                queryParams.append("contactEmail", filterOptions.contactEmail);
            if (filterOptions.contactPhone)
                queryParams.append("contactPhone", filterOptions.contactPhone);
            if (filterOptions.routeName)
                queryParams.append("routeName", filterOptions.routeName);
            if (filterOptions.status)
                queryParams.append("status", filterOptions.status);
            if (filterOptions.refundStatus)
                queryParams.append("refundStatus", filterOptions.refundStatus);
            if (filterOptions.paymentStatus)
                queryParams.append(
                    "paymentStatus",
                    filterOptions.paymentStatus
                );

            if (filterOptions.fromDate) {
                queryParams.append(
                    "fromDate",
                    filterOptions.fromDate.format("YYYY-MM-DD")
                );
            }

            if (filterOptions.toDate) {
                queryParams.append(
                    "toDate",
                    filterOptions.toDate.format("YYYY-MM-DD")
                );
            }

            if (filterOptions.departureDate) {
                queryParams.append(
                    "departureDate",
                    filterOptions.departureDate.format("YYYY-MM-DD")
                );
            }

            const response = await axiosWithJWT.get<ApiResponse>(
                `/api/v1/bookings/all-history?${queryParams.toString()}`
            );

            if (response.data.status === 200) {
                setBookings(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalItems(response.data.pagination.totalItems);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Không thể tải danh sách đặt vé");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [page, pageSize, searchTerm, filterOptions]);

    const handleFilterApply = () => {
        setPage(1); // Reset page when applying filters
        setFilterDialogOpen(false);
    };

    const handleFilterClear = () => {
        setFilterOptions({});
    };

    const getStatusChip = (status: string) => {
        type StatusColorType = {
            [key: string]: { bg: string; text: string; border: string };
        };
        const statusColors: StatusColorType = {
            "Đã xác nhận": {
                bg: "rgb(219, 234, 254)",
                text: "rgb(30, 64, 175)",
                border: "rgb(191, 219, 254)",
            },
            "Hoàn thành": {
                bg: "rgb(220, 252, 231)",
                text: "rgb(22, 101, 52)",
                border: "rgb(187, 247, 208)",
            },
            "Đã hủy": {
                bg: "rgb(254, 226, 226)",
                text: "rgb(153, 27, 27)",
                border: "rgb(254, 202, 202)",
            },
        };

        const colors = statusColors[status] || {
            bg: "rgb(243, 244, 246)",
            text: "rgb(55, 65, 81)",
            border: "rgb(229, 231, 235)",
        };

        return (
            <Chip
                label={status}
                size="small"
                sx={{
                    bgcolor: colors.bg,
                    color: colors.text,
                    fontWeight: 700,
                    border: `1px solid ${colors.border}`,
                }}
            />
        );
    };

    const getPaymentStatusChip = (isPaid: boolean) => {
        const status = isPaid ? "Đã thanh toán" : "Đang chờ thanh toán";

        const statusColors = {
            "Đã thanh toán": {
                bg: "rgb(220, 252, 231)",
                text: "rgb(22, 101, 52)",
                border: "rgb(187, 247, 208)",
            },
            "Đang chờ thanh toán": {
                bg: "rgb(254, 250, 222)",
                text: "rgb(161, 98, 7)",
                border: "rgb(253, 224, 71)",
            },
        };

        const colors = statusColors[status];

        return (
            <Chip
                label={status}
                size="small"
                icon={<CreditCardIcon fontSize="small" />}
                sx={{
                    bgcolor: colors.bg,
                    color: colors.text,
                    fontWeight: 700,
                    border: `1px solid ${colors.border}`,
                    "& .MuiChip-icon": {
                        color: colors.text,
                    },
                }}
            />
        );
    };

    const getRefundStatusChip = (booking: BookingHistory) => {
        if (booking.status !== "Đã hủy" || !booking.refundAmount) {
            return null;
        }

        const status =
            booking.refundStatus === "Đã hoàn tiền"
                ? "Đã hoàn tiền"
                : "Đang chờ hoàn tiền";

        const statusColors = {
            "Đã hoàn tiền": {
                bg: "rgb(220, 252, 231)",
                text: "rgb(22, 101, 52)",
                border: "rgb(187, 247, 208)",
            },
            "Đang chờ hoàn tiền": {
                bg: "rgb(255, 237, 213)",
                text: "rgb(154, 52, 18)",
                border: "rgb(254, 215, 170)",
            },
        };

        const colors = statusColors[status];

        const label =
            status === "Đã hoàn tiền"
                ? `Đã hoàn tiền ${parseInt(booking.refundAmount).toLocaleString(
                      "vi-VN"
                  )} đ`
                : "Đang chờ hoàn tiền";

        return (
            <Chip
                label={label}
                size="small"
                sx={{
                    bgcolor: colors.bg,
                    color: colors.text,
                    fontWeight: 700,
                    border: `1px solid ${colors.border}`,
                }}
            />
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
            >
                <Typography variant="h5" fontWeight="bold" color="#1976d2">
                    Quản lý đặt vé
                </Typography>

                <Box display="flex" gap={2}>
                    <Button
                        variant={
                            Object.keys(filterOptions).length > 0
                                ? "contained"
                                : "outlined"
                        }
                        startIcon={<FilterListIcon />}
                        onClick={() => setFilterDialogOpen(true)}
                        sx={{
                            px: 2.5,
                            borderRadius: 2,
                            borderColor:
                                Object.keys(filterOptions).length > 0
                                    ? "primary.main"
                                    : "grey.400",
                            color:
                                Object.keys(filterOptions).length > 0
                                    ? "primary.contrastText"
                                    : "text.primary",
                            bgcolor:
                                Object.keys(filterOptions).length > 0
                                    ? "primary.main"
                                    : "background.paper",
                            "&:hover": {
                                bgcolor:
                                    Object.keys(filterOptions).length > 0
                                        ? "primary.dark"
                                        : "grey.100",
                            },
                            textTransform: "none",
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <span>Bộ lọc</span>
                            {Object.keys(filterOptions).length > 0 && (
                                <Chip
                                    size="small"
                                    label={Object.keys(filterOptions).length}
                                    sx={{
                                        height: 20,
                                        fontSize: 12,
                                        fontWeight: "bold",
                                        bgcolor: "white",
                                        color: "primary.main",
                                        px: 1,
                                    }}
                                />
                            )}
                        </Box>
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{ p: 3, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                    <Typography fontWeight="bold">
                        Kết quả ({totalItems} booking)
                    </Typography>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: "rgb(244, 246, 248)" }}>
                            <TableRow>
                                <TableCell
                                    width="15%"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    BOOKING INFO
                                </TableCell>
                                <TableCell
                                    width="15%"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    KHÁCH HÀNG
                                </TableCell>
                                <TableCell
                                    width="25%"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    CHUYẾN ĐI
                                </TableCell>
                                <TableCell
                                    width="10%"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    GIÁ VÉ
                                </TableCell>
                                <TableCell
                                    width="10%"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    TRẠNG THÁI
                                </TableCell>
                                <TableCell
                                    width="15%"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    HOÀN TIỀN
                                </TableCell>
                                <TableCell
                                    width="10%"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    THAO TÁC
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bookings.map((booking) => (
                                <TableRow
                                    key={booking.bookingId}
                                    sx={{
                                        "&:hover": {
                                            bgcolor:
                                                "rgba(145, 158, 171, 0.04)",
                                        },
                                    }}
                                >
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 0.5,
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight="bold"
                                            >
                                                #{booking.bookingId}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                    color: "text.secondary",
                                                }}
                                            >
                                                <CalendarTodayIcon
                                                    sx={{ fontSize: 14 }}
                                                />
                                                <Typography variant="body2">
                                                    {booking.bookingDate}
                                                </Typography>
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Ghế: {booking.seatInfos}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 0.5,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                }}
                                            >
                                                <PersonIcon
                                                    sx={{
                                                        fontSize: 16,
                                                        color: "text.secondary",
                                                    }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    fontWeight="medium"
                                                >
                                                    {booking.contactName}
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                }}
                                            >
                                                <EmailIcon
                                                    sx={{
                                                        fontSize: 16,
                                                        color: "text.secondary",
                                                    }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {booking.contactEmail}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 0.5,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                }}
                                            >
                                                <LocationOnIcon
                                                    sx={{
                                                        fontSize: 16,
                                                        color: "primary.main",
                                                    }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    fontWeight="medium"
                                                >
                                                    {booking.routeName}
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                    color: "text.secondary",
                                                }}
                                            >
                                                <AccessTimeIcon
                                                    sx={{ fontSize: 16 }}
                                                />
                                                <Typography variant="body2">
                                                    Khởi hành:{" "}
                                                    {booking.departureDate}
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                    color: "text.secondary",
                                                }}
                                            >
                                                <DirectionsBusIcon
                                                    sx={{ fontSize: 16 }}
                                                />
                                                <Typography variant="body2">
                                                    Biển số:{" "}
                                                    {booking.licensePlate}
                                                </Typography>
                                            </Box>
                                            {booking.driverName && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Tài xế: {booking.driverName}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            fontWeight="bold"
                                            color="primary.main"
                                        >
                                            {parseInt(
                                                booking.discountedPrice
                                            ).toLocaleString("vi-VN")}{" "}
                                            đ
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 1,
                                            }}
                                        >
                                            {getStatusChip(booking.status)}
                                            {getPaymentStatusChip(true)}{" "}
                                            {/* Thay bằng logic thực tế */}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {getRefundStatusChip(booking)}
                                        {booking.refundDate && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 0.5 }}
                                            >
                                                {booking.refundDate}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                textAlign: "center",
                                            }}
                                        >
                                            {hasAvailableActions(booking) && (
                                                <IconButton
                                                    size="small"
                                                    onClick={(event) =>
                                                        handleMenuOpen(
                                                            event,
                                                            booking
                                                        )
                                                    }
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {bookings.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        align="center"
                                        sx={{ py: 3 }}
                                    >
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                        >
                                            Không tìm thấy đơn đặt vé nào
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box
                    sx={{
                        p: 2,
                        borderTop: "1px solid rgba(0,0,0,0.1)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Hiển thị {(page - 1) * pageSize + 1} đến{" "}
                        {Math.min(page * pageSize, totalItems)} trong{" "}
                        {totalItems} kết quả
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button
                            variant="outlined"
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Trước
                        </Button>

                        <Typography>
                            Trang {page} / {totalPages}
                        </Typography>

                        <Button
                            variant="outlined"
                            disabled={page === totalPages}
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                        >
                            Sau
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Dialog
                open={filterDialogOpen}
                onClose={() => setFilterDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: "bold" }}>
                    Bộ lọc tìm kiếm
                </DialogTitle>
                <DialogContent dividers>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Mã đặt vé"
                                    variant="outlined"
                                    value={filterOptions.bookingId || ""}
                                    onChange={(e) =>
                                        setFilterOptions({
                                            ...filterOptions,
                                            bookingId: e.target.value,
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <Autocomplete
                                    options={routes}
                                    getOptionLabel={(option) =>
                                        option.routeName
                                    }
                                    value={
                                        filterOptions.routeName
                                            ? routes.find(
                                                  (route) =>
                                                      route.routeName ===
                                                      filterOptions.routeName
                                              ) || null
                                            : null
                                    }
                                    onChange={(e, newValue) =>
                                        setFilterOptions({
                                            ...filterOptions,
                                            routeName:
                                                newValue?.routeName ||
                                                undefined,
                                        })
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Tuyến xe"
                                            variant="outlined"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Tên người đặt vé"
                                    variant="outlined"
                                    value={filterOptions.contactName || ""}
                                    onChange={(e) =>
                                        setFilterOptions({
                                            ...filterOptions,
                                            contactName: e.target.value,
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Email người đặt vé"
                                    variant="outlined"
                                    value={filterOptions.contactEmail || ""}
                                    onChange={(e) =>
                                        setFilterOptions({
                                            ...filterOptions,
                                            contactEmail: e.target.value,
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Số điện thoại người đặt vé"
                                    variant="outlined"
                                    value={filterOptions.contactPhone || ""}
                                    onChange={(e) =>
                                        setFilterOptions({
                                            ...filterOptions,
                                            contactPhone: e.target.value,
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Trạng thái vé</InputLabel>
                                    <Select
                                        value={filterOptions.status || ""}
                                        label="Trạng thái vé"
                                        onChange={(e) =>
                                            setFilterOptions({
                                                ...filterOptions,
                                                status: e.target
                                                    .value as string,
                                            })
                                        }
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        <MenuItem value="Đã xác nhận">
                                            Đã xác nhận
                                        </MenuItem>
                                        <MenuItem value="Hoàn thành">
                                            Hoàn thành
                                        </MenuItem>
                                        <MenuItem value="Đã hủy">
                                            Đã hủy
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>
                                        Trạng thái thanh toán
                                    </InputLabel>
                                    <Select
                                        value={
                                            filterOptions.paymentStatus || ""
                                        }
                                        label="Trạng thái thanh toán"
                                        onChange={(e) =>
                                            setFilterOptions({
                                                ...filterOptions,
                                                paymentStatus: e.target
                                                    .value as string,
                                            })
                                        }
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        <MenuItem value="Đã thanh toán">
                                            Đã thanh toán
                                        </MenuItem>
                                        <MenuItem value="Đang chờ thanh toán">
                                            Đang chờ thanh toán
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>
                                        Trạng thái hoàn tiền
                                    </InputLabel>
                                    <Select
                                        value={filterOptions.refundStatus || ""}
                                        label="Trạng thái hoàn tiền"
                                        onChange={(e) =>
                                            setFilterOptions({
                                                ...filterOptions,
                                                refundStatus: e.target
                                                    .value as string,
                                            })
                                        }
                                    >
                                        <MenuItem value="">Tất cả</MenuItem>
                                        <MenuItem value="Đã hoàn tiền">
                                            Đã hoàn tiền
                                        </MenuItem>
                                        <MenuItem value="Đang chờ hoàn tiền">
                                            Đang chờ hoàn tiền
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={6}>
                                <DatePicker
                                    label="Ngày đặt vé từ"
                                    value={filterOptions.fromDate}
                                    onChange={(newValue) =>
                                        setFilterOptions({
                                            ...filterOptions,
                                            fromDate: newValue,
                                        })
                                    }
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: "outlined",
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <DatePicker
                                    label="Ngày đặt vé đến"
                                    value={filterOptions.toDate}
                                    onChange={(newValue) =>
                                        setFilterOptions({
                                            ...filterOptions,
                                            toDate: newValue,
                                        })
                                    }
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: "outlined",
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <DatePicker
                                    label="Ngày khởi hành"
                                    value={filterOptions.departureDate}
                                    onChange={(newValue) =>
                                        setFilterOptions({
                                            ...filterOptions,
                                            departureDate: newValue,
                                        })
                                    }
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: "outlined",
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleFilterClear}
                    >
                        Xóa bộ lọc
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setFilterDialogOpen(false)}
                    >
                        Hủy
                    </Button>
                    <Button variant="contained" onClick={handleFilterApply}>
                        Áp dụng
                    </Button>
                </DialogActions>
            </Dialog>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                {selectedBooking && isAwaitingRefund(selectedBooking) && (
                    <MenuItem onClick={() => handleConfirmDialogOpen("refund")}>
                        <ListItemIcon>
                            <MoneyIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText>Xác nhận hoàn tiền</ListItemText>
                    </MenuItem>
                )}

                {selectedBooking && isAwaitingPayment(selectedBooking) && (
                    <MenuItem
                        onClick={() => handleConfirmDialogOpen("payment")}
                    >
                        <ListItemIcon>
                            <CheckCircleIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText>Xác nhận thanh toán</ListItemText>
                    </MenuItem>
                )}

                {selectedBooking && canBeCancelled(selectedBooking) && (
                    <MenuItem onClick={() => handleConfirmDialogOpen("cancel")}>
                        <ListItemIcon>
                            <CancelIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>Hủy đặt vé</ListItemText>
                    </MenuItem>
                )}
            </Menu>

            {selectedBooking && (
                <Dialog
                    open={confirmDialogOpen}
                    onClose={handleConfirmDialogClose}
                >
                    <DialogTitle>
                        {getConfirmDialogContent()?.title}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {getConfirmDialogContent()?.content}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={handleConfirmDialogClose}
                            color="inherit"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleConfirmAction}
                            color={getConfirmDialogContent()?.color}
                            variant="contained"
                            autoFocus
                        >
                            {getConfirmDialogContent()?.confirmButton}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default BookingManagement;
