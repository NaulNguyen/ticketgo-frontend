import React, { useEffect, useState } from "react";
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
    Typography,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Divider,
    InputAdornment,
    IconButton,
    Box,
    CircularProgress,
    TextField,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { toast } from "react-toastify";
import { axiosWithJWT } from "../../config/axiosConfig";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useDebounce } from "use-debounce";

interface Account {
    id: number;
    fullName: string;
    email: string;
    imageUrl: string;
    registrationDate: string;
    status: string;
}

interface Pagination {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

interface AccountResponse {
    status: number;
    message: string;
    data: Account[];
    pagination: Pagination;
}
const UserAccountManagement = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [lockDialogOpen, setLockDialogOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(
        null
    );
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(
        null
    );
    const [sortDirection, setSortDirection] = useState("asc");
    const [menuState, setMenuState] = useState<{
        anchor: HTMLElement | null;
        customerId: number | null;
    }>({ anchor: null, customerId: null });
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const response = await axiosWithJWT.get<AccountResponse>(
                `http://178.128.16.200:8080/api/v1/accounts?${
                    debouncedSearchTerm
                        ? `keyword=${encodeURIComponent(debouncedSearchTerm)}&`
                        : ""
                }pageNumber=${page}&pageSize=${pageSize}`
            );

            if (response.status === 200) {
                setAccounts(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch accounts:", error);
            toast.error("Không thể tải danh sách tài khoản");
        } finally {
            setLoading(false);
        }
    };

    const executeLockAccount = async () => {
        if (!selectedAccount) return;

        try {
            const response = await axiosWithJWT.put(
                `http://178.128.16.200:8080/api/v1/accounts/${selectedAccount.id}/change-lock-status`
            );

            if (response.status === 200) {
                toast.success("Thay đổi trạng thái tài khoản thành công");
                fetchAccounts(); // Refresh the list
            }
        } catch (error) {
            console.error("Failed to change account status:", error);
            toast.error("Không thể thay đổi trạng thái tài khoản");
        } finally {
            setLockDialogOpen(false);
            setSelectedAccount(null);
        }
    };

    const handleLockAccount = async (account: Account) => {
        setSelectedAccount(account);
        setLockDialogOpen(true);
        handleClose(); // Close the menu
    };

    useEffect(() => {
        setPage(1);
        fetchAccounts();
    }, [debouncedSearchTerm]);

    const handleSort = () => {
        const newDirection = sortDirection === "asc" ? "desc" : "asc";

        setAccounts((prevAccounts) => {
            return [...prevAccounts].sort((a, b) => {
                const dateA = new Date(a.registrationDate).getTime();
                const dateB = new Date(b.registrationDate).getTime();

                return newDirection === "asc" ? dateA - dateB : dateB - dateA;
            });
        });

        setSortDirection(newDirection);
    };

    const handleDeleteAccount = async (account: Account) => {
        if (!account) return;

        try {
            const response = await axiosWithJWT.delete(
                `http://178.128.16.200:8080/api/v1/accounts/${account.id}`
            );

            if (response.status === 200) {
                toast.success("Xóa tài khoản thành công");
                fetchAccounts(); // Refresh the list
            }
        } catch (error) {
            console.error("Failed to delete account:", error);
            toast.error("Không thể xóa tài khoản");
        } finally {
            setAccountToDelete(null);
        }
    };

    const formatDate = (dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        } catch {
            return "Invalid date";
        }
    };

