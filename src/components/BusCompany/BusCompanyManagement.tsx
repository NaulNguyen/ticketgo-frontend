import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Snackbar,
    Alert,
    styled,
    IconButton,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { axiosWithJWT } from "../../config/axiosConfig";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import CloseIcon from "@mui/icons-material/Close";

const cld = new Cloudinary({
    cloud: {
        cloudName: "dltlcxhsl",
    },
});

interface BusCompanyInfo {
    busCompanyName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    description: string;
    bannerUrl: string;
    businessRegistrationAddress: string;
    headquarterAddress: string | null;
    businessLicenseNumber: string;
    licenseIssuer: string;
    licenseIssueDate: string;
}

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const validationSchema = Yup.object({
    busCompanyName: Yup.string().required("Vui lòng nhập tên công ty"),
    contactEmail: Yup.string()
        .email("Email không hợp lệ")
        .required("Vui lòng nhập email"),
    contactPhone: Yup.string()
        .matches(/^[0-9]{10}$/, "Số điện thoại không hợp lệ")
        .required("Vui lòng nhập số điện thoại"),
    address: Yup.string().required("Vui lòng nhập địa chỉ"),
    description: Yup.string().required("Vui lòng nhập mô tả"),
    businessRegistrationAddress: Yup.string().required(
        "Vui lòng nhập địa chỉ đăng ký kinh doanh"
    ),
    businessLicenseNumber: Yup.string().required(
        "Vui lòng nhập số giấy phép kinh doanh"
    ),
    licenseIssuer: Yup.string().required("Vui lòng nhập nơi cấp giấy phép"),
    licenseIssueDate: Yup.string().required("Vui lòng nhập ngày cấp giấy phép"),
});

