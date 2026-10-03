import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

// In-memory user storage (replace with database in production)
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user";
  approved: boolean;
}

export const users: User[] = [];

// Helper to hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Helper to verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Initialize with a default admin user
const DEFAULT_ADMIN_EMAIL = "admin@ohs.local";
const DEFAULT_ADMIN_PASSWORD = "admin123";

// Initialize default admin (async initialization)
(async () => {
  if (users.length === 0) {
    const DEFAULT_ADMIN_PASSWORD_HASH = await hashPassword(DEFAULT_ADMIN_PASSWORD);
    users.push({
      id: "1",
      name: "Administrator",
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
      role: "admin",
      approved: true,
    });
  }
})();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = users.find((u) => u.email === credentials.email);

        if (!user) {
          return null;
        }

        const isPasswordValid = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        if (!user.approved) {
          throw new Error("Account not approved yet");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};
