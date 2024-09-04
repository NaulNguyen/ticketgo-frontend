// CompanyRegistration.tsx
import React, { useState } from "react";
import { Grid, TextField, Button, IconButton, InputAdornment } from "@mui/material";
import { Formik, Form, Field } from "formik";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { companyValidationSchema } from "../../schemas";

interface CompanyRegistrationProps {
    onSubmit: (values: any) => void;
}

const CompanyRegistration: React.FC<CompanyRegistrationProps> = ({ onSubmit }) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Formik
            initialValues={{
                password: "",
                email: "",
                companyName: "",
                phone: "",
                address: "",
                description: "",
                businessLicense: "",
            }}
            validationSchema={companyValidationSchema}
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
                                label="Tên công ty"
                                name="companyName"
                                value={values.companyName}
                                onChange={handleChange}
                                error={touched.companyName && !!errors.companyName}
                                helperText={touched.companyName && errors.companyName}
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
                            <Field
                                as={TextField}
                                label="Mô tả"
                                name="description"
                                value={values.description}
                                onChange={handleChange}
                                error={touched.description && !!errors.description}
                                helperText={touched.description && errors.description}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Field
                                as={TextField}
                                label="Giấy phép kinh doanh"
                                name="businessLicense"
                                value={values.businessLicense}
                                onChange={handleChange}
                                error={touched.businessLicense && !!errors.businessLicense}
                                helperText={touched.businessLicense && errors.businessLicense}
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

export default CompanyRegistration;
