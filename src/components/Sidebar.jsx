import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaSearch, FaCompass, FaHeart, FaPlusSquare, FaUser, FaSignOutAlt, FaBars, FaChevronDown, FaPlus, FaCheck } from "react-icons/fa";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, accounts, switchAccount, logout } = useAuth();
  const { notifications, setNotifications: setGlobalNotifications } = useSocket();
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.isRead && n.type !== "message").length;
  const unreadMessages = notifications.filter(n => !n.isRead && n.type === "message").length;

  const sidebarItems = [
    { icon: <FaHome size={24} />, label: "Home", path: "/" },
    { icon: <FaSearch size={22} />, label: "Search", path: "/search" },
    {
      icon: (
        <div className="relative">
          <FaHeart size={24} />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold min-w-[16px] h-[16px] px-1 rounded-full border-2 border-black">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </div>
      ),
      label: "Notifications",
      path: "/activity"
    },
    {
      icon: (
        <div className="relative">
          <IoChatbubbleEllipsesSharp size={24} />
          {unreadMessages > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold min-w-[16px] h-[16px] px-1 rounded-full border-2 border-black">
              {unreadMessages > 9 ? "9+" : unreadMessages}
            </span>
          )}
        </div>
      ),
      label: "Messages",
      path: "/messages"
    },
    { icon: <FaPlusSquare size={24} />, label: "Create", path: "/create" },
    {
      icon: <img src={user?.avatar || "https://ui-avatars.com/api/?background=333&color=fff&name=User"} className="w-6 h-6 rounded-full object-cover" />,
      label: "Profile",
      path: "/profile"
    },
  ];





  return (
    <div className="h-full flex flex-col justify-between bg-black text-white p-3 border-r border-zinc-900 relative">
      <div>
        <div className="px-4 py-8 mb-4">
          <h1 className="text-xl font-bold tracking-tighter italic">InstaExplore</h1>
        </div>

        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.path;
            const handleClick = () => {
              if (item.label === "Notifications") {
                setGlobalNotifications(prev => prev.map(n => n.type !== "message" ? { ...n, isRead: true } : n));
              } else if (item.label === "Messages") {
                setGlobalNotifications(prev => prev.map(n => n.type === "message" ? { ...n, isRead: true } : n));
              }
            };

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={handleClick}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group
                    ${isActive ? "font-bold bg-zinc-900/50" : "hover:bg-zinc-900"}
                `}
              >
                <span className={`${isActive ? "scale-110" : "group-hover:scale-110"} transition-transform flex items-center justify-center w-6`}>
                  {item.icon}
                </span>
                <span className={`text-sm tracking-wide ${isActive ? "text-white" : "text-zinc-300"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

      </div>

      <div className="mt-auto pb-4 px-2">
        {/* Multi-Account Switcher Popover */}
        {showAccountSwitcher && (
          <div className="absolute bottom-20 left-4 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between p-3 border-b border-zinc-800 mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Switch accounts</span>
            </div>

            <div className="max-h-60 overflow-y-auto scrollbar-hide space-y-1">
              {accounts.map((acc) => (
                <div
                  key={acc.user._id}
                  onClick={() => {
                    if (acc.user._id !== user?._id) switchAccount(acc.user._id);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all group ${acc.user._id === user?._id ? 'bg-zinc-800/50 cursor-default' : 'hover:bg-zinc-800'
                    }`}
                >
                  <img
                    src={acc.user.avatar || `https://ui-avatars.com/api/?background=333&color=fff&name=${acc.user.username}`}
                    className="w-10 h-10 rounded-full border border-zinc-700 object-cover"
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold truncate">{acc.user.username}</p>
                    <p className="text-[10px] text-zinc-500">
                      {acc.user._id === user?._id ? 'Current Account' : 'Tap to switch'}
                    </p>
                  </div>
                  {acc.user._id === user?._id && (
                    <FaCheck className="text-blue-500 text-xs" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-zinc-800 space-y-1">
              <button
                onClick={() => {
                  setShowAccountSwitcher(false);
                  navigate("/settings");
                }}
                className="flex items-center gap-3 w-full p-3 hover:bg-zinc-800 rounded-lg text-white transition-all text-sm font-semibold active:scale-95"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <FaPlusSquare size={20} className="text-zinc-400" />
                </div>
                Settings
              </button>
              <button
                onClick={() => {
                  setShowAccountSwitcher(false);
                  navigate("/login?addAccount=true");
                }}
                className="flex items-center gap-3 w-full p-3 hover:bg-zinc-800 rounded-lg text-blue-500 transition-all text-sm font-semibold active:scale-95"
              >

                <div className="w-10 h-10 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 font-normal">
                  <FaPlus size={14} />
                </div>
                Add account
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full p-3 hover:bg-zinc-800 rounded-lg text-red-500 transition-all text-sm font-semibold active:scale-95"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <FaSignOutAlt size={20} />
                </div>
                Log out current
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
          className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group
             ${showAccountSwitcher ? 'bg-zinc-900 border border-zinc-800' : 'hover:bg-zinc-900'}
          `}
        >
          <div className="relative">
            <FaBars size={20} className={`${showAccountSwitcher ? 'text-white' : 'text-zinc-300'} group-hover:text-white transition-colors`} />
          </div>
          <span className={`text-sm font-medium ${showAccountSwitcher ? 'text-white' : 'text-zinc-300'} group-hover:text-white`}>More</span>
        </button>
      </div>
    </div>
  );
}
