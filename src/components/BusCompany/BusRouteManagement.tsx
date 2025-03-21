import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { LocationRoute } from "../../components/IconSVG";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import dayjs from "dayjs";
import Details from "../../components/Customer/Details";
import RouteIcon from "@mui/icons-material/Route";
import AddIcon from "@mui/icons-material/Add";
import CreateBusRoute from "../../popup/CreateBusRoute";

interface BusRoute {
    scheduleId: string;
    routeName: string;
    busType: string;
    price: number;
    departureTime: string;
    departureLocation: string;
    arrivalTime: string;
    arrivalLocation: string;
    travelDuration: string;
    availableSeats: number;
    rating: number;
    reviews: number;
    busImage: string;
}

const mockBusRoutes: BusRoute[] = [
    {
        scheduleId: "abc",
        routeName: "Sài Gòn - Đà Lạt",
        busType: "Giường nằm 40 chỗ",
        price: 350000,
        departureTime: "2024-03-20T06:00:00",
        departureLocation: "Bến xe Miền Đông",
        arrivalTime: "2024-03-20T14:00:00",
        arrivalLocation: "Bến xe Đà Lạt",
        travelDuration: "8 giờ",
        availableSeats: 25,
        rating: 4.7,
        reviews: 90,
        busImage:
            "https://res.cloudinary.com/dltlcxhsl/image/upload/v1742479020/dpfav1mxo5jer3btizdr.jpg",
    },
    {
        scheduleId: "bcd",
        routeName: "Sài Gòn - Nha Trang",
        busType: "Limousine 20 chỗ",
        price: 400000,
        departureTime: "2024-03-20T08:30:00",
        departureLocation: "Bến xe Miền Đông",
        arrivalTime: "2024-03-20T16:30:00",
        arrivalLocation: "Bến xe Nha Trang",
        travelDuration: "8 giờ",
        availableSeats: 12,
        rating: 4.8,
        reviews: 75,
        busImage:
            "https://res.cloudinary.com/dltlcxhsl/image/upload/v1742479020/dpfav1mxo5jer3btizdr.jpg",
    },
    {
        scheduleId: "def",
        routeName: "Sài Gòn - Đà Nẵng",
        busType: "Giường nằm cao cấp",
        price: 550000,
        departureTime: "2024-03-20T19:00:00",
        departureLocation: "Bến xe Miền Đông",
        arrivalTime: "2024-03-21T15:00:00",
        arrivalLocation: "Bến xe Đà Nẵng",
        travelDuration: "20 giờ",
        availableSeats: 30,
        rating: 4.9,
        reviews: 120,
        busImage:
            "https://res.cloudinary.com/dltlcxhsl/image/upload/v1742479020/dpfav1mxo5jer3btizdr.jpg",
    },
];

const BusRouteManagement = () => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [seatSelectId, setSeatSelectId] = useState<string | null>(null);
    const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);

    const handleToggleDetails = (scheduleId: string) => {
        setExpandedId(expandedId === scheduleId ? null : scheduleId);
    };

    const handleSelectTrip = (scheduleId: string) => {
        setSeatSelectId(seatSelectId === scheduleId ? null : scheduleId);
    };

    const handleOpenCreatePopup = () => setIsCreatePopupOpen(true);
    const handleCloseCreatePopup = () => setIsCreatePopupOpen(false);

    return (
        <Box sx={{ p: 3 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
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
                    <RouteIcon sx={{ fontSize: 35 }} />
                    Quản lý tuyến xe
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
                    Thêm tuyến xe
                </Button>
                <CreateBusRoute
                    open={isCreatePopupOpen}
                    onClose={handleCloseCreatePopup}
                    onSuccess={() => {
                        // Refresh bus routes list
                        handleCloseCreatePopup();
                    }}
                />
            </Box>
            {mockBusRoutes.map((result) => (
                <Box
                    mb={3}
                    sx={{
                        backgroundColor: "white",
                        p: 3,
                        borderRadius: 2,
                        borderColor: "gray.300",
                        boxShadow: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: "100%",
                        minHeight: "270px",
                        transition: "box-shadow 0.3s",
                        "&:hover": { boxShadow: 10 },
                    }}
                    key={result.scheduleId}
                >
                    <Box display="flex" gap={2} height="full">
                        <img
                            src={result.busImage}
                            alt="Car images"
                            className="w-[200px] h-[220px] object-cover rounded-lg"
                        />
                        <Box
                            display="flex"
                            flexDirection="column"
                            className="w-full"
                            gap={1}
                            justifyContent="space-around"
                        >
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <div>
                                    <Typography
                                        variant="h6"
                                        className="flex space-x-2 items-center justify-center"
                                    >
                                        <span className="text-blue-700 font-bold">
                                            {result.routeName}
                                        </span>
                                        <span
                                            className="text-white text-sm flex items-center justify-center px-1 rounded-sm"
                                            style={{
                                                backgroundColor:
                                                    "rgb(36, 116, 229)",
                                                height: "fit-content",
                                            }}
                                        >
                                            <StarIcon
                                                sx={{
                                                    fontSize: "14px",
                                                    mb: "2px",
                                                    color: "white",
                                                }}
                                            />
                                            4.7 (90)
                                        </span>
                                    </Typography>
                                    <Typography className="text-gray-500 text-sm">
                                        {result.busType}
                                    </Typography>
                                </div>
                                <Typography
                                    className="font-bold text-xl"
                                    style={{
                                        color: "rgb(36, 116, 229)",
                                        fontWeight: 700,
                                        fontSize: "20px",
                                        marginBottom: "30px",
                                    }}
                                >
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(result.price)}
                                </Typography>
                            </Box>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Box
                                    display="flex"
                                    className="space-x-2 items-center"
                                >
                                    <LocationRoute />
                                    <Box className="text-gray-600">
                                        <Typography className="text-xl font-bold">
                                            {dayjs(result.departureTime).format(
                                                "HH:mm"
                                            )}
                                            <span className="mx-1 font-normal text-base">
                                                • {result.departureLocation}
                                            </span>
                                        </Typography>
                                        <Typography className="text-sm py-1">
                                            {result.travelDuration}
                                        </Typography>
                                        <Typography className="text-xl font-bold text-gray-500">
                                            {dayjs(result.arrivalTime).format(
                                                "HH:mm"
                                            )}
                                            <span className="mx-1 font-normal text-base">
                                                • {result.arrivalLocation}
                                            </span>
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box textAlign="right">
                                    <Typography className="text-gray-700 text-base my-1">
                                        Còn {result.availableSeats} chỗ trống
                                    </Typography>
                                    <Box display="flex" alignItems="center">
                                        <Box
                                            display="flex"
                                            onClick={() =>
                                                handleToggleDetails(
                                                    result.scheduleId
                                                )
                                            }
                                            sx={{ cursor: "pointer", mt: 2 }}
                                        >
                                            <Typography
                                                color="primary"
                                                sx={{
                                                    textDecoration: "underline",
                                                    display: "flex",
                                                }}
                                            >
                                                Thông tin chi tiết
                                            </Typography>
                                            {expandedId ===
                                            result.scheduleId ? (
                                                <ArrowDropUpIcon color="primary" />
                                            ) : (
                                                <ArrowDropDownIcon color="primary" />
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    {expandedId === result.scheduleId && (
                        <Details scheduleId={result.scheduleId} />
                    )}
                </Box>
            ))}
        </Box>
    );
};

export default BusRouteManagement;
