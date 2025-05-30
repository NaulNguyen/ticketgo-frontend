import React, { useState, useEffect } from "react";
import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Avatar,
    IconButton,
    Tooltip,
    CircularProgress,
    Button,
    DialogActions,
    DialogContent,
    Dialog,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { axiosWithJWT } from "../../config/axiosConfig";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import CreateDriverPopup from "../../popup/CreateDriverPopup";
import EditDriverPopup from "../../popup/EditDriverPopup";
import WarningIcon from "@mui/icons-material/Warning";
import EventIcon from "@mui/icons-material/Event";
import dayjs from "dayjs";
import ScheduleDialog from "../../popup/ScheduleDialog";

interface Driver {
    driverId: number;
    name: string;
    licenseNumber: string;
    phoneNumber: string;
    imageUrl: string;
    placeOfIssue: string;
    issueDate: string;
    expiryDate: string;
}

interface Pagination {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

interface DriverResponse {
    status: number;
    message: string;
    data: Driver[];
    pagination: Pagination;
}

interface ScheduleByDay {
    scheduleId: number;
    routeName: string;
    departureTime: string;
    arrivalTime: string;
}

interface ScheduleResponse {
    driverId?: number;
    month: string;
    schedulesByDay: {
        [key: string]: ScheduleByDay[];
    };
}

const DriverManagement = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    console.log("drivers", drivers);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState<number | null>(
        null
    );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

    const [scheduleDialog, setScheduleDialog] = useState<{
        open: boolean;
        driverId: number | null;
        data: ScheduleResponse | null;
        selectedDate: Date;
    }>({
        open: false,
        driverId: null,
        data: null,
        selectedDate: dayjs().toDate(),
    });

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const response = await axiosWithJWT.get<DriverResponse>(
                `/api/v1/drivers?pageNumber=${page}&pageSize=${pageSize}`
            );

            if (response.status === 200) {
                setDrivers(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Error fetching drivers:", error);
            toast.error("Không thể tải danh sách tài xế");
        } finally {
            setLoading(false);
        }
    };

    const handleViewSchedule = async (driverId: number) => {
        try {
            const currentMonth = dayjs().format("YYYY-MM");
            const response = await axiosWithJWT.get<ScheduleResponse>(
                `/api/v1/schedules/driver/${driverId}?month=${currentMonth}`
            );

            setScheduleDialog({
                open: true,
                driverId,
                data: response.data,
                selectedDate: dayjs().toDate(),
            });
        } catch (error) {
            console.error("Error fetching driver schedule:", error);
            toast.error("Không thể tải lịch tài xế");
        }
    };

    const handleMonthChange = async (month: string) => {
        if (!scheduleDialog.driverId) return;

        try {
            const response = await axiosWithJWT.get<ScheduleResponse>(
                `/api/v1/schedules/driver/${scheduleDialog.driverId}?month=${month}`
            );

            setScheduleDialog((prev) => ({
                ...prev,
                data: response.data,
                selectedDate: dayjs(month).toDate(),
            }));
        } catch (error) {
            console.error("Error fetching driver schedule:", error);
            toast.error("Không thể tải lịch tài xế");
        }
    };

    const handleOpenDeleteDialog = (driver: Driver) => {
        setDriverToDelete(driver);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDriverToDelete(null);
        setIsDeleteDialogOpen(false);
    };

