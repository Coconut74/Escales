import { useEffect, useState, useCallback } from 'react'
import type { Investment } from '@/features/accueil/accueil.types'
import { getQuote } from '@/services/finnhub'

export interface StockPrice {
  price: number
  changePercent: number
  updatedAt: number
}

const POLL_INTERVAL = 60_000

export function useStockPrices(investments: Investment[], apiKey: string) {
  const [prices, setPrices] = useState<Record<string, StockPrice>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tickered = investments.filter(inv => inv.ticker && inv.shares && inv.shares > 0)
  // Stable key to drive the effect without object identity issues
  const tickerKey = tickered.map(i => `${i.id}:${i.ticker}`).join(',')

  const fetchAll = useCallback(async () => {
    if (!apiKey || tickered.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.allSettled(
        tickered.map(async inv => {
          const quote = await getQuote(inv.ticker!, apiKey)
          return { id: inv.id, price: quote.c, changePercent: quote.dp }
        })
      )
      const next: Record<string, StockPrice> = {}
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value.price > 0) {
          next[r.value.id] = { price: r.value.price, changePercent: r.value.changePercent, updatedAt: Date.now() }
        }
      })
      setPrices(prev => ({ ...prev, ...next }))
    } catch {
      setError('Erreur de connexion à Finnhub')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickerKey, apiKey])

  useEffect(() => {
    fetchAll()
    if (!apiKey || !tickerKey) return
    const id = setInterval(fetchAll, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchAll, tickerKey, apiKey])

  return { prices, loading, error, refresh: fetchAll }
}
