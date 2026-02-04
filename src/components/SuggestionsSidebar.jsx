import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import FollowButton from "./FollowButton";
import { useAuth } from "../context/AuthContext";

export default function SuggestionsSidebar() {
    const { user: authUser } = useAuth();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await api.get("/users/suggestions/list");
                setSuggestions(res.data || []);
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, []);

    if (!authUser) return null;

    return (
        <div className="hidden lg:block w-[320px] pt-4 pl-8">
            {/* Current User Info */}
            <div className="flex items-center justify-between mb-4">
                <Link to="/profile" className="flex items-center gap-3">
                    <img
                        src={authUser.avatar || `https://ui-avatars.com/api/?background=333&color=fff&name=${authUser.username}`}
                        className="w-12 h-12 rounded-full object-cover border border-zinc-800"
                        alt={authUser.username}
                    />
                    <div className="min-w-0">
                        <p className="font-bold text-sm text-white truncate">{authUser.username}</p>
                        <p className="text-sm text-zinc-500 truncate">{authUser.fullName || authUser.username}</p>
                    </div>
                </Link>
                <button className="text-blue-500 text-xs font-bold hover:text-white transition-colors">
                    Switch
                </button>
            </div>

            {/* Suggestions Header */}
            <div className="flex items-center justify-between mt-6 mb-4">
                <h3 className="text-sm font-bold text-zinc-500">Suggested for you</h3>
                <Link to="/search" className="text-white text-xs font-bold hover:text-zinc-400 transition-colors">
                    See All
                </Link>
            </div>

            {/* Suggestions List */}
            <div className="space-y-4">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-800" />
                                <div className="space-y-2">
                                    <div className="w-20 h-2 bg-zinc-800 rounded" />
                                    <div className="w-16 h-2 bg-zinc-800 rounded" />
                                </div>
                            </div>
                            <div className="w-12 h-4 bg-zinc-800 rounded" />
                        </div>
                    ))
                ) : suggestions.length === 0 ? (
                    <p className="text-xs text-zinc-500">No suggestions at the moment.</p>
                ) : (
                    suggestions.slice(0, 5).map((user) => (
                        <div key={user._id} className="flex items-center justify-between">
                            <Link to={`/user/${user._id}`} className="flex items-center gap-3">
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?background=333&color=fff&name=${user.username}`}
                                    className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                                    alt={user.username}
                                />
                                <div className="min-w-0">
                                    <p className="font-bold text-xs text-white truncate hover:underline">{user.username}</p>
                                    <p className="text-[11px] text-zinc-500 truncate">Popular</p>
                                </div>
                            </Link>
                            <div className="scale-75 origin-right">
                                <FollowButton userId={user._id} isFollowing={false} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Links */}
            <div className="mt-10 opacity-30 text-[11px] text-zinc-500 space-y-4">
                <div className="flex flex-wrap gap-x-2 gap-y-1 uppercase tracking-tighter">
                    <span>About</span><span>Help</span><span>Press</span><span>API</span><span>Jobs</span><span>Privacy</span><span>Terms</span><span>Locations</span><span>Language</span><span>Meta Verified</span>
                </div>
                <div className="uppercase tracking-widest font-bold">
                    © 2026 INSTAEXPLORE FROM META
                </div>
            </div>
        </div>
    );
}
