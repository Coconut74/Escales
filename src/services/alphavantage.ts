const BASE = 'https://www.alphavantage.co/query'

export interface AVSearchResult {
  symbol: string
  displaySymbol: string
  description: string
  type: string
}

export interface AVQuote {
  price: number
  changePercent: number
}

export async function searchSymbol(query: string, apiKey: string): Promise<AVSearchResult[]> {
  const url = `${BASE}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`AV search: ${res.status}`)
  const data = await res.json()
  const matches: any[] = data.bestMatches ?? []
  return matches.slice(0, 8).map((m) => ({
    symbol: m['1. symbol'],
    displaySymbol: m['1. symbol'],
    description: m['2. name'],
    type: m['3. type'],
  }))
}

export async function getQuote(symbol: string, apiKey: string): Promise<AVQuote> {
  const url = `${BASE}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`AV quote: ${res.status}`)
  const data = await res.json()
  const q = data['Global Quote']
  if (!q) throw new Error('AV quote: empty response')
  return {
    price: parseFloat(q['05. price']),
    changePercent: parseFloat(q['10. change percent']),
  }
}
