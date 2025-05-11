import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    Pagination,
    CircularProgress,
    TextField,
    InputAdornment,
    IconButton,
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
import { useDebounce } from "use-debounce";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

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
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
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

    useEffect(() => {
        const fetchSearchResults = async () => {
            setSearchLoading(true);
            try {
                const response = await axios.post<SearchResult>(
                    "http://178.128.16.200:8080/api/v1/routes/search",
                    {
                        keyword: debouncedSearchTerm,
                        pageNumber: currentPage,
                        pageSize: 5,
                    }
                );
                setSearchResults(response.data);
            } catch (error) {
                console.error("Error fetching search results:", error);
                toast.error("Có lỗi xảy ra khi tải danh sách tuyến xe");
            } finally {
                setSearchLoading(false);
            }
        };
        fetchSearchResults();
    }, [currentPage, debouncedSearchTerm]);

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
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Tìm kiếm tuyến xe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "text.secondary" }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setSearchTerm("")}
                                    size="small"
                                >
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        backgroundColor: "white",
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "#e0e0e0",
                            },
                            "&:hover fieldset": {
                                borderColor: "#1976d2",
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#1976d2",
                            },
                        },
                    }}
                />
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
                                                {dayjs(
                                                    result.departureTime
                                                ).format("HH:mm")}
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
                                                ).format("HH:mm")}
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
