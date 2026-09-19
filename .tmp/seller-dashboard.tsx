'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, BarChart3, Bell, Bot, Boxes, CircleDollarSign, LayoutDashboard, MessageSquare, Package, Plus, Settings, Sparkles, Store } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Products', icon: Package },
  { label: 'Add Product', icon: Plus },
  { label: 'Orders', icon: Boxes },
  { label: 'Buyer Inquiries', icon: MessageSquare },
  { label: 'Bulk Requests', icon: Sparkles },
  { label: 'Messages', icon: MessageSquare },
  { label: 'AI Studio', icon: Bot },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Finance & Invoices', icon: CircleDollarSign },
  { label: 'Notifications', icon: Bell },
  { label: 'Seller Profile', icon: Store },
  { label: 'Settings', icon: Settings },
]

const summaryCards = [
  { label: 'Total products', value: '28', trend: '5 this month' },
  { label: 'Published', value: '19', trend: '+4 from last week' },
  { label: 'Pending orders', value: '12', trend: '6 need dispatch' },
  { label: 'Completed orders', value: '74', trend: '95% fulfilment' },
  { label: 'Revenue', value: '₹86,400', trend: 'This month' },
  { label: 'Inquiries', value: '21', trend: '9 hot leads' },
]

const recentOrders = [
  { id: '#KLS-1048', buyer: 'Aditi S.', item: 'Handwoven shawl', amount: '₹3,600', status: 'Packed' },
  { id: '#KLS-1047', buyer: 'Rohit M.', item: 'Terracotta lamp', amount: '₹1,720', status: 'In transit' },
  { id: '#KLS-1046', buyer: 'Meera K.', item: 'Block print set', amount: '₹2,450', status: 'Awaiting review' },
]

const topProducts = [
  { name: 'Banjara handloom stole', sales: 41, revenue: '₹23,900' },
  { name: 'Copper diya set', sales: 28, revenue: '₹17,200' },
  { name: 'Palm leaf basket', sales: 19, revenue: '₹12,600' },
]

const aiSuggestions = [
  { title: 'Image enhancement', detail: 'Sharpen your product photos and improve light balance to raise CTR by 18%.' },
  { title: 'Description rewrite', detail: 'Use the artisan origin story for higher trust and better conversions on mobile.' },
  { title: 'Pricing assistant', detail: 'Your current margin is healthy; consider a 7% increase on festive sets.' },
]

