import React, { useState} from 'react';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { loginValidationSchema } from "../schemas";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserService from "../service/UserService";
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { asyncUserInfor } from '../actions/user.action';

interface LoginProps {
  onClose: () => void;
  onRegisterClick: () => void; 
}

const Login: React.FC<LoginProps> = ({ onClose, onRegisterClick }) => {
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();

    const handleSubmit = async (values: { email: string; password: string; }) => {
        setLoading(true);
        try {
            const response = await UserService.login(values); 
            if (response.status === 200) {
                const { accessToken, refreshToken} = response.data;
                Cookies.set('accessToken', accessToken);
                Cookies.set('refreshToken', refreshToken);
                const userInfoResponse = await UserService.fetchUserInfor();
                dispatch(asyncUserInfor(userInfoResponse)); 
                onClose();
                toast.success("Đăng nhập thành công");
            }
        } catch (error: any) {
            if (error.response) {
                const { status, data } = error.response;
                if (status === 401) {
                    toast.error(data.message || "Vui lòng kiểm tra email hoặc mật khẩu của bạn.");
                } else if (status === 400) {
                    toast.error(data.message || "Email không được để trống.");
                } else {
                    toast.error(data.message || "Đã xảy ra lỗi không xác định.");
                }
            } else {
                toast.error("Login failed: " + (error.message || "An unknown error occurred"));
            }
        } finally {
            setLoading(false);
        }
    };
  
    return (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          padding={2}
        >
          <Typography variant="h4" gutterBottom>
            Đăng nhập
          </Typography>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <Field 
                  as={TextField} 
                  label="Email" 
                  name="email" 
                  fullWidth 
                  margin="normal" 
                  variant="outlined" 
                  helperText={<ErrorMessage name="email" />}
                  error={Boolean(errors.email && touched.email)} // Corrected error handling
                />
                <Field 
                  as={TextField} 
                  label="Mật Khẩu" 
                  name="password" 
                  type="password" 
                  fullWidth 
                  margin="normal" 
                  variant="outlined" 
                  helperText={<ErrorMessage name="password" />}
                  error={Boolean(errors.password && touched.password)} // Corrected error handling
                />
                 <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    Đăng nhập
                </Button>
                <Typography variant="body2" paddingTop={2} sx={{ fontSize: "1rem" }}>
                  Bạn chưa có tài khoản?{' '}
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
        </Box>
    );
};

export default Login;
