import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Menu,
    MenuItem,
    Container,
    Avatar,
    TextField,
    InputAdornment,
    Typography,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";

const UserAccountManagement = () => {
    const [customers, setCustomers] = useState([
        {
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
            username: "johnDoe",
            password: "password123",
            registrationDate: "2022-01-01",
            isActive: true,
        },
        {
            id: 2,
            name: "Jane Doe",
            email: "jane.doe@example.com",
            username: "janeDoe",
            password: "password456",
            registrationDate: "2022-02-01",
            isActive: true,
        },
        {
            id: 3,
            name: "Bob Smith",
            email: "bob.smith@example.com",
            username: "bobSmith",
            password: "password789",
            registrationDate: "2022-03-01",
            isActive: false,
        },
    ]);

    const [sortDirection, setSortDirection] = useState("asc");
    const [menuState, setMenuState] = useState<{
        anchor: HTMLElement | null;
        customerId: number | null;
    }>({ anchor: null, customerId: null });

    const handleSort = () => {
        setCustomers(
            [...customers].sort(
                (a, b) =>
                    new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime()
            )
        );
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    };

    const handleMenu = (event: React.MouseEvent<HTMLButtonElement>, customerId: number) => {
        setMenuState({ anchor: event.currentTarget, customerId });
    };

    const handleClose = () => {
        setMenuState({ anchor: null, customerId: null });
    };

    return (
        <Container
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "20px",
            }}>
            <Typography
                variant="h5"
                color="primary"
                fontWeight={700}
                style={{ marginBottom: "16px" }}>
                Quản lý tài khoản người dùng
            </Typography>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    marginBottom: "16px",
                }}>
                <TextField
                    id="outlined-basic"
                    placeholder="Tìm kiếm khách hàng"
                    style={{ width: "400px" }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </div>
            <TableContainer style={{ width: "100%" }}>
                <Table>
                    <TableHead
                        style={{
                            backgroundColor: "#0d47a1",
                            padding: "10px",
                            borderLeft: "1px solid #0d47a1",
                            borderRight: "1px solid #0d47a1",
                        }}>
                        <TableRow style={{ color: "white", padding: "10px" }}>
                            <TableCell style={{ color: "white", fontWeight: 700, padding: "10px" }}>
                                Khách hàng
                            </TableCell>
                            <TableCell style={{ color: "white", fontWeight: 700, padding: "10px" }}>
                                Tên
                            </TableCell>
                            <TableCell style={{ color: "white", fontWeight: 700, padding: "10px" }}>
                                Email
                            </TableCell>
                            <TableCell
                                onClick={handleSort}
                                style={{ color: "white", fontWeight: 700, padding: "10px" }}>
                                Ngày đăng ký{" "}
                                {sortDirection === "asc" ? (
                                    <ArrowUpwardIcon style={{ color: "white", fontWeight: 700 }} />
                                ) : (
                                    <ArrowDownwardIcon
                                        style={{ color: "white", fontWeight: 700 }}
                                    />
                                )}{" "}
                            </TableCell>
                            <TableCell style={{ color: "white", fontWeight: 700, padding: "10px" }}>
                                Trạng thái
                            </TableCell>
                            <TableCell
                                style={{
                                    color: "white",
                                    fontWeight: 700,
                                    padding: "10px",
                                }}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow
                                key={customer.id}
                                style={{
                                    padding: "10px",
                                    borderLeft: "1px solid #ccc",
                                    borderRight: "1px solid #ccc",
                                }}>
                                <TableCell
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "10px",
                                    }}>
                                    <Avatar alt={customer.username} />
                                    <div style={{ marginLeft: 8, padding: "10px" }}>
                                        <div>{customer.username}</div>
                                        <div>{customer.password}</div>
                                    </div>
                                </TableCell>
                                <TableCell style={{ padding: "10px" }}>{customer.name}</TableCell>
                                <TableCell style={{ padding: "10px" }}>{customer.email}</TableCell>
                                <TableCell style={{ padding: "10px" }}>
                                    {new Date(customer.registrationDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell style={{ padding: "10px" }}>Đang hoạt động</TableCell>
                                <TableCell style={{ padding: "10px" }}>
                                    <Button
                                        id={customer.id.toString()}
                                        aria-controls="simple-menu"
                                        aria-haspopup="true"
                                        onClick={(e) => handleMenu(e, customer.id)}
                                        style={{
                                            borderRadius: "50%",
                                            color: "black",
                                            padding: "10px",
                                        }}>
                                        <MoreVertIcon />
                                    </Button>
                                    <Menu
                                        id={customer.id.toString()}
                                        anchorEl={menuState.anchor}
                                        keepMounted
                                        open={
                                            menuState.anchor !== null &&
                                            menuState.customerId === customer.id
                                        }
                                        onClose={handleClose}>
                                        <MenuItem>Vô hiệu hóa</MenuItem>
                                        <MenuItem style={{ color: "red" }}>Xóa</MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default UserAccountManagement;
