export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR').format(new Date(isoDate))
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 2 }).format(value)
}
