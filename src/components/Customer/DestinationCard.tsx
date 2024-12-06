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
        <Card sx={{ width: 320, height: "fit-content" }}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    image={routeImage}
                    alt="Destination image"
                    sx={{ height: 180, objectFit: "cover" }}
                />
                <CardContent>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                        }}>
                        {routeName}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontWeight: 500,
                        }}>
                        Từ {formattedPrice} VND
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default DestinationCard;
