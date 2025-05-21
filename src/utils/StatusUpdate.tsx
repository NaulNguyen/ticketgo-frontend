import {
    Box,
    Typography,
    MenuItem,
    Select,
    SelectChangeEvent,
} from "@mui/material";
import { toast } from "react-toastify";
import { axiosWithJWT } from "../config/axiosConfig";

interface StatusUpdateProps {
    currentStatus: string;
    scheduleId: string;
    onStatusUpdate: () => void;
}

export const StatusUpdate = ({
    currentStatus,
    scheduleId,
    onStatusUpdate,
}: StatusUpdateProps) => {
    const getAvailableStatuses = (currentStatus: string) => {
        switch (currentStatus) {
            case "Chưa khởi hành":
                return ["Chưa khởi hành", "Đang chạy", "Hoàn thành"];
            case "Đang chạy":
                return ["Đang chạy", "Hoàn thành"];
            case "Hoàn thành":
                return ["Hoàn thành"];
            default:
                return [currentStatus];
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Chưa khởi hành":
                return "#FFA726"; // Orange
            case "Đang chạy":
                return "#66BB6A"; // Green
            case "Hoàn thành":
                return "#42A5F5"; // Blue
            default:
                return "#9E9E9E"; // Grey
        }
    };

    const handleStatusChange = async (event: SelectChangeEvent<string>) => {
        const newStatus = event.target.value;
        if (newStatus === currentStatus) return;

        try {
            const response = await axiosWithJWT.put(
                `/api/v1/schedules/${scheduleId}/status?status=${newStatus}`
            );

            if (response.data.status === 200) {
                toast.success("Cập nhật trạng thái thành công");
                onStatusUpdate();
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
        }
    };

    const availableStatuses = getAvailableStatuses(currentStatus);

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Select
                value={currentStatus}
                onChange={handleStatusChange}
                size="small"
                sx={{
                    minWidth: 150,
                    "& .MuiSelect-select": {
                        py: 0.5,
                        bgcolor: `${getStatusColor(currentStatus)}20`,
                        color: getStatusColor(currentStatus),
                        fontWeight: 600,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: `${getStatusColor(currentStatus)}40`,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: getStatusColor(currentStatus),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: getStatusColor(currentStatus),
                    },
                }}
            >
                {availableStatuses.map((status) => (
                    <MenuItem
                        key={status}
                        value={status}
                        sx={{
                            color: getStatusColor(status),
                            fontWeight: status === currentStatus ? 600 : 400,
                            "&:hover": {
                                bgcolor: `${getStatusColor(status)}10`,
                            },
                            "&.Mui-selected": {
                                bgcolor: `${getStatusColor(status)}20`,
                                "&:hover": {
                                    bgcolor: `${getStatusColor(status)}30`,
                                },
                            },
                        }}
                    >
                        {status}
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );
};
