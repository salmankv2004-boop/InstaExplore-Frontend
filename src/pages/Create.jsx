import { useState, useRef } from "react";
import { FaImage, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Create() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select, 2: Finalize
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setStep(2);
    }
  };

  const handleShare = async () => {
    if (!image) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);

    try {
      await api.post("/posts", formData);
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setCaption("");
    setStep(1);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)]">
      <div className="bg-zinc-900 w-full max-w-[800px] aspect-[4/3] rounded-xl overflow-hidden flex flex-col border border-zinc-800 shadow-2xl">
        {/* HEADER */}
        <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4">
          {step === 2 ? (
            <button onClick={reset} className="text-white hover:text-zinc-400 transition-colors">
              <FaArrowLeft size={20} />
            </button>
          ) : (
            <div className="w-5" />
          )}

          <h2 className="text-white font-semibold flex-1 text-center">
            {step === 1 ? "Create new post" : "Create new post"}
          </h2>

          {step === 2 ? (
            <button
              onClick={handleShare}
              disabled={loading}
              className="text-blue-500 font-bold text-sm hover:text-white disabled:opacity-50 transition-colors"
            >
              {loading ? "Sharing..." : "Share"}
            </button>
          ) : (
            <div className="w-5" />
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 flex overflow-hidden">
          {step === 1 ? (
            /* STEP 1: SELECT IMAGE */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
              <div className="text-white opacity-80">
                <FaImage size={80} strokeWidth={1} />
              </div>
              <p className="text-xl text-zinc-300">Drag photos and videos here</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors mt-2"
              >
                Select from computer
              </button>
            </div>
          ) : (
            /* STEP 2: FINALIZE */
            <div className="flex flex-1 overflow-hidden">
              {/* IMAGE PREVIEW */}
              <div className="flex-[1.5] bg-black flex items-center justify-center border-r border-zinc-800">
                <img
                  src={preview}
                  alt="preview"
                  className="max-h-full w-full object-contain"
                />
              </div>

              {/* CAPTION SIDEBAR */}
              <div className="flex-1 flex flex-col bg-zinc-900 p-4 min-w-[300px]">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={user?.avatar || "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=User"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-semibold text-sm">{user?.username}</span>
                </div>

                <textarea
                  placeholder="Write a caption..."
                  className="flex-1 bg-transparent border-none text-zinc-100 placeholder-zinc-500 text-sm resize-none focus:ring-0 p-0"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={2200}
                />

                <div className="h-10 border-t border-zinc-800 flex items-center justify-between text-zinc-500 text-xs mt-2 pt-2">
                  <span>{caption.length}/2,200</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
