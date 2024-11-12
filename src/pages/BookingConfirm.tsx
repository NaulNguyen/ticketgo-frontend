import React, { useState } from "react";
import { Header } from "../components";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Container,
    Divider,
    FormControl,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { LocationRoute } from "../components/IconSVG";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import GroupIcon from "@mui/icons-material/Group";

const BookingConfirm = () => {
    const navigate = useNavigate();

    const [showPriceDetails, setShowPriceDetails] = useState(false);

    const handlePriceBoxClick = () => {
        setShowPriceDetails((prev) => !prev);
    };

    const handleBackClick = () => navigate(-1);
    return (
        <div
            style={{
                backgroundColor: "rgb(242, 242, 242)",
                minHeight: "450px",
                minWidth: "450px",
            }}>
            <Header />
            <Container
                sx={{
                    paddingY: "20px",
                    justifyContent: "center",
                    alignItems: "flex-start",
                }}>
                <Button
                    startIcon={<ArrowBackIosIcon sx={{ fontSize: "8px", color: "#484848" }} />}
                    sx={{
                        fontSize: "16px",
                        textTransform: "none",
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "transparent" },
                    }}
                    onClick={handleBackClick}>
                    Quay lại
                </Button>
                <Container
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                    }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            padding: "20px",
                            backgroundColor: "white",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0",
                            marginTop: "20px",
                            width: "700px",
                            minHeight: "400px",
                        }}>
                        <Typography variant="h5" sx={{ fontWeight: "bold", fontSize: "18px" }}>
                            Thông tin liên hệ
                        </Typography>

                        <TextField
                            label={
                                <span>
                                    Tên người đi <span style={{ color: "red" }}>*</span>
                                </span>
                            }
                            variant="outlined"
                            fullWidth
                        />

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <FormControl sx={{ width: "100px" }} required>
                                <Select defaultValue="+84">
                                    <MenuItem value="+84">+84</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label={
                                    <span>
                                        Số điện thoại <span style={{ color: "red" }}>*</span>
                                    </span>
                                }
                                variant="outlined"
                                type="tel"
                                sx={{ flex: 1 }}
                            />
                        </Box>

                        <TextField
                            label={
                                <span>
                                    Email để nhận thông tin đặt chỗ{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </span>
                            }
                            variant="outlined"
                            fullWidth
                            type="email"
                        />
                        <Box
                            sx={{
                                paddingY: "10px",
                                paddingX: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #4CAF50",
                                backgroundColor: "rgb(238, 251, 244)",
                                borderRadius: "8px",
                            }}>
                            <HealthAndSafetyIcon sx={{ color: "#27ae60", marginRight: "8px" }} />
                            <p style={{ color: "black", margin: 0 }}>
                                Số điện thoại và email được sử dụng để gửi thông tin đơn hàng và
                                liên hệ khi cần thiết.
                            </p>
                        </Box>
                    </Box>

                    {/* Trip Summary and Details Box */}
                    <Box
                        sx={{
                            width: "375px",
                            padding: 2,
                            borderRadius: 2,
                        }}>
                        <Box
                            sx={{
                                backgroundColor: "white",
                                alignItems: "center",
                                padding: 2,
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                cursor: "pointer",
                            }}
                            onClick={handlePriceBoxClick}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}>
                                <Typography sx={{ fontWeight: "700", fontSize: "18px" }}>
                                    Tạm tính
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}>
                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            color: "#2474e5",
                                            fontSize: "18px",
                                        }}>
                                        300.000đ
                                    </Typography>
                                    <IconButton
                                        sx={{
                                            "&:hover": {
                                                backgroundColor: "transparent",
                                            },
                                            padding: "0",
                                        }}>
                                        {showPriceDetails ? (
                                            <KeyboardArrowUpIcon />
                                        ) : (
                                            <KeyboardArrowDownIcon />
                                        )}
                                    </IconButton>
                                </Box>
                            </Box>
                            {showPriceDetails && (
                                <Box
                                    sx={{
                                        marginTop: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}>
                                    <Typography sx={{ fontSize: "14px" }}>Giá vé</Typography>
                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        justifyContent="flex-end">
                                        <Typography sx={{ fontSize: "14px" }}>300.000đ</Typography>
                                        <Typography
                                            sx={{ fontSize: "12px", color: "rgb(133, 133, 133)" }}>
                                            Mã ghế: A12
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        <Box
                            sx={{
                                marginTop: 2,
                                backgroundColor: "white",
                                padding: "20px",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                minHeight: "300px",
                            }}>
                            <Typography
                                sx={{ fontWeight: "bold", fontSize: "18px", marginBottom: 2 }}>
                                Thông tin chuyến đi
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    borderRadius: "8px",
                                    border: "1px solid #e0e0e0",
                                    fontSize: "12px",
                                }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <DirectionsBusIcon sx={{ color: "#2474e5", ml: 1 }} />
                                    <Typography sx={{ fontWeight: "700", paddingY: "12px" }}>
                                        T5, 21/11/2024
                                    </Typography>
                                    <GroupIcon sx={{ color: "gray" }} />
                                    <Typography>1</Typography>
                                </Box>
                                <Divider />

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        alignItems: "center",
                                        paddingX: "12px",
                                        paddingTop: "12px",
                                    }}>
                                    <img
                                        src="https://static.vexere.com/production/images/1682389349632.jpeg"
                                        alt="xe"
                                        style={{
                                            height: "36px",
                                            width: "58px",
                                            borderRadius: 4,
                                        }}
                                    />
                                    <Box>
                                        <Typography sx={{ fontWeight: "700" }}>
                                            NASA Travel
                                        </Typography>
                                        <Typography sx={{ color: "gray", fontSize: "14px" }}>
                                            Ghế ngồi GAZ 12 chổ
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ marginY: 2 }} />

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        paddingBottom: "12px",
                                        paddingX: "12px",
                                        gap: "15px",
                                    }}>
                                    <Box display="flex" flexDirection="column" gap={3.5}>
                                        <Typography sx={{ fontWeight: "bold" }}>17:30</Typography>
                                        <Typography sx={{ fontWeight: "bold" }}>20:40</Typography>
                                    </Box>

                                    <LocationRoute />

                                    <Box display="flex" flexDirection="column" gap={3.5}>
                                        <Typography sx={{ fontWeight: "700" }}>
                                            Trạm Hà Nội
                                        </Typography>
                                        <Typography sx={{ fontWeight: "700" }}>
                                            Trạm Đà Nẵng
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Container>
            <Box
                sx={{
                    width: "100%",
                    backgroundColor: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    padding: "20px",
                    height: "100px",
                }}>
                <Button
                    variant="contained"
                    size="medium"
                    sx={{
                        py: 2,
                        backgroundColor: "rgb(255, 211, 51)",
                        color: "black",
                        textTransform: "none",
                        fontSize: "16px",
                        width: "700px",
                        fontWeight: "bold",
                    }}>
                    Tiếp tục
                </Button>
            </Box>
        </div>
    );
};

export default BookingConfirm;
