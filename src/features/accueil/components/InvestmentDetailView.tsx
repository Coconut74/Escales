import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAccueilStore, selectEffectiveChange } from '../accueil.store'
import type { Investment, InvestmentCategory, InvestmentSnapshot } from '../accueil.types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../accueil.types'
import { searchSymbol } from '@/services/finnhub'
import type { FinnhubSearchResult } from '@/services/finnhub'
import type { StockPrice } from '@/hooks/useStockPrices'
import TextField from '@/components/ui/TextField'
import DropdownField from '@/components/ui/DropdownField'
import Icon from '@/components/ui/Icon'
import { useT } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'
import { formatCurrency, formatDate } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'
import InvestmentLineChart from './InvestmentLineChart'
import type { ChartPoint } from './InvestmentLineChart'
import { useRef } from 'react'

const CATEGORY_TKEYS: Record<InvestmentCategory, TKey> = {
  etf: 'cat.etf',
  immo: 'cat.immo',
  crypto: 'cat.crypto',
  epargne: 'cat.epargne',
  obligations: 'cat.obligations',
  autre: 'cat.autre',
}

const CATEGORY_OPTIONS_KEYS = Object.keys(CATEGORY_LABELS) as InvestmentCategory[]

interface Props {
  investment: Investment
  livePrice?: StockPrice
  onBack: () => void
  onDeleted: () => void
}

