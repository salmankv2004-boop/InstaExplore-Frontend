import { useState, useRef } from "react";
import api from "../api/axios";
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile, BsImage, BsFilm } from "react-icons/bs";
import { FaGlobe, FaLock, FaTimes } from 'react-icons/fa';

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [postType, setPostType] = useState('post'); // 'post' | 'reel'
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select media");
      return;
    }

    const formData = new FormData();
    formData.append("image", file); // Backend expects 'image' field even for videos
    formData.append("caption", caption);
    formData.append("visibility", visibility);

    try {
      setLoading(true);

      await api.post("/posts", formData);

      alert(`${postType === 'reel' ? 'Reel' : 'Post'} created successfully ✅`);
      setFile(null);
      setPreview(null);
      setCaption("");
      setVisibility("public");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-black text-white p-6 rounded-lg border border-zinc-800">

      {/* TABS */}
      <div className="flex border-b border-zinc-800 mb-6">
        <button
          onClick={() => { setPostType('post'); clearFile(); }}
          className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${postType === 'post' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
        >
          <BsImage size={18} /> Post
        </button>
        <button
          onClick={() => { setPostType('reel'); clearFile(); }}
          className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${postType === 'reel' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
        >
          <BsFilm size={18} /> Reel
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4">Create {postType === 'reel' ? 'Reel' : 'Post'}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* MEDIA UPLOAD AREA */}
        <div
          className="border-2 border-dashed border-zinc-800 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900 transition-colors relative overflow-hidden min-h-[200px]"
          onClick={() => !file && fileInputRef.current?.click()}
        >
          {preview ? (
            <div className="relative w-full h-full">
              {postType === 'reel' ? (
                <video src={preview} controls className="w-full max-h-[400px] object-cover rounded" />
              ) : (
                <img src={preview} alt="Preview" className="w-full max-h-[400px] object-cover rounded" />
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-black/70"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <>
              <div className="bg-zinc-800 p-4 rounded-full mb-3">
                {postType === 'reel' ? <BsFilm size={24} /> : <BsImage size={24} />}
              </div>
              <p className="text-zinc-400 text-sm">Click to select {postType === 'reel' ? 'video' : 'photo'}</p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={postType === 'reel' ? "video/*" : "image/*"}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* CAPTION */}
        <div className="relative">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={`Write a caption for your ${postType}...`}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm min-h-[100px] outline-none focus:border-zinc-700 transition-colors resize-none"
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute bottom-3 right-3 text-zinc-400 hover:text-white transition-colors"
          >
            <BsEmojiSmile size={20} />
          </button>

          {showEmojiPicker && (
            <div className="absolute top-full left-0 z-50 mt-2">
              <EmojiPicker
                theme="dark"
                onEmojiClick={(emojiData) => {
                  setCaption(prev => prev + emojiData.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
        </div>

        {/* VISIBILITY SELECTOR */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setVisibility('public')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${visibility === 'public'
              ? 'border-blue-500 bg-blue-500/10 text-blue-400'
              : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
              }`}
          >
            <FaGlobe size={14} /> Public
          </button>
          <button
            type="button"
            onClick={() => setVisibility('private')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${visibility === 'private'
              ? 'border-green-500 bg-green-500/10 text-green-400'
              : 'border-zinc-800 text-zinc-400 hover:bg-zinc-900'
              }`}
          >
            <FaLock size={14} /> Followers
          </button>
        </div>

        {/* SUBMIT */}
        <button
          disabled={loading || !file}
          className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {loading ? "Posting..." : "Share"}
        </button>
      </form>
    </div>
  );
}
