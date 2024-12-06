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
} from "@mui/material";
import { Bus } from "../../global";
import BusService from "../../service/BusService";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const BusManagement = () => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 6;

    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const response = await BusService.fetchBusData({ page, pageSize });
                setBuses(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching buses:", error);
                setLoading(false);
            }
        };

        fetchBuses();
    }, [page]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={3}>
                {buses.map((bus) => (
                    <Grid item xs={12} key={bus.busId}>
                        <Paper
                            elevation={3}
                            sx={{
                                borderRadius: 2,
                                overflow: "hidden",
                                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: 8,
                                },
                            }}>
                            <Card sx={{ display: "flex", height: "100%", position: "relative" }}>
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
                                        p: 3,
                                        background: "linear-gradient(to right, #ffffff, #f5f5f5)",
                                    }}>
                                    <CardContent>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 3,
                                            }}>
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: "bold",
                                                    color: "#1565c0",
                                                    textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                                                }}>
                                                Biển số xe: {bus.licensePlate}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    borderRadius: 1,
                                                    p: 1,
                                                    display: "flex",
                                                    gap: 2,
                                                }}>
                                                <IconButton
                                                    color="primary"
                                                    aria-label="edit bus"
                                                    sx={{
                                                        transition: "all 0.3s ease",
                                                        border: "1px solid #1976d2",
                                                        borderRadius: "4px",
                                                        gap: 1,
                                                        pr: 2,
                                                    }}>
                                                    <EditIcon />
                                                    <Typography>Sửa</Typography>
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    aria-label="delete bus"
                                                    sx={{
                                                        transition: "all 0.3s ease",
                                                        border: "1px solid #d32f2f",
                                                        borderRadius: "4px",
                                                        display: "flex",
                                                        gap: 1,
                                                        pr: 2,
                                                    }}>
                                                    <DeleteIcon />
                                                    <Typography>Xóa</Typography>
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        <Grid container spacing={3}>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        mb: 2,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        color: "#424242",
                                                    }}>
                                                    <strong>Loại xe:</strong> {bus.busType}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        mb: 2,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        color: "#424242",
                                                    }}>
                                                    <strong>Số chỗ ngồi:</strong> {bus.totalSeats}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        mb: 2,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        color: "#424242",
                                                    }}>
                                                    <strong>Số tầng:</strong> {bus.floors}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        mb: 2,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        color: "#424242",
                                                    }}>
                                                    <strong>Hạn đăng kiểm:</strong>{" "}
                                                    {bus.registrationExpiry}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        mb: 2,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        color: "#d32f2f",
                                                    }}>
                                                    <strong>Ngày hết hạn:</strong>{" "}
                                                    {bus.expirationDate}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Box>
                            </Card>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    size="large"
                    sx={{ "& .MuiPaginationItem-root": { fontSize: "1.1rem" } }}
                />
            </Box>
        </Container>
    );
};

export default BusManagement;
