import {
    Box,
    Divider,
    List,
    ListItem,
    Tab,
    Tabs,
    Typography,
    Paper,
    Avatar,
    Button,
    Tooltip,
    Grid,
    Chip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import TranslateIcon from "@mui/icons-material/Translate";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import HardwareIcon from "@mui/icons-material/Hardware";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import WbIncandescentIcon from "@mui/icons-material/WbIncandescent";
import BedIcon from "@mui/icons-material/Bed";
import axios from "axios";
import { axiosWithJWT } from "../../config/axiosConfig";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import DownloadIcon from "@mui/icons-material/Download";
import { generateCustomerListPDF } from "../../utils/generateCustomerListPDF";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import UpdateDriverBusDialog from "../../popup/UpdateDriverBusDialog";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import useAppAccessor from "../../hook/useAppAccessor";
import SeatSelect from "./SeatSelect";

interface RouteStop {
    location: string;
    arrivalTime: string;
}

interface RouteStopsData {
    pickup: RouteStop[];
    dropoff: RouteStop[];
}

interface DetailsProps {
    scheduleId: string;
    price?: number;
}

interface Policy {
    policyType: string;
    policyContent: string;
}

interface Amenity {
    name: string;
    description: string;
}

interface Customer {
    customerPhone: string;
    customerName: string;
    seatNumber: number;
    pickupLocation: string;
    dropoffLocation: string;
}

const amenityIcons: { [key: string]: React.ReactNode } = {
    "Nhân viên sử dụng tiếng anh": (
        <TranslateIcon sx={{ marginX: "8px", color: "blue" }} />
    ),
    "Ghế massage": (
        <HealthAndSafetyIcon sx={{ marginX: "8px", color: "blue" }} />
    ),
    "Bánh ngọt": <FastfoodIcon sx={{ marginX: "8px", color: "blue" }} />,
    "Đèn đọc sách": (
        <WbIncandescentIcon sx={{ marginX: "8px", color: "blue" }} />
    ),
    "Nước uống": <WaterDropIcon sx={{ marginX: "8px", color: "blue" }} />,
    "Gối nằm": <BedIcon sx={{ marginX: "8px", color: "blue" }} />,
    "Búa phá kính": <HardwareIcon sx={{ marginX: "8px", color: "blue" }} />,
};

interface DriverInfo {
    driver: {
        driverId: number;
        name: string;
        licenseNumber: string;
        phoneNumber: string;
        imageUrl: string;
        placeOfIssue: string;
        issueDate: string;
        expiryDate: string;
    };
    bus: {
        busId: number;
        licensePlate: string;
        busType: string;
        busImage: string;
        totalSeats: number;
        floors: number;
        registrationExpiry: string;
        expirationDate: string;
        registrationExpiringSoon: boolean;
        usageExpiringSoon: boolean;
    };
}

const Details: React.FC<DetailsProps> = ({ scheduleId, price }) => {
    const { getUserInfor } = useAppAccessor();
    const userInfor = getUserInfor();
    const [tabIndex, setTabIndex] = useState(0);
    const [routeStops, setRouteStops] = useState<RouteStopsData | null>(null);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [updateDialog, setUpdateDialog] = useState<{
        open: boolean;
        type: "driver" | "bus";
    } | null>(null);

    const refetchData = async () => {
        if (scheduleId) {
            try {
                const response = await axiosWithJWT.get(
                    `https://ticketgo.site/api/v1/drivers/schedule?scheduleId=${scheduleId}`
                );
                setDriverInfo(response.data.data);
            } catch (error) {
                console.error("Error fetching driver info:", error);
            }
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const groupCustomers = (customers: Customer[]) => {
        const grouped = customers.reduce(
            (acc: { [key: string]: Customer[] }, customer) => {
                if (customer.customerName) {
                    if (!acc[customer.customerName]) {
                        acc[customer.customerName] = [];
                    }
                    acc[customer.customerName].push(customer);
                }
                return acc;
            },
            {}
        );

        return Object.entries(grouped).map(([name, customers]) => ({
            customerName: name,
            customerPhone: customers[0].customerPhone,
            pickupLocation: customers[0].pickupLocation,
            dropoffLocation: customers[0].dropoffLocation,
            seatNumbers: customers.map((c) => c.seatNumber).join(", "),
        }));
    };

    const truncateText = (text: string, maxLength: number = 30) => {
        if (!text) return "";
        if (text.length <= maxLength) return text;
        return `${text.substring(0, maxLength)}...`;
    };

    useEffect(() => {
        const fetchRouteStops = async () => {
            try {
                const response = await axios.get(
                    `https://ticketgo.site/api/v1/route-stops?scheduleId=${scheduleId}`
                );
                setRouteStops(response.data.data);
            } catch (error) {
                console.error("Failed to fetch route stops", error);
            }
        };

        if (scheduleId) {
            fetchRouteStops();
        }
    }, [scheduleId]);

    useEffect(() => {
        if (tabIndex === 1) {
            const fetchPolicies = async () => {
                try {
                    const response = await axios.get(
                        "https://ticketgo.site/api/v1/policies"
                    );
                    setPolicies(response.data.data);
                } catch (err) {
                    console.error("Failed to fetch policies", err);
                }
            };
            fetchPolicies();
        } else if (tabIndex === 2) {
            const fetchAmenities = async () => {
                try {
                    const response = await axios.get(
                        "https://ticketgo.site/api/v1/amenities"
                    );
                    setAmenities(response.data.data);
                } catch (err) {
                    console.error("Failed to fetch amenities", err);
                }
            };
            fetchAmenities();
        }
    }, [tabIndex]);

    useEffect(() => {
        if (tabIndex === 3) {
            const fetchDriverInfo = async () => {
                try {
                    const response = await axiosWithJWT.get(
                        `https://ticketgo.site/api/v1/drivers/schedule?scheduleId=${scheduleId}`
                    );
                    setDriverInfo(response.data.data);
                } catch (error) {
                    console.error("Error fetching driver info:", error);
                }
            };

            fetchDriverInfo();
        }
    }, [tabIndex, scheduleId]);

    useEffect(() => {
        if (tabIndex === 4 && scheduleId) {
            const fetchCustomers = async () => {
                try {
                    const response = await axiosWithJWT.get(
                        `https://ticketgo.site/api/v1/schedules/${scheduleId}/customers`
                    );
                    setCustomers(response.data.data);
                } catch (error) {
                    console.error("Error fetching customers:", error);
                }
            };
            fetchCustomers();
        }
    }, [tabIndex, scheduleId]);

    return (
        <Box>
            {/* Tabs */}
            <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                aria-label="Details tabs"
                centered
            >
                <Tab
                    label="Đón/trả"
                    sx={{
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: "500",
                        color: tabIndex === 0 ? "rgb(24, 144, 255)" : "inherit",
                    }}
                />
                <Tab
                    label="Chính sách"
                    sx={{
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: "500",
                        color: tabIndex === 1 ? "rgb(24, 144, 255)" : "inherit",
                    }}
                />
                <Tab
                    label="Tiện ích"
                    sx={{
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: "500",
                        color: tabIndex === 2 ? "rgb(24, 144, 255)" : "inherit",
                    }}
                />
                {window.location.pathname.includes("dashboard") && (
                    <Tab
                        label="Tài xế"
                        sx={{
                            textTransform: "none",
                            fontSize: "16px",
                            fontWeight: "500",
                            color:
                                tabIndex === 3
                                    ? "rgb(24, 144, 255)"
                                    : "inherit",
                        }}
                    />
                )}
                {window.location.pathname.includes("dashboard") && (
                    <Tab
                        label="Chọn ghế"
                        sx={{
                            textTransform: "none",
                            fontSize: "16px",
                            fontWeight: "500",
                            color:
                                tabIndex === 4
                                    ? "rgb(24, 144, 255)"
                                    : "inherit",
                        }}
                    />
                )}
                {window.location.pathname.includes("dashboard") && (
                    <Tab
                        label="Danh sách khách hàng"
                        sx={{
                            textTransform: "none",
                            fontSize: "16px",
                            fontWeight: "500",
                            color:
                                tabIndex === 5
                                    ? "rgb(24, 144, 255)"
                                    : "inherit",
                        }}
                    />
                )}
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ px: 3, pb: 3, minHeight: "content-fit" }}>
                {tabIndex === 0 && routeStops && (
                    <Box>
                        <Divider />
                        <Typography
                            variant="h6"
                            color="primary"
                            fontSize={16}
                            fontWeight={600}
                            mt={2}
                        >
                            Lưu ý
                        </Typography>
                        <Typography>
                            Các mốc thời gian đón, trả bên dưới là thời gian dự
                            kiến.
                        </Typography>
                        <Typography>
                            Lịch này có thể thay đổi tùy tình hình thực tế.
                        </Typography>
                        <Box
                            display="flex"
                            justifyContent="space-around"
                            alignContent="center"
                        >
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ mt: 2 }}
                                    fontSize={18}
                                    fontWeight={700}
                                >
                                    Điểm đón
                                </Typography>
                                <Box
                                    sx={{
                                        maxHeight: "440px",
                                        overflowY: "auto",
                                        paddingRight: "10px",
                                    }}
                                >
                                    {routeStops.pickup.map((stop, index) => {
                                        const arrivalTime = new Date(
                                            stop.arrivalTime
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                        });
                                        return (
                                            <Typography
                                                key={index}
                                                display="flex"
                                                alignItems="center"
                                                sx={{ paddingTop: "13px" }}
                                            >
                                                <span
                                                    style={{
                                                        fontWeight: "bold",
                                                        marginRight: "8px",
                                                    }}
                                                >
                                                    {arrivalTime}
                                                </span>
                                                <span
                                                    style={{
                                                        marginRight: "8px",
                                                    }}
                                                >
                                                    •
                                                </span>
                                                <span
                                                    style={{ width: "190px" }}
                                                >
                                                    {stop.location}
                                                </span>
                                            </Typography>
                                        );
                                    })}
                                </Box>
                            </Box>
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ mt: 2 }}
                                    fontSize={18}
                                    fontWeight={700}
                                >
                                    Điểm trả
                                </Typography>
                                <Box
                                    sx={{
                                        maxHeight: "440px",
                                        overflowY: "auto",
                                        paddingRight: "10px",
                                    }}
                                >
                                    {routeStops.dropoff.map((stop, index) => {
                                        const arrivalTime = new Date(
                                            stop.arrivalTime
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                        });
                                        return (
                                            <Typography
                                                key={index}
                                                display="flex"
                                                alignItems="center"
                                                sx={{ paddingTop: "13px" }}
                                            >
                                                <span
                                                    style={{
                                                        fontWeight: "bold",
                                                        marginRight: "8px",
                                                    }}
                                                >
                                                    {arrivalTime}
                                                </span>
                                                <span
                                                    style={{
                                                        marginRight: "8px",
                                                    }}
                                                >
                                                    •
                                                </span>
                                                <span
                                                    style={{ width: "190px" }}
                                                >
                                                    {stop.location}
                                                </span>
                                            </Typography>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {tabIndex === 1 && (
                    <Box>
                        <Divider />
                        <Typography
                            variant="h6"
                            fontSize={18}
                            fontWeight={700}
                            mb={2}
                            mt={3}
                        >
                            Chính sách nhà xe
                        </Typography>
                        {policies.length > 0 &&
                            policies.map((policy, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        borderBottom:
                                            index === policies.length - 1
                                                ? "none"
                                                : "1px solid rgba(0, 0, 0, 0.12)",
                                    }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            mt: 2,
                                            color: "rgba(0, 0, 0, 0.65)",
                                        }}
                                        fontSize={16}
                                        fontWeight={700}
                                        key={index}
                                    >
                                        {policy.policyType}
                                    </Typography>
                                    <List
                                        style={{
                                            paddingLeft: "1.5rem",
                                            lineHeight: "1.6",
                                        }}
                                    >
                                        {policy.policyContent
                                            .split("\n")
                                            .map((line, lineIndex) => (
                                                <ListItem key={lineIndex}>
                                                    {line}
                                                </ListItem>
                                            ))}
                                    </List>
                                </Box>
                            ))}
                    </Box>
                )}

                {tabIndex === 2 && (
                    <Box>
                        <Divider />
                        {amenities.map((amenity, index) => (
                            <Box
                                key={index}
                                fontSize={14}
                                padding={2}
                                sx={{
                                    borderBottom:
                                        index === amenities.length - 1
                                            ? "none"
                                            : "1px solid rgba(0, 0, 0, 0.12)",
                                }}
                            >
                                <Box display="flex">
                                    {amenityIcons[amenity.name] || (
                                        <TranslateIcon
                                            sx={{
                                                marginX: "8px",
                                                color: "blue",
                                            }}
                                        />
                                    )}
                                    <Typography
                                        variant="body1"
                                        sx={{ fontWeight: 500 }}
                                    >
                                        {amenity.name}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    paddingTop={1}
                                >
                                    {amenity.description}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}

                {tabIndex === 3 && driverInfo && (
                    <Box sx={{ mt: 3 }}>
                        <Divider />

                        {/* Driver Info Section */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                mt: 3,
                                borderRadius: 3,
                                background:
                                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                                border: "1px solid",
                                borderColor: "divider",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            {/* Background Pattern */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    width: "200px",
                                    height: "200px",
                                    background:
                                        "linear-gradient(45deg, transparent 49%, rgba(25,118,210,0.03) 50%, rgba(25,118,210,0.03) 51%, transparent 52%)",
                                    backgroundSize: "20px 20px",
                                }}
                            />

                            <Grid container spacing={4}>
                                {/* Driver Info Column */}
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ position: "relative" }}>
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 700,
                                                color: "primary.main",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                mb: 3,
                                            }}
                                        >
                                            <BadgeIcon /> Thông tin tài xế
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 3,
                                                mb: 4,
                                            }}
                                        >
                                            <Avatar
                                                src={driverInfo.driver.imageUrl}
                                                sx={{
                                                    width: 120,
                                                    height: 120,
                                                    border: 4,
                                                    borderColor: "primary.main",
                                                    boxShadow:
                                                        "0 4px 14px rgba(0,0,0,0.1)",
                                                }}
                                            />
                                            <Box>
                                                <Typography
                                                    variant="h5"
                                                    fontWeight="bold"
                                                    gutterBottom
                                                >
                                                    {driverInfo.driver.name}
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    startIcon={
                                                        <SwapHorizIcon />
                                                    }
                                                    onClick={() =>
                                                        setUpdateDialog({
                                                            open: true,
                                                            type: "driver",
                                                        })
                                                    }
                                                    sx={{
                                                        textTransform: "none",
                                                        borderRadius: 2,
                                                        px: 3,
                                                    }}
                                                >
                                                    Thay đổi tài xế
                                                </Button>
                                            </Box>
                                        </Box>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        bgcolor:
                                                            "rgba(25,118,210,0.05)",
                                                        borderRadius: 2,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 2,
                                                    }}
                                                >
                                                    <PhoneIcon color="primary" />
                                                    <Box>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Số điện thoại
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            fontWeight="medium"
                                                        >
                                                            {
                                                                driverInfo
                                                                    .driver
                                                                    .phoneNumber
                                                            }
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        bgcolor:
                                                            "rgba(25,118,210,0.05)",
                                                        borderRadius: 2,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 2,
                                                    }}
                                                >
                                                    <BadgeIcon color="primary" />
                                                    <Box>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Bằng lái xe
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            fontWeight="medium"
                                                        >
                                                            {
                                                                driverInfo
                                                                    .driver
                                                                    .licenseNumber
                                                            }
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        bgcolor:
                                                            "rgba(25,118,210,0.05)",
                                                        borderRadius: 2,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Ngày cấp
                                                    </Typography>
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight="medium"
                                                    >
                                                        {new Date(
                                                            driverInfo.driver.issueDate
                                                        ).toLocaleDateString(
                                                            "vi-VN"
                                                        )}
                                                    </Typography>
                                                </Paper>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        bgcolor:
                                                            "rgba(25,118,210,0.05)",
                                                        borderRadius: 2,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Ngày hết hạn
                                                    </Typography>
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight="medium"
                                                    >
                                                        {new Date(
                                                            driverInfo.driver.expiryDate
                                                        ).toLocaleDateString(
                                                            "vi-VN"
                                                        )}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>

                                {/* Bus Info Column */}
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ position: "relative" }}>
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 700,
                                                color: "primary.main",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                mb: 3,
                                            }}
                                        >
                                            <DirectionsBusIcon /> Thông tin xe
                                        </Typography>

                                        <Box
                                            sx={{
                                                position: "relative",
                                                width: "100%",
                                                height: 200,
                                                borderRadius: 3,
                                                overflow: "hidden",
                                                mb: 3,
                                                "&::after": {
                                                    content: '""',
                                                    position: "absolute",
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: "30%",
                                                    background:
                                                        "linear-gradient(transparent, rgba(0,0,0,0.7))",
                                                },
                                            }}
                                        >
                                            <img
                                                src={driverInfo.bus.busImage}
                                                alt={driverInfo.bus.busType}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    p: 2,
                                                    zIndex: 1,
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        color: "white",
                                                        textShadow:
                                                            "0 2px 4px rgba(0,0,0,0.3)",
                                                    }}
                                                >
                                                    {driverInfo.bus.busType}
                                                </Typography>
                                                <Chip
                                                    label={
                                                        driverInfo.bus
                                                            .licensePlate
                                                    }
                                                    sx={{
                                                        bgcolor: "white",
                                                        fontWeight: "bold",
                                                        color: "primary.main",
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        <Button
                                            variant="contained"
                                            startIcon={<SwapHorizIcon />}
                                            onClick={() =>
                                                setUpdateDialog({
                                                    open: true,
                                                    type: "bus",
                                                })
                                            }
                                            sx={{
                                                textTransform: "none",
                                                borderRadius: 2,
                                                px: 3,
                                                mb: 3,
                                            }}
                                        >
                                            Thay đổi xe
                                        </Button>

                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        bgcolor:
                                                            "primary.light",
                                                        borderRadius: 2,
                                                        color: "primary.contrastText",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="h4"
                                                        fontWeight="bold"
                                                    >
                                                        {
                                                            driverInfo.bus
                                                                .totalSeats
                                                        }
                                                    </Typography>
                                                    <Typography>
                                                        Số ghế
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        bgcolor:
                                                            "secondary.light",
                                                        borderRadius: 2,
                                                        color: "secondary.contrastText",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="h4"
                                                        fontWeight="bold"
                                                    >
                                                        {driverInfo.bus.floors}
                                                    </Typography>
                                                    <Typography>
                                                        Số tầng
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ mt: 2 }}>
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="medium"
                                                gutterBottom
                                            >
                                                Thông tin đăng kiểm
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 2,
                                                            bgcolor: driverInfo
                                                                .bus
                                                                .registrationExpiringSoon
                                                                ? "warning.lighter"
                                                                : "background.paper",
                                                            border: 1,
                                                            borderColor:
                                                                driverInfo.bus
                                                                    .registrationExpiringSoon
                                                                    ? "warning.main"
                                                                    : "divider",
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Hạn đăng kiểm
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            color={
                                                                driverInfo.bus
                                                                    .registrationExpiringSoon
                                                                    ? "warning.main"
                                                                    : "text.primary"
                                                            }
                                                            sx={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 1,
                                                            }}
                                                        >
                                                            {
                                                                driverInfo.bus
                                                                    .registrationExpiry
                                                            }
                                                            {driverInfo.bus
                                                                .registrationExpiringSoon && (
                                                                <ErrorOutlineIcon
                                                                    color="warning"
                                                                    fontSize="small"
                                                                />
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 2,
                                                            bgcolor: driverInfo
                                                                .bus
                                                                .usageExpiringSoon
                                                                ? "warning.lighter"
                                                                : "background.paper",
                                                            border: 1,
                                                            borderColor:
                                                                driverInfo.bus
                                                                    .usageExpiringSoon
                                                                    ? "warning.main"
                                                                    : "divider",
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Hạn sử dụng
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            color={
                                                                driverInfo.bus
                                                                    .usageExpiringSoon
                                                                    ? "warning.main"
                                                                    : "text.primary"
                                                            }
                                                            sx={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 1,
                                                            }}
                                                        >
                                                            {
                                                                driverInfo.bus
                                                                    .expirationDate
                                                            }
                                                            {driverInfo.bus
                                                                .usageExpiringSoon && (
                                                                <ErrorOutlineIcon
                                                                    color="warning"
                                                                    fontSize="small"
                                                                />
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                )}

                {tabIndex === 4 && (
                    <Box>
                        <Box sx={{ mt: 3 }}>
                            <SeatSelect
                                scheduleId={scheduleId}
                                price={price}
                                onFirstTripComplete={(tripData) => {
                                    console.log("Trip data:", tripData);
                                }}
                                isReturn={false}
                                firstTripData={null}
                                isDashboard={true}
                            />
                        </Box>
                    </Box>
                )}

                {tabIndex === 5 && (
                    <Box>
                        <Divider />
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 2,
                                mb: 3,
                            }}
                        >
                            <Typography
                                variant="h6"
                                fontSize={18}
                                fontWeight={700}
                            >
                                Danh sách khách hàng
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={() =>
                                    generateCustomerListPDF(
                                        customers,
                                        scheduleId
                                    )
                                }
                                sx={{
                                    textTransform: "none",
                                    bgcolor: "#1976d2",
                                    "&:hover": { bgcolor: "#1565c0" },
                                }}
                            >
                                Tải xuống PDF
                            </Button>
                        </Box>

                        <Paper
                            sx={{
                                width: "100%",
                                overflow: "hidden",
                                borderRadius: 2,
                                border: "1px solid #e0e0e0",
                            }}
                        >
                            {/* Header */}
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "1.4fr 1fr 1.8fr 1.8fr 1fr",
                                    gap: 2,
                                    p: 2,
                                    borderBottom: "2px solid #e0e0e0",
                                    bgcolor: "#f5f5f5",
                                }}
                            >
                                <Typography fontWeight={600}>
                                    Họ và tên
                                </Typography>
                                <Typography fontWeight={600}>
                                    Số điện thoại
                                </Typography>
                                <Typography fontWeight={600}>
                                    Điểm đón
                                </Typography>
                                <Typography fontWeight={600}>
                                    Điểm trả
                                </Typography>
                                <Typography fontWeight={600}>Số ghế</Typography>
                            </Box>

                            {/* Booked seats */}
                            {groupCustomers(
                                customers.filter((c) => c.customerName)
                            ).map((customer, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "1.5fr 1fr 2fr 2fr 1fr",
                                        alignItems: "center",
                                        gap: 2,
                                        p: 2,
                                        borderBottom:
                                            index === customers.length - 1
                                                ? "none"
                                                : "1px solid #e0e0e0",
                                        "&:hover": {
                                            bgcolor: "rgba(0, 0, 0, 0.03)",
                                        },
                                        transition:
                                            "background-color 0.2s ease-in-out",
                                    }}
                                >
                                    {/* Tên khách hàng */}
                                    <Typography
                                        sx={{
                                            fontWeight: 500,
                                            color: "text.primary",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {customer.customerName}
                                    </Typography>

                                    {/* Số điện thoại */}
                                    <Typography
                                        sx={{
                                            color: "text.secondary",
                                            fontSize: "0.95rem",
                                        }}
                                    >
                                        {customer.customerPhone}
                                    </Typography>

                                    {/* Điểm đón */}
                                    <Tooltip
                                        title={customer.pickupLocation}
                                        arrow
                                        placement="top"
                                    >
                                        <Typography
                                            sx={{
                                                overflow: "hidden",
                                                whiteSpace: "nowrap",
                                                textOverflow: "ellipsis",
                                                color: "text.secondary",
                                            }}
                                        >
                                            {truncateText(
                                                customer.pickupLocation,
                                                25
                                            )}
                                        </Typography>
                                    </Tooltip>

                                    {/* Điểm trả */}
                                    <Tooltip
                                        title={customer.dropoffLocation}
                                        arrow
                                        placement="top"
                                    >
                                        <Typography
                                            sx={{
                                                overflow: "hidden",
                                                whiteSpace: "nowrap",
                                                textOverflow: "ellipsis",
                                                color: "text.secondary",
                                            }}
                                        >
                                            {truncateText(
                                                customer.dropoffLocation,
                                                25
                                            )}
                                        </Typography>
                                    </Tooltip>

                                    {/* Ghế */}
                                    <Typography
                                        sx={{
                                            color: "primary.main",
                                            fontWeight: 600,
                                            fontSize: "0.95rem",
                                        }}
                                    >
                                        {customer.seatNumbers}
                                    </Typography>
                                </Box>
                            ))}
                        </Paper>
                    </Box>
                )}
            </Box>
            {updateDialog && (
                <UpdateDriverBusDialog
                    open={updateDialog.open}
                    onClose={() => setUpdateDialog(null)}
                    type={updateDialog.type}
                    scheduleId={scheduleId}
                    currentBusType={driverInfo?.bus.busType}
                    onSuccess={() => {
                        setUpdateDialog(null);
                        refetchData();
                    }}
                />
            )}
        </Box>
    );
};

export default Details;
