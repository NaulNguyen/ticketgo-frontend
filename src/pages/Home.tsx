import React, { useEffect, useState, useCallback, memo } from "react";
import { DestinationCard, Footer, Header, Search } from "../components";
import {
    Typography,
    Box,
    Skeleton,
    Fade,
    Container,
    Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BoxChat from "../components/BoxChat";
import useAppAccessor from "../hook/useAppAccessor";

type RouteData = {
    routeImage: string;
    routeName: string;
    price: number;
};

type HomepageData = {
    description: string;
    bannerUrl: string;
};

// Memoized components
const MemoizedDestinationCard = memo(DestinationCard);
const MemoizedFooter = memo(Footer);
const MemoizedHeader = memo(Header);
const MemoizedSearch = memo(Search);

const Home = () => {
    const [routes, setRoutes] = useState<RouteData[]>([]);
    const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
    const [loadingRoutes, setLoadingRoutes] = useState(true);
    const [loadingHomepage, setLoadingHomepage] = useState(true);
    const { getUserInfor } = useAppAccessor();
    const userInfor = getUserInfor();
    const navigate = useNavigate();

    const shouldShowChat =
        userInfor && userInfor.user.role !== "ROLE_BUS_COMPANY";

    // Memoized fetch functions
    const fetchRoutes = useCallback(async () => {
        try {
            const response = await axios.get(
                "https://ticketgo.site/api/v1/routes/popular"
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
    }, []);

    const fetchHomepageData = useCallback(async () => {
        try {
            const response = await axios.get(
                "https://ticketgo.site/api/v1/homepage"
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
    }, []);

    useEffect(() => {
        Promise.all([fetchRoutes(), fetchHomepageData()]);
    }, [fetchRoutes, fetchHomepageData]);

    const handleRouteClick = useCallback(
        (routeName: string) => {
            const today = new Date().toISOString().split("T")[0];
            const [departureLocation, arrivalLocation] = routeName.split(" - ");
            navigate(
                `/search?departureLocation=${departureLocation}&arrivalLocation=${arrivalLocation}&departureDate=${today}&sortBy=departureTime&sortDirection=asc&pageNumber=1&pageSize=5`
            );
        },
        [navigate]
    );

    const LoadingSkeleton = memo(() => (
        <Paper
            elevation={2}
            sx={{ width: 280, height: "fit-content", p: 2, borderRadius: 2 }}
        >
            <Skeleton
                variant="rectangular"
                width="100%"
                height={180}
                sx={{ borderRadius: 1 }}
            />
            <Box sx={{ pt: 1.5 }}>
                <Skeleton width="85%" height={28} />
                <Skeleton width="60%" height={24} />
            </Box>
        </Paper>
    ));

    return (
        <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
            <MemoizedHeader />
            <Box className="relative">
                {loadingHomepage ? (
                    <Box sx={{ width: "100%", height: 480 }}>
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height="100%"
                        />
                    </Box>
                ) : (
                    homepageData && (
                        <Fade in={!loadingHomepage} timeout={1000}>
                            <img
                                src={homepageData.bannerUrl}
                                alt="Homepage Banner"
                                className="w-full h-[480px] object-cover"
                                loading="lazy"
                            />
                        </Fade>
                    )
                )}
                <MemoizedSearch />
            </Box>

            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 600,
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        "&::before": {
                            content: '""',
                            width: 4,
                            height: 24,
                            bgcolor: "primary.main",
                            mr: 2,
                            borderRadius: 1,
                        },
                    }}
                >
                    Tuyến đường phổ biến
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                        justifyContent: "center",
                        mb: 6,
                    }}
                >
                    {loadingRoutes
                        ? Array.from({ length: 4 }).map((_, i) => (
                              <LoadingSkeleton key={i} />
                          ))
                        : routes.map((route, i) => (
                              <Fade
                                  in={!loadingRoutes}
                                  timeout={800 + i * 200}
                                  key={i}
                              >
                                  <Paper
                                      elevation={2}
                                      onClick={() =>
                                          handleRouteClick(route.routeName)
                                      }
                                      sx={{
                                          transition:
                                              "transform 0.2s, box-shadow 0.2s",
                                          "&:hover": {
                                              transform: "translateY(-4px)",
                                              boxShadow: 4,
                                          },
                                          cursor: "pointer",
                                      }}
                                  >
                                      <MemoizedDestinationCard
                                          routeImage={route.routeImage}
                                          routeName={route.routeName}
                                          price={route.price}
                                      />
                                  </Paper>
                              </Fade>
                          ))}
                </Box>

                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 600,
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        "&::before": {
                            content: '""',
                            width: 4,
                            height: 24,
                            bgcolor: "primary.main",
                            mr: 2,
                            borderRadius: 1,
                        },
                    }}
                >
                    Về chúng tôi
                </Typography>

                <Box sx={{ mb: 4 }}>
                    {loadingHomepage ? (
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                            <Skeleton variant="text" width="90%" height={28} />
                            <Skeleton variant="text" width="85%" height={28} />
                            <Skeleton variant="text" width="88%" height={28} />
                            <Skeleton variant="text" width="80%" height={28} />
                        </Paper>
                    ) : (
                        homepageData && (
                            <Paper
                                elevation={3}
                                sx={{
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    bgcolor: "#ffffff",
                                    maxWidth: "1200px",
                                    margin: "0 auto",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                }}
                            >
                                <Box
                                    sx={{
                                        p: { xs: 2, md: 5 },
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 6,
                                    }}
                                >
                                    {/* First Section */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: { xs: 3, md: 6 },
                                            flexWrap: {
                                                xs: "wrap",
                                                md: "nowrap",
                                            },
                                            position: "relative",
                                            "&::after": {
                                                content: '""',
                                                position: "absolute",
                                                right: 0,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                width: "100%",
                                                height: "120%",
                                                background:
                                                    "linear-gradient(135deg, transparent 0%, rgba(25,118,210,0.05) 100%)",
                                                zIndex: 0,
                                                borderRadius: 4,
                                            },
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                flex: "0 0 45%",
                                                fontSize: {
                                                    xs: "1rem",
                                                    md: "1.1rem",
                                                },
                                                lineHeight: 2,
                                                color: "#2c3e50",
                                                position: "relative",
                                                zIndex: 1,
                                                p: 3,
                                                bgcolor:
                                                    "rgba(255,255,255,0.9)",
                                                borderRadius: 2,
                                                boxShadow:
                                                    "0 2px 12px rgba(0,0,0,0.06)",
                                                "& .font-pacifico": {
                                                    background:
                                                        "linear-gradient(45deg, #1976d2, #42a5f5)",
                                                    WebkitBackgroundClip:
                                                        "text",
                                                    WebkitTextFillColor:
                                                        "transparent",
                                                    display: "inline-block",
                                                    transform:
                                                        "translateY(4px)",
                                                },
                                            }}
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: homepageData.description
                                                        .split("\n\n")[0]
                                                        .replace(
                                                            "Nhà xe TicketGo",
                                                            '<span class="font-pacifico text-4xl text-primary">TicketGo </span>'
                                                        ),
                                                }}
                                            />
                                        </Typography>
                                        <Box
                                            sx={{
                                                flex: "0 0 50%",
                                                position: "relative",
                                                "&::before": {
                                                    content: '""',
                                                    position: "absolute",
                                                    left: -16,
                                                    top: -16,
                                                    right: 16,
                                                    bottom: 16,
                                                    border: "2px solid #1976d2",
                                                    borderRadius: 2,
                                                    opacity: 0.3,
                                                    zIndex: 0,
                                                },
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src="https://res.cloudinary.com/dj1h07rea/image/upload/v1733365012/z6098699997331_d46ffa1573577506f3613cbe5cd50ec3_gxauhr.jpg"
                                                sx={{
                                                    width: "100%",
                                                    height: {
                                                        xs: 400,
                                                        md: 500,
                                                    },
                                                    objectFit: "cover",
                                                    borderRadius: 2,
                                                    boxShadow:
                                                        "0 4px 20px rgba(0,0,0,0.15)",
                                                    position: "relative",
                                                    zIndex: 1,
                                                    transition:
                                                        "transform 0.3s ease",
                                                    "&:hover": {
                                                        transform:
                                                            "scale(1.02)",
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Second Section */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: { xs: 3, md: 6 },
                                            flexWrap: {
                                                xs: "wrap-reverse",
                                                md: "nowrap",
                                            },
                                            position: "relative",
                                            "&::after": {
                                                content: '""',
                                                position: "absolute",
                                                left: 0,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                width: "100%",
                                                height: "120%",
                                                background:
                                                    "linear-gradient(225deg, transparent 0%, rgba(25,118,210,0.05) 100%)",
                                                zIndex: 0,
                                                borderRadius: 4,
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                flex: "0 0 50%",
                                                position: "relative",
                                                "&::before": {
                                                    content: '""',
                                                    position: "absolute",
                                                    right: -16,
                                                    top: -16,
                                                    left: 16,
                                                    bottom: 16,
                                                    border: "2px solid #1976d2",
                                                    borderRadius: 2,
                                                    opacity: 0.3,
                                                    zIndex: 0,
                                                },
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src="https://res.cloudinary.com/dj1h07rea/image/upload/v1733365012/z6098697156421_1d372dc62b02c82a30aee123a2c3d485_s4kai3.jpg"
                                                sx={{
                                                    width: "100%",
                                                    height: {
                                                        xs: 400,
                                                        md: 500,
                                                    },
                                                    objectFit: "cover",
                                                    borderRadius: 2,
                                                    boxShadow:
                                                        "0 4px 20px rgba(0,0,0,0.15)",
                                                    position: "relative",
                                                    zIndex: 1,
                                                    transition:
                                                        "transform 0.3s ease",
                                                    "&:hover": {
                                                        transform:
                                                            "scale(1.02)",
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                flex: "0 0 45%",
                                                fontSize: {
                                                    xs: "1rem",
                                                    md: "1.1rem",
                                                },
                                                lineHeight: 2,
                                                color: "#2c3e50",
                                                position: "relative",
                                                zIndex: 1,
                                                p: 3,
                                                bgcolor:
                                                    "rgba(255,255,255,0.9)",
                                                borderRadius: 2,
                                                boxShadow:
                                                    "0 2px 12px rgba(0,0,0,0.06)",
                                                "& .font-pacifico": {
                                                    background:
                                                        "linear-gradient(45deg, #1976d2, #42a5f5)",
                                                    WebkitBackgroundClip:
                                                        "text",
                                                    WebkitTextFillColor:
                                                        "transparent",
                                                    display: "inline-block",
                                                    transform:
                                                        "translateY(4px)",
                                                },
                                            }}
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: homepageData.description
                                                        .split("\n\n")[1]
                                                        .replace(
                                                            "Nhà xe TicketGo",
                                                            '<span class="font-pacifico text-4xl text-primary">TicketGo </span>'
                                                        ),
                                                }}
                                            />
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        )
                    )}
                </Box>
            </Container>
            <MemoizedFooter />
            {shouldShowChat && <BoxChat />}
        </Box>
    );
};

export default memo(Home);
