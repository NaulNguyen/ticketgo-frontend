import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    Pagination,
    CircularProgress,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { LocationRoute } from "../../components/IconSVG";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import dayjs from "dayjs";
import Details from "../../components/Customer/Details";
import RouteIcon from "@mui/icons-material/Route";
import AddIcon from "@mui/icons-material/Add";
import CreateBusRoute from "../../popup/CreateBusRoute";
import axios from "axios";
import { toast } from "react-toastify";
import Search from "../Customer/Search";
import { StatusUpdate } from "../../utils/StatusUpdate";

interface BusRoute {
    scheduleId: string;
    routeName: string;
    busImage: string;
    busType: string;
    busId: string;
    departureTime: string;
    departureLocation: string;
    departureAddress: string;
    arrivalAddress: string;
    arrivalTime: string;
    arrivalLocation: string;
    price: number;
    availableSeats: number;
    travelDuration: string;
    scheduleStatus: string;
}

interface SearchResult {
    data: BusRoute[];
    pagination: {
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
    };
}

const BusRouteManagement = () => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
    const [currentSearchParams, setCurrentSearchParams] = useState({
        pageNumber: 1,
        pageSize: 5,
    });
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult>({
        data: [],
        pagination: {
            pageNumber: 1,
            pageSize: 5,
            totalPages: 0,
            totalItems: 0,
        },
    });
    const [currentPage, setCurrentPage] = useState(1);

    const handleToggleDetails = (id: string) => {
        setExpandedId((prevId) => (prevId === id ? null : id));
    };

    const handleSearch = async (searchParams: any) => {
        setSearchLoading(true);
        const newParams = {
            ...searchParams,
            pageNumber: 1, // Reset to first page on new search
            pageSize: 5,
        };
        try {
            const response = await axios.post<SearchResult>(
                "https://ticketgo.site/api/v1/routes/search",
                {
                    ...newParams,
                }
            );
            setSearchResults(response.data);
            setCurrentSearchParams(newParams); // Store current search params
            setCurrentPage(1);
        } catch (error) {
            console.error("Error fetching search results:", error);
            toast.error("Có lỗi xảy ra khi tìm kiếm tuyến xe");
        } finally {
            setSearchLoading(false);
        }
    };

    const fetchRoutes = async (params = currentSearchParams) => {
        setSearchLoading(true);
        try {
            const response = await axios.post<SearchResult>(
                "https://ticketgo.site/api/v1/routes/search",
                {
                    ...params,
                    pageNumber: currentPage,
                }
            );
            setSearchResults(response.data);
        } catch (error) {
            console.error("Error fetching routes:", error);
            toast.error("Có lỗi xảy ra khi tải danh sách tuyến xe");
        } finally {
            setSearchLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            setSearchLoading(true);
            try {
                const response = await axios.post<SearchResult>(
                    "https://ticketgo.site/api/v1/routes/search",
                    {
                        ...currentSearchParams,
                        pageNumber: currentPage,
                    }
                );
                setSearchResults(response.data);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast.error("Có lỗi xảy ra khi tải danh sách tuyến xe");
            } finally {
                setSearchLoading(false);
            }
        };

        fetchInitialData();
    }, [currentPage, currentSearchParams]);

    const handleOpenCreatePopup = () => setIsCreatePopupOpen(true);
    const handleCloseCreatePopup = () => {
        setIsCreatePopupOpen(false);
        fetchRoutes(); // Refresh the list when popup closes
    };

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
                    onSuccess={fetchRoutes} // Pass the fetch function here
                />
            </Box>
            <Box sx={{ mb: 3 }}>
                <Search isDashboard onSearch={handleSearch} />
            </Box>
            {searchLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                searchResults.data.map((result) => (
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
                                        </Typography>
                                        <Typography className="text-gray-500 text-sm">
                                            {result.busType}
                                        </Typography>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <StatusUpdate
                                            currentStatus={
                                                result.scheduleStatus
                                            }
                                            scheduleId={result.scheduleId}
                                            onStatusUpdate={() =>
                                                fetchRoutes(currentSearchParams)
                                            }
                                        />
                                        <Typography
                                            className="font-bold text-xl"
                                            style={{
                                                color: "rgb(36, 116, 229)",
                                                fontWeight: 700,
                                                fontSize: "20px",
                                            }}
                                        >
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(result.price)}
                                        </Typography>
                                    </div>
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
                                                {dayjs(
                                                    result.departureTime
                                                ).format("HH:mm DD/MM/YYYY")}
                                                <span className="mx-1 font-normal text-base">
                                                    • {result.departureLocation}
                                                </span>
                                            </Typography>
                                            <Typography className="text-sm py-1">
                                                {result.travelDuration}
                                            </Typography>
                                            <Typography className="text-xl font-bold text-gray-500">
                                                {dayjs(
                                                    result.arrivalTime
                                                ).format("HH:mm DD/MM/YYYY")}
                                                <span className="mx-1 font-normal text-base">
                                                    • {result.arrivalLocation}
                                                </span>
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box textAlign="right">
                                        <Typography className="text-gray-700 text-base my-1">
                                            Còn {result.availableSeats} chỗ
                                            trống
                                        </Typography>
                                        <Box display="flex" alignItems="center">
                                            <Box
                                                display="flex"
                                                onClick={() =>
                                                    handleToggleDetails(
                                                        result.scheduleId
                                                    )
                                                }
                                                sx={{
                                                    cursor: "pointer",
                                                    mt: 2,
                                                }}
                                            >
                                                <Typography
                                                    color="primary"
                                                    sx={{
                                                        textDecoration:
                                                            "underline",
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
                ))
            )}
            {!searchLoading && searchResults.pagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination
                        count={searchResults.pagination.totalPages}
                        page={currentPage}
                        onChange={(_, page) => setCurrentPage(page)}
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
};

export default BusRouteManagement;
