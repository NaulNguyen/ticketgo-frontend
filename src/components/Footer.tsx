import React, { useEffect, useState } from "react";
import { Box, Typography, Link } from "@mui/material";
import axios from "axios";

interface BusCompanyInfo {
    busCompanyName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    headquarterAddress: string;
    businessRegistrationAddress: string;
    businessLicenseNumber: string;
    licenseIssuer: string;
    licenseIssueDate: string;
}

const Footer = () => {
    const [companyInfo, setCompanyInfo] = useState<BusCompanyInfo | null>(null);

    useEffect(() => {
        const fetchCompanyInfo = async () => {
            try {
                const response = await axios.get(
                    "https://ticketgo.site/api/v1/bus-companies"
                );
                if (response.data.status === 200) {
                    setCompanyInfo(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching company info:", error);
            }
        };

        fetchCompanyInfo();
    }, []);
    return (
        <Box
            sx={{
                bottom: 0,
                left: 0,
                width: "100%",
                backgroundColor: "white",
                padding: "20px 0",
                textAlign: "center",
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    color: "black",
                    marginBottom: "10px",
                    fontWeight: "700",
                    fontSize: "16px",
                }}
            >
                {companyInfo?.busCompanyName ||
                    "Công ty TNHH Thương Mại Dịch Vụ TicketGo"}
            </Typography>

            <Typography
                variant="body2"
                sx={{ color: "gray", marginBottom: "10px" }}
            >
                Địa chỉ đăng ký kinh doanh:{" "}
                {companyInfo?.businessRegistrationAddress}
            </Typography>
            {companyInfo?.headquarterAddress && (
                <Typography
                    variant="body2"
                    sx={{ color: "gray", marginBottom: "10px" }}
                >
                    Trụ sở chính: {companyInfo.headquarterAddress}
                </Typography>
            )}

            <Typography
                variant="body2"
                sx={{ color: "gray", marginBottom: "10px" }}
            >
                Địa chỉ: {companyInfo?.address}
            </Typography>

            <Typography
                variant="body2"
                sx={{ color: "gray", marginBottom: "10px" }}
            >
                Giấy chứng nhận ĐKKD số {companyInfo?.businessLicenseNumber} do{" "}
                {companyInfo?.licenseIssuer} cấp lần đầu ngày{" "}
                {companyInfo?.licenseIssueDate &&
                    new Date(companyInfo.licenseIssueDate).toLocaleDateString(
                        "vi-VN"
                    )}
            </Typography>

            <Typography
                variant="body2"
                sx={{ color: "gray", marginBottom: "10px" }}
            >
                Email: {companyInfo?.contactEmail} | Hotline:{" "}
                {companyInfo?.contactPhone}
            </Typography>

            <Typography variant="body2" sx={{ color: "gray" }}>
                Bản quyền © {new Date().getFullYear()} thuộc về{" "}
                <Link
                    href="#"
                    color="inherit"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    @TicketGo
                </Link>
            </Typography>
        </Box>
    );
};

export default Footer;
