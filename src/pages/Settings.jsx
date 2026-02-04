import { useState, useEffect } from "react";
import { FaShieldAlt, FaLock, FaUserShield, FaKey, FaHistory, FaChevronRight, FaTimes, FaCheck, FaUser } from "react-icons/fa";
import { MdPrivacyTip, MdSecurity, MdDevices } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function Settings() {
    const [activeTab, setActiveTab] = useState("accounts_center");
    const { user, setUser } = useAuth();

    const handleSettingsUpdate = async (updates) => {
        try {
            const res = await api.put("/users/privacy", updates);
            setUser({ ...user, ...res.data.user });
            toast.success("Settings updated");
        } catch (err) {
            toast.error("Failed to update settings");
        }
    };

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* Settings Sidebar */}
            <div className="w-1/3 max-w-sm border-r border-zinc-800 p-6 hidden md:block">
                <h2 className="text-2xl font-bold mb-8 px-2 tracking-tighter italic">Settings</h2>

                {/* Meta-style Accounts Center Card */}
                <div
                    onClick={() => setActiveTab("accounts_center")}
                    className={`mb-8 p-4 rounded-xl border transition-all cursor-pointer shadow-lg ${activeTab === "accounts_center" ? "bg-zinc-900 border-zinc-700" : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50"}`}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-sm flex items-center justify-center text-[10px] font-bold">M</div>
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Accounts Center</span>
                    </div>
                    <p className="text-sm font-semibold mb-1">Password, security, personal details</p>
                    <p className="text-xs text-zinc-500">Manage your connected experiences and account settings across Social apps.</p>
                </div>

                <div className="flex flex-col gap-1">
                    <p className="px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 mt-4">How you use Social</p>
                    <button
                        onClick={() => setActiveTab("privacy")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === "privacy" ? "bg-zinc-900 text-white font-semibold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                            }`}
                    >
                        <MdPrivacyTip size={22} />
                        <span>Account Privacy</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("follow_requests")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === "follow_requests" ? "bg-zinc-900 text-white font-semibold" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                            }`}
                    >
                        <FaUserShield size={20} />
                        <span>Follow Requests</span>
                    </button>

                    <p className="px-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 mt-6">Who can see your content</p>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all text-left">
                        <FaTimes size={18} />
                        <span>Blocked</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-xl mx-auto">
                    {activeTab === "accounts_center" && <AccountsCenter user={user} onUpdate={handleSettingsUpdate} />}
                    {activeTab === "privacy" && <PrivacySettings user={user} onUpdate={handleSettingsUpdate} />}
                    {activeTab === "follow_requests" && <FollowRequests />}
                </div>
            </div>
        </div>
    );
}

function AccountsCenter({ user, onUpdate }) {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            await api.put("/auth/change-password", passwords);
            toast.success("Password updated successfully");
            setIsChangingPassword(false);
            setPasswords({ currentPassword: "", newPassword: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update password");
        }
    };

    return (
        <div className="space-y-8 fade-in">
            <div>
                <h3 className="text-2xl font-bold mb-2">Accounts Center</h3>
                <p className="text-zinc-400 text-sm">Manage your account settings and security in one place.</p>
            </div>

            {/* Account Settings Group */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Account Settings</h4>

                {/* Security Section */}
                <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
                    <div
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                        className={`p-4 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors cursor-pointer group ${isChangingPassword ? 'bg-zinc-800/50' : ''}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-zinc-700">
                                    <FaLock className="text-lg text-zinc-300" />
                                </div>
                                <div>
                                    <p className="font-semibold">Password and Security</p>
                                    <p className="text-xs text-zinc-500">Change password, 2FA, login alerts</p>
                                </div>
                            </div>
                            <FaChevronRight className={`text-zinc-600 transition-transform ${isChangingPassword ? 'rotate-90' : ''}`} />
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {isChangingPassword && (
                            <form onSubmit={handlePasswordChange} className="space-y-4 pb-6 border-b border-zinc-800/50">
                                <h5 className="font-medium text-sm">Change Password</h5>
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    required
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:border-white transition-colors outline-none"
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    required
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:border-white transition-colors outline-none"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                />
                                <button type="submit" className="w-full bg-white text-black font-bold py-2 rounded-lg text-sm hover:bg-zinc-200 transition-colors">
                                    Update Password
                                </button>
                            </form>
                        )}

                        {/* 2FA Toggle inside Security */}
                        <div className="flex justify-between items-center">
                            <div>
                                <h5 className="font-medium">Two-Factor Authentication</h5>
                                <p className="text-xs text-zinc-500">We'll ask for a login code if we see an attempted login from an unrecognized device.</p>
                            </div>
                            <Toggle checked={user?.twoFactorEnabled} onChange={() => onUpdate({ twoFactorEnabled: !user?.twoFactorEnabled })} />
                        </div>

                        <div className="pt-4 border-t border-zinc-800/50">
                            <h5 className="font-medium mb-3">Where you're logged in</h5>
                            <LoginActivity />
                        </div>
                    </div>
                </div>

                {/* Personal Details Section */}
                <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-zinc-700">
                                <FaUser className="text-lg text-zinc-300" />
                            </div>
                            <div>
                                <p className="font-semibold">Personal Details</p>
                                <p className="text-xs text-zinc-500">Contact info, birthday, identity confirmation</p>
                            </div>
                        </div>
                        <FaChevronRight className="text-zinc-600" />
                    </div>
                </div>
            </div>
        </div>
    );
}


