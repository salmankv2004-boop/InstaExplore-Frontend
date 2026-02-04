import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "../api/axios";
import io from "socket.io-client";
import { toast } from "react-toastify";


const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const fetchInitialData = async () => {
                try {
                    const res = await api.get("/notifications");
                    setNotifications(res.data);
                } catch (err) {
                    console.error("Failed to fetch initial notifications:", err);
                }
            };

            fetchInitialData();

            const socketInstance = io("https://instaexpolre-backend.onrender.com", {
                query: {
                    userId: user._id,
                },
            });

            setSocket(socketInstance);

            socketInstance.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            socketInstance.on("newNotification", (notification) => {
                setNotifications((prev) => [notification, ...prev]);

                // Don't show toast if we are already in the messages page and it's a message
                if (notification.type === "message" && window.location.pathname === "/messages") {
                    return;
                }

                // Show Instagram-style toast notification
                const getToastMessage = () => {
                    switch (notification.type) {
                        case "like": return "liked your post";
                        case "comment_like": return `liked your comment: "${notification.content?.substring(0, 20)}${notification.content?.length > 20 ? '...' : ''}"`;
                        case "comment": return `commented: "${notification.content?.substring(0, 20)}${notification.content?.length > 20 ? '...' : ''}"`;
                        case "follow": return "started following you";
                        case "follow_request": return "sent you a follow request";
                        case "follow_accept": return "accepted your follow request";
                        case "message": return `sent you a message: "${notification.content?.substring(0, 20)}${notification.content?.length > 20 ? '...' : ''}"`;
                        default: return "interacted with you";
                    }
                };

                toast(({ closeToast }) => (
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => {
                            window.location.href = notification.type === "message" ? "/messages" : "/activity";
                        }}
                    >
                        <img
                            src={notification.sender.avatar || `https://ui-avatars.com/api/?name=${notification.sender.username}`}
                            className="w-10 h-10 rounded-full object-cover"
                            alt=""
                        />
                        <div>
                            <span className="font-bold">{notification.sender.username}</span> {getToastMessage()}
                        </div>
                    </div>
                ), {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: {
                        background: '#262626',
                        color: 'white',
                        borderRadius: '12px',
                        border: '1px solid #444',
                        padding: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }
                });
            });



            return () => socketInstance.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, notifications, setNotifications }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};
