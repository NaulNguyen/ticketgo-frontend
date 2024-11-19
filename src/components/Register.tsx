import React, { useState } from "react";
import { Grid, TextField, Button, IconButton, InputAdornment, Typography, Box, CircularProgress } from "@mui/material";
import { Formik, Form, Field } from "formik";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { userValidationSchema } from "../schemas";
import UserService from "../service/UserService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface RegistrationProps {
    onClose: () => void;
    onLoginClick: () => void; 
  }

const Registration: React.FC<RegistrationProps> = ({ onClose, onLoginClick }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };


    const handleUserSubmit = async (values: any) => {
        setLoading(true);
        try {
            const response = await UserService.register(values);  
            if (response.data.status === 200) {
                onClose();
                toast.success("Đăng ký tài khoản thành công");
                toast.info("Vui lòng kiểm tra email để kích hoạt tài khoản!")
            } else if (response.data.status === 409) {
                toast.error("Tài khoản với email này đã tồn tại.");
                toast.warn("Vui lòng chọn một email khác!");
            }
        } catch (error) {
            toast.error(`User registration failed: ${error}`);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <Formik
            initialValues={{
                email: "",
                password: "",
                fullName: "",
                phoneNumber: "",
                dateOfBirth: "",
            }}
            validationSchema={userValidationSchema}
            onSubmit={(values, actions) => {
                handleUserSubmit(values);
                actions.resetForm();
            }}>
            {({  handleSubmit, handleChange, setFieldValue, values, errors, touched  }) => (
                <Form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h4" align="center">
                                Đăng ký
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                label="Họ và Tên"
                                name="fullName"
                                value={values.fullName}
                                onChange={handleChange}
                                error={touched.fullName && !!errors.fullName}
                                helperText={touched.fullName && errors.fullName}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                label="Email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                error={touched.email && !!errors.email}
                                helperText={touched.email && errors.email}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                label="Mật khẩu"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                                error={touched.password && !!errors.password}
                                helperText={touched.password && errors.password}
                                fullWidth
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={togglePasswordVisibility}
                                                edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                label="Số điện thoại"
                                name="phoneNumber"
                                value={values.phoneNumber}
                                onChange={handleChange}
                                error={touched.phoneNumber && !!errors.phoneNumber}
                                helperText={touched.phoneNumber && errors.phoneNumber}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                label="Ngày sinh"
                                name="dateOfBirth"
                                type="date"
                                value={values.dateOfBirth}
                                onChange={(e: any) => {
                                    const isoDate = e.target.value;
                                    setFieldValue("dateOfBirth", isoDate); 
                                }}
                                format="dd/MM/yyyy"
                                error={touched.dateOfBirth && !!errors.dateOfBirth}
                                helperText={touched.dateOfBirth && errors.dateOfBirth}
                                fullWidth
                                InputLabelProps={{ shrink: true }} 
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                Đăng ký
                            </Button>
                        </Grid>
                    </Grid>

                    <Typography variant="body2" paddingTop={2} sx={{ fontSize: "1rem" }}>
                        Bạn đã có tài khoản?{' '}
                        <Box
                            component="span"
                            color="primary.main"
                            sx={{
                            cursor: "pointer",
                            textDecoration: "none",
                            "&:hover": {
                                textDecoration: "underline",
                            },
                            }}
                            onClick={onLoginClick}
                        >
                            Đăng nhập
                        </Box>
                    </Typography>
                </Form>
            )}
        </Formik>
    );
};

export default Registration;
