import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: 'white',
        padding: '20px 0',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" sx={{ color: 'black', marginBottom: '10px', fontWeight: "700", fontSize: "16px" }}>
        Công ty TNHH Thương Mại Dịch Vụ TicketGo
      </Typography>
      <Typography variant="body2" sx={{ color: 'gray', marginBottom: '10px' }}>
        Địa chỉ đăng ký kinh doanh: 8C Chữ Đồng Tử, Phường 7, Quận Tân Bình, Thành Phố Hồ Chí Minh, Việt Nam
      </Typography>
      <Typography variant="body2" sx={{ color: 'gray', marginBottom: '10px' }}>
        Địa chỉ: Số 1, Võ Văn Ngân, Quận Thủ Đức, Tp. Hồ Chí Minh
      </Typography>
      <Typography variant="body2" sx={{ color: 'gray', marginBottom: '10px' }}>
        Giấy chứng nhận ĐKKD số 0315133726 do Sở KH và ĐT TP. Hồ Chí Minh cấp lần đầu ngày 27/6/2018
      </Typography>

      <Typography variant="body2" sx={{ color: 'gray' }}>
        Bản quyền © 2024 thuộc về <Link href="https://ticketgo.com" color="inherit" target="_blank" rel="noopener noreferrer">ticketgo.com</Link>
      </Typography>
    </Box>
  );
};

export default Footer;
