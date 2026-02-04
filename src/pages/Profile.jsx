import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  FaHeart,
  FaComment,
  FaTh,
  FaBookmark,
  FaUserTag,
  FaChevronDown,
  FaPlayCircle,
  FaCog,
} from "react-icons/fa";
import PostModal from "../components/PostModal";
import UserListModal from "../components/UserListModal";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=User";

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showUserList, setShowUserList] = useState(null); // { type: 'followers' | 'following', title: string }


  const fetchProfile = async () => {
    try {
      const [userRes, postsRes, savedRes] = await Promise.all([
        api.get("/users/me"),
        api.get("/posts/me"),
        api.get("/posts/saved")
      ]);

      setUser(userRes.data);
      setPosts(postsRes.data || []);
      setSavedPosts(savedRes.data || []);
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authUser) return;
    fetchProfile();
  }, [authUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-center text-zinc-400 mt-10">
        User not found
      </p>
    );
  }

  const reels = posts.filter(p => p.type === 'reel' || p.video);
  const displayedPosts =
    activeTab === "reels" ? reels :
      activeTab === "saved" ? savedPosts :
        posts; // 'posts' tab shows all (or you could filter out reels if preferred)

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* HEADER */}
      {/* HEADER */}
      <div className="flex flex-col mb-8 md:mb-10" id="profile-header">

        {/* MOBILE VIEW (MD Hidden) */}
        <div className="md:hidden">
          {/* Top Bar: Username + Menu */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{user.username}</h2>
            <button className="text-white"><FaCog size={20} /></button>
          </div>

          <div className="flex items-center gap-6 mb-4">
            {/* Avatar */}
            <div className="shrink-0">
              <img
                src={user.avatar || DEFAULT_AVATAR}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover border border-zinc-800"
              />
            </div>
            {/* Stats */}
            <div className="flex-1 flex justify-around text-center">
              <div className="flex flex-col">
                <strong className="font-bold text-white text-lg">{posts.length}</strong>
                <span className="text-zinc-400 text-sm">posts</span>
              </div>
              <button onClick={() => setShowUserList({ type: 'followers', title: 'Followers' })} className="flex flex-col">
                <strong className="font-bold text-white text-lg">{user.followers?.length || 0}</strong>
                <span className="text-zinc-400 text-sm">followers</span>
              </button>
              <button onClick={() => setShowUserList({ type: 'following', title: 'Following' })} className="flex flex-col">
                <strong className="font-bold text-white text-lg">{user.following?.length || 0}</strong>
                <span className="text-zinc-400 text-sm">following</span>
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="text-sm mb-4 px-1">
            {user.fullName && <h3 className="font-bold">{user.fullName}</h3>}
            <p className="whitespace-pre-wrap text-zinc-100">{user.bio}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              to="/edit-profile"
              className="flex-1 bg-zinc-800 text-white text-center py-1.5 rounded-lg text-sm font-semibold"
            >
              Edit profile
            </Link>
            <button className="flex-1 bg-zinc-800 text-white text-center py-1.5 rounded-lg text-sm font-semibold">
              Share profile
            </button>
          </div>
        </div>

        {/* DESKTOP VIEW (Hidden on Mobile) */}
        <div className="hidden md:flex gap-14 items-start">
          {/* Avatar */}
          <div className="shrink-0">
            <img
              src={user.avatar || DEFAULT_AVATAR}
              alt="avatar"
              className="w-36 h-36 rounded-full object-cover border border-zinc-800"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-5">
            {/* Top Row: Username + Edit Button */}
            <div className="flex flex-row items-center gap-4">
              <h2 className="text-2xl font-light">{user.username}</h2>
              <div className="flex gap-2">
                <Link
                  to="/edit-profile"
                  className="bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 rounded-lg font-semibold text-sm transition-colors"
                  id="edit-profile-btn"
                >
                  Edit profile
                </Link>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex gap-8">
              <span>
                <strong className="font-bold text-white">{posts.length}</strong> <span className="text-zinc-300">posts</span>
              </span>
              <button
                onClick={() => setShowUserList({ type: 'followers', title: 'Followers' })}
                className="hover:opacity-70 transition-opacity"
              >
                <strong className="font-bold text-white">{user.followers?.length || 0}</strong> <span className="text-zinc-300">followers</span>
              </button>
              <button
                onClick={() => setShowUserList({ type: 'following', title: 'Following' })}
                className="hover:opacity-70 transition-opacity"
              >
                <strong className="font-bold text-white">{user.following?.length || 0}</strong> <span className="text-zinc-300">following</span>
              </button>
            </div>

            {/* Bio Row */}
            <div className="text-left text-sm max-w-md">
              {user.fullName && <h3 className="font-bold mb-1">{user.fullName}</h3>}
              <p className="whitespace-pre-wrap text-zinc-100">{user.bio}</p>
            </div>
          </div>
        </div>

      </div>

      {/* TABS */}
      <div className="border-t border-zinc-800 mb-6">
        <div className="flex justify-center gap-12 text-[10px] md:text-xs font-semibold uppercase text-zinc-400">
          {[
            { id: "posts", icon: <FaTh size={12} />, label: "Posts" },
            { id: "reels", icon: <FaPlayCircle size={12} />, label: "Reels" },
            { id: "saved", icon: <FaBookmark size={12} />, label: "Saved" },
            { id: "tagged", icon: <FaUserTag size={12} />, label: "Tagged" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-t ${activeTab === tab.id
                ? "border-white text-white"
                : "border-transparent"
                }`}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT GRID */}
      {activeTab === "tagged" ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full border border-zinc-700 flex items-center justify-center mx-auto mb-4">
            <FaUserTag size={30} className="opacity-20 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Photos of you</h3>
          <p className="text-zinc-500 text-sm mt-2">When people tag you in photos, they'll appear here.</p>
        </div>
      ) : displayedPosts.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          {activeTab === 'reels' ? 'No reels yet' : 'No posts yet'}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {displayedPosts.map((post) => (
            <div
              key={post._id}
              className="relative group aspect-square bg-zinc-900 overflow-hidden cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              {(post.type === 'reel' || post.video) ? (
                <video
                  src={post.video || post.image}
                  className="w-full h-full object-cover"
                />
              ) : post.image && (
                <img
                  src={post.image}
                  alt="post"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white font-bold transition-opacity duration-200">
                <span className="flex items-center gap-2">
                  <FaHeart /> {post.likes?.length || 0}
                </span>
                <span className="flex items-center gap-2">
                  <FaComment className="scale-x-[-1]" /> {post.comments?.length || 0}
                </span>
              </div>

              {/* VIDEO INDICATOR for Grid View */}
              {(post.type === 'reel' || post.video) && (
                <div className="absolute top-2 right-2 text-white drop-shadow-md">
                  <FaPlayCircle size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* POST MODAL */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpdate={fetchProfile}
        />
      )}

      {/* USER LIST MODAL (Followers/Following) */}

      {showUserList && (
        <UserListModal
          title={showUserList.title}
          type={showUserList.type}
          userId={user._id}
          onClose={() => {
            setShowUserList(null);
            fetchProfile();
          }}
          onUpdate={fetchProfile}
        />
      )}

    </div>
  );
}

