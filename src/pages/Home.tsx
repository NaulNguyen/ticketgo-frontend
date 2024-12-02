import React, { useEffect, useState } from "react";
import { DestinationCard, Footer, Header, Search } from "../components";
import { Typography, Box, Skeleton, Fade } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

type RouteData = {
    routeImage: string;
    routeName: string;
    price: number;
};

type HomepageData = {
    description: string;
    bannerUrl: string;
};

const Home = () => {
    const [routes, setRoutes] = useState<RouteData[]>([]);
    const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
    const [loadingRoutes, setLoadingRoutes] = useState(true);
    const [loadingHomepage, setLoadingHomepage] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const response = await axios.get(
                    "https://ticketgo-app-a139ba17185b.herokuapp.com/api/v1/routes/popular"
                );
                const data = response.data;
                if (data.status === 200) {
                    setRoutes(data.data);
                } else {
                    console.error("Failed to fetch routes data");
                }
            } catch (error) {
                console.error("Error fetching routes data:", error);
            } finally {
                setLoadingRoutes(false);
            }
        };

        const fetchHomepageData = async () => {
            try {
                const response = await axios.get(
                    "https://ticketgo-app-a139ba17185b.herokuapp.com/api/v1/homepage"
                );
                const data = response.data;
                if (data.status === 200) {
                    setHomepageData(data.data);
                } else {
                    console.error("Failed to fetch homepage data");
                }
            } catch (error) {
                console.error("Error fetching homepage data:", error);
            } finally {
                setLoadingHomepage(false);
            }
        };

        fetchRoutes();
        fetchHomepageData();
    }, []);

    const handleRouteClick = (routeName: string) => {
        const today = new Date().toISOString().split("T")[0];
        const [departureLocation, arrivalLocation] = routeName.split(" - ");
        navigate(
            `/search?departureLocation=${departureLocation}&arrivalLocation=${arrivalLocation}&departureDate=${today}&sortBy=departureTime&sortDirection=asc&pageNumber=1&pageSize=5`
        );
    };

    return (
        <div style={{ backgroundColor: "#f0f0f0" }}>
            <Header />
            <div className="relative">
                {loadingHomepage ? (
                    <Skeleton variant="rectangular" width="100%" height={480} animation="wave" />
                ) : (
                    homepageData && (
                        <Fade in={!loadingHomepage} timeout={800}>
                            <img
                                src={homepageData.bannerUrl}
                                alt="Homepage Banner"
                                className="w-full h-[480px] object-cover"
                            />
                        </Fade>
                    )
                )}
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
                    }}>
                    {loadingRoutes
                        ? Array.from({ length: 4 }).map((_, i) => (
                              <Box key={i} ml={1}>
                                  <Skeleton
                                      variant="rectangular"
                                      width={250}
                                      height={150}
                                      animation="wave"
                                      sx={{ borderRadius: 1 }}
                                  />
                                  <Skeleton width="60%" sx={{ mt: 1 }} />
                                  <Skeleton width="40%" />
                              </Box>
                          ))
                        : routes.map((route, i) => (
                              <Fade in={!loadingRoutes} timeout={800} key={i}>
                                  <Box ml={1} onClick={() => handleRouteClick(route.routeName)}>
                                      <DestinationCard
                                          routeImage={route.routeImage}
                                          routeName={route.routeName}
                                          price={route.price}
                                      />
                                  </Box>
                              </Fade>
                          ))}
                </Box>
                <Typography variant="h6" fontWeight="bold" ml={5} mt={2}>
                    <span className="border-2 border-cyan-500 mr-2"></span>Về chúng tôi
                </Typography>
                <Box sx={{ px: 5, py: 2 }}>
                    {loadingHomepage ? (
                        <Skeleton width="80%" sx={{ mb: 1 }} />
                    ) : (
                        homepageData && (
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                sx={{
                                    backgroundColor: "#ffffff",
                                    borderRadius: 1,
                                    padding: 2,
                                    boxShadow: 1,
                                }}>
                                <Typography variant="body1" color="textSecondary">
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: homepageData.description
                                                .replace(
                                                    "Nhà xe TicketGo",
                                                    '<span class="font-pacifico text-3xl text-black">TicketGo </span>'
                                                )
                                                .replace(/\n\n/g, "<br /><br />"),
                                        }}
                                    />
                                </Typography>
                            </Box>
                        )
                    )}
                </Box>
            </Box>
            <Footer />
        </div>
    );
};

export default Home;
