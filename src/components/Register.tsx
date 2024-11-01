import React, { useState } from "react";
import { Grid, TextField, Button, IconButton, InputAdornment, Typography, Box } from "@mui/material";
import { Formik, Form, Field } from "formik";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { userValidationSchema } from "../schemas";
import UserService from "../service/UserService";

interface RegistrationProps {
    onClose: () => void;
    onLoginClick: () => void; // Prop to open the login modal
  }

const Registration: React.FC<RegistrationProps> = ({ onClose, onLoginClick }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };


    const handleUserSubmit = async (values: any) => {
        try {
            await UserService.register(values);  
            onClose();
        } catch (error) {
            console.error("User registration failed:", error);
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
                console.log(values);
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
                                error={touched.dateOfBirth && !!errors.dateOfBirth}
                                helperText={touched.dateOfBirth && errors.dateOfBirth}
                                fullWidth
                                InputLabelProps={{ shrink: true }} 
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary" fullWidth>
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
