import { createAuthClient } from 'better-auth/react'

export type DemoRole = 'buyer' | 'seller'

export const authClient = createAuthClient()

export function setDemoRole(_role: DemoRole) {
  // Demo login is intentionally disabled to keep the app secure.
}
