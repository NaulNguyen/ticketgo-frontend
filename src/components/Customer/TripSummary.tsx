import React, { useEffect, useState } from "react";
import {
    Box,
    Divider,
    IconButton,
    Typography,
    Tooltip,
    Radio,
} from "@mui/material";
import { LocationRoute } from "../IconSVG";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { EstimatedPrice, TripInfo } from "../../global";
import { axiosWithJWT } from "../../config/axiosConfig";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useLocation } from "react-router-dom";

interface TripSummaryProps {
    tripInfo: TripInfo;
    estimatedPrice: EstimatedPrice;
    onPromotionSelect?: (
        promotion: { promotionId: number; discountPercentage: number } | null
    ) => void;
}

interface Promotion {
    promotionId: number;
    description: string;
    discountPercentage: number;
    discountCode: string;
    startDate: string;
    endDate: string;
    status: string;
}

const TripSummary: React.FC<TripSummaryProps> = ({
    tripInfo,
    estimatedPrice,
    onPromotionSelect,
}) => {
    const [showPriceDetails, setShowPriceDetails] = useState(false);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [selectedPromotion, setSelectedPromotion] =
        useState<Promotion | null>(null);

    const location = useLocation();
    const isPaymentMethod = location.pathname === "/payment-method";

    const handlePriceBoxClick = () => {
        setShowPriceDetails((prev) => !prev);
    };

    const calculateDiscount = (price: number, discountPercentage: number) => {
        return Math.round((price * discountPercentage) / 100);
    };

    const handlePromotionSelect = (promo: Promotion | null) => {
        setSelectedPromotion(promo);
        // Pass the selected promotion data to parent component
        if (onPromotionSelect) {
            onPromotionSelect(
                promo
                    ? {
                          promotionId: promo.promotionId,
                          discountPercentage: promo.discountPercentage,
                      }
                    : null
            );
        }
    };

    const calculateFinalPrice = (
        totalPrice: number,
        promotion: Promotion | null
    ) => {
        if (!promotion) return totalPrice;
        const discount = Math.round(
            (totalPrice * promotion.discountPercentage) / 100
        );
        return totalPrice - discount;
    };

    const formattedDepartureTime =
        tripInfo.departureTime &&
        !isNaN(new Date(tripInfo.departureTime).getTime())
            ? format(new Date(tripInfo.departureTime), "EEE, dd/MM/yyyy", {
                  locale: vi,
              })
            : "Ngày không hợp lệ";

    const formatTime = (time: string) => {
        const date = new Date(time);
        return !isNaN(date.getTime()) ? format(date, "HH:mm") : "N/A";
    };

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return "N/A";
        return text.length > maxLength
            ? `${text.substring(0, maxLength)}...`
            : text;
    };

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await axiosWithJWT.get(
                    "https://ticketgo.site/api/v1/promotions/active",
                    {
                        params: {
                            pageNumber: 1,
                            pageSize: 40,
                        },
                    }
                );
                setPromotions(response.data.data);
            } catch (error) {
                console.error("Error fetching promotions:", error);
            }
        };

        fetchPromotions();
    }, []);

    return (
        <Box
            sx={{
                width: "375px",
                padding: 2,
                borderRadius: 2,
                marginBottom: showPriceDetails ? "50px" : 0,
            }}
        >
            {/* Price Summary */}
            <Box
                sx={{
                    backgroundColor: "white",
                    alignItems: "center",
                    padding: 2,
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    cursor: "pointer",
                }}
                onClick={handlePriceBoxClick}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography sx={{ fontWeight: "700", fontSize: "18px" }}>
                        Tạm tính
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                            sx={{
                                fontWeight: "bold",
                                color: "#2474e5",
                                fontSize: "18px",
                            }}
                        >
                            {new Intl.NumberFormat("vi-VN").format(
                                calculateFinalPrice(
                                    estimatedPrice?.totalPrice || 0,
                                    selectedPromotion
                                )
                            )}
                            đ
                        </Typography>
                        <IconButton
                            sx={{
                                "&:hover": { backgroundColor: "transparent" },
                                padding: "0",
                            }}
                        >
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
                        }}
                    >
                        {/* Cột bên trái: Giá vé + Giảm giá */}
                        <Box display="flex" flexDirection="column">
                            <Typography sx={{ fontSize: "14px" }}>
                                Giá vé
                            </Typography>
                            {selectedPromotion && isPaymentMethod && (
                                <Typography
                                    sx={{ fontSize: "14px", marginTop: 3 }}
                                >
                                    Giảm giá
                                </Typography>
                            )}
                        </Box>

                        {/* Cột bên phải: Giá, số lượng, ghế, giảm giá */}
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="flex-end"
                        >
                            <Typography sx={{ fontSize: "14px" }}>
                                {new Intl.NumberFormat("en-US").format(
                                    estimatedPrice?.unitPrice || 0
                                )}
                                đ x {estimatedPrice?.quantity || 1}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: "12px",
                                    color: "rgb(133, 133, 133)",
                                }}
                            >
                                Mã ghế/giường:{" "}
                                {estimatedPrice?.seatNumbers?.join(", ") ||
                                    "N/A"}
                            </Typography>

                            {selectedPromotion && isPaymentMethod && (
                                <Typography
                                    sx={{
                                        fontSize: "14px",
                                        color: "#00c853",
                                        fontWeight: "bold",
                                        marginTop: 1,
                                    }}
                                >
                                    -
                                    {new Intl.NumberFormat("vi-VN").format(
                                        calculateDiscount(
                                            estimatedPrice?.totalPrice || 0,
                                            selectedPromotion.discountPercentage
                                        )
                                    )}
                                    đ
                                </Typography>
                            )}
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Promotions Section */}
            {isPaymentMethod && (
                <Box
                    sx={{
                        mb: 2,
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        p: 2,
                        marginTop: 2,
                        backgroundColor: "white",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: "700",
                                fontSize: "18px",
                            }}
                        >
                            Mã giảm giá
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            overflowX: "auto",
                            gap: 2,
                            pb: 1,
                            "&::-webkit-scrollbar": {
                                height: "6px",
                            },
                            "&::-webkit-scrollbar-track": {
                                background: "#f1f1f1",
                                borderRadius: "10px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                background: "#888",
                                borderRadius: "10px",
                                "&:hover": {
                                    background: "#555",
                                },
                            },
                        }}
                    >
                        {promotions.map((promo) => (
                            <Box
                                key={promo.promotionId}
                                onClick={() => handlePromotionSelect(promo)}
                                sx={{
                                    position: "relative",
                                    minWidth: "200px",
                                    border: `1px solid ${
                                        selectedPromotion?.promotionId ===
                                        promo.promotionId
                                            ? "#1976d2"
                                            : "#e0e0e0"
                                    }`,
                                    borderRadius: "8px",
                                    p: 2,
                                    backgroundColor:
                                        selectedPromotion?.promotionId ===
                                        promo.promotionId
                                            ? "#f5f9ff"
                                            : "white",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        borderColor: "#2474e5",
                                        backgroundColor: "#f5f9ff",
                                    },
                                }}
                            >
                                <Radio
                                    checked={
                                        selectedPromotion?.promotionId ===
                                        promo.promotionId
                                    }
                                    onChange={() => setSelectedPromotion(promo)}
                                    sx={{
                                        position: "absolute",
                                        right: 8,
                                        top: 8,
                                    }}
                                />
                                <LocalOfferIcon sx={{ color: "#2474e5" }} />
                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 600,
                                            color: "#2474e5",
                                            mb: 0.5,
                                        }}
                                    >
                                        Giảm {promo.discountPercentage}%
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: "13px",
                                            color: "#666",
                                        }}
                                    >
                                        {promo.description}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Trip Information */}
            <Box
                sx={{
                    marginTop: 2,
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    minHeight: "300px",
                    marginBottom: "30px",
                }}
            >
                <Typography
                    sx={{
                        fontWeight: "bold",
                        fontSize: "18px",
                        marginBottom: 2,
                    }}
                >
                    Thông tin chuyến đi
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        fontSize: "12px",
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <DirectionsBusIcon sx={{ color: "#2474e5", ml: 1 }} />
                        <Typography
                            sx={{ fontWeight: "700", paddingY: "12px" }}
                        >
                            {formattedDepartureTime}
                        </Typography>
                    </Box>
                    <Divider />

                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            alignItems: "center",
                            paddingX: "12px",
                            paddingTop: "12px",
                        }}
                    >
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
                                {tripInfo?.licensePlate || "N/A"}
                            </Typography>
                            <Typography
                                sx={{ color: "gray", fontSize: "14px" }}
                            >
                                {tripInfo?.busType || "N/A"}
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
                        }}
                    >
                        <Box display="flex" flexDirection="column" gap={3.5}>
                            <Typography sx={{ fontWeight: "bold" }}>
                                {formatTime(tripInfo?.pickupTime)}
                            </Typography>
                            <Typography sx={{ fontWeight: "bold" }}>
                                {formatTime(tripInfo?.dropoffTime)}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: 50,
                                height: 50,
                            }}
                        >
                            <LocationRoute />
                        </Box>

                        <Box
                            display="flex"
                            flexDirection="column"
                            gap={3.5}
                            sx={{ flex: 1 }}
                        >
                            <Tooltip
                                title={tripInfo?.pickupLocation || "N/A"}
                                placement="top"
                            >
                                <Typography sx={{ fontWeight: "700" }}>
                                    {truncateText(tripInfo?.pickupLocation, 15)}
                                </Typography>
                            </Tooltip>
                            <Tooltip
                                title={tripInfo?.dropoffLocation || "N/A"}
                                placement="bottom"
                            >
                                <Typography sx={{ fontWeight: "700" }}>
                                    {truncateText(
                                        tripInfo?.dropoffLocation,
                                        15
                                    )}
                                </Typography>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default TripSummary;
