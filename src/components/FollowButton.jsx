import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function FollowButton({ userId, isFollowing, isRequested: initialRequested, onToggle }) {
  const { user: authUser } = useAuth();
  const [following, setFollowing] = useState(isFollowing);
  const [requested, setRequested] = useState(initialRequested);
  const [loading, setLoading] = useState(false);

  // Sync state with props
  useEffect(() => {
    setFollowing(isFollowing);
    setRequested(initialRequested);
  }, [isFollowing, initialRequested]);

  const handleFollowToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (following) {
        await api.post(`/users/${userId}/unfollow`);
        setFollowing(false);
      } else if (requested) {
        // Typically you might not have an "un-request" but let's assume unfollow handles it or stays requested
        await api.post(`/users/${userId}/unfollow`);
        setRequested(false);
      } else {
        const res = await api.post(`/users/${userId}/follow`);
        if (res.data.message === "Follow request sent") {
          setRequested(true);
        } else {
          setFollowing(true);
        }
      }
      if (onToggle) onToggle();
    } catch (err) {
      console.error("Follow toggle failed:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };


  // Don't show follow button for own profile
  if (authUser?._id === userId) return null;

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`px-6 py-1.5 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 ${following
        ? "bg-zinc-800 hover:bg-zinc-700 text-white"
        : requested
          ? "bg-zinc-900 text-zinc-400 border border-zinc-700"
          : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
        }`}
    >
      {loading ? "..." : following ? "Following" : requested ? "Requested" : "Follow"}
    </button>
  );
}

