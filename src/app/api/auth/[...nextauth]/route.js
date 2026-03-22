import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error("Email tidak terdaftar");
                }
                // Jika user login via credentials tapi password ga ada (bikin pake google), reject.
                if (!user.password) {
                    throw new Error("Silahkan login menggunakan Google");
                }
                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );
                if (!isPasswordCorrect) {
                    throw new Error("Password salah");
                }
                // Return object with id as string for NextAuth
                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image: user.image,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account.provider === "google") {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email },
                    });

                    if (!existingUser) {
                        await prisma.user.create({
                            data: {
                                name: user.name,
                                email: user.email,
                                image: user.image,
                                role: "GUEST",
                            },
                        });
                    }
                    return true;
                } catch (error) {
                    console.error("Error creating user:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                // If credentials login, user object already has role
                if (user.role) {
                    token.role = user.role;
                    token.id = user.id;
                } else {
                    // Google login - fetch role from DB
                    const dbUser = await prisma.user.findUnique({
                        where: { email: token.email },
                    });
                    if (dbUser) {
                        token.role = dbUser.role;
                        token.id = dbUser.id.toString();
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
