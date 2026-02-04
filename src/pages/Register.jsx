import { useState } from "react";
import { useNavigate, Navigate, Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAddingAccount = searchParams.get("addAccount") === "true";

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated && !isAddingAccount) return <Navigate to="/" replace />;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-sm bg-black border border-zinc-800 p-8 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-4 italic tracking-tighter">InstaExplore</h1>
        <p className="text-zinc-500 text-center font-bold text-sm mb-8 leading-tight">
          Sign up to see photos and videos from your friends.
        </p>

        {isAddingAccount && (
          <div className="mb-6 p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg text-blue-400 text-xs text-center font-medium">
            Creating a new account to add to your switcher
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="username" placeholder="Username" onChange={handleChange} />
          <Input name="email" type="email" placeholder="Email" onChange={handleChange} />
          <Input name="password" type="password" placeholder="Password" onChange={handleChange} />
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
          />

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <button
            disabled={loading}
            className="w-full py-2.5 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-8">
          Have an account?{" "}
          <Link to={`/login${isAddingAccount ? '?addAccount=true' : ''}`} className="text-blue-500 font-bold hover:text-blue-400 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Input({ type = "text", ...props }) {
  return (
    <input
      type={type}
      required
      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md focus:border-zinc-500 outline-none text-sm transition-all text-white placeholder-zinc-500"
      {...props}
    />
  );
}
