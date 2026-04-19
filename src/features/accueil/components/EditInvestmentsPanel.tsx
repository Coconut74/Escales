import { useEffect, useState } from 'react'
import { useAccueilStore } from '../accueil.store'
import type { Investment, InvestmentCategory } from '../accueil.types'
import { CATEGORY_LABELS } from '../accueil.types'
import TextField from '@/components/ui/TextField'
import DropdownField from '@/components/ui/DropdownField'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as InvestmentCategory[]).map(
  (k) => ({ value: k, label: CATEGORY_LABELS[k] })
)

interface Props {
  open: boolean
  onClose: () => void
}

export default function EditInvestmentsPanel({ open, onClose }: Props) {
  const { investments, setInvestments } = useAccueilStore()
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
      else if (inv.value <= 0) newErrors[inv.id] = 'value'
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
                </div>
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
