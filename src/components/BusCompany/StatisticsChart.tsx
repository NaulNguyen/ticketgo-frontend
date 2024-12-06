import React, { useState, useEffect } from "react";
import {
    ComposedChart,
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
            const baseUrl = "https://ticketgo-app-a139ba17185b.herokuapp.com/api/v1/revenues";
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
        if (activeTab === "monthly") {
            return new Date(date).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
            });
        } else if (activeTab === "yearly") {
            return `Năm ${date}`;
        }
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
                    borderRadius: 2,
                    p: 2,
                    boxShadow: 3,
                    minWidth: 200,
                }}>
                <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: "bold", borderBottom: 1, pb: 1, borderColor: "grey.300" }}>
                    {activeTab === "yearly"
                        ? "Năm: "
                        : activeTab === "monthly"
                        ? "Tháng: "
                        : "Ngày: "}
                    {formatDate(label || "")}
                </Typography>
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body1" sx={{ mb: 1, color: "#4a90e2" }}>
                        <strong>Doanh thu:</strong> {formatCurrency(payload[0].value)}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#82ca9d" }}>
                        <strong>Vé đã bán:</strong> {payload[1].value}
                    </Typography>
                </Box>
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

    // Tính toán interval dựa trên số lượng dữ liệu
    const calculateInterval = () => {
        if (activeTab === "daily" && data.length > 15) {
            return Math.floor(data.length / 15); // Hiển thị khoảng 15 điểm dữ liệu
        }
        return 0; // Hiển thị tất cả điểm dữ liệu cho monthly và yearly
    };

    return (
        <Box sx={{ p: 4, width: "100%" }}>
            {renderDateInputs()}
            {loading ? (
                <Box display="flex" justifyContent="center">
                    <CircularProgress />
                </Box>
            ) : data.length > 0 ? (
                <ResponsiveContainer width="100%" height={500}>
                    <ComposedChart
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
                            interval={calculateInterval()}
                            angle={data.length <= 5 ? 0 : -45}
                            textAnchor="end"
                            height={60}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{
                                paddingTop: "10px",
                            }}
                        />
                        <Bar
                            yAxisId="left"
                            dataKey="totalRevenue"
                            fill="#4a90e2"
                            name="Doanh thu"
                            barSize={30}
                        />
                        <Bar
                            yAxisId="right"
                            dataKey="totalTicketsSold"
                            fill="#82ca9d"
                            name="Vé đã bán"
                            barSize={30}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="totalRevenue"
                            stroke="#0047ab"
                            strokeWidth={3}
                            name="Xu hướng doanh thu"
                            dot={activeTab === "yearly" ? false : { r: 5, fill: "#0047ab" }}
                            activeDot={activeTab === "yearly" ? false : { r: 8, fill: "#2171cd" }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="totalTicketsSold"
                            stroke="#008000"
                            strokeWidth={3}
                            name="Xu hướng vé bán"
                            dot={activeTab === "yearly" ? false : { r: 5, fill: "#008000" }}
                            activeDot={activeTab === "yearly" ? false : { r: 8, fill: "#4d9d6a" }}
                        />
                    </ComposedChart>
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
