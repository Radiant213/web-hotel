"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function RoomsPage() {
    const router = useRouter();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const [form, setForm] = useState({
        checkIn: today,
        checkOut: tomorrow,
    });

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch("/api/rooms");
                const data = await res.json();
                setRooms(data);
            } catch (err) {
                console.error("Failed to fetch rooms");
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        router.push(`/booking?checkIn=${form.checkIn}&checkOut=${form.checkOut}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Minimalist Navbar */}
            <nav className="bg-white border-b border-gray-100 flex justify-between items-center px-6 py-4 sticky top-0 z-50">
                <Link href="/" className="text-xl font-serif tracking-widest text-gray-900 hover:opacity-70 transition block">
                    AURA SUITES
                </Link>
                <Link href="/my-bookings" className="text-xs font-bold tracking-widest uppercase text-gray-600 hover:text-gray-900 transition">
                    My Bookings
                </Link>
            </nav>

            {/* Header & Search */}
            <div className="bg-gray-900 text-white py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-serif mb-4">Our Rooms & Suites</h1>
                    <p className="text-gray-400 max-w-lg mx-auto mb-12">Discover our collection of thoughtfully designed spaces, crafted for your ultimate comfort.</p>
                    
                    <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-xl shadow-black/10">
                        <div className="flex-1 px-4 py-2 border-r border-gray-100 hidden md:block text-left relative">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Check-In</label>
                            <input 
                                type="date" 
                                required
                                min={today}
                                value={form.checkIn}
                                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                                className="w-full text-gray-900 font-medium focus:outline-none bg-transparent"
                            />
                        </div>
                        <div className="flex-1 px-4 py-2 hidden md:block text-left relative">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Check-Out</label>
                            <input 
                                type="date" 
                                required
                                min={form.checkIn || today}
                                value={form.checkOut}
                                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                                className="w-full text-gray-900 font-medium focus:outline-none bg-transparent"
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition w-full md:w-auto">
                            Check Availability
                        </button>
                    </form>
                </div>
            </div>

            {/* Rooms List */}
            <div className="max-w-6xl mx-auto px-6 mt-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.map((room) => (
                            <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                                <Link href={`/checkout?roomId=${room.id}`}>
                                    <div className="h-64 bg-gray-200 relative overflow-hidden">
                                        <img 
                                            src={room.imageUrl || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop"} 
                                            alt={room.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                    </div>
                                </Link>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600">{room.type}</span>
                                        <span className="text-xs text-gray-500">{room.stock} unit tersedia</span>
                                    </div>
                                    <h3 className="text-2xl font-serif text-gray-900 mb-2">
                                        <Link href={`/checkout?roomId=${room.id}`} className="hover:text-blue-600 transition">
                                            {room.name}
                                        </Link>
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                                        {room.description || "Rasakan kenyamanan maksimal dengan fasilitas modern di kamar ini."}
                                    </p>
                                    <div className="flex items-end justify-between border-t border-gray-100 pt-6">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-1">Mulai Dari</p>
                                            <p className="text-xl font-bold text-gray-900">{formatCurrency(room.price)}</p>
                                        </div>
                                        <Link href={`/checkout?roomId=${room.id}`} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition uppercase tracking-widest">
                                            Book
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
