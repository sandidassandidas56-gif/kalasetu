import Link from 'next/link'

const metrics = [
  { label: 'Product views', value: '2,430', note: '+18% from last week' },
  { label: 'Saved listings', value: '681', note: 'Strong wish-list intent' },
  { label: 'Inquiry conversion', value: '14%', note: 'Up 4 points' },
]

const channels = [
  { label: 'Marketplace', value: '62%' },
  { label: 'Direct search', value: '23%' },
  { label: 'Repeat customers', value: '15%' },
]

export default function SellerAnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] px-5 py-10 text-[#20342b] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/seller" className="text-sm font-semibold text-[#d9704b]">← Back to seller studio</Link>
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-[#d9704b]">Seller analytics</p>
        <h1 className="mt-2 font-serif text-5xl">Know what is resonating.</h1>
        <p className="mt-3 max-w-xl text-[#65756c]">Views, saves, inquiries, and orders are trending upward across your top categories. Use these signals to shape pricing and product upgrades.</p>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-dashed border-[#cfc7b9] bg-white p-6">
              <p className="text-sm text-[#65756c]">{metric.label}</p>
              <p className="mt-5 font-serif text-4xl">{metric.value}</p>
              <p className="mt-2 text-xs text-[#89948d]">{metric.note}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-[#e4ded2] bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9704b]">Traffic mix</p>
            <div className="mt-6 h-52 rounded-[1.5rem] bg-gradient-to-r from-[#f3e4d8] via-[#f7f2ec] to-[#ebf3ed] p-4">
              <div className="flex h-full items-end gap-3">
                {[32, 42, 28, 55, 68, 60, 82].map((height, index) => (
                  <div key={height + index} className="flex-1 rounded-t-2xl bg-[#20342b]/80" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e4ded2] bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9704b]">Visitor sources</p>
            <div className="mt-6 space-y-4">
              {channels.map((channel) => (
                <div key={channel.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-[#20342b]">{channel.label}</span>
                    <span className="font-semibold text-[#20342b]">{channel.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f1eee7]">
                    <div className="h-full rounded-full bg-[#d9704b]" style={{ width: channel.value }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
