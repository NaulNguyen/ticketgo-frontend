import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    IconButton,
    Grid,
    Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { axiosWithJWT } from "../config/axiosConfig";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import axios from "axios";
import { styled } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

interface CreateDriverPopupProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const cld = new Cloudinary({
    cloud: {
        cloudName: "dltlcxhsl",
    },
});

const validationSchema = Yup.object({
    name: Yup.string().required("Vui lòng nhập tên tài xế"),
    licenseNumber: Yup.string().required("Vui lòng nhập số bằng lái xe"),
    phoneNumber: Yup.string()
        .required("Vui lòng nhập số điện thoại")
        .matches(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
    imageUrl: Yup.string().required("Vui lòng chọn ảnh đại diện"),
    placeOfIssue: Yup.string().required("Vui lòng nhập nơi cấp bằng lái"),
    issueDate: Yup.string().required("Vui lòng chọn ngày cấp bằng lái"),
    expiryDate: Yup.string()
        .required("Vui lòng chọn ngày hết hạn bằng lái")
        .test("expiry", "Ngày hết hạn phải sau ngày cấp", function (value) {
            const { issueDate } = this.parent;
            if (!issueDate || !value) return true;
            return dayjs(value).isAfter(dayjs(issueDate));
        }),
});

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

const CreateDriverPopup: React.FC<CreateDriverPopupProps> = ({
    open,
    onClose,
    onSuccess,
}) => {
    const [cloudinaryImage, setCloudinaryImage] = useState<string | null>(null);
    const formik = useFormik({
        initialValues: {
            name: "",
            licenseNumber: "",
            phoneNumber: "",
            imageUrl: "",
            placeOfIssue: "",
            issueDate: "",
            expiryDate: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await axiosWithJWT.post(
                    "/api/v1/drivers",
                    values
                );

                if (response.status === 201) {
                    toast.success("Thêm tài xế thành công");
                    onSuccess();
                    onClose();
                    formik.resetForm();
                }
            } catch (error: any) {
                console.error("Error creating driver:", error);
                toast.error(
                    error.response?.data?.message ||
                        "Có lỗi xảy ra khi thêm tài xế"
                );
            }
        },
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
                formik.setFieldValue("imageUrl", response.data.secure_url);
                toast.success("Tải ảnh lên thành công");
            }
        } catch (error: any) {
            console.error(
                "Upload error:",
                error.response?.data || error.message
            );
            toast.error("Không thể tải ảnh lên. Vui lòng thử lại");
        }
    };

    const renderImagePreview = () => {
        if (cloudinaryImage) {
            const cldImg = cld
                .image(cloudinaryImage.split("/").pop()?.split(".")[0] || "")
                .format("auto")
                .quality("auto")
                .resize(auto().gravity(autoGravity()).width(300).height(300));

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
                            formik.setFieldValue("imageUrl", "");
                        }}
                    >
                        <CloseIcon sx={{ color: "white" }} />
                    </IconButton>
                </Box>
            );
        }
        return (
            <Box sx={{ textAlign: "center", color: "text.secondary", py: 4 }}>
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
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 },
            }}
        >
            <DialogTitle
                sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: "divider" }}
            >
                Thêm Tài xế mới
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Grid container spacing={3}>
                        {/* Left side - Form fields */}
                        <Grid item xs={6}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    label="Tên tài xế"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    error={
                                        formik.touched.name &&
                                        Boolean(formik.errors.name)
                                    }
                                    helperText={
                                        formik.touched.name &&
                                        formik.errors.name
                                    }
                                />
                                <TextField
                                    fullWidth
                                    label="Số bằng lái xe"
                                    name="licenseNumber"
                                    value={formik.values.licenseNumber}
                                    onChange={formik.handleChange}
                                    error={
                                        formik.touched.licenseNumber &&
                                        Boolean(formik.errors.licenseNumber)
                                    }
                                    helperText={
                                        formik.touched.licenseNumber &&
                                        formik.errors.licenseNumber
                                    }
                                />
                                <TextField
                                    fullWidth
                                    label="Nơi cấp bằng lái"
                                    name="placeOfIssue"
                                    value={formik.values.placeOfIssue}
                                    onChange={formik.handleChange}
                                    error={
                                        formik.touched.placeOfIssue &&
                                        Boolean(formik.errors.placeOfIssue)
                                    }
                                    helperText={
                                        formik.touched.placeOfIssue &&
                                        formik.errors.placeOfIssue
                                    }
                                />

                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        label="Ngày cấp"
                                        value={
                                            formik.values.issueDate
                                                ? dayjs(formik.values.issueDate)
                                                : null
                                        }
                                        onChange={(value) => {
                                            formik.setFieldValue(
                                                "issueDate",
                                                value
                                                    ? value.format("YYYY-MM-DD")
                                                    : ""
                                            );
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error:
                                                    formik.touched.issueDate &&
                                                    Boolean(
                                                        formik.errors.issueDate
                                                    ),
                                                helperText:
                                                    formik.touched.issueDate &&
                                                    formik.errors.issueDate,
                                            },
                                        }}
                                    />

                                    <DatePicker
                                        label="Ngày hết hạn"
                                        value={
                                            formik.values.expiryDate
                                                ? dayjs(
                                                      formik.values.expiryDate
                                                  )
                                                : null
                                        }
                                        onChange={(value) => {
                                            formik.setFieldValue(
                                                "expiryDate",
                                                value
                                                    ? value.format("YYYY-MM-DD")
                                                    : ""
                                            );
                                        }}
                                        minDate={
                                            formik.values.issueDate
                                                ? dayjs(formik.values.issueDate)
                                                : undefined
                                        }
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error:
                                                    formik.touched.expiryDate &&
                                                    Boolean(
                                                        formik.errors.expiryDate
                                                    ),
                                                helperText:
                                                    formik.touched.expiryDate &&
                                                    formik.errors.expiryDate,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                                <TextField
                                    fullWidth
                                    label="Số điện thoại"
                                    name="phoneNumber"
                                    value={formik.values.phoneNumber}
                                    onChange={formik.handleChange}
                                    error={
                                        formik.touched.phoneNumber &&
                                        Boolean(formik.errors.phoneNumber)
                                    }
                                    helperText={
                                        formik.touched.phoneNumber &&
                                        formik.errors.phoneNumber
                                    }
                                />
                            </Box>
                        </Grid>

                        {/* Right side - Image upload */}
                        <Grid item xs={6}>
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
                                        ? "Đổi ảnh khác"
                                        : "Chọn ảnh đại diện"}
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
                                                    return;
                                                }
                                                if (
                                                    file.size >
                                                    5 * 1024 * 1024
                                                ) {
                                                    toast.error(
                                                        "Kích thước file không được vượt quá 5MB"
                                                    );
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
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!formik.isValid || formik.isSubmitting}
                    >
                        Thêm
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateDriverPopup;
