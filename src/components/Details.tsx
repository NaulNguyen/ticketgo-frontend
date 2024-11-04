import {
    Box,
    Container,
    Divider,
    Grid,
    List,
    ListItem,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import TranslateIcon from "@mui/icons-material/Translate";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import HardwareIcon from "@mui/icons-material/Hardware";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import CurtainsIcon from "@mui/icons-material/Curtains"; // Use a suitable icon
import SpeakerIcon from "@mui/icons-material/Speaker";
import WifiIcon from "@mui/icons-material/Wifi";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";

const Details = () => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <Box>
            {/* Tabs */}
            <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Details tabs" centered>
                <Tab
                    label="Đón/trả"
                    sx={{
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: "500",
                        color: tabIndex === 0 ? "rgb(24, 144, 255)" : "inherit",
                    }}
                />
                <Tab
                    label="Chính sách"
                    sx={{
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: "500",
                        color: tabIndex === 1 ? "rgb(24, 144, 255)" : "inherit",
                    }}
                />
                <Tab
                    label="Tiện ích"
                    sx={{
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: "500",
                        color: tabIndex === 2 ? "rgb(24, 144, 255)" : "inherit",
                    }}
                />
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ p: 3, minHeight: "500px" }}>
                {tabIndex === 0 && (
                    <Box>
                        <Typography variant="h6" color="primary" fontSize={16} fontWeight={600}>
                            Lưu ý
                        </Typography>
                        <Typography>
                            Các mốc thời gian đón, trả bên dưới là thời gian dự kiến.
                        </Typography>
                        <Typography>Lịch này có thể thay đổi tùy tình hình thực tế.</Typography>
                        <Box display="flex" justifyContent="space-around" alignContent="center">
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ mt: 2 }}
                                    fontSize={18}
                                    fontWeight={700}>
                                    Điểm đón
                                </Typography>
                                <Typography>17:30 • Trạm Đà Lạt</Typography>
                                <Typography>17:45 • Ga Đà Lạt</Typography>
                                <Typography>18:15 • Vòng xoay Thái Phiên</Typography>
                            </Box>
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ mt: 2 }}
                                    fontSize={18}
                                    fontWeight={700}>
                                    Điểm trả
                                </Typography>
                                <Typography>19:45 • Suối Đá Hòn Giao</Typography>
                                <Typography>20:35 • Đèn giao thông Cầu Lùng</Typography>
                                <Typography>20:40 • Trạm Nha Trang</Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                {tabIndex === 1 && (
                    <Box>
                        <Typography variant="h6" fontSize={18} fontWeight={700}>
                            Chính sách nhà xe
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{ mt: 2, color: "rgba(0, 0, 0, 0.65)" }}
                            fontSize={16}
                            fontWeight={700}>
                            Yêu cầu khi lên xe
                        </Typography>
                        <List style={{ paddingLeft: "1.5rem", lineHeight: "1.6" }}>
                            <ListItem>
                                Có mặt tại văn phòng/quầy vé/bến xe trước 30 phút để làm thủ tục lên
                                xe.
                            </ListItem>
                            <ListItem>Xuất trình SMS/Email đặt vé trước khi lên xe.</ListItem>
                            <ListItem>Không mang đồ ăn, thức ăn có mùi lên xe.</ListItem>
                            <ListItem>
                                Không hút thuốc, uống rượu, sử dụng chất kích thích trên xe.
                            </ListItem>
                            <ListItem>Không mang các vật dễ cháy nổ lên xe.</ListItem>
                            <ListItem>Không vứt rác trên xe.</ListItem>
                            <ListItem>Không làm ồn, gây mất trật tự trên xe.</ListItem>
                        </List>
                        <Divider />
                        <Typography
                            variant="subtitle1"
                            sx={{ mt: 2, color: "rgba(0, 0, 0, 0.65)" }}
                            fontSize={16}
                            fontWeight={700}>
                            Hành lý xách tay
                        </Typography>
                        <List style={{ paddingLeft: "1.5rem", lineHeight: "1.6" }}>
                            <ListItem>Tổng trọng lượng hành lý không vượt quá 15 kg</ListItem>
                            <ListItem>Không vận chuyển hàng hóa cồng kềnh</ListItem>
                            <ListItem>
                                Không hoàn tiền trong trường hợp huỷ đơn hàng do vi phạm các quy
                                định về hành lý
                            </ListItem>
                        </List>
                        <Divider />
                        <Typography
                            variant="subtitle1"
                            sx={{ mt: 2, color: "rgba(0, 0, 0, 0.65)" }}
                            fontSize={16}
                            fontWeight={700}>
                            Trẻ em và phụ nữ có thai
                        </Typography>
                        <List style={{ paddingLeft: "1.5rem", lineHeight: "1.6" }}>
                            <ListItem>
                                Trẻ em dưới 4 tuổi hoặc dưới 100 cm được miễn phí vé nếu ngồi cùng
                                ghế/giường với bố mẹ
                            </ListItem>
                            <ListItem>
                                Trẻ em từ 4 tuổi hoặc cao từ 100 cm trở lên mua vé như người lớn
                            </ListItem>
                            <ListItem>
                                Phụ nữ có thai cần đảm bảo sức khỏe trong suốt quá trình di chuyển
                            </ListItem>
                            <ListItem>
                                Nhà xe có quyền từ chối phục vụ nếu hành khách không tuân thủ quy
                                định về trẻ em và phụ nữ có thai
                            </ListItem>
                        </List>
                        <Divider />
                        <Typography
                            variant="subtitle1"
                            sx={{ mt: 2, color: "rgba(0, 0, 0, 0.65)" }}
                            fontSize={16}
                            fontWeight={700}>
                            Động vật cảnh/Thú cưng
                        </Typography>
                        <List style={{ paddingLeft: "1.5rem", lineHeight: "1.6" }}>
                            <ListItem>Nhà xe không nhận chở động vật cảnh/thú cưng</ListItem>
                        </List>
                        <Divider />
                        <Typography
                            variant="subtitle1"
                            sx={{ mt: 2, color: "rgba(0, 0, 0, 0.65)" }}
                            fontSize={16}
                            fontWeight={700}>
                            Xuất hóa đơn GTGT
                        </Typography>
                        <List style={{ paddingLeft: "1.5rem", lineHeight: "1.6" }}>
                            <ListItem>Nhà xe không cung cấp hoá đơn GTGT</ListItem>
                        </List>
                        <Divider />
                        <Typography
                            variant="subtitle1"
                            sx={{ mt: 2, color: "rgba(0, 0, 0, 0.65)" }}
                            fontSize={16}
                            fontWeight={700}>
                            Gửi xe đạp/xe máy
                        </Typography>
                        <List style={{ paddingLeft: "1.5rem", lineHeight: "1.6" }}>
                            <ListItem>Nhà xe không nhận gửi kèm xe đạp/xe máy.</ListItem>
                        </List>
                    </Box>
                )}

                {tabIndex === 2 && (
                    <Box>
                        <Box sx={{ backgroundColor: "rgb(245, 245, 245)", borderRadius: "20px" }}>
                            <Box fontSize={14} padding={2}>
                                <Box display="flex">
                                    <TranslateIcon sx={{ marginX: "8px", color: "blue" }} />
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Nhân viên sử dụng tiếng Anh
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary" paddingTop={1}>
                                    Nhân viên phòng vé, tài xế, phụ xe có thể giao tiếp bằng tiếng
                                    Anh với hành khách.
                                </Typography>
                            </Box>
                            <Divider />
                            <Box fontSize={14} padding={2}>
                                <Box display="flex">
                                    <HealthAndSafetyIcon sx={{ marginX: "8px", color: "blue" }} />
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Dây đai an toàn
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary" paddingTop={1}>
                                    Trên xe có trang bị dây đai an toàn cho hành khách khi ngồi trên
                                    xe
                                </Typography>
                            </Box>
                            <Divider />
                            <Box fontSize={14} padding={2}>
                                <Box display="flex">
                                    <WaterDropIcon sx={{ marginX: "8px", color: "blue" }} />
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Nước uống
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary" paddingTop={1}>
                                    Nhà xe có phục vụ nước cho hành khách
                                </Typography>
                            </Box>
                            <Divider />
                            <Box fontSize={14} padding={2}>
                                <Box display="flex">
                                    <HardwareIcon sx={{ marginX: "8px", color: "blue" }} />
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        Búa phá kính
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary" paddingTop={1}>
                                    Dùng để phá kính ô tô thoát hiểm trong trường hợp khẩn cấp.
                                </Typography>
                            </Box>
                        </Box>
                        <Box padding={2}>
                            <Grid container spacing={2} columns={3}>
                                <Grid
                                    item
                                    xs={1}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center">
                                    <BatteryChargingFullIcon fontSize="large" />
                                    <Typography>Sạc điện thoại</Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={1}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center">
                                    <CurtainsIcon fontSize="large" />
                                    <Typography>Rèm cửa</Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={1}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center">
                                    <SpeakerIcon fontSize="large" />
                                    <Typography>Dàn âm thanh (Loa)</Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={1}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center">
                                    <WifiIcon fontSize="large" />
                                    <Typography>Wifi</Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={1}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center">
                                    <AcUnitIcon fontSize="large" />
                                    <Typography>Điều hòa</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Details;
