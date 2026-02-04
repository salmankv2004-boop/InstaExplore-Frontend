import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">

      <Navbar />

      <div className="flex pt-16">
        {/* SIDEBAR */}
        <aside className="hidden md:block w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-zinc-800">
          <Sidebar />
        </aside>

        {/* CONTENT */}
        <main className="flex-1 md:ml-64 pb-16 md:pb-0">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
