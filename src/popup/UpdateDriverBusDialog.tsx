import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    Radio,
    FormControlLabel,
    Button,
    DialogActions,
    CircularProgress,
    Tooltip,
    alpha,
    Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { axiosWithJWT } from "../config/axiosConfig";
import { toast } from "react-toastify";
import ScheduleDialog from "./ScheduleDialog";
import dayjs from "dayjs";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";

interface Driver {
    driverId: number;
    name: string;
    licenseNumber: string;
    phoneNumber: string;
    imageUrl: string;
}

interface Bus {
    busId: number;
    licensePlate: string;
    busType: string;
    busImage: string;
    totalSeats: number;
}

interface UpdateDriverBusDialogProps {
    open: boolean;
    onClose: () => void;
    type: "driver" | "bus";
    scheduleId: string;
    onSuccess: () => void;
    currentBusType?: string;
}

interface ScheduleResponse {
    busId?: number;
    driverId?: number;
    month: string;
    schedulesByDay: {
        [key: string]: Array<{
            scheduleId: number;
            routeName: string;
            departureTime: string;
            arrivalTime: string;
        }>;
    };
}

const UpdateDriverBusDialog = ({
    open,
    onClose,
    type,
    scheduleId,
    onSuccess,
    currentBusType,
}: UpdateDriverBusDialogProps) => {
    const [items, setItems] = useState<Driver[] | Bus[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [scheduleDialog, setScheduleDialog] = useState({
        open: false,
        data: null as ScheduleResponse | null,
        selectedDate: new Date(),
        currentMonth: dayjs().format("YYYY-MM"),
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const endpoint =
                    type === "driver"
                        ? "/api/v1/drivers?pageNumber=1&pageSize=10"
                        : "/api/v1/buses?pageNumber=1&pageSize=20";

                const response = await axiosWithJWT.get(endpoint);
                if (response.data.status === 200) {
                    // Filter buses if type is bus
                    const data = response.data.data;
                    if (type === "bus" && currentBusType) {
                        const filteredBuses = data.filter(
                            (bus: Bus) => bus.busType === currentBusType
                        );
                        setItems(filteredBuses);
                    } else {
                        setItems(data);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error(
                    `Không thể tải danh sách ${
                        type === "driver" ? "tài xế" : "xe"
                    }`
                );
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchData();
        }
    }, [open, type, currentBusType]);

    const handleViewSchedule = async (id: number) => {
        try {
            const response = await axiosWithJWT.get<ScheduleResponse>(
                `/api/v1/schedules/${type}/${id}?month=${scheduleDialog.currentMonth}`
            );
            setScheduleDialog((prev) => ({
                ...prev,
                open: true,
                data: response.data,
            }));
        } catch (error) {
            console.error("Error fetching schedule:", error);
            toast.error(
                `Không thể tải lịch ${type === "driver" ? "tài xế" : "xe"}`
            );
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    p={4}
                    gap={2}
                >
                    <CircularProgress size={40} />
                    <Typography color="text.secondary">
                        Đang tải danh sách {type === "driver" ? "tài xế" : "xe"}
                        ...
                    </Typography>
                </Box>
            );
        }

        if (items.length === 0) {
            return (
                <Box
                    sx={{
                        p: 4,
                        textAlign: "center",
                        bgcolor: "action.hover",
                        borderRadius: 2,
                    }}
                >
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                    >
                        {type === "bus" ? (
                            <>
                                <DirectionsBusIcon
                                    sx={{
                                        fontSize: 40,
                                        mb: 1,
                                        color: "primary.main",
                                        opacity: 0.6,
                                    }}
                                />
                                <br />
                                Không tìm thấy xe nào cùng loại
                            </>
                        ) : (
                            <>
                                <PersonIcon
                                    sx={{
                                        fontSize: 40,
                                        mb: 1,
                                        color: "primary.main",
                                        opacity: 0.6,
                                    }}
                                />
                                <br />
                                Không tìm thấy tài xế nào
                            </>
                        )}
                    </Typography>
                    {type === "bus" && currentBusType && (
                        <Typography color="text.secondary">
                            Loại xe: {currentBusType}
                        </Typography>
                    )}
                </Box>
            );
        }

        return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {items.map((item) => (
                    <Box
                        key={
                            type === "driver"
                                ? (item as Driver).driverId
                                : (item as Bus).busId
                        }
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor:
                                selectedId ===
                                (type === "driver"
                                    ? (item as Driver).driverId
                                    : (item as Bus).busId)
                                    ? "primary.main"
                                    : "divider",
                            bgcolor:
                                selectedId ===
                                (type === "driver"
                                    ? (item as Driver).driverId
                                    : (item as Bus).busId)
                                    ? alpha("#1976d2", 0.04)
                                    : "background.paper",
                            "&:hover": {
                                bgcolor: "action.hover",
                                transform: "translateY(-2px)",
                                boxShadow: 1,
                            },
                            transition: "all 0.2s ease",
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Radio
                                    checked={
                                        selectedId ===
                                        (type === "driver"
                                            ? (item as Driver).driverId
                                            : (item as Bus).busId)
                                    }
                                    onChange={() =>
                                        setSelectedId(
                                            type === "driver"
                                                ? (item as Driver).driverId
                                                : (item as Bus).busId
                                        )
                                    }
                                />
                            }
                            label=""
                        />
                        {type === "driver" ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    flex: 1,
                                }}
                            >
                                <Avatar
                                    src={(item as Driver).imageUrl}
                                    alt={(item as Driver).name}
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        border: 2,
                                        borderColor: "primary.main",
                                    }}
                                />
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={600}
                                    >
                                        {(item as Driver).name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {`Bằng lái: ${
                                            (item as Driver).licenseNumber
                                        } • SĐT: ${
                                            (item as Driver).phoneNumber
                                        }`}
                                    </Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    flex: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 60,
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        flexShrink: 0,
                                        border: "1px solid",
                                        borderColor: "divider",
                                    }}
                                >
                                    <img
                                        src={(item as Bus).busImage}
                                        alt={(item as Bus).licensePlate}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                </Box>
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight={600}
                                    >
                                        {(item as Bus).licensePlate}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {`${(item as Bus).busType} • ${
                                            (item as Bus).totalSeats
                                        } chỗ`}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        <Tooltip title="Xem lịch trình">
                            <IconButton
                                onClick={() =>
                                    handleViewSchedule(
                                        type === "driver"
                                            ? (item as Driver).driverId
                                            : (item as Bus).busId
                                    )
                                }
                                sx={{
                                    color: "primary.main",
                                    "&:hover": {
                                        bgcolor: alpha("#1976d2", 0.1),
                                    },
                                }}
                            >
                                <CalendarTodayIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ))}
            </Box>
        );
    };

    const handleMonthChange = async (month: string) => {
        if (!selectedId) return;

        try {
            const response = await axiosWithJWT.get<ScheduleResponse>(
                `/api/v1/schedules/${type}/${selectedId}?month=${month}`
            );
            setScheduleDialog((prev) => ({
                ...prev,
                data: response.data,
                currentMonth: month,
            }));
        } catch (error) {
            console.error("Error fetching schedule:", error);
            toast.error(
                `Không thể tải lịch ${type === "driver" ? "tài xế" : "xe"}`
            );
        }
    };

    const handleUpdate = async () => {
        if (!selectedId) return;

        try {
            const endpoint =
                type === "driver"
                    ? `/api/v1/schedules/${scheduleId}/driver?driverId=${selectedId}`
                    : `/api/v1/schedules/${scheduleId}/bus?busId=${selectedId}`;

            await axiosWithJWT.put(endpoint);
            toast.success(
                `Cập nhật ${type === "driver" ? "tài xế" : "xe"} thành công`
            );
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating:", error);
            toast.error(
                `Không thể cập nhật ${type === "driver" ? "tài xế" : "xe"}`
            );
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 2,
                        bgcolor: "primary.main",
                        color: "white",
                    }}
                >
                    <Typography variant="h6">
                        {`Thay đổi ${type === "driver" ? "tài xế" : "xe"}`}
                    </Typography>
                    {type === "bus" && (
                        <Typography
                            variant="subtitle2"
                            sx={{ ml: 1, opacity: 0.9 }}
                        >
                            ({currentBusType})
                        </Typography>
                    )}
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: "white",
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 3 }}>
                    {renderContent()}
                </DialogContent>

                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        color="inherit"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        variant="contained"
                        disabled={!selectedId}
                    >
                        Cập nhật
                    </Button>
                </DialogActions>
            </Dialog>

            <ScheduleDialog
                open={scheduleDialog.open}
                onClose={() =>
                    setScheduleDialog((prev) => ({ ...prev, open: false }))
                }
                type={type}
                scheduleData={scheduleDialog.data}
                selectedDate={scheduleDialog.selectedDate}
                onMonthChange={handleMonthChange}
            />
        </>
    );
};

export default UpdateDriverBusDialog;
