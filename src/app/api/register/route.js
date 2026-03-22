import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// POST: Register user baru
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // Validasi input
        if (!name || !email || !password) {
            return NextResponse.json({ error: "Semua field harus diisi!" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password minimal 6 karakter!" }, { status: 400 });
        }

        // Cek apakah email sudah terdaftar
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email sudah terdaftar!" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Buat user baru
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "GUEST",
            },
        });

        return NextResponse.json(
            { message: "Registrasi berhasil!", data: { name: newUser.name, email: newUser.email } },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
