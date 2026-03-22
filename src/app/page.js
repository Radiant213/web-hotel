"use client";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function Home() {
    const { data: session } = useSession();
    const [rooms, setRooms] = useState([]);

    // Smart Navbar Logic
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const dropdownRef = useRef(null);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious();
        if (latest > previous && latest > 150) {
            setHidden(true);
            setIsDropdownOpen(false);
        } else {
            setHidden(false);
        }
    });

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch('/api/rooms');
                const data = await res.json();
                setRooms(data.slice(0, 3));
            } catch (err) {
                console.error("Failed fetch rooms");
            }
        }
        fetchRooms();
    }, []);

    const handleScrollToRooms = (e) => {
        e.preventDefault();
        const element = document.getElementById('rooms');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <div className="min-h-screen font-sans text-gray-900 bg-white">
            {/* Smart Navbar */}
            <motion.nav
                variants={{
                    visible: { y: 0 },
                    hidden: { y: "-100%" },
                }}
                animate={hidden ? "hidden" : "visible"}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="fixed top-0 w-full z-50 transition-all duration-300 bg-black/10 backdrop-blur-md border-b border-white/5"
            >
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

                    {/* Mobile Hamburger Button */}
                    <button
                        className="md:hidden text-white focus:outline-none"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Logo */}
                    <Link href="/" className="text-xl md:text-2xl font-serif text-white tracking-[0.2em] hover:opacity-80 transition hover:scale-105 duration-300 md:ml-0 md:mr-auto ml-auto">
                        AURA SUITES
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-widest text-white/90 uppercase">
                        <button onClick={handleScrollToRooms} className="hover:text-blue-300 transition relative group">
                            Suites
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-300 transition-all group-hover:w-full"></span>
                        </button>
                        <Link href="/rooms" className="hover:text-blue-300 transition relative group">
                            All Rooms
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-300 transition-all group-hover:w-full"></span>
                        </Link>
                        <Link href="#" className="hover:text-blue-300 transition relative group">
                            Experience
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-300 transition-all group-hover:w-full"></span>
                        </Link>

                        {session ? (
                            <div className="relative ml-4 pl-4 border-l border-white/20" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-3 hover:opacity-80 transition focus:outline-none"
                                >
                                    <div className="text-right hidden lg:block">
                                        <p className="text-[10px] text-gray-300 font-light normal-case">Logged in as</p>
                                        <p className="text-xs font-bold text-white">{session.user.name || "User"}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 ring-2 ring-white/20">
                                        <img
                                            src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.email}&background=random`}
                                            className="w-full h-full rounded-full object-cover border-2 border-black"
                                            alt="Profile"
                                        />
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 top-full mt-4 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                                <p className="text-sm font-bold text-gray-900">{session.user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                                            </div>
                                            <div className="py-2">
                                                <Link href="/my-bookings" className="block px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2 uppercase tracking-wider">
                                                    My Bookings
                                                </Link>
                                                <Link href="#" className="block px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2 uppercase tracking-wider">
                                                    Profile
                                                </Link>
                                                {session.user.role === 'ADMIN' && (
                                                    <Link href="/admin/dashboard" className="block px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2 uppercase tracking-wider">
                                                        Admin Page
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="border-t border-gray-100 bg-gray-50 py-2">
                                                <button
                                                    onClick={() => signOut()}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition flex items-center gap-2 uppercase tracking-wider"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/auth/login" className="ml-4 px-6 py-2.5 bg-white/20 hover:bg-white hover:text-gray-900 text-white transition rounded-xl font-semibold backdrop-blur-sm border border-white/30">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "-100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] bg-white md:hidden flex flex-col"
                    >
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-900 focus:outline-none">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <span className="text-xl font-serif text-gray-900 tracking-[0.2em] font-bold">AURA</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                            {session ? (
                                <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4 border border-gray-100">
                                    <img
                                        src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.email}&background=random`}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                        alt="Profile"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{session.user.name}</p>
                                        <p className="text-xs text-gray-500">{session.user.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-900 p-6 rounded-2xl flex flex-col items-center text-center text-white">
                                    <p className="text-sm font-light mb-4 text-gray-300">Unlock exclusive offers.</p>
                                    <Link href="/auth/register" className="w-full py-3 bg-white text-gray-900 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition">
                                        Login / Register
                                    </Link>
                                </div>
                            )}

                            <div className="flex flex-col space-y-4 mt-2">
                                <button onClick={handleScrollToRooms} className="text-left text-2xl font-serif text-gray-900 hover:text-blue-600 transition">Suites</button>
                                <Link href="/rooms" className="text-left text-2xl font-serif text-gray-900 hover:text-blue-600 transition">All Rooms</Link>
                                <Link href="/my-bookings" className="text-left text-2xl font-serif text-gray-900 hover:text-blue-600 transition">My Bookings</Link>

                                {session && session.user.role === 'ADMIN' && (
                                    <Link href="/admin/dashboard" className="text-left text-2xl font-serif text-blue-600 hover:text-blue-800 transition">Admin Dashboard</Link>
                                )}
                            </div>

                            {session && (
                                <button
                                    onClick={() => signOut()}
                                    className="mt-auto py-4 text-left text-xs font-bold text-red-600 uppercase tracking-widest hover:text-red-800 transition"
                                >
                                    Sign Out
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Hero Section */}
            <header className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
                <div className="absolute inset-0 z-0">
                    <motion.img
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
                        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
                        alt="Luxury Hotel"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative z-20 text-center text-white px-6">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="w-16 h-0.5 bg-white/60 mx-auto mb-6"></motion.div>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="text-sm md:text-lg tracking-[0.4em] mb-4 uppercase text-gray-200 font-light">
                        The Art of Stay
                    </motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }} className="text-5xl md:text-8xl font-serif mb-8 leading-tight tracking-tight">
                        Aura <br /> <span className="italic font-light">Suites</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }} className="max-w-lg mx-auto text-gray-200 text-sm/relaxed md:text-base/relaxed mb-10 tracking-wide font-light">
                        Discover a sanctuary of peace in the heart of the city.
                        Where modern luxury meets traditional hospitality.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 }}>
                        <button
                            onClick={handleScrollToRooms}
                            className="inline-block px-10 py-4 border border-white text-white text-xs tracking-[0.2em] font-bold hover:bg-white hover:text-gray-900 transition duration-500 uppercase"
                        >
                            Explore Rooms
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/50"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </motion.div>
            </header>

            {/* Intro Section */}
            <section className="py-24 bg-white text-center">
                <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto px-6">
                    <span className="text-blue-900 text-xs font-bold tracking-widest uppercase mb-4 block">Our Philosophy</span>
                    <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mb-8 leading-tight">
                        Designed for your <span className="italic text-gray-500">comfort</span>, <br />curated for your <span className="italic text-gray-500">lifestyle</span>.
                    </h2>
                    <div className="w-px h-16 bg-gray-300 mx-auto my-8"></div>
                </motion.div>
            </section>

            {/* Rooms Showcase */}
            <section id="rooms" className="py-24 bg-neutral-50 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">Accommodations</h2>
                            <p className="text-gray-500 tracking-wide text-sm">Refined spaces for relaxation.</p>
                        </div>
                        <Link href="/rooms" className="hidden md:block text-xs font-bold tracking-widest uppercase border-b border-gray-900 pb-1 hover:text-blue-800 hover:border-blue-800 transition">
                            View All Suites
                        </Link>
                    </div>

                    {rooms.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-none border border-gray-100 shadow-sm">
                            <div className="text-4xl mb-4">🍂</div>
                            <p className="text-gray-400 italic font-serif text-lg">Loading rooms...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {rooms.map((room, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2, duration: 0.8 }}
                                    key={room.id} className="group cursor-pointer"
                                >
                                    <div className="relative h-[450px] overflow-hidden mb-6 bg-gray-200">
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition z-10 duration-500"></div>
                                        <img
                                            src={room.imageUrl || (index % 2 === 0
                                                ? 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop'
                                                : 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop'
                                            )}
                                            alt={room.type}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition duration-[1.5s] ease-in-out"
                                        />
                                        <div className="absolute top-6 right-6 z-20">
                                            <span className="px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase bg-white text-gray-900">
                                                Available
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center text-center px-4">
                                        <h3 className="text-2xl font-serif text-gray-900 mb-2 group-hover:text-blue-800 transition">{room.name}</h3>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{room.type}</p>
                                        <div className="w-8 h-px bg-gray-300 my-3 group-hover:w-16 transition-all duration-500"></div>
                                        <p className="text-sm font-medium text-gray-500 mb-4 tracking-wide">
                                            {formatCurrency(room.price)}<span className="text-xs font-normal"> / malam</span>
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-gray-400 font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 mb-6">
                                            <span>King Bed</span>
                                            <span>•</span>
                                            <span>City View</span>
                                            <span>•</span>
                                            <span>54m²</span>
                                        </div>
                                        <Link href={`/checkout?roomId=${room.id}`} className="px-8 py-3 bg-transparent border border-gray-200 text-gray-900 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 hover:text-white transition duration-300">
                                            Book Now
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="mt-12 text-center md:hidden">
                        <Link href="/rooms" className="text-xs font-bold tracking-widest uppercase border-b border-gray-900 pb-1">
                            View All Suites
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#111] text-white py-16">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <div className="text-3xl font-serif tracking-[0.2em] mb-2">AURA</div>
                        <p className="text-xs text-gray-500 tracking-widest uppercase">Luxury Hotel & Suites</p>
                    </div>
                    <div className="flex gap-8 text-xs font-bold tracking-widest uppercase text-gray-400">
                        <Link href="#" className="hover:text-white transition">Instagram</Link>
                        <Link href="#" className="hover:text-white transition">Facebook</Link>
                        <Link href="#" className="hover:text-white transition">Twitter</Link>
                    </div>
                    <div className="text-gray-600 text-[10px] tracking-wider uppercase">
                        © 2026 Aura Suites. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
