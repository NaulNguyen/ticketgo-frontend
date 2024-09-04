// UserRegistration.tsx
import React, { useState } from "react";
import { Grid, TextField, Button, IconButton, InputAdornment } from "@mui/material";
import { Formik, Form, Field } from "formik";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { userValidationSchema } from "../../schemas";

interface UserRegistrationProps {
    onSubmit: (values: any) => void;
}

const UserRegistration: React.FC<UserRegistrationProps> = ({ onSubmit }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Formik
            initialValues={{
                password: "",
                email: "",
                fullName: "",
                phone: "",
                identityNo: "",
                dateOfBirth: "",
                address: "",
            }}
            validationSchema={userValidationSchema}
            onSubmit={(values, actions) => {
                onSubmit(values);
                actions.resetForm();
            }}>
            {({ handleSubmit, handleChange, values, errors, touched }) => (
                <Form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                label="Tên"
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
                                name="phone"
                                value={values.phone}
                                onChange={handleChange}
                                error={touched.phone && !!errors.phone}
                                helperText={touched.phone && errors.phone}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                label="Căn cước công dân"
                                name="identityNo"
                                value={values.identityNo}
                                onChange={handleChange}
                                error={touched.identityNo && !!errors.identityNo}
                                helperText={touched.identityNo && errors.identityNo}
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
                                InputLabelProps={{ shrink: true }}
                                value={values.dateOfBirth}
                                onChange={handleChange}
                                error={touched.dateOfBirth && !!errors.dateOfBirth}
                                helperText={touched.dateOfBirth && errors.dateOfBirth}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                label="Địa chỉ"
                                name="address"
                                value={values.address}
                                onChange={handleChange}
                                error={touched.address && !!errors.address}
                                helperText={touched.address && errors.address}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                Đăng ký
                            </Button>
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>
    );
};

export default UserRegistration;
