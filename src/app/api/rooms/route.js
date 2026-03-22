import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Ambil semua kamar
export async function GET() {
    try {
        const rooms = await prisma.room.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(rooms);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Tambah kamar baru
export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.name || !body.type || !body.price) {
            return NextResponse.json({ error: "Data kurang lengkap!" }, { status: 400 });
        }

        // Generate slug dari nama
        const slug = body.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        const newRoom = await prisma.room.create({
            data: {
                name: body.name,
                slug: slug,
                type: body.type,
                price: parseInt(body.price),
                description: body.description || null,
                facilities: body.facilities || null,
                imageUrl: body.imageUrl || null,
                stock: body.stock || 1,
            },
        });

        return NextResponse.json(
            { message: "Kamar berhasil dibuat!", data: newRoom },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
