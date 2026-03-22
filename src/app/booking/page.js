"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

function BookingResultContent() {
    const searchParams = useSearchParams();
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!checkIn || !checkOut) {
            setError("Tanggal check-in dan check-out harus diisi.");
            setLoading(false);
            return;
        }

        const fetchAvailability = async () => {
            try {
                const res = await fetch(`/api/rooms/availability?checkIn=${checkIn}&checkOut=${checkOut}`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "Gagal memuat ketersediaan kamar.");
                }
                const data = await res.json();
                setRooms(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [checkIn, checkOut]);

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const jumlahMalam = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <Link href="/rooms" className="text-blue-600 hover:underline text-sm font-medium mb-6 inline-block">
                ← Kembali ke Semua Kamar
            </Link>

            <div className="mb-10">
                <h1 className="text-3xl font-serif text-gray-900 mb-2">Hasil Pencarian Kamar</h1>
                {checkIn && checkOut && !error && (
                    <p className="text-gray-500">
                        Menampilkan ketersediaan untuk <span className="font-bold text-gray-900">{checkIn}</span> s/d <span className="font-bold text-gray-900">{checkOut}</span> ({jumlahMalam} Malam)
                    </p>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
                    <p className="font-bold mb-2">Terjadi Kesalahan</p>
                    <p className="text-sm">{error}</p>
                </div>
            ) : rooms.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-4xl mb-4">😔</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Kamar Penuh</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Maaf, tidak ada kamar yang tersedia untuk tanggal yang kamu pilih. Silakan coba cari di tanggal lain.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {rooms.map((room) => (
                        <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">
                            <div className="md:w-1/3 h-64 md:h-auto relative bg-gray-200">
                                <img 
                                    src={room.imageUrl || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop"} 
                                    alt={room.name} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600">{room.type}</span>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                            Sisa {room.availableUnits} kamar
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-serif text-gray-900 mb-4">{room.name}</h3>
                                    
                                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-6">
                                        {(room.facilities ? room.facilities.split(",") : ["King Bed", "AC", "WiFi"]).map((item, i) => (
                                            <span key={i} className="bg-gray-50 px-2 py-1 rounded border border-gray-100">{item.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex flex-col md:flex-row items-start md:items-end justify-between pt-6 border-t border-gray-100 mt-auto">
                                    <div className="mb-4 md:mb-0">
                                        <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-1">Total {jumlahMalam} Malam</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(room.price * jumlahMalam)}</p>
                                        <p className="text-xs text-gray-500 mt-1">{formatCurrency(room.price)} / malam</p>
                                    </div>
                                    <Link 
                                        href={`/checkout?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}`} 
                                        className="bg-gray-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition tracking-wider w-full md:w-auto text-center"
                                    >
                                        Pilih Kamar
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function BookingResultsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-100 flex justify-between items-center px-6 py-4 sticky top-0 z-50">
                <Link href="/" className="text-xl font-serif tracking-widest text-gray-900 hover:opacity-70 transition block">
                    AURA SUITES
                </Link>
            </nav>
            <Suspense fallback={<div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div></div>}>
                <BookingResultContent />
            </Suspense>
        </div>
    );
}
