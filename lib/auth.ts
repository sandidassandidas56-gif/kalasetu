import { betterAuth } from 'better-auth'
import { emailOTP } from 'better-auth/plugins'
import { headers } from 'next/headers'
import { pool } from '@/lib/db'

const authSecret = process.env.BETTER_AUTH_SECRET?.trim() || (process.env.NODE_ENV === 'production'
  ? (() => { throw new Error('BETTER_AUTH_SECRET must be configured in production.') })()
  : 'kalasetu-local-development-secret-change-me')

function resolveAppBaseUrl() {
  const configuredUrl = process.env.BETTER_AUTH_URL?.trim().replace(/^['"]|['"]$/g, '')
  const fallbackUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000'

  try {
    return new URL(configuredUrl || fallbackUrl).origin
  } catch {
    return new URL(fallbackUrl).origin
  }
}

const appBaseUrl = resolveAppBaseUrl()
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)
const socialProviders = {
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
  emailAndPassword: { enabled: true, autoSignIn: false, requireEmailVerification: true },
  emailVerification: { sendOnSignUp: true, autoSignInAfterVerification: true },
  plugins: [emailOTP({
    otpLength: 6,
    expiresIn: 300,
    storeOTP: 'hashed',
    sendVerificationOnSignUp: true,
    overrideDefaultEmailVerification: true,
    async sendVerificationOTP({ email, otp, type }) {
      const resendKey = process.env.RESEND_API_KEY?.trim()
      const from = process.env.AUTH_EMAIL_FROM?.trim()
      if (!resendKey || !from) throw new Error('RESEND_API_KEY and AUTH_EMAIL_FROM must be configured to send OTP emails.')
      const subject = type === 'email-verification' ? 'Verify your KalaSetu account' : 'Your KalaSetu sign-in code'
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [email], subject, text: `Your KalaSetu verification code is ${otp}. It expires in 5 minutes.` }),
      })
      if (!response.ok) throw new Error('The OTP email could not be sent.')
    },
  })],
  socialProviders,
  user: {
    additionalFields: {
      role: { type: 'string', required: false, input: true },
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
