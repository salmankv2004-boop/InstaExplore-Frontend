import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">

      <Navbar />

      <div className="flex pt-16">
        {/* SIDEBAR */}
        <aside className="hidden lg:block w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-zinc-800">
          <Sidebar />
        </aside>

        {/* CONTENT */}
        <main className="flex-1 lg:ml-64 pb-16 lg:pb-0">
          <div className="max-w-4xl mx-auto px-0 lg:px-4 py-0 lg:py-6">
            {children}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
