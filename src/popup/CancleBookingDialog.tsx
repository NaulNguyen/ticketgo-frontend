import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Box,
    Divider,
    Alert,
} from "@mui/material";
import { formatPrice } from "../utils/formatPrice";

interface CancelBookingDialogProps {
    open: boolean;
    onClose: () => void;
    bookingId: number;
    departureDate: string;
    originalPrice: string;
    discountedPrice: string | null;
    onConfirmCancel: (
        bookingId: number,
        amount: number,
        reason: string
    ) => void;
}

const CANCEL_REASONS = [
    "Thay đổi lịch trình",
    "Đặt nhầm chuyến",
    "Đặt nhầm giờ/ngày",
    "Lý do cá nhân khác",
];

const CancelBookingDialog = ({
    open,
    onClose,
    bookingId,
    departureDate,
    originalPrice,
    discountedPrice,
    onConfirmCancel,
}: CancelBookingDialogProps) => {
    const [selectedReason, setSelectedReason] = useState("");
    const [refundAmount, setRefundAmount] = useState(0);

    useEffect(() => {
        if (open) {
            calculateRefundAmount();
        }
    }, [open, departureDate, originalPrice, discountedPrice]);

    const parseVNDateTime = (dateTimeStr: string): Date => {
        // Expected format: "HH:mm dd/MM/yyyy"
        const [time, date] = dateTimeStr.split(" ");
        const [hours, minutes] = time.split(":");
        const [day, month, year] = date.split("/");

        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hours),
            Number(minutes)
        );
    };

    const calculateRefundAmount = () => {
        try {
            const price = discountedPrice || originalPrice;
            const priceNumber = parseFloat(price);

            const departureMoment = parseVNDateTime(departureDate);
            const now = new Date();

            // Check if date is valid
            if (isNaN(departureMoment.getTime())) {
                console.error("Invalid departure date format:", departureDate);
                setRefundAmount(0);
                return;
            }

            const hoursDifference = Math.floor(
                (departureMoment.getTime() - now.getTime()) / (1000 * 60 * 60)
            );

            console.log({
                departureMoment: departureMoment.toLocaleString("vi-VN"),
                now: now.toLocaleString("vi-VN"),
                hoursDifference,
            });

            let refundPercentage = 0;
            if (hoursDifference >= 48) {
                refundPercentage = 100;
            } else if (hoursDifference >= 12) {
                refundPercentage = 70;
            }

            const calculatedRefund = (priceNumber * refundPercentage) / 100;
            setRefundAmount(calculatedRefund);
        } catch (error) {
            console.error("Error calculating refund:", error);
            setRefundAmount(0);
        }
    };

    const handleCancel = () => {
        if (!selectedReason) {
            alert("Vui lòng chọn lý do hủy vé");
            return;
        }
        onConfirmCancel(bookingId, refundAmount, selectedReason);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    maxHeight: "90vh",
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle
                sx={{
                    bgcolor: "#1976d2",
                    color: "white",
                    px: 3,
                    py: 2,
                }}
            >
                Hủy vé
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                {/* Refund Policy Section */}
                <Typography
                    variant="subtitle1"
                    fontWeight="600"
                    color="primary"
                    sx={{ mb: 1, mt: 1 }}
                >
                    Chính sách hoàn tiền
                </Typography>
                <Box
                    sx={{
                        mb: 2.5,
                        bgcolor: "#f8f9fa",
                        p: 2,
                        borderRadius: 1,
                        border: "1px solid #e9ecef",
                    }}
                >
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        • Hủy trước 48h so với giờ khởi hành ⇒ hoàn 100%
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        • Hủy trước 12h so với giờ khởi hành ⇒ hoàn 70%
                    </Typography>
                    <Typography variant="body2">
                        • Hủy sau 12h so với giờ khởi hành ⇒ không hoàn tiền
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Refund Amount Section */}
                <Typography
                    variant="subtitle1"
                    fontWeight="600"
                    color="primary"
                    sx={{ mb: 1 }}
                >
                    Số tiền hoàn trả
                </Typography>
                <Alert
                    severity={refundAmount > 0 ? "success" : "warning"}
                    sx={{
                        mb: 2.5,
                        "& .MuiAlert-message": {
                            fontSize: "0.925rem",
                        },
                    }}
                    variant="outlined"
                >
                    {refundAmount > 0
                        ? `Số tiền hoàn trả: ${formatPrice(
                              refundAmount.toString(),
                              null
                          )} VND`
                        : "Không được hoàn tiền theo chính sách"}
                </Alert>

                {/* Reason Selection Section */}
                <Typography
                    variant="subtitle1"
                    fontWeight="600"
                    color="primary"
                    sx={{ mb: 0.5 }}
                >
                    Lý do hủy vé
                </Typography>
                <RadioGroup
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                >
                    {CANCEL_REASONS.map((reason) => (
                        <FormControlLabel
                            key={reason}
                            value={reason}
                            control={
                                <Radio
                                    size="small"
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "primary.main",
                                        },
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    {reason}
                                </Typography>
                            }
                        />
                    ))}
                </RadioGroup>
            </DialogContent>
            <DialogActions
                sx={{
                    p: 3,
                    bgcolor: "#f8f9fa",
                    borderTop: "1px solid #e9ecef",
                }}
            >
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        minWidth: 100,
                        textTransform: "none",
                        mr: 1,
                    }}
                >
                    Đóng
                </Button>
                <Button
                    onClick={handleCancel}
                    variant="contained"
                    color="error"
                    disabled={!selectedReason}
                    sx={{
                        minWidth: 120,
                        textTransform: "none",
                    }}
                >
                    Xác nhận hủy vé
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CancelBookingDialog;
