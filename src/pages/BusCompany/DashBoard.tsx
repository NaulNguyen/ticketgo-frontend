import React, { useEffect, useState } from "react";
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
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DriverManagement from "../../components/BusCompany/DriverManagement";
import ChatIcon from "@mui/icons-material/Chat";
import BusinessIcon from "@mui/icons-material/Business";
import BusCompanyChat from "../../components/BusCompany/BusCompanyChat";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import TicketManagement from "../../components/BusCompany/TicketManagement";
import BusCompanyManagement from "../../components/BusCompany/BusCompanyManagement";

const DashBoard = () => {
    const [selectedIndex, setSelectedIndex] = useState(() => {
        const savedIndex = localStorage.getItem("selectedTabIndex");
        return savedIndex ? parseInt(savedIndex) : 0;
    });
    const [statsOpen, setStatsOpen] = useState(() => {
        return localStorage.getItem("statsOpen") === "true";
    });
    const [selectedSubIndex, setSelectedSubIndex] = useState(() => {
        const savedSubIndex = localStorage.getItem("selectedSubIndex");
        return savedSubIndex ? parseInt(savedSubIndex) : 0;
    });
    const [drawerOpen, setDrawerOpen] = useState(true);

    useEffect(() => {
        localStorage.setItem("selectedTabIndex", selectedIndex.toString());
        localStorage.setItem("statsOpen", statsOpen.toString());
        localStorage.setItem("selectedSubIndex", selectedSubIndex.toString());
    }, [selectedIndex, statsOpen, selectedSubIndex]);

    const menuItems = [
        { text: "Báo cáo thống kê", icon: <StackedLineChartIcon /> },
        { text: "Thông tin nhà xe", icon: <BusinessIcon /> },
        { text: "Quản lý xe", icon: <DirectionsBusIcon /> },
        { text: "Quản lý tuyến xe", icon: <RouteIcon /> },
        { text: "Quản lý khuyến mãi", icon: <LocalOfferIcon /> },
        { text: "Quản lý tài khoản khách hàng", icon: <AccountCircleIcon /> },
        { text: "Quản lý tài xế", icon: <PeopleIcon /> },
        { text: "Chat với khách hàng", icon: <ChatIcon /> },
        { text: "Quản lý đặt vé", icon: <ConfirmationNumberIcon /> },
    ];

    const handleListItemClick = (index: number) => {
        setSelectedIndex(index);
        // Nếu click vào tab khác, đóng stats menu
        if (index !== 0) {
            setStatsOpen(false);
        }
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
                return <BusCompanyManagement />;
            case 2:
                return <BusManagement />;
            case 3:
                return <BusRouteManagement />;
            case 4:
                return <VoucherManagement />;
            case 5:
                return <UserAccountManagement />;
            case 6:
                return <DriverManagement />;
            case 7:
                return <BusCompanyChat />;
            case 8:
                return <TicketManagement />;
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
                        }}
                    >
                        <List
                            sx={{
                                paddingTop: "100px",
                            }}
                        >
                            {menuItems.map(({ text, icon }, index) => {
                                if (text === "Báo cáo thống kê") {
                                    return (
                                        <React.Fragment key={text}>
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    onClick={() =>
                                                        setStatsOpen(!statsOpen)
                                                    }
                                                    sx={{ color: "white" }}
                                                >
                                                    <ListItemIcon
                                                        sx={{
                                                            minWidth: "32px",
                                                            color: "white",
                                                        }}
                                                    >
                                                        {icon}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={text}
                                                        sx={{ color: "white" }}
                                                    />
                                                    {statsOpen ? (
                                                        <ExpandLess />
                                                    ) : (
                                                        <ExpandMore />
                                                    )}
                                                </ListItemButton>
                                            </ListItem>
                                            <Collapse
                                                in={statsOpen}
                                                timeout="auto"
                                                unmountOnExit
                                            >
                                                <List
                                                    component="div"
                                                    disablePadding
                                                >
                                                    {[
                                                        "Thống kê theo ngày",
                                                        "Thống kê theo tháng",
                                                        "Thống kê theo năm",
                                                    ].map(
                                                        (subText, subIndex) => (
                                                            <ListItem
                                                                key={subText}
                                                                disablePadding
                                                            >
                                                                <ListItemButton
                                                                    selected={
                                                                        selectedIndex ===
                                                                            index &&
                                                                        selectedSubIndex ===
                                                                            subIndex
                                                                    }
                                                                    onClick={() =>
                                                                        handleStatsClick(
                                                                            subIndex
                                                                        )
                                                                    }
                                                                    sx={{
                                                                        pl: 4,
                                                                        color: "white",
                                                                        "&.Mui-selected":
                                                                            {
                                                                                backgroundColor:
                                                                                    "#1565c0",
                                                                                "&:hover":
                                                                                    {
                                                                                        backgroundColor:
                                                                                            "#1976d2",
                                                                                    },
                                                                            },
                                                                    }}
                                                                >
                                                                    <ListItemText
                                                                        primary={
                                                                            subText
                                                                        }
                                                                        sx={{
                                                                            color: "white",
                                                                        }}
                                                                    />
                                                                    {selectedIndex ===
                                                                        index &&
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
                                                        )
                                                    )}
                                                </List>
                                            </Collapse>
                                        </React.Fragment>
                                    );
                                }

                                return (
                                    <ListItem
                                        key={text}
                                        disablePadding
                                        onClick={() =>
                                            handleListItemClick(index)
                                        }
                                    >
                                        <ListItemButton
                                            selected={selectedIndex === index}
                                            sx={{
                                                color: "white",
                                                "&.Mui-selected": {
                                                    backgroundColor: "#1565c0",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "#1976d2",
                                                    },
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: "32px",
                                                    color: "white",
                                                }}
                                            >
                                                {icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={text}
                                                sx={{ color: "white" }}
                                            />
                                            {selectedIndex === index && (
                                                <Box
                                                    sx={{
                                                        width: "4px",
                                                        height: "60%",
                                                        position: "absolute",
                                                        top: 9,
                                                        right: 5,
                                                        backgroundColor:
                                                            "white",
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
                    }}
                >
                    {renderComponent()}
                </Box>
            </Box>
        </Box>
    );
};

export default DashBoard;
