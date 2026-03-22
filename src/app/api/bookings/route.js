import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// GET: Ambil semua booking
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let bookings;

        if (session.user.role === "ADMIN") {
            // Admin bisa lihat semua booking
            bookings = await prisma.booking.findMany({
                include: {
                    user: { select: { id: true, name: true, email: true, image: true } },
                    room: { select: { id: true, name: true, type: true, price: true } },
                },
                orderBy: { createdAt: "desc" },
            });
        } else {
            // User biasa cuma lihat booking sendiri
            bookings = await prisma.booking.findMany({
                where: { userId: parseInt(session.user.id) },
                include: {
                    room: { select: { id: true, name: true, type: true, price: true } },
                },
                orderBy: { createdAt: "desc" },
            });
        }

        return NextResponse.json(bookings);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Buat booking baru
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { roomId, checkIn, checkOut, guests, notes } = body;

        // Validasi input
        if (!roomId || !checkIn || !checkOut || !guests) {
            return NextResponse.json({ error: "Data kurang lengkap!" }, { status: 400 });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Validasi tanggal
        if (checkOutDate <= checkInDate) {
            return NextResponse.json({ error: "Tanggal check-out harus setelah check-in!" }, { status: 400 });
        }

        // Cek apakah kamar ada
        const room = await prisma.room.findUnique({ where: { id: parseInt(roomId) } });
        if (!room) {
            return NextResponse.json({ error: "Kamar tidak ditemukan!" }, { status: 404 });
        }

        // Cek ketersediaan: hitung booking aktif yang overlap
        const overlappingBookings = await prisma.booking.count({
            where: {
                roomId: parseInt(roomId),
                paymentStatus: { notIn: ["CANCELLED", "REFUNDED"] },
                checkIn: { lt: checkOutDate },
                checkOut: { gt: checkInDate },
            },
        });

        if (overlappingBookings >= room.stock) {
            return NextResponse.json({ error: "Kamar sudah penuh untuk tanggal tersebut!" }, { status: 400 });
        }

        // Hitung jumlah malam & total harga
        const diffTime = Math.abs(checkOutDate - checkInDate);
        const jumlahMalam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalPrice = jumlahMalam * room.price;

        // Buat booking
        const newBooking = await prisma.booking.create({
            data: {
                userId: parseInt(session.user.id),
                roomId: parseInt(roomId),
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests: parseInt(guests),
                totalPrice,
                notes: notes || null,
            },
        });

        return NextResponse.json(
            { message: "Booking berhasil dibuat!", data: newBooking },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
