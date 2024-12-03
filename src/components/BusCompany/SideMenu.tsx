import React, { useState, useEffect } from "react";
import {
    Avatar,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import GroupsIcon from "@mui/icons-material/Groups";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { axiosWithJWT } from "../../config/axiosConfig";

interface AdminData {
    busCompanyName: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    description: string;
    email: string;
    imageUrl: string;
    role: string;
}

const SideMenu = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    const [adminData, setAdminData] = useState<AdminData | null>(null);
    
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const res = await axiosWithJWT.get("http://localhost:8080/api/v1/users/me");
                setAdminData(res.data.data);
            } catch (err: any) {
                console.error("Error fetching admin data:", err);
            }
        };
        fetchAdminData();
    }, [])


    const menuItems = [
        { text: "Báo cáo thống kê", icon: <HomeIcon />, path: "/" },
        { text: "Quản lý xe", icon: <GroupsIcon />, path: "/users" },
        { text: "Quản lý tuyến xe", icon: <CategoryIcon />, path: "/products" },
        { text: "Quản lý khuyến mãi", icon: <CategoryIcon />, path: "/products" },
        { text: "Quản lý tài khoản khách hàng", icon: <CategoryIcon />, path: "/products" },
    ];

    useEffect(() => {
        const currentPath = location.pathname;
        const currentIndex = menuItems.findIndex((item) => item.path === currentPath);
        setSelectedIndex(currentIndex);
    }, [location.pathname]);

    const handleListItemClick = (index: number, path: string) => {
        setSelectedIndex(index);
        navigate(path);
    };

    return (
        <Box sx={{ display: "flex" }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    zIndex: 0,
                    transition: "width 0.3s",
                    [`& .MuiDrawer-paper`]: {
                        width: 240,
                        boxSizing: "border-box",
                        bgcolor: "#0d47a1",
                        color: "white",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": {
                            width: "0px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "rgba(0,0,0,0.1)",
                        },
                    },
                }}>
                <List sx={{
                    paddingTop: '100px'
                }}>
                    {menuItems.map(({ text, icon, path }, index) => (
                        <ListItem key={text} disablePadding onClick={() => handleListItemClick(index, path)}>
                        <ListItemButton selected={selectedIndex === index} sx={{ color: "white" }}>
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
                    ))}
                </List>

                <Toolbar
                    sx={{
                        bgcolor: "#0070ff",
                        borderRadius: "5px",
                        boxSizing: "border-box",
                        marginX: "17px",
                        bottom: "20px",
                        position: "absolute",
                        width: "calc(100% - 34px)",
                    }}>
                    <Avatar src={adminData?.imageUrl}/>
                    <Box gap={2} ml={1}>
                        <Typography fontWeight={700}>{adminData?.busCompanyName}</Typography>
                        <Typography fontSize={12}>{adminData?.contactEmail}</Typography>
                    </Box>
                </Toolbar>
            </Drawer>
        </Box>
    );
};

export default SideMenu;