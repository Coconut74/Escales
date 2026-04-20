const BASE = 'https://finnhub.io/api/v1'

export interface FinnhubQuote {
  c: number   // current price
  d: number   // change
  dp: number  // change percent
  pc: number  // previous close
}

export interface FinnhubSearchResult {
  description: string
  displaySymbol: string
  symbol: string
  type: string
}

export async function searchSymbol(query: string, apiKey: string): Promise<FinnhubSearchResult[]> {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}&token=${apiKey}`)
  if (!res.ok) throw new Error(`Finnhub search: ${res.status}`)
  const data = await res.json()
  return (data.result ?? []).slice(0, 8) as FinnhubSearchResult[]
}

export async function getQuote(symbol: string, apiKey: string): Promise<FinnhubQuote> {
  const res = await fetch(`${BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`)
  if (!res.ok) throw new Error(`Finnhub quote: ${res.status}`)
  return res.json()
}
