import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    IconButton,
    Box,
    CircularProgress,
    Container,
    Button,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { axiosWithJWT } from "../../config/axiosConfig";
import { toast } from "react-toastify";
import CreateVoucherPopup from "../../popup/CreateVoucherPopup";
import EditVoucherPopup from "../../popup/EditVoucherPopup";
import DiscountIcon from "@mui/icons-material/Discount";

interface Voucher {
    promotionId: string;
    description: string;
    discountPercentage: number;
    discountCode: string;
    startDate: string;
    endDate: string;
    status: "ACTIVE" | "INACTIVE";
}

interface PromotionResponse {
    data: Voucher[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

type SortField = "startDate" | "endDate" | "discountPercentage";
type SortDirection = "asc" | "desc";

interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

const VoucherManagement = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: "startDate",
        direction: "asc",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(
        null
    );

    const handleOpenCreatePopup = () => setIsCreatePopupOpen(true);
    const handleCloseCreatePopup = () => setIsCreatePopupOpen(false);

    const handleOpenEditPopup = (id: string) => {
        setSelectedVoucherId(id);
        setIsEditPopupOpen(true);
    };

    const handleCloseEditPopup = () => {
        setSelectedVoucherId(null);
        setIsEditPopupOpen(false);
    };

    const fetchVouchers = async () => {
        setIsLoading(true);
        try {
            const response = await axiosWithJWT.get<PromotionResponse>(
                `https://ticketgo.site/api/v1/promotions?pageNumber=${page}&pageSize=${pageSize}`
            );
            setVouchers(response.data.data);
            setTotalPages(response.data.totalPages);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch vouchers:", error);
            toast.error("Không thể tải danh sách khuyến mãi");
            setIsLoading(false);
        }
    };

    const handleDeleteVoucher = async (id: string) => {
        try {
            const response = await axiosWithJWT.delete(
                `https://ticketgo.site/api/v1/promotions/${id}`
            );
            if (response.status === 200) {
                toast.success("Xóa voucher thành công");
                fetchVouchers();
            }
        } catch (error) {
            console.error("Failed to delete voucher:", error);
            toast.error("Không thể xóa voucher");
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, [page, pageSize]);

    const handleSort = (field: SortField) => {
        setSortConfig((prevConfig) => ({
            field,
            direction:
                prevConfig.field === field && prevConfig.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    };

    const getSortedVouchers = () => {
        if (!Array.isArray(vouchers) || vouchers.length === 0) {
            return [];
        }

        return [...vouchers].sort((a, b) => {
            const { field, direction } = sortConfig;
            const multiplier = direction === "asc" ? 1 : -1;

            switch (field) {
                case "startDate":
                case "endDate":
                    const dateA = new Date(a[field]).getTime();
                    const dateB = new Date(b[field]).getTime();
                    return multiplier * (dateA - dateB);
                case "discountPercentage":
                    return (
                        multiplier *
                        (a.discountPercentage - b.discountPercentage)
                    );
                default:
                    return 0;
            }
        });
    };

    const formatDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        } catch {
            return "Invalid date";
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                    mt: 2,
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: "#1565c0",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                    }}
                >
                    <DiscountIcon sx={{ fontSize: 35 }} />
                    Quản lý mã giảm giá
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
                    Thêm voucher
                </Button>
                <CreateVoucherPopup
                    open={isCreatePopupOpen}
                    onClose={handleCloseCreatePopup}
                    onSuccess={() => {
                        fetchVouchers();
                    }}
                />
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#1976d2" }}>
                            <TableCell
                                sx={{
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: 16,
                                }}
                            >
                                Mô tả
                            </TableCell>
                            <TableCell
                                onClick={() => handleSort("discountPercentage")}
                                sx={{
                                    color: "white",
                                    cursor: "pointer",
                                    minWidth: "150px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                }}
                            >
                                % Giảm giá{" "}
                                {sortConfig.field === "discountPercentage" &&
                                    (sortConfig.direction === "asc" ? (
                                        <ArrowUpwardIcon fontSize="small" />
                                    ) : (
                                        <ArrowDownwardIcon fontSize="small" />
                                    ))}
                            </TableCell>
                            <TableCell
                                onClick={() => handleSort("startDate")}
                                sx={{
                                    color: "white",
                                    cursor: "pointer",
                                    alignItems: "center",
                                    gap: 1,
                                    minWidth: "150px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                }}
                            >
                                <span>Ngày bắt đầu</span>{" "}
                                {sortConfig.field === "startDate" &&
                                    (sortConfig.direction === "asc" ? (
                                        <ArrowUpwardIcon fontSize="small" />
                                    ) : (
                                        <ArrowDownwardIcon fontSize="small" />
                                    ))}
                            </TableCell>
                            <TableCell
                                onClick={() => handleSort("endDate")}
                                sx={{
                                    color: "white",
                                    cursor: "pointer",
                                    gap: 1,
                                    minWidth: "150px",
                                    fontWeight: 700,
                                    fontSize: 16,
                                }}
                            >
                                <span>Ngày kết thúc</span>

                                {sortConfig.field === "endDate" &&
                                    (sortConfig.direction === "asc" ? (
                                        <ArrowUpwardIcon fontSize="small" />
                                    ) : (
                                        <ArrowDownwardIcon fontSize="small" />
                                    ))}
                            </TableCell>
                            <TableCell
                                sx={{
                                    color: "white",
                                    minWidth: "120px",
                                    textAlign: "center",
                                    fontWeight: 700,
                                    fontSize: 16,
                                }}
                            >
                                Trạng thái
                            </TableCell>
                            <TableCell
                                sx={{
                                    color: "white",
                                    minWidth: "120px",
                                    textAlign: "center",
                                    fontWeight: 700,
                                    fontSize: 16,
                                }}
                            >
                                Tùy chỉnh
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {getSortedVouchers().map((voucher, i) => (
                            <TableRow key={i}>
                                <TableCell>{voucher.description}</TableCell>
                                <TableCell>
                                    {voucher.discountPercentage}%
                                </TableCell>
                                <TableCell>
                                    {formatDate(voucher.startDate)}
                                </TableCell>
                                <TableCell>
                                    {formatDate(voucher.endDate)}
                                </TableCell>
                                <TableCell>
                                    <Box
                                        sx={{
                                            backgroundColor:
                                                voucher.status === "ACTIVE"
                                                    ? "#4caf50"
                                                    : "#f44336",
                                            color: "white",
                                            p: 1,
                                            borderRadius: 1,
                                            textAlign: "center",
                                        }}
                                    >
                                        {voucher.status.toUpperCase() ===
                                        "ACTIVE"
                                            ? "Có hiệu lực"
                                            : "Vô hiệu lực"}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton
                                            size="small"
                                            sx={{
                                                color: "#1976d2",
                                                display: "flex",
                                                alignItems: "center",
                                                "&:hover": {
                                                    backgroundColor: "#e3f2fd",
                                                },
                                                borderRadius: 2,
                                            }}
                                            onClick={() =>
                                                handleOpenEditPopup(
                                                    voucher.promotionId
                                                )
                                            }
                                        >
                                            <EditIcon fontSize="small" />
                                            <Typography
                                                variant="body2"
                                                sx={{ marginLeft: 1 }}
                                            >
                                                Chỉnh sửa
                                            </Typography>
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            sx={{
                                                color: "#d32f2f",
                                                display: "flex",
                                                alignItems: "center",
                                                "&:hover": {
                                                    backgroundColor: "#ffebee",
                                                },
                                                borderRadius: 2,
                                            }}
                                            onClick={() =>
                                                handleDeleteVoucher(
                                                    voucher.promotionId
                                                )
                                            }
                                        >
                                            <DeleteIcon fontSize="small" />
                                            <Typography
                                                variant="body2"
                                                sx={{ marginLeft: 1 }}
                                            >
                                                Xóa
                                            </Typography>
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {getSortedVouchers().length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body1" sx={{ py: 2 }}>
                                        Không có dữ liệu
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <EditVoucherPopup
                open={isEditPopupOpen}
                onClose={handleCloseEditPopup}
                onSuccess={fetchVouchers}
                voucherId={selectedVoucherId}
            />
        </Container>
    );
};

export default VoucherManagement;
