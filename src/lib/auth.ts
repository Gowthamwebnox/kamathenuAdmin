import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-change-in-production",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // This is a placeholder implementation
        // Replace this with your actual authentication logic
        if (credentials.email === "admin@example.com" && credentials.password === "password") {
          return {
            id: "1",
            email: credentials.email,
            name: "Admin User",
          }
        }

        return null
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
      }
      return session
    },
  },
} 