function PrivacySettings({ user, onUpdate }) {
    return (
        <div className="space-y-8 fade-in">
            <h3 className="text-3xl font-bold mb-6">Account Privacy</h3>

            {/* Account Privacy */}
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg">
                            <FaLock className="text-xl" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg">Private Account</h4>
                            <p className="text-zinc-400 text-sm max-w-md">
                                When your account is private, only people you approve can see your photos and videos. Your existing followers won't be affected.
                            </p>
                        </div>
                    </div>
                    <Toggle checked={user?.isPrivate} onChange={() => onUpdate({ isPrivate: !user?.isPrivate })} />
                </div>
            </div>

            {/* Interactions */}
            <div className="space-y-2">
                <h4 className="text-zinc-500 font-semibold uppercase text-xs tracking-wider mb-3 ml-1">Interactions</h4>
                <ActionRow label="Blocked Accounts" icon={<FaTimes />} />
                <ActionRow label="Muted Accounts" icon={<FaShieldAlt />} />
                <ActionRow label="Close Friends" icon={<FaCheck />} />
            </div>
        </div>
    );
}

function FollowRequests() {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                // Since user object has followRequests IDs, we need to populate them
                // Or have a specific route. Let's assume a route for now or fetch user again.
                const res = await api.get("/auth/me");
                // For simplicity in this demo, I'll just use the IDs or a dummy list if not populated
                // Ideally the backend should return populated requests.
                // Let's assume the me route returns populated ones now or we fetch them.
                setRequests(res.data.user.followRequests || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const handleRequest = async (requesterId, action) => {
        try {
            await api.post("/users/follow-request", { requesterId, action });
            setRequests(prev => prev.filter(r => r._id !== requesterId));
            toast.success(`Request ${action}ed`);
        } catch (err) {
            toast.error("Action failed");
        }
    };

    if (loading) return <div className="animate-pulse text-zinc-500">Loading requests...</div>;

    return (
        <div className="space-y-6 fade-in">
            <h3 className="text-3xl font-bold mb-6">Follow Requests</h3>
            {requests.length === 0 ? (
                <div className="text-zinc-500 text-center py-20">No pending follow requests</div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req._id} className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                            <div className="flex items-center gap-3">
                                <img src={req.avatar || "https://ui-avatars.com/api/?background=333&color=fff&name=User"} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <p className="font-bold">{req.username}</p>
                                    <p className="text-xs text-zinc-500">wants to follow you</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleRequest(req._id, "accept")} className="bg-white text-black px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-zinc-200">Confirm</button>
                                <button onClick={() => handleRequest(req._id, "decline")} className="bg-zinc-800 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-zinc-700">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


function LoginActivity() {
    return (
        <div className="space-y-6 fade-in">
            <h3 className="text-3xl font-bold mb-6">Login Activity</h3>
            <p className="text-zinc-400 mb-4">Was this you?</p>

            <div className="space-y-4">
                <LoginItem
                    device="Windows PC · Chrome"
                    location="New York, USA"
                    time="Active now"
                    isActive={true}
                />
                <LoginItem
                    device="iPhone 14 Pro · App"
                    location="Los Angeles, USA"
                    time="4 hours ago"
                    isActive={false}
                />
                <LoginItem
                    device="MacOS · Safari"
                    location="San Francisco, USA"
                    time="Yesterday"
                    isActive={false}
                />
            </div>
        </div>
    )
}

// Components

function Toggle({ checked, onChange }) {
    return (
        <button
            onClick={onChange}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${checked ? "bg-white" : "bg-zinc-700"
                }`}
        >
            <div
                className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${checked ? "translate-x-6" : "translate-x-0"
                    }`}
            />
        </button>
    );
}

function ActionRow({ label, icon }) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors group">
            <div className="flex items-center gap-3">
                <span className="text-zinc-400 group-hover:text-white transition-colors">{icon}</span>
                <span className="font-medium">{label}</span>
            </div>
            <FaChevronRight className="text-zinc-600" />
        </div>
    )
}

function LoginItem({ device, location, time, isActive }) {
    return (
        <div className="flex justify-between items-center p-4 border border-zinc-800 rounded-xl bg-zinc-900/30">
            <div className="flex gap-4">
                <div className="text-3xl text-zinc-500">
                    <MdDevices />
                </div>
                <div>
                    <h4 className="font-semibold">{device}</h4>
                    <p className="text-zinc-400 text-sm">{location} · <span className={isActive ? "text-green-500" : ""}>{time}</span></p>
                </div>
            </div>
            {isActive && <div className="text-xs bg-green-900/30 text-green-500 px-2 py-1 rounded border border-green-900">This Device</div>}
        </div>
    )
}
