import React, { useEffect, useState } from "react";
import { Autocomplete, Box, Button, IconButton, InputAdornment, TextField } from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PlaceIcon from "@mui/icons-material/Place";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-toastify";

const cities = ["Sài Gòn", "Vũng Tàu", "Đà Lạt", "Nha Trang", "Phan Thiết"];

const Search = () => {
    const [departure, setDeparture] = useState<string | null>(null);
    const [destination, setDestination] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    const isHome = location.pathname === "/";

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const departureLocation = searchParams.get("departureLocation");
        const arrivalLocation = searchParams.get("arrivalLocation");
        const departureDate = searchParams.get("departureDate");

        if (departureLocation) setDeparture(departureLocation);
        if (arrivalLocation) setDestination(arrivalLocation);
        if (departureDate) setSelectedDate(new Date(departureDate));
    }, [location.search]);

    const handleSwap = () => {
        const temp = departure;
        setDeparture(destination);
        setDestination(temp);
    };

    const handleSearch = () => {
        if (!departure || !destination || !selectedDate) {
            toast.warn("Hãy nhập đầy đủ thông tin");
            return;
        }

        if (departure === destination) {
            toast.warn("Nơi xuất phát và nơi đến không được giống nhau");
            return;
        }

        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const params = new URLSearchParams({
            departureLocation: departure,
            arrivalLocation: destination,
            departureDate: formattedDate,
            sortBy: "departureTime",
            sortDirection: "asc",
            pageNumber: "1",
            pageSize: "5",
        }).toString();

        navigate(`/search?${params}`);
    };

    return (
        <div
            className={`${
                isHome
                    ? "absolute inset-0 flex justify-center items-center text-white text-3xl font-bold px-4"
                    : "w-full text-white text-3xl font-bold pt-6 px-4"
            }`}>
            <div
                className={`${
                    isHome
                        ? "bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-5xl border border-gray-300"
                        : "bg-white p-4 md:p-6 rounded-lg shadow-lg border border-gray-300"
                }`}>
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                    {/* Nơi xuất phát */}
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: { xs: 2, md: 0 },
                            alignItems: "center",
                        }}>
                        <Autocomplete
                            freeSolo
                            options={cities}
                            value={departure}
                            onChange={(event: React.SyntheticEvent, newValue: string | null) => {
                                if (newValue === destination) {
                                    toast.error("Nơi xuất phát và nơi đến không được giống nhau");
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
                                        minWidth: { xs: "100%", md: "220px" },
                                        width: { xs: "300px", md: "auto" },
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <MyLocationIcon sx={{ color: "blue" }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />

                        {/* Swap Button - Vertical for mobile, Horizontal for desktop */}
                        <IconButton
                            color="primary"
                            onClick={handleSwap}
                            aria-label="swap"
                            size="large"
                            sx={{
                                display: "flex",
                                transform: { xs: "rotate(90deg)", md: "rotate(0deg)" },
                            }}>
                            <SwapHorizIcon />
                        </IconButton>

                        {/* Nơi đến */}
                        <Autocomplete
                            freeSolo
                            options={cities}
                            value={destination}
                            onChange={(event: React.SyntheticEvent, newValue: string | null) => {
                                if (newValue === departure) {
                                    toast.warn("Nơi xuất phát và nơi đến không được giống nhau");
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
                                        minWidth: { xs: "100%", md: "220px" },
                                        width: { xs: "300px", md: "auto" },
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PlaceIcon sx={{ color: "red" }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Box>

                    {/* Thời gian */}
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                        <DatePicker
                            label="Ngày đi"
                            value={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            minDate={new Date()}
                            disablePast
                            format="eeee, dd/MM/yyyy"
                            formatDensity="spacious"
                            slotProps={{
                                textField: {
                                    variant: "outlined",
                                    fullWidth: true,
                                    sx: { minWidth: { xs: "100%", md: "220px" } },
                                },
                                day: {
                                    sx: {
                                        width: 36,
                                        height: 36,
                                    },
                                },
                            }}
                        />
                    </LocalizationProvider>

                    {/* Search Button */}
                    <div className="flex justify-center w-full md:w-auto">
                        <Button
                            variant="contained"
                            size="medium"
                            onClick={handleSearch}
                            sx={{
                                width: { xs: "100%", md: "120px" },
                                py: 2,
                                backgroundColor: "rgb(255, 211, 51)",
                                color: "black",
                                textTransform: "none",
                                fontSize: "16px",
                            }}>
                            Tìm kiếm
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;
