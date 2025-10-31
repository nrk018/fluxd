import { BetterAuth } from "better-auth"
import { GoogleProvider } from "better-auth/providers/google"

export const auth = BetterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
})

export type Session = Awaited<ReturnType<typeof auth.getSession>>


