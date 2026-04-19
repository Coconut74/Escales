import { formatCurrency } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'

interface PortfolioTotalProps {
  total: number
  monthlyChange?: number
}

export default function PortfolioTotal({ total, monthlyChange = 5.2 }: PortfolioTotalProps) {
  const { currency, theme } = useProfilStore()
  const isPositive = monthlyChange >= 0
  const formatted = formatCurrency(total, currency).replace(/\u202f/g, '\u00a0')

  const bgColor = theme === 'dark' ? 'rgba(20,22,42,0.88)' : 'rgba(255,255,255,0.88)'

  return (
    <div
      className="relative z-10 flex flex-col items-center pt-6 pb-4 px-6 text-center backdrop-blur-md"
      style={{ background: bgColor }}
    >
      <p className="text-base font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
        Mes investissements
      </p>
      <p className="text-5xl font-bold text-primary-900 dark:text-primary-300 tracking-tight leading-none mb-3">
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

      {/* Fondu de blur sur la bordure basse uniquement */}
      <div
        className="absolute top-full left-0 right-0 h-16 pointer-events-none"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        }}
      />
    </div>
  )
}
