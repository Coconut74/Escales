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
  etf:         { bg: '#E17924', text: '#fff' },
  immo:        { bg: '#5F3012', text: '#fff' },
  crypto:      { bg: '#F9AC6D', text: '#2C1914' },
  epargne:     { bg: '#FFECDC', text: '#5F3012' },
  obligations: { bg: '#57534E', text: '#fff' },
  autre:       { bg: '#A8A29E', text: '#fff' },
}
