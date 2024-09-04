// Register.tsx
import React, { useState } from "react";
import { Container, Box, Tabs, Tab } from "@mui/material";
import UserRegistration from "../components/User/UserRegister";
import CompanyRegistration from "../components/Company/CompanyRegister";

const Register: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleUserSubmit = (values: any) => {
        console.log("User Form data:", values);
    };

    const handleCompanySubmit = (values: any) => {
        console.log("Company Form data:", values);
    };

    return (
        <Container
            maxWidth="sm"
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
            }}>
            <Box
                sx={{
                    height: "100%",
                    maxWidth: "600px",
                    borderRadius: "10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    border: "1px solid #ccc",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    bgcolor: "#fff",
                    padding: "20px",
                    margin: "auto",
                    position: "relative",
                }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    aria-label="register tabs"
                    textColor="primary"
                    variant="fullWidth"
                    indicatorColor="primary"
                    sx={{ width: "100%", marginBottom: "16px" }}>
                    <Tab label="Đăng ký người dùng" />
                    <Tab label="Đăng ký nhà xe" />
                </Tabs>
                <Box sx={{ width: "100%" }}>
                    {activeTab === 0 ? (
                        <UserRegistration onSubmit={handleUserSubmit} />
                    ) : (
                        <CompanyRegistration onSubmit={handleCompanySubmit} />
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default Register;