    const handleMenu = (
        event: React.MouseEvent<HTMLButtonElement>,
        customerId: number
    ) => {
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
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 700,
                    color: "#1565c0",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 3,
                }}
            >
                Quản lý tài khoản khách hàng
            </Typography>

            <Box
                sx={{
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "50%",
                }}
            >
                <TextField
                    fullWidth
                    placeholder="Tìm kiếm theo tên khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                        backgroundColor: "white",
                        borderRadius: 1,
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                borderColor: "#e0e0e0",
                            },
                            "&:hover fieldset": {
                                borderColor: "#1976d2",
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#1976d2",
                            },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "text.secondary" }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => {
                                        setSearchTerm("");
                                        setPage(1);
                                    }}
                                    size="small"
                                    sx={{
                                        color: "text.secondary",
                                        "&:hover": {
                                            color: "error.main",
                                        },
                                    }}
                                >
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : accounts.length === 0 ? (
                <Box
                    sx={{
                        textAlign: "center",
                        py: 3,
                        backgroundColor: "white",
                        borderRadius: 1,
                        mb: 3,
                    }}
                >
                    <Typography color="text.secondary">
                        {searchTerm
                            ? "Không tìm thấy kết quả"
                            : "Chưa có tài khoản nào"}
                    </Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} style={{ width: "100%" }}>
                    <Table>
                        <TableHead
                            style={{
                                backgroundColor: "#1976d2",
                                padding: "10px",
                                borderLeft: "1px solid #1976d2",
                                borderRight: "1px solid #1976d2",
                            }}
                        >
                            <TableRow
                                style={{ color: "white", padding: "10px" }}
                            >
                                <TableCell
                                    style={{
                                        color: "white",
                                        fontWeight: 700,
                                        padding: "10px",
                                    }}
                                >
                                    Khách hàng
                                </TableCell>
                                <TableCell
                                    style={{
                                        color: "white",
                                        fontWeight: 700,
                                        padding: "10px",
                                    }}
                                >
                                    Tên
                                </TableCell>
                                <TableCell
                                    style={{
                                        color: "white",
                                        fontWeight: 700,
                                        padding: "10px",
                                    }}
                                >
                                    Email
                                </TableCell>
                                <TableCell
                                    onClick={handleSort}
                                    style={{
                                        color: "white",
                                        fontWeight: 700,
                                        padding: "10px",
                                    }}
                                >
                                    Ngày đăng ký{" "}
                                    {sortDirection === "asc" ? (
                                        <ArrowUpwardIcon
                                            style={{
                                                color: "white",
                                                fontWeight: 700,
                                            }}
                                        />
                                    ) : (
                                        <ArrowDownwardIcon
                                            style={{
                                                color: "white",
                                                fontWeight: 700,
                                            }}
                                        />
                                    )}{" "}
                                </TableCell>
                                <TableCell
                                    style={{
                                        color: "white",
                                        fontWeight: 700,
                                        padding: "10px",
                                    }}
                                >
                                    Trạng thái
                                </TableCell>
                                <TableCell
                                    style={{
                                        color: "white",
                                        fontWeight: 700,
                                        padding: "10px",
                                    }}
                                ></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {accounts.map((account) => (
                                <TableRow
                                    key={account.id}
                                    style={{
                                        padding: "10px",
                                        borderLeft: "1px solid #ccc",
                                        borderRight: "1px solid #ccc",
                                    }}
                                >
                                    <TableCell
                                        style={{
                                            padding: "10px",
                                        }}
                                    >
                                        <Avatar
                                            alt={account.fullName}
                                            src={account.imageUrl}
                                        />
                                    </TableCell>
                                    <TableCell style={{ padding: "10px" }}>
                                        {account.fullName}
                                    </TableCell>
                                    <TableCell style={{ padding: "10px" }}>
                                        {account.email}
                                    </TableCell>
                                    <TableCell style={{ padding: "10px" }}>
                                        {formatDate(account.registrationDate)}
                                    </TableCell>
                                    <TableCell style={{ padding: "10px" }}>
                                        <Typography
                                            sx={{
                                                backgroundColor:
                                                    account.status ===
                                                    "Đang hoạt động"
                                                        ? "success.main"
                                                        : "error.main",
                                                fontWeight: 600,
                                                color: "white",
                                                borderRadius: "16px",
                                                padding: "6px 16px",
                                                display: "inline-block",
                                                textAlign: "center",
                                                minWidth: "120px",
                                                fontSize: "0.875rem",
                                                boxShadow: 1,
                                            }}
                                        >
                                            {account.status}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ padding: "10px" }}>
                                        <Button
                                            id={account.id.toString()}
                                            aria-controls="simple-menu"
                                            aria-haspopup="true"
                                            onClick={(e) =>
                                                handleMenu(e, account.id)
                                            }
                                            style={{
                                                borderRadius: "50%",
                                                color: "black",
                                                padding: "10px",
                                            }}
                                        >
                                            <MoreVertIcon />
                                        </Button>
                                        <Menu
                                            id={account.id.toString()}
                                            anchorEl={menuState.anchor}
                                            keepMounted
                                            open={
                                                menuState.anchor !== null &&
                                                menuState.customerId ===
                                                    account.id
                                            }
                                            onClose={handleClose}
                                            PaperProps={{
                                                elevation: 3,
                                                sx: {
                                                    borderRadius: 2,
                                                    minWidth: 200,
                                                    mt: 1,
                                                    "& .MuiList-root": {
                                                        py: 1,
                                                    },
                                                    overflow: "visible",
                                                    "&:before": {
                                                        content: '""',
                                                        display: "block",
                                                        position: "absolute",
                                                        top: 0,
                                                        right: 14,
                                                        width: 10,
                                                        height: 10,
                                                        bgcolor:
                                                            "background.paper",
                                                        transform:
                                                            "translateY(-50%) rotate(45deg)",
                                                        zIndex: 0,
                                                    },
                                                },
                                            }}
                                            transformOrigin={{
                                                horizontal: "right",
                                                vertical: "top",
                                            }}
                                            anchorOrigin={{
                                                horizontal: "right",
                                                vertical: "bottom",
                                            }}
                                        >
                                            <MenuItem
                                                onClick={() =>
                                                    handleLockAccount(account)
                                                }
                                                sx={{
                                                    py: 1.5,
                                                    px: 2,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1.5,
                                                    "&:hover": {
                                                        backgroundColor:
                                                            account.status ===
                                                            "Đang hoạt động"
                                                                ? "error.lighter"
                                                                : "success.lighter",
                                                    },
                                                }}
                                            >
                                                {account.status ===
                                                "Đang hoạt động" ? (
                                                    <LockIcon
                                                        sx={{
                                                            color: "error.main",
                                                        }}
                                                    />
                                                ) : (
                                                    <LockOpenIcon
                                                        sx={{
                                                            color: "success.main",
                                                        }}
                                                    />
                                                )}
                                                <Typography
                                                    sx={{
                                                        color:
                                                            account.status ===
                                                            "Đang hoạt động"
                                                                ? "error.main"
                                                                : "success.main",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {account.status ===
                                                    "Đang hoạt động"
                                                        ? "Vô hiệu hóa"
                                                        : "Kích hoạt"}
                                                </Typography>
                                            </MenuItem>

                                            <Divider sx={{ my: 1 }} />

                                            <MenuItem
                                                onClick={() =>
                                                    handleDeleteAccount(account)
                                                }
                                                sx={{
                                                    py: 1.5,
                                                    px: 2,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1.5,
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "error.lighter",
                                                    },
                                                }}
                                            >
                                                <DeleteOutlineIcon
                                                    sx={{ color: "error.main" }}
                                                />
                                                <Typography
                                                    sx={{
                                                        color: "error.main",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    Xóa tài khoản
                                                </Typography>
                                            </MenuItem>
                                        </Menu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <Dialog
                open={lockDialogOpen}
                onClose={() => setLockDialogOpen(false)}
                aria-labelledby="lock-dialog-title"
                aria-describedby="lock-dialog-description"
            >
                <DialogTitle id="lock-dialog-title">
                    {selectedAccount?.status === "Đang hoạt động"
                        ? "Vô hiệu hóa tài khoản"
                        : "Kích hoạt tài khoản"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="lock-dialog-description">
                        {selectedAccount?.status === "Đang hoạt động"
                            ? "Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?"
                            : "Bạn có chắc chắn muốn kích hoạt lại tài khoản này?"}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setLockDialogOpen(false)}
                        color="primary"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={executeLockAccount}
                        color="primary"
                        variant="contained"
                        autoFocus
                    >
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UserAccountManagement;
