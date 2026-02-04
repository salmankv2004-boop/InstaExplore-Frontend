import { FaRegHeart, FaTrash, FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Comment({ comment, postId, postOwnerId, onUpdate, onReply }) {
  const { user: authUser } = useAuth();
  if (!comment || !comment.user) return null;

  const isOwner = authUser?._id === comment.user._id;
  const isPostOwner = authUser?._id === postOwnerId;
  const canDelete = isOwner || isPostOwner;

  const liked = comment.likes?.includes(authUser?._id);
  const likesCount = comment.likes?.length || 0;

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const { data } = await api.delete(`/posts/${postId}/comment/${comment._id}`);
      if (onUpdate) onUpdate(data);
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment");
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${postId}/comment/${comment._id}/like`);
      if (onUpdate) onUpdate(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-start gap-3 group px-2 py-1">
      {/* Avatar */}
      <Link to={`/user/${comment.user._id}`} className="shrink-0">
        <img
          src={comment.user.avatar || "https://ui-avatars.com/api/?background=333&color=fff&name=?"}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover mt-0.5 border border-zinc-800"
        />
      </Link>

      {/* Comment Content */}
      <div className="flex-1 text-sm leading-tight">
        <div>
          <Link to={`/user/${comment.user._id}`} className="font-semibold mr-2 hover:text-zinc-400 transition-colors">
            {comment.user.username}
          </Link>
          <span className="text-zinc-200">{comment.text}</span>
        </div>

        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500 font-medium">
          <span>1d</span>
          {/* Note: In a real app we'd use timeAgo(comment.createdAt) */}

          {likesCount > 0 && <span>{likesCount} like{likesCount !== 1 && 's'}</span>}

          <button
            onClick={() => onReply && onReply(comment.user.username)}
            className="hover:text-zinc-300"
          >
            Reply
          </button>

          {canDelete && (
            <button
              onClick={handleDelete}
              className="text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-2"
              title="Delete comment"
            >
              <FaTrash size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Like Button (Instagram Style) */}
      <button
        onClick={handleLike}
        className="mt-2 transition-transform active:scale-125"
      >
        {liked ? (
          <FaHeart size={12} className="text-red-500" />
        ) : (
          <FaRegHeart size={12} className="text-zinc-500 hover:text-zinc-400" />
        )}
      </button>
    </div>
  );
}
