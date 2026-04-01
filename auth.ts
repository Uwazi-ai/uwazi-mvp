import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getServerSession } from "next-auth/next"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
}

export const auth = () => getServerSession(authOptions)
