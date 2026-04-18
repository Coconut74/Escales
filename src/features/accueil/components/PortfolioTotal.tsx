import { formatCurrency } from '@/lib/formatting'

interface PortfolioTotalProps {
  total: number
  monthlyChange?: number
}

export default function PortfolioTotal({ total, monthlyChange = 5.2 }: PortfolioTotalProps) {
  const isPositive = monthlyChange >= 0

  return (
    <div className="px-6 pt-6 pb-4">
      <p className="text-sm font-semibold text-neutral-500 mb-1">Total portefeuille</p>
      <p className="text-4xl font-semibold text-neutral-900 tracking-tight">
        {formatCurrency(total)}
      </p>
      <div className="flex items-center gap-1.5 mt-2">
        <span
          className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {isPositive ? '+' : ''}{monthlyChange.toFixed(1)}%
        </span>
        <span className="text-xs text-neutral-400">ce mois</span>
      </div>
    </div>
  )
}
