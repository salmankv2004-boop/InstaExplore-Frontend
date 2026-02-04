import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAddingAccount = searchParams.get("addAccount") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Only redirect if authenticated AND NOT adding another account
  if (isAuthenticated && !isAddingAccount) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (res) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/google", {
        credential: res.credential,
      });

      login(response.data);
      navigate("/");
    } catch (err) {
      setError("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm bg-black p-8 rounded-xl border border-zinc-800 shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 italic tracking-tighter">
          InstaExplore
        </h1>

        {isAddingAccount && (
          <div className="mb-6 p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg text-blue-400 text-xs text-center font-medium">
            Adding a new account to your switcher
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-500 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Phone number, username, or email"
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-md focus:border-zinc-500 outline-none text-sm transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-md focus:border-zinc-500 outline-none text-sm transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-[1px] bg-zinc-800"></div>
          <span className="text-xs font-bold text-zinc-500">OR</span>
          <div className="flex-1 h-[1px] bg-zinc-800"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed")}
            theme="filled_black"
            shape="pill"
          />
        </div>

        <p className="mt-8 text-sm text-center text-zinc-400 font-medium">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-blue-500 font-bold hover:text-blue-400 transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
