'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { publishProduct } from '@/app/actions/products'

const tools = [
  { id: 'image', label: 'Image enhancement' },
  { id: 'description', label: 'Description generator' },
  { id: 'voice', label: 'Voice cataloging' },
  { id: 'pricing', label: 'Price assistant' },
]

type ProductData = { productName: string; shortDescription: string; detailedDescription: string; features: string[]; material: string; craftType: string; productStory: string; category: string; subcategory: string; tags: string[] }
type SpeechRecognitionLike = { start: () => void; stop: () => void; lang?: string; onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } }[] } }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null }

export default function SellerAIStudio() {
  const [tool, setTool] = useState(tools[0].id)
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [story, setStory] = useState('')
  const [image, setImage] = useState<{ file: File; originalPreview: string; enhancedPreview?: string } | null>(null)
  const [useEnhanced, setUseEnhanced] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [imageAnalyzed, setImageAnalyzed] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [imageAnalysis, setImageAnalysis] = useState<{ product: string; category: string; material: string; colors: string[]; notes: string }>()
  const [transcript, setTranscript] = useState('')
  const [speechLanguage, setSpeechLanguage] = useState('en-IN')
  const [isListening, setIsListening] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [workflowError, setWorkflowError] = useState('')
  const [generated, setGenerated] = useState<ProductData>()
  const [price, setPrice] = useState<{ totalCost: number; marketRange: { low: number; high: number } | null; suggestedPrice: number; estimated: boolean; note: string }>()
  const [customPrice, setCustomPrice] = useState('')
  const [costs, setCosts] = useState({ rawMaterialCost: '', labourCost: '', packagingCost: '', otherCost: '', shippingCost: '', quantity: '1', marketPrices: '' })
  const [isPublishing, setIsPublishing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const handleImageUpload = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadError('Choose a JPG, PNG, or WEBP image.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Choose an image smaller than 8 MB.')
      return
    }

    setUploadError('')
    const reader = new FileReader()
    reader.onload = () => {
      setImage({ file, originalPreview: String(reader.result) })
      setUseEnhanced(false)
      setImageAnalyzed(false)
      setImageAnalysis(undefined)
      setWorkflowError('')
    }
    reader.onerror = () => setUploadError('This image could not be loaded. Try another JPG, PNG, or WEBP file.')
    reader.readAsDataURL(file)
  }

  const analyzeImage = () => {
    if (!image) {
      setUploadError('Upload a product image before starting AI analysis.')
      return
    }
    setIsAnalyzing(true)
    setWorkflowError('')
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const { removeBackground } = await import('@imgly/background-removal')
        const enhancedBlob = await removeBackground(image.file)
        const enhancedDataUrl = await new Promise<string>((resolve, reject) => {
          const enhancedReader = new FileReader()
          enhancedReader.onload = () => resolve(String(enhancedReader.result))
          enhancedReader.onerror = () => reject(new Error('The enhanced image could not be read.'))
          enhancedReader.readAsDataURL(enhancedBlob)
        })
        const response = await fetch('/api/seller/ai/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageDataUrl: enhancedDataUrl }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error ?? 'Image analysis failed.')
        setImageAnalysis(data.analysis)
        setImage((current) => current ? { ...current, enhancedPreview: enhancedDataUrl } : current)
        setImageAnalyzed(true)
        setTool('description')
      } catch (error) {
        setWorkflowError(error instanceof Error ? error.message : 'Image analysis failed. Please retry.')
      } finally { setIsAnalyzing(false) }
    }
    reader.onerror = () => { setIsAnalyzing(false); setWorkflowError('The image could not be read. Please choose it again.') }
    reader.readAsDataURL(image.file)
  }

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); return }
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition
    if (!SpeechRecognition) { setWorkflowError('Speech recognition is not supported in this browser. You can type the product information instead.'); return }
    const recognition = new SpeechRecognition()
    recognition.lang = speechLanguage
    recognition.onresult = (event) => setTranscript(event.results[0][0].transcript)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => { setIsListening(false); setWorkflowError('Speech recognition failed. Please try again or type the text.') }
    recognitionRef.current = recognition
    setWorkflowError('')
    setIsListening(true)
    recognition.start()
  }

  const generateProductData = async () => {
    if (!transcript.trim()) { setWorkflowError('Speak or type product information before generating.'); return }
    setIsGenerating(true); setWorkflowError('')
    try {
      const response = await fetch('/api/seller/ai/product-data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript, imageAnalysis }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Product generation failed.')
      setGenerated(data); setProductName(data.productName || productName); setCategory(data.category || category); setStory(data.productStory || story); setTool('pricing')
    } catch (error) { setWorkflowError(error instanceof Error ? error.message : 'Product generation failed.') } finally { setIsGenerating(false) }
  }

  const classifyProduct = async () => {
    if (!generated) { setWorkflowError('Generate product data before classifying it.'); return }
    setIsGenerating(true); setWorkflowError('')
    try {
      const response = await fetch('/api/seller/ai/classify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript, imageAnalysis, product: generated }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Classification failed.')
      setGenerated((current) => current ? { ...current, ...data } : current)
    } catch (error) { setWorkflowError(error instanceof Error ? error.message : 'Classification failed.') } finally { setIsGenerating(false) }
  }

  const calculatePrice = async () => {
    setIsGenerating(true); setWorkflowError('')
    try {
      const response = await fetch('/api/seller/ai/price', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(Object.entries(costs).filter(([key]) => key !== 'marketPrices')), marketPrices: costs.marketPrices.split(',').map(Number).filter(Number.isFinite) }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Price calculation failed.')
      setPrice(data)
      if (!customPrice) setCustomPrice(String(data.suggestedPrice))
    } catch (error) { setWorkflowError(error instanceof Error ? error.message : 'Price calculation failed.') } finally { setIsGenerating(false) }
  }

  const updateGenerated = (key: keyof ProductData, value: string) => setGenerated((current) => current ? { ...current, [key]: key === 'features' || key === 'tags' ? value.split(',').map((item) => item.trim()).filter(Boolean) : value } : current)

  const publishApprovedProduct = async () => {
    const approvedPrice = customPrice || String(price?.suggestedPrice ?? '')
    if (!image || !generated?.productName || !generated.category || !generated.detailedDescription || !approvedPrice) { setWorkflowError('Complete the AI review and select a selling price before publishing.'); return }
    setIsPublishing(true); setWorkflowError('')
    try {
      await publishProduct({ name: generated.productName, description: generated.detailedDescription, category: generated.category, finalPrice: approvedPrice, images: [useEnhanced && image.enhancedPreview ? image.enhancedPreview : image.originalPreview], stock: '1', shipping: 'Seller shipping', state: 'India', tags: generated.tags.join(', '), material: generated.material, craftType: generated.craftType, story: generated.productStory })
      setWorkflowError('Product published successfully. It is now available in your seller catalog.')
    } catch (error) { setWorkflowError(error instanceof Error ? error.message : 'Publishing failed.') } finally { setIsPublishing(false) }
  }

  const suggestion = useMemo(() => {
    switch (tool) {
      case 'image':
        return {
          title: 'Image enhancement',
          body: imageAnalyzed ? `Image ready. The product is centered with enough negative space for marketplace cropping. Use warm daylight, increase contrast by 12%, and add a close-up of the weave or surface texture.` : 'Upload a product photo and start analysis to receive image-specific recommendations.'
        }
      case 'description':
        return {
          title: 'Description generator',
          body: generated?.detailedDescription || 'Capture the seller story, then generate an editable description grounded in the supplied information.'
        }
      case 'voice':
        return {
          title: 'Voice cataloging',
          body: transcript || 'Speak or type the product information. The transcript will remain editable before generation.'
        }
      case 'pricing':
        return {
          title: 'Price assistant',
          body: price ? `${price.marketRange ? `Market range ₹${price.marketRange.low.toLocaleString('en-IN')}–₹${price.marketRange.high.toLocaleString('en-IN')}.` : 'No market range supplied.'} Suggested price ₹${price.suggestedPrice.toLocaleString('en-IN')}. ${price.note}` : 'Enter your costs and calculate a transparent price estimate.'
        }
      default:
        return { title: 'AI assistant', body: 'Start with a product and generate a smart suggestion.' }
    }
  }, [category, imageAnalyzed, productName, tool])

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
                disabled={item.id !== 'image' && !imageAnalyzed}
                className={`whitespace-nowrap rounded-2xl px-4 py-3 text-left text-sm font-semibold ${tool === item.id ? 'bg-[#20342b] text-white' : 'bg-white text-[#65756c]'} disabled:cursor-not-allowed disabled:opacity-40`}
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

            <div className="mt-6 rounded-[1.5rem] border border-[#e4ded2] bg-[#fbfaf7] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#20342b]">Product image</p>
                  <p className="mt-1 text-xs text-[#65756c]">JPG, PNG, or WEBP up to 8 MB</p>
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full border border-[#d8d1c4] bg-white px-4 py-2 text-sm font-semibold text-[#20342b]">
                  {image ? 'Replace image' : 'Choose image'}
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { handleImageUpload(event.target.files?.[0]); event.currentTarget.value = '' }} />
              </div>

              {image && (
                <div className="mt-5 grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
                  <img src={useEnhanced && image.enhancedPreview ? image.enhancedPreview : image.originalPreview} alt="Product preview" className="h-44 w-full rounded-2xl object-contain bg-[#f1eee7]" onError={() => setUploadError('The selected image could not be displayed. Try exporting it as JPG or PNG.')} />
                  <div>
                    <p className="truncate text-sm font-semibold">{image.file.name}</p>
                    <p className="mt-1 text-xs text-[#65756c]">{(image.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button type="button" onClick={analyzeImage} disabled={isAnalyzing} className="mt-4 rounded-full bg-[#d9704b] px-5 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60">
                      {isAnalyzing ? 'Analyzing image...' : imageAnalyzed ? 'Analyze again' : 'Start AI analysis'}
                    </button>
                    {image.enhancedPreview && <div className="mt-3 flex gap-2"><button type="button" onClick={() => setUseEnhanced(false)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${!useEnhanced ? 'bg-[#20342b] text-white' : 'border border-[#d8d1c4]'}`}>Original</button><button type="button" onClick={() => setUseEnhanced(true)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${useEnhanced ? 'bg-[#20342b] text-white' : 'border border-[#d8d1c4]'}`}>Use Image</button></div>}
                  </div>
                </div>
              )}

              {!image && <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-5 flex min-h-32 w-full items-center justify-center rounded-2xl border border-dashed border-[#cfc7b9] text-sm text-[#65756c]">Select a product image to begin</button>}
              {uploadError && <p className="mt-3 text-sm font-semibold text-[#b44d35]">{uploadError}</p>}
            </div>

            <div className={`mt-6 rounded-[1.5rem] border border-[#e4ded2] bg-[#f9f7f3] p-5 ${tool !== 'image' && !imageAnalyzed ? 'opacity-60' : ''}`}>
              <p className="text-sm font-semibold text-[#20342b]">AI recommendation</p>
              <p className="mt-3 text-sm leading-7 text-[#65756c]">{tool !== 'image' && !imageAnalyzed ? 'Complete the image analysis first. Your description, voice, and pricing tools will use the uploaded product context.' : suggestion.body}</p>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[#e4ded2] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-sm font-semibold text-[#20342b]">Voice cataloging</p><p className="mt-1 text-xs text-[#65756c]">Speak in English, Hindi, or Odia, then edit the transcript.</p></div>
                <select value={speechLanguage} onChange={(event) => setSpeechLanguage(event.target.value)} className="rounded-xl border border-[#d8d1c4] bg-[#fbfaf7] p-2 text-sm"><option value="en-IN">English</option><option value="hi-IN">Hindi</option><option value="or-IN">Odia</option></select>
              </div>
              <textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} rows={4} placeholder="Describe the product, material, craft, origin, size, and care information..." className="mt-4 w-full rounded-xl border border-[#d8d1c4] p-3 text-sm outline-none focus:border-[#d9704b]" />
              <div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={toggleListening} className="rounded-full border border-[#d8d1c4] px-4 py-2 text-sm font-semibold">{isListening ? 'Stop listening' : 'Start speaking'}</button><button type="button" onClick={generateProductData} disabled={isGenerating || !imageAnalyzed} className="rounded-full bg-[#20342b] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{isGenerating ? 'Generating...' : 'Generate product data'}</button></div>
            </div>

            {generated && <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-[#e4ded2] bg-[#fbfaf7] p-5 sm:grid-cols-2">
              {(['productName', 'shortDescription', 'detailedDescription', 'material', 'craftType', 'productStory', 'category', 'subcategory', 'features', 'tags'] as (keyof ProductData)[]).map((key) => <label key={key} className={`flex flex-col gap-2 text-sm font-semibold capitalize text-[#20342b] ${key === 'detailedDescription' || key === 'productStory' ? 'sm:col-span-2' : ''}`}>{key.replace(/([A-Z])/g, ' $1')}<textarea value={Array.isArray(generated[key]) ? generated[key].join(', ') : generated[key]} onChange={(event) => updateGenerated(key, event.target.value)} rows={key === 'detailedDescription' || key === 'productStory' ? 3 : 1} className="rounded-xl border border-[#d8d1c4] bg-white p-3 font-normal outline-none focus:border-[#d9704b]" /></label>)}
              <button type="button" onClick={classifyProduct} disabled={isGenerating} className="w-fit rounded-full border border-[#d8d1c4] px-4 py-2 text-sm font-semibold">{isGenerating ? 'Classifying...' : 'Suggest category and tags'}</button>
            </div>}

            {generated && <div className="mt-6 rounded-[1.5rem] border border-[#e4ded2] bg-white p-5">
              <p className="text-sm font-semibold text-[#20342b]">Smart price assistant</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">{(['rawMaterialCost', 'labourCost', 'packagingCost', 'otherCost', 'shippingCost', 'quantity'] as const).map((key) => <label key={key} className="text-xs font-semibold capitalize text-[#65756c]">{key.replace(/([A-Z])/g, ' $1')}<input type="number" min="0" value={costs[key]} onChange={(event) => setCosts((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-xl border border-[#d8d1c4] p-2 text-sm text-[#20342b]" /></label>)}</div>
              <label className="mt-3 block text-xs font-semibold text-[#65756c]">Comparable market prices, comma separated<input value={costs.marketPrices} onChange={(event) => setCosts((current) => ({ ...current, marketPrices: event.target.value }))} placeholder="800, 950, 1100" className="mt-1 w-full rounded-xl border border-[#d8d1c4] p-2 text-sm font-normal text-[#20342b]" /></label>
              <button type="button" onClick={calculatePrice} disabled={isGenerating} className="mt-4 rounded-full bg-[#d9704b] px-4 py-2 text-sm font-bold text-white">Calculate price</button>
              {price && <div className="mt-4 rounded-xl bg-[#f9f7f3] p-4 text-sm"><p>Total cost: <strong>₹{price.totalCost.toLocaleString('en-IN')}</strong></p><p className="mt-1">Market range: <strong>{price.marketRange ? `₹${price.marketRange.low.toLocaleString('en-IN')}–₹${price.marketRange.high.toLocaleString('en-IN')}` : 'Unavailable'}</strong></p><p className="mt-1">Suggested price: <strong>₹{price.suggestedPrice.toLocaleString('en-IN')}</strong> {price.estimated && <span className="text-[#b44d35]">(estimate)</span>}</p><input value={customPrice} onChange={(event) => setCustomPrice(event.target.value)} className="mt-3 rounded-xl border border-[#d8d1c4] p-2" placeholder="Seller-selected price" /></div>}
            </div>}

            {workflowError && <p className="mt-4 rounded-xl bg-[#fff1ed] p-3 text-sm font-semibold text-[#b44d35]">{workflowError}</p>}

            <div className="mt-6 rounded-[1.5rem] border border-[#e4ded2] bg-white p-5">
              <p className="text-sm font-semibold text-[#20342b]">Origin story</p>
              <textarea value={story} onChange={(e) => setStory(e.target.value)} rows={4} className="mt-3 w-full rounded-xl border border-[#d8d1c4] p-3 text-sm outline-none focus:border-[#d9704b]" />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={publishApprovedProduct} disabled={isPublishing} className="rounded-full bg-[#d9704b] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{isPublishing ? 'Publishing...' : 'Publish approved product'}</button>
              <button type="button" onClick={() => setWorkflowError('Your approved work is held in this session. Publishing stores it in the seller catalog.')} className="rounded-full border border-[#d8d1c4] px-5 py-3 text-sm font-semibold">Save review</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
