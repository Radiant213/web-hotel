"use client";
import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

function CheckoutContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const roomId = searchParams.get("roomId");
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const [form, setForm] = useState({
        checkIn: checkInParam || today,
        checkOut: checkOutParam || tomorrow,
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
            if (!roomId) {
                setError("ID Kamar tidak valid.");
                setLoading(false);
                return;
            }
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
        fetchRoom();
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

    if (success) {
        return (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center mx-auto mt-20">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                    <span className="text-4xl text-white">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Berhasil! 🎉</h2>
                <p className="text-gray-500 mb-8">Booking kamu sedang diproses. Silakan cek halaman riwayat booking.</p>
                <div className="flex flex-col gap-3">
                    <Link href="/my-bookings" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition text-center">
                        Lihat Riwayat Booking
                    </Link>
                    <Link href="/" className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition text-center">
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center max-w-lg mx-auto mt-20">
                <p className="text-red-500 text-lg">{error}</p>
                <Link href="/rooms" className="mt-4 inline-block bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800">Kembali ke Daftar Kamar</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <Link href="/rooms" className="text-sm text-gray-500 hover:text-gray-900 transition mb-6 inline-flex items-center gap-1 font-medium">
                ← Kembali ke Daftar Kamar
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-4">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                        <div className="h-64 overflow-hidden relative">
                            <img
                                src={room.imageUrl || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop"}
                                alt={room.type}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">{room.type}</span>
                            </div>
                            <h2 className="text-2xl font-serif text-gray-900 mb-1">{room.name}</h2>
                            <p className="text-2xl font-bold text-gray-900 mt-4">{formatCurrency(room.price)}<span className="text-sm font-normal text-gray-500"> / malam</span></p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Selesaikan Reservasi</h2>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 mb-6 font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Check-In</label>
                                    <input
                                        type="date"
                                        required
                                        min={today}
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
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
                                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                                        value={form.checkOut}
                                        onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Jumlah Tamu</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
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
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none font-medium"
                                    rows={3}
                                    placeholder="Contoh: Request lantai tinggi, late check-in..."
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 border-dashed">
                                <h3 className="font-bold text-gray-800 mb-4">Ringkasan Pembayaran</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Kamar ({jumlahMalam} Malam)</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(totalHarga)}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span className="font-medium">Pajak & Biaya (0%)</span>
                                        <span className="font-bold">Termasuk</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
                                        <span className="font-bold text-gray-900">Total Harga</span>
                                        <span className="font-black text-2xl text-blue-600">{formatCurrency(totalHarga)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || jumlahMalam <= 0}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Memproses..." : "Konfirmasi Booking"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-100 flex justify-between items-center px-6 py-4 sticky top-0 z-50">
                <Link href="/" className="text-xl font-serif tracking-widest text-gray-900 hover:opacity-70 transition block">
                    AURA SUITES
                </Link>
            </nav>
            <Suspense fallback={<div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div></div>}>
                <CheckoutContent />
            </Suspense>
        </div>
    );
}
