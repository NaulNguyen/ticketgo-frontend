import React, { useState } from "react";
import { Header, Search } from "../components";
import {
    Box,
    Button,
    Container,
    Divider,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import SeatSelect from "../components/SeatSelect";
import { LocationRoute } from "../components/IconSVG";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import Details from "../components/Details";

const SearchingPage = () => {
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
    const [isSeatSelectOpen, setIsSeatSelectOpen] = useState(false);

    const handleToggleDetails = () => {
        setIsDetailsExpanded((prev) => !prev);
    };

    const handleSelectTrip = () => {
        setIsSeatSelectOpen((prev) => !prev);
    };

    return (
        <div style={{ backgroundColor: "rgb(243,243,243)", minHeight: "100vh" }}>
            <Header />
            <Container>
                <Search />
                <div className="pt-6 flex justify-center inset-0 ">
                    <Box
                        sx={{
                            backgroundColor: "white",
                            width: "40%",
                            padding: 2,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            borderRadius: 1,
                            borderWidth: 1,
                            borderColor: "rgb(209 213 219)",
                            height: "fit-content",
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
                                name="radio-buttons-group">
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

                    {/* Ticket Card */}
                    <Box
                        mb={3}
                        sx={{
                            backgroundColor: "white",
                            p: 3,
                            borderRadius: 2,
                            borderColor: "gray.300",
                            boxShadow: 2,
                            display: "flex",
                            gap: 2,
                            width: "100%",
                            ml: 2,
                            minHeight: "270px",
                            flexDirection: "column",
                            transition: "box-shadow 0.3s",
                            "&:hover": {
                                boxShadow: 10,
                            },
                        }}>
                        <Box display="flex" gap={2} height="full">
                            <img
                                src="https://static.vexere.com/production/images/1718099057092.jpeg?w=250&h=250"
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
                                            <span className="text-blue-700 font-bold">Go 365</span>
                                            <span
                                                className="text-white text-sm flex items-center justify-center px-1 rounded-sm"
                                                style={{
                                                    backgroundColor: "rgb(36, 116, 229)",
                                                    height: "fit-content",
                                                }}>
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
                                            Limousine 11 chỗ
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
                                        249.000đ
                                    </Typography>
                                </Box>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <Box display="flex" className="space-x-2 items-center">
                                        <LocationRoute />
                                        <Box className="text-gray-600">
                                            <Typography className="text-xl font-bold">
                                                17:00
                                                <span className="mx-1 font-normal text-base">
                                                    • Đà Lạt
                                                </span>
                                            </Typography>
                                            <Typography className="text-sm py-1">3h20m</Typography>
                                            <Typography className="text-xl font-bold text-gray-500">
                                                20:20
                                                <span className="mx-1 font-normal text-base">
                                                    • Nha Trang
                                                </span>
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box textAlign="right">
                                        <Typography className="text-gray-700 text-base my-1">
                                            Còn 11 chỗ trống
                                        </Typography>
                                        <Box display="flex" alignItems="center">
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                onClick={handleToggleDetails}
                                                sx={{ cursor: "pointer", mr: 2 }}>
                                                <Typography
                                                    color="primary"
                                                    sx={{
                                                        textDecoration: "underline",
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}>
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
                                                    backgroundColor: isSeatSelectOpen
                                                        ? "rgb(192, 192, 192)" // Change background when selected
                                                        : "rgb(255, 199, 0)", // Default background
                                                    color: "black",
                                                    p: "8px 16px",
                                                    fontWeight: "bold",
                                                }}>
                                                {isSeatSelectOpen ? "Đóng" : "Chọn chuyến"}
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {isDetailsExpanded && (
                            <>
                                <Divider />
                                <Details />
                            </>
                        )}
                        {isSeatSelectOpen && (
                            <>
                                <Divider />
                                <SeatSelect />
                            </>
                        )}
                    </Box>
                </div>
            </Container>
        </div>
    );
};

export default SearchingPage;
