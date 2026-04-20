import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAccueilStore } from '../accueil.store'
import type { Investment, InvestmentCategory } from '../accueil.types'
import { CATEGORY_LABELS } from '../accueil.types'
import { searchSymbol } from '@/services/finnhub'
import type { FinnhubSearchResult } from '@/services/finnhub'
import { useProfilStore } from '@/features/profil/profil.store'
import TextField from '@/components/ui/TextField'
import DropdownField from '@/components/ui/DropdownField'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'

const ChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
)

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as InvestmentCategory[]).map(
  (k) => ({ value: k, label: CATEGORY_LABELS[k] })
)

interface Props {
  open: boolean
  onClose: () => void
}

export default function EditInvestmentsPanel({ open, onClose }: Props) {
  const { investments, setInvestments } = useAccueilStore()
  const finnhubKey = useProfilStore((s) => s.finnhubKey)
  const [draft, setDraft] = useState<Investment[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setDraft(investments.map((i) => ({ ...i })))
      setErrors({})
    }
  }, [open, investments])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  function update(id: string, patch: Partial<Investment>) {
    setDraft((d) => d.map((i) => (i.id === id ? { ...i, ...patch } : i)))
    setErrors((e) => { const next = { ...e }; delete next[id]; return next })
  }

  function add() {
    setDraft((d) => [
      ...d,
      { id: crypto.randomUUID(), label: '', category: 'etf', value: 0 },
    ])
  }

  function remove(id: string) {
    setDraft((d) => d.filter((i) => i.id !== id))
  }

  function save() {
    const newErrors: Record<string, string> = {}
    draft.forEach((inv) => {
      if (!inv.label.trim()) newErrors[inv.id] = 'label'
      else if (inv.ticker) {
        if (!inv.shares || inv.shares <= 0) newErrors[inv.id] = 'shares'
      } else if (inv.value <= 0) {
        newErrors[inv.id] = 'value'
      }
    })
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setInvestments(draft)
    onClose()
  }

  const panelContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Mes investissements</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100/80 dark:bg-neutral-700/80 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200/80 dark:hover:bg-neutral-600/80 transition-colors"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      {/* Liste scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4 space-y-3">
        {draft.map((inv) => (
          <div
            key={inv.id}
            className="bg-white/60 dark:bg-neutral-700/60 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-600/50 rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-3">
                <TextField
                  placeholder="Nom de l'investissement"
                  value={inv.label}
                  onChange={(e) => update(inv.id, { label: e.target.value })}
                  error={errors[inv.id] === 'label' ? 'Nom requis' : undefined}
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <DropdownField
                      options={CATEGORY_OPTIONS}
                      value={inv.category}
                      onChange={(e) => update(inv.id, { category: e.target.value as InvestmentCategory })}
                    />
                  </div>
                  {/* Valeur manuelle — cachée quand ticker lié */}
                  {!inv.ticker && (
                    <>
                      <div className="w-28">
                        <TextField
                          type="number"
                          placeholder="Montant"
                          value={inv.value === 0 ? '' : inv.value}
                          onChange={(e) => update(inv.id, { value: parseFloat(e.target.value) || 0 })}
                          error={errors[inv.id] === 'value' ? 'Valeur > 0' : undefined}
                        />
                      </div>
                      <div className="w-20">
                        <TextField
                          type="number"
                          placeholder="Évol. %"
                          value={inv.change === undefined ? '' : inv.change}
                          onChange={(e) => {
                            const v = e.target.value
                            update(inv.id, { change: v === '' ? undefined : parseFloat(v) })
                          }}
                        />
                      </div>
                    </>
                  )}
                  {/* Parts — affichées quand ticker lié */}
                  {inv.ticker && (
                    <div className="w-28">
                      <TextField
                        type="number"
                        placeholder="Nb parts"
                        value={inv.shares === undefined ? '' : inv.shares}
                        onChange={(e) => update(inv.id, { shares: parseFloat(e.target.value) || undefined })}
                        error={errors[inv.id] === 'shares' ? 'Parts > 0' : undefined}
                      />
                    </div>
                  )}
                </div>

                {/* Champ ticker */}
                <TickerField
                  ticker={inv.ticker}
                  apiKey={finnhubKey}
                  onSelect={(ticker) => update(inv.id, { ticker, shares: inv.shares ?? 1 })}
                  onUnlink={() => update(inv.id, { ticker: undefined, shares: undefined })}
                />
              </div>
              <button
                onClick={() => remove(inv.id)}
                className="mt-2 p-1.5 text-neutral-400 hover:text-red-500 transition-colors shrink-0"
                aria-label="Supprimer"
              >
                <Icon name="trash" size={18} />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={add}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-400 transition-colors text-sm font-semibold"
        >
          <Icon name="plus" size={16} />
          Ajouter un investissement
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 pt-3 pb-6 shrink-0 flex gap-3">
        <Button variant="grey-outline" size="lg" className="flex-1 rounded-2xl" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" size="lg" className="flex-1 rounded-2xl" onClick={save}>
          Enregistrer
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile : fullscreen slide depuis le bas */}
      <div
        className={`
          lg:hidden fixed inset-0 z-[110] flex flex-col
          bg-white/80 dark:bg-neutral-900/90 backdrop-blur-xl border-t border-white/40 dark:border-neutral-700/40 shadow-2xl
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
          bg-black/30 backdrop-blur-sm
          transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          className={`
            w-full max-w-lg h-[80vh] flex flex-col
            bg-white/80 dark:bg-neutral-900/90 backdrop-blur-xl border border-white/40 dark:border-neutral-700/40 shadow-2xl rounded-3xl
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

// ─── Champ de recherche ticker ───────────────────────────────────────────────

function TickerField({ ticker, apiKey, onSelect, onUnlink }: {
  ticker?: string
  apiKey: string
  onSelect: (symbol: string) => void
  onUnlink: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FinnhubSearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Ferme le dropdown si clic en dehors (wrapRef ET dropdownRef portal)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const t = e.target as Node
      if (
        wrapRef.current && !wrapRef.current.contains(t) &&
        dropdownRef.current && !dropdownRef.current.contains(t)
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
        <span className="text-xs text-primary-500 dark:text-primary-400">· prix live activé</span>
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
          placeholder={apiKey ? 'Lier à une action (ex: AAPL, BTC…)' : 'Configurez votre clé Finnhub dans le profil'}
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
