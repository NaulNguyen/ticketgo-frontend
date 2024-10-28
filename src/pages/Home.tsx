import React, { useState } from "react";
import { Header } from "../components";
import { Button, TextField, IconButton, InputAdornment, Autocomplete } from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PlaceIcon from "@mui/icons-material/Place";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { ToastContainer } from "react-toastify";

const cities = [
    "Hà Nội",
    "Hồ Chí Minh",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Nha Trang",
    "Huế",
];

const Home = () => {
    const [departure, setDeparture] = useState<string | null>(null);
    const [destination, setDestination] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const handleSwap = () => {
        const temp = departure;
        setDeparture(destination);
        setDestination(temp);
    };

    return (
        <div>
            <ToastContainer position="top-right" autoClose={3000} />
            <Header />
            {/* Banner */}
            <div className="relative">
                <img
                    src="https://static.vexere.com/production/banners/1209/leader-board-vn.jpg"
                    alt="Banner"
                    className="w-full h-[480px] object-cover"
                />
                <div className="absolute inset-0 flex justify-center items-center text-white text-3xl font-bold">
                    {/* Search Section */}
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl border border-gray-300">
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
                            <IconButton
                                color="primary"
                                onClick={handleSwap}
                                aria-label="swap"
                                size="large">
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
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <DatePicker
                                  label="Chọn thời gian"
                                  value={selectedDate}
                                  onChange={(date) => setSelectedDate(date)}
                                  minDate={new Date()}
                                  disablePast
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
                                    color="primary"
                                    size="medium"
                                    sx={{ minWidth: "120px", py: 2 }}>
                                    Tìm kiếm
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
