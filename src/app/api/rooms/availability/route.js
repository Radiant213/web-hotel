import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Cek ketersediaan kamar berdasarkan tanggal
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const checkIn = searchParams.get("checkIn");
        const checkOut = searchParams.get("checkOut");

        if (!checkIn || !checkOut) {
            // Kalau ga ada tanggal, return semua kamar
            const rooms = await prisma.room.findMany({
                orderBy: { createdAt: "desc" },
            });
            return NextResponse.json(rooms);
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate <= checkInDate) {
            return NextResponse.json({ error: "Tanggal check-out harus setelah check-in!" }, { status: 400 });
        }

        // Ambil semua kamar beserta jumlah booking yang overlap
        const rooms = await prisma.room.findMany({
            include: {
                _count: {
                    select: {
                        bookings: {
                            where: {
                                paymentStatus: { notIn: ["CANCELLED", "REFUNDED"] },
                                checkIn: { lt: checkOutDate },
                                checkOut: { gt: checkInDate },
                            },
                        },
                    },
                },
            },
        });

        // Filter: hanya kamar yang masih ada stok tersedia
        const availableRooms = rooms
            .filter(room => room._count.bookings < room.stock)
            .map(({ _count, ...room }) => ({
                ...room,
                availableUnits: room.stock - _count.bookings,
            }));

        return NextResponse.json(availableRooms);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
