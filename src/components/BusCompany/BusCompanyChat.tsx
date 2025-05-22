import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    List,
    Avatar,
} from "@mui/material";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { axiosWithJWT } from "../../config/axiosConfig";
import useAppAccessor from "../../hook/useAppAccessor";
import SendIcon from "@mui/icons-material/Send";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { ChatMessage } from "./ChatMessage";
import { UserListItem } from "./UserListItem";

interface Message {
    messageId: number;
    senderId: number | string;
    receiverId: number;
    content: string;
    sentAt: string;
    isRead: boolean;
}

interface MessageResponse {
    status: number;
    message: string;
    data: {
        messages: Message[];
    };
}

interface ChatUser {
    userId: number;
    name: string;
    avatar?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    isRead: boolean;
    readAt: string | null;
}

const BusCompanyChat = () => {
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const { getUserInfor } = useAppAccessor();
    const stompClient = useRef<Client | null>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const [users, setUsers] = useState<ChatUser[]>([]);

    const selectedUserRef = useRef<ChatUser | null>(null);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    const memoizedGetUserInfo = useCallback(getUserInfor, []);
    const currentUserId = useMemo(
        () => memoizedGetUserInfo()?.user?.userId,
        [memoizedGetUserInfo]
    );

    const handleUserSelect = useCallback(
        async (user: ChatUser) => {
            setSelectedUser(user);

            if (!user.isRead) {
                try {
                    // 1. Lấy danh sách tất cả message từ người dùng này
                    const messagesResponse =
                        await axiosWithJWT.get<MessageResponse>(
                            `/api/v1/messages`,
                            {
                                params: {
                                    receiverId: currentUserId,
                                    senderId: user.userId,
                                },
                            }
                        );

                    if (messagesResponse.data.status === 200) {
                        const allMessages = messagesResponse.data.data.messages;

                        // 2. Chỉ lấy những message chưa đọc
                        const unreadMessages = allMessages.filter(
                            (msg) => msg.isRead === false
                        );

                        if (unreadMessages.length > 0) {
                            // 3. Gửi PUT để đánh dấu đã đọc
                            await Promise.all(
                                unreadMessages.map((message) =>
                                    axiosWithJWT.put(
                                        `/api/v1/messages/mark-as-read/${message.messageId}`
                                    )
                                )
                            );
                        }

                        // 4. Cập nhật danh sách user
                        setUsers((prevUsers) =>
                            prevUsers.map((u) =>
                                u.userId === user.userId
                                    ? {
                                          ...u,
                                          isRead: true,
                                          readAt: new Date().toISOString(),
                                      }
                                    : u
                            )
                        );
                    }
                } catch (error) {
                    console.error("Error marking messages as read:", error);
                }
            }
        },
        [currentUserId]
    );

    const markMessageAsRead = async (messageId: number) => {
        try {
            await axiosWithJWT.put(
                `/api/v1/messages/mark-as-read/${messageId}`
            );
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    };

    // Connect to WebSocket
    useEffect(() => {
        const userInfo = memoizedGetUserInfo();
        if (!userInfo) return;

        const client = new Client({
            webSocketFactory: () => new SockJS("https://ticketgo.site/ws"),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log("Connected to WebSocket");
            // Subscribe to user's topic
            client.subscribe(
                `/topic/chat-${userInfo.user.userId}`,
                async (message) => {
                    try {
                        const newMessage = JSON.parse(message.body);
                        console.log("New message received:", newMessage);
                        const isFromCurrentChat =
                            selectedUserRef.current?.userId ===
                                newMessage.senderId ||
                            selectedUserRef.current?.userId ===
                                newMessage.receiverId;

                        const isRelatedToCurrentChat =
                            newMessage.senderId === userInfo.user.userId ||
                            newMessage.receiverId === userInfo.user.userId;
                        console.log(
                            "isFromCurrentChat:",
                            isFromCurrentChat,
                            "isRelatedToCurrentChat:",
                            isRelatedToCurrentChat
                        );

                        if (isFromCurrentChat && isRelatedToCurrentChat) {
                            const response =
                                await axiosWithJWT.get<MessageResponse>(
                                    `/api/v1/messages`,
                                    {
                                        params: {
                                            receiverId: userInfo.user.userId,
                                            senderId: newMessage.senderId,
                                        },
                                    }
                                );

                            console.log("Response:", response);

                            if (response.data.status === 200) {
                                const unreadMessages =
                                    response.data.data.messages.filter(
                                        (msg) => !msg.isRead
                                    );

                                await Promise.all(
                                    unreadMessages.map((msg) =>
                                        markMessageAsRead(msg.messageId)
                                    )
                                );

                                setMessages((prev) => {
                                    const newMsgs = [...prev];
                                    unreadMessages.forEach((unread) => {
                                        const index = newMsgs.findIndex(
                                            (msg) =>
                                                msg.messageId ===
                                                unread.messageId
                                        );
                                        if (index !== -1) {
                                            newMsgs[index] = {
                                                ...newMsgs[index],
                                                isRead: true,
                                            };
                                        }
                                    });

                                    if (
                                        !newMsgs.some(
                                            (msg) =>
                                                msg.messageId ===
                                                newMessage.messageId
                                        )
                                    ) {
                                        newMsgs.push({
                                            ...newMessage,
                                            isRead: true,
                                        });
                                    }

                                    return newMsgs;
                                });

                                setUsers((prev) =>
                                    prev.map((user) =>
                                        user.userId === newMessage.senderId
                                            ? {
                                                  ...user,
                                                  lastMessage:
                                                      newMessage.content,
                                                  lastMessageTime:
                                                      newMessage.sentAt,
                                                  isRead: true,
                                                  readAt: new Date().toISOString(),
                                              }
                                            : user
                                    )
                                );
                            }
                        }
                    } catch (err) {
                        console.error("Error handling message:", err);
                    }
                }
            );
        };

        // Handle connection error
        client.onStompError = (frame) => {
            console.error("STOMP error:", frame);
        };

        // Activate connection
        client.activate();
        stompClient.current = client;

        // Cleanup on unmount
        return () => {
            if (client.connected) {
                client.deactivate();
            }
            stompClient.current = null;
        };
    }, [memoizedGetUserInfo]);

    useEffect(() => {
        const fetchChatUsers = async () => {
            try {
                const response = await axiosWithJWT.get(
                    "/api/v1/messages/chat-users"
                );
                if (response.data.status === 200) {
                    setUsers(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching chat users:", error);
            }
        };

        fetchChatUsers();
        const intervalId = setInterval(fetchChatUsers, 2000);
        return () => clearInterval(intervalId);
    }, []);

    const handleSend = useCallback(async () => {
        const messageContent = newMessage.trim();
        if (!messageContent || !selectedUser) return;

        const userInfo = getUserInfor();
        if (!userInfo) return;

        try {
            // Gửi tin nhắn
            await axiosWithJWT.post("/api/v1/messages/send", {
                senderId: 1,
                receiverId: selectedUser.userId,
                content: messageContent,
            });

            setNewMessage("");

            // Lấy danh sách tin nhắn chưa đọc và đánh dấu đã đọc
            const messagesResponse = await axiosWithJWT.get<MessageResponse>(
                `/api/v1/messages`,
                {
                    params: {
                        receiverId: userInfo.user.userId,
                        senderId: selectedUser.userId,
                    },
                }
            );

            if (messagesResponse.data.status === 200) {
                const unreadMessages =
                    messagesResponse.data.data.messages.filter(
                        (msg) => !msg.isRead // Đảm bảo chỉ lấy tin chưa đọc
                    );
                console.log("Unread messages:", unreadMessages);

                // Gọi API đánh dấu đã đọc
                await Promise.all(
                    unreadMessages.map((msg) =>
                        markMessageAsRead(msg.messageId)
                    )
                );

                // Update users list to reflect read status
                setUsers((prev) =>
                    prev.map((u) =>
                        u.userId === selectedUser.userId
                            ? {
                                  ...u,
                                  isRead: true,
                                  readAt: new Date().toISOString(),
                              }
                            : u
                    )
                );
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }, [newMessage, selectedUser, getUserInfor, markMessageAsRead]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedUser) {
                setMessages([]);
                return;
            }

            const userInfo = getUserInfor();
            if (!userInfo) return;

            try {
                const response = await axiosWithJWT.get<MessageResponse>(
                    `/api/v1/messages`,
                    {
                        params: {
                            receiverId: userInfo.user.userId,
                            senderId: selectedUser.userId,
                        },
                    }
                );

                if (response.data.status === 200) {
                    setMessages(response.data.data.messages);
                }
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        };

        fetchMessages();
        const intervalId = setInterval(fetchMessages, 2000);
        return () => clearInterval(intervalId);
    }, [selectedUser, memoizedGetUserInfo]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Box
            sx={{
                display: "flex",
                height: "calc(100vh - 130px)",
                gap: 2,
                mt: 2,
            }}
        >
            {/* Users List */}
            <Paper
                elevation={3}
                sx={{
                    width: 390,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: 2,
                        borderBottom: 1,
                        borderColor: "divider",
                        bgcolor: "background.paper",
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            mb: 2,
                        }}
                    >
                        Chat với khách hàng
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Tìm kiếm tin nhắn..."
                        InputProps={{
                            startAdornment: (
                                <SearchIcon
                                    sx={{ mr: 1, color: "text.secondary" }}
                                />
                            ),
                            sx: {
                                borderRadius: 2,
                                bgcolor: alpha("#000", 0.03),
                                "&:hover": {
                                    bgcolor: alpha("#000", 0.05),
                                },
                                "& fieldset": { border: "none" },
                            },
                        }}
                    />
                </Box>

                <List sx={{ overflow: "auto", flex: 1, px: 1 }}>
                    {users.map((user) => (
                        <UserListItem
                            key={user.userId}
                            user={user}
                            isSelected={selectedUser?.userId === user.userId}
                            onSelect={handleUserSelect}
                        />
                    ))}
                </List>
            </Paper>

            {/* Chat Area */}
            <Paper
                elevation={3}
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                }}
            >
                {selectedUser ? (
                    <>
                        <Box
                            sx={{
                                p: 2,
                                borderBottom: 1,
                                borderColor: "divider",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                bgcolor: "background.paper",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <Avatar
                                    sx={{ width: 40, height: 40 }}
                                    src={selectedUser.avatar}
                                />
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {selectedUser.name}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Messages Area */}
                        <Box
                            ref={chatBoxRef}
                            sx={{
                                flex: 1,
                                overflow: "auto",
                                p: 3,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                                bgcolor: alpha("#f5f5f5", 0.5),
                            }}
                        >
                            {messages.map((msg) => (
                                <ChatMessage
                                    key={msg.messageId}
                                    content={msg.content}
                                    sentAt={msg.sentAt}
                                    isSentByCurrentUser={
                                        msg.senderId === currentUserId
                                    }
                                />
                            ))}
                        </Box>

                        {/* Input Area */}
                        <Box
                            sx={{
                                p: 2,
                                borderTop: 1,
                                borderColor: "divider",
                                display: "flex",
                                gap: 1,
                                bgcolor: "background.paper",
                            }}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Nhập tin nhắn..."
                                InputProps={{
                                    sx: {
                                        borderRadius: 2,
                                        bgcolor: alpha("#000", 0.03),
                                        "&:hover": {
                                            bgcolor: alpha("#000", 0.05),
                                        },
                                    },
                                }}
                                sx={{
                                    "& .MuiInputBase-input": {
                                        fontFamily: "inherit", // Use inherited font for Vietnamese characters
                                    },
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSend}
                                endIcon={<SendIcon />}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    bgcolor: "primary.main",
                                    "&:hover": {
                                        bgcolor: "primary.dark",
                                    },
                                }}
                            >
                                Gửi
                            </Button>
                        </Box>
                    </>
                ) : (
                    <Box
                        sx={{
                            p: 4,
                            textAlign: "center",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <Typography color="text.secondary" variant="h6">
                            Chọn một người dùng để bắt đầu trò chuyện
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default React.memo(BusCompanyChat);
