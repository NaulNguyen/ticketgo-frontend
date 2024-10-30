import React from "react";
import { Header, Search } from "../components";
import {
    Box,
    Container,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
} from "@mui/material";

const SearchingPage = () => {
    return (
        <div style={{ backgroundColor: "rgb(243,243,243)", height: "100vh" }}>
            <Header />
            <Container>
                <Search />
                <div className="pt-6 flex justify-center inset-0">
                    <Box
                        sx={{
                            backgroundColor: "white",
                            width: "25%",
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            borderRadius: "8px",
                            borderWidth: "1px",
                            borderColor: "rgb(209 213 219)",
                        }}>
                        <FormControl>
                            <FormLabel
                                id="sort-options-label"
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    color: "black",
                                    "&.Mui-focused": { color: "black" },
                                }}>
                                Sắp xếp
                            </FormLabel>
                            <RadioGroup
                                aria-labelledby="sort-options-label"
                                defaultValue="default"
                                name="radio-buttons-group">
                                <FormControlLabel
                                    value="default"
                                    control={<Radio />}
                                    label="Mặc định"
                                />
                                <FormControlLabel
                                    value="earliest"
                                    control={<Radio />}
                                    label="Giờ đi sớm nhất"
                                />
                                <FormControlLabel
                                    value="latest"
                                    control={<Radio />}
                                    label="Giờ đi muộn nhất"
                                />
                                <FormControlLabel
                                    value="priceAsc"
                                    control={<Radio />}
                                    label="Giá tăng dần"
                                />
                                <FormControlLabel
                                    value="priceDesc"
                                    control={<Radio />}
                                    label="Giá giảm dần"
                                />
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    <Box
                        sx={{
                            backgroundColor: "white",
                            padding: "16px",
                            borderRadius: "8px",
                            borderWidth: "1px",
                            borderColor: "rgb(209 213 219)",
                            marginLeft: "16px", // Khoảng cách giữa các box
                        }}></Box>
                </div>
            </Container>
        </div>
    );
};

export default SearchingPage;
