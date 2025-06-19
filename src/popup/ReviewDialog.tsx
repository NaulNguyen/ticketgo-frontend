import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Rating as MuiRating,
    Typography,
    Box,
    TextareaAutosize,
    Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { StarBorder, Star } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

// Add these new interfaces
interface ReviewDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<boolean>;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialog-paper": {
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    },
}));

const StyledRating = styled(MuiRating)(({ theme }) => ({
    "& .MuiRating-icon": {
        fontSize: "2rem",
    },
    "& .MuiRating-iconFilled": {
        color: "#FFB400",
    },
    "& .MuiRating-iconHover": {
        color: "#F29D00",
    },
}));

const StyledTextArea = styled(TextareaAutosize)(({ theme }) => ({
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #E0E0E0",
    fontSize: "16px",
    fontFamily: "inherit",
    resize: "vertical",
    transition: "border-color 0.2s, box-shadow 0.2s",
    "&:focus": {
        outline: "none",
        borderColor: "#1976d2",
        boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1)",
    },
    "&::placeholder": {
        color: "#757575",
    },
}));

const ReviewDialog = ({ open, onClose, onSubmit }: ReviewDialogProps) => {
    const [rating, setRating] = useState<number | null>(5);
    const [comment, setComment] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        // Validate rating and comment
        if (!rating) {
            enqueueSnackbar("Vui lòng chọn số sao đánh giá", {
                variant: "error",
            });
            return;
        }

        if (!comment.trim()) {
            enqueueSnackbar("Vui lòng nhập nội dung đánh giá", {
                variant: "error",
            });
            return;
        }

        try {
            const success = await onSubmit(rating, comment.trim());

            if (success) {
                enqueueSnackbar("Đánh giá thành công!", { variant: "success" });
                setRating(5);
                setComment("");
                onClose();
                navigate("/reviews");
            }
        } catch (error) {
            enqueueSnackbar("Có lỗi xảy ra khi gửi đánh giá", {
                variant: "error",
            });
        }
    };

    useEffect(() => {
        if (!open) {
            setRating(5);
            setComment("");
        }
    }, [open]);

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle
                sx={{
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    pt: 3,
                    pb: 2,
                    textAlign: "center",
                    borderBottom: "1px solid #E0E0E0",
                }}
            >
                Đánh giá chuyến đi
            </DialogTitle>
            <DialogContent sx={{ px: 4 }}>
                <Box
                    sx={{
                        py: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 3,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                color: "#1976d2",
                            }}
                        >
                            Chất lượng dịch vụ
                        </Typography>
                        <StyledRating
                            value={rating}
                            onChange={(_, newValue) => setRating(newValue)}
                            size="large"
                            icon={<Star fontSize="inherit" />}
                            emptyIcon={<StarBorder fontSize="inherit" />}
                        />
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                mt: 1,
                            }}
                        >
                            {rating === 5
                                ? "Tuyệt vời"
                                : rating === 4
                                ? "Hài lòng"
                                : rating === 3
                                ? "Bình thường"
                                : rating === 2
                                ? "Không hài lòng"
                                : rating === 1
                                ? "Rất tệ"
                                : ""}
                        </Typography>
                    </Box>

                    <Box sx={{ width: "100%" }}>
                        <Typography
                            sx={{
                                mb: 1,
                                fontWeight: 500,
                                color: "#424242",
                            }}
                        >
                            Chia sẻ trải nghiệm của bạn
                        </Typography>
                        <StyledTextArea
                            minRows={4}
                            placeholder="Hãy chia sẻ những điều bạn thích hoặc những điều cần cải thiện..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    borderTop: "1px solid #E0E0E0",
                    gap: 1,
                }}
            >
                <Button
                    onClick={onClose}
                    sx={{
                        color: "text.secondary",
                        fontWeight: 600,
                    }}
                >
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!rating}
                    sx={{
                        px: 3,
                        py: 1,
                        bgcolor: "#1976d2",
                        "&:hover": {
                            bgcolor: "#1565c0",
                        },
                        fontWeight: 600,
                    }}
                >
                    Gửi đánh giá
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default ReviewDialog;
