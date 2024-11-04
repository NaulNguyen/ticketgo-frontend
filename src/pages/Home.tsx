import React, { useState } from "react";
import { DestinationCard, Header, Search } from "../components";
import { IconButton, Container, Typography, Box } from "@mui/material";
import { ToastContainer } from "react-toastify";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const Home = () => {
    const [index, setIndex] = useState(0);
    const totalCards = 9;
    const cardsToShow = 7;

    const handlePrev = () => {
        if (index > 0) setIndex(index - 1);
    };

    const handleNext = () => {
        if (index < totalCards - cardsToShow) setIndex(index + 1);
    };

    const handleKeyDown = (e: any) => {
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "ArrowRight") handleNext();
    };

    return (
        <div onKeyDown={handleKeyDown} tabIndex={0}>
            <ToastContainer position="top-right" autoClose={3000} />
            <Header />
            <div className="relative">
                <img
                    src="https://static.vexere.com/production/banners/1209/leader-board-vn.jpg"
                    alt="Banner"
                    className="w-full h-[480px] object-cover"
                />
                <Search />
            </div>
            <Container>
                <Typography variant="h6" fontWeight="bold" ml={5} mt={2}>
                    <span className="border-2 border-cyan-500 mr-2"></span>Tuyến đường phổ biến
                </Typography>
                <Box display="flex" alignItems="center">
                    <IconButton onClick={handlePrev} disabled={index === 0}>
                        <ArrowBackIosIcon />
                    </IconButton>
                    <Box sx={{ display: "flex", overflow: "hidden", gap: 2 }}>
                        <Box
                            sx={{
                                display: "flex",
                                transform: `translateX(-${index * 100}%)`,
                                transition: "transform 0.5s ease",
                                width: `${(totalCards * 100) / cardsToShow}%`,
                                gap: 2,
                            }}>
                            {Array.from({ length: totalCards }, (_, i) => (
                                <Box key={i} sx={{ flex: "1 0 auto" }}>
                                    <DestinationCard />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <IconButton onClick={handleNext} disabled={index >= totalCards - cardsToShow}>
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Box>
            </Container>
        </div>
    );
};

export default Home;
