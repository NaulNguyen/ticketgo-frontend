import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

interface MapPopupProps {
    open: boolean;
    onClose: () => void;
    location: {
        name: string;
        lat: number;
        lon: number;
    };
}

const MapPopup: React.FC<MapPopupProps> = ({ open, onClose, location }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle
                sx={{
                    m: 0,
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                {location.name}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ height: "500px", p: 0 }}>
                <Box sx={{ width: "100%", height: "100%" }}>
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                            location.lon - 0.01
                        }%2C${location.lat - 0.01}%2C${location.lon + 0.01}%2C${
                            location.lat + 0.01
                        }&layer=mapnik&marker=${location.lat}%2C${
                            location.lon
                        }`}
                        allowFullScreen
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default MapPopup;
