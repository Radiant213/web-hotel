"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Email atau password salah!");
        } else {
            router.push("/");
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8 animate-fade-in">
                <div className="max-w-md w-full">
                    <div className="mb-8">
                        <Link href="/" className="text-2xl font-serif tracking-[0.2em] text-gray-900 block mb-2">AURA</Link>
                        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                        <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
                    </div>

                    <button
                        onClick={() => signIn('google', { callbackUrl: '/' })}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 p-3 rounded-xl hover:bg-gray-50 transition mb-6"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                        <span className="font-medium text-sm">Sign in with Google</span>
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-xs text-gray-400 font-medium uppercase">or with email</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                placeholder="admin@hotel.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gray-900 text-white p-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-900/20"
                        >
                            Sign In
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account? <Link href="/auth/register" className="text-blue-600 font-medium hover:underline">Create Account</Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden md:block md:w-1/2 relative bg-black">
                <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
                    alt="Luxury Hotel"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute bottom-10 left-10 right-10 text-white z-10">
                    <h2 className="text-4xl font-serif mb-4">"Experience the pinnacle of luxury and comfort."</h2>
                    <p className="text-gray-300 font-light">— Aura Suites Management</p>
                </div>
            </div>
        </div>
    );
}
