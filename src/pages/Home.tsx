import React, { useEffect, useState, useCallback, memo } from "react";
import { DestinationCard, Footer, Header, Search } from "../components";
import { Typography, Box, Skeleton, Fade, Container, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BoxChat from "../components/BoxChat";
import useAppAccessor from "../hook/useAppAccessor";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import BotChat from "../components/BotChat";

type RouteData = {
    routeImage: string;
    routeName: string;
    price: number;
};

type HomepageData = {
    description: string;
    bannerUrl: string;
    busCompanyName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    headquarterAddress: string;
    businessRegistrationAddress: string;
    businessLicenseNumber: string;
    licenseIssuer: string;
    licenseIssueDate: string;
};

interface Promotion {
    promotionId: number;
    description: string;
    discountPercentage: number;
    discountCode: string;
    startDate: string;
    endDate: string;
    status: string;
}

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
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loadingPromotions, setLoadingPromotions] = useState(true);
    const { getUserInfor } = useAppAccessor();
    const userInfor = getUserInfor();
    const navigate = useNavigate();

    const promotionGradients = [
        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
        "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
        "linear-gradient(135deg, #C2185B 0%, #E91E63 100%)",
        "linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)",
        "linear-gradient(135deg, #EF6C00 0%, #FF9800 100%)",
    ];

    const shouldShowChat = userInfor && userInfor.user.role !== "ROLE_BUS_COMPANY";

    const NextArrow = ({ onClick }: { onClick?: () => void }) => (
        <Box
            onClick={onClick}
            sx={{
                position: "absolute",
                right: -20,
                top: "50%",
                transform: "translateY(-50%)",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "white",
                borderRadius: "50%",
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                zIndex: 2,
                transition: "all 0.2s",
                "&:hover": {
                    bgcolor: "primary.main",
                    color: "white",
                    transform: "translateY(-50%) scale(1.1)",
                },
            }}>
            <NavigateNextIcon />
        </Box>
    );

    const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
        <Box
            onClick={onClick}
            sx={{
                position: "absolute",
                left: -20,
                top: "50%",
                transform: "translateY(-50%)",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "white",
                borderRadius: "50%",
                cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                zIndex: 2,
                transition: "all 0.2s",
                "&:hover": {
                    bgcolor: "primary.main",
                    color: "white",
                    transform: "translateY(-50%) scale(1.1)",
                },
            }}>
            <NavigateBeforeIcon />
        </Box>
    );

    // Memoized fetch functions
    const fetchRoutes = useCallback(async () => {
        try {
            const response = await axios.get("https://ticketgo.site/api/v1/routes/popular");
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
            const response = await axios.get("https://ticketgo.site/api/v1/bus-companies");
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

    const fetchPromotions = useCallback(async () => {
        try {
            const response = await axios.get(
                "https://ticketgo.site/api/v1/promotions/active?pageSize=10"
            );
            if (response.data.status === 200) {
                setPromotions(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching promotions:", error);
        } finally {
            setLoadingPromotions(false);
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchRoutes(), fetchHomepageData(), fetchPromotions()]);
    }, [fetchRoutes, fetchHomepageData, fetchPromotions]);

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
        <Paper elevation={2} sx={{ width: 280, height: "fit-content", p: 2, borderRadius: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={180} sx={{ borderRadius: 1 }} />
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
                        <Skeleton variant="rectangular" width="100%" height="100%" />
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
                    }}>
                    Tuyến đường phổ biến
                </Typography>

                <Box sx={{ position: "relative", px: 3, mb: 6 }}>
                    {loadingRoutes ? (
                        <Box sx={{ display: "flex", gap: 3 }}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <LoadingSkeleton key={i} />
                            ))}
                        </Box>
                    ) : (
                        <Slider
                            dots={true}
                            infinite={true}
                            speed={500}
                            slidesToShow={4}
                            slidesToScroll={1}
                            nextArrow={<NextArrow />}
                            prevArrow={<PrevArrow />}
                            autoplay={true}
                            autoplaySpeed={5000}
                            pauseOnHover={true}
                            responsive={[
                                {
                                    breakpoint: 1024,
                                    settings: {
                                        slidesToShow: 3,
                                        slidesToScroll: 1,
                                    },
                                },
                                {
                                    breakpoint: 768,
                                    settings: {
                                        slidesToShow: 2,
                                        slidesToScroll: 1,
                                    },
                                },
                                {
                                    breakpoint: 480,
                                    settings: {
                                        slidesToShow: 1,
                                        slidesToScroll: 1,
                                    },
                                },
                            ]}>
                            {routes.map((route, i) => (
                                <Box key={i} sx={{ p: 1 }}>
                                    <Fade in={!loadingRoutes} timeout={800 + i * 200}>
                                        <Paper
                                            elevation={2}
                                            onClick={() => handleRouteClick(route.routeName)}
                                            sx={{
                                                transition: "transform 0.2s, box-shadow 0.2s",
                                                "&:hover": {
                                                    transform: "translateY(-4px)",
                                                    boxShadow: 4,
                                                },
                                                cursor: "pointer",
                                            }}>
                                            <MemoizedDestinationCard
                                                routeImage={route.routeImage}
                                                routeName={route.routeName}
                                                price={route.price}
                                            />
                                        </Paper>
                                    </Fade>
                                </Box>
                            ))}
                        </Slider>
                    )}
                </Box>

                <>
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
                        }}>
                        Ưu đãi hiện có
                    </Typography>

                    <Box sx={{ mb: 6 }}>
                        {loadingPromotions ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    flexWrap: "wrap",
                                }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        variant="rectangular"
                                        width={300}
                                        height={200}
                                        sx={{ borderRadius: 2 }}
                                    />
                                ))}
                            </Box>
                        ) : promotions.length > 0 ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 3,
                                    flexWrap: "wrap",
                                }}>
                                {promotions.map((promo, index) => (
                                    <Paper
                                        key={promo.promotionId}
                                        elevation={3}
                                        sx={{
                                            width: 300,
                                            p: 3,
                                            borderRadius: 2,
                                            background:
                                                promotionGradients[
                                                    index % promotionGradients.length
                                                ],
                                            color: "white",
                                            transition: "all 0.3s ease",
                                            position: "relative",
                                            overflow: "hidden",
                                            "&::before": {
                                                content: '""',
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background:
                                                    "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
                                                zIndex: 1,
                                            },
                                            "&:hover": {
                                                transform: "translateY(-4px) scale(1.02)",
                                                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                                                "&::before": {
                                                    opacity: 0.8,
                                                },
                                            },
                                        }}>
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 600,
                                                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                            }}>
                                            {promo.description}
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                color: "#fff",
                                                mb: 2,
                                                fontWeight: 700,
                                                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}>
                                            {promo.discountPercentage}%
                                            <Typography
                                                component="span"
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 600,
                                                    opacity: 0.9,
                                                }}>
                                                GIẢM
                                            </Typography>
                                        </Typography>
                                        <Box
                                            sx={{
                                                bgcolor: "rgba(255,255,255,0.15)",
                                                p: 1.5,
                                                borderRadius: 1,
                                                mb: 2,
                                                backdropFilter: "blur(4px)",
                                                border: "1px solid rgba(255,255,255,0.2)",
                                            }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontFamily: "monospace",
                                                    fontWeight: 600,
                                                    letterSpacing: 1,
                                                    textAlign: "center",
                                                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                                }}>
                                                Mã: {promo.discountCode}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 0.5,
                                                opacity: 0.9,
                                            }}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}>
                                                Hiệu lực từ:{" "}
                                                {new Date(promo.startDate).toLocaleDateString(
                                                    "vi-VN"
                                                )}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}>
                                                Đến:{" "}
                                                {new Date(promo.endDate).toLocaleDateString(
                                                    "vi-VN"
                                                )}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        ) : (
                            <Typography
                                variant="body1"
                                sx={{
                                    textAlign: "center",
                                    color: "text.secondary",
                                }}>
                                Hiện tại chưa có ưu đãi nào.
                            </Typography>
                        )}
                    </Box>
                </>

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
                    }}>
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
                                }}>
                                <Box
                                    sx={{
                                        p: { xs: 2, md: 5 },
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 6,
                                    }}>
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
                                        }}>
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
                                                bgcolor: "rgba(255,255,255,0.9)",
                                                borderRadius: 2,
                                                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                                "& .font-pacifico": {
                                                    background:
                                                        "linear-gradient(45deg, #1976d2, #42a5f5)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                    display: "inline-block",
                                                    transform: "translateY(4px)",
                                                },
                                            }}>
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
                                            }}>
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
                                                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                                    position: "relative",
                                                    zIndex: 1,
                                                    transition: "transform 0.3s ease",
                                                    "&:hover": {
                                                        transform: "scale(1.02)",
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
                                        }}>
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
                                            }}>
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
                                                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                                    position: "relative",
                                                    zIndex: 1,
                                                    transition: "transform 0.3s ease",
                                                    "&:hover": {
                                                        transform: "scale(1.02)",
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
                                                bgcolor: "rgba(255,255,255,0.9)",
                                                borderRadius: 2,
                                                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                                "& .font-pacifico": {
                                                    background:
                                                        "linear-gradient(45deg, #1976d2, #42a5f5)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                    display: "inline-block",
                                                    transform: "translateY(4px)",
                                                },
                                            }}>
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
            {shouldShowChat && (
                <>
                    <BoxChat />
                    <BotChat />
                </>
            )}
            <style>{`
    .slick-dots {
        bottom: -30px;
    }
    .slick-dots li button:before {
        font-size: 12px;
        color: #1976d2;
        opacity: 0.3;
    }
    .slick-dots li.slick-active button:before {
        opacity: 1;
        color: #1976d2;
    }
    .slick-list {
        margin: 0 -8px;
    }
    .slick-slide > div {
        margin: 0 8px;
    }
`}</style>
        </Box>
    );
};

export default memo(Home);
