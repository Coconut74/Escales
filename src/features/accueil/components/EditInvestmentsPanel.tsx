import { useEffect, useState } from 'react'
import { useAccueilStore } from '../accueil.store'
import type { Investment, InvestmentCategory } from '../accueil.types'
import { CATEGORY_COLORS } from '../accueil.types'
import Icon from '@/components/ui/Icon'
import { useT } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'
import { formatCurrency } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'
import { useStockPrices } from '@/hooks/useStockPrices'
import InvestmentDetailView from './InvestmentDetailView'

const CATEGORY_TKEYS: Record<InvestmentCategory, TKey> = {
  etf: 'cat.etf',
  immo: 'cat.immo',
  crypto: 'cat.crypto',
  epargne: 'cat.epargne',
  obligations: 'cat.obligations',
  autre: 'cat.autre',
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function EditInvestmentsPanel({ open, onClose }: Props) {
  const { investments, addInvestment } = useAccueilStore()
  const currency = useProfilStore((s) => s.currency)
  const t = useT()

  const apiKey = import.meta.env.VITE_FINNHUB_KEY ?? ''
  const { prices } = useStockPrices(investments, apiKey)

  const [view, setView] = useState<'list' | 'detail'>('list')
  const [detailInvestment, setDetailInvestment] = useState<Investment | null>(null)

  useEffect(() => {
    if (open) {
      setView('list')
      setDetailInvestment(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (view === 'detail') {
          setView('list')
          setDetailInvestment(null)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, view])

  function openDetail(inv: Investment) {
    setDetailInvestment(inv)
    setView('detail')
  }

  function backToList() {
    setView('list')
    setDetailInvestment(null)
  }

  function startAdd() {
    const newInv: Investment = { id: crypto.randomUUID(), label: '', category: 'etf', value: 0 }
    addInvestment(newInv)
    setDetailInvestment(newInv)
    setView('detail')
  }

  const panelContent = (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Vue liste */}
      <div
        className={`absolute inset-0 flex flex-col transition-transform duration-250 ease-out ${
          view === 'list' ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header liste */}
        <div className="flex items-center gap-2 px-6 pt-6 pb-4 shrink-0">
          <h2 className="flex-1 text-lg font-bold text-neutral-900 dark:text-neutral-50">{t('edit.title')}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
            aria-label={t('edit.close')}
          >
            ✕
          </button>
        </div>

        {/* Liste scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">
          {investments.length === 0 && (
            <p className="text-base text-neutral-400 dark:text-neutral-500 text-center py-10">{t('edit.empty')}</p>
          )}
          <div className="space-y-1">
            {investments.map((inv) => (
              <ViewRow
                key={inv.id}
                inv={inv}
                currency={currency}
                onDetail={() => openDetail(inv)}
              />
            ))}
          </div>

          <button
            onClick={startAdd}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-400 transition-colors text-base font-semibold"
          >
            <Icon name="plus" size={20} />
            {t('edit.addInvestment')}
          </button>
        </div>
      </div>

      {/* Vue détail */}
      <div
        className={`absolute inset-0 flex flex-col bg-white dark:bg-neutral-900 transition-transform duration-250 ease-out ${
          view === 'detail' ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {view === 'detail' && detailInvestment && (
          <InvestmentDetailView
            investment={detailInvestment}
            livePrice={prices[detailInvestment.id]}
            onBack={backToList}
            onDeleted={backToList}
          />
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile : fullscreen slide depuis le bas */}
      <div
        className={`
          lg:hidden fixed inset-0 z-[110] flex flex-col
          bg-white dark:bg-neutral-900
          border-t border-neutral-200 dark:border-neutral-700 shadow-2xl
          transition-transform duration-300 ease-out
          ${open ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {panelContent}
      </div>

      {/* Desktop : overlay + modale centrée */}
      <div
        className={`
          hidden lg:flex fixed inset-0 z-[110]
          items-center justify-center
          bg-black/40
          transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          className={`
            w-full max-w-lg h-[80vh] flex flex-col
            bg-white dark:bg-neutral-900
            border border-neutral-200 dark:border-neutral-700 shadow-2xl rounded-3xl
            transition-transform duration-300 ease-out overflow-hidden
            ${open ? 'scale-100' : 'scale-95'}
          `}
        >
          {panelContent}
        </div>
      </div>
    </>
  )
}

// ─── Ligne de visualisation ───────────────────────────────────────────────────

function ViewRow({ inv, currency, onDetail }: {
  inv: Investment
  currency: string
  onDetail: () => void
}) {
  const t = useT()
  const color = CATEGORY_COLORS[inv.category]
  const initials = inv.label.slice(0, 2).toUpperCase() || '?'

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-neutral-100/60 dark:hover:bg-neutral-700/40 transition-colors">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-neutral-900 dark:text-neutral-50 truncate leading-tight">
          {inv.label || '—'}
        </p>
        <p className="text-base text-neutral-400 dark:text-neutral-500 leading-tight">
          {t(CATEGORY_TKEYS[inv.category])}
        </p>
      </div>

      <span className="text-base font-bold text-neutral-700 dark:text-neutral-200 shrink-0 tabular-nums">
        {formatCurrency(inv.value, currency)}
      </span>

      <button
        onClick={onDetail}
        className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors shrink-0"
        aria-label="Voir le détail"
      >
        <Icon name="write" size={20} />
      </button>
    </div>
  )
}
