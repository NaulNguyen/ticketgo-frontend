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
    Pie,
    PieChart,
    Cell,
} from "recharts";
import {
    Box,
    CircularProgress,
    Typography,
    TextField,
    Stack,
    Tabs,
    Tab,
    Grid,
    Paper,
    Card,
    CardContent,
    IconButton,
} from "@mui/material";
import { axiosWithJWT } from "../../config/axiosConfig";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { vi } from "date-fns/locale";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

interface TabPanelProps {
    children?: React.ReactNode;
    value: number;
    index: number;
}

interface StatisticsChartProps {
    selectedSubIndex: number;
}

interface RouteStatistics {
    routeName: string;
    totalRevenue: number;
    totalBookings: number;
    uniqueCustomers: number;
}

interface BusTypeStats {
    busType: string;
    totalRevenue: number;
    totalBookings: number;
    averageOccupancyRate: number;
}

interface CustomerStatistics {
    newCustomers: number;
    returningCustomers: number;
    averageBookingsPerCustomer: number;
}

interface OverallStats {
    totalRevenue: number;
    totalTicketsSold: number;
    totalBookings: number;
    totalCancellations: number;
    averageTicketPrice: number;
}

interface StatisticsData {
    revenue: Array<{
        period: string;
        totalRevenue: number;
        totalTicketsSold: number;
    }>;
    routeStatistics: RouteStatistics[];
    busTypeStatistics: {
        stats: BusTypeStats[];
    };
    customerStatistics: CustomerStatistics;
    overallStats: OverallStats;
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({
    selectedSubIndex,
}) => {
    const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "yearly">(
        "daily"
    );
    const [data, setData] = useState<any[]>([]);
    const [startDate, setStartDate] = useState("2025-05-01");
    const [endDate, setEndDate] = useState("2025-05-30");
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(2025);
    const [statistics, setStatistics] = useState<StatisticsData | null>(null);
    const [chartTab, setChartTab] = useState(0);
    const COLORS = [
        "#0088FE",
        "#00C49F",
        "#FFBB28",
        "#FF8042",
        "#8884d8",
        "#82ca9d",
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const baseUrl = "https://ticketgo.site/api/v2/revenues";
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
            setStatistics(response.data.data);
            setData(response.data.data.revenue);
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

    const handleChartTabChange = (
        event: React.SyntheticEvent,
        newValue: number
    ) => {
        setChartTab(newValue);
    };

    const formatDate = (date: string): string => {
        if (activeTab === "monthly") {
            // Format for monthly: "Tháng MM/YYYY"
            return new Date(date).toLocaleDateString("vi-VN", {
                month: "long",
                year: "numeric",
            });
        } else if (activeTab === "yearly") {
            return `Năm ${date}`;
        } else {
            // Format for daily: "DD/MM" (without year)
            return new Date(date).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
            });
        }
    };

