import {
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";

interface Location {
    address: string;
    lat: number;
    lon: number;
}

interface NominatimResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
}

interface AddressPopupProps {
    open: boolean;
    onClose: () => void;
    onSelectAddress: (location: Location) => void;
}

const AddressPopup = ({
    open,
    onClose,
    onSelectAddress,
}: AddressPopupProps) => {
    const [searchValue, setSearchValue] = useState("");
    const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    // Debounced search function
    const searchAddress = debounce(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&countrycodes=vn`
            );
            const data: NominatimResult[] = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Error searching address:", error);
            toast.error("Không thể tìm kiếm địa chỉ");
        } finally {
            setIsLoading(false);
        }
    }, 500);

    useEffect(() => {
        searchAddress(searchValue);
        return () => {
            searchAddress.cancel();
        };
    }, [searchValue]);

    const handleGetCurrentLocation = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
                        );
                        const data = await response.json();
                        if (data.display_name) {
                            onSelectAddress({
                                address: data.display_name,
                                lat: position.coords.latitude,
                                lon: position.coords.longitude,
                            });
                            onClose();
                        }
                    } catch (error) {
                        console.error("Error getting address:", error);
                        toast.error("Không thể lấy địa chỉ hiện tại");
                    } finally {
                        setIsLoadingLocation(false);
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    toast.error("Không thể lấy vị trí hiện tại");
                    setIsLoadingLocation(false);
                }
            );
        } else {
            toast.error("Trình duyệt không hỗ trợ định vị");
            setIsLoadingLocation(false);
        }
    };

    const handleSelectResult = (result: NominatimResult) => {
        onSelectAddress({
            address: result.display_name,
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon),
        });
        onClose();
    };

    const parseAddress = (displayName: string) => {
        const parts = displayName.split(", ");
        return {
            main: parts[0],
            detail: parts.slice(1).join(", "),
        };
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Nhập địa chỉ của bạn</DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        mt: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Button
                        startIcon={<MyLocationIcon />}
                        onClick={handleGetCurrentLocation}
                        disabled={isLoadingLocation}
                        sx={{
                            textTransform: "none",
                            color: "#1976d2",
                            "&:hover": {
                                backgroundColor: "rgba(25,118,210,0.08)",
                            },
                        }}
                    >
                        {isLoadingLocation
                            ? "Đang lấy vị trí..."
                            : "Sử dụng vị trí hiện tại"}
                    </Button>

                    <TextField
                        fullWidth
                        label="Tìm kiếm địa chỉ"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        variant="outlined"
                        InputProps={{
                            endAdornment: isLoading && (
                                <CircularProgress
                                    size={20}
                                    sx={{ color: "#1976d2" }}
                                />
                            ),
                        }}
                    />

                    {isLoading ? (
                        <Box display="flex" justifyContent="center" p={2}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : (
                        <>
                            {!isLoading && searchResults.length > 0 && (
                                <List
                                    sx={{
                                        maxHeight: 400,
                                        overflow: "auto",
                                        bgcolor: "#f8f9fa",
                                        borderRadius: 1,
                                        p: 1,
                                        "& > .MuiListItem-root:not(:last-child)":
                                            {
                                                borderBottom:
                                                    "1px solid rgba(0,0,0,0.06)",
                                            },
                                    }}
                                >
                                    {searchResults.map((result) => (
                                        <ListItem
                                            key={result.place_id}
                                            component="div"
                                            onClick={() =>
                                                handleSelectResult(result)
                                            }
                                            sx={{
                                                borderRadius: 1,
                                                cursor: "pointer",
                                                mb: 0.5,
                                                transition: "all 0.2s ease",
                                                "&:hover": {
                                                    backgroundColor:
                                                        "rgba(25,118,210,0.08)",
                                                    transform:
                                                        "translateY(-1px)",
                                                },
                                                "&:active": {
                                                    transform: "translateY(0)",
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    parseAddress(
                                                        result.display_name
                                                    ).main
                                                }
                                                secondary={
                                                    parseAddress(
                                                        result.display_name
                                                    ).detail
                                                }
                                                primaryTypographyProps={{
                                                    sx: {
                                                        fontWeight: 500,
                                                        color: "#2c3e50",
                                                    },
                                                }}
                                                secondaryTypographyProps={{
                                                    sx: {
                                                        fontSize: "0.8rem",
                                                        color: "text.secondary",
                                                        mt: 0.5,
                                                    },
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                            {!isLoading &&
                                searchResults.length === 0 &&
                                searchValue && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            textAlign: "center",
                                            color: "text.secondary",
                                            bgcolor: "#f8f9fa",
                                            borderRadius: 1,
                                        }}
                                    ></Box>
                                )}
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddressPopup;
