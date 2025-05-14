import React, { useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    TextField,
    Typography,
    IconButton,
} from "@mui/material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
    forgotPasswordValidationSchema,
    loginValidationSchema,
} from "../schemas";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserService from "../service/UserService";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { asyncUserInfor } from "../actions/user.action";
import GoogleLoginButton from "./Customer/GoogleLoginButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useNavigate } from "react-router-dom";

interface LoginProps {
    onClose: () => void;
    onRegisterClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose, onRegisterClick }) => {
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            const response = await UserService.login(values);
            if (response.status === 200) {
                const { accessToken, refreshToken } = response.data;
                Cookies.set("accessToken", accessToken);
                Cookies.set("refreshToken", refreshToken);
                const userInfoResponse = await UserService.fetchUserInfor();

                dispatch(asyncUserInfor(userInfoResponse));

                if (userInfoResponse.data.role === "ROLE_BUS_COMPANY") {
                    navigate("/dashboard");
                }

                onClose();
                toast.success("Đăng nhập thành công");
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Đã xảy ra lỗi đăng nhập."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (values: {
        email: string;
        forgotPasswordEmail: string;
    }) => {
        try {
            const response = await UserService.forgotPassword({
                email: values.forgotPasswordEmail,
            });
            if (response.status === 201) {
                toast.success("Email khôi phục mật khẩu đã được gửi");
                toast.info("Vui lòng kiểm tra email của bạn");
                navigate("/resend-email", {
                    state: {
                        email: values.forgotPasswordEmail,
                        from: "forgotPassword",
                    },
                });
                setShowForgotPassword(false);
                onClose();
            }
        } catch (error: any) {
            toast.error("Email không tồn tại trong hệ thống");
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            padding={2}
        >
            {showForgotPassword ? (
                <>
                    <Box
                        display="flex"
                        alignItems="center"
                        marginBottom={2}
                        justifyContent="center"
                    >
                        <IconButton sx={{ mb: 2 }}>
                            <ArrowBackIosIcon
                                onClick={() => setShowForgotPassword(false)}
                            />
                        </IconButton>
                        <Typography variant="h5" gutterBottom ml={15} mr={20}>
                            Quên mật khẩu
                        </Typography>
                    </Box>
                    <Formik
                        initialValues={{ email: "", forgotPasswordEmail: "" }}
                        validationSchema={forgotPasswordValidationSchema}
                        onSubmit={handleForgotPassword}
                        fullWidth
                    >
                        {({ isSubmitting, touched, errors }) => (
                            <Form>
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    gap={2}
                                >
                                    <Field
                                        as={TextField}
                                        label="Email"
                                        name="forgotPasswordEmail"
                                        margin="normal"
                                        variant="outlined"
                                        helperText={
                                            <ErrorMessage name="forgotPasswordEmail" />
                                        }
                                        error={Boolean(
                                            touched.forgotPasswordEmail &&
                                                errors.forgotPasswordEmail
                                        )}
                                        sx={{ width: "350px", ml: 7 }}
                                    />
                                    <IconButton
                                        type="submit"
                                        color="primary"
                                        disabled={isSubmitting}
                                        sx={{ width: "50px", height: "50px" }}
                                    >
                                        {isSubmitting ? (
                                            <CircularProgress size={20} />
                                        ) : (
                                            <ArrowForwardIcon />
                                        )}
                                    </IconButton>
                                </Box>
                            </Form>
                        )}
                    </Formik>
                </>
            ) : (
                <>
                    <Typography variant="h4" gutterBottom>
                        Đăng nhập
                    </Typography>
                    <Formik
                        initialValues={{ email: "", password: "" }}
                        validationSchema={loginValidationSchema}
                        onSubmit={handleLogin}
                    >
                        {({ isSubmitting, touched, errors }) => (
                            <Form>
                                <Field
                                    as={TextField}
                                    label="Email"
                                    name="email"
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    helperText={<ErrorMessage name="email" />}
                                    error={Boolean(
                                        touched.email && errors.email
                                    )}
                                />
                                <Field
                                    as={TextField}
                                    label="Mật khẩu"
                                    name="password"
                                    type="password"
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    helperText={
                                        <ErrorMessage name="password" />
                                    }
                                    error={Boolean(
                                        touched.password && errors.password
                                    )}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    disabled={loading}
                                    startIcon={
                                        loading ? (
                                            <CircularProgress size={20} />
                                        ) : null
                                    }
                                >
                                    Đăng nhập
                                </Button>
                                <Button
                                    sx={{
                                        color: "#2474e5",
                                        textTransform: "none",
                                        textDecoration: "underline",
                                        width: "100%",
                                        marginTop: 1,
                                    }}
                                    onClick={() => setShowForgotPassword(true)}
                                >
                                    Quên mật khẩu?
                                </Button>
                                <Divider sx={{ marginBottom: 2, marginTop: 1 }}>
                                    Hoặc
                                </Divider>
                                <GoogleLoginButton onClose={onClose} />
                                <Typography
                                    variant="body2"
                                    paddingTop={2}
                                    sx={{ fontSize: "1rem" }}
                                >
                                    Bạn chưa có tài khoản?{" "}
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
                                        onClick={onRegisterClick}
                                    >
                                        Đăng ký
                                    </Box>
                                </Typography>
                            </Form>
                        )}
                    </Formik>
                </>
            )}
        </Box>
    );
};

export default Login;
