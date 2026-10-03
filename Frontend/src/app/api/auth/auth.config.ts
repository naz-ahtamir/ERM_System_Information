import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * NextAuth config — auth delegated to NestJS backend (PostgreSQL).
 * MongoDB is NOT used here.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        idKaryawan: { label: "ID Karyawan", type: "text" },
        password:   { label: "Password",    type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.idKaryawan || !credentials?.password) return null;

        try {
          const res = await fetch(`${BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idKaryawan: credentials.idKaryawan.trim(),
              password:   credentials.password,
            }),
          });

          if (!res.ok) return null;

          const json = await res.json();
          // NestJS returns { data: { user, token } } via ResponseInterceptor
          const payload = json.data ?? json;
          const user    = payload.user ?? payload;
          const token   = payload.token ?? payload.access_token ?? null;

          if (!user?.id && !user?._id) return null;

          return {
            id:          String(user.id ?? user._id),
            idKaryawan:  user.idKaryawan,
            name:        user.nama ?? user.name,
            jabatan:     user.jabatan,
            departemen:  user.departemen,
            role:        user.role,
            accessToken: token,
          };
        } catch (err) {
          console.error("NextAuth authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id          = user.id;
        token.idKaryawan  = user.idKaryawan;
        token.jabatan     = user.jabatan;
        token.departemen  = user.departemen;
        token.role        = user.role;
        token.name        = user.name;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id          = token.id;
        session.user.idKaryawan  = token.idKaryawan;
        session.user.jabatan     = token.jabatan;
        session.user.departemen  = token.departemen;
        session.user.role        = token.role;
        session.user.name        = token.name;
        session.accessToken      = token.accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },
  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",
  debug:  process.env.NODE_ENV === "development",
};
