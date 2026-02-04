import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaRegBookmark,
  FaBookmark,
  FaRegPaperPlane,
  FaEllipsisH,
  FaLock,
  FaGlobe
} from "react-icons/fa";
import Comment from "./Comment";
import api from "../api/axios";
import ShareModal from "./ShareModal";
import FollowButton from "./FollowButton";
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from "../context/AuthContext";

import { BsEmojiSmile } from "react-icons/bs";



const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=User";

export default function PostCard({ post }) {
  if (!post) return null;
  const { user: authUser } = useAuth();

  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [saved, setSaved] = useState(post.isSaved);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [comments, setComments] = useState(post.comments || []);

  const [commentText, setCommentText] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);


  const toggleLike = async () => {
    const prevLiked = liked;
    const prevCount = likesCount;

    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      await api.post(`/posts/${post._id}/like`);
    } catch (err) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const toggleSave = async () => {
    const prevSaved = saved;
    setSaved(!prevSaved);
    try {
      await api.post(`/posts/${post._id}/save`);
    } catch (err) {
      setSaved(prevSaved);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || loadingComment) return;

    setLoadingComment(true);
    try {
      const { data } = await api.post(`/posts/${post._id}/comment`, { text: commentText });
      setComments(data);
      setCommentText("");
      setShowComments(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComment(false);
    }
  };

  return (
    <div className="w-full max-w-[470px] bg-black border border-zinc-900 rounded-sm mb-4">

      {/* HEADER */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Link to={`/user/${post.user?._id}`} className="shrink-0">
            <img
              src={post.user?.avatar || DEFAULT_AVATAR}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border border-zinc-800"
            />
          </Link>
          <div className="flex items-center gap-1.5">
            <Link to={`/user/${post.user?._id}`} className="font-semibold text-sm hover:text-zinc-400 transition-colors">
              {post.user?.username || "User"}
            </Link>
            {authUser?._id !== post.user?._id && (
              <>
                <span className="text-zinc-500 text-sm">•</span>
                <div className="scale-75 origin-left">
                  <FollowButton
                    userId={post.user?._id}
                    isFollowing={post.user?.isFollowing}
                  />
                </div>
              </>
            )}
            <span className="text-zinc-500 text-sm">• 1d</span>
            {post.visibility === 'private' ? (
              <FaLock size={12} className="text-zinc-500 ml-1" title="Followers only" />
            ) : (
              <FaGlobe size={12} className="text-zinc-500 ml-1" title="Public" />
            )}
          </div>
        </div>
        <button className="text-white hover:text-zinc-400">
          <FaEllipsisH size={14} />
        </button>
      </div>


      {/* MEDIA */}
      <div className="w-full aspect-square bg-zinc-900 flex items-center justify-center relative">
        {(post.type === 'reel' || post.video) ? (
          <video
            src={post.video || post.image}
            className="w-full h-full object-cover"
            controls
            playsInline
            loop
          />
        ) : (
          post.image && (
            <img
              src={post.image}
              alt="post"
              className="w-full h-full object-cover"
            />
          )
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col gap-2 p-3 pb-2">
        <div className="flex items-center gap-4 text-[24px]">
          <button onClick={toggleLike} className="transition-transform active:scale-125">
            {liked ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="hover:text-zinc-400 transition-colors" />
            )}
          </button>

          <button onClick={() => setShowComments((v) => !v)} className="hover:text-zinc-400 transition-colors">
            <FaRegComment />
          </button>

          <button onClick={() => setShowShare(true)} className="hover:text-zinc-400 transition-colors">
            <FaRegPaperPlane />
          </button>

          <button onClick={toggleSave} className="ml-auto hover:text-zinc-400 transition-colors">
            {saved ? <FaBookmark className="text-white" /> : <FaRegBookmark />}
          </button>
        </div>

        {/* LIKES */}
        <div className="font-semibold text-sm">
          {likesCount.toLocaleString()} likes
        </div>

        {/* CAPTION */}
        {post.caption && (
          <div className="text-sm mt-1">
            <Link to={`/user/${post.user?._id}`} className="font-semibold mr-2">
              {post.user?.username}
            </Link>
            <span className="text-zinc-200">{post.caption}</span>
          </div>
        )}

        {/* VIEW ALL COMMENTS CALLOUT */}
        {comments.length > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-zinc-500 text-sm text-left mt-1 hover:text-zinc-400 w-fit"
          >
            View all {comments.length} comments
          </button>
        )}
      </div>

      {/* COMMENTS SECTION */}
      {showComments && (
        <div className="px-3 pb-3 flex flex-col gap-2 max-h-[200px] overflow-y-auto scrollbar-hide">
          {comments.map((c) => (
            <Comment
              key={c._id}
              comment={c}
              postId={post._id}
              postOwnerId={post.user?._id}
              onUpdate={(updatedComments) => setComments(updatedComments)}
              onReply={(username) => {
                setCommentText(`@${username} `);
                // Ideally focus input here, but ref is needed. 
                // If I can't easily add ref due to chunk editing, I'll update comment text only.
                // But I will try to add ref in next step.
                document.getElementById(`comment-input-${post._id}`)?.focus();
              }}
            />
          ))}
        </div>
      )}

      {/* ADD COMMENT FORM */}
      <div className="relative">
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 z-50 mb-2">
            <EmojiPicker
              theme="dark"
              onEmojiClick={(emojiData) => {
                setCommentText(prev => prev + emojiData.emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}
        <form onSubmit={handleAddComment} className="border-t border-zinc-900 p-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <BsEmojiSmile size={18} />
          </button>
          <input
            id={`comment-input-${post._id}`}
            type="text"
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm placeholder-zinc-500 outline-none text-white"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="submit"
            disabled={!commentText.trim() || loadingComment}
            className="text-blue-500 font-semibold text-sm disabled:opacity-30 hover:text-white transition-colors"
          >
            Post
          </button>
        </form>
      </div>


      {/* SHARE MODAL */}
      {showShare && (
        <ShareModal post={post} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

