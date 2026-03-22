"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export default function DashboardPage() {
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomsRes, bookingsRes] = await Promise.all([
                    fetch("/api/rooms"),
                    fetch("/api/bookings"),
                ]);
                const roomsData = await roomsRes.json();
                const bookingsData = await bookingsRes.json();
                setRooms(roomsData);
                setBookings(bookingsData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalRooms = rooms.length;
    const activeBookings = bookings.filter(b => ["PENDING", "PAID"].includes(b.paymentStatus)).length;
    const totalRevenue = bookings.filter(b => !["CANCELLED", "REFUNDED"].includes(b.paymentStatus)).reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const pendingCount = bookings.filter(b => b.paymentStatus === "PENDING").length;

    const recentBookings = bookings.slice(0, 5);

    const roomTypeMap = {};
    rooms.forEach(r => {
        roomTypeMap[r.type] = (roomTypeMap[r.type] || 0) + 1;
    });
    const roomTypes = Object.entries(roomTypeMap).map(([type, count]) => ({ type, count }));
    const typeColors = [
        "from-blue-500 to-cyan-400",
        "from-purple-500 to-pink-400",
        "from-green-500 to-emerald-400",
        "from-amber-500 to-orange-400",
        "from-red-500 to-rose-400",
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-4">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Welcome back, Admin 👋</h2>
                    <p className="text-gray-500">Here's what's happening with your hotel today.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Rooms</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-2">{totalRooms}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-2xl">🏨</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Bookings</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-2">{activeBookings}</h3>
                            <p className="text-xs text-green-500 font-medium mt-1">dari {bookings.length} total booking</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                            <span className="text-2xl">📅</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-amber-50 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-2">{formatCurrency(totalRevenue)}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                            <span className="text-2xl">💰</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-yellow-50 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pending</p>
                            <h3 className="text-2xl font-bold text-yellow-600 mt-2">{pendingCount}</h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">perlu dikonfirmasi</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                            <span className="text-2xl">⏳</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-gray-800">Recent Bookings</h3>
                            <p className="text-sm text-gray-500">{bookings.length} total reservasi</p>
                        </div>
                        <Link href="/admin/bookings" className="text-xs text-blue-600 font-bold hover:underline">
                            View All →
                        </Link>
                    </div>

                    {recentBookings.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <span className="text-3xl block mb-2">📅</span>
                            <p>Belum ada booking masuk</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentBookings.map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={booking.user?.image || `https://ui-avatars.com/api/?name=${booking.user?.name || "G"}&background=random&size=40`}
                                            alt=""
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">{booking.user?.name || "Guest"}</p>
                                            <p className="text-xs text-gray-500">{booking.room?.type} - {booking.room?.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800 text-sm">{formatCurrency(booking.totalPrice)}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            booking.paymentStatus === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                            booking.paymentStatus === "PAID" ? "bg-blue-100 text-blue-700" :
                                            booking.paymentStatus === "CANCELLED" ? "bg-red-100 text-red-700" :
                                            "bg-gray-100 text-gray-600"
                                        }`}>
                                            {booking.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6">Room Types Distribution</h3>
                    {roomTypes.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <span className="text-3xl block mb-2">🏨</span>
                            <p>Belum ada kamar terdaftar</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {roomTypes.map((room, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700">{room.type}</span>
                                        <span className="text-gray-500">{room.count} rooms</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${typeColors[i % typeColors.length]}`}
                                            style={{ width: `${(room.count / totalRooms) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h4 className="font-bold text-gray-800 mb-4">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/admin/kamar" className="p-3 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-200 transition flex flex-col items-center text-center">
                                <span className="text-xl mb-1">🏨</span>
                                <span className="text-xs font-medium text-gray-700">Kelola Kamar</span>
                            </Link>
                            <Link href="/admin/bookings" className="p-3 bg-green-50 rounded-xl border border-green-100 hover:border-green-200 transition flex flex-col items-center text-center">
                                <span className="text-xl mb-1">📅</span>
                                <span className="text-xs font-medium text-gray-700">Kelola Booking</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}