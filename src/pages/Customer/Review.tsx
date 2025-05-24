import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Typography,
    Rating,
    Paper,
    Avatar,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    Skeleton,
} from "@mui/material";
import axios from "axios";
import { Footer, Header } from "../../components";
import StarIcon from "@mui/icons-material/Star";
import { useTheme } from "@mui/material/styles";
import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";
import useAppAccessor from "../../hook/useAppAccessor";
import { axiosWithJWT } from "../../config/axiosConfig";

interface ReviewData {
    reviewId: number;
    rating: number;
    comment: string;
    travelDate: string;
    route: string;
    reviewDate: string;
    userName: string;
    userImg: string;
    userId: number;
}

interface PaginationInfo {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

const Review = () => {
    const theme = useTheme();
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const ratings = [5, 4, 3, 2, 1];
    const totalReviews = reviews.length;
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationInfo>({
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 0,
    });
    const [sortBy, setSortBy] = useState<"createdAt" | "rating">("createdAt");
    const [direction, setDirection] = useState<"asc" | "desc">("desc");

    const { getUserInfor } = useAppAccessor();
    const userInfor = getUserInfor();
    const { enqueueSnackbar } = useSnackbar();
    const [deleting, setDeleting] = useState<number | null>(null);

    const fetchReviews = async (page: number) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                pageNumber: page.toString(),
                pageSize: "10",
                sortBy,
                direction,
            });

            const response = await axios.get(
                `https://ticketgo.site/api/v1/reviews?${params}`
            );
            console.log(response.data);

            if (response.data.status === 200) {
                setReviews(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        if (!userInfor) {
            enqueueSnackbar("Vui lòng đăng nhập để xóa đánh giá", {
                variant: "error",
            });
            return;
        }

        try {
            console.log("Deleting review with ID:", reviewId);
            setDeleting(reviewId);
            const response = await axiosWithJWT.delete(
                `/api/v1/reviews/${reviewId}`
            );
            console.log(response.data);

            if (response.data.status === 200) {
                enqueueSnackbar("Đã xóa đánh giá thành công", {
                    variant: "success",
                });
                fetchReviews(pagination.pageNumber);
            }
        } catch (error: any) {
            const errorMessage =
                error.response?.status === 403
                    ? "Bạn không có quyền xóa đánh giá này"
                    : "Có lỗi xảy ra khi xóa đánh giá";
            enqueueSnackbar(errorMessage, {
                variant: "error",
                autoHideDuration: 3000,
            });
        } finally {
            setDeleting(null);
        }
    };

    useEffect(() => {
        fetchReviews(1);
    }, [sortBy, direction]);

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        fetchReviews(value);
    };

    return (
        <Box bgcolor="#F5F5F5">
            <Header />
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Box
                    sx={{
                        mb: 4,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "primary.main",
                        }}
                    >
                        Đánh giá từ khách hàng
                    </Typography>

                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Sắp xếp theo</InputLabel>
                        <Select
                            value={`${sortBy}-${direction}`}
                            label="Sắp xếp theo"
                            onChange={(e) => {
                                const [newSortBy, newDirection] =
                                    e.target.value.split("-");
                                setSortBy(newSortBy as "createdAt" | "rating");
                                setDirection(newDirection as "asc" | "desc");
                            }}
                        >
                            <MenuItem value="createdAt-desc">Mới nhất</MenuItem>
                            <MenuItem value="createdAt-asc">Cũ nhất</MenuItem>
                            <MenuItem value="rating-desc">
                                Đánh giá cao nhất
                            </MenuItem>
                            <MenuItem value="rating-asc">
                                Đánh giá thấp nhất
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 4,
                        mb: 6,
                        flexWrap: "wrap",
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            textAlign: "center",
                            bgcolor: theme.palette.primary.main,
                            color: "white",
                            borderRadius: 2,
                            minWidth: 200,
                        }}
                    >
                        <Typography variant="h3" fontWeight="bold" mb={1}>
                            {pagination.totalItems}
                        </Typography>
                        <Typography>Tổng đánh giá</Typography>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            textAlign: "center",
                            bgcolor: "#00C853",
                            color: "white",
                            borderRadius: 2,
                            minWidth: 200,
                        }}
                    >
                        <Typography variant="h3" fontWeight="bold" mb={1}>
                            {reviews.filter((r) => r.rating >= 4).length}
                        </Typography>
                        <Typography>Đánh giá tích cực</Typography>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            textAlign: "center",
                            bgcolor: "#ED6C02",
                            color: "white",
                            borderRadius: 2,
                            minWidth: 200,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 1,
                            }}
                        >
                            <Typography variant="h3" fontWeight="bold">
                                {(
                                    reviews.reduce(
                                        (acc, r) => acc + r.rating,
                                        0
                                    ) / Math.max(reviews.length, 1)
                                ).toFixed(1)}
                            </Typography>
                            <StarIcon sx={{ ml: 1, fontSize: "2rem" }} />
                        </Box>

                        <Typography>Điểm trung bình</Typography>
                    </Paper>
                </Box>

                <Box
                    sx={{
                        mb: 4,
                        p: 3,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Phân bố đánh giá
                    </Typography>
                    {ratings.map((rating) => {
                        const count = reviews.filter(
                            (r) => r.rating === rating
                        ).length;
                        const percentage = totalReviews
                            ? (count / totalReviews) * 100
                            : 0;

                        return (
                            <Box
                                key={rating}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: 50,
                                    }}
                                >
                                    {rating}{" "}
                                    <StarIcon
                                        sx={{
                                            fontSize: "1rem",
                                            ml: 0.5,
                                            color: "#FFB400",
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: 1, mx: 2 }}>
                                    <Box
                                        sx={{
                                            height: 8,
                                            bgcolor: "grey.200",
                                            borderRadius: 1,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${percentage}%`,
                                                height: "100%",
                                                bgcolor: "#FFB400",
                                                transition:
                                                    "width 1s ease-in-out",
                                            }}
                                        />
                                    </Box>
                                </Box>
                                <Typography
                                    variant="body2"
                                    sx={{ minWidth: 50 }}
                                >
                                    {count} đánh giá
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                <Stack spacing={3}>
                    {loading
                        ? Array.from({ length: 5 }).map((_, index) => (
                              <Skeleton
                                  key={index}
                                  variant="rectangular"
                                  height={200}
                                  sx={{ borderRadius: 2 }}
                              />
                          ))
                        : reviews.map((review) => (
                              <Paper
                                  key={review.reviewId}
                                  elevation={2}
                                  sx={{
                                      p: 3,
                                      borderRadius: 2,
                                      transition:
                                          "transform 0.2s, box-shadow 0.2s",
                                      "&:hover": {
                                          transform: "translateY(-4px)",
                                          boxShadow: 4,
                                      },
                                  }}
                              >
                                  <Box
                                      sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          mb: 2,
                                      }}
                                  >
                                      <Box
                                          sx={{
                                              display: "flex",
                                              alignItems: "center",
                                          }}
                                      >
                                          <Avatar
                                              src={review.userImg}
                                              sx={{
                                                  width: 48,
                                                  height: 48,
                                                  mr: 2,
                                              }}
                                          />
                                          <Box>
                                              <Typography
                                                  variant="subtitle1"
                                                  sx={{ fontWeight: 600 }}
                                              >
                                                  {review.userName}
                                              </Typography>
                                              <Typography
                                                  variant="caption"
                                                  color="text.secondary"
                                              >
                                                  Đánh giá lúc:{" "}
                                                  {review.reviewDate}
                                              </Typography>
                                          </Box>
                                      </Box>
                                      {userInfor &&
                                          userInfor.user.userId ===
                                              review.userId && (
                                              <Tooltip title="Xóa đánh giá">
                                                  <IconButton
                                                      onClick={() =>
                                                          handleDeleteReview(
                                                              review.reviewId
                                                          )
                                                      }
                                                      disabled={
                                                          deleting ===
                                                          review.reviewId
                                                      }
                                                      sx={{
                                                          color: "error.main",
                                                          "&:hover": {
                                                              backgroundColor:
                                                                  "error.lighter",
                                                          },
                                                      }}
                                                  >
                                                      <DeleteIcon />
                                                  </IconButton>
                                              </Tooltip>
                                          )}
                                  </Box>

                                  <Rating
                                      value={review.rating}
                                      readOnly
                                      sx={{ mb: 1 }}
                                  />

                                  <Typography
                                      variant="body1"
                                      sx={{ mb: 2, fontStyle: "italic" }}
                                  >
                                      "{review.comment}"
                                  </Typography>

                                  <Box
                                      sx={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          color: "text.secondary",
                                          fontSize: "0.875rem",
                                      }}
                                  >
                                      <Typography variant="body2">
                                          Tuyến đường: {review.route}
                                      </Typography>
                                      <Typography variant="body2">
                                          Ngày đi: {review.travelDate}
                                      </Typography>
                                  </Box>
                              </Paper>
                          ))}
                </Stack>

                {!loading && pagination.totalPages > 1 && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 4,
                        }}
                    >
                        <Pagination
                            count={pagination.totalPages}
                            page={pagination.pageNumber}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                        />
                    </Box>
                )}
            </Container>
            <Footer />
        </Box>
    );
};

export default Review;
