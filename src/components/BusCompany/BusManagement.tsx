import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    CircularProgress,
    Pagination,
    Container,
    Grid,
    Paper,
    IconButton,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import { Bus } from "../../global";
import BusService from "../../service/BusService";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import EventIcon from "@mui/icons-material/Event";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import CreateBusPopup from "../../popup/CreateBusPopup";
import EditBusPopup from "../../popup/EditBusPopup";
import { toast } from "react-toastify";
import WarningIcon from "@mui/icons-material/Warning";
import CloseIcon from "@mui/icons-material/Close";

const BusManagement = () => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 6;
    const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [busToDelete, setBusToDelete] = useState<Bus | null>(null);

    const handleOpenCreatePopup = () => setIsCreatePopupOpen(true);
    const handleCloseCreatePopup = () => setIsCreatePopupOpen(false);

    const handleOpenEditPopup = (busId: string) => {
        setSelectedBusId(busId);
        setIsEditPopupOpen(true);
    };

    const handleCloseEditPopup = () => {
        setSelectedBusId(null);
        setIsEditPopupOpen(false);
    };

    const handleOpenDeleteDialog = (bus: Bus) => {
        setBusToDelete(bus);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setBusToDelete(null);
        setIsDeleteDialogOpen(false);
    };

    const fetchBuses = async () => {
        try {
            const response = await BusService.fetchBusData({
                page,
                pageSize,
            });
            setBuses(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching buses:", error);
            setLoading(false);
        }
    };

    const handleDeleteBus = async () => {
        if (!busToDelete) return;

        try {
            const response = await BusService.deleteBus(busToDelete.busId);
            if (response.status === 200) {
                toast.success("Xóa xe thành công");
                fetchBuses();
                handleCloseDeleteDialog();
            }
        } catch (error) {
            console.error("Error deleting bus:", error);
            toast.error("Không thể xóa xe");
        }
    };

    useEffect(() => {
        fetchBuses();
    }, [page]);

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setPage(value);
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="300px"
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box
                sx={{
                    mb: 4,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
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
                    <DirectionsBusIcon sx={{ fontSize: 35 }} />
                    Quản lý xe
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreatePopup}
                    sx={{
                        backgroundColor: "#1976d2",
                        "&:hover": {
                            backgroundColor: "#1565c0",
                        },
                        px: 3,
                        py: 1,
                    }}
                >
                    Thêm xe mới
                </Button>
                <CreateBusPopup
                    open={isCreatePopupOpen}
                    onClose={handleCloseCreatePopup}
                    onSuccess={() => {
                        fetchBuses();
                    }}
                />
            </Box>

            {/* Bus Cards Grid */}
            <Grid container spacing={3}>
                {buses.map((bus) => (
                    <Grid item xs={12} key={bus.busId}>
                        <Paper
                            elevation={3}
                            sx={{
                                borderRadius: 2,
                                overflow: "hidden",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                                },
                            }}
                        >
                            <Card sx={{ display: "flex", height: "100%" }}>
                                <CardMedia
                                    component="img"
                                    sx={{
                                        width: "40%",
                                        objectFit: "cover",
                                        borderRadius: "4px 0 0 4px",
                                    }}
                                    image={bus.busImage}
                                    alt={bus.busType}
                                />
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        width: "60%",
                                        background:
                                            "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                                    }}
                                >
                                    <CardContent
                                        sx={{ flex: "1 0 auto", p: 3 }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 3,
                                            }}
                                        >
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: "bold",
                                                    color: "#1565c0",
                                                    textShadow:
                                                        "1px 1px 2px rgba(0,0,0,0.1)",
                                                }}
                                            >
                                                {bus.licensePlate}
                                            </Typography>
                                            <Box
                                                sx={{ display: "flex", gap: 1 }}
                                            >
                                                <Tooltip title="Chỉnh sửa thông tin xe">
                                                    <IconButton
                                                        sx={{
                                                            color: "#1976d2",
                                                            border: "1px solid #1976d2",
                                                            borderRadius: "8px",
                                                            p: 1,
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "#1976d2",
                                                                color: "white",
                                                            },
                                                        }}
                                                        onClick={() =>
                                                            handleOpenEditPopup(
                                                                bus.busId
                                                            )
                                                        }
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Xóa xe">
                                                    <IconButton
                                                        sx={{
                                                            color: "#d32f2f",
                                                            border: "1px solid #d32f2f",
                                                            borderRadius: "8px",
                                                            p: 1,
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "#d32f2f",
                                                                color: "white",
                                                            },
                                                        }}
                                                        onClick={() =>
                                                            handleOpenDeleteDialog(
                                                                bus
                                                            )
                                                        }
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        <Grid container spacing={3}>
                                            <Grid item xs={6}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 2,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <DirectionsBusIcon color="primary" />
                                                        <Typography variant="body1">
                                                            <strong>
                                                                Loại xe:
                                                            </strong>{" "}
                                                            {bus.busType}
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <AirlineSeatReclineNormalIcon color="primary" />
                                                        <Typography variant="body1">
                                                            <strong>
                                                                Số chỗ ngồi:
                                                            </strong>{" "}
                                                            {bus.totalSeats}
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <ViewQuiltIcon color="primary" />
                                                        <Typography variant="body1">
                                                            <strong>
                                                                Số tầng:
                                                            </strong>{" "}
                                                            {bus.floors}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 2,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <EventIcon color="primary" />
                                                        <Typography variant="body1">
                                                            <strong>
                                                                Hạn đăng kiểm:
                                                            </strong>{" "}
                                                            {
                                                                bus.registrationExpiry
                                                            }
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <EventIcon color="error" />
                                                        <Typography
                                                            variant="body1"
                                                            color="error"
                                                        >
                                                            <strong>
                                                                Ngày hết hạn:
                                                            </strong>{" "}
                                                            {bus.expirationDate}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Box>
                            </Card>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 4,
                    py: 2,
                    backgroundColor: "white",
                    borderRadius: 2,
                    boxShadow: 1,
                }}
            >
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    size="large"
                    sx={{
                        "& .MuiPaginationItem-root": {
                            fontSize: "1.1rem",
                            "&:hover": {
                                backgroundColor: "rgba(25, 118, 210, 0.1)",
                            },
                        },
                        "& .Mui-selected": {
                            backgroundColor: "#1976d2 !important",
                            color: "white",
                        },
                    }}
                />
            </Box>
            <EditBusPopup
                open={isEditPopupOpen}
                onClose={handleCloseEditPopup}
                onSuccess={fetchBuses}
                busId={selectedBusId}
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
                        bgcolor: "#d32f2f",
                        color: "white",
                        gap: 1,
                        py: 2,
                        textAlign: "center",
                    }}
                >
                    Xác nhận xóa xe
                </DialogTitle>
                <DialogContent sx={{ mt: 2, pb: 3 }}>
                    <DialogContentText
                        sx={{
                            color: "text.primary",
                            mb: 2,
                        }}
                    >
                        Bạn có chắc chắn muốn xóa xe:
                    </DialogContentText>
                    <Box
                        sx={{
                            bgcolor: "#f5f5f5",
                            p: 2,
                            borderRadius: 1,
                            mb: 2,
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: "bold",
                                color: "#1565c0",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <DirectionsBusIcon />
                            {busToDelete?.licensePlate}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Loại xe: {busToDelete?.busType}
                        </Typography>
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
                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        gap: 1,
                    }}
                >
                    <Button
                        onClick={handleCloseDeleteDialog}
                        variant="outlined"
                        startIcon={<CloseIcon />}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDeleteBus}
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
        </Container>
    );
};

export default BusManagement;
