'use client'

import Link from 'next/link'
import { useState } from 'react'

const tools = ['Image enhancement', 'Description generator', 'Voice cataloging', 'Price assistant']

export default function SellerAIStudio() {
  const [tool, setTool] = useState(tools[0])
  return <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-[#20342b] sm:px-8 lg:px-12">
    <div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/seller" className="text-sm font-semibold text-[#d9704b]">← Seller studio</Link><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#d9704b]">Seller tools</p><h1 className="mt-2 font-serif text-5xl">AI Studio.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#65756c]">Prepare a product listing with assisted image, language, voice, and pricing tools. Review every suggestion before saving.</p></div><Link href="/seller" className="rounded-full border border-[#d8d1c4] bg-white px-4 py-2 text-sm font-semibold">Back to dashboard</Link></header>
      <div className="mt-10 grid gap-6 lg:grid-cols-[250px_1fr]"><nav className="flex gap-2 overflow-x-auto lg:flex-col">{tools.map(item => <button key={item} onClick={() => setTool(item)} className={`whitespace-nowrap rounded-2xl px-4 py-3 text-left text-sm font-semibold ${tool === item ? 'bg-[#20342b] text-white' : 'bg-white text-[#65756c]'}`}>{item}</button>)}</nav><section className="rounded-[2rem] border border-[#e4ded2] bg-white p-6 sm:p-9"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#d9704b]">{tool}</p><h2 className="mt-3 font-serif text-3xl">Work on a product.</h2><div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#d8d1c4] bg-[#fbfaf7] p-6 text-center"><span className="font-semibold">Select or create product</span><span className="mt-2 text-sm text-[#65756c]">Choose a saved listing or begin a new draft.</span><input type="file" accept="image/*" className="sr-only" /></label><div className="rounded-3xl bg-[#eef4ed] p-6"><p className="font-semibold">Seller review required</p><p className="mt-2 text-sm leading-6 text-[#65756c]">AI suggestions will appear here after you provide product information. Nothing is saved or published automatically.</p></div></div><div className="mt-6 flex flex-wrap gap-3"><button className="rounded-full bg-[#d9704b] px-5 py-3 text-sm font-bold text-white">Start with product</button><button className="rounded-full border border-[#d8d1c4] px-5 py-3 text-sm font-semibold">Save draft</button></div></section></div></div>
  </main>
}
