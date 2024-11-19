import React, { useState } from 'react';
import { Box, Button, TextField, CircularProgress, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';  // For retrieving the token from the URL
import { toast } from 'react-toastify';
import UserService from '../service/UserService';
import { Footer, Header } from '../components';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const handleResetPassword = async () => {
        if (!newPassword) {
            toast.error("Vui lòng nhập mật khẩu mới.");
            return;
        }
    
        // Validate password length and composition
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error("Mật khẩu phải ít nhất 6 ký tự bao gồm chữ cái và số.");
            return;
        }
    
        setLoading(true);
        setError('');
    
        try {
            const response = await UserService.resetPassword({
                password: newPassword,
                token: token || '',
            });
    
            if (response.status === 201) {
                toast.success('Đặt lại mật khẩu mới thành công.');
                navigate('/'); // Redirect to homepage after success
            } else if (response.status === 410) {
                toast.error("Đường link đã hết hạn!");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Header />
            <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "65vh",
                    textAlign: "center",
                    padding: "20px",
                    backgroundColor: "#f0f0f0"
                }}>
                    <Box sx={{
                        backgroundColor: "#ffffff",
                        padding: "30px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                    }}>
                        <Typography variant="h4" gutterBottom>
                            Đặt lại mật khẩu
                        </Typography>
                        <TextField
                            label="Mật khẩu mới"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        />
                        {error && (
                            <Typography variant="body2" color="error" marginBottom={2}>
                                {error}
                            </Typography>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleResetPassword}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : null}
                            sx={{textTransform: "none", mt: 2}}
                        >
                            Đặt lại mật khẩu
                        </Button>
                    </Box>
            </Box>
            <Footer/>
        </Box>
    );
};

export default ResetPassword;
