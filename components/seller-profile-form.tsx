'use client'

import { useState } from 'react'

type ProfileValues = {
  shopName: string
  state: string
  bio: string
  address: string
  phone: string
}

export function SellerProfileForm({ initial }: { initial: ProfileValues }) {
  const [values, setValues] = useState(initial)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (key: keyof ProfileValues, value: string) => setValues((current) => ({ ...current, [key]: value }))

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/seller/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'The seller profile could not be saved.')
      setMessage('Seller profile saved.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The seller profile could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
    <label className="flex flex-col gap-2 text-sm font-semibold">Shop name<input value={values.shopName} onChange={(event) => update('shopName', event.target.value)} required className="rounded-xl border border-[#d8d1c4] bg-[#fbfaf7] p-3 font-normal outline-none focus:border-[#d9704b]" /></label>
    <label className="flex flex-col gap-2 text-sm font-semibold">State<input value={values.state} onChange={(event) => update('state', event.target.value)} required className="rounded-xl border border-[#d8d1c4] bg-[#fbfaf7] p-3 font-normal outline-none focus:border-[#d9704b]" /></label>
    <label className="flex flex-col gap-2 text-sm font-semibold sm:col-span-2">Bio<textarea value={values.bio} onChange={(event) => update('bio', event.target.value)} rows={4} className="rounded-xl border border-[#d8d1c4] bg-[#fbfaf7] p-3 font-normal outline-none focus:border-[#d9704b]" /></label>
    <label className="flex flex-col gap-2 text-sm font-semibold">Address<textarea value={values.address} onChange={(event) => update('address', event.target.value)} rows={3} className="rounded-xl border border-[#d8d1c4] bg-[#fbfaf7] p-3 font-normal outline-none focus:border-[#d9704b]" /></label>
    <label className="flex flex-col gap-2 text-sm font-semibold">Phone<input value={values.phone} onChange={(event) => update('phone', event.target.value)} inputMode="tel" className="rounded-xl border border-[#d8d1c4] bg-[#fbfaf7] p-3 font-normal outline-none focus:border-[#d9704b]" /></label>
    <div className="sm:col-span-2 flex items-center gap-4"><button type="submit" disabled={saving} className="rounded-full bg-[#20342b] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving profile...' : 'Save profile'}</button>{message && <p className="text-sm text-[#65756c]" role="status">{message}</p>}</div>
  </form>
}
