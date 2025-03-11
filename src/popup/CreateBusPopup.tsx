import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Grid,
    IconButton,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { axiosWithJWT } from "../config/axiosConfig";
import { toast } from "react-toastify";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const cld = new Cloudinary({
    cloud: {
        cloudName: "dltlcxhsl",
    },
});

interface CreateBusPopupProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
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
    licensePlate: Yup.string()
        .required("Vui lòng nhập biển số xe")
        .matches(
            /^\d{2}[A-Z]-\d{5}$/,
            "Biển số xe không hợp lệ (VD: 51B-12345)"
        ),
    busType: Yup.string().required("Vui lòng nhập loại xe"),
    busImage: Yup.mixed()
        .required("Vui lòng chọn hình ảnh xe")
        .test("fileType", "Chỉ chấp nhận file ảnh (JPG, PNG)", (value) => {
            if (!value) return false;
            // Check if it's a string (Cloudinary URL) or a File
            if (typeof value === "string") return true;
            const file = value as File;
            return (
                file &&
                ["image/jpeg", "image/png", "image/jpg"].includes(file.type)
            );
        })
        .test(
            "fileSize",
            "Kích thước file không được vượt quá 5MB",
            (value) => {
                if (!value) return false;
                if (typeof value === "string") return true;
                const file = value as File;
                return file && file.size <= 5 * 1024 * 1024;
            }
        ),
    totalSeats: Yup.number()
        .required("Vui lòng nhập số ghế")
        .min(1, "Số ghế phải lớn hơn 0"),
    floors: Yup.number()
        .required("Vui lòng nhập số tầng")
        .min(1, "Số tầng phải lớn hơn 0")
        .max(2, "Số tầng không được vượt quá 2"),
    registrationExpiry: Yup.date()
        .required("Vui lòng nhập hạn đăng kiểm")
        .min(new Date(), "Hạn đăng kiểm phải lớn hơn ngày hiện tại"),
    expirationDate: Yup.date()
        .required("Vui lòng nhập ngày hết hạn")
        .min(
            Yup.ref("registrationExpiry"),
            "Ngày hết hạn phải sau hạn đăng kiểm"
        ),
});

