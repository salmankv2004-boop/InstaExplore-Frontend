import { useState, useEffect, useRef } from "react";
import { FaHeart, FaRegHeart, FaRegComment, FaRegBookmark, FaBookmark, FaRegPaperPlane, FaTimes, FaEllipsisH } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Comment from "./Comment";
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from "react-icons/bs";



const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=User";

export default function PostModal({ post: initialPost, onClose, onUpdate }) {
    const [post, setPost] = useState(initialPost);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [saved, setSaved] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [loadingComment, setLoadingComment] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const { user: authUser } = useAuth();


    const commentInputRef = useRef(null);

    useEffect(() => {
        if (post) {
            setLiked(post.isLiked);
            setLikesCount(post.likes?.length || 0);
            setSaved(post.isSaved);
        }
    }, [post]);

    const toggleLike = async () => {
        const prevLiked = liked;
        const prevCount = likesCount;
        setLiked(!prevLiked);
        setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

        try {
            await api.post(`/posts/${post._id}/like`);
            if (onUpdate) onUpdate();
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
            if (onUpdate) onUpdate();
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
            setPost({ ...post, comments: data });
            setCommentText("");
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingComment(false);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.delete(`/posts/${post._id}`);
            onClose(); // Close modal
            if (onUpdate) onUpdate(); // Refresh parent list
        } catch (err) {
            console.error("Failed to delete post:", err);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.origin + `/post/${post._id}`);
        setShowOptions(false);
        alert("Link copied to clipboard!");
    };

    const handleCommentIconClick = () => {
        commentInputRef.current?.focus();
    };

    if (!post) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            {/* Close Button (Visible on all screens now, top right) */}
            <button className="absolute top-6 right-6 text-white hover:text-zinc-300 z-50 transition-colors" onClick={onClose}>
                <FaTimes size={28} />
            </button>

            <div
                className="bg-black w-full max-w-[1000px] h-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden border border-zinc-800 rounded-sm"
                onClick={(e) => e.stopPropagation()}
            >
                {/* VIDEO / IMAGE SIDE */}
                <div className="flex-[1.5] bg-black flex items-center justify-center h-[40vh] md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900">
                    {(post.type === 'reel' || post.video) ? (
                        <video
                            src={post.video || post.image}
                            className="max-h-full max-w-full object-contain w-full h-full"
                            controls
                            autoPlay
                            playsInline
                        />
                    ) : (
                        <img src={post.image} alt="post" className="max-h-full max-w-full object-contain" />
                    )}
                </div>

                {/* INFO SIDE */}
                <div className="flex-1 flex flex-col bg-black min-w-[350px]">
                    {/* Header */}
                    <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={post.user?.avatar || DEFAULT_AVATAR}
                                alt="avatar"
                                className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                            />
                            <Link to={`/user/${post.user?._id}`} className="font-semibold text-sm hover:text-zinc-400 transition-colors">
                                {post.user?.username}
                            </Link>
                        </div>
                        <button className="text-white hover:text-zinc-400" onClick={() => setShowOptions(true)}>
                            <FaEllipsisH size={20} className="cursor-pointer" />
                        </button>
                    </div>

                    {/* Comments Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {/* Caption as first comment */}
                        {post.caption && (
                            <div className="flex gap-3">
                                <img src={post.user?.avatar || DEFAULT_AVATAR} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                <div className="text-sm">
                                    <Link to={`/user/${post.user?._id}`} className="font-semibold mr-2">{post.user?.username}</Link>
                                    <span className="text-zinc-200">{post.caption}</span>
                                </div>
                            </div>
                        )}

                        {/* Actual Comments */}
                        {post.comments?.map(comment => (
                            <Comment
                                key={comment._id}
                                comment={comment}
                                postId={post._id}
                                postOwnerId={post.user?._id}
                                onUpdate={(updatedComments) => {
                                    setPost({ ...post, comments: updatedComments });
                                    if (onUpdate) onUpdate();
                                }}
                                onReply={(username) => {
                                    setCommentText(`@${username} `);
                                    document.getElementById(`modal-comment-input-${post._id}`)?.focus();
                                }}
                            />
                        ))}
                    </div>

                    {/* Actions & Likes */}
                    <div className="p-4 border-t border-zinc-900">
                        <div className="flex items-center gap-4 text-2xl mb-2">
                            <button onClick={toggleLike}>
                                {liked ? <FaHeart className="text-red-500 scale-110" /> : <FaRegHeart className="hover:text-zinc-400" />}
                            </button>
                            <FaRegComment className="hover:text-zinc-400 cursor-pointer" onClick={handleCommentIconClick} />
                            <FaRegPaperPlane className="hover:text-zinc-400 cursor-pointer" />
                            <button onClick={toggleSave} className="ml-auto">
                                {saved ? <FaBookmark className="text-white" /> : <FaRegBookmark className="hover:text-zinc-400" />}
                            </button>
                        </div>
                        <p className="font-semibold text-sm">{likesCount.toLocaleString()} likes</p>
                        <p className="text-[10px] text-zinc-500 uppercase mt-1">1 day ago</p>
                    </div>

                    {/* Add Comment */}
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
                        <form onSubmit={handleAddComment} className="p-4 border-t border-zinc-900 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                <BsEmojiSmile size={18} />
                            </button>
                            <input
                                ref={commentInputRef}
                                id={`modal-comment-input-${post._id}`}
                                type="text"
                                placeholder="Add a comment..."
                                className="flex-1 bg-transparent text-sm outline-none placeholder-zinc-500 text-white"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || loadingComment}
                                className="text-blue-500 font-bold text-sm disabled:opacity-30 hover:text-white"
                            >
                                Post
                            </button>
                        </form>
                    </div>

                </div>
            </div>

            {/* OPTIONS MODAL */}
            {showOptions && (
                <div
                    className="absolute inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
                    onClick={() => setShowOptions(false)}
                >
                    <div
                        className="bg-zinc-800 w-[300px] md:w-[400px] rounded-xl overflow-hidden shadow-2xl animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Only show Delete if it's the current user's post */}
                        {authUser?._id === post.user?._id && (
                            <button
                                onClick={handleDeletePost}
                                className="w-full py-3.5 text-center font-bold text-red-500 hover:bg-zinc-700 border-b border-zinc-700 transition-colors text-sm"
                            >
                                Delete
                            </button>
                        )}

                        {/* Always show Copy Link, etc. */}
                        <button
                            onClick={handleCopyLink}
                            className="w-full py-3.5 text-center text-white hover:bg-zinc-700 border-b border-zinc-700 transition-colors text-sm"
                        >
                            Copy link
                        </button>
                        <button
                            onClick={() => setShowOptions(false)}
                            className="w-full py-3.5 text-center text-white hover:bg-zinc-700 border-b border-zinc-700 transition-colors text-sm"
                        >
                            Go to post
                        </button>

                        <button
                            onClick={() => setShowOptions(false)}
                            className="w-full py-3.5 text-center text-white hover:bg-zinc-700 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
