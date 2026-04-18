import { formatCurrency } from '@/lib/formatting'

interface PortfolioTotalProps {
  total: number
  monthlyChange?: number
}

export default function PortfolioTotal({ total, monthlyChange = 5.2 }: PortfolioTotalProps) {
  const isPositive = monthlyChange >= 0
  const formatted = formatCurrency(total).replace(/\u202f/g, '\u00a0')

  return (
    <div className="relative flex flex-col items-center pt-6 pb-2 px-6 text-center">
      <p className="text-base font-semibold text-neutral-500 mb-2">
        Mes investissements
      </p>
      <p className="text-5xl font-bold text-primary-900 tracking-tight leading-none mb-3">
        {formatted}
      </p>
      <div className="flex items-center gap-1.5">
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          aria-hidden="true"
          style={{ transform: isPositive ? 'none' : 'rotate(90deg)' }}
        >
          <path
            d="M3 13L13 3M13 3H6M13 3V10"
            stroke={isPositive ? '#16a34a' : '#dc2626'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          className="text-base font-bold"
          style={{ color: isPositive ? '#16a34a' : '#dc2626' }}
        >
          {isPositive ? '+' : ''}{monthlyChange.toFixed(1)}%
        </span>
      </div>

      {/* Fondu bas — déborde sous la section pour masquer le graphique qui remonte */}
      <div
        className="absolute top-full left-0 right-0 h-24 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom, #FFFBF8 0%, #FFFBF8cc 50%, transparent 100%)' }}
      />
    </div>
  )
}
