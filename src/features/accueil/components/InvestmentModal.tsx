import { useEffect } from 'react'
import type { Investment } from '../accueil.types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../accueil.types'
import { formatCurrency } from '@/lib/formatting'
import Icon from '@/components/ui/Icon'

// Variation fictive par investissement (demo)
const DEMO_CHANGE: Record<string, number> = {
  '1': 8.3, '2': 4.1, '3': 12.7, '4': 1.2, '5': -2.4,
}

interface Props {
  investment: Investment | null
  total: number
  onClose: () => void
}

export default function InvestmentModal({ investment, total, onClose }: Props) {
  const open = !!investment

  // Fermer sur Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const pct    = investment ? ((investment.value / total) * 100).toFixed(1) : '0'
  const change = investment ? (DEMO_CHANGE[investment.id] ?? 0) : 0
  const color  = investment ? CATEGORY_COLORS[investment.category] : null
  const label  = investment ? CATEGORY_LABELS[investment.category] : ''

  return (
    <>
      {/* Overlay transparent — ferme la modale sans masquer le graphique */}
      <div
        className={`fixed inset-0 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ zIndex: 90 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Carte flottante détachée, au-dessus de la nav */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={investment?.label ?? 'Détail investissement'}
        className={`
          fixed left-4 right-4
          bg-white rounded-3xl shadow-2xl
          transition-transform duration-300 ease-out
          ${open ? 'translate-y-0' : 'translate-y-[calc(100%+120px)]'}
        `}
        style={{ bottom: '84px', maxHeight: '44vh', zIndex: 100 }}
      >
        {/* Contenu */}
        {investment && color && (
          <div className="px-6 pt-5 pb-6">

            {/* En-tête : badge catégorie + nom */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: color.bg, color: color.text }}
              >
                {investment.label.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-neutral-900 truncate">
                  {investment.label}
                </p>
                <span
                  className="text-sm font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${color.bg}22`, color: color.bg }}
                >
                  {label}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors shrink-0"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Métriques */}
            <div className="grid grid-cols-3 gap-3">
              <Metric
                label="Valeur"
                value={formatCurrency(investment.value)}
                highlight
              />
              <Metric
                label="Du portefeuille"
                value={`${pct}%`}
              />
              <Metric
                label="Ce mois"
                value={`${change >= 0 ? '+' : ''}${change.toFixed(1)}%`}
                positive={change >= 0}
                negative={change < 0}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function Metric({
  label, value, highlight, positive, negative,
}: {
  label: string
  value: string
  highlight?: boolean
  positive?: boolean
  negative?: boolean
}) {
  let valueColor = 'text-neutral-800'
  if (positive) valueColor = 'text-green-600'
  if (negative) valueColor = 'text-red-500'

  return (
    <div className="bg-neutral-50 rounded-2xl px-3 py-3">
      <p className="text-sm text-neutral-500 mb-1 leading-tight">{label}</p>
      <p className={`text-base font-bold leading-tight ${highlight ? 'text-primary-700' : valueColor}`}>
        {value}
      </p>
    </div>
  )
}