    const CustomTooltip: React.FC<CustomTooltipProps> = ({
        active,
        payload,
        label,
    }) => {
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
                }}
            >
                <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{
                        fontWeight: "bold",
                        borderBottom: 1,
                        pb: 1,
                        borderColor: "grey.300",
                    }}
                >
                    {activeTab === "yearly"
                        ? "Năm: "
                        : activeTab === "monthly"
                        ? "Tháng: "
                        : "Ngày: "}
                    {formatDate(label || "")}
                </Typography>
                <Box sx={{ mt: 1 }}>
                    <Typography
                        variant="body1"
                        sx={{ mb: 1, color: "#4a90e2" }}
                    >
                        <strong>Doanh thu:</strong>{" "}
                        {formatCurrency(payload[0].value)}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#82ca9d" }}>
                        <strong>Vé đã bán:</strong> {payload[1].value}
                    </Typography>
                </Box>
            </Box>
        );
    };

    const StatCard = ({
        title,
        value,
        trend,
        isUp,
    }: {
        title: string;
        value: string | number;
        trend: string;
        isUp: boolean;
    }) => (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                transition: "transform 0.2s",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 2,
                },
            }}
        >
            <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
                {value}
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    color: isUp ? "success.main" : "error.main",
                }}
            >
                {isUp ? (
                    <TrendingUp fontSize="small" />
                ) : (
                    <TrendingDown fontSize="small" />
                )}
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {trend}
                </Typography>
            </Box>
        </Paper>
    );

    const StatisticsCards = () => {
        const cards = [
            {
                title: "Tổng doanh thu",
                value: formatCurrency(
                    statistics?.overallStats.totalRevenue || 0
                ),
                trend: "+12.5%",
                isUp: true,
            },
            {
                title: "Tổng vé đã bán",
                value: statistics?.overallStats.totalTicketsSold || 0,
                trend: "+8.3%",
                isUp: true,
            },
            {
                title: "Số đơn hủy",
                value: statistics?.overallStats.totalCancellations || 0,
                trend: "-2.1%",
                isUp: false,
            },
            {
                title: "Giá vé trung bình",
                value: formatCurrency(
                    statistics?.overallStats.averageTicketPrice || 0
                ),
                trend: "+5.2%",
                isUp: true,
            },
        ];

        return (
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {cards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <StatCard {...card} />
                    </Grid>
                ))}
            </Grid>
        );
    };

    // Add route statistics chart
    const RouteStatisticsChart = () => {
        const routeData = statistics?.routeStatistics.map((route) => ({
            name: route.routeName,
            value: route.totalRevenue,
            details: {
                bookings: route.totalBookings,
                customers: route.uniqueCustomers,
                revenue: route.totalRevenue,
            },
        }));

        return (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight={"bold"}>
                    Thống kê theo tuyến đường
                </Typography>
                <Box sx={{ height: 400, mb: 4 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={routeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={100}
                                outerRadius={150}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={2000}
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(1)}%`
                                }
                            >
                                {routeData?.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) =>
                                    formatCurrency(value)
                                }
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>

                {/* Route Details Section */}
                <Box sx={{ mt: 4 }}>
                    <Typography
                        variant="h6"
                        fontWeight={"bold"}
                        gutterBottom
                        sx={{ mb: 2 }}
                    >
                        Chi tiết tuyến đường
                    </Typography>
                    {statistics?.routeStatistics.map((route, index) => (
                        <Box
                            key={index}
                            sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: "divider",
                                "&:hover": {
                                    bgcolor: "action.hover",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: "50%",
                                        bgcolor: COLORS[index % COLORS.length],
                                        mr: 2,
                                    }}
                                />
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: "bold" }}
                                >
                                    {route.routeName}
                                </Typography>
                            </Box>
                            <Grid container spacing={2} sx={{ pl: 4 }}>
                                <Grid item xs={12} sm={4}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Doanh thu
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{ fontWeight: "medium" }}
                                    >
                                        {formatCurrency(route.totalRevenue)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Số vé đã bán
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{ fontWeight: "medium" }}
                                    >
                                        {route.totalBookings} vé
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Số khách hàng
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{ fontWeight: "medium" }}
                                    >
                                        {route.uniqueCustomers} khách
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    ))}
                </Box>
            </Paper>
        );
    };

    // Add bus type statistics chart
    const BusTypeStatisticsChart = () => (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
                Thống kê theo loại xe
            </Typography>
            <Box sx={{ mt: 4 }}>
                {statistics?.busTypeStatistics.stats.map((bus, index) => (
                    <Box key={index} sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {bus.busType}
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} md={4}>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Doanh thu
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "medium" }}
                                >
                                    {formatCurrency(bus.totalRevenue)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Vé bán
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "medium" }}
                                >
                                    {bus.totalBookings}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Tỷ lệ lấp đầy
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "medium" }}
                                >
                                    {bus.averageOccupancyRate.toFixed(1)}%
                                </Typography>
                            </Grid>
                        </Grid>
                        {/* Progress Bar */}
                        <Box
                            sx={{
                                width: "100%",
                                bgcolor: "grey.100",
                                borderRadius: 2,
                                height: 8,
                            }}
                        >
                            <Box
                                sx={{
                                    width: `${bus.averageOccupancyRate}%`,
                                    bgcolor: "primary.main",
                                    height: "100%",
                                    borderRadius: 2,
                                    transition: "width 1s ease-in-out",
                                }}
                            />
                        </Box>
                    </Box>
                ))}
            </Box>
        </Paper>
    );

    const renderDateInputs = () => {
        if (activeTab === "daily") {
            return (
                <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={vi}
                >
                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                        <DatePicker
                            label="Từ ngày"
                            value={new Date(startDate)}
                            onChange={(newValue) => {
                                if (newValue) {
                                    setStartDate(
                                        newValue.toISOString().split("T")[0]
                                    );
                                }
                            }}
                        />
                        <DatePicker
                            label="Đến ngày"
                            value={new Date(endDate)}
                            onChange={(newValue) => {
                                if (newValue) {
                                    setEndDate(
                                        newValue.toISOString().split("T")[0]
                                    );
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

    const CustomerStatisticsChart = () => {
        const customerData = [
            {
                name: "Khách hàng mới",
                value: statistics?.customerStatistics.newCustomers || 0,
                color: "#4CAF50", // Green
            },
            {
                name: "Khách hàng quay lại",
                value: statistics?.customerStatistics.returningCustomers || 0,
                color: "#2196F3", // Blue
            },
        ];

        const totalCustomers = customerData.reduce(
            (sum, item) => sum + item.value,
            0
        );

        return (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                    Thống kê khách hàng
                </Typography>

                {/* Chart and Summary */}
                <Grid container spacing={3}>
                    {/* Pie Chart */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ height: 400 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={customerData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={150}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={2000}
                                    >
                                        {customerData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [
                                            `${value} khách`,
                                            "Số lượng",
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>

                    {/* Statistics Cards */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}
                        >
                            {/* Total Customers Card */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    mb: 2,
                                    bgcolor: "primary.light",
                                    color: "primary.contrastText",
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="h4" gutterBottom>
                                    {totalCustomers}
                                </Typography>
                                <Typography variant="subtitle1">
                                    Tổng số khách hàng
                                </Typography>
                            </Paper>

                            {/* Customer Type Cards */}
                            {customerData.map((item, index) => (
                                <Paper
                                    key={index}
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        borderRadius: 2,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        bgcolor: "background.paper",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: "50%",
                                            bgcolor: item.color,
                                            mr: 2,
                                        }}
                                    />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                        >
                                            {item.name}
                                        </Typography>
                                        <Typography variant="h6">
                                            {item.value} khách (
                                            {(
                                                (item.value / totalCustomers) *
                                                100
                                            ).toFixed(1)}
                                            %)
                                        </Typography>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </Grid>
                </Grid>

                {/* Average Bookings Card */}
                <Paper
                    elevation={0}
                    sx={{
                        mt: 3,
                        p: 3,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                    }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12}>
                            <Box>
                                <Typography
                                    color="text.secondary"
                                    variant="subtitle2"
                                    gutterBottom
                                >
                                    Trung bình đặt vé/khách
                                </Typography>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: "medium",
                                        color: "primary.main",
                                    }}
                                >
                                    {statistics?.customerStatistics.averageBookingsPerCustomer.toFixed(
                                        1
                                    )}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Paper>
        );
    };

    const TabPanel = (props: TabPanelProps) => {
        const { children, value, index, ...other } = props;
        return (
            <div role="tabpanel" hidden={value !== index} {...other}>
                {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
            </div>
        );
    };

    // Tính toán interval dựa trên số lượng dữ liệu
    const calculateInterval = () => {
        if (activeTab === "daily" && data.length > 15) {
            return Math.floor(data.length / 15); // Hiển thị khoảng 15 điểm dữ liệu
        }
        return 0; // Hiển thị tất cả điểm dữ liệu cho monthly và yearly
    };

    return (
        <Box
            sx={{ p: 4, width: "100%", bgcolor: "grey.50", minHeight: "100vh" }}
        >
            {renderDateInputs()}
            {loading ? (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="500px"
                >
                    <CircularProgress />
                </Box>
            ) : statistics ? (
                <>
                    <StatisticsCards />
                    <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            {activeTab === "yearly"
                                ? "Thống kê theo năm"
                                : activeTab === "monthly"
                                ? "Thống kê theo tháng"
                                : "Thống kê theo ngày"}
                        </Typography>
                        <Box>
                            {/* Revenue and Tickets Chart */}
                            <Typography
                                variant="subtitle1"
                                gutterBottom
                                fontWeight="medium"
                            >
                                Doanh thu và số vé đã bán
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart
                                    data={data}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 10,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#ccc"
                                    />
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
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                    />
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
                                </ComposedChart>
                            </ResponsiveContainer>

                            {/* Trends Chart */}
                            <Typography
                                variant="subtitle1"
                                gutterBottom
                                fontWeight="medium"
                                sx={{ mt: 4 }}
                            >
                                Xu hướng theo thời gian
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart
                                    data={data}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 10,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#ccc"
                                    />
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
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{
                                            paddingTop: "10px",
                                        }}
                                    />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="totalRevenue"
                                        stroke="#0047ab"
                                        strokeWidth={3}
                                        name="Xu hướng doanh thu"
                                        dot={
                                            activeTab === "yearly"
                                                ? false
                                                : { r: 5, fill: "#0047ab" }
                                        }
                                        activeDot={
                                            activeTab === "yearly"
                                                ? false
                                                : { r: 8, fill: "#2171cd" }
                                        }
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="totalTicketsSold"
                                        stroke="#008000"
                                        strokeWidth={3}
                                        name="Xu hướng vé bán"
                                        dot={
                                            activeTab === "yearly"
                                                ? false
                                                : { r: 5, fill: "#008000" }
                                        }
                                        activeDot={
                                            activeTab === "yearly"
                                                ? false
                                                : { r: 8, fill: "#4d9d6a" }
                                        }
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                    <Box
                        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
                    >
                        <Tabs
                            value={chartTab}
                            onChange={handleChartTabChange}
                            aria-label="statistics tabs"
                        >
                            <Tab
                                label="Tuyến đường"
                                sx={{ textTransform: "none" }}
                            />
                            <Tab
                                label="Loại xe"
                                sx={{ textTransform: "none" }}
                            />
                            <Tab
                                label="Khách hàng"
                                sx={{ textTransform: "none" }}
                            />
                        </Tabs>
                    </Box>

                    <TabPanel value={chartTab} index={0}>
                        <RouteStatisticsChart />
                    </TabPanel>
                    <TabPanel value={chartTab} index={1}>
                        <BusTypeStatisticsChart />
                    </TabPanel>
                    <TabPanel value={chartTab} index={2}>
                        <CustomerStatisticsChart />
                    </TabPanel>
                </>
            ) : (
                <Typography variant="h6" textAlign="center">
                    Không có dữ liệu cho khoảng thời gian đã chọn
                </Typography>
            )}
        </Box>
    );
};

export default StatisticsChart;
