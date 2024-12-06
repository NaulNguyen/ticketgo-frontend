import React, { useState } from "react";
import {
    Header,
    StatisticsChart,
    BusManagement,
    BusRouteManagement,
    VoucherManagement,
    UserAccountManagement,
} from "../../components";
import {
    Box,
    Collapse,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import StackedLineChartIcon from "@mui/icons-material/StackedLineChart";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import RouteIcon from "@mui/icons-material/Route";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PeopleIcon from "@mui/icons-material/People";

const DashBoard = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [statsOpen, setStatsOpen] = useState(false);
    const [selectedSubIndex, setSelectedSubIndex] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(true);

    const menuItems = [
        { text: "Báo cáo thống kê", icon: <StackedLineChartIcon /> },
        { text: "Quản lý xe", icon: <DirectionsBusIcon /> },
        { text: "Quản lý tuyến xe", icon: <RouteIcon /> },
        { text: "Quản lý khuyến mãi", icon: <LocalOfferIcon /> },
        { text: "Quản lý tài khoản khách hàng", icon: <PeopleIcon /> },
    ];

    const handleListItemClick = (index: number) => {
        setSelectedIndex(index);
    };

    const handleStatsClick = (subIndex: number) => {
        setSelectedSubIndex(subIndex);
        setSelectedIndex(0);
    };

    const renderComponent = () => {
        switch (selectedIndex) {
            case 0:
                return <StatisticsChart selectedSubIndex={selectedSubIndex} />;
            case 1:
                return <BusManagement />;
            case 2:
                return <BusRouteManagement />;
            case 3:
                return <VoucherManagement />;
            case 4:
                return <UserAccountManagement />;
            default:
                return <StatisticsChart selectedSubIndex={selectedSubIndex} />;
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* Fixed Header */}
            <Box sx={{ position: "fixed", width: "100%", zIndex: 10 }}>
                <Header onToggleDrawer={() => setDrawerOpen(!drawerOpen)} />
            </Box>

            {/* Main Content Area */}
            <Box sx={{ display: "flex", flexGrow: 1, marginTop: "64px" }}>
                {/* Side Menu */}
                <Box sx={{ display: "flex" }}>
                    <Drawer
                        variant="permanent"
                        sx={{
                            width: drawerOpen ? 240 : 0,
                            flexShrink: 0,
                            zIndex: 0,
                            transition: "width 0.3s",
                            [`& .MuiDrawer-paper`]: {
                                width: drawerOpen ? 240 : 0,
                                boxSizing: "border-box",
                                bgcolor: "#0d47a1",
                                color: "white",
                                overflowY: "auto",
                                transition: "width 0.3s",
                                "&::-webkit-scrollbar": {
                                    width: "0px",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: "rgba(0,0,0,0.1)",
                                },
                            },
                        }}>
                        <List
                            sx={{
                                paddingTop: "100px",
                            }}>
                            {menuItems.map(({ text, icon }, index) => {
                                if (text === "Báo cáo thống kê") {
                                    return (
                                        <React.Fragment key={text}>
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    onClick={() => setStatsOpen(!statsOpen)}
                                                    sx={{ color: "white" }}>
                                                    <ListItemIcon
                                                        sx={{ minWidth: "32px", color: "white" }}>
                                                        {icon}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={text}
                                                        sx={{ color: "white" }}
                                                    />
                                                    {statsOpen ? <ExpandLess /> : <ExpandMore />}
                                                </ListItemButton>
                                            </ListItem>
                                            <Collapse in={statsOpen} timeout="auto" unmountOnExit>
                                                <List component="div" disablePadding>
                                                    {[
                                                        "Thống kê theo ngày",
                                                        "Thống kê theo tháng",
                                                        "Thống kê theo năm",
                                                    ].map((subText, subIndex) => (
                                                        <ListItem key={subText} disablePadding>
                                                            <ListItemButton
                                                                selected={
                                                                    selectedIndex === index &&
                                                                    selectedSubIndex === subIndex
                                                                }
                                                                onClick={() =>
                                                                    handleStatsClick(subIndex)
                                                                }
                                                                sx={{
                                                                    pl: 4,
                                                                    color: "white",
                                                                    "&.Mui-selected": {
                                                                        backgroundColor: "#1565c0",
                                                                        "&:hover": {
                                                                            backgroundColor:
                                                                                "#1976d2",
                                                                        },
                                                                    },
                                                                }}>
                                                                <ListItemText
                                                                    primary={subText}
                                                                    sx={{ color: "white" }}
                                                                />
                                                                {selectedIndex === index &&
                                                                    selectedSubIndex ===
                                                                        subIndex && (
                                                                        <Box
                                                                            sx={{
                                                                                width: "4px",
                                                                                height: "60%",
                                                                                position:
                                                                                    "absolute",
                                                                                top: 9,
                                                                                right: 5,
                                                                                backgroundColor:
                                                                                    "white",
                                                                            }}
                                                                        />
                                                                    )}
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Collapse>
                                        </React.Fragment>
                                    );
                                }

                                return (
                                    <ListItem
                                        key={text}
                                        disablePadding
                                        onClick={() => handleListItemClick(index)}>
                                        <ListItemButton
                                            selected={selectedIndex === index}
                                            sx={{
                                                color: "white",
                                                "&.Mui-selected": {
                                                    backgroundColor: "#1565c0",
                                                    "&:hover": {
                                                        backgroundColor: "#1976d2",
                                                    },
                                                },
                                            }}>
                                            <ListItemIcon sx={{ minWidth: "32px", color: "white" }}>
                                                {icon}
                                            </ListItemIcon>
                                            <ListItemText primary={text} sx={{ color: "white" }} />
                                            {selectedIndex === index && (
                                                <Box
                                                    sx={{
                                                        width: "4px",
                                                        height: "60%",
                                                        position: "absolute",
                                                        top: 9,
                                                        right: 5,
                                                        backgroundColor: "white",
                                                    }}
                                                />
                                            )}
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Drawer>
                </Box>

                {/* Content Area */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        padding: 3,
                        overflow: "auto",
                        transition: "margin-left 0.3s",
                        width: "100%",
                    }}>
                    {renderComponent()}
                </Box>
            </Box>
        </Box>
    );
};

export default DashBoard;
