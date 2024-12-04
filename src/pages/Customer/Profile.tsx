import React, { useState } from "react";
import { Box, TextField, Button, Avatar } from "@mui/material";
import { Footer, Header } from "../../components";
import useAppAccessor from "../../hook/useAppAccessor";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { axiosWithJWT } from "../../config/axiosConfig";
import { ASYNC_USER_INFOR } from "../../actions/actionsType";
import UserService from "../../service/UserService";

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
                "https://ticketgo-app-a139ba17185b.herokuapp.com/api/v1/users",
                updatedValues
            );
            if (updateResponse.status === 200) {
                toast.success("Cập nhật thông tin cá nhân thành công");

                try {
                    const updatedUserInfo = await UserService.fetchUserInfor();
                    console.log("updatedUserInfo", updatedUserInfo);
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

    return (
        <Box sx={{ backgroundColor: "#f0f0f0" }}>
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
                }}>
                <Box display="flex" justifyContent="center" mb={3}>
                    <Avatar
                        src={userInfo?.imageUrl || ""}
                        sx={{ width: 100, height: 100 }}
                        alt="User Avatar"
                    />
                </Box>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Họ tên"
                        name="fullName"
                        value={formValues.fullName || userInfo.fullName}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Số điện thoại"
                        name="phoneNumber"
                        value={formValues.phoneNumber || userInfo.phoneNumber}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Ngày sinh"
                        name="dateOfBirth"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={formValues.dateOfBirth || userInfo.dateOfBirth}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email"
                        name="email"
                        value={userInfo.email}
                        disabled
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ marginTop: 2 }}>
                        Lưu Thay Đổi
                    </Button>
                </form>
            </Box>
            <Footer />
        </Box>
    );
};

export default Profile;
