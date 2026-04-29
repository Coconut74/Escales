import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAccueilStore } from '../accueil.store'
import type { Investment, InvestmentCategory, InvestmentSnapshot } from '../accueil.types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../accueil.types'
import { searchSymbol } from '@/services/finnhub'
import type { FinnhubSearchResult } from '@/services/finnhub'
import TextField from '@/components/ui/TextField'
import DropdownField from '@/components/ui/DropdownField'
import Icon from '@/components/ui/Icon'
import { useT } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'
import { formatCurrency, formatDate } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'

const ChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
)

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
  const { investments, addInvestment, updateInvestment, removeInvestment } = useAccueilStore()
  const currency = useProfilStore((s) => s.currency)
  const t = useT()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Investment | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null)

  const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as InvestmentCategory[]).map(
    (k) => ({ value: k, label: t(CATEGORY_TKEYS[k]) })
  )

  useEffect(() => {
    if (open) {
      setEditingId(null)
      setEditDraft(null)
      setEditError(null)
      setIsNew(false)
      setOpenHistoryId(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { editingId ? cancelEdit() : onClose() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, editingId])

  function startEdit(inv: Investment) {
    setEditDraft({ ...inv })
    setEditingId(inv.id)
    setEditError(null)
    setOpenHistoryId(null)
  }

  function cancelEdit() {
    setEditDraft(null)
    setEditingId(null)
    setEditError(null)
    setIsNew(false)
  }

  function validateEdit() {
    if (!editDraft) return
    if (!editDraft.label.trim()) { setEditError('label'); return }
    if (editDraft.ticker) {
      if (!editDraft.shares || editDraft.shares <= 0) { setEditError('shares'); return }
    } else if (editDraft.value <= 0) {
      setEditError('value'); return
    }
    if (isNew) {
      addInvestment(editDraft)
    } else {
      updateInvestment(editDraft.id, editDraft)
    }
    cancelEdit()
  }

  function startAdd() {
    const newInv: Investment = { id: crypto.randomUUID(), label: '', category: 'etf', value: 0 }
    setEditDraft(newInv)
    setEditingId(newInv.id)
    setEditError(null)
    setIsNew(true)
  }

  function updateDraft(patch: Partial<Investment>) {
    setEditDraft((d) => d ? { ...d, ...patch } : d)
    setEditError(null)
  }

  // Liste affichée : investissements existants + nouvel item en cours d'ajout
  const displayList: Investment[] = isNew && editDraft
    ? [...investments, editDraft]
    : investments

  const panelContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
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
        {displayList.length === 0 && (
          <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-10">{t('edit.empty')}</p>
        )}
        <div className="space-y-1">
          {displayList.map((inv) =>
            editingId === inv.id && editDraft ? (
              <EditRow
                key={inv.id}
                draft={editDraft}
                error={editError}
                isNew={isNew}
                openHistoryId={openHistoryId}
                setOpenHistoryId={setOpenHistoryId}
                categoryOptions={CATEGORY_OPTIONS}
                onUpdate={updateDraft}
                onValidate={validateEdit}
                onCancel={cancelEdit}
                onDelete={() => { removeInvestment(inv.id); cancelEdit() }}
              />
            ) : (
              <ViewRow
                key={inv.id}
                inv={inv}
                currency={currency}
                onEdit={() => startEdit(inv)}
                disabled={editingId !== null}
              />
            )
          )}
        </div>

        {/* Bouton ajouter */}
        <button
          onClick={startAdd}
          disabled={editingId !== null}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-400 disabled:opacity-30 transition-colors text-sm font-semibold"
        >
          <Icon name="plus" size={16} />
          {t('edit.addInvestment')}
        </button>
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
            transition-transform duration-300 ease-out
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

function ViewRow({ inv, currency, onEdit, disabled }: {
  inv: Investment
  currency: string
  onEdit: () => void
  disabled: boolean
}) {
  const t = useT()
  const color = CATEGORY_COLORS[inv.category]
  const initials = inv.label.slice(0, 2).toUpperCase() || '?'

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-neutral-100/60 dark:hover:bg-neutral-700/40 transition-colors">
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {initials}
      </div>

      {/* Nom + catégorie */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 truncate leading-tight">
          {inv.label || '—'}
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-tight">
          {t(CATEGORY_TKEYS[inv.category])}
        </p>
      </div>

      {/* Valeur */}
      <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200 shrink-0 tabular-nums">
        {formatCurrency(inv.value, currency)}
      </span>

      {/* Bouton modifier */}
      <button
        onClick={onEdit}
        disabled={disabled}
        className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 disabled:opacity-30 transition-colors shrink-0"
        aria-label="Modifier"
      >
        <Icon name="write" size={15} />
      </button>
    </div>
  )
}

// ─── Ligne d'édition (dépliée) ────────────────────────────────────────────────

function EditRow({ draft, error, isNew, openHistoryId, setOpenHistoryId, categoryOptions, onUpdate, onValidate, onCancel, onDelete }: {
  draft: Investment
  error: string | null
  isNew: boolean
  openHistoryId: string | null
  setOpenHistoryId: (id: string | null) => void
  categoryOptions: { value: string; label: string }[]
  onUpdate: (patch: Partial<Investment>) => void
  onValidate: () => void
  onCancel: () => void
  onDelete: () => void
}) {
  const t = useT()

  return (
    <div className="bg-neutral-50 dark:bg-neutral-800 border border-primary-200 dark:border-primary-800 rounded-2xl p-4 space-y-3">
      <div className="space-y-3">
        <TextField
          placeholder={t('edit.investmentName')}
          value={draft.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          error={error === 'label' ? t('edit.nameRequired') : undefined}
        />

        <div className="flex gap-2">
          <div className="flex-1">
            <DropdownField
              options={categoryOptions}
              value={draft.category}
              onChange={(e) => onUpdate({ category: e.target.value as InvestmentCategory })}
            />
          </div>
          {!draft.ticker && (
            <>
              <div className="w-28">
                <TextField
                  type="number"
                  placeholder={t('edit.amount')}
                  value={draft.value === 0 ? '' : draft.value}
                  onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || 0 })}
                  error={error === 'value' ? t('edit.valueRequired') : undefined}
                />
              </div>
              <div className="w-20">
                <TextField
                  type="number"
                  placeholder={t('edit.changePct')}
                  value={draft.change === undefined ? '' : draft.change}
                  onChange={(e) => {
                    const v = e.target.value
                    onUpdate({ change: v === '' ? undefined : parseFloat(v) })
                  }}
                />
              </div>
            </>
          )}
          {draft.ticker && (
            <div className="w-28">
              <TextField
                type="number"
                placeholder={t('edit.shares')}
                value={draft.shares === undefined ? '' : draft.shares}
                onChange={(e) => onUpdate({ shares: parseFloat(e.target.value) || undefined })}
                error={error === 'shares' ? t('edit.sharesRequired') : undefined}
              />
            </div>
          )}
        </div>

        <TickerField
          ticker={draft.ticker}
          apiKey={import.meta.env.VITE_FINNHUB_KEY ?? ''}
          onSelect={(ticker) => onUpdate({ ticker, shares: draft.shares ?? 1 })}
          onUnlink={() => onUpdate({ ticker: undefined, shares: undefined })}
        />

        {!isNew && (
          <button
            onClick={() => setOpenHistoryId(openHistoryId === draft.id ? null : draft.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <ChartIcon />
            {t('history.title')}
            <span className="text-neutral-400">{openHistoryId === draft.id ? '▲' : '▼'}</span>
          </button>
        )}

        {openHistoryId === draft.id && <HistorySection investmentId={draft.id} />}
      </div>

      {/* Actions : poubelle à gauche, annuler + valider à droite */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {!isNew && (
          <button
            onClick={onDelete}
            className="mr-auto p-1.5 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label="Supprimer"
          >
            <Icon name="trash" size={16} />
          </button>
        )}
        <button
          onClick={onCancel}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-500 transition-colors"
          aria-label={t('edit.cancel')}
        >
          <Icon name="x" size={13} />
        </button>
        <button
          onClick={onValidate}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          aria-label={t('edit.save')}
        >
          <Icon name="check" size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Section historique ───────────────────────────────────────────────────────

function HistorySection({ investmentId }: { investmentId: string }) {
  const t = useT()
  const currency = useProfilStore((s) => s.currency)
  const snapshots = useAccueilStore((s) => s.snapshots)
  const addSnapshot = useAccueilStore((s) => s.addSnapshot)
  const removeSnapshot = useAccueilStore((s) => s.removeSnapshot)

  const invSnaps = snapshots
    .filter((s) => s.investmentId === investmentId)
    .sort((a, b) => b.date.localeCompare(a.date))

  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [value, setValue] = useState('')

  function handleAdd() {
    const v = parseFloat(value)
    if (!date || isNaN(v) || v <= 0) return
    const snapshot: InvestmentSnapshot = {
      id: crypto.randomUUID(),
      investmentId,
      value: v,
      date,
    }
    addSnapshot(snapshot)
    setValue('')
    setDate(today)
  }

  return (
    <div className="mt-1 pt-3 border-t border-neutral-200/60 dark:border-neutral-600/60 space-y-2">
      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
        {t('history.addEntry')}
      </p>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
          />
        </div>
        <div className="w-28">
          <input
            type="number"
            placeholder={t('history.value')}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
          />
        </div>
        <button
          onClick={handleAdd}
          className="px-3 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shrink-0"
        >
          {t('history.add')}
        </button>
      </div>

      {invSnaps.length === 0 ? (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 py-1">{t('history.noEntries')}</p>
      ) : (
        <div className="space-y-1">
          {invSnaps.map((snap, i) => {
            const prev = invSnaps[i + 1]
            const delta = prev ? ((snap.value - prev.value) / prev.value) * 100 : null
            return (
              <div key={snap.id} className="flex items-center gap-2 text-xs py-1">
                <span className="text-neutral-500 dark:text-neutral-400 w-24 shrink-0">
                  {formatDate(snap.date)}
                </span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                  {formatCurrency(snap.value, currency)}
                </span>
                {delta !== null && (
                  <span className={`font-semibold ${delta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                  </span>
                )}
                <button
                  onClick={() => removeSnapshot(snap.id)}
                  className="ml-auto text-neutral-400 hover:text-red-500 transition-colors p-0.5"
                  aria-label={t('history.delete')}
                >
                  <Icon name="trash" size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Champ de recherche ticker ────────────────────────────────────────────────

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
      try {
        setResults(await searchSymbol(v, apiKey))
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 350)
  }

  if (ticker) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20">
        <ChartIcon />
        <span className="text-sm font-bold text-primary-700 dark:text-primary-300 font-mono">{ticker}</span>
        <span className="text-xs text-primary-500 dark:text-primary-400">{t('edit.livePriceEnabled')}</span>
        <button
          onClick={onUnlink}
          onMouseDown={(e) => e.stopPropagation()}
          className="ml-auto text-primary-400 hover:text-primary-600 dark:hover:text-primary-200 text-base leading-none"
          aria-label="Délier"
        >×</button>
      </div>
    )
  }

  const dropdown = open && results.length > 0 && dropdownRect
    ? createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownRect.bottom + 4,
            left: dropdownRect.left,
            width: dropdownRect.width,
            zIndex: 9999,
          }}
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl max-h-48 overflow-y-auto"
        >
          {results.map((r) => (
            <button
              key={r.symbol}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onSelect(r.symbol); setQuery(''); setResults([]); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-left transition-colors"
            >
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50 font-mono w-20 shrink-0">{r.displaySymbol}</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{r.description}</span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0 ml-auto">{r.type}</span>
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
          className="w-full px-3 py-2 pl-8 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
        />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
          {searching ? (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25"/><path d="M21 12a9 9 0 00-9-9" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          )}
        </span>
      </div>
      {dropdown}
    </div>
  )
}
