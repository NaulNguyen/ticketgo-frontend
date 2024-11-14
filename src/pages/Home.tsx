import React, { useEffect, useState } from "react";
import { DestinationCard, Footer, Header, Search } from "../components";
import { Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import axios from "axios";

type RouteData = {
    routeImage: string;
    routeName: string;
    price: number;
};

const Home = () => {
    const [routes, setRoutes] = useState<RouteData[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/v1/routes/popular");
                const data = response.data;
                if (data.status === 200) {
                    setRoutes(data.data); 
                } else {
                    console.error("Failed to fetch routes data");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchRoutes();
    }, []);

    const handleRouteClick = (routeName: string) => {
        const today = new Date().toISOString().split("T")[0];
        const [departureLocation, arrivalLocation] = routeName.split(" - ");
        navigate(`/search?departureLocation=${departureLocation}&arrivalLocation=${arrivalLocation}&departureDate=${today}&sortBy=departureTime&sortDirection=asc&pageNumber=1&pageSize=5`);
    };

    return (
        <div style={{ backgroundColor: "#f0f0f0" }}>
            <Header />
            <div className="relative">
                <img
                    src="https://static.vexere.com/production/banners/1209/leader-board-vn.jpg"
                    alt="Banner"
                    className="w-full h-[480px] object-cover"
                />
                <Search />
            </div>
            <Box>
                <Typography variant="h6" fontWeight="bold" ml={5} mt={2}>
                    <span className="border-2 border-cyan-500 mr-2"></span>Tuyến đường phổ biến
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap",  
                        gap: 2, 
                        mt: 2,
                    }}
                >
                    {routes.map((route, i) => (
                        <Box key={i} ml={1} onClick={() => handleRouteClick(route.routeName)}>
                            <DestinationCard
                                routeImage={route.routeImage}
                                routeName={route.routeName}
                                price={route.price}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
            <Footer />
        </div>
    );
};

export default Home;
