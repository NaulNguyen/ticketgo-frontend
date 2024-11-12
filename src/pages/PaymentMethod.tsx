import React, { useState } from "react";
import { Header } from "../components";
import {
    Box,
    Button,
    Container,
    Divider,
    FormControlLabel,
    IconButton,
    Radio,
    RadioGroup,
    Typography,
} from "@mui/material";
import { LocationRoute } from "../components/IconSVG";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import GroupIcon from "@mui/icons-material/Group";

const PaymentMethod = () => {
    const [showPriceDetails, setShowPriceDetails] = useState(false);

    const handlePriceBoxClick = () => {
        setShowPriceDetails((prev) => !prev);
    };

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
                <Container
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                    }}>
                    <Box display="flex" flexDirection="column">
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
                                minHeight: "fit-content",
                            }}>
                            <Typography variant="h5" sx={{ fontWeight: "bold", fontSize: "18px" }}>
                                Phương thức thanh toán
                            </Typography>
                            <RadioGroup>
                                <FormControlLabel
                                    value="vnpay"
                                    control={<Radio />}
                                    label={
                                        <Box>
                                            <Box display="flex" gap={1}>
                                                <img
                                                    src="https://229a2c9fe669f7b.cmccloud.com.vn/httpImage/vn_pay.svg"
                                                    alt="vnpay"
                                                />
                                                <Typography>Thanh toán VNPAY</Typography>
                                            </Box>
                                            <Typography
                                                sx={{
                                                    fontSize: "14px",
                                                    color: "gray",
                                                    marginTop: 1,
                                                }}>
                                                Thiết bị cần cài đặt Ứng dụng ngân hàng (Mobile
                                                Banking) hoặc Ví VNPAY
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </RadioGroup>
                        </Box>
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
                                minHeight: "fit-content",
                            }}>
                            <Typography variant="h5" sx={{ fontWeight: "bold", fontSize: "18px" }}>
                                Thông tin liên hệ
                            </Typography>
                            <Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography>Tên người đặt</Typography>
                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                            marginBottom: 2,
                                        }}>
                                        Nguyễn Võ Minh Luân
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography>Số điện thoại</Typography>
                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                            marginBottom: 2,
                                        }}>
                                        0397487793
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography>Email </Typography>
                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                            marginBottom: 2,
                                        }}>
                                        minhluan22612@gmail.com
                                    </Typography>
                                </Box>
                            </Box>
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
                                        <Typography sx={{ fontWeight: "500" }}>
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
                                        <Typography sx={{ fontWeight: "500" }}>
                                            Trạm Hà Nội
                                        </Typography>
                                        <Typography sx={{ fontWeight: "500" }}>
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
                    marginTop: "20px",
                }}>
                <Box sx={{ textAlign: "center", marginRight: "20px" }}>
                    <Button
                        variant="contained"
                        size="medium"
                        sx={{
                            py: 1.5,
                            backgroundColor: "rgb(255, 211, 51)",
                            color: "black",
                            textTransform: "none",
                            fontSize: "16px",
                            width: "700px",
                            fontWeight: "bold",
                            marginBottom: "8px",
                        }}
                        startIcon={<HealthAndSafetyIcon />}>
                        Thanh toán
                    </Button>
                    <Typography variant="body2" sx={{ fontSize: "14px", color: "gray" }}>
                        Bằng việc nhấn nút Thanh toán, bạn đồng ý với Chính sách bảo mật thanh toán
                    </Typography>
                </Box>

                <Box marginBottom={3}>
                    <Typography variant="body2" sx={{ fontSize: "14px", color: "gray" }}>
                        Bạn sẽ sớm nhận được biển số xe, số điện thoại tài xế
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "14px", color: "gray" }}>
                        và dễ dàng thay đổi điểm đón trả sau khi đặt.
                    </Typography>
                </Box>
            </Box>
        </div>
    );
};

export default PaymentMethod;
