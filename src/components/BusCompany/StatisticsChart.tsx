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
import { Box, CircularProgress, Typography, TextField, Stack } from "@mui/material";
import { axiosWithJWT } from "../../config/axiosConfig";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import viLocale from "date-fns/locale/vi";

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

interface StatisticsChartProps {
    selectedSubIndex: number;
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({ selectedSubIndex }) => {
    const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "yearly">("daily");
    const [data, setData] = useState<any[]>([]);
    const [startDate, setStartDate] = useState("2024-11-01");
    const [endDate, setEndDate] = useState("2024-11-30");
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(2024);

    const fetchData = async () => {
        setLoading(true);
        try {
            const baseUrl = "http://localhost:8080/api/v1/revenues";
            let url = "";

            switch (activeTab) {
                case "daily":
                    url = `${baseUrl}/statistics-daily?startDate=${startDate}&endDate=${endDate}`;
                    break;
                case "monthly":
                    url = `${baseUrl}/statistics-monthly?year=${selectedYear}`;
                    break;
                case "yearly":
                    url = `${baseUrl}/statistics-yearly?year=${selectedYear}`;
                    break;
            }

            const response = await axiosWithJWT.get(url);
            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching statistics data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, startDate, endDate, selectedYear]);

    useEffect(() => {
        const tabMap: Record<number, "daily" | "monthly" | "yearly"> = {
            0: "daily",
            1: "monthly",
            2: "yearly",
        };
        setActiveTab(tabMap[selectedSubIndex] || "daily");
    }, [selectedSubIndex]);

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;

        return (
            <Box
                sx={{
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "grey.300",
                    borderRadius: 1,
                    p: 1.5,
                    boxShadow: 2,
                }}>
                <Typography variant="subtitle2" gutterBottom>
                    Ngày: {formatDate(label || "")}
                </Typography>
                <Typography variant="body2">
                    Doanh thu: {formatCurrency(payload[0].value)}
                </Typography>
                <Typography variant="body2">Vé đã bán: {payload[1].value}</Typography>
            </Box>
        );
    };

    const renderDateInputs = () => {
        if (activeTab === "daily") {
            return (
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                        <DatePicker
                            label="Từ ngày"
                            value={new Date(startDate)}
                            onChange={(newValue) => {
                                if (newValue) {
                                    setStartDate(newValue.toISOString().split("T")[0]);
                                }
                            }}
                        />
                        <DatePicker
                            label="Đến ngày"
                            value={new Date(endDate)}
                            onChange={(newValue) => {
                                if (newValue) {
                                    setEndDate(newValue.toISOString().split("T")[0]);
                                }
                            }}
                        />
                    </Stack>
                </LocalizationProvider>
            );
        } else {
            return (
                <TextField
                    type="number"
                    label="Năm"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    sx={{ mb: 3 }}
                />
            );
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            {renderDateInputs()}
            {loading ? (
                <Box display="flex" justifyContent="center">
                    <CircularProgress />
                </Box>
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
                        <Bar dataKey="totalRevenue" fill="#8884d8" name="Doanh thu" barSize={30} />
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
                <Typography variant="h6" textAlign="center">
                    Không có dữ liệu cho khoảng thời gian đã chọn
                </Typography>
            )}
        </Box>
    );
};

export default StatisticsChart;
