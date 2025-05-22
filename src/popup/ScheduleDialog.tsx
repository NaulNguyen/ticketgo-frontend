import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { EventNote } from "@mui/icons-material";

interface ScheduleDialogProps {
    open: boolean;
    onClose: () => void;
    scheduleData: ScheduleResponse | null;
    type: "bus" | "driver";
    selectedDate: Date | null;
    onMonthChange: (month: string) => void;
}

interface ScheduleResponse {
    busId?: number;
    driverId?: number;
    month: string;
    schedulesByDay: {
        [key: string]: ScheduleByDay[];
    };
}

interface ScheduleByDay {
    scheduleId: number;
    routeName: string;
    departureTime: string;
    arrivalTime: string;
}

const ScheduleDialog = ({
    open,
    onClose,
    scheduleData,
    type,
    selectedDate,
    onMonthChange,
}: ScheduleDialogProps) => {
    if (!scheduleData) return null;
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    bgcolor: "primary.main",
                    color: "white",
                    py: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EventNote />
                    <Typography variant="h6">
                        Lịch {type === "bus" ? "xe" : "tài xế"} trong tháng
                    </Typography>
                </Box>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        views={["month", "year"]}
                        value={dayjs(selectedDate)}
                        onChange={(newValue) => {
                            if (newValue) {
                                onMonthChange(newValue.format("YYYY-MM"));
                            }
                        }}
                        sx={{
                            width: 200,
                            bgcolor: "white",
                            borderRadius: 1,
                            "& .MuiInputBase-root": {
                                borderRadius: 1,
                            },
                        }}
                        slotProps={{
                            textField: {
                                size: "small",
                            },
                        }}
                    />
                </LocalizationProvider>
            </DialogTitle>
            <DialogContent
                dividers
                sx={{
                    p: 3,
                    bgcolor: "#f8f9fa",
                    maxHeight: 600,
                }}
            >
                {scheduleData &&
                Object.keys(scheduleData.schedulesByDay).length > 0 ? (
                    Object.entries(scheduleData.schedulesByDay)
                        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                        .map(([date, schedules]) => (
                            <Box
                                key={date}
                                sx={{
                                    mb: 3,
                                    backgroundColor: "white",
                                    borderRadius: 2,
                                    p: 2,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 2,
                                        color: "text.primary",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <EventNote fontSize="small" />
                                    {dayjs(date).format("DD/MM/YYYY")}
                                </Typography>
                                {schedules.map((schedule) => (
                                    <Box
                                        key={schedule.scheduleId}
                                        sx={{
                                            p: 2,
                                            borderRadius: 1,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            mb: 1,
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                bgcolor: "primary.lighter",
                                                borderColor: "primary.main",
                                                transform: "translateY(-1px)",
                                                boxShadow:
                                                    "0 2px 8px rgba(0,0,0,0.05)",
                                            },
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: 500,
                                                color: "primary.main",
                                                mb: 0.5,
                                            }}
                                        >
                                            {schedule.routeName}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                            }}
                                        >
                                            {dayjs(
                                                schedule.departureTime
                                            ).format("HH:mm")}
                                            {" - "}
                                            {dayjs(schedule.arrivalTime).format(
                                                "HH:mm"
                                            )}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        ))
                ) : (
                    <Box
                        sx={{
                            py: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: 2,
                            color: "text.secondary",
                        }}
                    >
                        <EventNote sx={{ fontSize: 48, opacity: 0.5 }} />
                        <Typography variant="h6">
                            Không có lịch trình nào trong tháng này
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: "background.default" }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        borderRadius: 1,
                        textTransform: "none",
                    }}
                >
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ScheduleDialog;
