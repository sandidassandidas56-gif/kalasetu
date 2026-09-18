'use client'

import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { Device } from '@capacitor/device'
import { Preferences } from '@capacitor/preferences'
import { PushNotifications } from '@capacitor/push-notifications'

export function NativeAppBridge() {
  useEffect(() => {
    if (!window.Capacitor?.isNativePlatform()) return

    let removeAppUrlListener: (() => void) | undefined
    let removeTokenListener: (() => void) | undefined
    let removeErrorListener: (() => void) | undefined

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

      const permission = await PushNotifications.checkPermissions()
      if (permission.receive === 'prompt') {
        await PushNotifications.requestPermissions()
      }

      const tokenListener = await PushNotifications.addListener('registration', async ({ value }) => {
        await Preferences.set({ key: 'kalasetu_push_token', value })
      })
      removeTokenListener = () => tokenListener.remove()

      const errorListener = await PushNotifications.addListener('registrationError', ({ error }) => {
        console.warn('KalaSetu push registration failed', error)
      })
      removeErrorListener = () => errorListener.remove()

      await PushNotifications.register()
    }

    void initializeNativeFeatures()

    return () => {
      removeAppUrlListener?.()
      removeTokenListener?.()
      removeErrorListener?.()
    }
  }, [])

  return null
}