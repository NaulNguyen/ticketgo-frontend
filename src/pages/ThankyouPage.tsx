import React from "react";
import { Box, Typography } from "@mui/material";
import { Footer, Header } from "../components";

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
                    backgroundColor: "#f0f0f0"
                }}
            >
                <Box
                    sx={{
                        backgroundColor: "#ffffff",
                        padding: "30px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                    }}
                >
                    <Typography variant="h3" fontWeight="bold" mb={3}>
                        <span className="font-pacifico text-6xl">Cảm ơn bạn đã đặt vé với TicketGo!</span>
                    </Typography>
                    <Typography variant="body1" fontSize="18px" >
                        Vui lòng kiểm tra email để xem thông tin vé đã đặt. Chúc bạn một ngày tốt lành!
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
