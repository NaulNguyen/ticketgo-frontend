import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    CircularProgress,
    CardActions,
    Button,
    Pagination,
} from "@mui/material";
import { axiosWithJWT } from "../../config/axiosConfig";

interface Bus {
    busId: number;
    busImage: string;
    busType: string;
    licensePlate: string;
    totalSeats: number;
    floors: number;
    registrationExpiry: string;
    expirationDate: string;
}

interface PaginatedResponse {
    data: Bus[];
    totalPages: number;
    currentPage: number;
    totalElements: number;
}

const BusManagement = () => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 6;

    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const response = await axiosWithJWT.get<PaginatedResponse>(
                    "http://localhost:8080/api/v1/buses",
                    {
                        params: {
                            pageNumber: page,
                            pageSize: pageSize,
                        },
                    }
                );
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

    const handleEditBus = (bus: Bus) => {
        // TODO: Implement edit functionality
        console.log("Edit bus:", bus);
    };

    const handleDeleteBus = (busId: number) => {
        // TODO: Implement delete functionality
        console.log("Delete bus:", busId);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 2,
                }}>
                {buses.map((bus) => (
                    <Card key={bus.busId} sx={{ height: "100%", display: "flex" }}>
                        <CardMedia
                            component="img"
                            sx={{ width: "40%", objectFit: "cover" }}
                            image={bus.busImage}
                            alt={bus.busType}
                        />
                        <Box sx={{ display: "flex", flexDirection: "column", width: "60%" }}>
                            <CardContent sx={{ flex: "1 0 auto" }}>
                                <Typography variant="h6" gutterBottom>
                                    Biển số xe: {bus.licensePlate}
                                </Typography>
                                <Typography variant="body1">Loại xe: {bus.busType}</Typography>
                                <Typography variant="body1">
                                    Số chỗ ngồi: {bus.totalSeats}
                                </Typography>
                                <Typography variant="body1">Số tầng: {bus.floors}</Typography>
                                <Typography variant="body1">
                                    Hạn đăng kiểm: {bus.registrationExpiry}
                                </Typography>
                                <Typography variant="body1">
                                    Ngày hết hạn: {bus.expirationDate}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditBus(bus)}>
                                    Chỉnh sửa
                                </Button>
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteBus(bus.busId)}>
                                    Xóa
                                </Button>
                            </CardActions>
                        </Box>
                    </Card>
                ))}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>
        </Box>
    );
};

export default BusManagement;
