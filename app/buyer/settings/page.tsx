import Link from 'next/link'
import { getPreferences } from '@/app/actions/preferences'
import { PreferencesForm } from '@/components/preferences-form'

export default async function BuyerSettingsPage() {
  const preferences = await getPreferences()
  return <main className="min-h-screen bg-[#f7f5ef] px-5 py-10 text-[#20342b] sm:px-8 lg:px-12"><div className="mx-auto max-w-5xl"><Link href="/buyer" className="text-sm font-semibold text-[#d9704b]">← Back to marketplace</Link><p className="mt-10 text-xs font-bold uppercase tracking-[.2em] text-[#d9704b]">Settings</p><h1 className="mt-2 font-serif text-5xl">Make KalaSetu yours.</h1><p className="mt-3 max-w-xl text-[#65756c]">Manage your delivery details, communication preferences, and account access.</p><div className="mt-10 grid gap-4 sm:grid-cols-2"><section className="rounded-3xl border border-[#ddd5c7] bg-white p-7"><h2 className="font-serif text-2xl">Delivery details</h2><p className="mt-2 text-sm leading-6 text-[#65756c]">Saved addresses and contact details will be available here for faster checkout.</p><p className="mt-5 text-sm font-semibold text-[#65756c]">Delivery details will be available here when profile editing is connected.</p></section><section className="rounded-3xl border border-[#ddd5c7] bg-white p-7"><h2 className="font-serif text-2xl">Communication</h2><p className="mt-2 text-sm text-[#65756c]">Control updates about orders, inquiries, and new artisan work.</p><PreferencesForm values={preferences} /></section></div></div></main>
}
