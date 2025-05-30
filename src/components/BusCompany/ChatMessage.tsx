import React, { memo } from "react";
import { Box, Typography } from "@mui/material";
import { format } from "date-fns";

interface ChatMessageProps {
    content: string;
    sentAt: string;
    isSentByCurrentUser: boolean;
}

export const ChatMessage = memo(
    ({ content, sentAt, isSentByCurrentUser }: ChatMessageProps) => {
        const formattedTime = (() => {
            const date = new Date(sentAt);
            if (isNaN(date.getTime())) {
                return "Invalid time";
            }
            return format(date, "HH:mm");
        })();

        return (
            <Box
                sx={{
                    alignSelf: isSentByCurrentUser ? "flex-end" : "flex-start",
                    maxWidth: "70%",
                    p: 1.5,
                    bgcolor: isSentByCurrentUser ? "primary.main" : "grey.200",
                    color: isSentByCurrentUser ? "white" : "black",
                    borderRadius: 2,
                    ...(isSentByCurrentUser
                        ? { borderTopRightRadius: 0 }
                        : { borderTopLeftRadius: 0 }),
                }}
            >
                <Typography variant="body2">{content}</Typography>
                <Typography
                    variant="caption"
                    sx={{
                        display: "block",
                        mt: 0.5,
                        textAlign: isSentByCurrentUser ? "right" : "left",
                        opacity: 0.8,
                    }}
                >
                    {formattedTime}
                </Typography>
            </Box>
        );
    }
);

ChatMessage.displayName = "ChatMessage";