const CreateBusPopup: React.FC<CreateBusPopupProps> = ({
    open,
    onClose,
    onSuccess,
}) => {
    const [cloudinaryImage, setCloudinaryImage] = useState<string | null>(null);
    const formik = useFormik({
        initialValues: {
            licensePlate: "",
            busType: "",
            busImage: null as File | null,
            totalSeats: "",
            floors: "",
            registrationExpiry: "",
            expirationDate: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                if (!cloudinaryImage) {
                    toast.error("Vui lòng tải ảnh xe lên");
                    return;
                }

                const requestData = {
                    licensePlate: values.licensePlate,
                    busType: values.busType,
                    busImage: cloudinaryImage, // Use the Cloudinary URL
                    totalSeats: Number(values.totalSeats),
                    floors: Number(values.floors),
                    registrationExpiry: values.registrationExpiry,
                    expirationDate: values.expirationDate,
                };

                const response = await axiosWithJWT.post(
                    "http://localhost:8080/api/v1/buses",
                    requestData
                );

                if (response.status === 201) {
                    toast.success("Thêm xe mới thành công");
                    onSuccess();
                    onClose();
                    formik.resetForm();
                    setCloudinaryImage(null);
                }
            } catch (error: any) {
                console.error("Error creating bus:", error);
                toast.error(
                    error.response?.data?.message ||
                        "Có lỗi xảy ra khi thêm xe mới"
                );
            }
        },
    });

    const handleImageUpload = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "ticketgo"); // Replace with your actual upload preset
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
                formik.setFieldValue("busImage", response.data.secure_url);
                toast.success("Tải ảnh lên thành công");
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
        }
    };

    const renderImagePreview = () => {
        if (cloudinaryImage) {
            const cldImg = cld
                .image(cloudinaryImage.split("/").pop()?.split(".")[0] || "")
                .format("auto")
                .quality("auto")
                .resize(auto().gravity(autoGravity()).width(500).height(300));

            return (
                <Box sx={{ position: "relative" }}>
                    <AdvancedImage
                        cldImg={cldImg}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "250px",
                            objectFit: "contain",
                            borderRadius: "4px",
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
                            formik.setFieldValue("busImage", null);
                        }}
                    >
                        <CloseIcon sx={{ color: "white" }} />
                    </IconButton>
                </Box>
            );
        }

        return (
            <Box
                sx={{
                    textAlign: "center",
                    color: "text.secondary",
                    paddingTop: 4,
                    paddingBottom: 4,
                }}
            >
                <CloudUploadIcon
                    sx={{ fontSize: 60, color: "text.disabled" }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Kéo thả hoặc click để chọn ảnh
                </Typography>
                <Typography variant="caption">
                    Hỗ trợ: JPG, PNG (tối đa 5MB)
                </Typography>
            </Box>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Thêm Xe Mới</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Grid container spacing={3}>
                        {/* Left side - Form fields */}
                        <Grid item xs={5}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    label="Biển số xe"
                                    name="licensePlate"
                                    value={formik.values.licensePlate}
                                    onChange={formik.handleChange}
                                    error={
                                        formik.touched.licensePlate &&
                                        Boolean(formik.errors.licensePlate)
                                    }
                                    helperText={
                                        formik.touched.licensePlate &&
                                        formik.errors.licensePlate
                                    }
                                />
                                <TextField
                                    fullWidth
                                    label="Loại xe"
                                    name="busType"
                                    value={formik.values.busType}
                                    onChange={formik.handleChange}
                                    error={
                                        formik.touched.busType &&
                                        Boolean(formik.errors.busType)
                                    }
                                    helperText={
                                        formik.touched.busType &&
                                        formik.errors.busType
                                    }
                                />
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <TextField
                                        sx={{ flex: 1 }}
                                        label="Số ghế"
                                        name="totalSeats"
                                        type="number"
                                        value={formik.values.totalSeats}
                                        onChange={formik.handleChange}
                                        error={
                                            formik.touched.totalSeats &&
                                            Boolean(formik.errors.totalSeats)
                                        }
                                        helperText={
                                            formik.touched.totalSeats &&
                                            formik.errors.totalSeats
                                        }
                                    />
                                    <TextField
                                        sx={{ flex: 1 }}
                                        label="Số tầng"
                                        name="floors"
                                        type="number"
                                        value={formik.values.floors}
                                        onChange={formik.handleChange}
                                        error={
                                            formik.touched.floors &&
                                            Boolean(formik.errors.floors)
                                        }
                                        helperText={
                                            formik.touched.floors &&
                                            formik.errors.floors
                                        }
                                    />
                                </Box>
                                <TextField
                                    fullWidth
                                    label="Hạn đăng kiểm"
                                    name="registrationExpiry"
                                    type="date"
                                    value={formik.values.registrationExpiry}
                                    onChange={formik.handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    error={
                                        formik.touched.registrationExpiry &&
                                        Boolean(
                                            formik.errors.registrationExpiry
                                        )
                                    }
                                    helperText={
                                        formik.touched.registrationExpiry &&
                                        formik.errors.registrationExpiry
                                    }
                                />
                                <TextField
                                    fullWidth
                                    label="Ngày hết hạn"
                                    name="expirationDate"
                                    type="date"
                                    value={formik.values.expirationDate}
                                    onChange={formik.handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    error={
                                        formik.touched.expirationDate &&
                                        Boolean(formik.errors.expirationDate)
                                    }
                                    helperText={
                                        formik.touched.expirationDate &&
                                        formik.errors.expirationDate
                                    }
                                />
                            </Box>
                        </Grid>

                        {/* Right side - Image upload and preview */}
                        <Grid item xs={7}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    height: "100%",
                                    border: "2px dashed #1976d2",
                                    borderRadius: 2,
                                    padding: 2,
                                }}
                            >
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{
                                        height: "56px",
                                        borderStyle: "dashed",
                                    }}
                                >
                                    {cloudinaryImage
                                        ? "Đổi hình ảnh khác"
                                        : "Chọn hình ảnh xe"}
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={(event) => {
                                            const file =
                                                event.currentTarget.files?.[0];
                                            if (file) {
                                                if (
                                                    ![
                                                        "image/jpeg",
                                                        "image/png",
                                                        "image/jpg",
                                                    ].includes(file.type)
                                                ) {
                                                    toast.error(
                                                        "Chỉ chấp nhận file ảnh (JPG, PNG)"
                                                    );
                                                    event.target.value = "";
                                                    return;
                                                }
                                                if (
                                                    file.size >
                                                    5 * 1024 * 1024
                                                ) {
                                                    toast.error(
                                                        "Kích thước file không được vượt quá 5MB"
                                                    );
                                                    event.target.value = "";
                                                    return;
                                                }
                                                handleImageUpload(file);
                                            }
                                        }}
                                    />
                                </Button>

                                <Box
                                    sx={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minHeight: "200px",
                                        bgcolor: "#f5f5f5",
                                        borderRadius: 1,
                                    }}
                                >
                                    {renderImagePreview()}
                                </Box>

                                {formik.touched.busImage &&
                                    formik.errors.busImage && (
                                        <Typography
                                            color="error"
                                            variant="caption"
                                        >
                                            {formik.errors.busImage as string}
                                        </Typography>
                                    )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="submit" variant="contained" color="primary">
                        Thêm
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateBusPopup;
