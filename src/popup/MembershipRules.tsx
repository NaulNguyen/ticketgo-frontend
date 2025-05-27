import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Typography } from "@mui/material";

const MembershipRules = ({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
                🏆 Quy tắc xếp hạng thành viên
            </DialogTitle>
            <DialogContent>
                <Typography sx={{ mb: 2 }}>
                    Khách hàng sẽ được xếp hạng dựa trên số điểm tích lũy từ các
                    lần đặt vé. Với mỗi <strong>10.000 VND thanh toán</strong>,
                    bạn nhận được <strong>1 điểm</strong>.
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>
                                Cấp độ
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                Điều kiện điểm
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                                Ưu đãi giảm giá
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Hành Khách Mới</TableCell>
                            <TableCell>Dưới 50 điểm</TableCell>
                            <TableCell>Không có</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Lữ Khách Thân Thiết</TableCell>
                            <TableCell>50 – 199 điểm</TableCell>
                            <TableCell>Giảm 5%</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Đồng Hành Vàng</TableCell>
                            <TableCell>200 – 499 điểm</TableCell>
                            <TableCell>Giảm 10%</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Nhà Du Hành Ưu Tú</TableCell>
                            <TableCell>Từ 500 điểm trở lên</TableCell>
                            <TableCell>Giảm 15%</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Typography
                    sx={{ mt: 2, fontStyle: "italic", color: "text.secondary" }}
                >
                    💡 Hệ thống sẽ tự động cập nhật cấp độ và ưu đãi của bạn sau
                    mỗi lần đặt vé thành công.
                </Typography>
            </DialogContent>
        </Dialog>
    );
};

export default MembershipRules;
