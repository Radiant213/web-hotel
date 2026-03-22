import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Detail satu kamar
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const room = await prisma.room.findUnique({
            where: { id: parseInt(id) },
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        return NextResponse.json(room);
    } catch (error) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
}

// PUT: Update data kamar
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const room = await prisma.room.update({
            where: { id: parseInt(id) },
            data: {
                ...(body.name && { name: body.name }),
                ...(body.type && { type: body.type }),
                ...(body.price && { price: parseInt(body.price) }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.facilities !== undefined && { facilities: body.facilities }),
                ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
                ...(body.stock !== undefined && { stock: parseInt(body.stock) }),
            },
        });

        return NextResponse.json({ message: "Room updated!", data: room });
    } catch (error) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Hapus kamar
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await prisma.room.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: "Room deleted!" });
    } catch (error) {
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
