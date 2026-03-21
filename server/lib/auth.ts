import 'dotenv/config';
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js"

const trustedOrigins = (process.env.TRUSTED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin.length > 0);

//creat authentication system
export const auth = betterAuth({
  //Store users,sessions,tokens 
  database: prismaAdapter(prisma, {
    provider: "postgresql", 
  }),
  emailAndPassword: { //email feature for authentication
    enabled: true, 
  }, 
  user: { //account can deleted
    deleteUser: { enabled: true }
  },
  trustedOrigins,
  baseURL: process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3000/api/auth',
  secret: process.env.BETTER_AUTH_SECRET || 'development-secret-key',
  advanced: {
    cookies: {
      session_token: {
        name: 'auth_session',
        attributes: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', //if true can travel https
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          path: '/', 
        },
      },
    },
  }
});