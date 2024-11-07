import {
    Box,
    Divider,
    Grid,
    List,
    ListItem,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import TranslateIcon from "@mui/icons-material/Translate";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import HardwareIcon from "@mui/icons-material/Hardware";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import CurtainsIcon from "@mui/icons-material/Curtains"; 
import SpeakerIcon from "@mui/icons-material/Speaker";
import WifiIcon from "@mui/icons-material/Wifi";
import AcUnitIcon from "@mui/icons-material/AcUnit";
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

const Details: React.FC<DetailsProps> = ({ scheduleId }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [routeStops, setRouteStops] = useState<RouteStopsData | null>(null);
    const [policies, setPolicies] = useState<Policy[]>([]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    useEffect(() => {
        const fetchRouteStops = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/v1/route-stops?scheduleId=${scheduleId}`);
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
                    const response = await axios.get('http://localhost:8080/api/v1/policies');
                    setPolicies(response.data.data); 
                } catch (err) {
                    console.error('Failed to fetch policies', err);
                } 
            };
          fetchPolicies();
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
                        <Typography variant="h6" color="primary" fontSize={16} fontWeight={600} mt={2}>
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
                                    fontWeight={700}
                                >
                                    Điểm đón
                                </Typography>
                                <Box
                                    sx={{
                                        maxHeight: '440px', 
                                        overflowY: 'auto',  
                                        paddingRight: '10px', 
                                    }}
                                    >
                                    {routeStops.pickup.map((stop, index) => {
                                        const arrivalTime = new Date(stop.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                        return (
                                        <Typography key={index} display="flex" alignItems="center" sx={{ paddingTop: '13px' }}>
                                            <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
                                            {arrivalTime}
                                            </span>
                                            <span style={{ marginRight: '8px' }}>•</span>
                                            <span style={{width : "190px"}}>{stop.location}</span>
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
                                        maxHeight: '440px', 
                                        overflowY: 'auto',  
                                        paddingRight: '10px', 
                                    }}
                                    >
                                    {routeStops.dropoff.map((stop, index) => {
                                        const arrivalTime = new Date(stop.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                        return (
                                        <Typography key={index} display="flex" alignItems="center" sx={{ paddingTop: '13px' }}>
                                            <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
                                            {arrivalTime}
                                            </span>
                                            <span style={{ marginRight: '8px' }}>•</span>
                                            <span style={{width : "190px"}}>{stop.location}</span>
                                        </Typography>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {tabIndex === 1 &&
                    <Box>
                        <Divider />
                        <Typography variant="h6" fontSize={18} fontWeight={700} mb={2} mt={3}>
                            Chính sách nhà xe
                        </Typography>
                        {policies.length > 0 &&
                            policies.map((policy, index) => (
                                <>
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
                                    <Divider />
                                </>
                            ))
                        }
                    </Box>
                }

                {tabIndex === 2 && (
                    <Box>
                        <Box sx={{ backgroundColor: "rgb(245, 245, 245)", borderRadius: "20px" }}>
                            <Box fontSize={14} padding={2}>
                                <Box display="flex">
                                    <TranslateIcon sx={{ marginX: "8px", color: "blue" }} />
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Nhân viên sử dụng tiếng Anh
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary" paddingTop={1}>
                                    Nhân viên phòng vé, tài xế, phụ xe có thể giao tiếp bằng tiếng
                                    Anh với hành khách.
                                </Typography>
                            </Box>
                            <Divider />
                            <Box fontSize={14} padding={2}>
                                <Box display="flex">
                                    <HealthAndSafetyIcon sx={{ marginX: "8px", color: "blue" }} />
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Dây đai an toàn
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary" paddingTop={1}>
                                    Trên xe có trang bị dây đai an toàn cho hành khách khi ngồi trên
                                    xe
                                </Typography>
                            </Box>
                            <Divider />
                            <Box fontSize={14} padding={2}>
                                <Box display="flex">
                                    <WaterDropIcon sx={{ marginX: "8px", color: "blue" }} />
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Nước uống
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary" paddingTop={1}>
                                    Nhà xe có phục vụ nước cho hành khách
                                </Typography>
                            </Box>
                            <Divider />
                            <Box fontSize={14} padding={2}>
                                <Box display="flex">
                                    <HardwareIcon sx={{ marginX: "8px", color: "blue" }} />
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Búa phá kính
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary" paddingTop={1}>
                                    Dùng để phá kính ô tô thoát hiểm trong trường hợp khẩn cấp.
                                </Typography>
                            </Box>
                        </Box>
                        <Box padding={2}>
                            <Grid container spacing={2} columns={3}>
                                <Grid
                                    item
                                    xs={1}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center">
                                    <BatteryChargingFullIcon fontSize="large" />
                                    <Typography>Sạc điện thoại</Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={1}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center">
                                    <CurtainsIcon fontSize="large" />
                                    <Typography>Rèm cửa</Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={1}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center">
                                    <SpeakerIcon fontSize="large" />
                                    <Typography>Dàn âm thanh (Loa)</Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={1}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center">
                                    <WifiIcon fontSize="large" />
                                    <Typography>Wifi</Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={1}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center">
                                    <AcUnitIcon fontSize="large" />
                                    <Typography>Điều hòa</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Details;
