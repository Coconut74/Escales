import { useEffect, useState } from 'react'
import { useAccueilStore, selectEffectiveChange } from '../accueil.store'
import type { Investment, InvestmentCategory } from '../accueil.types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../accueil.types'
import TextField from '@/components/ui/TextField'
import DropdownField from '@/components/ui/DropdownField'
import Icon from '@/components/ui/Icon'
import { useT } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'
import { formatCurrency } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'
import { useStockPrices } from '@/hooks/useStockPrices'
import InvestmentDetailView from './InvestmentDetailView'
import TickerField from './TickerField'

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
  open: boolean
  onClose: () => void
}

export default function EditInvestmentsPanel({ open, onClose }: Props) {
  const { investments, snapshots, addInvestment, updateInvestment } = useAccueilStore()
  const currency = useProfilStore((s) => s.currency)
  const t = useT()

  const apiKey = import.meta.env.VITE_FINNHUB_KEY ?? ''
  const { prices } = useStockPrices(investments, apiKey)

  const [view, setView] = useState<'list' | 'detail' | 'create'>('list')
  const [detailInvestment, setDetailInvestment] = useState<Investment | null>(null)

  // Mini-modal pour modifier nom + catégorie
  const [editTarget, setEditTarget] = useState<Investment | null>(null)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState<InvestmentCategory>('etf')
  const [editError, setEditError] = useState(false)

  // Formulaire de création
  const [createDraft, setCreateDraft] = useState<Investment>(() => freshDraft())
  const [createError, setCreateError] = useState<string | null>(null)

  const CATEGORY_OPTIONS = CATEGORY_OPTIONS_KEYS.map((k) => ({ value: k, label: t(CATEGORY_TKEYS[k]) }))

  function freshDraft(): Investment {
    return { id: crypto.randomUUID(), label: '', category: 'etf', value: 0 }
  }

  useEffect(() => {
    if (open) {
      setView('list')
      setDetailInvestment(null)
      setEditTarget(null)
      setCreateDraft(freshDraft())
      setCreateError(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editTarget) { setEditTarget(null); return }
        if (view !== 'list') { setView('list'); setDetailInvestment(null); return }
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, view, editTarget])

  function openDetail(inv: Investment) {
    setDetailInvestment(inv)
    setView('detail')
  }

  function backToList() {
    setView('list')
    setDetailInvestment(null)
  }

  function openEditModal(inv: Investment) {
    setEditTarget(inv)
    setEditName(inv.label)
    setEditCategory(inv.category)
    setEditError(false)
  }

  function saveEdit() {
    if (!editName.trim()) { setEditError(true); return }
    updateInvestment(editTarget!.id, { label: editName.trim(), category: editCategory })
    setEditTarget(null)
  }

  function startCreate() {
    setCreateDraft(freshDraft())
    setCreateError(null)
    setView('create')
  }

  function handleCreate() {
    if (!createDraft.label.trim()) { setCreateError('label'); return }
    if (createDraft.ticker) {
      if (!createDraft.shares || createDraft.shares <= 0) { setCreateError('shares'); return }
    } else if (createDraft.value <= 0) {
      setCreateError('value'); return
    }
    addInvestment(createDraft)
    backToList()
  }

  function updateCreate(patch: Partial<Investment>) {
    setCreateDraft((d) => ({ ...d, ...patch }))
    setCreateError(null)
  }

  // Calcul de l'évolution par investissement
  function getChange(inv: Investment): number | null {
    if (inv.ticker && prices[inv.id]) return prices[inv.id]?.changePercent ?? null
    const invSnaps = snapshots.filter((s) => s.investmentId === inv.id)
    return selectEffectiveChange(inv, invSnaps) ?? inv.change ?? null
  }

  const panelContent = (
    <div className="flex flex-col h-full relative overflow-hidden">

      {/* ── Vue liste ─────────────────────────────────────────────── */}
      <div
        className={`absolute inset-0 flex flex-col transition-transform duration-250 ease-out ${
          view === 'list' ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
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
                change={getChange(inv)}
                onDetail={() => openDetail(inv)}
                onEdit={() => openEditModal(inv)}
              />
            ))}
          </div>

          <button
            onClick={startCreate}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-400 transition-colors text-base font-semibold"
          >
            <Icon name="plus" size={20} />
            {t('edit.addInvestment')}
          </button>
        </div>
      </div>

      {/* ── Vue détail ────────────────────────────────────────────── */}
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

      {/* ── Vue création ──────────────────────────────────────────── */}
      <div
        className={`absolute inset-0 flex flex-col bg-white dark:bg-neutral-900 transition-transform duration-250 ease-out ${
          view === 'create' ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {view === 'create' && (
          <>
            <div className="flex items-center gap-2 px-4 pt-5 pb-3 shrink-0">
              <button
                onClick={backToList}
                className="flex items-center gap-1.5 text-base font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                <Icon name="chevron-left" size={20} />
                {t('detail.back')}
              </button>
              <h2 className="flex-1 text-lg font-bold text-neutral-900 dark:text-neutral-50 text-center pr-16">
                {t('create.title')}
              </h2>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6 space-y-4">
              {/* Nom */}
              <TextField
                placeholder={t('edit.investmentName')}
                value={createDraft.label}
                onChange={(e) => updateCreate({ label: e.target.value })}
                error={createError === 'label' ? t('edit.nameRequired') : undefined}
              />

              {/* Catégorie */}
              <DropdownField
                options={CATEGORY_OPTIONS}
                value={createDraft.category}
                onChange={(e) => updateCreate({ category: e.target.value as InvestmentCategory })}
              />

              {/* Valeur ou parts */}
              <div className="flex gap-2">
                {!createDraft.ticker && (
                  <>
                    <div className="flex-1">
                      <TextField
                        type="number"
                        placeholder={t('edit.amount')}
                        value={createDraft.value === 0 ? '' : createDraft.value}
                        onChange={(e) => updateCreate({ value: parseFloat(e.target.value) || 0 })}
                        error={createError === 'value' ? t('edit.valueRequired') : undefined}
                      />
                    </div>
                    <div className="w-24">
                      <TextField
                        type="number"
                        placeholder={t('edit.changePct')}
                        value={createDraft.change === undefined ? '' : createDraft.change}
                        onChange={(e) => {
                          const v = e.target.value
                          updateCreate({ change: v === '' ? undefined : parseFloat(v) })
                        }}
                      />
                    </div>
                  </>
                )}
                {createDraft.ticker && (
                  <div className="flex-1">
                    <TextField
                      type="number"
                      placeholder={t('edit.shares')}
                      value={createDraft.shares === undefined ? '' : createDraft.shares}
                      onChange={(e) => updateCreate({ shares: parseFloat(e.target.value) || undefined })}
                      error={createError === 'shares' ? t('edit.sharesRequired') : undefined}
                    />
                  </div>
                )}
              </div>

              {/* Ticker */}
              <TickerField
                ticker={createDraft.ticker}
                apiKey={apiKey}
                onSelect={(ticker) => updateCreate({ ticker, shares: createDraft.shares ?? 1 })}
                onUnlink={() => updateCreate({ ticker: undefined, shares: undefined })}
              />

              {/* Bouton enregistrer */}
              <button
                onClick={handleCreate}
                className="w-full py-3.5 rounded-2xl bg-primary-500 text-white text-base font-bold hover:bg-primary-600 transition-colors"
              >
                {t('create.save')}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Mini-modal modifier nom/catégorie ─────────────────────── */}
      {editTarget && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setEditTarget(null) }}
        >
          <div className="w-full max-w-sm bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
              {t('detail.editInfo')}
            </h3>
            <TextField
              placeholder={t('edit.investmentName')}
              value={editName}
              onChange={(e) => { setEditName(e.target.value); setEditError(false) }}
              error={editError ? t('edit.nameRequired') : undefined}
            />
            <DropdownField
              options={CATEGORY_OPTIONS}
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as InvestmentCategory)}
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setEditTarget(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-500 transition-colors"
              >
                <Icon name="x" size={20} />
              </button>
              <button
                onClick={saveEdit}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                <Icon name="check" size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
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
        onClick={(e) => { if (e.target === e.currentTarget && !editTarget) onClose() }}
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

// ─── Ligne de la liste ────────────────────────────────────────────────────────

function ViewRow({ inv, currency, change, onDetail, onEdit }: {
  inv: Investment
  currency: string
  change: number | null
  onDetail: () => void
  onEdit: () => void
}) {
  const t = useT()
  const color = CATEGORY_COLORS[inv.category]
  const initials = inv.label.slice(0, 2).toUpperCase() || '?'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onDetail}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onDetail() }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-neutral-100/60 dark:hover:bg-neutral-700/40 transition-colors cursor-pointer"
    >
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

      <div className="flex flex-col items-end shrink-0 gap-0.5">
        <span className="text-base font-bold text-neutral-700 dark:text-neutral-200 tabular-nums">
          {formatCurrency(inv.value, currency)}
        </span>
        {change !== null && (
          <span className={`text-base font-semibold tabular-nums ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onEdit() }}
        className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors shrink-0"
        aria-label={t('detail.editInfo')}
      >
        <Icon name="write" size={20} />
      </button>
    </div>
  )
}
