import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RouteIcon from "@mui/icons-material/Route";
import { useFormik } from "formik";
import * as Yup from "yup";
import { axiosWithJWT } from "../config/axiosConfig";
import { toast } from "react-toastify";
import { CloudUpload } from "@mui/icons-material";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import axios from "axios";
import { CircularProgress, LinearProgress } from "@mui/material";

const cld = new Cloudinary({
    cloud: {
        cloudName: "dltlcxhsl",
    },
});

interface CreateEditRouteProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    route?: Route | null; // If provided, we're in edit mode
}

interface Route {
    routeId: number;
    routeName: string;
    departureLocation: string;
    arrivalLocation: string;
    routeImage: string;
}

const CreateEditRoute: React.FC<CreateEditRouteProps> = ({
    open,
    onClose,
    onSuccess,
    route,
}) => {
    const [uploading, setUploading] = useState(false);
    const isEditMode = Boolean(route);
    const [uploadProgress, setUploadProgress] = useState(0);

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
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) /
                                (progressEvent.total || 100)
                        );
                        setUploadProgress(progress);
                    },
                }
            );

            if (response.data.secure_url) {
                formik.setFieldValue("routeImage", response.data.secure_url);
                toast.success("Tải ảnh lên thành công");
                return response.data.secure_url;
            }
        } catch (error: any) {
            console.error(
                "Upload error:",
                error.response?.data || error.message
            );
            toast.error(
                error.response?.data?.error?.message ||
                    "Không thể tải ảnh lên. Vui lòng thử lại"
            );
            throw error;
        } finally {
            setUploadProgress(0);
        }
    };

    const formik = useFormik({
        initialValues: {
            routeName: route?.routeName || "",
            departureLocation: route?.departureLocation || "",
            arrivalLocation: route?.arrivalLocation || "",
            routeImage: route?.routeImage || "",
        },
        validationSchema: Yup.object({
            routeName: Yup.string().required("Vui lòng nhập tên tuyến"),
            departureLocation: isEditMode
                ? Yup.string()
                : Yup.string().required("Vui lòng nhập điểm đi"),
            arrivalLocation: isEditMode
                ? Yup.string()
                : Yup.string().required("Vui lòng nhập điểm đến"),
            routeImage: Yup.string().required("Vui lòng chọn ảnh tuyến"),
        }),
        onSubmit: async (values) => {
            try {
                if (isEditMode) {
                    // Update route
                    const response = await axiosWithJWT.put("/api/v1/routes", {
                        routeId: route?.routeId,
                        routeImage: values.routeImage,
                    });

                    if (response.data.status === 200) {
                        toast.success("Cập nhật tuyến đường thành công");
                        onSuccess();
                        onClose();
                    }
                } else {
                    // Create new route
                    const response = await axiosWithJWT.post("/api/v1/routes", {
                        routeName: values.routeName,
                        departureLocation: values.departureLocation,
                        arrivalLocation: values.arrivalLocation,
                        routeImage: values.routeImage,
                    });

                    if (response.data.status === 201) {
                        toast.success("Tạo tuyến đường thành công");
                        onSuccess();
                        onClose();
                    }
                }
            } catch (error: any) {
                console.error("Error:", error);
                toast.error(error.response?.data?.message || "Có lỗi xảy ra");
            }
        },
    });

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const imageUrl = await handleImageUpload(file);
                formik.setFieldValue("routeImage", imageUrl);
            } catch (error) {
                toast.error("Không thể tải ảnh lên. Vui lòng thử lại");
            }
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 2,
                    bgcolor: "#1976d2",
                    color: "white",
                }}
            >
                <RouteIcon />
                <Typography variant="h6" component="span" sx={{ flex: 1 }}>
                    {isEditMode
                        ? "Cập nhật tuyến đường"
                        : "Thêm tuyến đường mới"}
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: "white",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={formik.handleSubmit}>
                <DialogContent dividers sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", gap: 3 }}>
                        {/* Left side - Form fields */}
                        <Box
                            sx={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                gap: 3,
                            }}
                        >
                            {!isEditMode && (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Tên tuyến"
                                        name="routeName"
                                        value={formik.values.routeName}
                                        onChange={formik.handleChange}
                                        error={
                                            formik.touched.routeName &&
                                            Boolean(formik.errors.routeName)
                                        }
                                        helperText={
                                            formik.touched.routeName &&
                                            formik.errors.routeName
                                        }
                                    />

                                    <TextField
                                        fullWidth
                                        label="Điểm đi"
                                        name="departureLocation"
                                        value={formik.values.departureLocation}
                                        onChange={formik.handleChange}
                                        error={
                                            formik.touched.departureLocation &&
                                            Boolean(
                                                formik.errors.departureLocation
                                            )
                                        }
                                        helperText={
                                            formik.touched.departureLocation &&
                                            formik.errors.departureLocation
                                        }
                                    />

                                    <TextField
                                        fullWidth
                                        label="Điểm đến"
                                        name="arrivalLocation"
                                        value={formik.values.arrivalLocation}
                                        onChange={formik.handleChange}
                                        error={
                                            formik.touched.arrivalLocation &&
                                            Boolean(
                                                formik.errors.arrivalLocation
                                            )
                                        }
                                        helperText={
                                            formik.touched.arrivalLocation &&
                                            formik.errors.arrivalLocation
                                        }
                                    />
                                </>
                            )}

                            <Box>
                                <input
                                    accept="image/*"
                                    id="route-image"
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="route-image">
                                    <Button
                                        component="span"
                                        variant="outlined"
                                        startIcon={
                                            uploading ? (
                                                <CircularProgress size={20} />
                                            ) : (
                                                <CloudUpload />
                                            )
                                        }
                                        sx={{ mb: 2 }}
                                        disabled={uploading}
                                    >
                                        {uploading
                                            ? "Đang tải lên..."
                                            : "Tải ảnh lên"}
                                    </Button>
                                </label>

                                {uploading && (
                                    <Box sx={{ mt: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={uploadProgress}
                                            sx={{
                                                height: 8,
                                                borderRadius: 1,
                                                bgcolor:
                                                    "rgba(25, 118, 210, 0.1)",
                                                "& .MuiLinearProgress-bar": {
                                                    borderRadius: 1,
                                                },
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            align="center"
                                            sx={{ mt: 1 }}
                                        >
                                            {uploadProgress}%
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Right side - Image preview */}
                        <Box sx={{ width: 500, flexShrink: 0 }}>
                            {formik.values.routeImage ? (
                                <Box sx={{ position: "relative" }}>
                                    <AdvancedImage
                                        cldImg={cld
                                            .image(
                                                formik.values.routeImage
                                                    .split("/")
                                                    .pop()
                                                    ?.split(".")[0] || ""
                                            )
                                            .format("auto")
                                            .quality("auto")
                                            .resize(
                                                auto()
                                                    .gravity(autoGravity())
                                                    .width(300)
                                                    .height(400)
                                            )}
                                        style={{
                                            width: "100%",
                                            height: "300px",
                                            objectFit: "contain",
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
                                                backgroundColor:
                                                    "rgba(0,0,0,0.7)",
                                            },
                                        }}
                                        onClick={() => {
                                            formik.setFieldValue(
                                                "routeImage",
                                                ""
                                            );
                                        }}
                                    >
                                        <CloseIcon sx={{ color: "white" }} />
                                    </IconButton>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: 300,
                                        borderRadius: 2,
                                        bgcolor: "rgba(0,0,0,0.04)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "2px dashed",
                                        borderColor: "divider",
                                    }}
                                >
                                    <Typography color="text.secondary">
                                        Chưa có ảnh
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        color="inherit"
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ borderRadius: 2, px: 3 }}
                        disabled={formik.isSubmitting || uploading}
                    >
                        {isEditMode ? "Cập nhật" : "Tạo mới"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateEditRoute;
