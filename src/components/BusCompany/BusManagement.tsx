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
} from "@mui/material";
import { Bus } from "../../global";
import BusService from "../../service/BusService";

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
                setTotalPages(response.data.totalPages);
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
                        <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
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
                                        p: 2,
                                    }}>
                                    <CardContent>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                mb: 2,
                                                fontWeight: "bold",
                                                color: "#1976d2",
                                            }}>
                                            Biển số xe: {bus.licensePlate}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ mb: 1.5, fontWeight: 500 }}>
                                                    <strong>Loại xe:</strong> {bus.busType}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ mb: 1.5, fontWeight: 500 }}>
                                                    <strong>Số chỗ ngồi:</strong> {bus.totalSeats}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ mb: 1.5, fontWeight: 500 }}>
                                                    <strong>Số tầng:</strong> {bus.floors}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ mb: 1.5, fontWeight: 500 }}>
                                                    <strong>Hạn đăng kiểm:</strong>{" "}
                                                    {bus.registrationExpiry}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        mb: 1.5,
                                                        fontWeight: 500,
                                                        color: "error.main",
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
                    size="large"
                    sx={{ "& .MuiPaginationItem-root": { fontSize: "1.1rem" } }}
                />
            </Box>
        </Container>
    );
};

export default BusManagement;
