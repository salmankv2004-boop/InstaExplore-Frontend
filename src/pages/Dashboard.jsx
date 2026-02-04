import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaChartLine, FaUsers, FaEye, FaRegCalendarAlt, FaChevronRight, FaInfoCircle } from "react-icons/fa";

export default function Dashboard() {
    const navigate = useNavigate();

    const stats = [
        { label: "Accounts reached", value: "1,248", change: "+12.4%", color: "text-blue-500" },
        { label: "Accounts engaged", value: "245", change: "+5.1%", color: "text-purple-500" },
        { label: "Total followers", value: "892", change: "+2.3%", color: "text-green-500" },
    ];

    const topContent = [
        { type: "Post", date: "Jan 24", reach: "452", likes: "128" },
        { type: "Reel", date: "Jan 22", reach: "893", likes: "245" },
        { type: "Story", date: "Jan 21", reach: "312", likes: "45" },
    ];

    return (
        <div className="max-w-[800px] mx-auto p-4 md:p-8 text-white min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-zinc-900 rounded-full transition-colors"
                >
                    <FaArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold">Professional dashboard</h1>
            </div>

            {/* Account Insights Section */}
            <section className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold">Account Insights</h2>
                        <p className="text-zinc-500 text-sm">Last 30 days</p>
                    </div>
                    <button className="text-blue-500 text-sm font-semibold hover:text-white transition-colors">See all</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            <span className="text-zinc-400 text-sm font-medium">{stat.label}</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold italic">{stat.value}</span>
                                <span className={`${stat.color} text-xs font-bold`}>{stat.change}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mock Chart Area */}
                <div className="mt-8 h-40 w-full bg-zinc-800/20 rounded-xl border border-dashed border-zinc-700 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 flex items-end justify-between px-4 pb-2 opacity-50">
                        {[40, 70, 45, 90, 65, 80, 50, 85, 95, 75].map((h, i) => (
                            <div
                                key={i}
                                style={{ height: `${h}%` }}
                                className="w-4 bg-blue-500 rounded-t-sm transition-all duration-500 group-hover:bg-blue-400"
                            />
                        ))}
                    </div>
                    <div className="z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-700 flex items-center gap-2">
                        <FaChartLine className="text-blue-500" />
                        <span className="text-xs font-bold uppercase tracking-wider">Account Reach Trend</span>
                    </div>
                </div>
            </section>

            {/* Tools Area */}
            <h3 className="font-bold mb-4 px-2">Your Tools</h3>
            <div className="space-y-3 mb-8">
                <ToolItem icon={<FaUsers />} title="Ad Tools" desc="Create and manage ads to reach more people." />
                <ToolItem icon={<FaRegCalendarAlt />} title="Content Scheduling" desc="Plan and schedule your future posts." />
                <ToolItem icon={<FaInfoCircle />} title="Help Center" desc="Get support and learning resources." />
            </div>

            {/* Recent Content Performance */}
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold">Content Performance</h3>
                <button className="text-blue-500 text-sm font-semibold">See all</button>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                {topContent.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-zinc-800 last:border-none hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold">{item.type} • {item.date}</p>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-zinc-500 flex items-center gap-1"><FaEye size={10} /> {item.reach} reach</span>
                                <span className="text-xs text-zinc-500 flex items-center gap-1 font-bold"><FaChartLine size={10} /> Insights</span>
                            </div>
                        </div>
                        <FaChevronRight className="text-zinc-600 group-hover:text-white transition-colors" />
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-bold">
                Professional Dashboard • Meta 2026
            </div>
        </div>
    );
}

function ToolItem({ icon, title, desc }) {
    return (
        <div className="flex items-center gap-4 p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold">{title}</p>
                <p className="text-xs text-zinc-500">{desc}</p>
            </div>
            <FaChevronRight className="text-zinc-600 group-hover:text-white" size={12} />
        </div>
    );
}
