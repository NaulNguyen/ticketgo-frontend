import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { axiosWithJWT } from "../config/axiosConfig";
import { toast } from "react-toastify";

interface CreateVoucherPopupProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const validationSchema = Yup.object({
    description: Yup.string().required("Vui lòng nhập mô tả"),
    discountPercentage: Yup.number()
        .required("Vui lòng nhập phần trăm giảm giá")
        .min(0, "Phần trăm giảm giá không được âm")
        .max(100, "Phần trăm giảm giá không được vượt quá 100"),
    discountCode: Yup.string().required("Vui lòng nhập mã giảm giá"),
    startDate: Yup.date().required("Vui lòng chọn ngày bắt đầu"),
    endDate: Yup.date()
        .required("Vui lòng chọn ngày kết thúc")
        .min(Yup.ref("startDate"), "Ngày kết thúc phải sau ngày bắt đầu"),
});

const CreateVoucherPopup: React.FC<CreateVoucherPopupProps> = ({
    open,
    onClose,
    onSuccess,
}) => {
    const formik = useFormik({
        initialValues: {
            description: "",
            discountPercentage: "",
            discountCode: "",
            startDate: "",
            endDate: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await axiosWithJWT.post(
                    "http://178.128.16.200:8080/api/v1/promotions",
                    {
                        ...values,
                        discountPercentage: Number(values.discountPercentage),
                        startDate: `${values.startDate}T00:00:00`,
                        endDate: `${values.endDate}T00:00:00`,
                    }
                );
                if (response.status === 201) {
                    toast.success("Tạo voucher thành công");
                    onSuccess();
                    onClose();
                    formik.resetForm();
                }
            } catch (error) {
                toast.error("Có lỗi xảy ra khi tạo voucher");
            }
        },
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Thêm Voucher Mới</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Mô tả"
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            error={
                                formik.touched.description &&
                                Boolean(formik.errors.description)
                            }
                            helperText={
                                formik.touched.description &&
                                formik.errors.description
                            }
                        />
                        <TextField
                            fullWidth
                            label="Phần trăm giảm giá"
                            name="discountPercentage"
                            type="number"
                            value={formik.values.discountPercentage}
                            onChange={formik.handleChange}
                            error={
                                formik.touched.discountPercentage &&
                                Boolean(formik.errors.discountPercentage)
                            }
                            helperText={
                                formik.touched.discountPercentage &&
                                formik.errors.discountPercentage
                            }
                        />
                        <TextField
                            fullWidth
                            label="Mã giảm giá"
                            name="discountCode"
                            value={formik.values.discountCode}
                            onChange={formik.handleChange}
                            error={
                                formik.touched.discountCode &&
                                Boolean(formik.errors.discountCode)
                            }
                            helperText={
                                formik.touched.discountCode &&
                                formik.errors.discountCode
                            }
                        />
                        <TextField
                            fullWidth
                            label="Ngày bắt đầu"
                            name="startDate"
                            type="date"
                            value={formik.values.startDate}
                            onChange={formik.handleChange}
                            InputLabelProps={{ shrink: true }}
                            error={
                                formik.touched.startDate &&
                                Boolean(formik.errors.startDate)
                            }
                            helperText={
                                formik.touched.startDate &&
                                formik.errors.startDate
                            }
                        />
                        <TextField
                            fullWidth
                            label="Ngày kết thúc"
                            name="endDate"
                            type="date"
                            value={formik.values.endDate}
                            onChange={formik.handleChange}
                            InputLabelProps={{ shrink: true }}
                            error={
                                formik.touched.endDate &&
                                Boolean(formik.errors.endDate)
                            }
                            helperText={
                                formik.touched.endDate && formik.errors.endDate
                            }
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="submit" variant="contained" color="primary">
                        Tạo
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CreateVoucherPopup;
