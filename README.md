# 🏨 Aura Suites - Hotel Management System

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-5-blue?style=for-the-badge&logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Aura Suites is a modern, full-stack luxury hotel management website built for my portfolio. It features a seamless booking experience for guests and a comprehensive dashboard for administrators to manage rooms, bookings, and revenue.

## ✨ Features

- **Authentication**: Secure login using Google OAuth and email/password credentials via **NextAuth.js**.
- **Customer Facing**:
  - Live availability for 6 distinct room types (from Standard to Villas).
  - Dynamic checkout and booking system.
  - "My Bookings" page to track reservation status.
- **Admin Dashboard**:
  - Real-time statistics (Revenue, Active Bookings, Total Rooms).
  - Booking Management: View, confirm, or cancel guest reservations.
  - Room Inventory: Manage room types, pricing, and available stock units.
- **Database Architecture**: Managed efficiently using **Prisma ORM** connecting to a **MySQL** database.

## 🚀 Getting Started

To run this project locally, ensure you have Node.js and MySQL installed.

### 1. Clone the repository
```bash
git clone https://github.com/Radiant213/web-hotel.git
cd web-hotel
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your configurations:
```env
# Prisma - MySQL Database
DATABASE_URL="mysql://root:password@localhost:3306/db_hotel"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_super_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Setup Database
Run Prisma migrations to create the database tables and run the seed file for dummy data:
```bash
npx prisma migrate dev --name init
node prisma/seed.js
```

### 5. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔑 Default Seed Credentials
You can log in locally using the following dummy accounts:
- **Admin**: `admin@aurasuites.com` | Password: `admin123`
- **Guest**: `budi@gmail.com` | Password: `guest123`

---
*Created by Galang Maruf for portfolio purposes.*
