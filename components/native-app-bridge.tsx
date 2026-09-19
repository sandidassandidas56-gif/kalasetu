'use client'

import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { Device } from '@capacitor/device'
import { Preferences } from '@capacitor/preferences'

export function NativeAppBridge() {
  useEffect(() => {
    if (!window.Capacitor?.isNativePlatform()) return

    let removeAppUrlListener: (() => void) | undefined

    const initializeNativeFeatures = async () => {
      const device = await Device.getInfo()
      await Preferences.set({ key: 'kalasetu_platform', value: device.platform })

      const appUrlListener = await App.addListener('appUrlOpen', ({ url }) => {
        try {
          const parsedUrl = new URL(url)
          window.location.assign(`${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`)
        } catch {
          // Ignore malformed deep links from external apps.
        }
      })
      removeAppUrlListener = () => appUrlListener.remove()

    }

    void initializeNativeFeatures()

    return () => {
      removeAppUrlListener?.()
    }
  }, [])

  return null
}