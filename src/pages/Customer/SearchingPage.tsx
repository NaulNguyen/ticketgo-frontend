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
    alpha,
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
import BoxChat from "../../components/BoxChat";
import useAppAccessor from "../../hook/useAppAccessor";
import BotChat from "../../components/BotChat";

interface Seat {
    ticketCode: string;
    seatNumber: string;
    isAvailable: boolean;
}

interface FloorData {
    floor_1: Seat[][] | undefined;
    floor_2: Seat[][] | undefined;
}

interface SearchResult {
    departure?: {
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
    return?: {
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

    const { getUserInfor } = useAppAccessor();
    const userInfor = getUserInfor();

    const shouldShowChat = userInfor && userInfor.user.role !== "ROLE_BUS_COMPANY";

    const [isReturn, setIsReturn] = useState(false);
    const [firstTripData, setFirstTripData] = useState(null);

    const [autoSelectedScheduleId, setAutoSelectedScheduleId] = useState<string | null>(null);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [seatSelectId, setSeatSelectId] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<SearchResult>({
        departure: [],
        return: [],
        pagination: {
            pageNumber: 0,
            pageSize: 0,
            totalPages: 0,
            totalItems: 0,
        },
    });
    const [sortBy, setSortBy] = useState("departureTime");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchLoading, setSearchLoading] = useState(false);

    const handleToggleDetails = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const handleSelectTrip = (id: string) => {
        setSeatSelectId((prev) => (prev === id ? null : id));
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        let newSortBy = "departureTime";
        let newSortDirection = "asc";

        if (value === "default") {
            newSortBy = "departureTime";
            newSortDirection = "asc";
        } else if (value === "earliest") {
            newSortBy = "departureTime";
            newSortDirection = "asc";
        } else if (value === "latest") {
            newSortBy = "departureTime";
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

    const countAvailableSeats = (seatsData: FloorData): number => {
        let count = 0;

        // Count floor 1
        if (seatsData.floor_1) {
            count += seatsData.floor_1.flat().filter((seat) => seat.isAvailable).length;
        }

        // Count floor 2
        if (seatsData.floor_2) {
            count += seatsData.floor_2.flat().filter((seat) => seat.isAvailable).length;
        }

        return count;
    };

    const handleFirstTripComplete = (tripData: any) => {
        setFirstTripData(tripData);
        setIsReturn(true);
    };

    const currentTripList = isReturn ? searchResults.return : searchResults.departure;

    useEffect(() => {
        const fetchSearchResults = async () => {
            setSearchLoading(true);
            const searchParams = new URLSearchParams(location.search);

            const departureLocation = searchParams.get("departureLocation");
            const arrivalLocation = searchParams.get("arrivalLocation");
            const departureDate = searchParams.get("departureDate");
            const returnDate = searchParams.get("returnDate");

            const isRoundTrip = !!returnDate;

            const pageSize = autoSelectedScheduleId ? 20 : 5;

            try {
                // 1. Fetch outbound trip
                const firstLegResponse = await axios.post(
                    "https://ticketgo.site/api/v1/routes/search",
                    {
                        departureLocation,
                        arrivalLocation,
                        departureDate,
                        sortBy,
                        sortDirection,
                        pageNumber: currentPage,
                        pageSize,
                    }
                );

                const firstLegRoutes = await Promise.all(
                    firstLegResponse.data.data.map(async (route: any) => {
                        const seatsResponse = await axios.get(
                            `https://ticketgo.site/api/v1/seats?scheduleId=${route.scheduleId}`
                        );
                        const availableSeats = countAvailableSeats(seatsResponse.data.data);
                        return { ...route, availableSeats };
                    })
                );

                const results: SearchResult = {
                    departure: firstLegRoutes,
                    return: [],
                    pagination: {
                        pageNumber: firstLegResponse.data.pagination.pageNumber,
                        pageSize: firstLegResponse.data.pagination.pageSize,
                        totalPages: firstLegResponse.data.pagination.totalPages,
                        totalItems: firstLegResponse.data.pagination.totalItems,
                    },
                };

                // 2. Fetch return trip if round trip
                if (isRoundTrip && returnDate) {
                    const returnLegResponse = await axios.post(
                        "https://ticketgo.site/api/v1/routes/search",
                        {
                            departureLocation: arrivalLocation,
                            arrivalLocation: departureLocation,
                            departureDate: returnDate,
                            sortBy,
                            sortDirection,
                            pageNumber: 1,
                            pageSize: 5,
                        }
                    );

                    const returnLegRoutes = await Promise.all(
                        returnLegResponse.data.data.map(async (route: any) => {
                            const seatsResponse = await axios.get(
                                `https://ticketgo.site/api/v1/seats?scheduleId=${route.scheduleId}`
                            );
                            const availableSeats = countAvailableSeats(seatsResponse.data.data);
                            return { ...route, availableSeats };
                        })
                    );

                    results.return = returnLegRoutes;
                }

                setSearchResults(results);
            } catch (error) {
                console.error("Error fetching search results:", error);
                toast.error("Có lỗi xảy ra khi tìm kiếm chuyến xe");
                // Set empty results with default pagination on error
                setSearchResults({
                    departure: [],
                    return: [],
                    pagination: {
                        pageNumber: 1,
                        pageSize: 5,
                        totalPages: 1,
                        totalItems: 0,
                    },
                });
            } finally {
                setSearchLoading(false);
            }
        };

        fetchSearchResults();
    }, [location.search, currentPage, sortBy, sortDirection]);

    const formatDateTime = (dateTimeStr: string) => {
        const [date, time] = dateTimeStr.split(" ");
        const [day, month, year] = date.split("/");
        return dayjs(`${year}-${month}-${day} ${time}`);
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const selectedScheduleId = searchParams.get("selectedScheduleId");

        if (selectedScheduleId && currentTripList?.length) {
            const matchingTrip = currentTripList.find(
                (trip) => trip.scheduleId === selectedScheduleId
            );

            if (matchingTrip) {
                setExpandedId(selectedScheduleId);
                setSeatSelectId(selectedScheduleId);
                setAutoSelectedScheduleId(selectedScheduleId);

                const element = document.getElementById(`trip-${selectedScheduleId}`);
                if (element) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }
        }
    }, [currentTripList, location.search]);

    const getFilteredTripList = () => {
        if (!currentTripList) {
            return [];
        }

        const searchParams = new URLSearchParams(location.search);
        const selectedScheduleId = searchParams.get("selectedScheduleId");

        if (selectedScheduleId) {
            const filteredList = currentTripList.filter(
                (trip) => String(trip.scheduleId) === String(selectedScheduleId)
            );
            return filteredList;
        }

        return currentTripList;
    };

    useEffect(() => {
        if (!searchResults.departure?.length && !searchResults.return?.length) return;

        const updateSeats = async () => {
            try {
                const updatedDepartureRoutes = searchResults.departure
                    ? await Promise.all(
                          searchResults.departure.map(async (route) => {
                              const seatsResponse = await axios.get(
                                  `https://ticketgo.site/api/v1/seats?scheduleId=${route.scheduleId}`
                              );
                              if (seatsResponse.data.status === 200) {
                                  const availableSeats = countAvailableSeats(
                                      seatsResponse.data.data
                                  );
                                  if (availableSeats !== route.availableSeats) {
                                      return { ...route, availableSeats };
                                  }
                              }
                              return route;
                          })
                      )
                    : [];

                const updatedReturnRoutes = searchResults.return
                    ? await Promise.all(
                          searchResults.return.map(async (route) => {
                              const seatsResponse = await axios.get(
                                  `https://ticketgo.site/api/v1/seats?scheduleId=${route.scheduleId}`
                              );
                              if (seatsResponse.data.status === 200) {
                                  const availableSeats = countAvailableSeats(
                                      seatsResponse.data.data
                                  );
                                  if (availableSeats !== route.availableSeats) {
                                      return { ...route, availableSeats };
                                  }
                              }
                              return route;
                          })
                      )
                    : [];

                // Only update state if there are changes
                const hasChanges =
                    updatedDepartureRoutes.some(
                        (route, index) =>
                            route.availableSeats !== searchResults.departure?.[index].availableSeats
                    ) ||
                    updatedReturnRoutes.some(
                        (route, index) =>
                            route.availableSeats !== searchResults.return?.[index].availableSeats
                    );

                if (hasChanges) {
                    setSearchResults((prev) => ({
                        departure: updatedDepartureRoutes,
                        return: updatedReturnRoutes,
                        pagination: prev.pagination,
                    }));
                }
            } catch (error) {
                console.error("Error updating seats:", error);
            }
        };

        const pollInterval = setInterval(updateSeats, 3000);

        // Cleanup on unmount or when routes change
        return () => clearInterval(pollInterval);
    }, [searchResults.departure, searchResults.return]);

    useEffect(() => {
        if (isReturn) {
            setCurrentPage(1);
        }
    }, [isReturn]);

    return (
        <div style={{ backgroundColor: "rgb(243,243,243)", minHeight: "100vh" }}>
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
                        }}>
                        <FormControl>
                            <FormLabel
                                id="sort-options-label"
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    color: "black",
                                    "&.Mui-focused": { color: "black" },
                                }}>
                                Sắp xếp
                            </FormLabel>
                            <RadioGroup
                                aria-labelledby="sort-options-label"
                                defaultValue="default"
                                name="radio-buttons-group"
                                onChange={handleSortChange}>
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
                                    }}>
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
                                            justifyContent="space-around">
                                            {/* Skeleton for text information */}
                                            <Skeleton
                                                variant="text"
                                                width="60%"
                                                height={30}
                                                animation="wave"
                                            />
                                            <Skeleton variant="text" width="40%" animation="wave" />
                                            <Skeleton
                                                variant="text"
                                                width="30%"
                                                sx={{ mb: 2 }}
                                                animation="wave"
                                            />
                                            <Box display="flex" justifyContent="space-between">
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
                        ) : getFilteredTripList().length > 0 ? (
                            getFilteredTripList().map((result) => (
                                <Box
                                    id={`trip-${result.scheduleId}`}
                                    key={result.scheduleId}
                                    mb={3}
                                    sx={{
                                        backgroundColor:
                                            autoSelectedScheduleId === result.scheduleId
                                                ? alpha("#1976d2", 0.05)
                                                : "white",
                                        p: 3,
                                        borderRadius: 2,
                                        borderColor:
                                            autoSelectedScheduleId === result.scheduleId
                                                ? "primary.main"
                                                : "gray.300",
                                        borderWidth:
                                            autoSelectedScheduleId === result.scheduleId ? 2 : 1,
                                        boxShadow:
                                            autoSelectedScheduleId === result.scheduleId ? 4 : 2,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        width: "100%",
                                        minHeight: "270px",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            boxShadow: 10,
                                            transform: "translateY(-2px)",
                                        },
                                    }}>
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
                                            justifyContent="space-around">
                                            <Box
                                                display="flex"
                                                justifyContent="space-between"
                                                alignItems="center">
                                                <div>
                                                    <Typography
                                                        variant="h6"
                                                        className="flex space-x-2 items-center justify-center">
                                                        <span className="text-blue-700 font-bold">
                                                            {result.routeName}
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
                                                    }}>
                                                    {new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }).format(result.price)}
                                                </Typography>
                                            </Box>
                                            <Box
                                                display="flex"
                                                justifyContent="space-between"
                                                alignItems="center">
                                                <Box
                                                    display="flex"
                                                    className="space-x-2 items-center">
                                                    <LocationRoute />
                                                    <Box className="text-gray-600">
                                                        <Typography className="text-xl font-bold">
                                                            {formatDateTime(
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
                                                            {formatDateTime(
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
                                                        Còn {result.availableSeats} chỗ trống
                                                    </Typography>
                                                    <Box display="flex" alignItems="center">
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
                                                            }}>
                                                            <Typography
                                                                color="primary"
                                                                sx={{
                                                                    textDecoration: "underline",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                }}>
                                                                Thông tin chi tiết
                                                            </Typography>
                                                            {expandedId === result.scheduleId ? (
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
                                                                handleSelectTrip(result.scheduleId)
                                                            }
                                                            sx={{
                                                                textTransform: "none",
                                                                backgroundColor:
                                                                    seatSelectId ===
                                                                    result.scheduleId
                                                                        ? "rgb(192, 192, 192)"
                                                                        : "rgb(255, 199, 0)",
                                                                color: "black",
                                                                p: "8px 16px",
                                                                fontWeight: "bold",
                                                            }}>
                                                            {seatSelectId === result.scheduleId
                                                                ? "Đóng"
                                                                : "Chọn chuyến"}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                    {expandedId === result.scheduleId && (
                                        <Details scheduleId={result.scheduleId} />
                                    )}
                                    {seatSelectId === result.scheduleId && (
                                        <SeatSelect
                                            scheduleId={result.scheduleId}
                                            price={result.price}
                                            onFirstTripComplete={handleFirstTripComplete}
                                            isReturn={isReturn}
                                            firstTripData={firstTripData}
                                        />
                                    )}
                                </Box>
                            ))
                        ) : (
                            <Typography>
                                Rất tiếc, hiện không có chuyến xe nào phù hợp với tiêu chí của bạn.
                            </Typography>
                        )}
                    </Box>
                </div>

                {/* Pagination */}
                {!searchLoading &&
                    getFilteredTripList().length > 0 &&
                    searchResults.pagination.totalPages > 1 && (
                        <Box display="flex" justifyContent="center" mt={4} mb={4}>
                            <Pagination
                                count={searchResults.pagination.totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    )}

                {shouldShowChat && (
                    <>
                        <BoxChat />
                        <BotChat />
                    </>
                )}
            </Container>
        </div>
    );
};

export default SearchingPage;
