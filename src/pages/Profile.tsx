import React from "react";
import { useFormik } from "formik";
import { Box, TextField, Button, Avatar } from "@mui/material";
import { profileValidationSchema } from "../schemas";
import { Footer, Header } from "../components";
import useAppAccessor from "../hook/useAppAccessor";

const Profile = () => {
    const { getUserInfor } = useAppAccessor();
    const userInfo = getUserInfor().user;

    // UseEffect to set initialValues when userInfo is available
    const formik = useFormik({
        initialValues: {
            fullName: userInfo?.fullName || "",
            phone: userInfo?.phoneNumber || "",
            dateOfBirth: userInfo?.dateOfBirth || "",
            email: userInfo?.email || "",
        },
        enableReinitialize: true, // Allow form to reinitialize when initialValues change
        validationSchema: profileValidationSchema,
        onSubmit: (values) => {
            console.log("Updated Profile Data:", values);
            // API call to update the profile data
        },
    });

    return (
        <Box sx={{
            backgroundColor: "#f0f0f0"
        }}>
            <Header />
            <Box
                sx={{
                    maxWidth: 600,
                    margin: "auto",
                    marginTop: 5,
                    padding: 3,
                    borderRadius: 2,
                    marginBottom: 5,
                    backgroundColor: "#ffffff",
                }}
            >
                <Box display="flex" justifyContent="center" mb={3}>
                    <Avatar
                        src={userInfo?.imageUrl || ""}
                        sx={{ width: 100, height: 100 }}
                        alt="User Avatar"
                    />
                </Box>
                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Họ tên"
                        name="fullName"
                        value={formik.values.fullName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                        helperText={formik.touched.fullName && formik.errors.fullName}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Số điện thoại"
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Ngày sinh"
                        name="dateOfBirth"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={formik.values.dateOfBirth}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                        helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ 
                            marginTop: 2,
                            textTransform: "none",
                            fontWeight: "700", 
                        }}
                    >
                        Lưu Thay Đổi
                    </Button>
                </form>
            </Box>
            <Footer />
        </Box>
    );
};

export default Profile;
