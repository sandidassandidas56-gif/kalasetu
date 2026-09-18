import { createAuthClient } from 'better-auth/react'

export type DemoRole = 'buyer' | 'seller'

const authClientBaseUrl = typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin

export const authClient = createAuthClient({ baseURL: authClientBaseUrl })

export function setDemoRole(_role: DemoRole) {
  // Demo login is intentionally disabled to keep the app secure.
}
