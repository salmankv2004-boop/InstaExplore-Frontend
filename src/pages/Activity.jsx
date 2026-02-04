import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { FaHeart, FaComment, FaUserPlus, FaChevronRight, FaEnvelope } from "react-icons/fa";
import { useSocket } from "../context/SocketContext";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=333&color=fff&name=User";

export default function Activity() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setNotifications: setGlobalNotifications } = useSocket();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);

        // Mark as read (only non-message types)
        await api.put("/notifications/read?type=activity"); // We'll handle this on server
        setGlobalNotifications(prev => prev.map(n => n.type !== "message" ? { ...n, isRead: true } : n));

      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [setGlobalNotifications]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="max-w-[600px] mx-auto p-0 md:p-8">
      <h1 className="text-2xl font-bold mb-8">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <div className="w-16 h-16 rounded-full border border-zinc-700 flex items-center justify-center mx-auto mb-4">
            <FaHeart size={30} className="opacity-20" />
          </div>
          <p className="font-medium text-white">No notifications yet</p>
          <p className="text-sm mt-1">When someone likes or comments on your posts, you'll see them here.</p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="text-sm font-semibold mb-4 px-2">Recent</div>

          {notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-center gap-4 p-3 hover:bg-zinc-900/50 rounded-xl transition-colors group ${!n.isRead ? 'bg-blue-500/5' : ''}`}
            >
              <Link to={`/user/${n.sender._id}`} className="shrink-0">
                <img
                  src={n.sender.avatar || DEFAULT_AVATAR}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover border border-zinc-800"
                />
              </Link>

              <div className="flex-1 text-sm leading-tight">
                <p>
                  <Link to={`/user/${n.sender._id}`} className="font-bold hover:text-zinc-400 transition-colors mr-1">
                    {n.sender.username}
                  </Link>
                  <span className="text-zinc-300">
                    {n.type === "like" ? "liked your post." :
                      n.type === "comment_like" ? "liked your comment:" :
                        n.type === "comment" ? "commented on your post:" :
                          n.type === "message" ? "sent you a message:" :
                            "started following you."}
                  </span>
                  {n.content && (
                    <span className={`block mt-1 ${n.type === "message" ? "text-blue-400 font-medium" : "text-zinc-500 italic"}`}>
                      "{n.content}"
                    </span>
                  )}
                </p>
                <span className="text-[11px] text-zinc-500 mt-1 inline-block">
                  {getTimeAgo(n.createdAt)}
                </span>
              </div>

              {n.post ? (
                <Link
                  to={`/profile`} // Ideally, this would open the specific post Modal
                  className="shrink-0 w-10 h-10 border border-zinc-800 rounded-sm overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <img src={n.post.image} className="w-full h-full object-cover" alt="post" />
                </Link>
              ) : n.type === "message" ? (
                <Link
                  to={`/messages?userId=${n.sender._id}`}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  Reply
                </Link>
              ) : n.type === "follow" ? (
                <Link
                  to={`/user/${n.sender._id}`}
                  className="bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                >
                  Follow
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Suggested for you section - Instagram Style */}
      <div className="mt-12 border-t border-zinc-900 pt-8 px-2">
        <h2 className="font-bold mb-6">Suggested for you</h2>
        <div className="space-y-6">
          <SuggestedUser name="nature_explorer" bio="Nature enthusiast 🌿" />
          <SuggestedUser name="tech_insider" bio="Latest in tech & AI 🤖" />
        </div>
      </div>
    </div>
  );
}

function SuggestedUser({ name, bio }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
          <img src={`https://ui-avatars.com/api/?name=${name}&background=random`} className="w-full h-full object-cover" />
        </div>
        <div className="text-sm">
          <p className="font-bold">{name}</p>
          <p className="text-zinc-500 text-xs">{bio}</p>
        </div>
      </div>
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors">
        Follow
      </button>
    </div>
  )
}

