"use client";
import { useState, useEffect } from "react";

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

const statusConfig = {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "⏳" },
    PAID: { label: "Paid", color: "bg-blue-100 text-blue-700 border-blue-200", icon: "✅" },
    CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: "❌" },
    REFUNDED: { label: "Refunded", color: "bg-gray-100 text-gray-600 border-gray-200", icon: "↩️" },
};

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch("/api/bookings");
            const data = await res.json();
            setBookings(data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setUpdating(id);
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentStatus: newStatus }),
            });

            if (res.ok) {
                setBookings(bookings.map(b => b.id === id ? { ...b, paymentStatus: newStatus } : b));
            }
        } catch (error) {
            console.error("Error updating booking:", error);
        } finally {
            setUpdating(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Yakin ingin menghapus booking ini secara permanen?")) return;
        try {
            const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
            if (res.ok) {
                setBookings(bookings.filter(b => b.id !== id));
            }
        } catch (error) {
            console.error("Error deleting booking:", error);
        }
    };

    const filteredBookings = filterStatus === "all"
        ? bookings
        : bookings.filter(b => b.paymentStatus === filterStatus);

    const totalBookings = bookings.length;
    const pendingCount = bookings.filter(b => b.paymentStatus === "PENDING").length;
    const paidCount = bookings.filter(b => b.paymentStatus === "PAID").length;
    const cancelledCount = bookings.filter(b => b.paymentStatus === "CANCELLED").length;
    const totalRevenue = bookings
        .filter(b => !["CANCELLED", "REFUNDED"].includes(b.paymentStatus))
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    return (
        <div className="space-y-6">
            <div className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                            <span className="text-xl">📅</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Kelola Booking</h1>
                            <p className="text-gray-500 text-sm">Kelola semua reservasi tamu hotel</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="card p-4">
                    <p className="text-xs text-gray-500 font-medium">Total Booking</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalBookings}</h3>
                </div>
                <div className="card p-4">
                    <p className="text-xs text-gray-500 font-medium">Pending</p>
                    <h3 className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</h3>
                </div>
                <div className="card p-4">
                    <p className="text-xs text-gray-500 font-medium">Paid</p>
                    <h3 className="text-2xl font-bold text-blue-600 mt-1">{paidCount}</h3>
                </div>
                <div className="card p-4">
                    <p className="text-xs text-gray-500 font-medium">Cancelled</p>
                    <h3 className="text-2xl font-bold text-red-600 mt-1">{cancelledCount}</h3>
                </div>
                <div className="card p-4">
                    <p className="text-xs text-gray-500 font-medium">Revenue</p>
                    <h3 className="text-lg font-bold text-gray-800 mt-1">{formatCurrency(totalRevenue)}</h3>
                </div>
            </div>

            <div className="card p-4">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {[
                        { value: "all", label: "Semua", count: totalBookings },
                        { value: "PENDING", label: "Pending", count: pendingCount },
                        { value: "PAID", label: "Paid", count: paidCount },
                        { value: "CANCELLED", label: "Cancelled", count: cancelledCount },
                        { value: "REFUNDED", label: "Refunded", count: bookings.filter(b => b.paymentStatus === "REFUNDED").length },
                    ].map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setFilterStatus(tab.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                                filterStatus === tab.value
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>
            </div>

            <div className="card p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-500 mt-4">Memuat data booking...</p>
                        </div>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📅</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada booking</h3>
                        <p className="text-gray-500">Belum ada reservasi yang masuk.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="table-header">Tamu</th>
                                    <th className="table-header">Kamar</th>
                                    <th className="table-header">Tanggal</th>
                                    <th className="table-header">Total</th>
                                    <th className="table-header">Status</th>
                                    <th className="table-header text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredBookings.map((booking) => {
                                    const sc = statusConfig[booking.paymentStatus] || statusConfig.PENDING;
                                    const checkIn = new Date(booking.checkIn);
                                    const checkOut = new Date(booking.checkOut);
                                    const jumlahMalam = Math.ceil(Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24));

                                    return (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="table-cell">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={booking.user?.image || `https://ui-avatars.com/api/?name=${booking.user?.name || "G"}&background=random&size=36`}
                                                        alt=""
                                                        className="w-9 h-9 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-800 text-sm">{booking.user?.name || "Guest"}</p>
                                                        <p className="text-xs text-gray-500">{booking.user?.email || "-"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <p className="font-medium text-gray-800">{booking.room?.type || "-"}</p>
                                                <p className="text-xs text-gray-500">{booking.room?.name || "-"}</p>
                                            </td>
                                            <td className="table-cell">
                                                <p className="text-sm text-gray-800">{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</p>
                                                <p className="text-xs text-gray-500">{jumlahMalam} malam · {booking.guests} tamu</p>
                                            </td>
                                            <td className="table-cell">
                                                <p className="font-bold text-gray-800">{formatCurrency(booking.totalPrice)}</p>
                                            </td>
                                            <td className="table-cell">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${sc.color}`}>
                                                    {sc.icon} {sc.label}
                                                </span>
                                            </td>
                                            <td className="table-cell text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {booking.paymentStatus === "PENDING" && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(booking.id, "PAID")}
                                                            disabled={updating === booking.id}
                                                            className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition disabled:opacity-50"
                                                        >
                                                            Confirm
                                                        </button>
                                                    )}
                                                    {["PENDING", "PAID"].includes(booking.paymentStatus) && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(booking.id, "CANCELLED")}
                                                            disabled={updating === booking.id}
                                                            className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                    {["CANCELLED", "REFUNDED"].includes(booking.paymentStatus) && (
                                                        <button
                                                            onClick={() => handleDelete(booking.id)}
                                                            className="p-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition"
                                                            title="Hapus Permanen"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
