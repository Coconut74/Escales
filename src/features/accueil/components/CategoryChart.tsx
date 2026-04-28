import { useMemo } from 'react'
import type { Investment, InvestmentCategory } from '../accueil.types'
import { CATEGORY_COLORS } from '../accueil.types'
import { formatCurrency } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'
import { useT } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'

const CATEGORY_TKEYS: Record<InvestmentCategory, TKey> = {
  etf: 'cat.etf',
  immo: 'cat.immo',
  crypto: 'cat.crypto',
  epargne: 'cat.epargne',
  obligations: 'cat.obligations',
  autre: 'cat.autre',
}

const R = 80
const CX = 110
const CY = 110
const CIRCUMFERENCE = 2 * Math.PI * R
const GAP = 2 // degrés de gap entre chaque segment

interface Props {
  investments: Investment[]
  total: number
}

export default function CategoryChart({ investments, total }: Props) {
  const t = useT()
  const currency = useProfilStore((s) => s.currency)

  const segments = useMemo(() => {
    const grouped: Partial<Record<InvestmentCategory, number>> = {}
    for (const inv of investments) {
      grouped[inv.category] = (grouped[inv.category] ?? 0) + inv.value
    }

    const entries = (Object.entries(grouped) as [InvestmentCategory, number][])
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)

    let offsetDeg = -90 // start at top
    return entries.map(([category, value]) => {
      const pct = total > 0 ? value / total : 0
      const deg = pct * 360 - GAP
      const startDeg = offsetDeg + GAP / 2
      offsetDeg += pct * 360

      // Convert arc to stroke-dasharray
      const arcLen = (deg / 360) * CIRCUMFERENCE
      const dashOffset = -(startDeg / 360) * CIRCUMFERENCE

      return { category, value, pct, arcLen, dashOffset }
    })
  }, [investments, total])

  if (total === 0 || segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400 dark:text-neutral-600 py-16">
        <p className="text-sm">{t('home.emptyChart')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full px-4 pt-4 pb-2">
      {/* Donut SVG */}
      <svg viewBox="0 0 220 220" width="220" height="220" className="shrink-0">
        {segments.map(({ category, arcLen, dashOffset }) => (
          <circle
            key={category}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={CATEGORY_COLORS[category].bg}
            strokeWidth={28}
            strokeDasharray={`${arcLen.toFixed(2)} ${CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset.toFixed(2)}
            strokeLinecap="butt"
            style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.22,1,0.36,1)' }}
          />
        ))}
        {/* Centre */}
        <text
          x={CX} y={CY - 8}
          textAnchor="middle"
          fontSize="11"
          fontFamily="Urbanist, sans-serif"
          fill="currentColor"
          className="text-neutral-400 dark:text-neutral-500"
        >
          {t('home.portfolio')}
        </text>
        <text
          x={CX} y={CY + 10}
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fontFamily="Urbanist, sans-serif"
          fill="currentColor"
          className="text-neutral-800 dark:text-neutral-100"
        >
          {formatCurrency(total, currency)}
        </text>
      </svg>

      {/* Légende */}
      <div className="w-full max-w-[340px] grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
        {segments.map(({ category, value, pct }) => (
          <div key={category} className="flex items-center gap-2 min-w-0">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[category].bg }}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 truncate">
                {t(CATEGORY_TKEYS[category])}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {formatCurrency(value, currency)} · {(pct * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
