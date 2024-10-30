import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

export default function MultiActionAreaCard() {
    return (
        <Card sx={{ maxWidth: 343, my: 2 }}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    height="140"
                    image="	https://f1e425bd6cd9ac6.cmccloud.com.vn/cms-tool/destination/images/5/img_hero.png?v1"
                    alt="Destination image"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Sài Gòn - Nha Trang
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Từ 140.000
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
