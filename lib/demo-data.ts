export type DemoProduct = {
  id: string
  name: string
  description: string
  category: string
  price: number
  imageUrl: string
  state: string
  availability: string
  sellerId: string
  sellerName: string
  shopName: string
  avatarUrl?: string
  bio?: string
}

export type DemoSeller = {
  id: string
  sellerName: string
  shopName: string
  state: string
  productCount: number
  avatarUrl?: string
  bio?: string
  address?: string
}

export const demoProducts: DemoProduct[] = [
  {
    id: 'demo-1',
    name: 'Kashmiri Papier Mâché Box',
    description: 'A hand-painted keepsake box crafted using traditional papier mâché techniques from Kashmir. Each piece carries the soft, layered finish and floral motifs of a living craft tradition.',
    category: 'Handicraft',
    price: 1850,
    imageUrl: 'https://images.unsplash.com/photo-1603561596112-db1d5eac8b9e?auto=format&fit=crop&w=900&q=85',
    state: 'Jammu & Kashmir',
    availability: 'available',
    sellerId: 'seller-kashmir',
    sellerName: 'Aamina Crafts',
    shopName: 'Aamina Crafts',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Handcrafting heirloom pieces from Srinagar with a focus on paper, lacquer and heritage gifting.',
  },
  {
    id: 'demo-2',
    name: 'Indigo Dabu Table Runner',
    description: 'A woven textile dyed with natural indigo and printed using a traditional Dabu resist process from Rajasthan. Soft, rich and made to bring warmth into a dining place.',
    category: 'Handloom',
    price: 2400,
    imageUrl: 'https://images.unsplash.com/photo-1616627561839-074385245ff6?auto=format&fit=crop&w=900&q=85',
    state: 'Rajasthan',
    availability: 'available',
    sellerId: 'seller-rajasthan',
    sellerName: 'Mitti & Loom',
    shopName: 'Mitti & Loom',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Weaving home textiles with natural dyes and family-run printing methods from Bagru.',
  },
  {
    id: 'demo-3',
    name: 'Terracotta Surahi Vase',
    description: 'A sculpted terracotta vessel shaped by hand and fired for a warm, earthy finish. This form is inspired by traditional storage jars across northern India.',
    category: 'Pottery',
    price: 1250,
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85',
    state: 'Uttar Pradesh',
    availability: 'available',
    sellerId: 'seller-up',
    sellerName: 'Ramesh Kumar',
    shopName: 'Ramesh Kumar Pottery',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Pottery rooted in Khurja with a contemporary sensibility and hand-finishing traditions.',
  },
  {
    id: 'demo-4',
    name: 'Dokra Dancing Couple',
    description: 'A brass sculpture in the Dokra tradition, handcrafted in the Bastar region using the lost-wax metal casting method and rich ceremonial forms.',
    category: 'Metalcraft',
    price: 3200,
    imageUrl: 'https://images.unsplash.com/photo-1577083288073-40892c0860a4?auto=format&fit=crop&w=900&q=85',
    state: 'Chhattisgarh',
    availability: 'available',
    sellerId: 'seller-bastar',
    sellerName: 'Bastar Collective',
    shopName: 'Bastar Collective',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    bio: 'Metalwork and craft revival in Bastar, with a deep commitment to iterative practice and fair trade partnerships.',
  },
]

