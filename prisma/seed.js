const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Mulai seeding data dummy...\n");

    // === 1. BUAT USERS ===
    console.log("👤 Membuat users...");

    const adminPassword = await bcrypt.hash("admin123", 12);
    const guestPassword = await bcrypt.hash("guest123", 12);

    const admin = await prisma.user.upsert({
        where: { email: "admin@aurasuites.com" },
        update: {},
        create: {
            name: "Admin Hotel",
            email: "admin@aurasuites.com",
            password: adminPassword,
            role: "ADMIN",
        },
    });

    const guest1 = await prisma.user.upsert({
        where: { email: "budi@gmail.com" },
        update: {},
        create: {
            name: "Budi Santoso",
            email: "budi@gmail.com",
            password: guestPassword,
            role: "GUEST",
        },
    });

    const guest2 = await prisma.user.upsert({
        where: { email: "sari@gmail.com" },
        update: {},
        create: {
            name: "Sari Dewi",
            email: "sari@gmail.com",
            password: guestPassword,
            role: "GUEST",
        },
    });

    const guest3 = await prisma.user.upsert({
        where: { email: "andi@gmail.com" },
        update: {},
        create: {
            name: "Andi Pratama",
            email: "andi@gmail.com",
            password: guestPassword,
            role: "GUEST",
        },
    });

    console.log(`   ✅ Admin: ${admin.email} (password: admin123)`);
    console.log(`   ✅ Guest: ${guest1.email} (password: guest123)`);
    console.log(`   ✅ Guest: ${guest2.email} (password: guest123)`);
    console.log(`   ✅ Guest: ${guest3.email} (password: guest123)`);

    // === 2. BUAT ROOMS ===
    console.log("\n🏨 Membuat kamar hotel...");

    const rooms = await Promise.all([
        prisma.room.upsert({
            where: { slug: "deluxe-ocean-view" },
            update: {},
            create: {
                name: "Deluxe Ocean View",
                slug: "deluxe-ocean-view",
                type: "Deluxe",
                price: 850000,
                description: "Kamar deluxe dengan pemandangan laut yang menakjubkan. Dilengkapi balkon pribadi, king-size bed, dan kamar mandi mewah dengan bathtub.",
                facilities: "King Bed, Ocean View, Balkon, AC, WiFi, TV 55\", Mini Bar, Bathtub, Room Service 24 Jam",
                imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
                stock: 5,
            },
        }),
        prisma.room.upsert({
            where: { slug: "superior-garden" },
            update: {},
            create: {
                name: "Superior Garden",
                slug: "superior-garden",
                type: "Superior",
                price: 550000,
                description: "Kamar superior yang nyaman dengan pemandangan taman tropis yang asri. Cocok untuk keluarga kecil atau pasangan.",
                facilities: "Queen Bed, Garden View, AC, WiFi, TV 43\", Shower, Coffee Maker",
                imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
                stock: 8,
            },
        }),
        prisma.room.upsert({
            where: { slug: "presidential-suite" },
            update: {},
            create: {
                name: "Presidential Suite",
                slug: "presidential-suite",
                type: "Suite",
                price: 2500000,
                description: "Suite mewah terluas dengan ruang tamu terpisah, ruang makan, dan jacuzzi pribadi. Pengalaman menginap terbaik untuk tamu VIP.",
                facilities: "King Bed, Living Room, Dining Room, Jacuzzi, Balkon, AC, WiFi, TV 65\", Mini Bar, Butler Service, Airport Transfer",
                imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
                stock: 2,
            },
        }),
        prisma.room.upsert({
            where: { slug: "standard-twin" },
            update: {},
            create: {
                name: "Standard Twin",
                slug: "standard-twin",
                type: "Standard",
                price: 350000,
                description: "Kamar standar dengan dua single bed, ideal untuk perjalanan bisnis atau bersama teman.",
                facilities: "Twin Bed, AC, WiFi, TV 32\", Shower, Meja Kerja",
                imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                stock: 10,
            },
        }),
        prisma.room.upsert({
            where: { slug: "family-suite" },
            update: {},
            create: {
                name: "Family Suite",
                slug: "family-suite",
                type: "Suite",
                price: 1200000,
                description: "Suite keluarga yang luas dengan dua kamar tidur terpisah. Sempurna untuk liburan keluarga.",
                facilities: "1 King Bed + 2 Single Bed, 2 Kamar Tidur, Living Room, AC, WiFi, TV 50\", Mini Bar, Bathtub, Kids Amenities",
                imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
                stock: 4,
            },
        }),
        prisma.room.upsert({
            where: { slug: "honeymoon-villa" },
            update: {},
            create: {
                name: "Honeymoon Villa",
                slug: "honeymoon-villa",
                type: "Villa",
                price: 3500000,
                description: "Villa romantis dengan kolam renang private dan pemandangan sunset. Paket honeymoon termasuk dinner romantis di tepi pantai.",
                facilities: "King Bed, Private Pool, Ocean View, Outdoor Shower, AC, WiFi, TV 55\", Mini Bar, Breakfast in Bed, Spa Voucher",
                imageUrl: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800",
                stock: 3,
            },
        }),
    ]);

    rooms.forEach((room) => {
        console.log(`   ✅ ${room.name} - Rp ${room.price.toLocaleString("id-ID")}/malam (stok: ${room.stock})`);
    });

    // === 3. BUAT BOOKINGS ===
    console.log("\n📋 Membuat booking dummy...");

    const bookings = await Promise.all([
        prisma.booking.create({
            data: {
                userId: guest1.id,
                roomId: rooms[0].id, // Deluxe Ocean View
                checkIn: new Date("2026-03-25"),
                checkOut: new Date("2026-03-28"),
                guests: 2,
                totalPrice: 850000 * 3,
                paymentStatus: "PAID",
                notes: "Minta kamar lantai tinggi kalau bisa",
            },
        }),
        prisma.booking.create({
            data: {
                userId: guest2.id,
                roomId: rooms[2].id, // Presidential Suite
                checkIn: new Date("2026-04-01"),
                checkOut: new Date("2026-04-05"),
                guests: 2,
                totalPrice: 2500000 * 4,
                paymentStatus: "PENDING",
                notes: "Anniversary celebration, tolong siapkan surprise cake",
            },
        }),
        prisma.booking.create({
            data: {
                userId: guest3.id,
                roomId: rooms[3].id, // Standard Twin
                checkIn: new Date("2026-03-20"),
                checkOut: new Date("2026-03-22"),
                guests: 1,
                totalPrice: 350000 * 2,
                paymentStatus: "PAID",
                notes: null,
            },
        }),
        prisma.booking.create({
            data: {
                userId: guest1.id,
                roomId: rooms[4].id, // Family Suite
                checkIn: new Date("2026-04-10"),
                checkOut: new Date("2026-04-14"),
                guests: 4,
                totalPrice: 1200000 * 4,
                paymentStatus: "PENDING",
                notes: "Liburan keluarga, ada anak kecil 2 orang",
            },
        }),
        prisma.booking.create({
            data: {
                userId: guest2.id,
                roomId: rooms[1].id, // Superior Garden
                checkIn: new Date("2026-03-15"),
                checkOut: new Date("2026-03-17"),
                guests: 2,
                totalPrice: 550000 * 2,
                paymentStatus: "CANCELLED",
                notes: "Batal karena perubahan jadwal",
            },
        }),
    ]);

    console.log(`   ✅ ${bookings.length} booking berhasil dibuat`);

    // === SUMMARY ===
    console.log("\n" + "=".repeat(50));
    console.log("🎉 SEEDING SELESAI!");
    console.log("=".repeat(50));
    console.log(`\n📊 Total data:`);
    console.log(`   👤 Users : ${await prisma.user.count()}`);
    console.log(`   🏨 Rooms : ${await prisma.room.count()}`);
    console.log(`   📋 Bookings: ${await prisma.booking.count()}`);
    console.log(`\n🔑 Login Credentials:`);
    console.log(`   Admin : admin@aurasuites.com / admin123`);
    console.log(`   Guest : budi@gmail.com / guest123`);
    console.log(`   Guest : sari@gmail.com / guest123`);
    console.log(`   Guest : andi@gmail.com / guest123\n`);
}

main()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
