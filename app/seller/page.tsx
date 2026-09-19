'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, BarChart3, Bell, Bot, Boxes, CircleDollarSign, LayoutDashboard, MessageSquare, Package, Plus, Settings, Sparkles, Store } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { RequireSeller } from '@/components/auth-provider'
import { SellerNotificationPopover } from '@/components/seller-notification-popover'

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

const aiSuggestions = [
  { title: 'Image enhancement', detail: 'Sharpen your product photos and improve light balance to raise CTR by 18%.' },
  { title: 'Description rewrite', detail: 'Use the artisan origin story for higher trust and better conversions on mobile.' },
  { title: 'Pricing assistant', detail: 'Your current margin is healthy; consider a 7% increase on festive sets.' },
]

type DashboardData = {
  summary: { totalProducts: number; published: number; pendingOrders: number; completedOrders: number; revenue: number; inquiries: number }
  recentOrders: { orderId: string; buyer: string; item: string; amount: number; status: string }[]
  topProducts: { name: string; sales: number; revenue: number }[]
}

const emptyDashboard: DashboardData = {
  summary: { totalProducts: 0, published: 0, pendingOrders: 0, completedOrders: 0, revenue: 0, inquiries: 0 },
  recentOrders: [],
  topProducts: [],
}

export default function SellerPage() {
  const [active, setActive] = useState('Dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/seller/dashboard', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load seller data')))
      .then((data: DashboardData) => setDashboard(data))
      .catch(() => setDashboard(emptyDashboard))
  }, [])

  const logout = async () => {
    const result = await authClient.signOut()
    if (result.error) return
    router.replace('/')
    router.refresh()
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
              {dashboard.topProducts.length === 0 ? <p className="rounded-2xl bg-[#fbfaf7] p-5 text-sm text-[#65756c]">Your paid product performance will appear here after your first order.</p> : dashboard.topProducts.map((product) => (
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
                    <p className="text-lg font-semibold text-[#20342b]">₹{Number(product.revenue).toLocaleString('en-IN')}</p>
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
              {dashboard.recentOrders.length === 0 ? <p className="p-5 text-sm text-[#65756c]">No orders have been placed for your products yet.</p> : dashboard.recentOrders.map((order) => (
                <div key={order.orderId} className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-4 border-b border-[#f7f4f0] px-5 py-4 text-sm last:border-b-0">
                  <div>
                    <p className="font-semibold text-[#20342b]">#{order.orderId.slice(0, 8)}</p>
                    <p className="mt-1 text-[#65756c]">{order.item}</p>
                  </div>
                  <span className="text-[#20342b]">{order.buyer}</span>
                  <span className="font-semibold text-[#20342b]">₹{Number(order.amount).toLocaleString('en-IN')}</span>
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
              {[{ label: 'Catalog items', value: dashboard.summary.totalProducts }, { label: 'Published items', value: dashboard.summary.published }, { label: 'Buyer inquiries', value: dashboard.summary.inquiries }].map((metric) => (
                <div key={metric.label} className="rounded-[1.75rem] border border-[#e4ded2] bg-white p-5">
                  <p className="text-sm text-[#65756c]">{metric.label}</p>
                  <p className="mt-5 font-serif text-4xl">{metric.value}</p>
                  <p className="mt-2 text-xs text-[#65756c]">Live from your account</p>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                { label: 'Total products', value: dashboard.summary.totalProducts.toLocaleString('en-IN'), trend: 'All catalog items' },
                { label: 'Published', value: dashboard.summary.published.toLocaleString('en-IN'), trend: 'Visible in marketplace' },
                { label: 'Pending orders', value: dashboard.summary.pendingOrders.toLocaleString('en-IN'), trend: 'Need fulfilment' },
                { label: 'Completed orders', value: dashboard.summary.completedOrders.toLocaleString('en-IN'), trend: 'Paid and delivered' },
                { label: 'Revenue', value: `₹${Number(dashboard.summary.revenue).toLocaleString('en-IN')}`, trend: 'Paid order value' },
                { label: 'Inquiries', value: dashboard.summary.inquiries.toLocaleString('en-IN'), trend: 'Buyer conversations' },
              ].map((card) => (
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
                  <span className="rounded-full bg-[#eef4ed] px-3 py-1 text-xs font-bold text-[#20342b]">{dashboard.summary.published} live</span>
                </div>
                <div className="mt-6 rounded-[1.5rem] bg-[#f7f5ef] p-6 text-sm leading-6 text-[#65756c]">Live sales charts will appear after buyer views, orders, and inquiries are recorded. No estimated activity is shown here.</div>
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
  }, [active, router, dashboard])

  const navigateItem = (item: string) => {
    const routes: Record<string, string> = {
      Products: '/seller/products',
      'Add Product': '/seller/add-product',
      Orders: '/seller/orders',
      'Buyer Inquiries': '/seller/inquiries',
      Messages: '/seller/messages',
      'AI Studio': '/seller/ai-studio',
      Analytics: '/seller/analytics',
      'Finance & Invoices': '/seller/finance',
      Notifications: '/seller/notifications',
      'Seller Profile': '/seller/profile',
      Settings: '/seller/settings',
    }
    if (routes[item]) {
      router.push(routes[item])
      return
    }
    setActive(item)
    setMobileOpen(false)
  }

  return <RequireSeller>
    <>
    <SellerNotificationPopover />
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
                <button onClick={() => router.push('/seller/profile')} className="rounded-full bg-[#20342b] px-4 py-2 text-sm font-bold text-white">Profile</button>
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
    </>
  </RequireSeller>
}
