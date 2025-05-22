import React, { memo } from "react";
import {
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Box,
    Typography,
    Badge,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { formatRelativeTime } from "../../utils/formatRelativeTime";

// Kích hoạt plugin relativeTime cho dayjs
dayjs.extend(relativeTime);
dayjs.locale("vi");

interface ChatUser {
    userId: number;
    name: string;
    avatar?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    isRead: boolean;
    readAt: string | null;
}

interface UserListItemProps {
    user: ChatUser;
    isSelected: boolean;
    onSelect: (user: ChatUser) => void;
}

export const UserListItem = memo(
    ({ user, isSelected, onSelect }: UserListItemProps) => (
        <ListItem
            sx={{
                cursor: "pointer",
                transition: "background-color 0.3s, box-shadow 0.3s",
                "&:hover": {
                    bgcolor: alpha("#1976d2", 0.06),
                },
                bgcolor: isSelected ? alpha("#1976d2", 0.1) : "transparent",
                py: 2,
                mb: 1,
                borderRadius: 2,
                boxShadow: isSelected
                    ? "0 0 0 2px rgba(25, 118, 210, 0.15)"
                    : "none",
            }}
            onClick={() => onSelect(user)}
        >
            <ListItemAvatar>
                <Avatar
                    src={user.avatar}
                    sx={{
                        width: 50,
                        height: 50,
                        border: user.isRead ? "none" : "2px solid #1976d2",
                        bgcolor: isSelected ? "primary.main" : "grey.200",
                        color: "text.primary",
                        fontSize: "1.2rem",
                        fontWeight: 500,
                    }}
                >
                    {user.name[0]}
                </Avatar>
            </ListItemAvatar>

            <ListItemText
                primary={
                    <Typography
                        sx={{
                            fontWeight: user.isRead ? 500 : 700,
                            fontSize: "1rem",
                            color: user.isRead
                                ? "text.primary"
                                : "primary.main",
                        }}
                    >
                        {user.name}
                    </Typography>
                }
                secondary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: user.isRead
                                    ? "text.secondary"
                                    : "text.primary",
                                fontSize: "0.875rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "180px",
                                fontWeight: user.isRead ? 400 : 600,
                            }}
                        >
                            {user.lastMessage}
                        </Typography>
                    </Box>
                }
            />

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 0.5,
                    minWidth: "65px",
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: user.isRead ? "text.secondary" : "primary.main",
                        fontSize: "0.75rem",
                        fontWeight: user.isRead ? 400 : 600,
                    }}
                >
                    {user.lastMessageTime
                        ? formatRelativeTime(user.lastMessageTime)
                        : ""}
                </Typography>

                {!user.isRead && (
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                        }}
                    />
                )}
            </Box>
        </ListItem>
    )
);

UserListItem.displayName = "UserListItem";
