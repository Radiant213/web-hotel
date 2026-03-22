import Link from "next/link";

export default function AdminLayout({ children }) {
    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans">
            {/* Sidebar - Modern Dark Theme */}
            <aside className="w-80 bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white flex flex-col shadow-2xl rounded-r-3xl m-4 my-4 h-[calc(100vh-2rem)] overflow-hidden border-r border-gray-700/30">
                {/* Logo & User Profile */}
                <div className="p-8 flex flex-col items-center border-b border-gray-700/50">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 flex items-center justify-center shadow-lg">
                        <span className="text-2xl">🏨</span>
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold tracking-wide bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Aura Suites</h2>
                        <p className="text-xs text-gray-400 mt-1">Exclusive Experience</p>
                    </div>
                </div>

                {/* User Info */}
                <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-700/50">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl overflow-hidden border-2 border-blue-500/30">
                        <img src="https://ui-avatars.com/api/?name=Galang+Maruf&background=0D8ABC&color=fff" alt="Admin" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-sm">Galang Maruf</h3>
                        <p className="text-xs text-gray-400">Admin Manager</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 mt-6 px-4 space-y-1">
                    <NavItem href="/admin/dashboard" icon="📊" label="Dashboard" active />
                    <NavItem href="/admin/kamar" icon="🏨" label="Room Inventory" />
                    <NavItem href="/admin/bookings" icon="📅" label="Bookings" />
                    <NavItem href="#" icon="💰" label="Revenue" />
                    <NavItem href="#" icon="👥" label="Customers" />
                    <NavItem href="#" icon="📊" label="Reports" />
                    <NavItem href="#" icon="⚙️" label="Settings" />
                </nav>

                {/* Quick Stats */}
                <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/20 rounded-2xl border border-blue-500/10">
                    <p className="text-xs text-gray-400 mb-2">Today's Revenue</p>
                    <p className="text-lg font-bold">Rp 12.5 JT</p>
                    <div className="h-2 bg-gray-700/50 rounded-full mt-2 overflow-hidden">
                        <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
                    </div>
                </div>

                {/* Logout */}
                <div className="p-6">
                    <button className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition w-full p-3 rounded-xl hover:bg-white/5 border border-gray-700/50 hover:border-gray-600/50">
                        <span className="text-sm">🚪</span>
                        <span className="text-sm font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-transparent">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse"></div>
                            <h1 className="text-2xl font-bold text-gray-800">Hotel Management System</h1>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">Real-time dashboard & analytics</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                🔍
                            </div>
                            <input
                                type="text"
                                placeholder="Search rooms, bookings..."
                                className="bg-white pl-12 pr-4 py-3 rounded-xl outline-none text-sm w-64 shadow-sm border border-gray-200 focus:border-blue-300 transition"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <span className="text-lg">🔔</span>
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"></div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    <div className="space-y-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, label, active = false }) {
    return (
        <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? "bg-gradient-to-r from-blue-500/20 to-purple-500/10 text-white border-l-4 border-blue-400 shadow-lg"
            : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}>
            <span className={`text-lg transition-transform group-hover:scale-110 ${active ? 'text-blue-300' : ''}`}>{icon}</span>
            <span className="font-medium">{label}</span>
            {active && (
                <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 animate-pulse"></div>
            )}
        </Link>
    );
}