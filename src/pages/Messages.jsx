import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getConversations, getMessages, sendMessage } from "../api/messageApi";
import api from "../api/axios";
import { FiSend, FiMessageSquare, FiImage } from "react-icons/fi";
import { BsEmojiSmile } from "react-icons/bs";
import { FaTimes } from "react-icons/fa";
import { useSocket } from "../context/SocketContext";
import EmojiPicker from 'emoji-picker-react';



export default function Messages() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const [searchParams] = useSearchParams();
    const urlUserId = searchParams.get("userId");
    const processedUrlRef = useRef(false);

    const { socket, setNotifications: setGlobalNotifications, notifications } = useSocket();

    useEffect(() => {
        loadConversations();
    }, []);

    // Mark current chat as read when activeChat changes
    useEffect(() => {
        if (activeChat) {
            const clearChatNotifications = async () => {
                try {
                    await api.put(`/notifications/read?type=message&senderId=${activeChat._id}`);
                    setGlobalNotifications(prev => prev.map(n =>
                        (n.type === "message" && n.sender._id === activeChat._id) ? { ...n, isRead: true } : n
                    ));
                } catch (err) {
                    console.error("Failed to clear chat notifications:", err);
                }
            };
            clearChatNotifications();
        }
    }, [activeChat, setGlobalNotifications]);

    // Listen for real-time messages
    useEffect(() => {
        if (socket) {
            socket.on("newMessage", (msg) => {
                // If message is for the currently active chat
                if (activeChat?._id === msg.sender) {
                    setMessages((prev) => [...prev, msg]);
                    scrollToBottom();
                    // Mark as read immediately if chat is open
                    api.put(`/notifications/read?type=message&senderId=${msg.sender}`);
                }
                // Refresh conversations list
                loadConversations();
            });
        }
        return () => socket?.off("newMessage");
    }, [socket, activeChat]);


    const loadConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);

            if (urlUserId && !processedUrlRef.current) {
                processedUrlRef.current = true;
                const existing = data.find((c) => c.userInfo._id === urlUserId);

                if (existing) {
                    openChat(existing.userInfo);
                } else {
                    try {
                        const res = await api.get(`/users/${urlUserId}`);
                        const newUser = res.data;
                        setConversations((prev) => [
                            {
                                userInfo: newUser,
                                lastMessage: { content: "Start a conversation", createdAt: new Date().toISOString() },
                            },
                            ...prev,
                        ]);
                        setActiveChat(newUser);
                    } catch (err) {
                        console.error("User not found for new chat");
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load conversations");
        }
    };

    const openChat = async (partner) => {
        setActiveChat(partner);
        try {
            const msgs = await getMessages(partner._id);
            setMessages(msgs);
            scrollToBottom();
        } catch (error) {
            console.error("Failed to load messages");
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !image) || !activeChat) return;

        try {
            const msg = await sendMessage(activeChat._id, newMessage, null, image);
            setMessages((prev) => [...prev, msg]);
            setNewMessage("");
            setImage(null);
            setPreview(null);
            loadConversations();
            scrollToBottom();
        } catch (error) {
            console.error("Failed to send message", error);
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message;
            alert(`Failed to send message: ${errMsg}`);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) return alert("File too large (max 5MB)");
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const isUnread = (userId) => {

        return notifications.some(n => n.sender?._id === userId && !n.isRead && n.type === "message");
    };

    return (

        <div className="flex h-[calc(100vh-140px)] bg-black text-white overflow-hidden rounded-md border border-zinc-800">

            {/* Sidebar: Conversations List */}
            <div className={`w-full md:w-1/3 border-r border-zinc-800 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold">{user?.username}</h2>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {conversations.length === 0 ? (
                        <div className="p-10 text-center text-zinc-500 flex flex-col items-center gap-3">
                            <FiMessageSquare size={40} className="opacity-20" />
                            <p className="text-sm">No messages found.</p>
                        </div>
                    ) : (
                        conversations.map((conv) => {
                            const partner = conv.userInfo;
                            const isSelected = activeChat?._id === partner._id;

                            return (
                                <div
                                    key={partner._id}
                                    onClick={() => openChat(partner)}
                                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors ${isSelected ? "bg-[#262626]" : ""
                                        }`}
                                >
                                    <img
                                        src={partner.avatar || "https://ui-avatars.com/api/?background=333&color=fff&name=" + partner.username}
                                        alt={partner.username}
                                        className="w-14 h-14 rounded-full object-cover border border-zinc-800"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`text-sm truncate ${isUnread(partner._id) ? 'font-bold text-white' : 'font-medium text-zinc-300'}`}>
                                            {partner.username}
                                        </h3>
                                        <p className={`text-xs truncate mt-0.5 ${isUnread(partner._id) ? 'font-semibold text-white' : 'text-zinc-500'}`}>
                                            {conv.lastMessage.content}
                                        </p>
                                    </div>
                                    {isUnread(partner._id) && (
                                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-1" />
                                    )}

                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`w-full md:w-2/3 flex flex-col bg-black ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-zinc-800 flex items-center gap-3 justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setActiveChat(null)}
                                    className="md:hidden text-zinc-400 hover:text-white"
                                >
                                    &larr;
                                </button>
                                <img
                                    src={activeChat.avatar || "https://ui-avatars.com/api/?background=333&color=fff&name=" + activeChat.username}
                                    alt={activeChat.username}
                                    className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                                />
                                <h2 className="font-semibold">{activeChat.username}</h2>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                            {messages.map((msg) => {
                                const isMe = msg.sender === user?._id;
                                return (
                                    <div
                                        key={msg._id}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl text-sm overflow-hidden ${isMe
                                                ? "bg-blue-600 text-white"
                                                : "bg-zinc-800 text-zinc-100"
                                                }`}
                                        >
                                            {msg.sharedPost ? (
                                                <div className="flex flex-col">
                                                    {/* Shared Post Preview */}
                                                    <div
                                                        className="cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(`/post/${msg.sharedPost._id}`, '_blank')}
                                                    >
                                                        <img
                                                            src={msg.sharedPost.image}
                                                            className="w-full aspect-square object-cover"
                                                            alt="Shared post"
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/400?text=Post+Image';
                                                            }}
                                                        />
                                                        <div className={`p-3 ${isMe ? 'bg-blue-700' : 'bg-zinc-900'}`}>
                                                            <p className="font-bold text-xs">@{msg.sharedPost.user?.username || 'User'}</p>
                                                            {msg.sharedPost.caption && (
                                                                <p className="text-xs opacity-80 mt-1 line-clamp-2">{msg.sharedPost.caption}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Optional message text */}
                                                    {msg.content && msg.content !== "Check out this post!" && (
                                                        <div className="px-4 py-2">
                                                            <p>{msg.content}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    {msg.image && (
                                                        <div className="p-1">
                                                            <img
                                                                src={msg.image}
                                                                alt="sent image"
                                                                className="rounded-lg w-full max-w-[250px] object-cover cursor-pointer"
                                                                onClick={() => window.open(msg.image, '_blank')}
                                                            />
                                                        </div>
                                                    )}
                                                    {msg.content && (msg.content !== "Sent an image" || !msg.image) && (
                                                        <div className="px-4 py-2">
                                                            <p>{msg.content}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 relative">
                            {showEmojiPicker && (
                                <div className="absolute bottom-20 left-4 z-50">
                                    <EmojiPicker
                                        theme="dark"
                                        onEmojiClick={(emojiData) => {
                                            setNewMessage(prev => prev + emojiData.emoji);
                                            setShowEmojiPicker(false);
                                        }}
                                    />
                                </div>
                            )}
                            <form onSubmit={handleSend} className="border border-zinc-800 bg-black rounded-full flex gap-3 px-4 py-2 items-center">
                                {/* Image Preview */}
                                {preview && (
                                    <div className="absolute bottom-full left-4 mb-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                                        <div className="relative">
                                            <img src={preview} alt="preview" className="h-20 w-auto rounded-md object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setImage(null); setPreview(null); }}
                                                className="absolute -top-2 -right-2 bg-zinc-800 rounded-full p-1 text-white border border-zinc-700 hover:bg-zinc-700"
                                            >
                                                <FaTimes size={10} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="text-white hover:text-yellow-500 transition-colors"
                                >
                                    <BsEmojiSmile size={22} />
                                </button>
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-white hover:text-zinc-300 transition-colors"
                                    title="Attach Image"
                                >
                                    <FiImage size={22} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Message..."
                                    className="flex-1 bg-transparent text-white text-sm outline-none"
                                />

                                {(newMessage.trim() || image) && (
                                    <button
                                        type="submit"
                                        className="text-blue-500 font-bold text-sm hover:text-white transition-all px-2"
                                    >
                                        Send
                                    </button>
                                )}
                            </form>
                        </div>

                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 px-10 text-center">
                        <div className="w-24 h-24 rounded-full border-2 border-zinc-100 flex items-center justify-center mb-4">
                            <FiMessageSquare size={40} className="text-zinc-100" />
                        </div>
                        <h2 className="text-xl text-zinc-100 font-medium whitespace-nowrap">Your Messages</h2>
                        <p className="text-sm mt-1">Send private photos and messages to a friend.</p>
                        <button className="mt-5 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                            Send message
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
