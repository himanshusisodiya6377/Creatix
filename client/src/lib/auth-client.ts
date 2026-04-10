import { createAuthClient } from "better-auth/react"

// can contact to backend
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BASE_URL,
  fetchOptions: { credentials: 'include' }, //send cookie with every request
})

export const { signIn, signUp, useSession } = authClient;