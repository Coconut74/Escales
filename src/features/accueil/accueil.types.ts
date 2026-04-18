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
  change?: number // évolution en % (ex: 5.6 = +5.6%)
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
  etf:         { bg: '#FCCFA9', text: '#2C1914' },
  immo:        { bg: '#FCCFA9', text: '#2C1914' },
  crypto:      { bg: '#FCCFA9', text: '#2C1914' },
  epargne:     { bg: '#FCCFA9', text: '#2C1914' },
  obligations: { bg: '#FCCFA9', text: '#2C1914' },
  autre:       { bg: '#FCCFA9', text: '#2C1914' },
}
