import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "./db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Developer",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // For development purposes only - accept developer credentials
        if (credentials?.email === "dev@oxx.local" && credentials?.password === "developer") {
          return {
            id: "dev-user-1",
            name: "Developer User",
            email: "dev@oxx.local",
            role: "admin"
          }
        }
        
        // For production, you would check against the database
        // const user = await db.user.findUnique({
        //   where: { email: credentials.email }
        // });
        // 
        // if (user && user.password === credentials.password) {
        //   return {
        //     id: user.id,
        //     name: user.name,
        //     email: user.email,
        //     role: user.role
        //   }
        // }
        
        return null
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin"
  },
  secret: process.env.NEXTAUTH_SECRET
}