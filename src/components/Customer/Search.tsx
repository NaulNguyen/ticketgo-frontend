import React, { useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    IconButton,
    InputAdornment,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PlaceIcon from "@mui/icons-material/Place";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-toastify";

const cities = ["Sài Gòn", "Vũng Tàu", "Đà Lạt", "Nha Trang", "Phan Thiết"];

interface SearchParams {
    pageNumber: number;
    pageSize: number;
    departureLocation?: string;
    arrivalLocation?: string;
    departureDate?: string;
}
const Search = ({ isDashboard = false, onSearch }: any) => {
    const [departure, setDeparture] = useState<string | null>(null);
    const [destination, setDestination] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [returnDate, setReturnDate] = useState<Date | null>(null);
    const [tripType, setTripType] = useState<"one-way" | "round-trip">(
        "one-way"
    );

    const location = useLocation();
    const navigate = useNavigate();

    const isHome = location.pathname === "/";
    const isDashBoard = location.pathname === "/dashboard";

    const handleTripTypeChange = (
        event: React.MouseEvent<HTMLElement>,
        newTripType: "one-way" | "round-trip" | null
    ) => {
        if (newTripType !== null) {
            setTripType(newTripType);
            if (newTripType === "one-way") {
                setReturnDate(null);
            }
        }
    };

    const handleDashboardSearch = () => {
        const params: SearchParams = {
            pageNumber: 1,
            pageSize: 5,
        };

        // Only add parameters if they have values
        if (departure) {
            params.departureLocation = departure;
        }
        if (destination) {
            params.arrivalLocation = destination;
        }
        if (selectedDate) {
            params.departureDate = format(selectedDate, "yyyy-MM-dd");
        }

        // Call the parent's onSearch function with params
        onSearch(params);
    };

    // Update the search button click handler
    const handleSearchClick = () => {
        if (isDashboard) {
            handleDashboardSearch();
        } else {
            handleSearch(); // Original search function
        }
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const departureLocation = searchParams.get("departureLocation");
        const arrivalLocation = searchParams.get("arrivalLocation");
        const departureDate = searchParams.get("departureDate");
        const returnDate = searchParams.get("returnDate");

        if (departureLocation) setDeparture(departureLocation);
        if (arrivalLocation) setDestination(arrivalLocation);
        if (departureDate) setSelectedDate(new Date(departureDate));
        if (returnDate) {
            setReturnDate(new Date(returnDate));
            setTripType("round-trip");
        }
    }, [location.search]);

    const isReturnDateValid = (date: Date | null) => {
        if (!date || !selectedDate) return true;
        return date > selectedDate;
    };

    const handleSwap = () => {
        const temp = departure;
        setDeparture(destination);
        setDestination(temp);
    };

    const handleSearch = () => {
        if (!isDashboard) {
            if (!departure || !destination || !selectedDate) {
                toast.warn("Hãy nhập đầy đủ thông tin");
                return;
            }

            if (departure === destination) {
                toast.warn("Nơi xuất phát và nơi đến không được giống nhau");
                return;
            }

            if (tripType === "round-trip" && !returnDate) {
                toast.warn("Vui lòng chọn ngày về cho hành trình khứ hồi");
                return;
            }

            if (returnDate && selectedDate && returnDate < selectedDate) {
                toast.warn("Ngày về phải sau ngày đi");
                return;
            }
        }

        if (isDashboard) {
            handleDashboardSearch();
            return;
        }

        const params = new URLSearchParams();
        if (departure) params.append("departureLocation", departure);
        if (destination) params.append("arrivalLocation", destination);
        if (selectedDate)
            params.append("departureDate", format(selectedDate, "yyyy-MM-dd"));
        params.append("sortBy", "departureTime");
        params.append("sortDirection", "asc");
        params.append("pageNumber", "1");
        params.append("pageSize", "5");

        if (tripType === "round-trip" && returnDate) {
            params.append("returnDate", format(returnDate, "yyyy-MM-dd"));
        }

        navigate(`/search?${params.toString()}`);
    };

    return (
        <div
            className={`${
                isHome
                    ? "absolute inset-0 flex justify-center items-center text-white text-3xl font-bold px-4"
                    : "w-full text-white text-3xl font-bold pt-6 px-4"
            }`}
        >
            <div
                className={`${
                    isHome
                        ? "bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-5xl border border-gray-300 "
                        : "bg-white p-4 md:p-6 rounded-lg shadow-lg border border-gray-300"
                }`}
            >
                {!isDashBoard && (
                    <Box
                        sx={{
                            mb: 4,
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <ToggleButtonGroup
                            value={tripType}
                            exclusive
                            onChange={handleTripTypeChange}
                            aria-label="trip type"
                            sx={{
                                backgroundColor: "#f8fafc",
                                padding: "4px",
                                borderRadius: "28px !important",
                                border: "1px solid #e2e8f0",
                                "& .MuiToggleButton-root": {
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: "24px !important",
                                    border: "none",
                                    color: "#64748b",
                                    "&.Mui-selected": {
                                        backgroundColor: "#1976d2",
                                        color: "white",
                                        boxShadow:
                                            "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        "&:hover": {
                                            backgroundColor: "#1565c0",
                                        },
                                    },
                                    "&:not(.Mui-selected)": {
                                        "&:hover": {
                                            backgroundColor: "#f1f5f9",
                                        },
                                    },
                                },
                            }}
                        >
                            <ToggleButton value="one-way" aria-label="one way">
                                <ArrowRightAltIcon sx={{ mr: 1 }} />
                                Một chiều
                            </ToggleButton>
                            <ToggleButton
                                value="round-trip"
                                aria-label="round trip"
                            >
                                <CompareArrowsIcon sx={{ mr: 1 }} />
                                Khứ hồi
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                )}
                {/* Nơi xuất phát */}
                {/* Search Form */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        gap: 2,
                    }}
                >
                    {/* Location Selectors */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flex: 3, // Increased from 2 to 3 to make it wider
                            minWidth: "500px",
                        }}
                    >
                        <Autocomplete
                            freeSolo
                            options={cities}
                            value={departure}
                            onChange={(event, newValue) => {
                                if (!isDashboard && newValue === destination) {
                                    toast.warn(
                                        "Nơi xuất phát và nơi đến không được giống nhau"
                                    );
                                    return;
                                }
                                setDeparture(newValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Nơi xuất phát"
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        minWidth: "215px",
                                        "& .MuiOutlinedInput-root": {
                                            backgroundColor: "#f8fafc",
                                            "&:hover fieldset": {
                                                borderColor: "#1976d2",
                                            },
                                        },
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <MyLocationIcon
                                                    sx={{ color: "#1976d2" }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />

                        <IconButton
                            onClick={handleSwap}
                            sx={{
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                "&:hover": {
                                    backgroundColor: "#f1f5f9",
                                },
                                p: 2,
                            }}
                        >
                            <SwapHorizIcon color="primary" />
                        </IconButton>

                        <Autocomplete
                            freeSolo
                            options={cities}
                            value={destination}
                            onChange={(event, newValue) => {
                                if (!isDashboard && newValue === departure) {
                                    toast.warn(
                                        "Nơi xuất phát và nơi đến không được giống nhau"
                                    );
                                    return;
                                }
                                setDestination(newValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Nơi đến"
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        minWidth: "215px",
                                        "& .MuiOutlinedInput-root": {
                                            backgroundColor: "#f8fafc",
                                            "&:hover fieldset": {
                                                borderColor: "#1976d2",
                                            },
                                        },
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PlaceIcon
                                                    sx={{ color: "#ef4444" }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Box>

                    {/* Date Pickers */}
                    <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        adapterLocale={vi}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                flex: 2,
                                mt: "2px",
                            }}
                        >
                            <DatePicker
                                label="Ngày đi"
                                value={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                minDate={new Date()}
                                disablePast
                                format="EEE, dd/MM/yyyy"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        sx: {
                                            "& .MuiOutlinedInput-root": {
                                                backgroundColor: "#f8fafc",
                                                "&:hover fieldset": {
                                                    borderColor: "#1976d2",
                                                },
                                            },
                                        },
                                    },
                                }}
                            />
                            {tripType === "round-trip" && (
                                <DatePicker
                                    label="Ngày về"
                                    value={returnDate}
                                    onChange={(date) => {
                                        if (date && !isReturnDateValid(date)) {
                                            toast.warn(
                                                "Ngày về phải sau ngày đi"
                                            );
                                            return;
                                        }
                                        setReturnDate(date);
                                    }}
                                    minDate={selectedDate || undefined}
                                    disablePast
                                    format="EEE, dd/MM/yyyy"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            sx: {
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f8fafc",
                                                    "&:hover fieldset": {
                                                        borderColor: "#1976d2",
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            )}
                        </Box>
                    </LocalizationProvider>

                    {/* Search Button */}
                    <div className="flex justify-center w-full md:w-auto">
                        <Button
                            variant="contained"
                            size="medium"
                            onClick={handleSearchClick}
                            sx={{
                                width: { xs: "100%", md: "120px" },
                                py: 2,
                                backgroundColor: "rgb(255, 211, 51)",
                                color: "black",
                                textTransform: "none",
                                fontSize: "16px",
                            }}
                        >
                            Tìm kiếm
                        </Button>
                    </div>
                </Box>
            </div>
        </div>
    );
};

export default Search;
