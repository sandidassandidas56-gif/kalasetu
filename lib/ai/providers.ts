export type ProductDraft = {
  productName: string
  shortDescription: string
  detailedDescription: string
  features: string[]
  material: string
  craftType: string
  productStory: string
  category: string
  subcategory: string
  tags: string[]
}

export type ImageEnhancement = {
  enhancedImageDataUrl: string
  provider: string
  analysis: { product: string; category: string; material: string; colors: string[]; notes: string }
}

function required(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is not configured on the server.`)
  return value
}

function extractJson(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i)?.[1]
  return JSON.parse(fenced ?? text.trim()) as Record<string, unknown>
}

async function openAiChat(body: Record<string, unknown>) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${required('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`OpenAI request failed (${response.status}).`)
  const data = await response.json() as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('The AI provider returned an empty response.')
  return content
}

export async function extractProductData(transcript: string, imageAnalysis?: ImageEnhancement['analysis']) {
  const content = await openAiChat({
    model: process.env.OPENAI_TEXT_MODEL ?? 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'You structure seller-provided craft information. Never invent facts. Use empty strings, empty arrays, or "Needs seller input" when information is missing. Return only JSON with productName, shortDescription, detailedDescription, features, material, craftType, productStory, category, subcategory, tags.' },
      { role: 'user', content: JSON.stringify({ transcript, imageAnalysis: imageAnalysis ?? null }) },
    ],
  })
  const value = extractJson(content)
  return {
    productName: String(value.productName ?? ''),
    shortDescription: String(value.shortDescription ?? ''),
    detailedDescription: String(value.detailedDescription ?? ''),
    features: Array.isArray(value.features) ? value.features.map(String) : [],
    material: String(value.material ?? ''),
    craftType: String(value.craftType ?? ''),
    productStory: String(value.productStory ?? ''),
    category: String(value.category ?? ''),
    subcategory: String(value.subcategory ?? ''),
    tags: Array.isArray(value.tags) ? value.tags.map(String) : [],
  } satisfies ProductDraft
}

export async function analyzeAndEnhanceImage(imageDataUrl: string): Promise<ImageEnhancement> {
  const imageResponse = await fetch(imageDataUrl)
  if (!imageResponse.ok) throw new Error('The uploaded image could not be read.')
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
  const contentType = imageResponse.headers.get('content-type') ?? 'image/jpeg'
  const base64 = imageBuffer.toString('base64')
  const content = await openAiChat({
    model: process.env.OPENAI_VISION_MODEL ?? 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: [
      { type: 'text', text: 'Analyze only what is visible. Return JSON with product, category, material, colors (array), notes. Do not guess missing details.' },
      { type: 'image_url', image_url: { url: `data:${contentType};base64,${base64}` } },
    ] }],
  })
  const raw = extractJson(content)
  const analysis = {
    product: String(raw.product ?? ''),
    category: String(raw.category ?? ''),
    material: String(raw.material ?? ''),
    colors: Array.isArray(raw.colors) ? raw.colors.map(String) : [],
    notes: String(raw.notes ?? ''),
  }

  return {
    enhancedImageDataUrl: imageDataUrl,
    provider: 'client-open-source-background-removal',
    analysis,
  }
}

export async function classifyProduct(input: { transcript: string; imageAnalysis?: ImageEnhancement['analysis']; product: ProductDraft }) {
  const content = await openAiChat({
    model: process.env.OPENAI_TEXT_MODEL ?? 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Classify handmade marketplace products conservatively. Use only supplied information. Return JSON with category, subcategory, material, craftType, tags. Use empty strings or arrays when unsupported.' },
      { role: 'user', content: JSON.stringify(input) },
    ],
  })
  const value = extractJson(content)
  return {
    category: String(value.category ?? ''),
    subcategory: String(value.subcategory ?? ''),
    material: String(value.material ?? ''),
    craftType: String(value.craftType ?? ''),
    tags: Array.isArray(value.tags) ? value.tags.map(String) : [],
  }
}
