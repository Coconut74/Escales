import { useState } from 'react'
import type { Project } from '../journal.types'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'

interface Props {
  initial?: Partial<Project>
  onSave: (data: Omit<Project, 'id' | 'milestones' | 'createdAt'>) => void
  onCancel: () => void
}

export default function ProjectEditor({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [targetAmount, setTargetAmount] = useState(initial?.targetAmount?.toString() ?? '')
  const [startDate, setStartDate] = useState(initial?.startDate?.slice(0, 10) ?? '')
  const [endDate, setEndDate] = useState(initial?.endDate?.slice(0, 10) ?? '')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!name.trim()) { setError('Le nom est requis.'); return }
    onSave({
      name: name.trim(),
      description: description.trim(),
      targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-t-3xl lg:rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
            {initial?.name ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <button onClick={onCancel} className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
            <Icon name="plus" size={18} className="rotate-45" />
          </button>
        </div>

        <Field label="Nom *">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="Ex: Achat appartement locatif"
            className={inputCls(!!error)}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre projet…"
            rows={2}
            className={`${inputCls(false)} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Montant cible">
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="50000"
              className={inputCls(false)}
            />
          </Field>
          <Field label="Date début">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls(false)} />
          </Field>
          <Field label="Date fin">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls(false)} />
          </Field>
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="grey-outline" size="lg" className="flex-1 rounded-2xl" onClick={onCancel}>Annuler</Button>
          <Button variant="primary" size="lg" className="flex-1 rounded-2xl" onClick={handleSubmit}>Enregistrer</Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</label>
      {children}
    </div>
  )
}

const inputCls = (err: boolean) =>
  `w-full px-3 py-2 rounded-xl border text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 transition-colors ${
    err ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-600'
  }`
