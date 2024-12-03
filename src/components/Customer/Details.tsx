import { Box, Divider, List, ListItem, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import TranslateIcon from "@mui/icons-material/Translate";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import HardwareIcon from "@mui/icons-material/Hardware";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import WbIncandescentIcon from "@mui/icons-material/WbIncandescent";
import BedIcon from "@mui/icons-material/Bed";
import axios from "axios";

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

const amenityIcons: { [key: string]: React.ReactNode } = {
    "Nhân viên sử dụng tiếng anh": <TranslateIcon sx={{ marginX: "8px", color: "blue" }} />,
    "Ghế massage": <HealthAndSafetyIcon sx={{ marginX: "8px", color: "blue" }} />,
    "Bánh ngọt": <FastfoodIcon sx={{ marginX: "8px", color: "blue" }} />,
    "Đèn đọc sách": <WbIncandescentIcon sx={{ marginX: "8px", color: "blue" }} />,
    "Nước uống": <WaterDropIcon sx={{ marginX: "8px", color: "blue" }} />,
    "Gối nằm": <BedIcon sx={{ marginX: "8px", color: "blue" }} />,
    "Búa phá kính": <HardwareIcon sx={{ marginX: "8px", color: "blue" }} />,
};

const Details: React.FC<DetailsProps> = ({ scheduleId }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [routeStops, setRouteStops] = useState<RouteStopsData | null>(null);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [amenities, setAmenities] = useState<Amenity[]>([]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    useEffect(() => {
        const fetchRouteStops = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/api/v1/route-stops?scheduleId=${scheduleId}`
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
                        "http://localhost:8080/api/v1/policies"
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
                        "http://localhost:8080/api/v1/amenities"
                    );
                    setAmenities(response.data.data);
                } catch (err) {
                    console.error("Failed to fetch amenities", err);
                }
            };
            fetchAmenities();
        }
    }, [tabIndex]);

    return (
        <Box>
            {/* Tabs */}
            <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Details tabs" centered>
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
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ px: 3, pb: 3, minHeight: "500px" }}>
                {tabIndex === 0 && routeStops && (
                    <Box>
                        <Divider />
                        <Typography
                            variant="h6"
                            color="primary"
                            fontSize={16}
                            fontWeight={600}
                            mt={2}>
                            Lưu ý
                        </Typography>
                        <Typography>
                            Các mốc thời gian đón, trả bên dưới là thời gian dự kiến.
                        </Typography>
                        <Typography>Lịch này có thể thay đổi tùy tình hình thực tế.</Typography>
                        <Box display="flex" justifyContent="space-around" alignContent="center">
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ mt: 2 }}
                                    fontSize={18}
                                    fontWeight={700}>
                                    Điểm đón
                                </Typography>
                                <Box
                                    sx={{
                                        maxHeight: "440px",
                                        overflowY: "auto",
                                        paddingRight: "10px",
                                    }}>
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
                                                sx={{ paddingTop: "13px" }}>
                                                <span
                                                    style={{
                                                        fontWeight: "bold",
                                                        marginRight: "8px",
                                                    }}>
                                                    {arrivalTime}
                                                </span>
                                                <span style={{ marginRight: "8px" }}>•</span>
                                                <span style={{ width: "190px" }}>
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
                                    fontWeight={700}>
                                    Điểm trả
                                </Typography>
                                <Box
                                    sx={{
                                        maxHeight: "440px",
                                        overflowY: "auto",
                                        paddingRight: "10px",
                                    }}>
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
                                                sx={{ paddingTop: "13px" }}>
                                                <span
                                                    style={{
                                                        fontWeight: "bold",
                                                        marginRight: "8px",
                                                    }}>
                                                    {arrivalTime}
                                                </span>
                                                <span style={{ marginRight: "8px" }}>•</span>
                                                <span style={{ width: "190px" }}>
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
                        <Typography variant="h6" fontSize={18} fontWeight={700} mb={2} mt={3}>
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
                                    }}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ mt: 2, color: "rgba(0, 0, 0, 0.65)" }}
                                        fontSize={16}
                                        fontWeight={700}
                                        key={index}>
                                        {policy.policyType}
                                    </Typography>
                                    <List style={{ paddingLeft: "1.5rem", lineHeight: "1.6" }}>
                                        {policy.policyContent.split("\n").map((line, lineIndex) => (
                                            <ListItem key={lineIndex}>{line}</ListItem>
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
                                }}>
                                <Box display="flex">
                                    {amenityIcons[amenity.name] || (
                                        <TranslateIcon sx={{ marginX: "8px", color: "blue" }} />
                                    )}
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {amenity.name}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary" paddingTop={1}>
                                    {amenity.description}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Details;
