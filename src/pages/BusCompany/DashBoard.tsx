import React from "react";
import SideMenu from "../../components/BusCompany/SideMenu";
import { Header } from "../../components";
import { Box } from "@mui/material";
import StatisticsChart from "../../components/BusCompany/StatisticsChart ";

const DashBoard = () => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* Fixed Header */}
            <Box sx={{ position: "fixed", width: "100%", zIndex: 10 }}>
                <Header />
            </Box>

            {/* Main Content Area */}
            <Box sx={{ display: "flex", flexGrow: 1, marginTop: "64px" }}>
                {/* Side Menu */}
                <SideMenu />

                {/* Statistics Chart */}
                <Box sx={{ flexGrow: 1, padding: 3, overflow: "auto" }}>
                    <StatisticsChart />
                </Box>
            </Box>
        </Box>
    );
};

export default DashBoard;
