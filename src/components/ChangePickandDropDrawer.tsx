import {
    Box,
    Divider,
    Drawer,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface ChangePickandDropDrawerProps {
    open: boolean;
    onClose: () => void;
    title: string;
}

const ChangePickandDropDrawer: React.FC<ChangePickandDropDrawerProps> = ({
    open,
    onClose,
    title,
}) => {
    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: "400px" }}>
                <Box
                    display="flex"
                    alignItems="center"
                    sx={{
                        marginBottom: 2,
                        backgroundColor: "#2474e5",
                        height: "72px",
                        paddingX: "20px",
                    }}>
                    <ArrowBackIcon onClick={onClose} sx={{ cursor: "pointer", color: "white" }} />
                    <Typography
                        variant="h6"
                        sx={{ marginLeft: 1, color: "white", fontWeight: "bold" }}>
                        {title}
                    </Typography>
                </Box>

                <RadioGroup sx={{ display: "flex", flexDirection: "column", paddingX: "20px" }}>
                    <FormControlLabel
                        value="pick1"
                        control={<Radio />}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: "8px",
                        }}
                        label={
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: 1,
                                    alignItems: "center",
                                }}>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "18px",
                                        color: "#333",
                                    }}>
                                    17:30
                                </Typography>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "16px",
                                        color: "#555",
                                    }}>
                                    Trạm Đà Lạt
                                </Typography>
                            </Box>
                        }
                    />
                    <Divider />
                    <FormControlLabel
                        value="pick2"
                        control={<Radio />}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: "8px",
                        }}
                        label={
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: 1,
                                    alignItems: "center",
                                }}>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "18px",
                                        color: "#333",
                                    }}>
                                    17:30
                                </Typography>
                                <Typography
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "16px",
                                        color: "#555",
                                    }}>
                                    Trạm Đà Lạt
                                </Typography>
                            </Box>
                        }
                    />
                    <Divider />
                </RadioGroup>
            </Box>
        </Drawer>
    );
};

export default ChangePickandDropDrawer;
