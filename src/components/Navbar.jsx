import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { useSocket } from "../context/SocketContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { notifications } = useSocket();

  const unreadMessages = notifications.filter(n => !n.isRead && n.type === "message").length;

  return (
    <header className="sticky top-0 z-50 bg-black/85 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="text-xl font-bold italic tracking-tighter">
          InstaExplore
        </Link>

        {/* Desktop Search */}
        <div
          onClick={() => navigate("/search")}
          className="hidden lg:flex items-center w-64 px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 cursor-text"
        >
          <FaSearch className="mr-2 text-xs" />
          <span className="text-sm">Search</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile Messages Icon */}
          <Link to="/messages" className="lg:hidden relative text-white">
            <IoChatbubbleEllipsesSharp size={24} />
            {unreadMessages > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold min-w-[16px] h-[16px] px-1 rounded-full border-2 border-black">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
