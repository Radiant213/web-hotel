"use client";
import { useState, useEffect } from "react";

export default function AdminKamar() {
    const [rooms, setRooms] = useState([]);
    const [form, setForm] = useState({ name: "", type: "Standard", price: 0, stock: 1 });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await fetch("/api/rooms");
            const data = await res.json();
            setRooms(data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editing) {
            const res = await fetch(`/api/rooms/${editing.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                alert("Kamar berhasil diupdate!");
                setEditing(null);
            }
        } else {
            const res = await fetch("/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                alert("Kamar berhasil ditambahkan!");
            }
        }

        setForm({ name: "", type: "Standard", price: 0, stock: 1 });
        fetchRooms();
    };

    const handleEdit = (room) => {
        setEditing(room);
        setForm({
            name: room.name,
            type: room.type,
            price: room.price,
            stock: room.stock,
        });
    };

    const handleDelete = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus kamar ini?")) {
            const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });

            if (res.ok) {
                alert("Kamar berhasil dihapus!");
                fetchRooms();
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                                <span className="text-xl">🏨</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Inventory Kamar</h1>
                                <p className="text-gray-500 text-sm">Kelola ketersediaan dan harga kamar hotel</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Kamar</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{rooms.length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <span className="text-xl">🏨</span>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Stok Unit</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{rooms.reduce((sum, r) => sum + (r.stock || 1), 0)}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <span className="text-xl">✅</span>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Rata-rata Harga</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{rooms.length > 0 ? formatCurrency(rooms.reduce((sum, r) => sum + r.price, 0) / rooms.length) : "Rp 0"}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <span className="text-xl">💰</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="card p-6 sticky top-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                                <span className="text-xl">{editing ? "✏️" : "➕"}</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    {editing ? "Edit Kamar" : "Tambah Kamar Baru"}
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    {editing ? "Update informasi kamar" : "Tambahkan kamar baru ke inventory"}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="form-label">Nama Kamar</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Contoh: Deluxe Room 101"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="form-label">Tipe Kamar</label>
                                <div className="relative">
                                    <select
                                        className="input-field appearance-none pr-10"
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    >
                                        <option value="Standard">Standard Room</option>
                                        <option value="Deluxe">Deluxe Room</option>
                                        <option value="Suite">Executive Suite</option>
                                        <option value="Family">Family Room</option>
                                        <option value="Premium">Premium Suite</option>
                                    </select>
                                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Harga per Malam</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3 text-gray-500">Rp</div>
                                    <input
                                        type="number"
                                        className="input-field pl-10"
                                        placeholder="0"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Stok Unit</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="1"
                                    value={form.stock}
                                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 1 })}
                                    min="1"
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    Jumlah unit fisik kamar tipe ini
                                </p>
                            </div>

                            <div className="pt-4">
                                {editing ? (
                                    <div className="flex gap-3">
                                        <button type="submit" className="btn-primary flex-1">
                                            Update Kamar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditing(null);
                                                setForm({ name: "", type: "Standard", price: 0, stock: 1 });
                                            }}
                                            className="btn-secondary px-6"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                ) : (
                                    <button type="submit" className="btn-primary w-full">
                                        Simpan Kamar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                                    <span className="text-xl">📋</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Daftar Kamar</h2>
                                    <p className="text-gray-500 text-sm">
                                        {rooms.length} kamar terdaftar dalam sistem
                                    </p>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-16">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                    <p className="text-gray-500 mt-4">Memuat data kamar...</p>
                                </div>
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🏨</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada kamar</h3>
                                <p className="text-gray-500 mb-6">Tambahkan kamar pertama Anda menggunakan form di sebelah</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="table-header">Nama Kamar</th>
                                            <th className="table-header">Tipe</th>
                                            <th className="table-header">Harga/Malam</th>
                                            <th className="table-header">Stok</th>
                                            <th className="table-header text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {rooms.map((room) => (
                                            <tr key={room.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="table-cell">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                            <span className="font-bold text-gray-700 text-xs">{room.name.slice(0, 3).toUpperCase()}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{room.name}</p>
                                                            <p className="text-xs text-gray-500">{room.slug}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="table-cell">
                                                    <p className="font-medium text-gray-800">{room.type}</p>
                                                </td>
                                                <td className="table-cell">
                                                    <p className="font-bold text-gray-800">{formatCurrency(room.price)}</p>
                                                </td>
                                                <td className="table-cell">
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                        {room.stock} unit
                                                    </span>
                                                </td>
                                                <td className="table-cell text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(room)}
                                                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(room.id)}
                                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                                                            title="Hapus"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
