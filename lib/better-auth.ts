// Stub for better-auth (not currently used - using Supabase instead)
// This file exists to prevent build errors from API route imports

export const auth = {
  handlers: {
    GET: async () => new Response("Not implemented", { status: 501 }),
    POST: async () => new Response("Not implemented", { status: 501 }),
  },
  getSession: async () => null,
}

export type Session = null
