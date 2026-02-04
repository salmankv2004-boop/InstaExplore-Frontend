import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import FeedSkeleton from "../components/FeedSkeleton";
import SuggestionsSidebar from "../components/SuggestionsSidebar";
import api from "../api/axios";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsRes = await api.get("/posts");
        setPosts(postsRes.data || []);
      } catch (err) {
        console.error("Feed error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <FeedSkeleton />;

  return (
    <div className="flex justify-center max-w-[1000px] mx-auto min-h-screen">
      <div className="flex-1 max-w-[630px] pt-4 md:pt-8 px-0 md:px-4">
        {/* POSTS */}
        {posts.length === 0 ? (
          <div className="text-center py-20 border border-zinc-900 rounded-lg bg-black/40 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full border border-zinc-700 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📸</span>
            </div>
            <p className="text-zinc-400 text-lg font-bold">No posts yet</p>
            <p className="text-zinc-500 text-sm mt-2">Follow some people to see their posts here!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Suggested Users Sidebar */}
      <SuggestionsSidebar />
    </div>
  );
}

