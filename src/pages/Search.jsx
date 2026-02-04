import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import api from "../api/axios";
import FollowButton from "../components/FollowButton";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=333&color=fff&name=?";

export default function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                handleSearch();
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/users/search?query=${query}`);
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[600px] mx-auto p-2 md:p-8">
            <h1 className="text-2xl font-bold mb-8">Search</h1>

            {/* Search Input Area */}
            <div className="relative mb-8">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                    <FaSearch />
                </div>
                <input
                    type="text"
                    placeholder="Search for people..."
                    className="w-full bg-zinc-900 border-none rounded-xl py-3 pl-12 pr-12 text-sm focus:ring-0 text-white placeholder-zinc-500"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-white"
                    >
                        <FaTimes />
                    </button>
                )}
            </div>

            {/* Results Title */}
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="font-semibold text-zinc-200">{query ? 'Results' : 'Recent'}</h2>
                {!query && <button className="text-blue-500 text-xs font-semibold hover:text-white transition-colors">Clear all</button>}
            </div>

            {/* Results List */}
            <div className="space-y-2">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : query && results.length === 0 ? (
                    <p className="text-center text-zinc-500 py-10">No results found for "{query}"</p>
                ) : (
                    results.map((user) => (
                        <div
                            key={user._id}
                            className="flex items-center justify-between p-2 hover:bg-zinc-900/50 rounded-xl transition-colors group"
                        >
                            <Link
                                to={`/user/${user._id}`}
                                className="flex items-center gap-4 flex-1 min-w-0"
                            >
                                <img
                                    src={user.avatar || DEFAULT_AVATAR}
                                    alt={user.username}
                                    className="w-12 h-12 rounded-full object-cover border border-zinc-800"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm group-hover:text-white">{user.username}</p>
                                    <p className="text-xs text-zinc-500 truncate">{user.bio || "No bio yet"}</p>
                                </div>
                            </Link>

                            <div className="ml-4">
                                <FollowButton userId={user._id} isFollowing={user.isFollowing} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {!query && (
                <div className="text-center py-20 text-zinc-600">
                    <FaSearch size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Search for friends and creators</p>
                </div>
            )}
        </div>
    );
}