export default function SellerPage() {
  const [active, setActive] = useState('Dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  const logout = async () => {
    await authClient.signOut()
    router.push('/')
  }

  const renderSection = useMemo(() => {
    switch (active) {
      case 'Products':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9704b]">Catalog overview</p>
                <h2 className="mt-2 font-serif text-4xl">Your products</h2>
              </div>
              <button onClick={() => router.push('/seller/add-product')} className="rounded-full bg-[#20342b] px-5 py-2.5 text-sm font-semibold text-white">Add product</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {topProducts.map((product) => (
                <article key={product.name} className="rounded-[1.75rem] border border-[#e4ded2] bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[#d9704b]">Best seller</p>
                      <h3 className="mt-2 font-serif text-2xl">{product.name}</h3>
                    </div>
                    <span className="rounded-full bg-[#eef4ed] px-3 py-1 text-xs font-bold text-[#20342b]">Live</span>
                  </div>
                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-[#65756c]">Units sold</p>
                      <p className="mt-2 font-serif text-3xl">{product.sales}</p>
                    </div>
                    <p className="text-lg font-semibold text-[#20342b]">{product.revenue}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )
      case 'Orders':
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9704b]">Order flow</p>
              <h2 className="mt-2 font-serif text-4xl">Recent orders</h2>
            </div>
            <div className="overflow-hidden rounded-[1.75rem] border border-[#e4ded2] bg-white">
              <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-4 border-b border-[#f1eee7] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#65756c]">
                <span>Order</span>
                <span>Buyer</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              {recentOrders.map((order) => (
                <div key={order.id} className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-4 border-b border-[#f7f4f0] px-5 py-4 text-sm last:border-b-0">
                  <div>
                    <p className="font-semibold text-[#20342b]">{order.id}</p>
                    <p className="mt-1 text-[#65756c]">{order.item}</p>
                  </div>
                  <span className="text-[#20342b]">{order.buyer}</span>
                  <span className="font-semibold text-[#20342b]">{order.amount}</span>
                  <span className="inline-flex w-fit rounded-full bg-[#eef4ed] px-2.5 py-1 text-xs font-bold text-[#20342b]">{order.status}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'AI Studio':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9704b]">Smart selling</p>
                <h2 className="mt-2 font-serif text-4xl">AI Studio</h2>
              </div>
              <Link href="/seller/ai-studio" className="rounded-full border border-[#d8d1c4] bg-white px-4 py-2 text-sm font-semibold">Open workspace</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {aiSuggestions.map((item) => (
                <article key={item.title} className="rounded-[1.75rem] border border-[#e4ded2] bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9704b]">{item.title}</p>
                  <p className="mt-4 text-sm leading-6 text-[#65756c]">{item.detail}</p>
                  <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#20342b]">Review <ArrowRight className="h-4 w-4" /></button>
                </article>
              ))}
            </div>
          </div>
        )
      case 'Analytics':
        return (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9704b]">Market signal</p>
              <h2 className="mt-2 font-serif text-4xl">Performance insights</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {['Visits', 'Save rate', 'Inquiry conversion'].map((metric, idx) => (
                <div key={metric} className="rounded-[1.75rem] border border-[#e4ded2] bg-white p-5">
                  <p className="text-sm text-[#65756c]">{metric}</p>
                  <p className="mt-5 font-serif text-4xl">{idx === 0 ? '2.4k' : idx === 1 ? '27%' : '14%'}</p>
                  <p className="mt-2 text-xs text-[#65756c]">{idx === 0 ? '+18% vs last week' : idx === 1 ? 'Up 4 points' : 'Healthy buyer intent'}</p>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {summaryCards.map((card) => (
                <div key={card.label} className="rounded-[1.75rem] border border-[#e4ded2] bg-white p-5">
                  <p className="text-sm text-[#65756c]">{card.label}</p>
                  <p className="mt-4 font-serif text-4xl">{card.value}</p>
                  <p className="mt-2 text-xs text-[#65756c]">{card.trend}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-[2rem] border border-[#e4ded2] bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9704b]">Seller pulse</p>
                    <h3 className="mt-2 font-serif text-3xl">Your shop is growing</h3>
                  </div>
                  <span className="rounded-full bg-[#eef4ed] px-3 py-1 text-xs font-bold text-[#20342b]">+12.6%</span>
                </div>
                <div className="mt-6 h-44 rounded-[1.5rem] bg-gradient-to-r from-[#f3e4d8] via-[#f6f3ee] to-[#eaf3eb] p-4">
                  <div className="flex h-full items-end gap-3">
                    {[34, 48, 39, 65, 57, 80, 92].map((height, index) => (
                      <div key={height + index} className="flex-1 rounded-t-2xl bg-[#d9704b]/80" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#e4ded2] bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9704b]">Quick actions</p>
                <div className="mt-5 space-y-3">
                  <button onClick={() => router.push('/seller/add-product')} className="flex w-full items-center justify-between rounded-2xl bg-[#20342b] px-4 py-3 text-left text-sm font-semibold text-white">
                    Create new product <ArrowRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => setActive('AI Studio')} className="flex w-full items-center justify-between rounded-2xl border border-[#d8d1c4] bg-[#fbfaf7] px-4 py-3 text-left text-sm font-semibold text-[#20342b]">
                    Open AI review <ArrowRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => setActive('Analytics')} className="flex w-full items-center justify-between rounded-2xl border border-[#d8d1c4] bg-[#fbfaf7] px-4 py-3 text-left text-sm font-semibold text-[#20342b]">
                    View insights <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }, [active, router])

  const navigateItem = (item: string) => {
    if (item === 'Add Product') {
      router.push('/seller/add-product')
      return
    }
    if (item === 'AI Studio') {
      router.push('/seller/ai-studio')
      return
    }
    setActive(item)
    setMobileOpen(false)
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#20342b]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-[#e4ded2] bg-[#fbfaf7] p-6 lg:flex">
          <Link href="/" className="font-serif text-3xl">KalaSetu<span className="text-[#d9704b]">.</span></Link>
          <p className="mt-14 text-xs font-bold uppercase tracking-[0.2em] text-[#d9704b]">Seller studio</p>

          <nav className="mt-5 flex flex-col gap-1">
            {navItems.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => navigateItem(label)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${active === label ? 'bg-[#20342b] font-bold text-white' : 'text-[#65756c] hover:bg-[#eef1eb]'}`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <button onClick={logout} className="mt-auto rounded-full border border-[#d9704b] px-4 py-2 text-sm font-bold text-[#d9704b]">Log out</button>
        </aside>

        <section className="flex-1 p-5 sm:p-8 lg:p-12">
          <div className="mx-auto max-w-7xl">
            <header className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileOpen((value) => !value)} className="rounded-full border border-[#d8d1c4] px-3 py-2 text-sm lg:hidden">Menu</button>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d9704b]">Artisan seller dashboard</p>
                  <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{active}.</h1>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/" className="hidden rounded-full border border-[#d8d1c4] px-4 py-2 text-sm sm:block">Marketplace</Link>
                <button onClick={() => setActive('Seller Profile')} className="rounded-full bg-[#20342b] px-4 py-2 text-sm font-bold text-white">Profile</button>
              </div>
            </header>

            {mobileOpen && (
              <div className="mt-6 rounded-[1.5rem] border border-[#e4ded2] bg-white p-3 lg:hidden">
                {navItems.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => navigateItem(label)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${active === label ? 'bg-[#20342b] font-bold text-white' : 'text-[#65756c]'}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8">{renderSection}</div>
          </div>
        </section>
      </div>
    </main>
  )
}
