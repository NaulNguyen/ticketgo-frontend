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
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                <Box>Lịch {type === "bus" ? "xe" : "tài xế"} trong tháng</Box>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        views={["month", "year"]}
                        value={dayjs(selectedDate)}
                        onChange={(newValue) => {
                            if (newValue) {
                                onMonthChange(newValue.format("YYYY-MM"));
                            }
                        }}
                        sx={{ width: 200 }}
                        slotProps={{
                            textField: {
                                size: "small",
                                InputProps: {
                                    sx: { borderRadius: 1 },
                                },
                            },
                        }}
                    />
                </LocalizationProvider>
            </DialogTitle>
            <DialogContent dividers>
                {scheduleData &&
                Object.keys(scheduleData.schedulesByDay).length > 0 ? (
                    Object.entries(scheduleData.schedulesByDay)
                        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                        .map(([date, schedules]) => (
                            <Box key={date} sx={{ mb: 2 }}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 1,
                                        color: dayjs(date).isSame(
                                            selectedDate,
                                            "day"
                                        )
                                            ? "primary.main"
                                            : "text.primary",
                                    }}
                                >
                                    {dayjs(date).format("DD/MM/YYYY")}
                                </Typography>
                                {schedules.map((schedule) => (
                                    <Box
                                        key={schedule.scheduleId}
                                        sx={{
                                            p: 1.5,
                                            bgcolor: "background.paper",
                                            borderRadius: 1,
                                            border: "1px solid",
                                            borderColor: dayjs(
                                                schedule.departureTime
                                            ).isSame(selectedDate, "day")
                                                ? "primary.main"
                                                : "divider",
                                            mb: 1,
                                            "&:hover": {
                                                bgcolor: "action.hover",
                                            },
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {schedule.routeName}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {dayjs(
                                                schedule.departureTime
                                            ).format("HH:mm")}{" "}
                                            -
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
                        }}
                    >
                        <Typography variant="body1" color="text.secondary">
                            Không có lịch trình nào trong tháng này
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Đóng</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ScheduleDialog;
