import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// GET: Detail booking by ID
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: { select: { id: true, name: true, email: true, image: true } },
                room: { select: { id: true, name: true, type: true, price: true } },
            },
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
        }

        // User biasa cuma bisa lihat booking sendiri
        if (session.user.role !== "ADMIN" && booking.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(booking);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update status booking
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { paymentStatus } = body;

        const validStatuses = ["PENDING", "PAID", "CANCELLED", "REFUNDED"];
        if (!validStatuses.includes(paymentStatus)) {
            return NextResponse.json({ error: "Status tidak valid!" }, { status: 400 });
        }

        const booking = await prisma.booking.findUnique({ where: { id: parseInt(id) } });
        if (!booking) {
            return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
        }

        if (session.user.role !== "ADMIN") {
            // User biasa cuma bisa cancel booking sendiri yang masih PENDING
            if (booking.userId.toString() !== session.user.id) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            if (paymentStatus !== "CANCELLED") {
                return NextResponse.json({ error: "User hanya bisa membatalkan booking" }, { status: 403 });
            }
            if (booking.paymentStatus !== "PENDING") {
                return NextResponse.json({ error: "Hanya booking pending yang bisa dibatalkan" }, { status: 400 });
            }
        }

        const updated = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: { paymentStatus },
        });

        return NextResponse.json({ message: "Status booking diupdate!", data: updated });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Hapus booking (admin only)
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Admin only" }, { status: 403 });
        }

        const { id } = await params;
        await prisma.booking.delete({ where: { id: parseInt(id) } });

        return NextResponse.json({ message: "Booking dihapus!" });
    } catch (error) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
