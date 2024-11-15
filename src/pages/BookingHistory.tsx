import React, { useEffect, useState } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { Footer, Header } from '../components';
import { axiosWithJWT } from '../config/axiosConfig';

interface BookingHistoryItem {
    ticketCode: string;
    contactName: string;
    routeName: string;
    departureDate: string;
    pickupTime: string;
    pickupLocation: string;
    dropoffLocation: string;
    seatNumber: string;
    licensePlate: string;
    contactEmail: string;
    price: string;
    status: string;
  }
const BookingHistory = () => {
    const [bookingHistoryData, setBookingHistoryData] = useState<BookingHistoryItem[]>([]);
    const formatPrice = (price: string): string => {
        const number = parseFloat(price);
        if (isNaN(number)) return price;
        return new Intl.NumberFormat("en-US").format(number);
    };
    useEffect(() => {
        const fetchBookingHistory = async () => {
            try {
                const response = await axiosWithJWT.get('http://localhost:8080/api/v1/bookings/history?pageNumber=1&pageSize=5');
                setBookingHistoryData(response.data.data);
            } catch (err) {
                console.log('Failed to load booking history. Please try again later.');
            }
        };
        fetchBookingHistory();
    }, []);

    return (
        <Box 
        sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh', 
            backgroundColor: '#f0f0f0' 
        }}
        >
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            {bookingHistoryData.length > 0 && 
                <Typography variant="h5" sx={{ fontWeight: "bold", padding: "12px", ml: 34 }}>
                    Lịch sử đặt vé
                </Typography>
            }
            {bookingHistoryData.length > 0 ? 
                (bookingHistoryData.map((booking) => (
                    <Box
                        key={booking.ticketCode}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            fontSize: '12px',
                            backgroundColor: 'white',
                            width: '60%',
                            margin: '16px auto',
                        }}
                        >
                        <Box sx={{ width: '100%' }}>
                            <Typography
                            sx={{
                                fontWeight: 'bold',
                                backgroundColor: '#2474e5',
                                color: 'white',
                                padding: '8px',
                                textAlign: 'center',
                                borderTopLeftRadius: '4px',
                                borderTopRightRadius: '4px',
                            }}
                            >
                            Ticket Code: {booking.ticketCode}
                            </Typography>
                            <Box padding={2} gap={2} display="flex" flex={1}>
                            <Box flex={1}>
                                <Typography sx={{ fontWeight: 'bold' }}>Biển số xe: {booking.licensePlate}</Typography>
                                <Typography sx={{ fontWeight: 'bold' }}>Số ghế: {booking.seatNumber}</Typography>
                                <Typography sx={{ fontWeight: 'bold' }}>Thời gian đón dự kiến: {booking.pickupTime}</Typography>
                                <Typography sx={{ fontWeight: 'bold' }}>Địa điểm đón: {booking.pickupLocation}</Typography>
                                <Typography sx={{ fontWeight: 'bold' }}>Địa điểm trả: {booking.dropoffLocation}</Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem />
                            <Box flex={1}>
                                <Typography sx={{ fontWeight: 'bold' }}>Tên Liên Lạc: {booking.contactName}</Typography>
                                <Typography sx={{ fontWeight: 'bold' }}>Email: {booking.contactEmail}</Typography>
                                <Typography sx={{ fontWeight: 'bold' }}>Giá: {formatPrice(booking.price)} VND</Typography>
                                <Typography
                                    sx={{
                                        fontWeight: 'bold',
                                        backgroundColor: '#4caf50',
                                        color: 'white',           
                                        padding: '4px 8px',       
                                        borderRadius: '4px',      
                                        display: 'inline-block',  
                                    }}
                                >
                                    Trạng thái: {booking.status}
                                </Typography>
                            </Box>
                            </Box>
                        </Box>
                    </Box>
                ))
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            padding: "20px",
                            backgroundColor: "#f0f0f0",
                            marginTop: "100px"
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
                                <span className="font-pacifico text-6xl">Cảm ơn bạn đã truy cập vào TicketGo!</span>
                            </Typography>
                            <Typography variant="body1" fontSize="18px" >
                                Hiện tại bạn chưa có lịch sử đặt vé nào. Hãy đặt vé ngay để trải nghiệm dịch vụ của chúng tôi!
                            </Typography>
                        </Box>
                    </Box>
                )
            }
        </Box>

        {/* Footer */}
        <Footer />
        </Box>
    );
};

export default BookingHistory;
