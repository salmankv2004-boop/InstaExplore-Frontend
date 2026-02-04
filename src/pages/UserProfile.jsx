import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import FollowButton from "../components/FollowButton";
import PostCard from "../components/PostCard";
import { FaHeart, FaComment, FaUserShield, FaLock } from "react-icons/fa";
import PostModal from "../components/PostModal";
import UserListModal from "../components/UserListModal";
import { toast } from "react-toastify";



const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=333&color=fff&name=User";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showUserList, setShowUserList] = useState(null); // { type: 'followers' | 'following', title: string }


  const fetchUser = async () => {
    try {
      const userRes = await api.get(`/users/${id}`);
      setUser(userRes.data);

      const postsRes = await api.get(`/posts/user/${id}`);
      setPosts(postsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">User not found</p>;

  return (
    <div className="flex flex-col md:flex-row gap-10 p-10 max-w-6xl mx-auto">
      {/* Avatar */}
      <img
        src={user.avatar || DEFAULT_AVATAR}
        alt="avatar"
        className="w-36 h-36 rounded-full object-cover border border-zinc-800"
      />

      <div className="flex-1">
        {/* Username & Follow */}
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-2xl font-light">{user.username}</h2>
          <FollowButton
            userId={user._id}
            isFollowing={user.isFollowing}
            isRequested={user.isRequested}
            onToggle={fetchUser}
          />

          {(!user.isPrivate || user.isFollowing) && (
            <button
              onClick={() => navigate(`/messages?userId=${user._id}`)}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Message
            </button>
          )}
          <button
            onClick={async () => {
              if (window.confirm(`Block ${user.username}?`)) {
                try {
                  await api.post(`/users/${user._id}/block`);
                  toast.success("User blocked");
                  navigate("/");
                } catch (err) {
                  toast.error("Failed to block user");
                }
              }
            }}
            className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
            title="Block User"
          >
            <FaUserShield />
          </button>
        </div>


        {/* Stats */}
        <div className="flex gap-10 mb-6">
          <span className="text-zinc-300"><strong className="text-white">{posts.length}</strong> posts</span>
          <button
            disabled={user.isPrivate && !user.isFollowing}
            onClick={() => setShowUserList({ type: 'followers', title: 'Followers' })}
            className={`text-zinc-300 ${user.isPrivate && !user.isFollowing ? 'cursor-default' : 'hover:opacity-70 transition-opacity'}`}
          >
            <strong className="text-white">{user.followers?.length || 0}</strong> followers
          </button>
          <button
            disabled={user.isPrivate && !user.isFollowing}
            onClick={() => setShowUserList({ type: 'following', title: 'Following' })}
            className={`text-zinc-300 ${user.isPrivate && !user.isFollowing ? 'cursor-default' : 'hover:opacity-70 transition-opacity'}`}
          >
            <strong className="text-white">{user.following?.length || 0}</strong> following
          </button>
        </div>


        {/* Bio */}
        {user.bio && <p className="mb-10 text-zinc-200 text-sm whitespace-pre-wrap">{user.bio}</p>}

        {/* Grid Posts or Private Message */}
        {user.isPrivate && !user.isFollowing ? (
          <div className="flex flex-col items-center justify-center py-20 border-t border-zinc-800">
            <div className="w-16 h-16 rounded-full border border-zinc-700 flex items-center justify-center mb-4">
              <FaLock className="text-zinc-500 scale-125" />
            </div>
            <h3 className="font-bold text-lg">This account is private</h3>
            <p className="text-zinc-500 text-sm">Follow this account to see their photos and videos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-4 border-t border-zinc-800 pt-10">
            {posts.map((post) => (
              <div
                key={post._id}
                className="relative group aspect-square bg-zinc-900 overflow-hidden cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <img
                  src={post.image}
                  alt="post"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 font-bold">
                  <span className="flex items-center gap-1"><FaHeart /> {post.likes?.length || 0}</span>
                  <span className="flex items-center gap-1"><FaComment className="scale-x-[-1]" /> {post.comments?.length || 0}</span>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="col-span-3 text-center py-20 text-zinc-500">
                No posts yet.
              </div>
            )}
          </div>
        )}

      </div>

      {/* POST MODAL */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpdate={fetchUser}
        />
      )}
      {/* USER LIST MODAL */}
      {showUserList && (
        <UserListModal
          title={showUserList.title}
          type={showUserList.type}
          userId={user._id}
          onClose={() => setShowUserList(null)}
        />
      )}
    </div>
  );
}

