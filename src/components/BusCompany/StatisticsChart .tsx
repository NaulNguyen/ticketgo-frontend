import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Box, CircularProgress, Typography, Tab, Tabs } from "@mui/material";
import { axiosWithJWT } from "../../config/axiosConfig";

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

const StatisticsChart = () => {
    const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "yearly">("daily");
    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState("2024-11-01");
    const [endDate, setEndDate] = useState("2024-11-30");
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = "";
            if (activeTab === "daily") {
                url = `http://localhost:8080/api/v1/revenues/statistics-daily?startDate=2024-11-01&endDate=2024-11-30`;
            } else if (activeTab === "monthly") {
                url = `http://localhost:8080/api/v1/revenues/statistics-monthly?year=2024`;
            } else {
                url = `http://localhost:8080/api/v1/revenues/statistics-yearly?year=2024`;
            }

            const response = await axiosWithJWT.get(url);
            setData(response.data.data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: "daily" | "monthly" | "yearly") => {
        setActiveTab(newValue);
    };

    const formatCurrency = (value: any) =>
        new Intl.NumberFormat("vn-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);

        const formatDate = (date: any) => {
            const options = { year: "numeric" as const, month: "short" as const, day: "numeric" as const };
            return new Date(date).toLocaleDateString("vi-VN", options); // Ensure this matches the format
        };

    const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        padding: "10px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                    }}>
                    <p style={{ margin: 0, fontWeight: "bold" }}>Ngày: {formatDate(label)}</p>
                    <p style={{ margin: 0 }}>Doanh thu: {formatCurrency(payload[0].value)}</p>
                    <p style={{ margin: 0 }}>Vé đã bán: {payload[1].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                centered
            >
                <Tab value="daily" label="Daily" />
                <Tab value="monthly" label="Monthly" />
                <Tab value="yearly" label="Yearly" />
            </Tabs>
            {loading ? (
                <CircularProgress />
            ) : data.length > 0 ? (
                <ResponsiveContainer width="100%" height={500}>
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 10,
                        }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                        <XAxis
                            dataKey="period"
                            tickFormatter={formatDate}
                            interval={0}
                            textAnchor="end"
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{
                                paddingTop: "10px",
                            }}
                        />
                        <Bar
                            dataKey="totalRevenue"
                            fill="#8884d8"
                            name="Doanh thu"
                            barSize={30}
                        />
                        <Bar
                            dataKey="totalTicketsSold"
                            fill="#82ca9d"
                            name="Vé đã bán"
                            barSize={30}
                        />
                        <Line
                            type="monotone"
                            dataKey="totalRevenue"
                            stroke="#ff7300"
                            strokeWidth={2}
                            name="Xu hướng doanh thu"
                            isAnimationActive={true}
                            animationDuration={1500}
                            dot={{ r: 5, fill: "#ff7300" }}
                            activeDot={{ r: 8, fill: "#ff0000" }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <Typography>No data available for the selected range.</Typography>
            )}
        </Box>
    );
};

export default StatisticsChart;
