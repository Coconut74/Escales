export function isPositiveAmount(value: unknown): value is number {
  return typeof value === 'number' && isFinite(value) && value > 0
}

export function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const d = new Date(value)
  return !isNaN(d.getTime())
}

export function sanitizeText(value: string): string {
  return value.trim().slice(0, 500)
}
