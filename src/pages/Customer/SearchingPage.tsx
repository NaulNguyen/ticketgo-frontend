import React, { useState, useEffect } from "react";
import { Header, Search } from "../../components";
import {
    Box,
    Button,
    Container,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Typography,
    Pagination,
    Skeleton,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import SeatSelect from "../../components/Customer/SeatSelect";
import { LocationRoute } from "../../components/IconSVG";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import Details from "../../components/Customer/Details";
import { toast } from "react-toastify";

interface SearchResult {
    data: {
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
    }[];
    pagination: {
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
    };
}

const SearchingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [seatSelectId, setSeatSelectId] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<SearchResult>({
        data: [],
        pagination: {
            pageNumber: 0,
            pageSize: 0,
            totalPages: 0,
            totalItems: 0,
        },
    });
    const [sortBy, setSortBy] = useState("departureDate");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchLoading, setSearchLoading] = useState(false);

    const handleToggleDetails = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const handleSelectTrip = (id: string) => {
        setSeatSelectId((prev) => (prev === id ? null : id));
    };

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setCurrentPage(value);
    };

    const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        let newSortBy = "departureDate";
        let newSortDirection = "asc";

        if (value === "default") {
            newSortBy = "departureDate";
            newSortDirection = "asc";
        } else if (value === "earliest") {
            newSortBy = "departureDate";
            newSortDirection = "asc";
        } else if (value === "latest") {
            newSortBy = "departureDate";
            newSortDirection = "desc";
        } else if (value === "priceAsc") {
            newSortBy = "price";
            newSortDirection = "asc";
        } else if (value === "priceDesc") {
            newSortBy = "price";
            newSortDirection = "desc";
        }

        setSortBy(newSortBy);
        setSortDirection(newSortDirection);

        const searchParams = new URLSearchParams(location.search);
        searchParams.set("sortBy", newSortBy);
        searchParams.set("sortDirection", newSortDirection);

        navigate(`${location.pathname}?${searchParams.toString()}`);
    };

    useEffect(() => {
        const fetchSearchResults = async () => {
            setSearchLoading(true);
            const searchParams = new URLSearchParams(location.search);
            const params = {
                departureLocation: searchParams.get("departureLocation") || "",
                arrivalLocation: searchParams.get("arrivalLocation") || "",
                departureDate: searchParams.get("departureDate") || "",
                returnDate: searchParams.get("returnDate") || "",
                sortBy: searchParams.get("sortBy") || sortBy,
                sortDirection:
                    searchParams.get("sortDirection") || sortDirection,
                pageNumber: currentPage,
                pageSize: 5,
            };
            try {
                const response = await axios.post(
                    "http://178.128.16.200:8080/api/v1/routes/search",
                    params
                );
                setSearchResults(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching search results:", error);
                toast.error("Có lỗi xảy ra khi tìm kiếm chuyến xe");
            } finally {
                setSearchLoading(false);
            }
        };
        fetchSearchResults();
    }, [location, currentPage, sortBy, sortDirection]);

    return (
        <div
            style={{ backgroundColor: "rgb(243,243,243)", minHeight: "100vh" }}
        >
            <Header />
            <Container>
                <Search />
                <div className="pt-6 flex justify-center ">
                    <Box
                        sx={{
                            backgroundColor: "white",
                            width: "35%",
                            padding: 2,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            borderRadius: 1,
                            borderWidth: 1,
                            borderColor: "rgb(209 213 219)",
                            height: "fit-content",
                            mr: 2,
                        }}
                    >
                        <FormControl>
                            <FormLabel
                                id="sort-options-label"
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    color: "black",
                                    "&.Mui-focused": { color: "black" },
                                }}
                            >
                                Sắp xếp
                            </FormLabel>
                            <RadioGroup
                                aria-labelledby="sort-options-label"
                                defaultValue="default"
                                name="radio-buttons-group"
                                onChange={handleSortChange}
                            >
                                <FormControlLabel
                                    value="default"
                                    control={<Radio />}
                                    label="Mặc định"
                                />
                                <FormControlLabel
                                    value="earliest"
                                    control={<Radio />}
                                    label="Giờ đi sớm nhất"
                                />
                                <FormControlLabel
                                    value="latest"
                                    control={<Radio />}
                                    label="Giờ đi muộn nhất"
                                />
                                <FormControlLabel
                                    value="priceAsc"
                                    control={<Radio />}
                                    label="Giá tăng dần"
                                />
                                <FormControlLabel
                                    value="priceDesc"
                                    control={<Radio />}
                                    label="Giá giảm dần"
                                />
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    {/* Search Results */}
                    <Box display="flex" flexDirection="column" width="100%">
                        {searchLoading ? (
                            // Hiển thị Skeleton khi dữ liệu đang tải
                            Array.from({ length: 4 }).map((_, index) => (
                                <Box
                                    key={index}
                                    mb={3}
                                    sx={{
                                        backgroundColor: "white",
                                        p: 3,
                                        borderRadius: 2,
                                        boxShadow: 2,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        width: "100%",
                                        minHeight: "270px",
                                    }}
                                >
                                    <Box display="flex" gap={2} height="full">
                                        {/* Skeleton for image */}
                                        <Skeleton
                                            variant="rectangular"
                                            width={200}
                                            height={220}
                                            animation="wave" // Add animation here
                                            sx={{ borderRadius: "8px" }}
                                        />
                                        <Box
                                            display="flex"
                                            flexDirection="column"
                                            className="w-full"
                                            gap={1}
                                            justifyContent="space-around"
                                        >
                                            {/* Skeleton for text information */}
                                            <Skeleton
                                                variant="text"
                                                width="60%"
                                                height={30}
                                                animation="wave"
                                            />
                                            <Skeleton
                                                variant="text"
                                                width="40%"
                                                animation="wave"
                                            />
                                            <Skeleton
                                                variant="text"
                                                width="30%"
                                                sx={{ mb: 2 }}
                                                animation="wave"
                                            />
                                            <Box
                                                display="flex"
                                                justifyContent="space-between"
                                            >
                                                <Skeleton
                                                    variant="text"
                                                    width="50%"
                                                    animation="wave"
                                                />
                                                <Skeleton
                                                    variant="text"
                                                    width="30%"
                                                    animation="wave"
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            ))
                        ) : searchResults.data.length > 0 ? (
                            searchResults.data.map((result) => (
                                <Box
                                    key={result.scheduleId}
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
                                                                    fontSize:
                                                                        "14px",
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
                                                    {new Intl.NumberFormat(
                                                        "vi-VN",
                                                        {
                                                            style: "currency",
                                                            currency: "VND",
                                                        }
                                                    ).format(result.price)}
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
                                                                •{" "}
                                                                {
                                                                    result.departureLocation
                                                                }
                                                            </span>
                                                        </Typography>
                                                        <Typography className="text-sm py-1">
                                                            {
                                                                result.travelDuration
                                                            }
                                                        </Typography>
                                                        <Typography className="text-xl font-bold text-gray-500">
                                                            {dayjs(
                                                                result.arrivalTime
                                                            ).format("HH:mm")}
                                                            <span className="mx-1 font-normal text-base">
                                                                •{" "}
                                                                {
                                                                    result.arrivalLocation
                                                                }
                                                            </span>
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box textAlign="right">
                                                    <Typography className="text-gray-700 text-base my-1">
                                                        Còn{" "}
                                                        {result.availableSeats}{" "}
                                                        chỗ trống
                                                    </Typography>
                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                    >
                                                        <Box
                                                            display="flex"
                                                            alignItems="center"
                                                            onClick={() =>
                                                                handleToggleDetails(
                                                                    result.scheduleId
                                                                )
                                                            }
                                                            sx={{
                                                                cursor: "pointer",
                                                                mr: 2,
                                                            }}
                                                        >
                                                            <Typography
                                                                color="primary"
                                                                sx={{
                                                                    textDecoration:
                                                                        "underline",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                }}
                                                            >
                                                                Thông tin chi
                                                                tiết
                                                            </Typography>
                                                            {expandedId ===
                                                            result.scheduleId ? (
                                                                <ArrowDropUpIcon color="primary" />
                                                            ) : (
                                                                <ArrowDropDownIcon color="primary" />
                                                            )}
                                                        </Box>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            onClick={() =>
                                                                handleSelectTrip(
                                                                    result.scheduleId
                                                                )
                                                            }
                                                            sx={{
                                                                textTransform:
                                                                    "none",
                                                                backgroundColor:
                                                                    seatSelectId ===
                                                                    result.scheduleId
                                                                        ? "rgb(192, 192, 192)"
                                                                        : "rgb(255, 199, 0)",
                                                                color: "black",
                                                                p: "8px 16px",
                                                                fontWeight:
                                                                    "bold",
                                                            }}
                                                        >
                                                            {seatSelectId ===
                                                            result.scheduleId
                                                                ? "Đóng"
                                                                : "Chọn chuyến"}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                    {expandedId === result.scheduleId && (
                                        <Details
                                            scheduleId={result.scheduleId}
                                        />
                                    )}
                                    {seatSelectId === result.scheduleId && (
                                        <SeatSelect
                                            scheduleId={result.scheduleId}
                                            price={result.price}
                                        />
                                    )}
                                </Box>
                            ))
                        ) : (
                            <Typography>
                                Rất tiếc, hiện không có chuyến xe nào phù hợp
                                với tiêu chí của bạn.
                            </Typography>
                        )}
                    </Box>
                </div>

                {/* Pagination */}
                {searchResults.pagination.totalPages > 1 && (
                    <Pagination
                        count={searchResults.pagination.totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                    />
                )}
            </Container>
        </div>
    );
};

export default SearchingPage;
