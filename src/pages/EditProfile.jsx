import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user.username);
  const [fullName, setFullName] = useState(user.fullName || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("fullName", fullName);
      formData.append("bio", bio);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await api.put("/users/me", formData);

      setUser((prev) => ({ ...prev, ...res.data }));
      toast.success("Profile updated!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-10">
      <h2 className="text-2xl font-bold mb-10 text-white">Edit Profile</h2>

      <div className="bg-transparent md:bg-zinc-900 md:border border-zinc-800 md:rounded-2xl md:p-10">
        <form onSubmit={submit} className="space-y-8">

          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <img
              src={avatarPreview || "https://ui-avatars.com/api/?background=333&color=fff&name=" + username}
              className="w-16 h-16 rounded-full object-cover border-2 border-zinc-800"
              alt="avatar"
            />
            <div>
              <p className="font-bold text-white leading-none mb-1">{username}</p>
              <label htmlFor="avatar-upload" className="text-blue-500 text-sm font-bold cursor-pointer hover:text-white transition-colors">
                Change profile photo
              </label>
              <input
                id="avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-400">Name</label>
              <input
                type="text"
                className="w-full bg-black border border-zinc-800 rounded-lg py-2 px-4 text-white focus:border-zinc-600 outline-none transition-colors"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
              />
              <p className="text-[10px] text-zinc-500 mt-2">Help people discover your account by using the name you're known by: either your full name, nickname, or business name.</p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-400">Username</label>
              <input
                type="text"
                className="w-full bg-black border border-zinc-800 rounded-lg py-2 px-4 text-white focus:border-zinc-600 outline-none transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-400">Bio</label>
              <textarea
                className="w-full bg-black border border-zinc-800 rounded-lg py-2 px-4 text-white focus:border-zinc-600 outline-none transition-colors min-h-[100px]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-zinc-500">{bio.length} / 150</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded-lg disabled:opacity-50 transition-all"
            >
              {loading ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
