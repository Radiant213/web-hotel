"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
        month: 'long',
        year: 'numeric',
    });
};

const statusConfig = {
    PENDING: { label: "Menunggu", color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
    PAID: { label: "Dibayar", color: "bg-blue-100 text-blue-700", icon: "✅" },
    CANCELLED: { label: "Dibatalkan", color: "bg-red-100 text-red-700", icon: "❌" },
    REFUNDED: { label: "Refund", color: "bg-gray-100 text-gray-700", icon: "↩️" },
};

export default function MyBookingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch("/api/bookings");
                const data = await res.json();
                setBookings(data);
            } catch (err) {
                console.error("Failed to fetch bookings");
            } finally {
                setLoading(false);
            }
        };
        if (status === "authenticated") fetchBookings();
    }, [status]);

    const handleCancel = async (id) => {
        if (!confirm("Yakin mau batalkan booking ini?")) return;
        setCancelling(id);

        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentStatus: "CANCELLED" }),
            });

            if (res.ok) {
                setBookings(bookings.map(b => b.id === id ? { ...b, paymentStatus: "CANCELLED" } : b));
            }
        } catch (err) {
            console.error("Failed to cancel");
        } finally {
            setCancelling(null);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-4">Memuat riwayat booking...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="text-xl font-serif tracking-[0.2em] text-gray-900 hover:opacity-70 transition">
                        AURA SUITES
                    </Link>
                    {session && (
                        <div className="flex items-center gap-3">
                            <img
                                src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}&background=random`}
                                className="w-8 h-8 rounded-full"
                                alt="Profile"
                            />
                            <span className="text-sm font-medium text-gray-700 hidden md:block">{session.user.name}</span>
                        </div>
                    )}
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-10">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition mb-6 inline-flex items-center gap-1">
                    ← Kembali ke Beranda
                </Link>

                <div className="mt-4 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Riwayat Booking</h1>
                    <p className="text-gray-500 mt-1">Semua reservasi kamu di Aura Suites</p>
                </div>

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">📅</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada booking</h3>
                        <p className="text-gray-500 mb-6">Yuk pilih kamar dan mulai booking pertama kamu!</p>
                        <Link href="/rooms" className="inline-block bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition">
                            Lihat Kamar
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => {
                            const sc = statusConfig[booking.paymentStatus] || statusConfig.PENDING;
                            const checkIn = new Date(booking.checkIn);
                            const checkOut = new Date(booking.checkOut);
                            const jumlahMalam = Math.ceil(Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24));

                            return (
                                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="md:w-48 h-40 md:h-auto overflow-hidden bg-gray-200 flex-shrink-0">
                                            <img
                                                src={booking.room?.imageUrl || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=400&auto=format&fit=crop"}
                                                alt="Room"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 p-6">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-bold text-gray-900">
                                                            {booking.room?.type || "Room"} - {booking.room?.name || "N/A"}
                                                        </h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${sc.color}`}>
                                                            {sc.icon} {sc.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mt-3">
                                                        <span>📅 {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</span>
                                                        <span>🌙 {jumlahMalam} Malam</span>
                                                        <span>👤 {booking.guests} Tamu</span>
                                                    </div>
                                                    {booking.notes && (
                                                        <p className="text-sm text-gray-400 mt-2 italic">📝 {booking.notes}</p>
                                                    )}
                                                </div>

                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(booking.totalPrice)}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Dibuat: {formatDate(booking.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            {booking.paymentStatus === "PENDING" && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                                    <button
                                                        onClick={() => handleCancel(booking.id)}
                                                        disabled={cancelling === booking.id}
                                                        className="px-5 py-2 text-sm font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                                                    >
                                                        {cancelling === booking.id ? "Membatalkan..." : "Batalkan Booking"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
