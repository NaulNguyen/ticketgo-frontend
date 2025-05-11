import React, { memo } from "react";
import {
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Box,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { formatLastMessageTime } from "../../utils/formatLastMessageTime";

interface ChatUser {
    userId: number;
    name: string;
    avatar?: string;
    lastMessage?: string;
    lastMessageTime?: string;
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
                transition: "all 0.2s",
                "&:hover": {
                    bgcolor: alpha("#000", 0.04),
                },
                bgcolor: isSelected ? alpha("#1976d2", 0.08) : "transparent",
                py: 1.5,
                borderRadius: 2,
                mb: 0.5,
            }}
            onClick={() => onSelect(user)}
        >
            <ListItemAvatar>
                <Avatar
                    src={user.avatar}
                    sx={{
                        width: 50,
                        height: 50,
                        bgcolor: isSelected ? "primary.main" : "grey.400",
                        fontSize: "1.2rem",
                        fontWeight: 500,
                    }}
                >
                    {user.name[0]}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={
                    <Typography sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
                        {user.name}
                    </Typography>
                }
                secondary={
                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary",
                            fontSize: "0.85rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "180px",
                        }}
                    >
                        {user.lastMessage}
                    </Typography>
                }
            />
            <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: "0.75rem" }}
            >
                {formatLastMessageTime(user.lastMessageTime || "")}
            </Typography>
        </ListItem>
    )
);

UserListItem.displayName = "UserListItem";
