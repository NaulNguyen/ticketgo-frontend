import {
    Box,
    Button,
    Divider,
    Modal,
    Radio,
    Step,
    StepLabel,
    Stepper,
    Tooltip,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { BlockedSeat, EmptySeat, SelectedSeat, Wheel } from "../IconSVG";
import axios from "axios";
import useAppAccessor from "../../hook/useAppAccessor";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { booking } from "../../actions/user.action";
import { axiosWithJWT } from "../../config/axiosConfig";
import UserService from "../../service/UserService";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddressPopup from "../../popup/AddressPopup";
import { calculateDistance } from "../../utils/calculateDistance";
import MapPopup from "../../popup/MapPopup";

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

interface BookingStepResponse {
    step: number;
    vnPayUrl: string | null;
}

interface Location {
    address: string;
    lat: number;
    lon: number;
}

interface Coordinates {
    lat: number;
    lon: number;
}

const SeatSelect: React.FC<SeatSelectProps> = ({ scheduleId, price }) => {
    const [seatsData, setSeatsData] = useState<FloorData | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
    const [activeStep, setActiveStep] = React.useState(0);
    const [routeStops, setRouteStops] = useState<RouteStopsData | null>(null);
    const [selectedPickup, setSelectedPickup] = useState<number | null>(null);
    const [selectedDropoff, setSelectedDropoff] = useState<number | null>(null);
    const [isBookingSaved, setIsBookingSaved] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pickupAddress, setPickupAddress] = useState<Location | null>(null);
    const [dropoffAddress, setDropoffAddress] = useState<Location | null>(null);
    const [isPickupAddressModalOpen, setIsPickupAddressModalOpen] =
        useState(false);
    const [isDropoffAddressModalOpen, setIsDropoffAddressModalOpen] =
        useState(false);

    const [isMapOpen, setIsMapOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{
        name: string;
        lat: number;
        lon: number;
    } | null>(null);

    const [stopCoordinates, setStopCoordinates] = useState<
        Map<number, Coordinates>
    >(new Map());
    const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(
        null
    );

    const steps = ["Chỗ mong muốn", "Điểm đón trả"];
    const priceFormatted = new Intl.NumberFormat("en-US").format(price);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { getUserInfor } = useAppAccessor();
    const userInfo = getUserInfor();

    useEffect(() => {
        const checkBookingStep = async () => {
            if (!selectedSeat) return;

            try {
                const response = await axiosWithJWT.get<{
                    status: number;
                    message: string;
                    data: BookingStepResponse;
                }>(
                    `https://ticketgo.site/api/v1/bookings/step?scheduleId=${scheduleId}`
                );

                const { step, vnPayUrl } = response.data.data;

                switch (step) {
                    case 1:
                        if (
                            selectedSeats.some(
                                (s) => s.ticketCode === selectedSeat.ticketCode
                            )
                        ) {
                            setSelectedSeats((prev) =>
                                prev.filter(
                                    (s) =>
                                        s.ticketCode !== selectedSeat.ticketCode
                                )
                            );
                        } else {
                            setSelectedSeats((prev) => [...prev, selectedSeat]);
                        }
                        break;

                    case 2:
                        setIsModalOpen(true);
                        break;

                    case 3:
                        setIsModalOpen(true);
                        if (vnPayUrl) {
                            window.localStorage.setItem("vnPayUrl", vnPayUrl);
                        }
                        break;

                    default:
                        console.error("Unknown booking step:", step);
                        break;
                }
            } catch (error) {
                console.error("Error checking booking step:", error);
                toast.error(
                    "Không thể kiểm tra trạng thái đặt vé. Vui lòng thử lại sau."
                );
            } finally {
                setSelectedSeat(null);
            }
        };

        checkBookingStep();
    }, [selectedSeat, selectedSeats, scheduleId]);

    const handleModalContinue = () => {
        const vnPayUrl = window.localStorage.getItem("vnPayUrl");
        if (vnPayUrl) {
            window.location.href = vnPayUrl;
            window.localStorage.removeItem("vnPayUrl");
        } else {
            navigate(`/payment-method?scheduleId=${scheduleId}`);
        }
        setIsModalOpen(false);
    };

    const handleNext = async () => {
        if (activeStep === 1) {
            if (!selectedPickup || !selectedDropoff) {
                toast.error("Vui lòng chọn điểm đón và điểm trả");
                return;
            }

            if (!selectedSeats || selectedSeats.length === 0) {
                toast.error("Vui lòng chọn ghế");
                return;
            }
            try {
                const requestData = {
                    ticketCodes: selectedSeats.map((seat) => seat.ticketCode),
                    pickupStopId: selectedPickup,
                    dropoffStopId: selectedDropoff,
                    scheduleId: scheduleId,
                };
                await UserService.savePriceAndTripInfo(requestData);
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                toast.success("Lưu thông tin đặt vé thành công");
            } catch (error: any) {
                console.error("Error saving booking info:", error);
                toast.error(
                    error.response?.data?.message ||
                        "Có lỗi xảy ra khi lưu thông tin đặt vé"
                );
            }
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handlePickupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPickup(Number(event.target.value));
    };

    const handleDropoffChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSelectedDropoff(Number(event.target.value));
    };

    const calculateTotalPrice = () => {
        return selectedSeats.length * price;
    };

    const parseLocation = (location: string) => {
        const match = location.match(/(.*?)\s*\((.*?)\)/);
        if (match) {
            return {
                mainLocation: match[1].trim(),
                detailLocation: match[2].trim(),
            };
        }
        return {
            mainLocation: location,
            detailLocation: "",
        };
    };

    useEffect(() => {
        if (activeStep === 2) {
            navigate(`/booking-confirm?scheduleId=${scheduleId}`);
        }
    }, [activeStep, navigate, scheduleId]);

    useEffect(() => {
        const fetchSeatsData = async () => {
            try {
                const response = await axios.get(
                    `https://ticketgo.site/api/v1/seats?scheduleId=${scheduleId}`
                );
                if (response.data.status === 200) {
                    setSeatsData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching seat data:", error);
            }
        };
        fetchSeatsData();
        const intervalId = setInterval(fetchSeatsData, 1000);

        return () => clearInterval(intervalId);
    }, [scheduleId]);

    useEffect(() => {
        if (activeStep === 1) {
            const fetchStopsWithCoordinates = async () => {
                try {
                    const response = await axios.get(
                        `https://ticketgo.site/api/v1/route-stops?scheduleId=${scheduleId}`
                    );
                    setRouteStops(response.data.data);

                    // Create a Map to store unique addresses
                    const uniqueAddresses = new Map<string, number[]>();

                    // Group stopIds by detail location
                    [
                        ...response.data.data.pickup,
                        ...response.data.data.dropoff,
                    ].forEach((stop) => {
                        const { detailLocation } = parseLocation(stop.location);
                        if (!uniqueAddresses.has(detailLocation)) {
                            uniqueAddresses.set(detailLocation, [stop.stopId]);
                        } else {
                            uniqueAddresses
                                .get(detailLocation)
                                ?.push(stop.stopId);
                        }
                    });

                    // Fetch coordinates only once for each unique address
                    const coordinates = new Map<number, Coordinates>();
                    for (const [
                        address,
                        stopIds,
                    ] of uniqueAddresses.entries()) {
                        const coords = await fetchStopCoordinates(address);
                        if (coords) {
                            stopIds.forEach((stopId: any) => {
                                coordinates.set(stopId, coords);
                            });
                        }
                    }
                    setStopCoordinates(coordinates);
                } catch (error) {
                    console.error("Failed to fetch route stops", error);
                }
            };
            fetchStopsWithCoordinates();
        }
    }, [scheduleId, activeStep]);

    useEffect(() => {
        const saveBooking = async () => {
            if (
                selectedSeats.length > 0 &&
                selectedPickup !== null &&
                selectedDropoff !== null
            ) {
                const bookingData = {
                    scheduleId,
                    ticketCodes: selectedSeats.map((seat) => seat.ticketCode),
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
    }, [
        activeStep,
        selectedSeats,
        selectedPickup,
        selectedDropoff,
        scheduleId,
        isBookingSaved,
        dispatch,
    ]);

    const toggleSeatSelection = (seat: Seat) => {
        if (!userInfo.isAuthenticated) {
            toast.warn("Vui lòng đăng nhập để chọn ghế");
            return;
        }
        setSelectedSeat(seat); // Set the clicked seat
    };

    const truncateAddress = (address: string, maxLength: number = 30) => {
        if (!address) return "";
        if (address.length <= maxLength) return address;
        return `${address.substring(0, maxLength)}...`;
    };

    const handleMapClick = (stop: RouteStop) => {
        const coords = stopCoordinates.get(stop.stopId);
        if (coords) {
            setSelectedLocation({
                name: parseLocation(stop.location).mainLocation,
                lat: coords.lat,
                lon: coords.lon,
            });
            setIsMapOpen(true);
        }
    };

    const fetchStopCoordinates = async (
        address: string
    ): Promise<Coordinates | null> => {
        try {
            const { mainLocation, detailLocation } = parseLocation(address);
            const encodedAddress = encodeURIComponent(address);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                };
            }
            console.warn("No results found for address:", address);
            return null;
        } catch (error) {
            console.error("Error fetching coordinates:", error);
            return null;
        }
    };

    const renderSeats = (seats: Seat[][]) =>
        seats.map((row, rowIndex) => (
            <Box key={rowIndex} display="flex" gap={2} mt={1}>
                {row.map((seat) => (
                    <Tooltip
                        key={seat.ticketCode}
                        title={`Mã ghế: ${seat.seatNumber} - Giá: ${priceFormatted}đ`}
                        placement="top"
                        arrow
                        slotProps={{
                            popper: {
                                modifiers: [
                                    {
                                        name: "offset",
                                        options: {
                                            offset: [0, -10],
                                        },
                                    },
                                ],
                            },
                        }}
                    >
                        <Box
                            sx={{
                                cursor: seat.isAvailable
                                    ? "pointer"
                                    : "not-allowed",
                            }}
                            onClick={() =>
                                seat.isAvailable && toggleSeatSelection(seat)
                            }
                        >
                            {selectedSeats.some(
                                (s) => s.ticketCode === seat.ticketCode
                            ) ? (
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
        ));

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-around"
            gap={3}
        >
            <Divider />
            <Stepper
                activeStep={activeStep}
                sx={{ minWidth: "600px", margin: "auto" }}
            >
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
                    <Box
                        flex={1}
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Box display="flex" flexDirection="column">
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ fontSize: "16px", color: "black" }}
                            >
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
                        <Box
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ fontSize: "16px", color: "black" }}
                            >
                                Tầng dưới
                            </Typography>
                            <Box
                                flex={1}
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width:
                                            seatsData?.floor_1 &&
                                            seatsData?.floor_1[0].length === 2
                                                ? "160px"
                                                : "200px",
                                        height: "300px",
                                        backgroundColor: "rgb(242, 242, 242)",
                                        padding: "24px 0 24px 0",
                                        borderTopLeftRadius: "40px",
                                        borderTopRightRadius: "40px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            alignSelf: "start",
                                            ml:
                                                seatsData?.floor_1 &&
                                                seatsData?.floor_1[0].length ===
                                                    2
                                                    ? 5
                                                    : 3.5,
                                            mb: 1,
                                            pointerEvents: "none",
                                            cursor: "not-allowed",
                                        }}
                                    >
                                        <Wheel />
                                    </Box>
                                    <Box>
                                        {seatsData?.floor_1 &&
                                            renderSeats(seatsData.floor_1)}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Floor 2 */}
                        <Box
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ fontSize: "16px", color: "black" }}
                            >
                                Tầng trên
                            </Typography>
                            <Box
                                flex={1}
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width:
                                            seatsData?.floor_1 &&
                                            seatsData?.floor_1[0].length === 2
                                                ? "160px"
                                                : "200px",
                                        height: "300px",
                                        backgroundColor: "rgb(242, 242, 242)",
                                        padding: "24px 0 24px 0",
                                        borderTopLeftRadius: "40px",
                                        borderTopRightRadius: "40px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: "100%",
                                            height: "50px",
                                            alignSelf: "start",
                                            ml: 1,
                                            mb: 4,
                                        }}
                                    ></Box>
                                    <Box>
                                        {seatsData?.floor_2 &&
                                            renderSeats(seatsData.floor_2)}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                {activeStep > 0 && routeStops && (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        mt={2}
                    >
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            gap={2}
                        >
                            <Box>
                                <Box
                                    display={"flex"}
                                    sx={{ justifyContent: "space-between" }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ mb: 2 }}
                                        fontSize={18}
                                        fontWeight={700}
                                    >
                                        Điểm đón
                                    </Typography>
                                    <Box>
                                        <Typography sx={{ fontSize: "14px" }}>
                                            Điểm đón nào gần bạn nhất?
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: "14px",
                                                color: "#1976d2",
                                                fontWeight: 600,
                                                textDecoration: "underline",
                                                cursor: "pointer",
                                            }}
                                            onClick={() =>
                                                setIsPickupAddressModalOpen(
                                                    true
                                                )
                                            }
                                        >
                                            {pickupAddress
                                                ? truncateAddress(
                                                      pickupAddress.address
                                                  )
                                                : "Nhập địa chỉ điểm đón"}
                                        </Typography>

                                        <AddressPopup
                                            open={isPickupAddressModalOpen}
                                            onClose={() =>
                                                setIsPickupAddressModalOpen(
                                                    false
                                                )
                                            }
                                            onSelectAddress={(
                                                location: Location
                                            ) => {
                                                setPickupAddress(location);
                                                setUserCoordinates({
                                                    lat: location.lat,
                                                    lon: location.lon,
                                                });
                                                setIsPickupAddressModalOpen(
                                                    false
                                                );
                                            }}
                                        />
                                    </Box>
                                </Box>
                                <Box
                                    sx={{
                                        maxHeight: "450px",
                                        overflowY: "auto",
                                        paddingRight: "10px",
                                    }}
                                >
                                    {routeStops.pickup.map((stop, index) => {
                                        const arrivalTime = new Date(
                                            stop.arrivalTime
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                        });
                                        const { mainLocation, detailLocation } =
                                            parseLocation(stop.location);

                                        return (
                                            <Box
                                                key={index}
                                                display="flex"
                                                alignItems="flex-start"
                                                sx={{
                                                    paddingTop: "13px",
                                                    position: "relative",
                                                    border:
                                                        selectedPickup ===
                                                        stop.stopId
                                                            ? "1px solid rgba(25,118,210,0.3)"
                                                            : "1px solid transparent",
                                                    "&::before":
                                                        selectedPickup ===
                                                        stop.stopId
                                                            ? {
                                                                  content: '""',
                                                                  position:
                                                                      "absolute",
                                                                  left: 0,
                                                                  top: 0,
                                                                  bottom: 0,
                                                                  width: "4px",
                                                                  backgroundColor:
                                                                      "#1976d2",
                                                                  borderTopLeftRadius:
                                                                      "8px",
                                                                  borderBottomLeftRadius:
                                                                      "8px",
                                                              }
                                                            : {},
                                                    background:
                                                        selectedPickup ===
                                                        stop.stopId
                                                            ? "linear-gradient(90deg, rgba(25,118,210,0.12) 0%, rgba(25,118,210,0.06) 50%, rgba(255,255,255,0) 100%)"
                                                            : "transparent",
                                                    transition: "all 0.3s ease",
                                                    padding: "12px 16px",
                                                    borderRadius: "8px",
                                                    margin: "4px 0",
                                                    "&:hover": {
                                                        border: "1px solid rgba(25,118,210,0.2)",
                                                        background:
                                                            "linear-gradient(90deg, rgba(25,118,210,0.08) 0%, rgba(25,118,210,0.03) 50%, rgba(255,255,255,0) 100%)",
                                                    },
                                                }}
                                            >
                                                <Radio
                                                    sx={{
                                                        "&.Mui-checked": {
                                                            color: "#1976d2",
                                                        },
                                                    }}
                                                    value={stop.stopId}
                                                    name={`pickup-stop-${index}`}
                                                    checked={
                                                        selectedPickup ===
                                                        stop.stopId
                                                    }
                                                    onChange={
                                                        handlePickupChange
                                                    }
                                                />
                                                <Box>
                                                    <Typography
                                                        display="flex"
                                                        alignItems="center"
                                                        sx={{ mb: 0.5 }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontWeight:
                                                                    "bold",
                                                                marginRight:
                                                                    "8px",
                                                                marginTop:
                                                                    "9px",
                                                            }}
                                                        >
                                                            {arrivalTime}
                                                        </span>
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            fontSize: "16px",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {mainLocation}
                                                    </Typography>
                                                    {detailLocation && (
                                                        <>
                                                            <Typography
                                                                sx={{
                                                                    fontSize:
                                                                        "0.85rem",
                                                                    color: "text.secondary",
                                                                }}
                                                            >
                                                                {detailLocation}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </Box>
                                                <Box
                                                    sx={{
                                                        padding:
                                                            "24px 10px 24px 10px",
                                                    }}
                                                >
                                                    <LocationOnIcon
                                                        sx={{
                                                            textAlign: "center",
                                                            color: "#1976d2",
                                                            marginLeft: "10px",
                                                        }}
                                                    />
                                                    <Typography
                                                        sx={{
                                                            fontSize: "14px",
                                                            width: "80px",
                                                            color: "#1976d2",
                                                            fontWeight: 600,
                                                            textDecoration:
                                                                "underline",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() =>
                                                            handleMapClick(stop)
                                                        }
                                                    >
                                                        {userCoordinates &&
                                                        stopCoordinates.has(
                                                            stop.stopId
                                                        ) ? (
                                                            <>
                                                                {calculateDistance(
                                                                    pickupAddress?.lat ||
                                                                        0,
                                                                    pickupAddress?.lon ||
                                                                        0,
                                                                    stopCoordinates.get(
                                                                        stop.stopId
                                                                    )!.lat,
                                                                    stopCoordinates.get(
                                                                        stop.stopId
                                                                    )!.lon
                                                                ).toFixed(
                                                                    1
                                                                )}{" "}
                                                                km
                                                            </>
                                                        ) : (
                                                            "Bản đồ"
                                                        )}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                            <Divider orientation="vertical" flexItem />
                            <Box>
                                <Box
                                    display={"flex"}
                                    sx={{ justifyContent: "space-between" }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ mb: 2 }}
                                        fontSize={18}
                                        fontWeight={700}
                                    >
                                        Điểm trả
                                    </Typography>
                                    <Box>
                                        <Typography sx={{ fontSize: "14px" }}>
                                            Điểm trả nào gần bạn nhất?
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: "14px",
                                                color: "#1976d2",
                                                fontWeight: 600,
                                                textDecoration: "underline",
                                                cursor: "pointer",
                                            }}
                                            onClick={() =>
                                                setIsDropoffAddressModalOpen(
                                                    true
                                                )
                                            }
                                        >
                                            {dropoffAddress
                                                ? truncateAddress(
                                                      dropoffAddress.address
                                                  )
                                                : "Nhập địa chỉ điểm trả"}
                                        </Typography>

                                        <AddressPopup
                                            open={isDropoffAddressModalOpen}
                                            onClose={() =>
                                                setIsDropoffAddressModalOpen(
                                                    false
                                                )
                                            }
                                            onSelectAddress={(
                                                location: Location
                                            ) => {
                                                setDropoffAddress(location);
                                                setUserCoordinates({
                                                    lat: location.lat,
                                                    lon: location.lon,
                                                });
                                                setIsDropoffAddressModalOpen(
                                                    false
                                                );
                                            }}
                                        />
                                    </Box>
                                </Box>
                                <Box
                                    sx={{
                                        maxHeight: "450px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {routeStops.dropoff.map((stop, index) => {
                                        const arrivalTime = new Date(
                                            stop.arrivalTime
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                        });
                                        const { mainLocation, detailLocation } =
                                            parseLocation(stop.location);
                                        return (
                                            <Box
                                                key={index}
                                                display="flex"
                                                alignItems="flex-start"
                                                sx={{
                                                    paddingTop: "13px",
                                                    position: "relative",
                                                    border:
                                                        selectedDropoff ===
                                                        stop.stopId
                                                            ? "1px solid rgba(25,118,210,0.3)"
                                                            : "1px solid transparent",
                                                    "&::before":
                                                        selectedDropoff ===
                                                        stop.stopId
                                                            ? {
                                                                  content: '""',
                                                                  position:
                                                                      "absolute",
                                                                  left: 0,
                                                                  top: 0,
                                                                  bottom: 0,
                                                                  width: "4px",
                                                                  backgroundColor:
                                                                      "#1976d2",
                                                                  borderTopLeftRadius:
                                                                      "8px",
                                                                  borderBottomLeftRadius:
                                                                      "8px",
                                                              }
                                                            : {},
                                                    background:
                                                        selectedDropoff ===
                                                        stop.stopId
                                                            ? "linear-gradient(90deg, rgba(25,118,210,0.12) 0%, rgba(25,118,210,0.06) 50%, rgba(255,255,255,0) 100%)"
                                                            : "transparent",
                                                    transition: "all 0.3s ease",
                                                    padding: "12px 16px",
                                                    borderRadius: "8px",
                                                    margin: "4px 0",
                                                    "&:hover": {
                                                        border: "1px solid rgba(25,118,210,0.2)",
                                                        background:
                                                            "linear-gradient(90deg, rgba(25,118,210,0.08) 0%, rgba(25,118,210,0.03) 50%, rgba(255,255,255,0) 100%)",
                                                    },
                                                }}
                                            >
                                                {/* Radio Button */}
                                                <Radio
                                                    sx={{
                                                        "&.Mui-checked": {
                                                            color: "#1976d2",
                                                        },
                                                    }}
                                                    value={stop.stopId}
                                                    name={`dropoff-stop-${index}`}
                                                    checked={
                                                        selectedDropoff ===
                                                        stop.stopId
                                                    }
                                                    onChange={
                                                        handleDropoffChange
                                                    }
                                                />
                                                <Box>
                                                    <Typography
                                                        display="flex"
                                                        alignItems="center"
                                                        sx={{ mb: 0.5 }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontWeight:
                                                                    "bold",
                                                                marginRight:
                                                                    "8px",
                                                                marginTop:
                                                                    "9px",
                                                            }}
                                                        >
                                                            {arrivalTime}
                                                        </span>
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            fontSize: "16px",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {mainLocation}
                                                    </Typography>
                                                    {detailLocation && (
                                                        <>
                                                            <Typography
                                                                sx={{
                                                                    fontSize:
                                                                        "0.85rem",
                                                                    color: "text.secondary",
                                                                }}
                                                            >
                                                                {detailLocation}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </Box>
                                                <Box
                                                    sx={{
                                                        padding:
                                                            "24px 10px 24px 10px",
                                                    }}
                                                >
                                                    <LocationOnIcon
                                                        sx={{
                                                            textAlign: "center",
                                                            color: "#1976d2",
                                                            marginLeft: "10px",
                                                        }}
                                                    />
                                                    <Typography
                                                        sx={{
                                                            fontSize: "14px",
                                                            width: "80px",
                                                            color: "#1976d2",
                                                            fontWeight: 600,
                                                            textDecoration:
                                                                "underline",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() =>
                                                            handleMapClick(stop)
                                                        }
                                                    >
                                                        {userCoordinates &&
                                                        stopCoordinates.has(
                                                            stop.stopId
                                                        ) ? (
                                                            <>
                                                                {calculateDistance(
                                                                    dropoffAddress?.lat ||
                                                                        0,
                                                                    dropoffAddress?.lon ||
                                                                        0,
                                                                    stopCoordinates.get(
                                                                        stop.stopId
                                                                    )!.lat,
                                                                    stopCoordinates.get(
                                                                        stop.stopId
                                                                    )!.lon
                                                                ).toFixed(
                                                                    1
                                                                )}{" "}
                                                                km
                                                            </>
                                                        ) : (
                                                            "Bản đồ"
                                                        )}
                                                    </Typography>
                                                </Box>
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
                <Box
                    display="flex"
                    justifyContent="space-between"
                    gap={2}
                    alignItems="center"
                    marginTop={3}
                >
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

                    <Box
                        display="flex"
                        justifyContent="flex-end"
                        gap={2}
                        alignItems="center"
                    >
                        <div>
                            <p className="inline-block text-sm mr-1">
                                Tổng cộng:{" "}
                            </p>
                            <span
                                style={{
                                    color: "rgb(0, 96, 196)",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                }}
                            >
                                {new Intl.NumberFormat("en-US").format(
                                    calculateTotalPrice()
                                )}
                                đ
                            </span>
                        </div>
                        {(selectedSeats.length > 0 &&
                            activeStep === 0 &&
                            !isModalOpen) ||
                        (activeStep === 1 &&
                            selectedPickup &&
                            selectedDropoff) ? (
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
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                aria-labelledby="confirm-exit-title"
                aria-describedby="confirm-exit-description"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "90%",
                        maxWidth: "520px",
                        height: "200px",
                        bgcolor: "white",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: "10px",
                        textAlign: "center",
                        outline: "none",
                    }}
                >
                    <Typography
                        id="confirm-exit-title"
                        variant="h6"
                        fontWeight={700}
                    >
                        Bạn có đặt chỗ chưa hoàn tất
                    </Typography>
                    <Typography id="confirm-exit-description" sx={{ mt: 2 }}>
                        Vui lòng hoàn tất giao dịch trước khi đặt vé mới!
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 3,
                            gap: 2,
                            flexDirection: "column",
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={handleModalContinue}
                            sx={{
                                backgroundColor: "rgb(255, 211, 51)",
                                textTransform: "none",
                                color: "black",
                                border: "none",
                            }}
                        >
                            Tiếp tục thanh toán
                        </Button>
                    </Box>
                </Box>
            </Modal>
            {selectedLocation && (
                <MapPopup
                    open={isMapOpen}
                    onClose={() => {
                        setIsMapOpen(false);
                        setSelectedLocation(null);
                    }}
                    location={selectedLocation}
                />
            )}
        </Box>
    );
};

export default SeatSelect;
