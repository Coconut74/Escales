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

const CX = 110, CY = 110
const R_OUTER = 94, R_INNER = 64
const GAP_DEG = 2.5

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(startDeg: number, endDeg: number): string {
  // Full circle special case — arc start = arc end → degenerate in SVG
  const delta = endDeg - startDeg
  if (delta >= 359.99) {
    // Two half-circles to approximate a complete ring
    const a = polar(CX, CY, R_OUTER, startDeg)
    const b = polar(CX, CY, R_OUTER, startDeg + 180)
    const c = polar(CX, CY, R_INNER, startDeg + 180)
    const d = polar(CX, CY, R_INNER, startDeg)
    const f = (n: number) => n.toFixed(2)
    return [
      `M ${f(a.x)} ${f(a.y)}`,
      `A ${R_OUTER} ${R_OUTER} 0 1 1 ${f(b.x)} ${f(b.y)}`,
      `A ${R_OUTER} ${R_OUTER} 0 1 1 ${f(a.x)} ${f(a.y)}`,
      `M ${f(d.x)} ${f(d.y)}`,
      `A ${R_INNER} ${R_INNER} 0 1 0 ${f(c.x)} ${f(c.y)}`,
      `A ${R_INNER} ${R_INNER} 0 1 0 ${f(d.x)} ${f(d.y)}`,
      'Z',
    ].join(' ')
  }

  const s  = polar(CX, CY, R_OUTER, startDeg)
  const e  = polar(CX, CY, R_OUTER, endDeg)
  const si = polar(CX, CY, R_INNER, endDeg)
  const ei = polar(CX, CY, R_INNER, startDeg)
  const large = delta > 180 ? 1 : 0
  const f = (n: number) => n.toFixed(2)

  return [
    `M ${f(s.x)} ${f(s.y)}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${large} 1 ${f(e.x)} ${f(e.y)}`,
    `L ${f(si.x)} ${f(si.y)}`,
    `A ${R_INNER} ${R_INNER} 0 ${large} 0 ${f(ei.x)} ${f(ei.y)}`,
    'Z',
  ].join(' ')
}

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

    const n = entries.length
    const gap = n > 1 ? GAP_DEG : 0
    let offsetDeg = 0
    return entries.map(([category, value]) => {
      const pct = total > 0 ? value / total : 0
      const fullDeg = pct * 360
      const startDeg = offsetDeg + gap / 2
      const endDeg   = offsetDeg + fullDeg - gap / 2
      offsetDeg += fullDeg
      return { category, value, pct, path: arcPath(startDeg, endDeg) }
    })
  }, [investments, total])

  if (total === 0 || segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-400 dark:text-neutral-600">
        <p className="text-base">{t('home.emptyChart')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full px-4 pt-2 pb-2 select-none">
      {/* Donut SVG */}
      <svg viewBox="0 0 220 220" className="w-[200px] lg:w-[240px] h-auto shrink-0">
        {segments.map(({ category, path }) => (
          <path
            key={category}
            d={path}
            fill={CATEGORY_COLORS[category].bg}
          />
        ))}
        {/* Texte centre */}
        <text
          x={CX} y={CY + 5}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fontFamily="Urbanist, sans-serif"
          className="fill-neutral-500 dark:fill-neutral-400"
        >
          {t('home.categories')}
        </text>
      </svg>

      {/* Légende en colonne */}
      <ul role="list" className="w-full max-w-[220px] lg:max-w-[240px] flex flex-col gap-2 mt-3">
        {segments.map(({ category, value, pct }) => (
          <li key={category} className="flex items-start gap-2">
            <div
              aria-hidden="true"
              className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
              style={{ backgroundColor: CATEGORY_COLORS[category].bg }}
            />
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 w-24 shrink-0">
              {t(CATEGORY_TKEYS[category])}
            </span>
            <span className="text-sm text-neutral-600 dark:text-neutral-300 ml-auto">
              {formatCurrency(value, currency)} · {(pct * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
