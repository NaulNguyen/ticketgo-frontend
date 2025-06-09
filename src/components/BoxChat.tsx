import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Paper,
    IconButton,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Fade,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { axiosWithJWT } from "../config/axiosConfig";
import useAppAccessor from "../hook/useAppAccessor";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Message {
    messageId: number;
    senderId: number;
    receiverId: number;
    content: string;
    sentAt: string;
}

const BoxChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const { getUserInfor } = useAppAccessor();
    const stompClient = useRef<Client | null>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const [isInitialFetch, setIsInitialFetch] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // Check if user is logged in and not a BUS_COMPANY
    const userInfo = getUserInfor();
    const shouldShowChat = userInfo && userInfo.user.role !== "ROLE_BUS_COMPANY";

    useEffect(() => {
        if (!userInfo) {
            setMessages([]);
            setMessage("");
            if (stompClient.current?.connected) {
                stompClient.current.deactivate();
                stompClient.current = null;
            }
        }
    }, [userInfo]);

    // Connect to WebSocket when component mounts
    useEffect(() => {
        const info = getUserInfor();
        if (!shouldShowChat || !info) return;

        const client = new Client({
            webSocketFactory: () => new SockJS("https://ticketgo.site/ws"),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => console.log("STOMP DEBUG:", str),
        });

        client.onConnect = () => {
            console.log("✅ Connected to STOMP");
            setIsConnected(true);
            client.subscribe(`/topic/chat-${info.user.userId}`, async (message) => {
                try {
                    const newMessage = JSON.parse(message.body);
                    const updatedMessages = await fetchMessageHistory(info);
                    setMessages(updatedMessages);

                    if (chatBoxRef.current) {
                        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                    }
                } catch (err) {
                    console.error("Error handling message:", err);
                }
            });
        };

        client.onStompError = (frame) => {
            console.error("❌ STOMP error:", frame);
            setIsConnected(false);
        };

        client.activate();
        stompClient.current = client;

        return () => {
            setIsConnected(false);
            client.deactivate();
        };
    }, [shouldShowChat]);

    const fetchMessageHistory = async (userInfo: any) => {
        try {
            setIsLoading(true);
            const response = await axiosWithJWT.get(`/api/v1/messages`, {
                params: {
                    senderId: userInfo.user.userId,
                    receiverId: 1,
                },
            });
            return response.data.data.messages;
        } catch (error) {
            console.error("Error fetching messages:", error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const userInfo = getUserInfor();
        if (!userInfo || !isOpen) return;

        // Initial fetch
        const fetchAndUpdateMessages = async () => {
            try {
                const messages = await fetchMessageHistory(userInfo);
                setMessages(messages);

                if (chatBoxRef.current) {
                    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchAndUpdateMessages();

        const intervalId = setInterval(fetchAndUpdateMessages, 3000);
        return () => {
            clearInterval(intervalId);
        };
    }, [isOpen, isConnected]);

    // Fetch message history when chat is opened
    useEffect(() => {
        if (isOpen) {
            const fetchInitialMessages = async () => {
                const userInfo = getUserInfor();
                if (!userInfo || !isOpen || !isInitialFetch) return;

                setIsLoading(true);
                try {
                    const messages = await fetchMessageHistory(userInfo);
                    setMessages(messages);

                    requestAnimationFrame(() => {
                        if (chatBoxRef.current) {
                            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                        }
                    });

                    setIsInitialFetch(false);
                } catch (error) {
                    console.error("Error fetching initial messages:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInitialMessages();
            const intervalId = setInterval(fetchInitialMessages, 2000);
            return () => clearInterval(intervalId);
        }
    }, [isOpen, isInitialFetch]);

    useEffect(() => {
        if (isOpen && chatBoxRef.current && messages.length > 0) {
            requestAnimationFrame(() => {
                chatBoxRef.current!.scrollTop = chatBoxRef.current!.scrollHeight;
            });
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        if (!isOpen) {
            setIsInitialFetch(true);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userInfo = getUserInfor();
        if (!userInfo) return;

        try {
            await axiosWithJWT.post("/api/v1/messages/send", {
                senderId: userInfo.user.userId,
                receiverId: 1, // Admin ID
                content: message.trim(),
            });
            const updatedMessages = await fetchMessageHistory(userInfo);
            setMessages(updatedMessages);

            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const formatMessageTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Thời gian không hợp lệ";
            return format(date, "HH:mm, dd/MM/yyyy", { locale: vi });
        } catch (error) {
            console.error("Error formatting date:", error);
            return "Thời gian không hợp lệ";
        }
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <IconButton
                onClick={handleToggle}
                title="AI Assistant"
                sx={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
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
                }}>
                <ChatIcon />
            </IconButton>
            <Fade in={isOpen}>
                <Paper
                    elevation={3}
                    sx={{
                        position: "fixed",
                        bottom: 90,
                        right: 20,
                        width: 350,
                        maxHeight: 400,
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                        borderRadius: 3,
                        overflow: "hidden",
                        zIndex: 1100,
                        bgcolor: "#fcfcfc",
                    }}>
                    <Box
                        sx={{
                            bgcolor: "primary.main",
                            p: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}>
                        <Typography variant="h6" sx={{ color: "white" }}>
                            Hỗ trợ khách hàng
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => setIsOpen(false)}
                            sx={{ color: "white" }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Box
                        ref={chatBoxRef}
                        sx={{
                            flex: 1,
                            p: 2,
                            overflowY: "auto",
                            bgcolor: "#f5f5f5",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            position: "relative",
                            scrollBehavior: "instant",
                        }}>
                        {isLoading && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                        {messages.map((msg) => (
                            <Box
                                key={msg.messageId}
                                sx={{
                                    alignSelf:
                                        msg.senderId === getUserInfor()?.user.userId
                                            ? "flex-end"
                                            : "flex-start",
                                    maxWidth: "80%",
                                }}>
                                <Paper
                                    sx={{
                                        p: 1,
                                        bgcolor:
                                            msg.senderId === getUserInfor()?.user.userId
                                                ? "primary.main"
                                                : "white",
                                        color:
                                            msg.senderId === getUserInfor()?.user.userId
                                                ? "white"
                                                : "text.primary",
                                    }}>
                                    <Typography variant="body2">{msg.content}</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                        {formatMessageTime(msg.sentAt)}
                                    </Typography>
                                </Paper>
                            </Box>
                        ))}
                    </Box>

                    <Box
                        sx={{
                            p: 2,
                            bgcolor: "white",
                            borderTop: "1px solid #e0e0e0",
                            display: "flex",
                            gap: 1,
                        }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Nhập tin nhắn..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSend}
                            sx={{ minWidth: "40px", px: 2 }}>
                            <SendIcon />
                        </Button>
                    </Box>
                </Paper>
            </Fade>
        </>
    );
};

export default BoxChat;
