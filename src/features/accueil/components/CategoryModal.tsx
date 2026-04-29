import { useState } from 'react'
import type { Investment, InvestmentCategory } from '../accueil.types'
import { CATEGORY_COLORS } from '../accueil.types'
import { formatCurrency } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'
import { useT } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'

const CARD_CLASSES = 'fixed w-[calc(100%-32px)] max-w-[600px] bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl'

const CATEGORY_TKEYS: Record<InvestmentCategory, TKey> = {
  etf: 'cat.etf',
  immo: 'cat.immo',
  crypto: 'cat.crypto',
  epargne: 'cat.epargne',
  obligations: 'cat.obligations',
  autre: 'cat.autre',
}

interface Props {
  category: InvestmentCategory | null
  investments: Investment[]
  total: number
  onClose: () => void
}

export default function CategoryModal({ category, investments, total, onClose }: Props) {
  const currency = useProfilStore((s) => s.currency)
  const t = useT()

  const open = !!category
  const color = category ? CATEGORY_COLORS[category] : null
  const catInvestments = category ? investments.filter(i => i.category === category) : []
  const catTotal = catInvestments.reduce((sum, i) => sum + i.value, 0)
  const catPct = total > 0 ? (catTotal / total) * 100 : 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={category ? t(CATEGORY_TKEYS[category]) : ''}
      className={`${CARD_CLASSES} left-1/2 lg:left-[calc(312px+(100vw-312px)/2)]`}
      style={{
        bottom: '16px',
        zIndex: 100,
        transform: open ? 'translateX(-50%)' : 'translateX(-50%) translateY(calc(100% + 24px))',
        transition: 'transform 0.3s ease-out',
      }}
    >
      {category && color && (
        <div className="px-6 pt-5 pb-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              {t(CATEGORY_TKEYS[category]).slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-neutral-900 dark:text-neutral-50 truncate">
                {t(CATEGORY_TKEYS[category])}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {catInvestments.length} {t('category.investments')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors shrink-0"
              aria-label={t('investment.close')}
            >✕</button>
          </div>

          {/* Métriques */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Metric label={t('investment.value')} value={formatCurrency(catTotal, currency)} highlight />
            <Metric label={t('investment.share')} value={`${catPct.toFixed(1)}%`} />
          </div>

          {/* Liste des investissements */}
          <ul className="flex flex-col gap-2">
            {catInvestments.map(inv => {
              const share = catTotal > 0 ? (inv.value / catTotal) * 100 : 0
              return (
                <InvestmentRow key={inv.id} inv={inv} share={share} currency={currency} color={color.bg} />
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function InvestmentRow({ inv, share, currency, color }: {
  inv: Investment; share: number; currency: string; color: string
}) {
  return (
    <li className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-700 rounded-2xl px-3 py-2.5">
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="flex-1 text-base font-medium text-neutral-800 dark:text-neutral-100 truncate">{inv.label}</span>
      <span className="text-base text-neutral-500 dark:text-neutral-400 shrink-0">{share.toFixed(0)}%</span>
      <span className="text-base font-semibold text-neutral-800 dark:text-neutral-100 shrink-0">
        {formatCurrency(inv.value, currency)}
      </span>
    </li>
  )
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-700 rounded-2xl px-3 py-3">
      <p className="text-base text-neutral-500 dark:text-neutral-400 mb-1 leading-tight">{label}</p>
      <p className={`text-base font-bold leading-tight ${highlight ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-800 dark:text-neutral-100'}`}>{value}</p>
    </div>
  )
}
