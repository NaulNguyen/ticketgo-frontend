import React from "react";
import { Box, Typography } from "@mui/material";
import { Footer, Header } from "../../components";
import { Link } from "react-router-dom"; // Import Link từ react-router-dom

const ThankYou = () => {
    return (
        <div>
            {/* Header */}
            <Header />

            {/* Main Content */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "70vh",
                    textAlign: "center",
                    padding: "20px",
                    backgroundColor: "#f0f0f0",
                }}>
                <Box
                    sx={{
                        backgroundColor: "#ffffff",
                        padding: "30px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}>
                    <Typography variant="h3" fontWeight="bold" mb={3}>
                        <span className="font-pacifico text-6xl">
                            Cảm ơn bạn đã đặt vé với TicketGo!
                        </span>
                    </Typography>
                    <Typography variant="body1" fontSize="18px" mb={2}>
                        Vui lòng kiểm tra email để xem thông tin vé đã đặt hoặc xem tại{" "}
                        <Link
                            to="/booking-history" // Đường dẫn đến trang booking-history
                            style={{
                                textDecoration: "none",
                                color: "#0d47a1",
                                fontWeight: "bold",
                            }}>
                            đây
                        </Link>
                        . Chúc bạn một ngày tốt lành!
                    </Typography>
                    <Typography variant="body1" color="grey">
                        Nếu không thấy xin vui lòng kiểm tra hộp thư rác.
                    </Typography>
                </Box>
            </Box>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default ThankYou;
