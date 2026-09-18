import Link from 'next/link'
import { getPreferences } from '@/app/actions/preferences'
import { PreferencesForm } from '@/components/preferences-form'

export default async function SellerSettingsPage() {
  const preferences = await getPreferences()
  return <main className="min-h-screen bg-[#f7f5ef] px-5 py-10 text-[#20342b] sm:px-8 lg:px-12"><div className="mx-auto max-w-5xl"><Link href="/seller" className="text-sm font-semibold text-[#d9704b]">← Back to seller studio</Link><p className="mt-10 text-xs font-bold uppercase tracking-[.2em] text-[#d9704b]">Settings</p><h1 className="mt-2 font-serif text-5xl">Set up your studio.</h1><p className="mt-3 max-w-xl text-[#65756c]">Manage storefront preferences, notifications, and account access from one place.</p><div className="mt-10 grid gap-4 sm:grid-cols-2"><section className="rounded-3xl border border-[#ddd5c7] bg-white p-7"><h2 className="font-serif text-2xl">Storefront</h2><p className="mt-2 text-sm leading-6 text-[#65756c]">Your shop profile and delivery preferences are managed from your seller profile.</p><Link href="/seller/profile" className="mt-5 inline-block text-sm font-bold text-[#d9704b]">Edit seller profile →</Link></section><section className="rounded-3xl border border-[#ddd5c7] bg-white p-7"><h2 className="font-serif text-2xl">Notifications</h2><p className="mt-2 text-sm text-[#65756c]">Choose which order and inquiry updates you want to receive.</p><PreferencesForm values={preferences} /></section></div></div></main>
}
