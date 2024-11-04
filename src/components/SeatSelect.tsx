import { Box, Button, Container, Divider, Typography } from "@mui/material";
import React from "react";
import { BlockedSeat, EmptySeat, SelectedSeat, Wheel } from "./IconSVG";

const SeatSelect = () => {
    return (
        <Box display="flex" flexDirection="column" justifyContent="space-around" gap={3}>
            <Box display="flex">
                <Box
                    flex={1}
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center">
                    <Box display="flex" flexDirection="column">
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                                fontSize: "16px",
                                color: "black",
                            }}>
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

                <Box flex={1} display="flex" justifyContent="center" alignItems="center">
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "200px",
                            height: "250px",
                            backgroundColor: "rgb(242, 242, 242)",
                            padding: "24px 12px",
                        }}>
                        {/* Seat grid with manual placement */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)", // 3 columns
                                gridTemplateRows: "repeat(4, 1fr)", // 4 rows
                                gap: "8px", // Spacing between seats
                                width: "100%",
                                height: "100%",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                transition: "background-color 0.3s ease",
                            }}>
                            {/* Wheel seat */}
                            <Box ml={1}>
                                <Wheel />
                            </Box>

                            {/* Empty seats */}
                            <EmptySeat />
                            <EmptySeat />
                            <EmptySeat />
                            <EmptySeat />
                            <EmptySeat />
                            <EmptySeat />
                            <EmptySeat />
                            <EmptySeat />
                            <EmptySeat />
                            <EmptySeat />
                            <EmptySeat />
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box>
                <Divider />
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    gap={2}
                    alignItems="center"
                    marginTop={3}>
                    <div>
                        <p className="inline-block text-sm">Tổng cộng: </p>
                        <span
                            style={{
                                color: "rgb(0, 96, 196)",
                                fontWeight: "bold",
                                fontSize: "14px",
                            }}>
                            {" "}
                            0đ
                        </span>
                    </div>
                    <Button
                        sx={{
                            textTransform: "none",
                            backgroundColor: "rgb(0, 96, 196)",
                            color: "white",
                            padding: "6px 12px", // Increase padding for a larger button
                            fontSize: "14px", // Increase font size
                        }}>
                        Tiếp tục
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default SeatSelect;
