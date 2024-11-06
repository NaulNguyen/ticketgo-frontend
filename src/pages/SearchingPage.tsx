import React, { useState, useEffect } from "react";
import { Header, Search } from "../components";
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
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import SeatSelect from "../components/SeatSelect";
import { LocationRoute } from "../components/IconSVG";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import Details from "../components/Details";
import { useLocation } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

interface SearchResult {
    data: {
        scheduleId: string;
        routeName: string;
        departureLocation: string;
        arrivalLocation: string;
        departureTime: string;
        arrivalTime: string;
        travelDuration: string;
        price: number;
        busImage: string;
        busType: string;
        availableSeats: number;
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

    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
    const [isSeatSelectOpen, setIsSeatSelectOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult>({
        data: [],
        pagination: {
            pageNumber: 0,
            pageSize: 0,
            totalPages: 0,
            totalItems: 0,
        },
    });
    
    const [currentPage, setCurrentPage] = useState(1); 

    console.log("Search results:", searchResults);

    const handleToggleDetails = () => {
        setIsDetailsExpanded((prev) => !prev);
    };

    const handleSelectTrip = () => {
        setIsSeatSelectOpen((prev) => !prev);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    useEffect(() => {
        const fetchSearchResults = async () => {
            const searchParams = new URLSearchParams(location.search);
            const params = {
                departureLocation: searchParams.get("departureLocation") || "",
                arrivalLocation: searchParams.get("arrivalLocation") || "",
                departureDate: searchParams.get("departureDate") || "",
                sortBy: searchParams.get("sortBy") || "departureTime",
                sortDirection: searchParams.get("sortDirection") || "asc",
                pageNumber: currentPage,  
                pageSize: 5,
            };
            console.log("Search params:", params);
            try {
                const response = await axios.post("http://localhost:8080/api/v1/routes/search", params);
                setSearchResults(response.data);
            } catch (error) {
                console.error("Error fetching search results:", error);
            }
        };

        fetchSearchResults();
    }, [location, currentPage]);

    return (
        <div style={{ backgroundColor: "rgb(243,243,243)", minHeight: "100vh" }}>
            <Header />
            <Container >
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
                            >
                                <FormControlLabel value="default" control={<Radio />} label="Mặc định" />
                                <FormControlLabel value="earliest" control={<Radio />} label="Giờ đi sớm nhất" />
                                <FormControlLabel value="latest" control={<Radio />} label="Giờ đi muộn nhất" />
                                <FormControlLabel value="priceAsc" control={<Radio />} label="Giá tăng dần" />
                                <FormControlLabel value="priceDesc" control={<Radio />} label="Giá giảm dần" />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                    
                    {/* Search Results */}
                    <Box display="flex" flexDirection="column" width="100%">
                        {searchResults.data?.length > 0 ? (
                            searchResults.data.map((result: any) => (
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
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <div>
                                                    <Typography variant="h6" className="flex space-x-2 items-center justify-center">
                                                        <span className="text-blue-700 font-bold">{result.routeName}</span>
                                                        <span
                                                            className="text-white text-sm flex items-center justify-center px-1 rounded-sm"
                                                            style={{ backgroundColor: "rgb(36, 116, 229)", height: "fit-content" }}
                                                        >
                                                            <StarIcon sx={{ fontSize: "14px", mb: "2px", color: "white" }} />
                                                            4.7 (90)
                                                        </span>
                                                    </Typography>
                                                    <Typography className="text-gray-500 text-sm">{result.busType}</Typography>
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
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Box display="flex" className="space-x-2 items-center">
                                                    <LocationRoute />
                                                    <Box className="text-gray-600">
                                                        <Typography className="text-xl font-bold">
                                                            {dayjs(result.departureTime).format("HH:mm")}
                                                            <span className="mx-1 font-normal text-base">
                                                                • {result.departureLocation}
                                                            </span>
                                                        </Typography>
                                                        <Typography className="text-sm py-1">{result.travelDuration}</Typography>
                                                        <Typography className="text-xl font-bold text-gray-500">
                                                            {dayjs(result.arrivalTime).format("HH:mm")}
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
                                                            onClick={handleToggleDetails}
                                                            sx={{ cursor: "pointer", mr: 2 }}
                                                        >
                                                            <Typography
                                                                color="primary"
                                                                sx={{
                                                                    textDecoration: "underline",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                }}
                                                            >
                                                                Thông tin chi tiết
                                                            </Typography>
                                                            {isDetailsExpanded ? (
                                                                <ArrowDropUpIcon color="primary" />
                                                            ) : (
                                                                <ArrowDropDownIcon color="primary" />
                                                            )}
                                                        </Box>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            onClick={handleSelectTrip}
                                                            sx={{
                                                                textTransform: "none",
                                                                backgroundColor: isSeatSelectOpen ? "rgb(192, 192, 192)" : "rgb(255, 199, 0)",
                                                                color: "black",
                                                                p: "8px 16px",
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            {isSeatSelectOpen ? "Đóng" : "Chọn chuyến"}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                    {isDetailsExpanded && <Details />}
                                    {isSeatSelectOpen && <SeatSelect />}
                                </Box>
                            ))
                        ) : (
                            <Typography>No search results found.</Typography>
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
