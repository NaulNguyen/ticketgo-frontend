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

const Details: React.FC<DetailsProps> = ({ scheduleId }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [routeStops, setRouteStops] = useState<RouteStopsData | null>(null);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
    console.log(driverInfo);
    const [customers, setCustomers] = useState<Customer[]>([]);

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
                        label="Danh sách khách hàng"
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
                    <>
                        <Divider />
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                mt: 2,
                                mb: 3,
                                borderRadius: 2,
                                bgcolor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <Typography
                                variant="h6"
                                gutterBottom
                                fontWeight="bold"
                                color="primary"
                            >
                                Thông tin tài xế
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 3,
                                    mb: 2,
                                }}
                            >
                                <Avatar
                                    src={driverInfo.driver.imageUrl}
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        border: "3px solid #1976d2",
                                    }}
                                />
                                <Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        color="primary"
                                    >
                                        {driverInfo.driver.name}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <PhoneIcon color="primary" />
                                    <Typography>
                                        <strong>Số điện thoại:</strong>{" "}
                                        {driverInfo.driver.phoneNumber}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <BadgeIcon color="primary" />
                                    <Typography>
                                        <strong>Bằng lái:</strong>{" "}
                                        {driverInfo.driver.licenseNumber}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <LocationOnIcon color="primary" />
                                    <Typography>
                                        <strong>Nơi cấp:</strong>{" "}
                                        {driverInfo.driver.placeOfIssue}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <EventIcon color="primary" />
                                    <Typography>
                                        <strong>Ngày cấp:</strong>{" "}
                                        {new Date(
                                            driverInfo.driver.issueDate
                                        ).toLocaleDateString("vi-VN")}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <EventIcon color="primary" />
                                    <Typography>
                                        <strong>Ngày hết hạn:</strong>{" "}
                                        {new Date(
                                            driverInfo.driver.expiryDate
                                        ).toLocaleDateString("vi-VN")}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Bus Info */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                bgcolor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                    transform: "translateY(-2px)",
                                },
                            }}
                        >
                            <Typography
                                variant="h6"
                                gutterBottom
                                fontWeight="bold"
                                color="primary"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 3,
                                }}
                            >
                                <DirectionsBusIcon /> Thông tin xe
                            </Typography>

                            <Grid container spacing={3}>
                                {/* Bus Image */}
                                <Grid item xs={12} md={4}>
                                    <Box
                                        sx={{
                                            position: "relative",
                                            width: "100%",
                                            height: 200,
                                            borderRadius: 2,
                                            overflow: "hidden",
                                            boxShadow:
                                                "0 2px 12px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={driverInfo.bus.busImage}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                transition:
                                                    "transform 0.3s ease",
                                                "&:hover": {
                                                    transform: "scale(1.05)",
                                                },
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                {/* Bus Details */}
                                <Grid item xs={12} md={8}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 2,
                                        }}
                                    >
                                        {/* Bus Type and License */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography
                                                variant="h6"
                                                color="primary"
                                                sx={{ mb: 1 }}
                                                fontWeight="bold"
                                            >
                                                {driverInfo.bus.busType}
                                            </Typography>
                                            <Chip
                                                label={
                                                    driverInfo.bus.licensePlate
                                                }
                                                color="primary"
                                                variant="outlined"
                                                sx={{ fontWeight: "medium" }}
                                            />
                                        </Box>

                                        {/* Bus Specifications */}
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        bgcolor:
                                                            "primary.light",
                                                        borderRadius: 2,
                                                        height: "100%",
                                                    }}
                                                >
                                                    <Typography
                                                        color="primary.contrastText"
                                                        variant="subtitle2"
                                                    >
                                                        Số ghế
                                                    </Typography>
                                                    <Typography
                                                        color="primary.contrastText"
                                                        variant="h5"
                                                        fontWeight="bold"
                                                    >
                                                        {
                                                            driverInfo.bus
                                                                .totalSeats
                                                        }
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
                                                        height: "100%",
                                                    }}
                                                >
                                                    <Typography
                                                        color="secondary.contrastText"
                                                        variant="subtitle2"
                                                    >
                                                        Số tầng
                                                    </Typography>
                                                    <Typography
                                                        color="secondary.contrastText"
                                                        variant="h5"
                                                        fontWeight="bold"
                                                    >
                                                        {driverInfo.bus.floors}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>

                                        {/* Expiry Dates */}
                                        <Box sx={{ mt: 2 }}>
                                            <Typography
                                                variant="subtitle2"
                                                color="text.secondary"
                                                gutterBottom
                                            >
                                                Thông tin đăng kiểm và hạn sử
                                                dụng
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            border: "1px solid",
                                                            borderColor:
                                                                driverInfo.bus
                                                                    .registrationExpiringSoon
                                                                    ? "warning.main"
                                                                    : "divider",
                                                            borderRadius: 2,
                                                            bgcolor: driverInfo
                                                                .bus
                                                                .registrationExpiringSoon
                                                                ? "warning.lighter"
                                                                : "background.paper",
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            Hạn đăng kiểm
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            fontWeight="medium"
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
                                                <Grid item xs={12} sm={6}>
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            border: "1px solid",
                                                            borderColor:
                                                                driverInfo.bus
                                                                    .usageExpiringSoon
                                                                    ? "warning.main"
                                                                    : "divider",
                                                            borderRadius: 2,
                                                            bgcolor: driverInfo
                                                                .bus
                                                                .usageExpiringSoon
                                                                ? "warning.lighter"
                                                                : "background.paper",
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            Hạn sử dụng
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            fontWeight="medium"
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
                    </>
                )}

                {tabIndex === 4 && (
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
        </Box>
    );
};

export default Details;
