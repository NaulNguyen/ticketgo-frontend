import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    IconButton,
    Paper,
    Typography,
    TextField,
    CircularProgress,
    Fade,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { alpha } from "@mui/material/styles";
import axios from "axios";
import DOMPurify from "dompurify";
import { useNavigate, useLocation } from "react-router-dom";
import { keyframes } from "@mui/material/styles";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

interface Message {
    type: "user" | "bot";
    content: string;
}

const BotChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [initializing, setInitializing] = useState(false);

    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

    const dotAnimation = keyframes`
  0%, 20% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  80%, 100% { transform: translateY(0); }
`;

    const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

    const LoadingIndicator = () => (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                p: 1.5,
                bgcolor: "grey.100",
                borderRadius: 2,
                width: "fit-content",
            }}>
            {[0, 1, 2].map((dot) => (
                <Box
                    key={dot}
                    sx={{
                        width: 8,
                        height: 8,
                        bgcolor: "primary.main",
                        borderRadius: "50%",
                        animation: `${dotAnimation} 1s ease-in-out infinite`,
                        animationDelay: `${dot * 0.2}s`,
                    }}
                />
            ))}
        </Box>
    );

    const initializeConversation = async () => {
        setInitializing(true);
        try {
            const response = await axios.post("https://ticketgo.site/api/v1/chatbot/conversations");
            setConversationId(response.data);
            // Add welcome message
            const welcomeResponse = await axios.post("https://ticketgo.site/api/v1/chatbot/chat", {
                conversationId: response.data,
                content: "Xin chào",
            });
            setMessages([{ type: "bot", content: welcomeResponse.data }]);
        } catch (error) {
            console.error("Error initializing conversation:", error);
            setMessages([
                {
                    type: "bot",
                    content:
                        '<p style="color: #f44336;">Không thể kết nối đến chatbot. Vui lòng thử lại sau.</p>',
                },
            ]);
        } finally {
            setInitializing(false);
        }
    };

    const handleToggle = () => {
        if (!isOpen && !conversationId) {
            initializeConversation();
        }
        setIsOpen(!isOpen);
    };

    const handleSend = async () => {
        if (!input.trim() || !conversationId) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
        setLoading(true);

        try {
            const response = await axios.post("https://ticketgo.site/api/v1/chatbot/chat", {
                conversationId,
                content: userMessage,
            });

            setMessages((prev) => [...prev, { type: "bot", content: response.data }]);

            // Check if response contains a selectedScheduleId
            const htmlContent = response.data;
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, "text/html");
            const links = doc.getElementsByTagName("a");

            for (const link of links) {
                const url = new URL(link.href);
                const selectedScheduleId = url.searchParams.get("selectedScheduleId");
                if (selectedScheduleId) {
                    // Update current URL with selectedScheduleId
                    const currentUrl = new URL(window.location.href);
                    currentUrl.searchParams.set("selectedScheduleId", selectedScheduleId);
                    navigate(currentUrl.pathname + currentUrl.search);
                    break;
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                {
                    type: "bot",
                    content:
                        '<p style="color: #f44336;">Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.</p>',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const InitializingIndicator = () => (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                p: 3,
            }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    animation: `${fadeInUp} 0.5s ease-out`,
                }}>
                {[0, 1, 2, 3].map((dot) => (
                    <Box
                        key={dot}
                        sx={{
                            width: 12,
                            height: 12,
                            bgcolor: "primary.main",
                            borderRadius: "50%",
                            animation: `${dotAnimation} 1.5s ease-in-out infinite`,
                            animationDelay: `${dot * 0.2}s`,
                            opacity: 0.7,
                        }}
                    />
                ))}
            </Box>
            <Typography
                color="text.secondary"
                sx={{
                    animation: `${fadeInUp} 0.5s ease-out`,
                    animationDelay: "0.2s",
                    animationFillMode: "backwards",
                }}>
                Đang kết nối...
            </Typography>
        </Box>
    );

    return (
        <>
            <IconButton
                onClick={handleToggle}
                title="AI Assistant"
                sx={{
                    position: "fixed",
                    bottom: 20,
                    right: 100,
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                        backgroundColor: "primary.dark",
                        transform: "translateY(-4px)",
                    },
                    width: 60,
                    height: 60,
                    boxShadow: 3,
                    transition: "all 0.3s ease",
                    animation: !isOpen ? `${pulseAnimation} 2s infinite` : "none",
                }}>
                <SmartToyIcon />
            </IconButton>

            <Fade in={isOpen}>
                <Paper
                    sx={{
                        position: "fixed",
                        bottom: 90,
                        right: 20,
                        width: 400,
                        maxHeight: 600,
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                        borderRadius: 3,
                        overflow: "hidden",
                        zIndex: 1100,
                        animation: `${fadeInUp} 0.3s ease-out`,
                        bgcolor: "#fcfcfc",
                    }}>
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2,
                            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                            color: "white",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}>
                        <Typography
                            variant="h6"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                fontWeight: 500,
                                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}>
                            <RocketLaunchIcon
                                sx={{
                                    animation: `${pulseAnimation} 2s infinite`,
                                }}
                            />
                            TicketGo Assistant
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={handleToggle}
                            sx={{
                                color: "white",
                                "&:hover": {
                                    transform: "rotate(90deg)",
                                    transition: "transform 0.3s ease",
                                },
                            }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Messages */}
                    <Box
                        sx={{
                            p: 2,
                            flexGrow: 1,
                            overflow: "auto",
                            maxHeight: 400,
                            bgcolor: alpha("#fff", 0.98),
                            "&::-webkit-scrollbar": {
                                width: "8px",
                            },
                            "&::-webkit-scrollbar-track": {
                                bgcolor: "transparent",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                bgcolor: alpha("#1976d2", 0.2),
                                borderRadius: "4px",
                                "&:hover": {
                                    bgcolor: alpha("#1976d2", 0.3),
                                },
                            },
                        }}>
                        {initializing ? (
                            <InitializingIndicator />
                        ) : (
                            <>
                                {messages.map((message, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            mb: 2,
                                            display: "flex",
                                            justifyContent:
                                                message.type === "user" ? "flex-end" : "flex-start",
                                            animation: `${fadeInUp} 0.3s ease-out`,
                                        }}>
                                        <Box
                                            sx={{
                                                maxWidth: "80%",
                                                p: 2,
                                                borderRadius:
                                                    message.type === "user"
                                                        ? "20px 20px 4px 20px"
                                                        : "20px 20px 20px 4px",
                                                bgcolor:
                                                    message.type === "user"
                                                        ? "primary.main"
                                                        : alpha("#f5f5f5", 0.9),
                                                color:
                                                    message.type === "user"
                                                        ? "white"
                                                        : "text.primary",
                                                boxShadow: 1,
                                                transition: "all 0.2s ease",
                                                "&:hover": {
                                                    boxShadow: 2,
                                                    transform: "translateY(-1px)",
                                                },
                                            }}>
                                            {message.type === "bot" ? (
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: DOMPurify.sanitize(message.content),
                                                    }}
                                                />
                                            ) : (
                                                <Typography>{message.content}</Typography>
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                                <div ref={messagesEndRef} />
                                {loading && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "flex-start",
                                            my: 2,
                                        }}>
                                        <LoadingIndicator />
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>

                    {/* Input */}
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: "background.paper",
                            borderTop: "1px solid",
                            borderColor: "divider",
                        }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder={initializing ? "Đang kết nối..." : "Nhập tin nhắn..."}
                            value={input}
                            disabled={initializing}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend()}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 3,
                                    "&:hover": {
                                        "& > fieldset": {
                                            borderColor: "primary.main",
                                        },
                                    },
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={handleSend}
                                        disabled={!input.trim() || loading}
                                        color="primary"
                                        sx={{
                                            transition: "transform 0.2s ease",
                                            "&:hover": {
                                                transform: "scale(1.1)",
                                            },
                                            "&:active": {
                                                transform: "scale(0.95)",
                                            },
                                        }}>
                                        <SendIcon />
                                    </IconButton>
                                ),
                            }}
                        />
                    </Box>
                </Paper>
            </Fade>
        </>
    );
};

export default BotChat;
