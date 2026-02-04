import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import api from "../api/axios";
import FollowButton from "./FollowButton";

export default function UserListModal({ title, userId, type, onClose, onUpdate }) {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [suggested, setSuggested] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                console.log("❌ No userId");
                return;
            }

            console.log(`🔍 Fetching ${type} for user:`, userId);
            setLoading(true);

            try {
                // Fetch followers/following
                const res = await api.get(`/users/${userId}/${type}`);
                const fetchedUsers = res.data || [];
                console.log(`✅ Got ${fetchedUsers.length} ${type}`);
                setUsers(fetchedUsers);
                setFilteredUsers(fetchedUsers);

                // ALWAYS fetch suggestions regardless
                console.log("📡 Fetching suggestions...");
                try {
                    const sugRes = await api.get("/users/suggestions/list");
                    const suggestedUsers = sugRes.data || [];
                    console.log(`✅ Got ${suggestedUsers.length} suggestions:`, suggestedUsers);
                    setSuggested(suggestedUsers);
                    console.log("✅ Suggested state updated");
                } catch (sugErr) {
                    console.error("❌ Suggestions error:", sugErr);
                    setSuggested([]);
                }

                if (onUpdate) onUpdate();
            } catch (err) {
                console.error("❌ Fetch error:", err);
            } finally {
                setLoading(false);
                console.log("✅ Loading done");
            }
        };

        fetchData();
    }, [userId, type]);

    // Filter users based on search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    const handleFollow = async (targetUserId) => {
        try {
            await api.post(`/users/${targetUserId}/follow`);
            // Refresh the list
            const res = await api.get(`/users/${userId}/${type}`);
            setUsers(res.data || []);
            setFilteredUsers(res.data || []);

            // Refresh suggestions
            const sugRes = await api.get("/users/suggestions/list");
            setSuggested(sugRes.data || []);

            if (onUpdate) onUpdate();
        } catch (err) {
            console.error("Follow error:", err);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#262626] w-full max-w-md rounded-xl overflow-hidden border border-zinc-800 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                    <div className="w-8" />
                    <h2 className="font-bold text-base text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-zinc-800 rounded-full transition-colors text-white"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                {users.length > 0 && (
                    <div className="px-4 py-2 border-b border-zinc-800">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-800/50 text-white text-sm rounded-lg pl-10 pr-4 py-2 outline-none focus:bg-zinc-800 transition-colors placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin h-6 w-6 rounded-full border-t-2 border-white" />
                        </div>
                    ) : (
                        <>
                            {/* Main List */}
                            {filteredUsers.length > 0 ? (
                                <div>
                                    {filteredUsers.map(user => (
                                        <div
                                            key={user._id}
                                            className="flex items-center justify-between px-4 py-2 hover:bg-zinc-800/30 transition-colors"
                                        >
                                            <Link
                                                to={`/user/${user._id}`}
                                                onClick={onClose}
                                                className="flex items-center gap-3 flex-1 min-w-0"
                                            >
                                                <img
                                                    src={user.avatar || `https://ui-avatars.com/api/?background=333&color=fff&name=${user.username}`}
                                                    className="w-11 h-11 rounded-full object-cover"
                                                    alt={user.username}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-sm text-white truncate">{user.username}</p>
                                                    {user.fullName && (
                                                        <p className="text-sm text-zinc-400 truncate">{user.fullName}</p>
                                                    )}
                                                </div>
                                            </Link>
                                            <div className="ml-3">
                                                <FollowButton
                                                    userId={user._id}
                                                    isFollowing={user.isFollowing}
                                                    isRequested={user.isRequested}
                                                    onToggle={() => handleFollow(user._id)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : users.length > 0 && searchQuery ? (
                                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                    <p className="text-zinc-400 text-sm font-semibold">No results found</p>
                                    <p className="text-zinc-500 text-xs mt-1">Try searching for something else</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className="w-20 h-20 rounded-full border-2 border-zinc-700 flex items-center justify-center mb-4">
                                        <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-white font-bold text-base mb-1">No {type} yet</h3>
                                    <p className="text-zinc-400 text-sm">When they show up, you'll see them here.</p>
                                </div>
                            )}

                            {/* Suggested Users - Show when main list is empty */}
                            {(() => {
                                console.log("🎨 Render check - users.length:", users.length, "suggested.length:", suggested.length);
                                return users.length === 0 && suggested.length > 0;
                            })() && (

                                    <div className="border-t border-zinc-800 bg-zinc-900/20">
                                        <div className="px-4 py-3 border-b border-zinc-800/50">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-white">Suggested for you</h3>
                                                <Link
                                                    to="/search"
                                                    onClick={onClose}
                                                    className="text-xs text-blue-500 font-semibold hover:text-blue-400 transition-colors"
                                                >
                                                    See All
                                                </Link>
                                            </div>
                                        </div>
                                        <div>
                                            {suggested.slice(0, 5).map(user => (
                                                <div
                                                    key={user._id}
                                                    className="flex items-center justify-between px-4 py-2 hover:bg-zinc-800/30 transition-colors"
                                                >
                                                    <Link
                                                        to={`/user/${user._id}`}
                                                        onClick={onClose}
                                                        className="flex items-center gap-3 flex-1 min-w-0"
                                                    >
                                                        <img
                                                            src={user.avatar || `https://ui-avatars.com/api/?background=333&color=fff&name=${user.username}`}
                                                            className="w-11 h-11 rounded-full object-cover"
                                                            alt={user.username}
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold text-sm text-white truncate">{user.username}</p>
                                                            <p className="text-xs text-zinc-500 truncate">Popular</p>
                                                        </div>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleFollow(user._id)}
                                                        className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                                    >
                                                        Follow
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
