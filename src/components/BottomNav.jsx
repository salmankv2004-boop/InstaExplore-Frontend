import { Link, useLocation } from "react-router-dom";
import { FaHome, FaSearch, FaPlusSquare, FaHeart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function BottomNav() {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const { notifications } = useSocket();

    const unreadNotifications = notifications.filter(n => !n.isRead && n.type !== "message").length;

    const navItems = [
        { icon: <FaHome size={24} />, label: "Home", path: "/" },
        { icon: <FaSearch size={24} />, label: "Search", path: "/search" },
        { icon: <FaPlusSquare size={24} />, label: "Create", path: "/create" },
        {
            icon: (
                <div className="relative">
                    <FaHeart size={24} />
                    {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold min-w-[14px] h-[14px] px-0.5 rounded-full border-2 border-black">
                            {unreadNotifications > 9 ? "9+" : unreadNotifications}
                        </span>
                    )}
                </div>
            ),
            label: "Activity",
            path: "/activity"
        },
        {
            icon: (
                <img
                    src={user?.avatar || "https://ui-avatars.com/api/?background=333&color=fff&name=User"}
                    className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                    alt="Profile"
                />
            ),
            label: "Profile",
            path: "/profile"
        },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-zinc-800 z-50 px-4">
            <div className="flex items-center justify-between h-full max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors
                ${isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"}
              `}
                        >
                            <div className={`${isActive ? "scale-110" : ""} transition-transform`}>
                                {item.icon}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