export const demoSellers: DemoSeller[] = [
  { id: 'seller-kashmir', sellerName: 'Aamina Crafts', shopName: 'Aamina Crafts', state: 'Jammu & Kashmir', productCount: 3, avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', bio: 'Traditional lacquerware and papier mâché objects for modern homes.' },
  { id: 'seller-rajasthan', sellerName: 'Mitti & Loom', shopName: 'Mitti & Loom', state: 'Rajasthan', productCount: 5, avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', bio: 'Natural dye textiles and story-led home collections from Bagru.' },
  { id: 'seller-up', sellerName: 'Ramesh Kumar', shopName: 'Ramesh Kumar Pottery', state: 'Uttar Pradesh', productCount: 4, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', bio: 'Hand-thrown ceramics rooted in northern Indian craft traditions.' },
  { id: 'seller-bastar', sellerName: 'Bastar Collective', shopName: 'Bastar Collective', state: 'Chhattisgarh', productCount: 2, avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', bio: 'Living metalcraft traditions, shaped by artisan collectives and contemporary design.' },
]

export function getDemoMarketplaceData(state?: string, query?: string) {
  const normalizedState = state?.trim().toLowerCase() ?? ''
  const normalizedQuery = query?.trim().toLowerCase() ?? ''

  const filteredProducts = demoProducts.filter((product) => {
    const matchesState = !normalizedState || product.state.toLowerCase() === normalizedState
    const matchesQuery = !normalizedQuery || `${product.name} ${product.category} ${product.sellerName} ${product.state}`.toLowerCase().includes(normalizedQuery)
    return matchesState && matchesQuery
  })

  const filteredSellers = demoSellers.filter((seller) => {
    const matchesState = !normalizedState || seller.state.toLowerCase() === normalizedState
    const matchesQuery = !normalizedQuery || `${seller.sellerName} ${seller.shopName} ${seller.state}`.toLowerCase().includes(normalizedQuery)
    return matchesState && matchesQuery
  })

  return {
    products: filteredProducts,
    sellers: filteredSellers,
  }
}

export function getDemoProductById(id: string) {
  return demoProducts.find((product) => product.id === id) ?? null
}

export function getDemoReviews(id: string) {
  const map: Record<string, Array<{ rating: number; body: string; createdAt: string; buyer_name: string }>> = {
    'demo-1': [
      { rating: 5, body: 'A beautifully made heirloom piece with rich colour and detail.', createdAt: '2026-08-12T10:00:00.000Z', buyer_name: 'Nisha' },
      { rating: 4, body: 'The finish feels premium and the story behind it was very moving.', createdAt: '2026-08-21T15:30:00.000Z', buyer_name: 'Aarav' },
    ],
    'demo-2': [
      { rating: 5, body: 'The fabric is soft and the indigo tones are stunning.', createdAt: '2026-08-11T14:00:00.000Z', buyer_name: 'Meera' },
    ],
    'demo-3': [
      { rating: 4, body: 'It feels authentic and well crafted for display or daily use.', createdAt: '2026-08-16T12:15:00.000Z', buyer_name: 'Vihaan' },
    ],
    'demo-4': [
      { rating: 5, body: 'The detailing is beautifully sculpted and feels special.', createdAt: '2026-08-18T09:45:00.000Z', buyer_name: 'Ira' },
    ],
  }

  return map[id] ?? []
}

export type DemoCartItem = {
  id: string
  product_id: string
  name: string
  quantity: number
  price: number
  imageUrl?: string
  availability: string
  seller_name?: string
}

export type DemoOrder = {
  id: string
  buyerId: string
  subtotal: number
  shipping: number
  total: number
  shippingAddress: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
}

export const demoCartByUser: Record<string, DemoCartItem[]> = {
  'demo-buyer': [
    { id: 'demo-cart-1', product_id: 'demo-2', name: 'Indigo Dabu Table Runner', quantity: 1, price: 2400, availability: 'available', seller_name: 'Mitti & Loom' },
  ],
}

export const demoWishlistByUser: Record<string, string[]> = {
  'demo-buyer': ['demo-2'],
}

export const demoOrdersByUser: Record<string, DemoOrder[]> = {
  'demo-buyer': [],
}

export function demoRoleToUserId(role: 'buyer' | 'seller') {
  return role === 'buyer' ? 'demo-buyer' : 'demo-seller'
}

export function getDemoBuyerCart(userId: string) {
  return demoCartByUser[userId] ?? []
}

export function addDemoCartItem(userId: string, productId: string, quantity = 1) {
  const cart = demoCartByUser[userId] ?? []
  const product = getDemoProductById(productId)
  if (!product) throw new Error('Product not found')
  const nextQty = Math.max(1, Number(quantity) || 1)
  const existing = cart.find((item) => item.product_id === productId)
  if (existing) {
    existing.quantity = Math.min(50, existing.quantity + nextQty)
    return existing
  }

  cart.push({
    id: `demo-cart-${Date.now()}`,
    product_id: productId,
    name: product.name,
    quantity: nextQty,
    price: product.price,
    imageUrl: product.imageUrl,
    availability: product.availability,
    seller_name: product.shopName || product.sellerName,
  })
  demoCartByUser[userId] = cart
  return cart[cart.length - 1]
}

export function toggleDemoWishlist(userId: string, productId: string) {
  const entries = demoWishlistByUser[userId] ?? []
  const next = entries.includes(productId) ? entries.filter((item) => item !== productId) : [...entries, productId]
  demoWishlistByUser[userId] = next
  return next
}

export function getDemoBuyerOrders(userId: string) {
  return demoOrdersByUser[userId] ?? []
}

export function createDemoCheckoutOrder(userId: string, address: string) {
  const cart = getDemoBuyerCart(userId)
  const available = cart.filter((item) => item.availability === 'available')
  if (!available.length) throw new Error('Your cart is empty or contains unavailable products')
  const subtotal = available.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const orderId = `demo-order-${Date.now()}`
  const order: DemoOrder = {
    id: orderId,
    buyerId: userId,
    subtotal,
    shipping: 0,
    total: subtotal,
    shippingAddress: address.trim(),
    paymentStatus: 'unavailable',
    orderStatus: 'pending_payment',
    createdAt: new Date().toISOString(),
  }
  const existing = demoOrdersByUser[userId] ?? []
  demoOrdersByUser[userId] = [order, ...existing]
  demoCartByUser[userId] = []
  return order
}
