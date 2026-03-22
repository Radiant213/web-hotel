import "./globals.css";
import { NextAuthProvider } from "@/components/NextAuthProvider";

export const metadata = {
    title: "Aura Suites",
    description: "Hotel Management System",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased">
                <NextAuthProvider>
                    {children}
                </NextAuthProvider>
            </body>
        </html>
    );
}
