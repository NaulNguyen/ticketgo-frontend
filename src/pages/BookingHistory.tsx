import { Box, Divider, Typography } from '@mui/material';
import React from 'react';
import { Footer, Header } from '../components';

const BookingHistory = () => {
  return (
    <div style={{ backgroundColor: "#f0f0f0", height: "100vh" }}>
        <Header />
        <Typography variant='h5' sx={{ fontWeight: "bold", padding: "12px", ml: 34 }}>
            Lịch sử đặt vé
        </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",  
                    alignItems: "center",      
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    fontSize: "12px",
                    backgroundColor: "white",
                    width: "60%",              
                    margin: "0 auto",  
                }}
                >
                <Box sx={{ width: "100%" }}>
                    <Typography 
                    sx={{ 
                        fontWeight: "bold", 
                        backgroundColor: "#2474e5",
                        color: "white",
                        padding: "8px", 
                        textAlign: "center", 
                        borderTopLeftRadius: "4px", 
                        borderTopRightRadius: "4px", 
                    }}
                    >
                    Ticket Code: TICKET-5-1B
                    </Typography>
                    <Box padding={2} gap={2} display="flex" flex={1}>
                        <Box flex={1}>
                            <Typography sx={{ fontWeight: "bold" }}>Biển số xe: 51B-05011</Typography>
                            <Typography sx={{ fontWeight: "bold" }}>Số ghế: 1B</Typography>
                            <Typography sx={{ fontWeight: "bold" }}>Địa điểm đón : Nhà chờ Phương Trang (Đường Mai Chí Thọ)</Typography>
                            <Typography sx={{ fontWeight: "bold" }}>Địa điểm trả : Ngã ba Lập Định</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box flex={1}>
                            <Typography sx={{ fontWeight: "bold" }}>Tên Liên Lạc: Phương Tây</Typography>
                            <Typography sx={{ fontWeight: "bold" }}>Email: phuonggteyy@gmail.com</Typography>
                            <Typography sx={{ fontWeight: "bold" }}>Giá: 600000 VND</Typography>
                            <Typography sx={{ fontWeight: "bold" }}>Trạng thái: Đã xác nhận</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        <Footer />
    </div>
  );
};

export default BookingHistory;
