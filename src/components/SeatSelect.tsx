import { Box, Button, Divider, Step, StepLabel, Stepper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { BlockedSeat, EmptySeat, SelectedSeat, Wheel } from "./IconSVG";
import axios from "axios";
import useAppAccessor from "../hook/useAppAccessor";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

interface Seat {
    seatId: number;
    seatNumber: string;
    isAvailable: boolean;
}

interface FloorData {
    floor_1: Seat[][] | undefined;
    floor_2: Seat[][] | undefined;
}

interface SeatSelectProps {
    scheduleId: string;
}

const SeatSelect: React.FC<SeatSelectProps> = ({ scheduleId }) => {
    const [seatsData, setSeatsData] = useState<FloorData | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [activeStep, setActiveStep] = React.useState(0);

    const steps = ['Chổ mong muốn', 'Điểm đón trả'];

    const { getUserInfor } = useAppAccessor();
    const userInfo = getUserInfor();

    const isStepOptional = (step: number) => step === 1;

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    useEffect(() => {
        const fetchSeatsData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/v1/seats?scheduleId=${scheduleId}`);
                if (response.data.status === 200) {
                    setSeatsData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching seat data:", error);
            }
        };
        fetchSeatsData();
    }, [scheduleId, userInfo.isAuthenticated]);

    const toggleSeatSelection = (seat: Seat) => {
        if (selectedSeats.some(s => s.seatId === seat.seatId)) {
            setSelectedSeats(prev => prev.filter(s => s.seatId !== seat.seatId));
        } else {
            setSelectedSeats(prev => [...prev, seat]);
        }
    };

    const renderSeats = (seats: Seat[][]) => (
        seats.map((row, rowIndex) => (
            <Box key={rowIndex} display="flex" gap={2} mt={1}>
                {row.map(seat => (
                    <Box sx={{ cursor: seat.isAvailable ? "pointer" : "not-allowed" }} onClick={() => seat.isAvailable && toggleSeatSelection(seat)}>
                        {selectedSeats.some(s => s.seatId === seat.seatId) ? <SelectedSeat /> : (seat.isAvailable ? <EmptySeat /> : <BlockedSeat />)}
                    </Box>
                ))}
            </Box>
        ))
    );

    return (
        <Box display="flex" flexDirection="column" justifyContent="space-around" gap={3}>
            <Divider />
            <Stepper activeStep={activeStep} sx={{ minWidth: "600px", margin: "auto" }}>
                {steps.map((label, index) => {
                    const stepProps: { completed?: boolean } = {};
                    const labelProps: { optional?: React.ReactNode } = {};
                    return (
                        <Step key={label} {...stepProps}>
                            <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            <Divider />
            <Box display="flex">
                <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                    <Box display="flex" flexDirection="column">
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: "16px", color: "black" }}>
                            Chú thích
                        </Typography>
                        <Box gap={3} display="flex" flexDirection="column">
                            <div className="flex gap-1 items-center text-sm">
                                <BlockedSeat />
                                <p>Ghế không bán</p>
                            </div>
                            <div className="flex gap-1 items-center text-sm">
                                <SelectedSeat />
                                <p>Đang chọn</p>
                            </div>
                            <div className="flex gap-1 items-center text-sm">
                                <EmptySeat />
                                <p>Còn trống</p>
                            </div>
                        </Box>
                    </Box>
                </Box>

                {/* Floors */}
                <Box display="flex" gap={2} minWidth="416px">
                    {/* Floor 1 */}
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: "16px", color: "black" }}>
                            Tầng dưới
                        </Typography>
                        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                width: seatsData?.floor_1 && seatsData?.floor_1[0].length === 2 ? "160px" : "200px",
                                height: "300px",
                                backgroundColor: "rgb(242, 242, 242)",
                                padding: "24px 0 24px 0",
                                borderTopLeftRadius: "40px",
                                borderTopRightRadius: "40px",
                            }}>
                                <Box sx={{ alignSelf: "start", ml: seatsData?.floor_1 && seatsData?.floor_1[0].length === 2 ? 5 : 3.5, mb: 1, pointerEvents: "none", cursor: "not-allowed" }}>
                                    <Wheel />
                                </Box>
                                <Box>
                                    {seatsData?.floor_1 && renderSeats(seatsData.floor_1)}
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Floor 2 */}
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: "16px", color: "black" }}>
                            Tầng trên
                        </Typography>
                        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                width: seatsData?.floor_1 && seatsData?.floor_1[0].length === 2 ? "160px" : "200px",
                                height: "300px",
                                backgroundColor: "rgb(242, 242, 242)",
                                padding: "24px 0 24px 0",
                                borderTopLeftRadius: "40px",
                                borderTopRightRadius: "40px",
                            }}>
                                <Box sx={{ width: "100%", height: "50px", alignSelf: "start", ml: 1, mb: 4 }}></Box>
                                <Box>
                                    {seatsData?.floor_2 && renderSeats(seatsData.floor_2)}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Footer: Total and Continue button */}
            <Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" gap={2} alignItems="center" marginTop={3}>
                <Button 
                    sx={{
                        textTransform: "none",
                        backgroundColor: "white", 
                        border: "1px solid", 
                        padding: "6px 12px",
                        fontSize: "14px",
                        color: "black",
                        display: activeStep === 0 ? "none" : "flex", // Dùng flex để căn chỉnh
                        alignItems: "center", 
                        justifyContent: "center", 
                        width: "120px", 
                        "&:hover": {
                            color: "rgb(98, 180, 246)", 
                            borderColor: "rgb(98, 180, 246)", 
                        },
                    }} 
                    onClick={handleBack}
                    startIcon={
                        <ArrowBackIosIcon 
                            fontSize="small" // Kích thước icon nhỏ
                            sx={{ marginRight: "4px" }} // Khoảng cách giữa icon và chữ
                        />
                    }
                >
                    Quay lại
                </Button>

                    <Box display="flex" justifyContent="flex-end" gap={2} alignItems="center" marginTop={3}>
                        <div>
                            <p className="inline-block text-sm">Tổng cộng: </p>
                            <span style={{ color: "rgb(0, 96, 196)", fontWeight: "bold", fontSize: "14px" }}>
                                0đ
                            </span>
                        </div>
                        <Button sx={{
                            textTransform: "none",
                            backgroundColor: "rgb(0, 96, 196)",
                            color: "white",
                            padding: "6px 12px",
                            fontSize: "14px",
                        }} onClick={handleNext}>
                            Tiếp tục
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default SeatSelect;
