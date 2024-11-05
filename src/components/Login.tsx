import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { loginValidationSchema } from "../schemas";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserService from "../service/UserService";
import Cookies from 'js-cookie';
import { loginRequest, loginSuccess, loginFailure } from '../actions/login.action';
import { useDispatch } from 'react-redux';

interface LoginProps {
  onClose: () => void;
  onRegisterClick: () => void; 
}

const Login: React.FC<LoginProps> = ({ onClose, onRegisterClick }) => {
    const dispatch = useDispatch();
    const handleSubmit = async (values: { email: string; password: string; }) => {
      dispatch(loginRequest());
      try {
          const response = await UserService.login(values); // Now this returns the full response
          console.log(response)
          if (response.status === 200) {
            const { accessToken, refreshToken } = response.data;
            Cookies.set('accessToken', accessToken);
            Cookies.set('refreshToken', refreshToken);
            const userInfoResponse = await UserService.fetchUserInfor();
            console.log('User Info Response:', userInfoResponse); // Log the response to check its structure
            dispatch(loginSuccess(userInfoResponse));
            onClose();
        }
      } catch (error: any) {
          if (error.response) {
              // Server responded with a status other than 2xx
              const { status, data } = error.response;
              if (status === 401) {
                  toast.error(data.message || "Vui lòng kiểm tra email hoặc mật khẩu của bạn.");
                  dispatch(loginFailure(data.message));
              } else if (status === 400) {
                  toast.error(data.message || "Email không được để trống.");
                  dispatch(loginFailure(data.message));
              } else {
                  toast.error(data.message || "Đã xảy ra lỗi không xác định.");
                  dispatch(loginFailure(data.message));
              }
          } else {
              // Network or other errors
              toast.error("Login failed: " + (error.message || "An unknown error occurred"));
              dispatch(loginFailure(error.message));
          }
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
                  disabled={isSubmitting} 
                  fullWidth 
                  sx={{ marginTop: 2 }}
                >
                  {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
