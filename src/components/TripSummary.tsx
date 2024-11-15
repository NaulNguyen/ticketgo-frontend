import React, { useState } from "react";
import { Box, Divider, IconButton, Typography } from "@mui/material";
import { LocationRoute } from "./IconSVG";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";

interface EstimatedPrice {
  totalPrice: number;
  unitPrice: number;
  quantity: number;
  seatNumbers: string[];
}

interface TripInfo {
  departureTime: string;
  licensePlate: string;
  busType: string;
  pickupTime: string;
  pickupLocation: string;
  dropoffTime: string;
  dropoffLocation: string;
}

interface TripSummaryProps {
  tripInfo: TripInfo;
  estimatedPrice: EstimatedPrice;
}

const TripSummary: React.FC<TripSummaryProps> = ({ tripInfo, estimatedPrice }) => {
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  const handlePriceBoxClick = () => {
    setShowPriceDetails((prev) => !prev);
  };

  const formattedDepartureTime =
    tripInfo.departureTime && !isNaN(new Date(tripInfo.departureTime).getTime())
      ? format(new Date(tripInfo.departureTime), "EEE, dd/MM/yyyy", { locale: vi })
      : "Ngày không hợp lệ";

  const formatTime = (time: string) => {
    const date = new Date(time);
    return !isNaN(date.getTime()) ? format(date, "HH:mm") : "N/A";
  };

  return (
    <Box sx={{ width: "375px", padding: 2, borderRadius: 2 }}>
      {/* Price Summary */}
      <Box
        sx={{
          backgroundColor: "white",
          alignItems: "center",
          padding: 2,
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          cursor: "pointer",
        }}
        onClick={handlePriceBoxClick}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: "700", fontSize: "18px" }}>Tạm tính</Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography sx={{ fontWeight: "bold", color: "#2474e5", fontSize: "18px" }}>
              {new Intl.NumberFormat("en-US").format(estimatedPrice?.totalPrice || 0)}đ
            </Typography>
            <IconButton sx={{ "&:hover": { backgroundColor: "transparent" }, padding: "0" }}>
              {showPriceDetails ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Box>
        </Box>
        {showPriceDetails && (
          <Box sx={{ marginTop: 2, display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: "14px" }}>Giá vé</Typography>
            <Box display="flex" flexDirection="column" alignItems="flex-end">
              <Typography sx={{ fontSize: "14px" }}>
                {new Intl.NumberFormat("en-US").format(estimatedPrice?.unitPrice || 0)}đ x{" "}
                {estimatedPrice?.quantity || 1}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "rgb(133, 133, 133)" }}>
                Mã ghế/giường: {estimatedPrice?.seatNumbers?.join(", ") || "N/A"}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Trip Information */}
      <Box
        sx={{
          marginTop: 2,
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          minHeight: "300px",
        }}
      >
        <Typography sx={{ fontWeight: "bold", fontSize: "18px", marginBottom: 2 }}>
          Thông tin chuyến đi
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            fontSize: "12px",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <DirectionsBusIcon sx={{ color: "#2474e5", ml: 1 }} />
            <Typography sx={{ fontWeight: "700", paddingY: "12px" }}>
              {formattedDepartureTime}
            </Typography>
          </Box>
          <Divider />

          <Box sx={{ display: "flex", gap: 2, alignItems: "center", paddingX: "12px", paddingTop: "12px" }}>
            <img
              src="https://static.vexere.com/production/images/1682389349632.jpeg"
              alt="xe"
              style={{ height: "36px", width: "58px", borderRadius: 4 }}
            />
            <Box>
              <Typography sx={{ fontWeight: "700" }}>{tripInfo?.licensePlate || "N/A"}</Typography>
              <Typography sx={{ color: "gray", fontSize: "14px" }}>
                {tripInfo?.busType || "N/A"}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ marginY: 2 }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: "12px",
              paddingX: "12px",
              gap: "15px",
            }}
          >
            <Box display="flex" flexDirection="column" gap={3.5}>
              <Typography sx={{ fontWeight: "bold" }}>{formatTime(tripInfo?.pickupTime)}</Typography>
              <Typography sx={{ fontWeight: "bold" }}>{formatTime(tripInfo?.dropoffTime)}</Typography>
            </Box>

            <Box 
                sx={{
                    display: "flex",
                    justifyContent: "center", 
                    alignItems: "center",
                    width: 50,
                    height: 50,
                }}>
                <LocationRoute />
            </Box>

            <Box display="flex" flexDirection="column" gap={3.5}>
              <Typography sx={{ fontWeight: "700" }}>{tripInfo?.pickupLocation || "N/A"}</Typography>
              <Typography sx={{ fontWeight: "700" }}>{tripInfo?.dropoffLocation || "N/A"}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TripSummary;