const BusCompanyManagement = () => {
    const [loading, setLoading] = useState(true);
    const [cloudinaryImage, setCloudinaryImage] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

    const handleImageUpload = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "ticketgo");
            formData.append("cloud_name", "dltlcxhsl");

            const response = await axios.post(
                "https://api.cloudinary.com/v1_1/dltlcxhsl/image/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.secure_url) {
                setCloudinaryImage(response.data.secure_url);
                formik.setFieldValue("bannerUrl", response.data.secure_url);
                setSnackbar({
                    open: true,
                    message: "Tải ảnh lên thành công",
                    severity: "success",
                });
            }
        } catch (error: any) {
            console.error(
                "Upload error:",
                error.response?.data || error.message
            );
            setSnackbar({
                open: true,
                message: "Không thể tải ảnh lên. Vui lòng thử lại",
                severity: "error",
            });
        }
    };

    const renderImagePreview = () => {
        const imageUrl = cloudinaryImage || formik.values.bannerUrl;

        if (imageUrl) {
            return (
                <Box sx={{ position: "relative", mb: 2 }}>
                    <img
                        src={imageUrl}
                        alt="Banner preview"
                        style={{
                            width: "100%",
                            maxHeight: "200px",
                            objectFit: "cover",
                            borderRadius: "8px",
                        }}
                    />
                    <IconButton
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.7)",
                            },
                        }}
                        onClick={() => {
                            setCloudinaryImage(null);
                            formik.setFieldValue("bannerUrl", "");
                        }}
                    >
                        <CloseIcon sx={{ color: "white" }} />
                    </IconButton>
                </Box>
            );
        }
        return null;
    };

    const formik = useFormik({
        initialValues: {
            busCompanyName: "",
            contactEmail: "",
            contactPhone: "",
            address: "",
            description: "",
            bannerUrl: "",
            businessRegistrationAddress: "",
            headquarterAddress: "",
            businessLicenseNumber: "",
            licenseIssuer: "",
            licenseIssueDate: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await axiosWithJWT.put(
                    "/api/v1/bus-companies",
                    values
                );
                if (response.data.status === 200) {
                    setSnackbar({
                        open: true,
                        message: "Cập nhật thông tin thành công",
                        severity: "success",
                    });
                }
            } catch (error: any) {
                setSnackbar({
                    open: true,
                    message:
                        error.response?.data?.message ||
                        "Có lỗi xảy ra khi cập nhật thông tin",
                    severity: "error",
                });
            }
        },
    });

    useEffect(() => {
        const fetchCompanyInfo = async () => {
            try {
                const response = await axios.get(
                    "https://ticketgo.site/api/v1/bus-companies"
                );
                if (response.data.status === 200) {
                    formik.setValues(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching company info:", error);
                setSnackbar({
                    open: true,
                    message: "Có lỗi xảy ra khi tải thông tin công ty",
                    severity: "error",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyInfo();
    }, []);

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                    {/* Company Information Card */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: "100%" }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 3,
                                        color: "primary.main",
                                        fontWeight: 600,
                                    }}
                                >
                                    Thông tin cơ bản
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Tên nhà xe"
                                            name="busCompanyName"
                                            value={formik.values.busCompanyName}
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched.busCompanyName &&
                                                Boolean(
                                                    formik.errors.busCompanyName
                                                )
                                            }
                                            helperText={
                                                formik.touched.busCompanyName &&
                                                formik.errors.busCompanyName
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email liên hệ"
                                            name="contactEmail"
                                            value={formik.values.contactEmail}
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched.contactEmail &&
                                                Boolean(
                                                    formik.errors.contactEmail
                                                )
                                            }
                                            helperText={
                                                formik.touched.contactEmail &&
                                                formik.errors.contactEmail
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Số điện thoại"
                                            name="contactPhone"
                                            value={formik.values.contactPhone}
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched.contactPhone &&
                                                Boolean(
                                                    formik.errors.contactPhone
                                                )
                                            }
                                            helperText={
                                                formik.touched.contactPhone &&
                                                formik.errors.contactPhone
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Address Information Card */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: "100%" }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 3,
                                        color: "primary.main",
                                        fontWeight: 600,
                                    }}
                                >
                                    Thông tin địa chỉ
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Địa chỉ hoạt động"
                                            name="address"
                                            value={formik.values.address}
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched.address &&
                                                Boolean(formik.errors.address)
                                            }
                                            helperText={
                                                formik.touched.address &&
                                                formik.errors.address
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Địa chỉ đăng ký kinh doanh"
                                            name="businessRegistrationAddress"
                                            value={
                                                formik.values
                                                    .businessRegistrationAddress
                                            }
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched
                                                    .businessRegistrationAddress &&
                                                Boolean(
                                                    formik.errors
                                                        .businessRegistrationAddress
                                                )
                                            }
                                            helperText={
                                                formik.touched
                                                    .businessRegistrationAddress &&
                                                formik.errors
                                                    .businessRegistrationAddress
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Địa chỉ trụ sở chính"
                                            name="headquarterAddress"
                                            value={
                                                formik.values.headquarterAddress
                                            }
                                            onChange={formik.handleChange}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Business License Card */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 3,
                                        color: "primary.main",
                                        fontWeight: 600,
                                    }}
                                >
                                    Thông tin giấy phép kinh doanh
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Số giấy phép kinh doanh"
                                            name="businessLicenseNumber"
                                            value={
                                                formik.values
                                                    .businessLicenseNumber
                                            }
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched
                                                    .businessLicenseNumber &&
                                                Boolean(
                                                    formik.errors
                                                        .businessLicenseNumber
                                                )
                                            }
                                            helperText={
                                                formik.touched
                                                    .businessLicenseNumber &&
                                                formik.errors
                                                    .businessLicenseNumber
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Nơi cấp giấy phép"
                                            name="licenseIssuer"
                                            value={formik.values.licenseIssuer}
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched.licenseIssuer &&
                                                Boolean(
                                                    formik.errors.licenseIssuer
                                                )
                                            }
                                            helperText={
                                                formik.touched.licenseIssuer &&
                                                formik.errors.licenseIssuer
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="Ngày cấp giấy phép"
                                            name="licenseIssueDate"
                                            value={
                                                formik.values.licenseIssueDate
                                            }
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched
                                                    .licenseIssueDate &&
                                                Boolean(
                                                    formik.errors
                                                        .licenseIssueDate
                                                )
                                            }
                                            helperText={
                                                formik.touched
                                                    .licenseIssueDate &&
                                                formik.errors.licenseIssueDate
                                            }
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Description and Banner Card */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 3,
                                        color: "primary.main",
                                        fontWeight: 600,
                                    }}
                                >
                                    Thông tin mô tả & Banner
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Mô tả"
                                            name="description"
                                            multiline
                                            rows={4}
                                            value={formik.values.description}
                                            onChange={formik.handleChange}
                                            error={
                                                formik.touched.description &&
                                                Boolean(
                                                    formik.errors.description
                                                )
                                            }
                                            helperText={
                                                formik.touched.description &&
                                                formik.errors.description
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ mb: 1 }}
                                        >
                                            Banner
                                        </Typography>
                                        {renderImagePreview()}
                                        <Box
                                            sx={{
                                                border: "2px dashed",
                                                borderColor: "primary.main",
                                                borderRadius: 2,
                                                p: 2,
                                                bgcolor: "background.paper",
                                            }}
                                        >
                                            <Button
                                                component="label"
                                                variant="outlined"
                                                startIcon={<CloudUploadIcon />}
                                                fullWidth
                                                sx={{
                                                    height: "56px",
                                                    borderStyle: "dashed",
                                                }}
                                            >
                                                {formik.values.bannerUrl
                                                    ? "Đổi ảnh khác"
                                                    : "Tải lên ảnh banner"}
                                                <VisuallyHiddenInput
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/jpg"
                                                    onChange={(event) => {
                                                        const file =
                                                            event.currentTarget
                                                                .files?.[0];
                                                        if (file) {
                                                            if (
                                                                ![
                                                                    "image/jpeg",
                                                                    "image/png",
                                                                    "image/jpg",
                                                                ].includes(
                                                                    file.type
                                                                )
                                                            ) {
                                                                setSnackbar({
                                                                    open: true,
                                                                    message:
                                                                        "Chỉ chấp nhận file ảnh (JPG, PNG)",
                                                                    severity:
                                                                        "error",
                                                                });
                                                                return;
                                                            }
                                                            if (
                                                                file.size >
                                                                5 * 1024 * 1024
                                                            ) {
                                                                setSnackbar({
                                                                    open: true,
                                                                    message:
                                                                        "Kích thước file không được vượt quá 5MB",
                                                                    severity:
                                                                        "error",
                                                                });
                                                                return;
                                                            }
                                                            handleImageUpload(
                                                                file
                                                            );
                                                        }
                                                    }}
                                                />
                                            </Button>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: "block",
                                                    textAlign: "center",
                                                    mt: 1,
                                                }}
                                            >
                                                Hỗ trợ: JPG, PNG (tối đa 5MB)
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Submit Button */}
                <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                >
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{
                            minWidth: 200,
                            height: 48,
                            fontWeight: 600,
                            fontSize: "1.1rem",
                        }}
                    >
                        Cập nhật thông tin
                    </Button>
                </Box>
            </form>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BusCompanyManagement;
