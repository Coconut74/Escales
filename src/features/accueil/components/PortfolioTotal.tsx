import { formatCurrency } from '@/lib/formatting'

interface PortfolioTotalProps {
  total: number
  monthlyChange?: number
}

export default function PortfolioTotal({ total, monthlyChange = 5.2 }: PortfolioTotalProps) {
  const isPositive = monthlyChange >= 0
  const formatted = formatCurrency(total).replace(/\u202f/g, '\u00a0')

  return (
    <div
      className="relative z-10 flex flex-col items-center pt-6 pb-4 px-6 text-center backdrop-blur-md"
      style={{
        background: 'rgba(255,251,248,0.82)',
        maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
      }}
    >
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

      {/* Fondu de blur — démarre dans le composant pour chevaucher la zone qui fond */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '160%',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 50%, transparent 100%)',
        }}
      />
    </div>
  )
}
