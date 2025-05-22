import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Grid,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    FormHelperText,
    Divider,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { useFormik } from "formik";
import * as Yup from "yup";
import { axiosWithJWT } from "../config/axiosConfig";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import RouteIcon from "@mui/icons-material/Route";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import dayjs from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CreateEditRoute from "./CreateEditRoute";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ScheduleDialog from "./ScheduleDialog";

interface CreateBusRouteProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Route {
    routeId: number;
    routeName: string;
    routeImage: string;
    departureLocation: string;
    arrivalLocation: string;
}

interface Bus {
    busId: number;
    licensePlate: string;
    busType: string;
    busImage: string;
    totalSeats: number;
}

interface Driver {
    driverId: number;
    name: string;
    licenseNumber: string;
    phoneNumber: string;
    imageUrl: string;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T[];
    pagination?: {
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
    };
}
interface Stop {
    location: string;
    stopOrder: number;
    arrivalTime: string;
}

interface ScheduleRequest {
    routeId: number;
    busId: number;
    driverId: number;
    departureTime: string;
    arrivalTime: string;
    price: number;
    pickupStops: Stop[];
    dropoffStops: Stop[];
}

interface ScheduleByDay {
    scheduleId: number;
    routeName: string;
    departureTime: string;
    arrivalTime: string;
}

interface ScheduleResponse {
    busId?: number;
    driverId?: number;
    month: string;
    schedulesByDay: {
        [key: string]: ScheduleByDay[];
    };
}

interface ScheduleDialogState {
    open: boolean;
    type: "bus" | "driver";
    data: ScheduleResponse | null;
    selectedDate: Date;
    currentMonth: string;
}

