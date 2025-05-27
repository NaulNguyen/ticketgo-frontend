import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Avatar,
    Container,
    Paper,
    Typography,
    Stack,
} from "@mui/material";
import { Footer, Header } from "../../components";
import useAppAccessor from "../../hook/useAppAccessor";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { axiosWithJWT } from "../../config/axiosConfig";
import { ASYNC_USER_INFOR } from "../../actions/actionsType";
import UserService from "../../service/UserService";
import { styled } from "@mui/material/styles";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const Profile = () => {
    const { getUserInfor } = useAppAccessor();
    const userInfo = getUserInfor().user;

    const dispatch = useDispatch();

    const [formValues, setFormValues] = useState({
        fullName: userInfo.fullName || "",
        phoneNumber: userInfo.phoneNumber || "",
        dateOfBirth: userInfo.dateOfBirth || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const updatedValues = Object.fromEntries(
            Object.entries(formValues).filter(([_, value]) => value !== "")
        );

        try {
            const updateResponse = await axiosWithJWT.post(
                "https://ticketgo.site/api/v1/users",
                updatedValues
            );
            if (updateResponse.status === 200) {
                toast.success("Cập nhật thông tin cá nhân thành công");

                try {
                    const updatedUserInfo = await UserService.fetchUserInfor();
                    dispatch({
                        type: ASYNC_USER_INFOR,
                        payload: {
                            data: {
                                ...userInfo, // Giữ lại các trường cũ
                                ...updatedUserInfo, // Cập nhật thông tin mới từ server
                                ...updatedValues, // Ghi đè các giá trị từ formValues
                            },
                        },
                    });
                } catch (error) {
                    console.error("Lỗi khi tải thông tin mới:", error);
                }
            } else {
                toast.error("Cập nhật thông tin cá nhân thất bại");
            }
        } catch (error) {
            console.error("API error:", error);
        }
    };

    const handleImageUpload = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "ticketgo");
            formData.append("cloud_name", "dltlcxhsl");

            const response = await axios.post(
                "https://api.cloudinary.com/v1_1/dltlcxhsl/image/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.secure_url) {
                // Directly update profile with new image URL
                await axiosWithJWT.post("https://ticketgo.site/api/v1/users", {
                    imageUrl: response.data.secure_url,
                });

                // Update Redux state
                dispatch({
                    type: ASYNC_USER_INFOR,
                    payload: {
                        data: {
                            ...userInfo,
                            imageUrl: response.data.secure_url,
                        },
                    },
                });

                toast.success("Cập nhật ảnh đại diện thành công");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Không thể tải ảnh lên. Vui lòng thử lại");
        }
    };

    return (
        <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Header />
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        overflow: "hidden",
                        bgcolor: "white",
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    {/* Profile Header */}
                    <Box
                        sx={{
                            p: 4,
                            background:
                                "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                            color: "white",
                            textAlign: "center",
                        }}
                    >
                        <Box display="flex" justifyContent="center" mb={3}>
                            <Box sx={{ position: "relative", mb: 2 }}>
                                <Avatar
                                    src={userInfo?.imageUrl || ""}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        border: "4px solid #fff",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    }}
                                    alt="User Avatar"
                                />
                                <IconButton
                                    component="label"
                                    sx={{
                                        position: "absolute",
                                        top: 10,
                                        right: 10,
                                        backgroundColor:
                                            "rgba(255, 255, 255, 0.9)",
                                        padding: "8px",
                                        transform: "translate(25%, -25%)",
                                        "&:hover": {
                                            backgroundColor:
                                                "rgba(255, 255, 255, 1)",
                                        },
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <EditIcon
                                        sx={{ fontSize: 20, color: "#1976d2" }}
                                    />
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={(event) => {
                                            const file =
                                                event.currentTarget.files?.[0];
                                            if (file) {
                                                if (
                                                    ![
                                                        "image/jpeg",
                                                        "image/png",
                                                        "image/jpg",
                                                    ].includes(file.type)
                                                ) {
                                                    toast.error(
                                                        "Chỉ chấp nhận file ảnh (JPG, PNG)"
                                                    );
                                                    return;
                                                }
                                                if (
                                                    file.size >
                                                    5 * 1024 * 1024
                                                ) {
                                                    toast.error(
                                                        "Kích thước file không được vượt quá 5MB"
                                                    );
                                                    return;
                                                }
                                                handleImageUpload(file);
                                            }
                                        }}
                                    />
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>
                    {/* Profile Form */}
                    <Box sx={{ p: 4 }}>
                        <Typography
                            variant="h6"
                            sx={{ mb: 3, fontWeight: 600, color: "#1976d2" }}
                        >
                            Thông tin cá nhân
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <TextField
                                    label="Họ tên"
                                    name="fullName"
                                    value={
                                        formValues.fullName || userInfo.fullName
                                    }
                                    onChange={handleChange}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <EditIcon
                                                sx={{
                                                    mr: 1,
                                                    color: "text.secondary",
                                                }}
                                            />
                                        ),
                                    }}
                                    fullWidth
                                />
                                <TextField
                                    label="Số điện thoại"
                                    name="phoneNumber"
                                    value={
                                        formValues.phoneNumber ||
                                        userInfo.phoneNumber
                                    }
                                    onChange={handleChange}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <EditIcon
                                                sx={{
                                                    mr: 1,
                                                    color: "text.secondary",
                                                }}
                                            />
                                        ),
                                    }}
                                    fullWidth
                                />
                                <TextField
                                    label="Ngày sinh"
                                    name="dateOfBirth"
                                    type="date"
                                    value={
                                        formValues.dateOfBirth ||
                                        userInfo.dateOfBirth
                                    }
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
                                    fullWidth
                                />
                                <TextField
                                    label="Email"
                                    name="email"
                                    value={userInfo.email}
                                    disabled
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        "& .MuiInputBase-input.Mui-disabled": {
                                            WebkitTextFillColor: "#666",
                                        },
                                    }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        fontWeight: 600,
                                        fontSize: "1rem",
                                        boxShadow:
                                            "0 4px 12px rgba(25,118,210,0.2)",
                                        "&:hover": {
                                            boxShadow:
                                                "0 6px 16px rgba(25,118,210,0.3)",
                                        },
                                    }}
                                >
                                    Lưu Thay Đổi
                                </Button>
                            </Stack>
                        </form>
                    </Box>
                </Paper>
            </Container>
            <Footer />
        </Box>
    );
};

export default Profile;
