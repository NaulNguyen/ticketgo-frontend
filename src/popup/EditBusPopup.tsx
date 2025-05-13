import React, { useState, useEffect } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";

const cld = new Cloudinary({
    cloud: { cloudName: "dltlcxhsl" },
});

interface EditBusPopupProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    busId: string | null;
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

const EditBusPopup: React.FC<EditBusPopupProps> = ({
    open,
    onClose,
    onSuccess,
    busId,
}) => {
    const [cloudinaryImage, setCloudinaryImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            busImage: "",
            registrationExpiry: "",
            expirationDate: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const requestData = {
                    busImage: cloudinaryImage || values.busImage,
                    registrationExpiry: values.registrationExpiry,
                    expirationDate: values.expirationDate,
                };

                const response = await axiosWithJWT.post(
                    `https://ticketgo.site/api/v1/buses/${busId}`,
                    requestData
                );

                if (response.status === 200) {
                    toast.success("Cập nhật xe thành công");
                    onSuccess();
                    onClose();
                }
            } catch (error: any) {
                console.error("Error updating bus:", error);
                toast.error(
                    error.response?.data?.message ||
                        "Có lỗi xảy ra khi cập nhật xe"
                );
            }
        },
    });

    useEffect(() => {
        const fetchBusDetails = async () => {
            if (busId && open) {
                setLoading(true);
                try {
                    const response = await axiosWithJWT.get(
                        `https://ticketgo.site/api/v1/buses/${busId}`
                    );
                    const busData = response.data.data;
                    formik.setValues({
                        busImage: busData.busImage,
                        registrationExpiry:
                            busData.registrationExpiry.split("T")[0],
                        expirationDate: busData.expirationDate.split("T")[0],
                    });
                    setCloudinaryImage(busData.busImage);
                } catch (error) {
                    console.error("Error fetching bus details:", error);
                    toast.error("Không thể tải thông tin xe");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchBusDetails();
    }, [busId, open]);

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
                    headers: { "Content-Type": "multipart/form-data" },
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
            toast.error("Không thể tải ảnh lên. Vui lòng thử lại");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle
                sx={{ textAlign: "center", fontSize: 24, fontWeight: 700 }}
            >
                Chỉnh sửa thông tin xe
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 3 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
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
                                                    event.currentTarget
                                                        .files?.[0];
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

                                    {cloudinaryImage && (
                                        <Box sx={{ position: "relative" }}>
                                            <img
                                                src={cloudinaryImage}
                                                alt="Bus preview"
                                                style={{
                                                    width: "100%",
                                                    maxHeight: "200px",
                                                    objectFit: "contain",
                                                    borderRadius: "4px",
                                                }}
                                            />
                                            <IconButton
                                                sx={{
                                                    position: "absolute",
                                                    top: 8,
                                                    right: 8,
                                                    backgroundColor:
                                                        "rgba(0,0,0,0.5)",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "rgba(0,0,0,0.7)",
                                                    },
                                                }}
                                                onClick={() => {
                                                    setCloudinaryImage(null);
                                                    formik.setFieldValue(
                                                        "busImage",
                                                        ""
                                                    );
                                                }}
                                            >
                                                <CloseIcon
                                                    sx={{ color: "white" }}
                                                />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Box>
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
                                    Boolean(formik.errors.registrationExpiry)
                                }
                                helperText={
                                    formik.touched.registrationExpiry &&
                                    formik.errors.registrationExpiry
                                }
                                sx={{ mb: 2 }}
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
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="submit" variant="contained" color="primary">
                        Cập nhật
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditBusPopup;
