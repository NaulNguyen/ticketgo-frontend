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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Collapse,
    Stack,
    Chip,
    Paper,
    Typography,
    Divider,
    alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PlaceIcon from "@mui/icons-material/Place";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import TuneIcon from "@mui/icons-material/Tune";
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
    toDate?: string;
    scheduleStatus?: string;
}

const Search = ({ isDashboard = false, onSearch }: any) => {
    const [departure, setDeparture] = useState<string | null>(null);
    const [destination, setDestination] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [returnDate, setReturnDate] = useState<Date | null>(null);
    const [tripType, setTripType] = useState<"one-way" | "round-trip">(
        "one-way"
    );
    const [scheduleStatus, setScheduleStatus] = useState<string>("");
    const [showAdvancedFilters, setShowAdvancedFilters] =
        useState<boolean>(false);

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

    const toggleAdvancedFilters = () => {
        setShowAdvancedFilters(!showAdvancedFilters);
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
        if (toDate) {
            params.toDate = format(toDate, "yyyy-MM-dd");
        }
        if (scheduleStatus) {
            params.scheduleStatus = scheduleStatus;
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
        const endDate = searchParams.get("toDate");
        const status = searchParams.get("scheduleStatus");
        const returnDate = searchParams.get("returnDate");

        if (departureLocation) setDeparture(departureLocation);
        if (arrivalLocation) setDestination(arrivalLocation);
        if (departureDate) setSelectedDate(new Date(departureDate));
        if (endDate) setToDate(new Date(endDate));
        if (status) setScheduleStatus(status);
        if (returnDate) {
            setReturnDate(new Date(returnDate));
            setTripType("round-trip");
        }
    }, [location.search]);

    const isReturnDateValid = (date: Date | null) => {
        if (!date || !selectedDate) return true;
        return date > selectedDate;
    };

    const isToDateValid = (date: Date | null) => {
        if (!date || !selectedDate) return true;
        return date >= selectedDate;
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

    const getActiveFiltersCount = () => {
        let count = 0;
        if (scheduleStatus) count++;
        if (toDate) count++;
        return count;
    };

    const clearFilters = () => {
        setScheduleStatus("");
        setToDate(null);
    };

    const adminSearchStyles = {
        inputField: {
            "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f9fafb",
                transition: "all 0.2s",
                "&:hover": {
                    backgroundColor: "#f1f5f9",
                },
                "&.Mui-focused": {
                    backgroundColor: "#ffffff",
                    boxShadow: `0 0 0 2px ${alpha("#3b82f6", 0.2)}`,
                },
            },
        },
        searchButton: {
            bgcolor: "#3b82f6",
            color: "white",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            "&:hover": {
                bgcolor: "#2563eb",
            },
        },
        filterButton: (active: boolean) => ({
            color: active ? "#3b82f6" : "#475569",
            bgcolor: active ? alpha("#3b82f6", 0.08) : "transparent",
            borderColor: active ? "#3b82f6" : "#cbd5e1",
            borderRadius: 2,
            textTransform: "none",
            "&:hover": {
                bgcolor: active
                    ? alpha("#3b82f6", 0.15)
                    : alpha("#64748b", 0.05),
                borderColor: active ? "#3b82f6" : "#94a3b8",
            },
        }),
        clearFilterButton: {
            color: "#ef4444",
            borderColor: "#ef4444",
            borderRadius: 2,
            textTransform: "none",
            "&:hover": {
                bgcolor: alpha("#ef4444", 0.08),
            },
        },
        filterChip: {
            bgcolor: "#3b82f6",
            color: "#fff",
            fontWeight: 500,
            fontSize: "0.75rem",
            height: 20,
            ml: 0.75,
        },
        advancedFilters: {
            bgcolor: "#f1f5f9",
            borderRadius: 2,
            p: 2,
            border: "1px solid #e2e8f0",
        },

        inputFieldLarge: {
            "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f9fafb",
                minHeight: 48,
                "&:hover": {
                    backgroundColor: "#f1f5f9",
                },
                "&.Mui-focused": {
                    backgroundColor: "#ffffff",
                    boxShadow: `0 0 0 2px ${alpha("#3b82f6", 0.2)}`,
                },
            },
            "& .MuiInputBase-input": {
                py: 1.5,
            },
        },
        searchButtonLarge: {
            bgcolor: "#3b82f6",
            color: "white",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            py: 1.5,
            minHeight: 48,
            textTransform: "none",
            "&:hover": {
                bgcolor: "#2563eb",
            },
        },
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

                {/* Dashboard search form */}
                {isDashBoard ? (
                    <>
                        <Grid container spacing={2} alignItems="center">
                            {/* Nơi xuất phát */}
                            <Grid item xs={12} sm={6} md={2.9}>
                                <Autocomplete
                                    freeSolo
                                    options={cities}
                                    value={departure}
                                    onChange={(event, newValue) =>
                                        setDeparture(newValue)
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Nơi xuất phát"
                                            fullWidth
                                            sx={
                                                adminSearchStyles.inputFieldLarge
                                            }
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <MyLocationIcon
                                                            sx={{
                                                                color: "#3b82f6",
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Nơi đến */}
                            <Grid item xs={12} sm={6} md={2.9}>
                                <Autocomplete
                                    freeSolo
                                    options={cities}
                                    value={destination}
                                    onChange={(event, newValue) =>
                                        setDestination(newValue)
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Nơi đến"
                                            fullWidth
                                            sx={
                                                adminSearchStyles.inputFieldLarge
                                            }
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PlaceIcon
                                                            sx={{
                                                                color: "#ef4444",
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Từ ngày */}
                            <Grid item xs={12} sm={6} md={2.5}>
                                <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                    adapterLocale={vi}
                                >
                                    <DatePicker
                                        label="Từ ngày"
                                        value={selectedDate}
                                        onChange={(date) =>
                                            setSelectedDate(date)
                                        }
                                        format="dd/MM/yyyy"
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                sx: adminSearchStyles.inputFieldLarge,
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <CalendarMonthIcon
                                                                sx={{
                                                                    color: "#3b82f6",
                                                                }}
                                                            />
                                                        </InputAdornment>
                                                    ),
                                                },
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            {/* Nút tìm kiếm và bộ lọc */}
                            <Grid item xs={12} sm={6} md={3.7}>
                                <Stack direction="row" spacing={1.5}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSearchClick}
                                        startIcon={<SearchIcon />}
                                        disableElevation
                                        sx={adminSearchStyles.searchButtonLarge}
                                    >
                                        Tìm kiếm
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={
                                            showAdvancedFilters ? (
                                                <FilterAltOffIcon />
                                            ) : (
                                                <TuneIcon />
                                            )
                                        }
                                        onClick={toggleAdvancedFilters}
                                        sx={adminSearchStyles.filterButton(
                                            showAdvancedFilters
                                        )}
                                    >
                                        {showAdvancedFilters
                                            ? "Ẩn bộ lọc"
                                            : "Bộ lọc"}
                                        {getActiveFiltersCount() > 0 && (
                                            <Chip
                                                label={getActiveFiltersCount()}
                                                size="small"
                                                sx={
                                                    adminSearchStyles.filterChip
                                                }
                                            />
                                        )}
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>

                        <Collapse in={showAdvancedFilters}>
                            <Box
                                sx={{
                                    ...adminSearchStyles.advancedFilters,
                                    mt: 2.5,
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    sx={{ mb: 2, color: "#475569" }}
                                >
                                    Bộ lọc nâng cao
                                </Typography>

                                <Grid
                                    container
                                    spacing={2.5}
                                    alignItems="center"
                                >
                                    <Grid item xs={12} sm={6} md={3}>
                                        <LocalizationProvider
                                            dateAdapter={AdapterDateFns}
                                            adapterLocale={vi}
                                        >
                                            <DatePicker
                                                label="Đến ngày"
                                                value={toDate}
                                                onChange={(date) => {
                                                    if (
                                                        date &&
                                                        !isToDateValid(date)
                                                    ) {
                                                        toast.warn(
                                                            "Đến ngày phải sau hoặc bằng từ ngày"
                                                        );
                                                        return;
                                                    }
                                                    setToDate(date);
                                                }}
                                                format="dd/MM/yyyy"
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        size: "small",
                                                        sx: adminSearchStyles.inputField,
                                                        InputProps: {
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <CalendarMonthIcon
                                                                        sx={{
                                                                            color: "#8b5cf6",
                                                                        }}
                                                                    />
                                                                </InputAdornment>
                                                            ),
                                                        },
                                                    },
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl
                                            fullWidth
                                            size="small"
                                            sx={adminSearchStyles.inputField}
                                        >
                                            <InputLabel>
                                                Trạng thái lịch trình
                                            </InputLabel>
                                            <Select
                                                value={scheduleStatus}
                                                onChange={(e) =>
                                                    setScheduleStatus(
                                                        e.target.value
                                                    )
                                                }
                                                label="Trạng thái lịch trình"
                                                startAdornment={
                                                    <DirectionsBusIcon
                                                        sx={{
                                                            ml: 1,
                                                            mr: 0.5,
                                                            color: "#0ea5e9",
                                                        }}
                                                    />
                                                }
                                            >
                                                <MenuItem value="">
                                                    Tất cả
                                                </MenuItem>
                                                <MenuItem value="SCHEDULED">
                                                    Chưa khởi hành
                                                </MenuItem>
                                                <MenuItem value="IN_PROGRESS">
                                                    Đang chạy
                                                </MenuItem>
                                                <MenuItem value="COMPLETED">
                                                    Hoàn thành
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {getActiveFiltersCount() > 0 && (
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<ClearAllIcon />}
                                                onClick={clearFilters}
                                                sx={
                                                    adminSearchStyles.clearFilterButton
                                                }
                                                fullWidth
                                                size="medium"
                                            >
                                                Xóa lọc
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </Collapse>
                    </>
                ) : (
                    // Original search form for non-dashboard pages
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
                                flex: 3,
                                minWidth: "500px",
                            }}
                        >
                            <Autocomplete
                                freeSolo
                                options={cities}
                                value={departure}
                                onChange={(event, newValue) => {
                                    if (
                                        !isDashboard &&
                                        newValue === destination
                                    ) {
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
                                                        sx={{
                                                            color: "#1976d2",
                                                        }}
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
                                    if (
                                        !isDashboard &&
                                        newValue === departure
                                    ) {
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
                                                        sx={{
                                                            color: "#ef4444",
                                                        }}
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
                                            if (
                                                date &&
                                                !isReturnDateValid(date)
                                            ) {
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
                                                    "& .MuiOutlinedInput-root":
                                                        {
                                                            backgroundColor:
                                                                "#f8fafc",
                                                            "&:hover fieldset":
                                                                {
                                                                    borderColor:
                                                                        "#1976d2",
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
                )}
            </div>
        </div>
    );
};

export default Search;
