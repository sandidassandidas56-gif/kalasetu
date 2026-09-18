import { betterAuth } from 'better-auth'
import { headers } from 'next/headers'
import { pool } from '@/lib/db'

const authSecret = process.env.BETTER_AUTH_SECRET ?? `kalasetu-dev-${crypto.randomUUID().replace(/-/g, '')}`
const appBaseUrl = process.env.BETTER_AUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000')
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)
const socialProviders = {
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
}

export const auth = betterAuth({
  secret: authSecret,
  ...(hasDatabaseUrl ? { database: pool } : {}),
  baseURL: appBaseUrl,
  emailAndPassword: { enabled: true, autoSignIn: true },
  socialProviders,
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'buyer' },
    },
  },
  trustedOrigins: [
    appBaseUrl,
    'http://localhost:3000',
    'http://192.168.1.6:3000',
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
    ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
    ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
  cookies: {
    sessionToken: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
  },
})

export async function getCurrentSession() {
  if (!hasDatabaseUrl) {
    return null
  }

  return auth.api.getSession({ headers: await headers() })
}
