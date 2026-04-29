import { formatCurrency } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'
import { useIsDark } from '@/features/profil/useIsDark'
import { useT } from '@/lib/i18n'

interface PortfolioTotalProps {
  total: number
  monthlyChange?: number
}

export default function PortfolioTotal({ total, monthlyChange }: PortfolioTotalProps) {
  const { currency } = useProfilStore()
  const isDark = useIsDark()
  const t = useT()
  const formatted = formatCurrency(total, currency).replace(/ /g, ' ')
  const bgColor = isDark ? 'rgba(20,22,42,0.65)' : 'rgba(242,243,248,0.65)'

  return (
    <div
      className="relative z-10 flex flex-col items-center pt-6 pb-4 px-6 text-center backdrop-blur-md"
      style={{ background: bgColor }}
    >
      <p className="text-base font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
        {t('home.myInvestments')}
      </p>
      <p className="text-5xl font-bold text-primary-900 dark:text-primary-300 tracking-tight leading-none mb-3">
        {formatted}
      </p>
      {monthlyChange !== undefined && (
        <div className="flex items-center gap-1.5">
          <svg
            width="20" height="20" viewBox="0 0 16 16" fill="none"
            aria-hidden="true"
            style={{ transform: monthlyChange >= 0 ? 'none' : 'rotate(90deg)' }}
          >
            <path
              d="M3 13L13 3M13 3H6M13 3V10"
              stroke={monthlyChange >= 0 ? '#16a34a' : '#dc2626'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="text-base font-bold"
            style={{ color: monthlyChange >= 0 ? '#16a34a' : '#dc2626' }}
          >
            {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
          </span>
        </div>
      )}

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