    const handleDeleteDriver = async () => {
        if (!driverToDelete) return;

        try {
            const response = await axiosWithJWT.delete(
                `/api/v1/drivers/${driverToDelete.driverId}`
            );

            if (response.status === 200) {
                toast.success("Xóa tài xế thành công");
                fetchDrivers();
                handleCloseDeleteDialog();
            }
        } catch (error) {
            console.error("Error deleting driver:", error);
            toast.error("Không thể xóa tài xế");
        }
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleOpenCreatePopup = () => setIsCreatePopupOpen(true);
    const handleCloseCreatePopup = () => setIsCreatePopupOpen(false);

    const handleOpenEditPopup = (driverId: number) => {
        setSelectedDriverId(driverId);
        setIsEditPopupOpen(true);
    };

    const handleCloseEditPopup = () => {
        setSelectedDriverId(null);
        setIsEditPopupOpen(false);
    };

    const isLicenseExpired = (expiryDate: string) => {
        return dayjs().isAfter(dayjs(expiryDate));
    };

    const getLicenseStatusColor = (expiryDate: string) => {
        const daysUntilExpiry = dayjs(expiryDate).diff(dayjs(), "day");
        if (daysUntilExpiry < 0) return "error.main";
        if (daysUntilExpiry < 30) return "warning.main";
        return "success.main";
    };

    useEffect(() => {
        fetchDrivers();
    }, [page]);
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 600,
                        color: "#1976d2",
                    }}
                >
                    Quản lý Tài xế
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreatePopup}
                    sx={{
                        backgroundColor: "#1976d2",
                        color: "white",
                        "&:hover": {
                            backgroundColor: "#1565c0",
                        },
                    }}
                >
                    Thêm tài xế
                </Button>
                <CreateDriverPopup
                    open={isCreatePopupOpen}
                    onClose={handleCloseCreatePopup}
                    onSuccess={fetchDrivers}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow
                                sx={{
                                    backgroundColor: "#1976d2",
                                }}
                            >
                                <TableCell
                                    sx={{
                                        color: "white",
                                        fontWeight: 700,
                                        width: "23%",
                                        fontSize: 16,
                                    }}
                                >
                                    Tài xế
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "white",
                                        fontWeight: 700,
                                        width: "12%",
                                        fontSize: 16,
                                    }}
                                >
                                    Bằng lái xe
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "white",
                                        fontWeight: 700,
                                        width: "20%",
                                        fontSize: 16,
                                    }}
                                >
                                    Nơi cấp
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "white",
                                        fontWeight: 700,
                                        width: "12%",
                                        fontSize: 16,
                                    }}
                                >
                                    Ngày cấp
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "white",
                                        fontWeight: 700,
                                        width: "12%",
                                        fontSize: 16,
                                    }}
                                >
                                    Ngày hết hạn
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "white",
                                        fontWeight: 700,
                                        width: "12%",
                                        fontSize: 16,
                                    }}
                                >
                                    Số điện thoại
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "white",
                                        fontWeight: 700,
                                        width: "20%",
                                        fontSize: 16,
                                    }}
                                >
                                    Thao tác
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {drivers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <Box
                                            sx={{
                                                textAlign: "center",
                                                py: 3,
                                                backgroundColor: "white",
                                                borderRadius: 1,
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                Chưa có tài xế nào
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                drivers.map((driver) => (
                                    <TableRow
                                        key={driver.driverId}
                                        sx={{
                                            "&:hover": {
                                                backgroundColor: "#f5f5f5",
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 2,
                                                }}
                                            >
                                                <Avatar
                                                    src={driver.imageUrl}
                                                    alt={driver.name}
                                                    sx={{
                                                        width: 50,
                                                        height: 50,
                                                        border: "2px solid #1976d2",
                                                    }}
                                                />
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    {driver.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {driver.licenseNumber}
                                        </TableCell>
                                        <TableCell>
                                            {driver.placeOfIssue}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip
                                                title={
                                                    isLicenseExpired(
                                                        driver.expiryDate
                                                    )
                                                        ? "Bằng lái đã hết hạn!"
                                                        : `Còn ${dayjs(
                                                              driver.expiryDate
                                                          ).diff(
                                                              dayjs(),
                                                              "day"
                                                          )} ngày hết hạn`
                                                }
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 0.5,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {dayjs(
                                                            driver.issueDate
                                                        ).format("DD/MM/YYYY")}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                color={getLicenseStatusColor(
                                                    driver.expiryDate
                                                )}
                                                sx={{ fontWeight: 500 }}
                                            >
                                                {dayjs(
                                                    driver.expiryDate
                                                ).format("DD/MM/YYYY")}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {driver.phoneNumber}
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                }}
                                            >
                                                <Tooltip title="Xem lịch">
                                                    <IconButton
                                                        onClick={() =>
                                                            handleViewSchedule(
                                                                driver.driverId
                                                            )
                                                        }
                                                        sx={{
                                                            color: "#1976d2",
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "#1976d2",
                                                                color: "white",
                                                            },
                                                        }}
                                                    >
                                                        <EventIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Chỉnh sửa">
                                                    <IconButton
                                                        onClick={() =>
                                                            handleOpenEditPopup(
                                                                driver.driverId
                                                            )
                                                        }
                                                        sx={{
                                                            color: "#1976d2",
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "#1976d2",
                                                                color: "white",
                                                            },
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Xóa">
                                                    <IconButton
                                                        onClick={() =>
                                                            handleOpenDeleteDialog(
                                                                driver
                                                            )
                                                        }
                                                        sx={{
                                                            color: "#d32f2f",
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "#d32f2f",
                                                                color: "white",
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <EditDriverPopup
                open={isEditPopupOpen}
                onClose={handleCloseEditPopup}
                onSuccess={fetchDrivers}
                driverId={selectedDriverId}
            />
            <Dialog
                open={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        width: "400px",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        bgcolor: "#ffebee",
                        color: "#d32f2f",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 2,
                    }}
                >
                    <WarningIcon />
                    Xác nhận xóa tài xế
                </DialogTitle>
                <DialogContent sx={{ mt: 2, pb: 3 }}>
                    <DialogContentText sx={{ color: "text.primary", mb: 2 }}>
                        Bạn có chắc chắn muốn xóa tài xế:
                    </DialogContentText>
                    <Box
                        sx={{
                            bgcolor: "#f5f5f5",
                            p: 2,
                            borderRadius: 1,
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Avatar
                            src={driverToDelete?.imageUrl}
                            alt={driverToDelete?.name}
                            sx={{
                                width: 40,
                                height: 40,
                                border: "2px solid #1976d2",
                            }}
                        />
                        <Box>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600 }}
                            >
                                {driverToDelete?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {driverToDelete?.phoneNumber}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography
                        variant="body2"
                        color="error"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <WarningIcon fontSize="small" />
                        Hành động này không thể hoàn tác
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        variant="outlined"
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDeleteDriver}
                        color="error"
                        variant="contained"
                        startIcon={<DeleteIcon />}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            "&:hover": {
                                bgcolor: "#c62828",
                            },
                        }}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
            <ScheduleDialog
                open={scheduleDialog.open}
                onClose={() =>
                    setScheduleDialog({
                        open: false,
                        driverId: null,
                        data: null,
                        selectedDate: dayjs().toDate(),
                    })
                }
                type="driver"
                scheduleData={scheduleDialog.data}
                selectedDate={scheduleDialog.selectedDate}
                onMonthChange={handleMonthChange}
            />
        </Container>
    );
};

export default DriverManagement;
