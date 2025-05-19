import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
} from "@mui/material";
import { useFormik } from "formik";
import { axiosWithJWT } from "../config/axiosConfig";
import { toast } from "react-toastify";
import { EditVoucherValidationSchema } from "../schemas";

interface EditVoucherPopupProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    voucherId: string | null;
}

const EditVoucherPopup: React.FC<EditVoucherPopupProps> = ({
    open,
    onClose,
    onSuccess,
    voucherId,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            description: "",
            discountPercentage: "",
            discountCode: "",
            startDate: "",
            endDate: "",
            status: "",
        },
        validationSchema: EditVoucherValidationSchema,
        onSubmit: async (values) => {
            try {
                const response = await axiosWithJWT.post(
                    `https://ticketgo.site/api/v1/promotions/${voucherId}`,
                    {
                        ...values,
                        discountPercentage: Number(values.discountPercentage),
                        startDate: `${values.startDate}T00:00:00`,
                        endDate: `${values.endDate}T00:00:00`,
                        status: values.status,
                    }
                );
                if (response.status === 200) {
                    toast.success("Cập nhật voucher thành công");
                    onSuccess();
                    onClose();
                }
            } catch (error) {
                toast.error("Có lỗi xảy ra khi cập nhật voucher");
            }
        },
    });

    useEffect(() => {
        const fetchVoucherData = async () => {
            if (voucherId && open) {
                setIsLoading(true);
                try {
                    const response = await axiosWithJWT.get(
                        `https://ticketgo.site/api/v1/promotions/${voucherId}`
                    );
                    const data = response.data.data;
                    formik.setValues({
                        description: data.description,
                        discountPercentage: data.discountPercentage.toString(),
                        discountCode: data.discountCode,
                        startDate: data.startDate.split("T")[0],
                        endDate: data.endDate.split("T")[0],
                        status: data.status,
                    });
                } catch (error) {
                    toast.error("Không thể tải thông tin voucher");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchVoucherData();
    }, [voucherId, open]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Chỉnh sửa Voucher</DialogTitle>
            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
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
                                    formik.touched.endDate &&
                                    formik.errors.endDate
                                }
                            />
                            <FormControl
                                fullWidth
                                error={
                                    formik.touched.status &&
                                    Boolean(formik.errors.status)
                                }
                            >
                                <InputLabel id="status-label">
                                    Trạng thái
                                </InputLabel>
                                <Select
                                    labelId="status-label"
                                    name="status"
                                    value={formik.values.status}
                                    onChange={formik.handleChange}
                                    label="Trạng thái"
                                >
                                    <MenuItem value="ACTIVE">
                                        Hoạt động
                                    </MenuItem>
                                    <MenuItem value="INACTIVE">
                                        Không hoạt động
                                    </MenuItem>
                                </Select>
                                {formik.touched.status &&
                                    formik.errors.status && (
                                        <FormHelperText>
                                            {formik.errors.status}
                                        </FormHelperText>
                                    )}
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>Hủy</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Cập nhật
                        </Button>
                    </DialogActions>
                </form>
            )}
        </Dialog>
    );
};

export default EditVoucherPopup;
