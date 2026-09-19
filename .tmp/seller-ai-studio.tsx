'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

const tools = [
  { id: 'image', label: 'Image enhancement' },
  { id: 'description', label: 'Description generator' },
  { id: 'voice', label: 'Voice cataloging' },
  { id: 'pricing', label: 'Price assistant' },
]

export default function SellerAIStudio() {
  const [tool, setTool] = useState(tools[0].id)
  const [productName, setProductName] = useState('Handwoven silk dupatta')
  const [category, setCategory] = useState('Textiles')
  const [story, setStory] = useState('Woven by artisans in Varanasi using natural dyes and handloom techniques.')

  const suggestion = useMemo(() => {
    switch (tool) {
      case 'image':
        return {
          title: 'Image enhancement',
          body: `Use a warm daylight setup, increase contrast by 12%, and keep the product in the center frame. Include close-ups of texture and stitch detail to raise buyer trust and click-through rate on mobile.`
        }
      case 'description':
        return {
          title: 'Description generator',
          body: `${productName} is a ${category.toLowerCase()} heritage piece handcrafted in small batches. Each item carries the story of slow craftsmanship, natural materials, and artisan skill, designed for buyers who value authenticity and mindful living.`
        }
      case 'voice':
        return {
          title: 'Voice cataloging',
          body: `Voice note suggestion: “This ${category.toLowerCase()} piece is made in small runs with natural fibers and a subtler, hand-finished texture. It brings a story of origin and craft to every table and wardrobe.”`
        }
      case 'pricing':
        return {
          title: 'Price assistant',
          body: `Recommended price band: ₹2,600–₹3,200. A 7% festival uplift is appropriate while preserving a margin above 40% and keeping the item competitive against similar handcrafted ${category.toLowerCase()} products.`
        }
      default:
        return { title: 'AI assistant', body: 'Start with a product and generate a smart suggestion.' }
    }
  }, [category, productName, tool])

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 text-[#20342b] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/seller" className="text-sm font-semibold text-[#d9704b]">← Seller studio</Link>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#d9704b]">Seller tools</p>
            <h1 className="mt-2 font-serif text-5xl">AI Studio.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#65756c]">Prepare a product listing with assisted image, language, voice, and pricing tools. Review every suggestion before saving.</p>
          </div>
          <Link href="/seller" className="rounded-full border border-[#d8d1c4] bg-white px-4 py-2 text-sm font-semibold">Back to dashboard</Link>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-[260px_1fr]">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {tools.map((item) => (
              <button
                key={item.id}
                onClick={() => setTool(item.id)}
                className={`whitespace-nowrap rounded-2xl px-4 py-3 text-left text-sm font-semibold ${tool === item.id ? 'bg-[#20342b] text-white' : 'bg-white text-[#65756c]'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <section className="rounded-[2rem] border border-[#e4ded2] bg-white p-6 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9704b]">{suggestion.title}</p>
            <h2 className="mt-3 font-serif text-3xl">Work on a product.</h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-3 rounded-3xl border border-[#d8d1c4] bg-[#fbfaf7] p-4">
                <span className="text-sm font-semibold">Product name</span>
                <input value={productName} onChange={(e) => setProductName(e.target.value)} className="rounded-xl border border-[#d8d1c4] bg-white p-3 outline-none focus:border-[#d9704b]" />
              </label>

              <label className="flex flex-col gap-3 rounded-3xl border border-[#d8d1c4] bg-[#fbfaf7] p-4">
                <span className="text-sm font-semibold">Category</span>
                <input value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-[#d8d1c4] bg-white p-3 outline-none focus:border-[#d9704b]" />
              </label>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#e4ded2] bg-[#f9f7f3] p-5">
              <p className="text-sm font-semibold text-[#20342b]">AI recommendation</p>
              <p className="mt-3 text-sm leading-7 text-[#65756c]">{suggestion.body}</p>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#e4ded2] bg-white p-5">
              <p className="text-sm font-semibold text-[#20342b]">Origin story</p>
              <textarea value={story} onChange={(e) => setStory(e.target.value)} rows={4} className="mt-3 w-full rounded-xl border border-[#d8d1c4] p-3 text-sm outline-none focus:border-[#d9704b]" />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-[#d9704b] px-5 py-3 text-sm font-bold text-white">Generate suggestion</button>
              <button className="rounded-full border border-[#d8d1c4] px-5 py-3 text-sm font-semibold">Save draft</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
