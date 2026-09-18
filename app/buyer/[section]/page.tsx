import BuyerPage from '../page'
export default async function BuyerSectionPage({ params }: { params: Promise<{ section: string }> }) { await params; return <BuyerPage /> }
