import { useEffect, useState } from 'react'
import { useAccueilStore, selectEffectiveChange } from '../accueil.store'
import type { Investment, InvestmentCategory, InvestmentSnapshot } from '../accueil.types'
import { CATEGORY_COLORS } from '../accueil.types'
import type { StockPrice } from '@/hooks/useStockPrices'
import Icon from '@/components/ui/Icon'
import { useT } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'
import { formatCurrency, formatDate } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'
import InvestmentLineChart from './InvestmentLineChart'
import type { ChartPoint } from './InvestmentLineChart'

const CATEGORY_TKEYS: Record<InvestmentCategory, TKey> = {
  etf: 'cat.etf',
  immo: 'cat.immo',
  crypto: 'cat.crypto',
  epargne: 'cat.epargne',
  obligations: 'cat.obligations',
  autre: 'cat.autre',
}

interface Props {
  investment: Investment
  livePrice?: StockPrice
  onBack: () => void
  onDeleted: () => void
  onEditInfo?: () => void
}

export default function InvestmentDetailView({ investment, livePrice, onBack, onDeleted, onEditInfo }: Props) {
  const t = useT()
  const currency = useProfilStore((s) => s.currency)
  const snapshots = useAccueilStore((s) => s.snapshots)
  const { addSnapshot, removeSnapshot, updateInvestment, removeInvestment } = useAccueilStore()

  const today = new Date().toISOString().slice(0, 10)
  const [snapDate, setSnapDate] = useState(today)
  const [snapValue, setSnapValue] = useState('')
  const [snapNote, setSnapNote] = useState('')

  const isTicker = !!investment.ticker

  // Valeur effective courante
  const currentValue = isTicker && livePrice
    ? livePrice.price * (investment.shares ?? 1)
    : investment.value

  // Auto-snapshot Finnhub (1 fois/jour)
  useEffect(() => {
    if (!investment.ticker || !livePrice || livePrice.price <= 0) return
    const alreadyToday = snapshots.some(
      (s) => s.investmentId === investment.id && s.date === today
    )
    if (!alreadyToday) {
      const value = livePrice.price * (investment.shares ?? 1)
      addSnapshot({
        id: crypto.randomUUID(),
        investmentId: investment.id,
        value,
        date: today,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investment.id, investment.ticker, livePrice?.price])

  // Snapshots de cet investissement, triés par date ASC
  const invSnaps = snapshots
    .filter((s) => s.investmentId === investment.id)
    .sort((a, b) => a.date.localeCompare(b.date))

  // Données du graphique
  const chartData: ChartPoint[] = (() => {
    const points: ChartPoint[] = invSnaps.map((s) => ({ date: s.date, value: s.value }))
    const lastSnap = points[points.length - 1]
    if (!lastSnap || lastSnap.date !== today) {
      points.push({ date: today, value: currentValue, isLive: true })
    }
    return points
  })()

  // Performance globale
  const effectiveChange = selectEffectiveChange(investment, snapshots)
  const displayChange = isTicker && livePrice
    ? livePrice.changePercent
    : (effectiveChange ?? investment.change)

  function handleAddSnapshot() {
    const v = parseFloat(snapValue)
    if (!snapDate || isNaN(v) || v <= 0) return
    const snap: InvestmentSnapshot = {
      id: crypto.randomUUID(),
      investmentId: investment.id,
      value: v,
      date: snapDate,
      note: snapNote.trim() || undefined,
    }
    addSnapshot(snap)
    updateInvestment(investment.id, { value: v })
    setSnapValue('')
    setSnapNote('')
    setSnapDate(today)
  }

  function handleDelete() {
    removeInvestment(investment.id)
    onDeleted()
  }

  const color = CATEGORY_COLORS[investment.category]
  const initials = investment.label.slice(0, 2).toUpperCase() || '?'

  // Historique inversé (plus récent en premier)
  const invSnapsDesc = [...invSnaps].reverse()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-5 pb-3 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-base font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mr-1"
        >
          <Icon name="chevron-left" size={20} />
          {t('detail.back')}
        </button>
        <div className="flex-1" />
        <button
          onClick={() => onEditInfo?.()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-base font-semibold transition-colors text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          <Icon name="write" size={20} />
          {t('detail.editInfo')}
        </button>
      </div>

      {/* Corps scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-8 space-y-5">

        {/* Identité */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50 truncate leading-tight">
              {investment.label}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base text-neutral-400 dark:text-neutral-500">
                {t(CATEGORY_TKEYS[investment.category])}
              </span>
              {investment.ticker && (
                <span className="font-mono text-base font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-lg">
                  {investment.ticker}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Valeur courante + perf */}
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <p className="text-base text-neutral-400 dark:text-neutral-500 font-medium">{t('detail.currentValue')}</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tabular-nums">
              {formatCurrency(currentValue, currency)}
            </p>
          </div>
          {displayChange !== undefined && displayChange !== null && (
            <span
              className={`px-3 py-1.5 rounded-xl text-base font-bold tabular-nums ${
                displayChange >= 0
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}
            >
              {displayChange >= 0 ? '+' : ''}{displayChange.toFixed(2)}%
            </span>
          )}
          {isTicker && livePrice && (
            <span className="flex items-center gap-1.5 text-base font-semibold text-primary-600 dark:text-primary-400 px-2 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {t('detail.livePrice')}
            </span>
          )}
          {isTicker && investment.shares && (
            <span className="text-base text-neutral-400 dark:text-neutral-500">
              {investment.shares} parts
            </span>
          )}
        </div>

        {/* Graphique */}
        {chartData.length >= 2 ? (
          <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3">
            <InvestmentLineChart data={chartData} currency={currency} />
          </div>
        ) : (
          <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-6 text-center">
            <p className="text-base text-neutral-400 dark:text-neutral-500">
              {isTicker ? t('detail.autoSnapshot') : t('detail.noHistory')}
            </p>
            <p className="text-base text-neutral-300 dark:text-neutral-600 mt-1">
              {!isTicker && 'Ajoutez au moins 2 valeurs pour voir le graphique'}
            </p>
          </div>
        )}

        {/* Ajout de valeur (manuel uniquement) */}
        {!isTicker && (
          <div className="space-y-2">
            <p className="text-base font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
              {t('detail.addValue')}
            </p>
            <div className="flex gap-2 flex-wrap">
              <input
                type="date"
                value={snapDate}
                onChange={(e) => setSnapDate(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-base focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
              />
              <input
                type="number"
                placeholder={`Valeur (${currency})`}
                value={snapValue}
                onChange={(e) => setSnapValue(e.target.value)}
                className="w-32 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('detail.note')}
                value={snapNote}
                onChange={(e) => setSnapNote(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
              />
              <button
                onClick={handleAddSnapshot}
                disabled={!snapValue || !snapDate}
                className="px-4 py-2 rounded-xl bg-primary-500 text-white text-base font-semibold hover:bg-primary-600 disabled:opacity-40 transition-colors shrink-0"
              >
                {t('history.add')}
              </button>
            </div>
          </div>
        )}

        {/* Badge auto-snapshot Finnhub */}
        {isTicker && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-base text-primary-600 dark:text-primary-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {t('detail.autoSnapshot')} — {formatDate(today)}
          </div>
        )}

        {/* Historique */}
        <div className="space-y-1">
          <p className="text-base font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
            {t('history.title')}
          </p>
          {invSnapsDesc.length === 0 ? (
            <p className="text-base text-neutral-400 dark:text-neutral-500 py-2">{t('detail.noHistory')}</p>
          ) : (
            invSnapsDesc.map((snap, i) => {
              const prev = invSnapsDesc[i + 1]
              const delta = prev ? ((snap.value - prev.value) / prev.value) * 100 : null
              return (
                <div key={snap.id} className="flex items-center gap-2 py-2 border-b border-neutral-100 dark:border-neutral-700/60 last:border-0">
                  <span className="text-base text-neutral-500 dark:text-neutral-400 w-24 shrink-0 tabular-nums">
                    {formatDate(snap.date)}
                  </span>
                  <span className="text-base font-semibold text-neutral-800 dark:text-neutral-100 tabular-nums">
                    {formatCurrency(snap.value, currency)}
                  </span>
                  {delta !== null && (
                    <span className={`text-base font-semibold tabular-nums ${delta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                    </span>
                  )}
                  {snap.note && (
                    <span className="text-base text-neutral-400 dark:text-neutral-500 truncate flex-1">{snap.note}</span>
                  )}
                  <button
                    onClick={() => removeSnapshot(snap.id)}
                    className="ml-auto p-1.5 text-neutral-300 hover:text-red-500 dark:text-neutral-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                    aria-label={t('history.delete')}
                  >
                    <Icon name="trash" size={20} />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Supprimer l'investissement */}
        <div className="pt-2">
          <button
            onClick={handleDelete}
            className="w-full py-3 rounded-2xl border border-dashed border-red-300 dark:border-red-800 text-red-500 dark:text-red-400 text-base font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            {t('detail.deleteInvest')}
          </button>
        </div>
      </div>
    </div>
  )
}

