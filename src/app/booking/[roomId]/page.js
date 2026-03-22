"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function BookingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const roomId = params.roomId;

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const [form, setForm] = useState({
        checkIn: today,
        checkOut: tomorrow,
        guests: 1,
        notes: "",
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const res = await fetch(`/api/rooms/${roomId}`);
                if (!res.ok) throw new Error("Room not found");
                const data = await res.json();
                setRoom(data);
            } catch (err) {
                setError("Kamar tidak ditemukan!");
            } finally {
                setLoading(false);
            }
        };
        if (roomId) fetchRoom();
    }, [roomId]);

    const checkInDate = new Date(form.checkIn);
    const checkOutDate = new Date(form.checkOut);
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const jumlahMalam = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
    const totalHarga = room ? jumlahMalam * room.price : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomId,
                    checkIn: form.checkIn,
                    checkOut: form.checkOut,
                    guests: parseInt(form.guests),
                    notes: form.notes,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                setSubmitting(false);
                return;
            }

            setSuccess(true);
        } catch (err) {
            setError("Terjadi kesalahan. Coba lagi nanti.");
            setSubmitting(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-4">Memuat data kamar...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center mx-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                        <span className="text-4xl">✓</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Berhasil! 🎉</h2>
                    <p className="text-gray-500 mb-8">Booking kamu sedang diproses. Kami akan segera mengkonfirmasi.</p>
                    <div className="flex flex-col gap-3">
                        <Link href="/my-bookings" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition text-center">
                            Lihat Riwayat Booking
                        </Link>
                        <Link href="/" className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition text-center">
                            Kembali ke Beranda
                        </Link>
                    </div>
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
                    <div className="flex items-center gap-4">
                        <Link href="/my-bookings" className="text-sm text-gray-600 hover:text-gray-900 transition font-medium">
                            My Bookings
                        </Link>
                        {session && (
                            <div className="flex items-center gap-2">
                                <img
                                    src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}&background=random`}
                                    className="w-8 h-8 rounded-full"
                                    alt="Profile"
                                />
                                <span className="text-sm font-medium text-gray-700 hidden md:block">{session.user.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-10">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition mb-6 inline-flex items-center gap-1">
                    ← Kembali ke Beranda
                </Link>

                {!room ? (
                    <div className="bg-white p-10 rounded-2xl shadow-sm text-center">
                        <p className="text-red-500 text-lg">{error || "Kamar tidak ditemukan"}</p>
                        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">Kembali</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-4">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        src={room.imageUrl || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop"}
                                        alt={room.type}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">{room.type}</span>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                            Tersedia
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-serif text-gray-900 mb-1">{room.name}</h2>
                                    <p className="text-2xl font-bold text-gray-900 mt-4">{formatCurrency(room.price)}<span className="text-sm font-normal text-gray-500"> / malam</span></p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4">Fasilitas Kamar</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {(room.facilities ? room.facilities.split(",") : ["🛏️ King Bed", "❄️ AC", "📶 WiFi", "📺 Smart TV", "🚿 Shower", "🔒 Safe Box"]).map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                            {item.trim()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Detail Reservasi</h2>

                                {error && (
                                    <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 mb-6">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Check-In</label>
                                            <input
                                                type="date"
                                                required
                                                min={today}
                                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                                value={form.checkIn}
                                                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Check-Out</label>
                                            <input
                                                type="date"
                                                required
                                                min={form.checkIn || today}
                                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                                value={form.checkOut}
                                                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Jumlah Tamu</label>
                                        <select
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                            value={form.guests}
                                            onChange={(e) => setForm({ ...form, guests: e.target.value })}
                                        >
                                            {[1, 2, 3, 4].map(n => (
                                                <option key={n} value={n}>{n} Tamu</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Catatan Khusus <span className="text-gray-400 font-normal normal-case">(opsional)</span></label>
                                        <textarea
                                            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                                            rows={3}
                                            placeholder="Contoh: Extra bed, lantai tinggi, dll."
                                            value={form.notes}
                                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-xl border border-gray-100">
                                        <h3 className="font-bold text-gray-800 mb-3">Ringkasan Booking</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Kamar</span>
                                                <span className="font-medium">{room.type} - {room.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Durasi</span>
                                                <span className="font-medium">{jumlahMalam} Malam</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Harga per malam</span>
                                                <span className="font-medium">{formatCurrency(room.price)}</span>
                                            </div>
                                            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                                                <span className="font-bold text-gray-900">Total</span>
                                                <span className="font-bold text-xl text-blue-600">{formatCurrency(totalHarga)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || jumlahMalam <= 0}
                                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-gray-800 transition shadow-lg shadow-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? "Memproses..." : `Konfirmasi Booking — ${formatCurrency(totalHarga)}`}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
