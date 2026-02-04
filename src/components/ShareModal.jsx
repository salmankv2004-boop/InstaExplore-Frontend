import { useState, useEffect } from "react";
import { FaTimes, FaSearch, FaCheckCircle, FaLink, FaFacebook, FaTwitter, FaWhatsapp, FaTelegram, FaEnvelope } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import api from "../api/axios";
import { sendMessage } from "../api/messageApi";
import { toast } from "react-toastify";

export default function ShareModal({ post, onClose }) {
    const [view, setView] = useState("options"); // "options" or "sendTo"
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [sending, setSending] = useState(false);

    const postUrl = `${window.location.origin}/post/${post._id}`;

    useEffect(() => {
        if (view === "sendTo") {
            fetchUsers();
        }
    }, [view]);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/messages/conversations");
            console.log("Conversations:", res.data);
            const userList = res.data.map(c => c.userInfo);
            setUsers(userList);

            // If no conversations, fetch suggested users
            if (userList.length === 0) {
                const sugRes = await api.get("/users/suggestions/list");
                setUsers(sugRes.data || []);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            // Try to fetch suggested users as fallback
            try {
                const sugRes = await api.get("/users/suggestions/list");
                setUsers(sugRes.data || []);
            } catch (sugErr) {
                console.error("Error fetching suggestions:", sugErr);
            }
        }
    };

    const handleSearch = async (e) => {
        const q = e.target.value;
        setQuery(q);
        if (q.length > 1) {
            try {
                const res = await api.get(`/users/search?query=${q}`);
                setUsers(res.data);
            } catch (err) {
                console.error("Search error:", err);
            }
        } else if (q.length === 0) {
            fetchUsers();
        }
    };

    const toggleSelect = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(prev => prev.filter(id => id !== userId));
        } else {
            setSelectedUsers(prev => [...prev, userId]);
        }
    };

    const handleShare = async () => {
        if (selectedUsers.length === 0) {
            toast.error("Please select at least one person");
            return;
        }

        setSending(true);
        try {
            console.log("Sharing with users:", selectedUsers);
            const results = await Promise.all(
                selectedUsers.map(async (userId) => {
                    try {
                        await sendMessage(userId, `Check out this post!`, post._id);
                        return { success: true, userId };
                    } catch (err) {
                        console.error(`Failed to send to ${userId}:`, err);
                        return { success: false, userId, error: err };
                    }
                })
            );

            const successCount = results.filter(r => r.success).length;
            if (successCount > 0) {
                toast.success(`Shared with ${successCount} ${successCount === 1 ? 'person' : 'people'}!`);
                onClose();
            } else {
                toast.error("Failed to share post");
            }
        } catch (err) {
            console.error("Share error:", err);
            toast.error("Failed to share post");
        } finally {
            setSending(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(postUrl);
        toast.success("Link copied to clipboard!");
    };

    const shareOptions = [
        {
            icon: <FaLink size={20} />,
            label: "Copy link",
            action: () => {
                copyLink();
                onClose();
            }
        },
        {
            icon: <FaFacebook size={20} />,
            label: "Share to Facebook",
            action: () => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
                onClose();
            }
        },
        {
            icon: <FaTwitter size={20} />,
            label: "Share to Twitter",
            action: () => {
                const text = post.caption ? `Check out this post: ${post.caption.substring(0, 100)}...` : 'Check out this post!';
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`, '_blank');
                onClose();
            }
        },
        {
            icon: <FaWhatsapp size={20} />,
            label: "Share to WhatsApp",
            action: () => {
                window.open(`https://wa.me/?text=${encodeURIComponent(postUrl)}`, '_blank');
                onClose();
            }
        },
        {
            icon: <FaTelegram size={20} />,
            label: "Share to Telegram",
            action: () => {
                window.open(`https://t.me/share/url?url=${encodeURIComponent(postUrl)}`, '_blank');
                onClose();
            }
        },
        {
            icon: <FaEnvelope size={20} />,
            label: "Share via Email",
            action: () => {
                window.open(`mailto:?subject=Check out this post&body=${encodeURIComponent(postUrl)}`, '_blank');
                onClose();
            }
        },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-[#262626] w-full max-w-md rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                {view === "options" ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                            <div className="w-8" />
                            <h2 className="font-bold text-base">Share</h2>
                            <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-full transition-colors">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Share Options */}
                        <div className="py-2">
                            {/* Send to People */}
                            <button
                                onClick={() => setView("sendTo")}
                                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left"
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <FaSearch size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">Send to...</p>
                                    <p className="text-xs text-zinc-500">Share with friends</p>
                                </div>
                            </button>

                            <div className="h-px bg-zinc-800 my-2" />

                            {/* Other Share Options */}
                            {shareOptions.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={option.action}
                                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left"
                                >
                                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white">
                                        {option.icon}
                                    </div>
                                    <p className="font-medium text-sm">{option.label}</p>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Send To View */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                            <button
                                onClick={() => {
                                    console.log("Going back to options");
                                    setView("options");
                                    setSelectedUsers([]);
                                    setQuery("");
                                }}
                                className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="font-bold">Send to</h2>
                            <div className="w-8" />
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-zinc-800">
                            <div className="flex items-center gap-3 bg-zinc-800/50 rounded-xl px-4 py-2">
                                <FaSearch className="text-zinc-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent text-sm w-full outline-none placeholder:text-zinc-500"
                                    value={query}
                                    onChange={handleSearch}
                                />
                            </div>
                        </div>

                        {/* User List */}
                        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                            {users.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">No users found.</div>
                            ) : (
                                users.map(user => (
                                    <div
                                        key={user._id}
                                        className="flex items-center justify-between px-4 py-2 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                                        onClick={() => toggleSelect(user._id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={user.avatar || `https://ui-avatars.com/api/?background=333&color=fff&name=${user.username}`}
                                                className="w-11 h-11 rounded-full object-cover"
                                                alt={user.username}
                                            />
                                            <div>
                                                <p className="font-semibold text-sm">{user.username}</p>
                                                <p className="text-xs text-zinc-500">{user.fullName || 'User'}</p>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedUsers.includes(user._id) ? 'bg-blue-500 border-blue-500' : 'border-zinc-600'}`}>
                                            {selectedUsers.includes(user._id) && <FaCheckCircle className="text-white text-sm" />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Send Button */}
                        <div className="p-4 border-t border-zinc-800">
                            <button
                                disabled={selectedUsers.length === 0 || sending}
                                onClick={handleShare}
                                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-bold transition-all"
                            >
                                {sending ? "Sending..." : selectedUsers.length > 0 ? `Send to ${selectedUsers.length}` : "Send"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
