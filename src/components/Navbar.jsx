import { Link, useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";


export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-zinc-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="text-xl font-bold">
          InstaExplore
        </Link>

        <div
          onClick={() => navigate("/search")}
          className="hidden md:flex items-center w-64 px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 cursor-text"
        >
          <FaSearch className="mr-2 text-xs" />
          <span className="text-sm">Search</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Right side items removed as requested */}
        </div>
      </div>
    </header>
  );
}