export default function InvestmentDetailView({ investment, livePrice, onBack, onDeleted }: Props) {
  const t = useT()
  const currency = useProfilStore((s) => s.currency)
  const snapshots = useAccueilStore((s) => s.snapshots)
  const { addSnapshot, removeSnapshot, updateInvestment, removeInvestment } = useAccueilStore()

  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState<Investment>({ ...investment })
  const [editError, setEditError] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)
  const [snapDate, setSnapDate] = useState(today)
  const [snapValue, setSnapValue] = useState('')
  const [snapNote, setSnapNote] = useState('')

  const apiKey = import.meta.env.VITE_FINNHUB_KEY ?? ''

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

  function handleSaveEdit() {
    if (!draft.label.trim()) { setEditError('label'); return }
    if (draft.ticker) {
      if (!draft.shares || draft.shares <= 0) { setEditError('shares'); return }
    } else if (draft.value <= 0) {
      setEditError('value'); return
    }
    updateInvestment(draft.id, draft)
    setEditMode(false)
    setEditError(null)
  }

  function handleDelete() {
    removeInvestment(investment.id)
    onDeleted()
  }

  const color = CATEGORY_COLORS[investment.category]
  const initials = investment.label.slice(0, 2).toUpperCase() || '?'

  const CATEGORY_OPTIONS = CATEGORY_OPTIONS_KEYS.map((k) => ({
    value: k,
    label: t(CATEGORY_TKEYS[k]),
  }))

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
          onClick={() => { setEditMode((v) => !v); setDraft({ ...investment }); setEditError(null) }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-base font-semibold transition-colors ${
            editMode
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
          }`}
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

        {/* Section édition (si activée) */}
        {editMode && (
          <div className="bg-neutral-50 dark:bg-neutral-800 border border-primary-200 dark:border-primary-800 rounded-2xl p-4 space-y-3">
            <TextField
              placeholder={t('edit.investmentName')}
              value={draft.label}
              onChange={(e) => { setDraft((d) => ({ ...d, label: e.target.value })); setEditError(null) }}
              error={editError === 'label' ? t('edit.nameRequired') : undefined}
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <DropdownField
                  options={CATEGORY_OPTIONS}
                  value={draft.category}
                  onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as InvestmentCategory }))}
                />
              </div>
              {!draft.ticker && (
                <div className="w-32">
                  <TextField
                    type="number"
                    placeholder={t('edit.amount')}
                    value={draft.value === 0 ? '' : draft.value}
                    onChange={(e) => { setDraft((d) => ({ ...d, value: parseFloat(e.target.value) || 0 })); setEditError(null) }}
                    error={editError === 'value' ? t('edit.valueRequired') : undefined}
                  />
                </div>
              )}
              {draft.ticker && (
                <div className="w-28">
                  <TextField
                    type="number"
                    placeholder={t('edit.shares')}
                    value={draft.shares === undefined ? '' : draft.shares}
                    onChange={(e) => { setDraft((d) => ({ ...d, shares: parseFloat(e.target.value) || undefined })); setEditError(null) }}
                    error={editError === 'shares' ? t('edit.sharesRequired') : undefined}
                  />
                </div>
              )}
            </div>
            <TickerField
              ticker={draft.ticker}
              apiKey={apiKey}
              onSelect={(ticker) => setDraft((d) => ({ ...d, ticker, shares: d.shares ?? 1 }))}
              onUnlink={() => setDraft((d) => ({ ...d, ticker: undefined, shares: undefined }))}
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => { setEditMode(false); setEditError(null) }}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-500 transition-colors"
              >
                <Icon name="x" size={20} />
              </button>
              <button
                onClick={handleSaveEdit}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                <Icon name="check" size={20} />
              </button>
            </div>
          </div>
        )}

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

// ─── Champ ticker réutilisé ───────────────────────────────────────────────────

function TickerField({ ticker, apiKey, onSelect, onUnlink }: {
  ticker?: string
  apiKey: string
  onSelect: (symbol: string) => void
  onUnlink: () => void
}) {
  const t = useT()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FinnhubSearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const node = e.target as Node
      if (
        wrapRef.current && !wrapRef.current.contains(node) &&
        dropdownRef.current && !dropdownRef.current.contains(node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function openDropdown() {
    if (inputRef.current) setDropdownRect(inputRef.current.getBoundingClientRect())
    setOpen(true)
  }

  function handleChange(v: string) {
    setQuery(v)
    openDropdown()
    clearTimeout(timerRef.current)
    if (!apiKey || v.length < 1) { setResults([]); return }
    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try { setResults(await searchSymbol(v, apiKey)) }
      catch { setResults([]) }
      finally { setSearching(false) }
    }, 350)
  }

  if (ticker) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20">
        <Icon name="chart" size={20} />
        <span className="text-base font-bold text-primary-700 dark:text-primary-300 font-mono">{ticker}</span>
        <span className="text-base text-primary-500 dark:text-primary-400">{t('edit.livePriceEnabled')}</span>
        <button
          onClick={onUnlink}
          onMouseDown={(e) => e.stopPropagation()}
          className="ml-auto text-primary-400 hover:text-primary-600 dark:hover:text-primary-200 text-base leading-none"
        >×</button>
      </div>
    )
  }

  const dropdown = open && results.length > 0 && dropdownRect
    ? createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: dropdownRect.bottom + 4, left: dropdownRect.left, width: dropdownRect.width, zIndex: 9999 }}
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl max-h-48 overflow-y-auto"
        >
          {results.map((r) => (
            <button
              key={r.symbol}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onSelect(r.symbol); setQuery(''); setResults([]); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-left transition-colors"
            >
              <span className="text-base font-bold text-neutral-900 dark:text-neutral-50 font-mono w-24 shrink-0">{r.displaySymbol}</span>
              <span className="text-base text-neutral-500 dark:text-neutral-400 truncate">{r.description}</span>
              <span className="text-base text-neutral-400 dark:text-neutral-500 shrink-0 ml-auto">{r.type}</span>
            </button>
          ))}
        </div>,
        document.body
      )
    : null

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (results.length > 0) openDropdown() }}
          placeholder={apiKey ? t('edit.linkTicker') : t('edit.configureFinnhub')}
          disabled={!apiKey}
          className="w-full px-3 py-2 pl-10 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-500 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          {searching ? (
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25"/><path d="M21 12a9 9 0 00-9-9" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          )}
        </span>
      </div>
      {dropdown}
    </div>
  )
}