const CreateBusRoute: React.FC<CreateBusRouteProps> = ({
    open,
    onClose,
    onSuccess,
}) => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [scheduleDialog, setScheduleDialog] = useState<ScheduleDialogState>({
        open: false,
        type: "bus",
        data: null,
        selectedDate: dayjs().toDate(),
        currentMonth: dayjs().format("YYYY-MM"),
    });

    const handleClose = () => {
        formik.resetForm();
        onClose();
    };

    const getDatetimeWithDepartureDate = (
        timeOnly: any,
        departureTime: any
    ) => {
        const departure = dayjs(departureTime);
        const time = dayjs(timeOnly);
        return departure
            .hour(time.hour())
            .minute(time.minute())
            .second(0)
            .millisecond(0);
    };

    const formik = useFormik({
        initialValues: {
            routeId: "",
            busId: "",
            driverId: "",
            departureTime: null,
            arrivalTime: null,
            price: "",
            pickupStops: [
                {
                    location: "",
                    address: "",
                    stopOrder: 1,
                    arrivalTime: null,
                },
            ],
            dropoffStops: [
                {
                    location: "",
                    address: "",
                    stopOrder: 1,
                    arrivalTime: null,
                },
            ],
        },
        validationSchema: Yup.object({
            routeId: Yup.string().required("Vui lòng chọn chuyến xe"),
            busId: Yup.string().required("Vui lòng chọn xe"),
            driverId: Yup.string().required("Vui lòng chọn tài xế"),
            departureTime: Yup.mixed().required("Vui lòng chọn giờ khởi hành"),
            arrivalTime: Yup.mixed().required("Vui lòng chọn giờ đến"),
            price: Yup.number()
                .required("Vui lòng nhập giá vé")
                .min(1000, "Giá vé phải lớn hơn 1,000 VNĐ"),
            pickupStops: Yup.array().of(
                Yup.object().shape({
                    location: Yup.string().required("Vui lòng nhập tên điểm"),
                    address: Yup.string(),
                    arrivalTime: Yup.mixed().required("Vui lòng chọn giờ đón"),
                })
            ),
            dropoffStops: Yup.array().of(
                Yup.object().shape({
                    location: Yup.string().required("Vui lòng nhập tên điểm"),
                    address: Yup.string(),
                    arrivalTime: Yup.mixed().required("Vui lòng chọn giờ trả"),
                })
            ),
        }),
        onSubmit: async (values) => {
            try {
                const formatStops = (stops: any[]) => {
                    return stops.map((stop) => ({
                        location: stop.address
                            ? `${stop.location.trim()} (${stop.address.trim()})`
                            : stop.location.trim(),
                        stopOrder: stop.stopOrder,
                        arrivalTime: getDatetimeWithDepartureDate(
                            stop.arrivalTime,
                            values.departureTime
                        ).format("YYYY-MM-DDTHH:mm:ss"),
                    }));
                };

                const requestData: ScheduleRequest = {
                    routeId: Number(values.routeId),
                    busId: Number(values.busId),
                    driverId: Number(values.driverId),
                    departureTime: dayjs(values.departureTime).format(
                        "YYYY-MM-DDTHH:mm:ss"
                    ),
                    arrivalTime: dayjs(values.arrivalTime).format(
                        "YYYY-MM-DDTHH:mm:ss"
                    ),
                    price: Number(values.price),
                    pickupStops: formatStops(values.pickupStops),
                    dropoffStops: formatStops(values.dropoffStops),
                };

                const response = await axiosWithJWT.post(
                    "/api/v1/schedules",
                    requestData
                );

                if (response.status === 201) {
                    toast.success("Tạo chuyến xe thành công");
                    formik.resetForm();
                    onSuccess();
                    onClose();
                }
            } catch (error: any) {
                console.error("Error creating bus route:", error);
                toast.error(
                    error.response?.data?.message ||
                        "Có lỗi xảy ra khi tạo tuyến xe"
                );
            }
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [routesRes, busesRes, driversRes] = await Promise.all([
                    axiosWithJWT.get<ApiResponse<Route>>("/api/v1/routes"),
                    axiosWithJWT.get<ApiResponse<Bus>>(
                        "/api/v1/buses?pageNumber=1&pageSize=20"
                    ),
                    axiosWithJWT.get<ApiResponse<Driver>>(
                        "/api/v1/drivers?pageNumber=1&pageSize=10"
                    ),
                ]);

                if (routesRes.data.status === 200) {
                    setRoutes(routesRes.data.data);
                }

                if (busesRes.data.status === 200) {
                    setBuses(busesRes.data.data);
                }

                if (driversRes.data.status === 200) {
                    setDrivers(driversRes.data.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            }
        };

        if (open) {
            fetchData();
        }
    }, [open]);

    const handleAddPickupStop = () => {
        const newStops = [...formik.values.pickupStops];
        newStops.push({
            location: "",
            address: "",
            stopOrder: newStops.length + 1,
            arrivalTime: null,
        });
        formik.setFieldValue("pickupStops", newStops);
    };

    const handleAddDropoffStop = () => {
        const newStops = [...formik.values.dropoffStops];
        newStops.push({
            location: "",
            address: "",
            stopOrder: newStops.length + 1,
            arrivalTime: null,
        });
        formik.setFieldValue("dropoffStops", newStops);
    };

    const handleRemovePickupStop = (index: number) => {
        if (formik.values.pickupStops.length > 1) {
            const newStops = [...formik.values.pickupStops];
            newStops.splice(index, 1);
            // Update stopOrder for remaining stops
            newStops.forEach((stop, i) => {
                stop.stopOrder = i + 1;
            });
            formik.setFieldValue("pickupStops", newStops);
        }
    };

    const handleRemoveDropoffStop = (index: number) => {
        if (formik.values.dropoffStops.length > 1) {
            const newStops = [...formik.values.dropoffStops];
            newStops.splice(index, 1);
            // Update stopOrder for remaining stops
            newStops.forEach((stop, i) => {
                stop.stopOrder = i + 1;
            });
            formik.setFieldValue("dropoffStops", newStops);
        }
    };

    const handleMonthChange = async (month: string) => {
        const type = scheduleDialog.type;
        const id =
            type === "bus"
                ? scheduleDialog.data?.busId
                : scheduleDialog.data?.driverId;
        if (!id) {
            return;
        }

        try {
            const response = await axiosWithJWT.get<ScheduleResponse>(
                `/api/v1/schedules/${type}/${id}?month=${month}`
            );

            setScheduleDialog((prev) => ({
                ...prev,
                data: response.data,
                selectedDate: dayjs(month + "-01").toDate(),
                currentMonth: month,
            }));
        } catch (error) {
            console.error(`Error fetching ${type} schedule:`, error);
            toast.error(
                `Không thể tải lịch ${type === "bus" ? "xe" : "tài xế"}`
            );
        }
    };

    const fetchSchedules = async (
        type: "bus" | "driver",
        id: number,
        selectedMonth?: string
    ) => {
        const month = selectedMonth || dayjs().format("YYYY-MM");

        try {
            const response = await axiosWithJWT.get<ScheduleResponse>(
                `/api/v1/schedules/${type}/${id}?month=${month}`
            );

            setScheduleDialog({
                open: true,
                type,
                data: response.data,
                selectedDate: dayjs(month + "-01").toDate(),
                currentMonth: month,
            });
        } catch (error) {
            console.error(`Error fetching ${type} schedule:`, error);
            toast.error(
                `Không thể tải lịch ${type === "bus" ? "xe" : "tài xế"}`
            );
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xl"
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
                    bgcolor: "#1976d2",
                    color: "white",
                }}
            >
                <RouteIcon />
                <Typography variant="h6" component="span" sx={{ flex: 1 }}>
                    Thêm chuyến xe mới
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: "white",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={formik.handleSubmit}>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        {/* Left Column */}
                        <Grid item xs={12} md={5}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 3,
                                }}
                            >
                                <Box sx={{ width: "100%" }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Chọn chuyến</InputLabel>
                                        <Select
                                            name="routeId"
                                            value={formik.values.routeId}
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched.routeId &&
                                                Boolean(formik.errors.routeId)
                                            }
                                            label="Chọn chuyến"
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: { maxHeight: 450 },
                                                },
                                            }}
                                        >
                                            {routes.map((route) => (
                                                <MenuItem
                                                    key={route.routeId}
                                                    value={route.routeId}
                                                    sx={{
                                                        py: 2,
                                                        "&:hover": {
                                                            bgcolor:
                                                                "action.hover",
                                                        },
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 2,
                                                            width: "100%",
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 80,
                                                                height: 60,
                                                                borderRadius: 2,
                                                                overflow:
                                                                    "hidden",
                                                                flexShrink: 0,
                                                                border: "1px solid",
                                                                borderColor:
                                                                    "divider",
                                                            }}
                                                        >
                                                            <img
                                                                src={
                                                                    route.routeImage
                                                                }
                                                                alt={
                                                                    route.routeName
                                                                }
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                            />
                                                        </Box>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography
                                                                variant="subtitle1"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    mb: 0.5,
                                                                }}
                                                            >
                                                                {
                                                                    route.routeName
                                                                }
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {formik.touched.routeId &&
                                            formik.errors.routeId && (
                                                <FormHelperText error>
                                                    {formik.errors.routeId}
                                                </FormHelperText>
                                            )}
                                    </FormControl>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 2,
                                            mt: 2,
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <Button
                                            startIcon={<AddIcon />}
                                            onClick={() => {
                                                setSelectedRoute(null);
                                                setIsRouteDialogOpen(true);
                                            }}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                textTransform: "none",
                                                borderRadius: 1,
                                            }}
                                        >
                                            Thêm tuyến mới
                                        </Button>

                                        {formik.values.routeId && (
                                            <Button
                                                startIcon={<EditIcon />}
                                                onClick={() => {
                                                    const selectedRoute =
                                                        routes.find(
                                                            (r) =>
                                                                r.routeId ===
                                                                Number(
                                                                    formik
                                                                        .values
                                                                        .routeId
                                                                )
                                                        );
                                                    setSelectedRoute(
                                                        selectedRoute || null
                                                    );
                                                    setIsRouteDialogOpen(true);
                                                }}
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                sx={{
                                                    textTransform: "none",
                                                    borderRadius: 1,
                                                }}
                                            >
                                                Sửa ảnh tuyến
                                            </Button>
                                        )}
                                    </Box>

                                    <CreateEditRoute
                                        open={isRouteDialogOpen}
                                        onClose={() => {
                                            setIsRouteDialogOpen(false);
                                            setSelectedRoute(null);
                                        }}
                                        onSuccess={async () => {
                                            try {
                                                const response =
                                                    await axiosWithJWT.get<
                                                        ApiResponse<Route>
                                                    >("/api/v1/routes");
                                                if (
                                                    response.data.status === 200
                                                ) {
                                                    setRoutes(
                                                        response.data.data
                                                    );
                                                    toast.success(
                                                        "Cập nhật danh sách tuyến thành công"
                                                    );
                                                }
                                            } catch (error) {
                                                console.error(
                                                    "Error fetching routes:",
                                                    error
                                                );
                                                toast.error(
                                                    "Không thể tải danh sách tuyến. Vui lòng thử lại sau."
                                                );
                                            }
                                        }}
                                        route={selectedRoute}
                                    />
                                </Box>

                                <FormControl fullWidth>
                                    <InputLabel>Chọn xe</InputLabel>
                                    <Select
                                        name="busId"
                                        value={formik.values.busId}
                                        onChange={formik.handleChange}
                                        error={
                                            formik.touched.busId &&
                                            Boolean(formik.errors.busId)
                                        }
                                        label="Chọn xe"
                                        MenuProps={{
                                            PaperProps: {
                                                sx: { maxHeight: 450 },
                                            },
                                        }}
                                    >
                                        {buses.map((bus) => (
                                            <MenuItem
                                                key={bus.busId}
                                                value={bus.busId}
                                                sx={{ py: 1.5 }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 2,
                                                        width: "100%",
                                                    }}
                                                >
                                                    <img
                                                        src={bus.busImage}
                                                        alt={bus.licensePlate}
                                                        style={{
                                                            width: 80,
                                                            height: 60,
                                                            borderRadius: 8,
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography
                                                            variant="subtitle1"
                                                            sx={{
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {bus.licensePlate}
                                                        </Typography>
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                gap: 2,
                                                                mt: 0.5,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {bus.busType}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                •
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {bus.totalSeats}{" "}
                                                                chỗ
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                {!formik.values.busId && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            fetchSchedules(
                                                                "bus",
                                                                bus.busId
                                                            );
                                                        }}
                                                        sx={{
                                                            color: "primary.main",
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "primary.lighter",
                                                            },
                                                        }}
                                                    >
                                                        <CalendarTodayIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formik.touched.busId &&
                                        formik.errors.busId && (
                                            <FormHelperText error>
                                                {formik.errors.busId}
                                            </FormHelperText>
                                        )}
                                </FormControl>
                                {/* <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 2,
                                    }}
                                >
                                    {formik.values.busId &&
                                        formik.values.departureTime && (
                                            <Button
                                                variant="outlined"
                                                onClick={() =>
                                                    fetchSchedules(
                                                        "bus",
                                                        Number(
                                                            formik.values.busId
                                                        )
                                                    )
                                                }
                                                startIcon={
                                                    <CalendarTodayIcon />
                                                }
                                                size="small"
                                                sx={{
                                                    textTransform: "none",
                                                }}
                                            >
                                                Xem lịch xe
                                            </Button>
                                        )}
                                </Box> */}

                                <FormControl fullWidth>
                                    <InputLabel>Chọn tài xế</InputLabel>
                                    <Select
                                        name="driverId"
                                        value={formik.values.driverId}
                                        onChange={formik.handleChange}
                                        error={
                                            formik.touched.driverId &&
                                            Boolean(formik.errors.driverId)
                                        }
                                        label="Chọn tài xế"
                                        MenuProps={{
                                            PaperProps: {
                                                sx: { maxHeight: 450 },
                                            },
                                        }}
                                    >
                                        {drivers.map((driver) => (
                                            <MenuItem
                                                key={driver.driverId}
                                                value={driver.driverId}
                                                sx={{ py: 1.5 }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 2,
                                                        width: "100%",
                                                    }}
                                                >
                                                    <img
                                                        src={driver.imageUrl}
                                                        alt={driver.name}
                                                        style={{
                                                            width: 60,
                                                            height: 60,
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                            border: "2px solid #1976d2",
                                                        }}
                                                    />
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography
                                                            variant="subtitle1"
                                                            sx={{
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {driver.name}
                                                        </Typography>
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                gap: 2,
                                                                mt: 0.5,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Bằng lái:{" "}
                                                                {
                                                                    driver.licenseNumber
                                                                }
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                •
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                SĐT:{" "}
                                                                {
                                                                    driver.phoneNumber
                                                                }
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                {!formik.values.driverId && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            fetchSchedules(
                                                                "driver",
                                                                driver.driverId
                                                            );
                                                        }}
                                                        sx={{
                                                            color: "primary.main",
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "primary.lighter",
                                                            },
                                                        }}
                                                    >
                                                        <CalendarTodayIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formik.touched.driverId &&
                                        formik.errors.driverId && (
                                            <FormHelperText error>
                                                {formik.errors.driverId}
                                            </FormHelperText>
                                        )}
                                </FormControl>
                                {/* <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 2,
                                    }}
                                >
                                    {formik.values.driverId &&
                                        formik.values.departureTime && (
                                            <Button
                                                variant="outlined"
                                                onClick={() =>
                                                    fetchSchedules(
                                                        "driver",
                                                        Number(
                                                            formik.values
                                                                .driverId
                                                        )
                                                    )
                                                }
                                                startIcon={
                                                    <CalendarTodayIcon />
                                                }
                                                size="small"
                                                sx={{
                                                    textTransform: "none",
                                                }}
                                            >
                                                Xem lịch tài xế
                                            </Button>
                                        )}
                                </Box> */}

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        alignItems: "center",
                                    }}
                                >
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}
                                    >
                                        <DateTimePicker
                                            label="Giờ khởi hành"
                                            value={formik.values.departureTime}
                                            onChange={(value) => {
                                                formik.setFieldValue(
                                                    "departureTime",
                                                    value
                                                );
                                            }}
                                            format="DD/MM/YYYY HH:mm"
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: "small",
                                                    error:
                                                        formik.touched
                                                            .departureTime &&
                                                        Boolean(
                                                            formik.errors
                                                                .departureTime
                                                        ),
                                                    helperText:
                                                        formik.touched
                                                            .departureTime &&
                                                        formik.errors
                                                            .departureTime,
                                                    InputProps: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <CalendarTodayIcon color="primary" />
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                },
                                                actionBar: {
                                                    actions: ["today", "clear"],
                                                },
                                            }}
                                            minDateTime={dayjs()}
                                            sx={{
                                                width: "100%",
                                                "& .MuiInputBase-root": {
                                                    borderRadius: 1,
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        alignItems: "center",
                                    }}
                                >
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}
                                    >
                                        <DateTimePicker
                                            label="Giờ đến"
                                            value={formik.values.arrivalTime}
                                            onChange={(value) =>
                                                formik.setFieldValue(
                                                    "arrivalTime",
                                                    value
                                                )
                                            }
                                            format="DD/MM/YYYY HH:mm"
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: "small",
                                                    error:
                                                        formik.touched
                                                            .arrivalTime &&
                                                        Boolean(
                                                            formik.errors
                                                                .arrivalTime
                                                        ),
                                                    helperText:
                                                        formik.touched
                                                            .arrivalTime &&
                                                        formik.errors
                                                            .arrivalTime,
                                                    InputProps: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <CalendarTodayIcon color="primary" />
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                },
                                                actionBar: {
                                                    actions: ["today", "clear"],
                                                },
                                            }}
                                            minDateTime={
                                                formik.values.departureTime ||
                                                dayjs()
                                            }
                                            disabled={
                                                !formik.values.departureTime
                                            }
                                            sx={{
                                                width: "100%",
                                                "& .MuiInputBase-root": {
                                                    borderRadius: 1,
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Box>

                                <TextField
                                    fullWidth
                                    label="Giá vé"
                                    name="price"
                                    type="number"
                                    value={formik.values.price}
                                    onChange={formik.handleChange}
                                    error={
                                        formik.touched.price &&
                                        Boolean(formik.errors.price)
                                    }
                                    helperText={
                                        formik.touched.price &&
                                        formik.errors.price
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AttachMoneyIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                VNĐ
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        </Grid>
                        {/* Right Column */}
                        <Grid item xs={12} md={7}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 3,
                                }}
                            >
                                {/* Right Column */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 3,
                                    }}
                                >
                                    {/* Pickup Points */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 2,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 600,
                                                color: "primary.main",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <LocationOnIcon /> Điểm đón khách
                                        </Typography>
                                        <Button
                                            startIcon={<AddCircleOutlineIcon />}
                                            onClick={handleAddPickupStop}
                                            sx={{
                                                color: "white",
                                                backgroundColor: "primary.main",
                                                "&:hover": {
                                                    backgroundColor:
                                                        "primary.dark",
                                                },
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: 1,
                                                textTransform: "none",
                                            }}
                                        >
                                            Thêm điểm đón
                                        </Button>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "0.5fr 1.2fr 1.5fr 0.75fr 20px",
                                            gap: 2,
                                            mb: 2,
                                            alignItems: "center",
                                            px: 1,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                            textAlign="center"
                                        >
                                            Thứ tự
                                        </Typography>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            Tên điểm đón/trả
                                        </Typography>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            Địa chỉ
                                        </Typography>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            Thời gian
                                        </Typography>
                                    </Box>

                                    {formik.values.pickupStops.map(
                                        (stop, index) => (
                                            <Box
                                                key={`pickup-${index}`}
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "0.5fr 1.2fr 1.5fr 0.75fr 20px",
                                                    gap: 2,
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: "50%",
                                                        bgcolor: "primary.main",
                                                        color: "white",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                        mx: "auto",
                                                    }}
                                                >
                                                    {index + 1}
                                                </Typography>
                                                <TextField
                                                    size="small"
                                                    placeholder="Nhập tên điểm"
                                                    value={stop.location}
                                                    onChange={(e) => {
                                                        const newStops = [
                                                            ...formik.values
                                                                .pickupStops,
                                                        ];
                                                        newStops[
                                                            index
                                                        ].location =
                                                            e.target.value;
                                                        formik.setFieldValue(
                                                            "pickupStops",
                                                            newStops
                                                        );
                                                    }}
                                                />
                                                <TextField
                                                    size="small"
                                                    placeholder="Nhập địa chỉ chi tiết"
                                                    value={stop.address || ""}
                                                    onChange={(e) => {
                                                        const newStops = [
                                                            ...formik.values
                                                                .pickupStops,
                                                        ];
                                                        newStops[
                                                            index
                                                        ].address =
                                                            e.target.value;
                                                        formik.setFieldValue(
                                                            "pickupStops",
                                                            newStops
                                                        );
                                                    }}
                                                />
                                                <LocalizationProvider
                                                    dateAdapter={AdapterDayjs}
                                                >
                                                    <TimePicker
                                                        value={stop.arrivalTime}
                                                        format="HH:mm"
                                                        onChange={(
                                                            value: any
                                                        ) => {
                                                            const newStops = [
                                                                ...formik.values
                                                                    .pickupStops,
                                                            ];
                                                            newStops[
                                                                index
                                                            ].arrivalTime =
                                                                value;
                                                            formik.setFieldValue(
                                                                "pickupStops",
                                                                newStops
                                                            );
                                                        }}
                                                        slotProps={{
                                                            textField: {
                                                                size: "small",
                                                                fullWidth: true,
                                                                placeholder:
                                                                    "Chọn giờ",
                                                            },
                                                        }}
                                                    />
                                                </LocalizationProvider>

                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleRemovePickupStop(
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        formik.values
                                                            .pickupStops
                                                            .length === 1
                                                    }
                                                    sx={{
                                                        color: "error.main",
                                                        visibility:
                                                            formik.values
                                                                .pickupStops
                                                                .length === 1
                                                                ? "hidden"
                                                                : "visible",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                "error.lighter",
                                                        },
                                                        width: "30px",
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )
                                    )}

                                    {/* Dropoff Points */}

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 2,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 600,
                                                color: "error.main",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <LocationOnIcon /> Điểm trả khách
                                        </Typography>
                                        <Button
                                            startIcon={<AddCircleOutlineIcon />}
                                            onClick={handleAddDropoffStop}
                                            sx={{
                                                color: "white",
                                                backgroundColor: "error.main",
                                                textTransform: "none",
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: 1,
                                            }}
                                        >
                                            Thêm điểm trả
                                        </Button>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "0.5fr 1.2fr 1.5fr 0.75fr 20px",
                                            gap: 2,
                                            mb: 2,
                                            alignItems: "center",
                                            px: 1,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                            textAlign="center"
                                        >
                                            Thứ tự
                                        </Typography>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            Tên điểm đón/trả
                                        </Typography>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            Địa chỉ
                                        </Typography>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            Thời gian
                                        </Typography>
                                    </Box>

                                    {formik.values.dropoffStops.map(
                                        (stop, index) => (
                                            <Box
                                                key={`dropoff-${index}`}
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "0.5fr 1.2fr 1.5fr 0.75fr 20px",
                                                    gap: 2,
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: "50%",
                                                        bgcolor: "error.main",
                                                        color: "white",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                        mx: "auto",
                                                    }}
                                                >
                                                    {index + 1}
                                                </Typography>

                                                <TextField
                                                    size="small"
                                                    placeholder="Nhập tên điểm"
                                                    value={stop.location}
                                                    onChange={(e) => {
                                                        const newStops = [
                                                            ...formik.values
                                                                .dropoffStops,
                                                        ];
                                                        newStops[
                                                            index
                                                        ].location =
                                                            e.target.value;
                                                        formik.setFieldValue(
                                                            "dropoffStops",
                                                            newStops
                                                        );
                                                    }}
                                                />
                                                <TextField
                                                    size="small"
                                                    placeholder="Nhập địa chỉ chi tiết"
                                                    value={stop.address || ""}
                                                    onChange={(e) => {
                                                        const newStops = [
                                                            ...formik.values
                                                                .dropoffStops,
                                                        ];
                                                        newStops[
                                                            index
                                                        ].address =
                                                            e.target.value;
                                                        formik.setFieldValue(
                                                            "dropoffStops",
                                                            newStops
                                                        );
                                                    }}
                                                />
                                                <LocalizationProvider
                                                    dateAdapter={AdapterDayjs}
                                                >
                                                    <TimePicker
                                                        value={stop.arrivalTime}
                                                        format="HH:mm"
                                                        onChange={(
                                                            value: any
                                                        ) => {
                                                            const newStops = [
                                                                ...formik.values
                                                                    .dropoffStops,
                                                            ];
                                                            newStops[
                                                                index
                                                            ].arrivalTime =
                                                                value;
                                                            formik.setFieldValue(
                                                                "dropoffStops",
                                                                newStops
                                                            );
                                                        }}
                                                        slotProps={{
                                                            textField: {
                                                                size: "small",
                                                                fullWidth: true,
                                                                placeholder:
                                                                    "Chọn giờ",
                                                            },
                                                        }}
                                                    />
                                                </LocalizationProvider>
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleRemoveDropoffStop(
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        formik.values
                                                            .dropoffStops
                                                            .length === 1
                                                    }
                                                    sx={{
                                                        color: "error.main",
                                                        visibility:
                                                            formik.values
                                                                .dropoffStops
                                                                .length === 1
                                                                ? "hidden"
                                                                : "visible",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                "error.lighter",
                                                        },
                                                        width: 40,
                                                        height: 40,
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                <ScheduleDialog
                    open={scheduleDialog.open}
                    onClose={() =>
                        setScheduleDialog((prev) => ({
                            ...prev,
                            open: false,
                            selectedDate: dayjs(
                                scheduleDialog.currentMonth
                            ).toDate(), // Use stored month
                        }))
                    }
                    type={scheduleDialog.type}
                    scheduleData={scheduleDialog.data}
                    selectedDate={dayjs(scheduleDialog.currentMonth).toDate()} // Use stored month
                    onMonthChange={handleMonthChange}
                />

                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        color="inherit"
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ borderRadius: 2, px: 3 }}
                        disabled={!formik.isValid || formik.isSubmitting}
                    >
                        Tạo chuyến xe
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateBusRoute;
