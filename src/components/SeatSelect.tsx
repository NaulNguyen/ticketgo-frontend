import { Box, Button, Divider, Radio, Step, StepLabel, Stepper, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { BlockedSeat, EmptySeat, SelectedSeat, Wheel } from "./IconSVG";
import axios from "axios";
import useAppAccessor from "../hook/useAppAccessor";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { booking } from "../actions/user.action";

interface Seat {
    ticketCode: string;
    seatNumber: string;
    isAvailable: boolean;
}

interface FloorData {
    floor_1: Seat[][] | undefined;
    floor_2: Seat[][] | undefined;
}

interface SeatSelectProps {
    scheduleId: string;
    price: number;
}

interface RouteStopsData {
    pickup: RouteStop[];
    dropoff: RouteStop[];
}

interface RouteStop {
    location: string;
    arrivalTime: string;
    stopId: number;
}

const SeatSelect: React.FC<SeatSelectProps> = ({ scheduleId, price }) => {
    const [seatsData, setSeatsData] = useState<FloorData | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [activeStep, setActiveStep] = React.useState(0);
    const [routeStops, setRouteStops] = useState<RouteStopsData | null>(null);
    const [selectedPickup, setSelectedPickup] = useState<number | null>(null);
    const [selectedDropoff, setSelectedDropoff] = useState<number | null>(null);
    const [isBookingSaved, setIsBookingSaved] = useState(false);

    const steps = ['Chỗ mong muốn', 'Điểm đón trả'];
    const priceFormatted = new Intl.NumberFormat('en-US').format(price);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    
    const { getUserInfor } = useAppAccessor();
    const userInfo = getUserInfor();

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handlePickupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPickup(Number(event.target.value));
    };
    
    const handleDropoffChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDropoff(Number(event.target.value));
    };

    const calculateTotalPrice = () => {
        return selectedSeats.length * price;
    };

    useEffect(() => {
        if (activeStep === 2) {
            navigate('/booking-confirm');
        }
    }, [activeStep, navigate]);

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
        console.log("fetching seat data");

        const intervalId = setInterval(fetchSeatsData, 1000);

        return () => clearInterval(intervalId);
    }, [scheduleId]);

    useEffect(() => {
        if (activeStep === 1) {
            const fetchRouteStops = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/v1/route-stops?scheduleId=${scheduleId}`);
                    setRouteStops(response.data.data);
                } catch (error) {
                    console.error("Failed to fetch route stops", error);
                }
            };
            fetchRouteStops();
        }
    }, [scheduleId, activeStep]);


    useEffect(() => {
        const saveBooking = async () => {
            if (selectedSeats.length > 0 && selectedPickup !== null && selectedDropoff !== null) {
                const bookingData = {
                    scheduleId,
                    ticketCodes: selectedSeats.map(seat => seat.ticketCode),
                    pickupStopId: selectedPickup,
                    dropOffStopId: selectedDropoff,
                };

                dispatch(booking(bookingData));
                setIsBookingSaved(true);
            }
        };

        if (activeStep === 2 && !isBookingSaved) {
            saveBooking();
        }
    }, [activeStep, selectedSeats, selectedPickup, selectedDropoff, scheduleId, isBookingSaved, dispatch]);

    const toggleSeatSelection = (seat: Seat) => {
        if (!userInfo.isAuthenticated) {
            toast.warn('Vui lòng đăng nhập để chọn ghế');
            return;
        }
        if (selectedSeats.some(s => s.ticketCode === seat.ticketCode)) {
            setSelectedSeats(prev => prev.filter(s => s.ticketCode !== seat.ticketCode));
        } else {
            setSelectedSeats(prev => [...prev, seat]);
        }
    };

    const renderSeats = (seats: Seat[][]) => (
        seats.map((row, rowIndex) => (
            <Box key={rowIndex} display="flex" gap={2} mt={1}>
                {row.map(seat => (
                    <Tooltip
                    key={seat.ticketCode}
                    title={`Mã ghế: ${seat.seatNumber} - Giá: ${priceFormatted}đ`}
                    placement="top"
                    arrow
                    slotProps={{
                        popper: {
                          modifiers: [
                            {
                              name: 'offset',
                              options: {
                                offset: [0, -10],
                              },
                            },
                          ],
                        },
                      }}
                >
                    <Box 
                        sx={{ cursor: seat.isAvailable ? "pointer" : "not-allowed" }} 
                        onClick={() => seat.isAvailable && toggleSeatSelection(seat)}
                    >
                        {selectedSeats.some((s) => s.ticketCode === seat.ticketCode) ? (
                                <SelectedSeat />
                            ) : seat.isAvailable ? (
                                <EmptySeat />
                            ) : (
                                <BlockedSeat />
                            )}
                    </Box>
                </Tooltip>
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
            <Box display="flex" justifyContent="center">
                {activeStep === 0 && (
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
                )}

                {/* Floors */}
                {activeStep === 0 && (
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
                )}

                {activeStep > 0 && routeStops && (
                                      <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                                        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
                                            <Box>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{ mb: 2 }}
                                                    fontSize={18}
                                                    fontWeight={700}
                                                >
                                                    Điểm đón
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        maxHeight: '450px', 
                                                        overflowY: 'auto',  
                                                        paddingRight: '10px', 
                                                    }}
                                                    >
                                                    {routeStops.pickup.map((stop, index) => {
                                                        const arrivalTime = new Date(stop.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                                        return (
                                                            <Box key={index} display="flex" alignItems="center" sx={{ paddingTop: '13px' }}>
                                                            {/* Radio Button */}
                                                                <Radio
                                                                   sx={{ marginRight: 2 }}
                                                                   value={stop.stopId}
                                                                   name={`pickup-stop-${index}`}
                                                                   checked={selectedPickup === stop.stopId}
                                                                   onChange={handlePickupChange}
                                                                />
                                                                <Typography display="flex" alignItems="center">
                                                                    <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
                                                                        {arrivalTime}
                                                                    </span>
                                                                    <span style={{ marginRight: '8px' }}>•</span>
                                                                    <span style={{ width: "190px" }}>{stop.location}</span>
                                                                </Typography>
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            </Box>
                                            <Divider orientation="vertical" flexItem />
                                            <Box>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{ mb: 2 }}
                                                    fontSize={18}
                                                    fontWeight={700}
                                                >
                                                    Điểm trả
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        maxHeight: '450px', 
                                                        overflowY: 'auto',  
                                                        paddingRight: '10px', 
                                                    }}
                                                    >
                                                    {routeStops.dropoff.map((stop, index) => {
                                                        const arrivalTime = new Date(stop.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                                        return (
                                                            <Box key={index} display="flex" alignItems="center" sx={{ paddingTop: '13px' }}>
                                                            {/* Radio Button */}
                                                            <Radio
                                                                sx={{ marginRight: 2 }}
                                                                value={stop.stopId}
                                                                name={`dropoff-stop-${index}`}
                                                                checked={selectedDropoff === stop.stopId}
                                                                onChange={handleDropoffChange}
                                                            />
                                                            <Typography display="flex" alignItems="center">
                                                                <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
                                                                    {arrivalTime}
                                                                </span>
                                                                <span style={{ marginRight: '8px' }}>•</span>
                                                                <span style={{ width: "190px" }}>{stop.location}</span>
                                                            </Typography>
                                                        </Box>
                                                        );
                                                    })}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
            </Box>

            {/* Footer: Total and Continue button */}
            <Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" gap={2} alignItems="center" marginTop={3}>
                    {activeStep === 0 ? (
                        <Box sx={{ width: "120px" }} /> 
                    ) : (
                        <Button 
                            sx={{
                                textTransform: "none",
                                backgroundColor: "white", 
                                border: "1px solid", 
                                padding: "6px 12px",
                                fontSize: "14px",
                                color: "black",
                                display: "flex", // Luôn dùng flex ở đây
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
                                    fontSize="small"
                                    sx={{ marginRight: "4px" }}
                                />
                            }
                        >
                            Quay lại
                        </Button>
                    )}

                    <Box display="flex" justifyContent="flex-end" gap={2} alignItems="center">
                        <div>
                            <p className="inline-block text-sm mr-1">Tổng cộng: </p>
                            <span style={{ color: "rgb(0, 96, 196)", fontWeight: "bold", fontSize: "14px" }}>
                                {new Intl.NumberFormat("en-US").format(calculateTotalPrice())}đ
                            </span>
                        </div>
                        {(selectedSeats.length > 0 && activeStep === 0) || 
                            (activeStep === 1 && selectedPickup && selectedDropoff) ? (
                                <Button
                                    sx={{
                                        textTransform: "none",
                                        backgroundColor: "rgb(0, 96, 196)",
                                        color: "white",
                                        padding: "6px 12px",
                                        fontSize: "14px",
                                    }}
                                    onClick={handleNext}
                                >
                                    Tiếp tục
                                </Button>
                            ) : null}
                    </Box>
                </Box>
            </Box>

        </Box>
    );
};

export default SeatSelect;
