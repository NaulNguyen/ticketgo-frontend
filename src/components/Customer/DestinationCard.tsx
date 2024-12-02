import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

type DestinationCardProps = {
    routeImage: string;
    routeName: string;
    price: number;
};

const DestinationCard: React.FC<DestinationCardProps> = ({ routeImage, routeName, price }) => {
    const formattedPrice = new Intl.NumberFormat("en-US").format(price);
    return (
        <Card
            sx={{
                width: 320,
                height: 300,
                my: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}>
            <CardActionArea sx={{ height: "100%" }}>
                <CardMedia
                    component="img"
                    image={routeImage}
                    alt="Destination image"
                    sx={{ objectFit: "cover", height: "210px", width: "320px" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                        {routeName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        Từ {formattedPrice} VND
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default DestinationCard;
