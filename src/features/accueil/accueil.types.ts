export type InvestmentCategory =
  | 'etf'
  | 'immo'
  | 'crypto'
  | 'epargne'
  | 'obligations'
  | 'autre'

export interface Investment {
  id: string
  label: string
  category: InvestmentCategory
  value: number
  change?: number  // évolution en % (ex: 5.6 = +5.6%)
  ticker?: string  // symbole Finnhub (ex: "AAPL", "BTC-USD")
  shares?: number  // nombre de parts/unités
}

export const CATEGORY_LABELS: Record<InvestmentCategory, string> = {
  etf:         'ETF / Actions',
  immo:        'Immobilier',
  crypto:      'Crypto',
  epargne:     'Épargne',
  obligations: 'Obligations',
  autre:       'Autre',
}

export const CATEGORY_COLORS: Record<InvestmentCategory, { bg: string; text: string }> = {
  etf:         { bg: '#60A5FA', text: '#1e3a8a' },
  immo:        { bg: '#34D399', text: '#064e3b' },
  crypto:      { bg: '#A78BFA', text: '#2e1065' },
  epargne:     { bg: '#FBBF24', text: '#78350f' },
  obligations: { bg: '#2DD4BF', text: '#134e4a' },
  autre:       { bg: '#94A3B8', text: '#1e293b' },
}

export interface InvestmentSnapshot {
  id: string
  investmentId: string
  value: number
  date: string // 'YYYY-MM-DD'
  note?: string
}
