import React, { useEffect, useState } from "react";
import { Autocomplete, Button, IconButton, InputAdornment, TextField } from "@mui/material";
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
        if (departure && destination && selectedDate) {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd'); 
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
        } else {
            toast.warn("Please fill in all fields.");
        }
    };

    return (
        <div
            className={`${
                isHome
                    ? "absolute inset-0 flex justify-center items-center text-white text-3xl font-bold"
                    : "w-full text-white text-3xl font-bold pt-6"
            }`}
        >
            <div
                className={`${
                    isHome
                        ? "bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl border border-gray-300"
                        : "bg-white p-6 rounded-lg shadow-lg border border-gray-300"
                }`}
            >
                <div className="flex items-center space-x-4">
                    {/* Nơi xuất phát */}
                    <Autocomplete
                        freeSolo
                        options={cities}
                        value={departure}
                        onChange={(event: React.SyntheticEvent, newValue: string | null) => {
                            setDeparture(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Nơi xuất phát"
                                variant="outlined"
                                fullWidth
                                sx={{ minWidth: "220px" }}
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

                    {/* Swap Button */}
                    <IconButton color="primary" onClick={handleSwap} aria-label="swap" size="large">
                        <SwapHorizIcon />
                    </IconButton>

                    {/* Nơi đến */}
                    <Autocomplete
                        freeSolo
                        options={cities}
                        value={destination}
                        onChange={(event: React.SyntheticEvent, newValue: string | null) => {
                            setDestination(newValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Nơi đến"
                                variant="outlined"
                                fullWidth
                                sx={{ minWidth: "220px" }}
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

                    {/* Thời gian */}
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                        <DatePicker
                            label="Ngày đi"
                            value={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            minDate={new Date()}
                            disablePast
                            format="EEE, dd/MM/yyyy" // Custom format
                            slotProps={{
                                textField: {
                                    variant: "outlined",
                                    fullWidth: true,
                                    sx: { minWidth: "220px" },
                                },
                            }}
                        />
                    </LocalizationProvider>

                    {/* Search Button */}
                    <div className="flex justify-center ml-4 flex-row">
                        <Button
                            variant="contained"
                            size="medium"
                            onClick={handleSearch}
                            sx={{
                                minWidth: "120px",
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
                </div>
            </div>
        </div>
    );
};

export default Search;
