import { useState } from 'react'
import type { Project, Milestone, MilestoneStatus } from '../journal.types'
import { useJournalStore } from '../journal.store'
import { formatCurrency, formatDate } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'

const STATUS_COLORS: Record<MilestoneStatus, string> = {
  done: 'bg-green-500 border-green-500',
  'in-progress': 'bg-primary-500 border-primary-500',
  planned: 'bg-neutral-300 dark:bg-neutral-600 border-neutral-300 dark:border-neutral-600',
}
const STATUS_LABELS: Record<MilestoneStatus, string> = {
  done: 'Terminé',
  'in-progress': 'En cours',
  planned: 'Planifié',
}

interface Props {
  project: Project
  onBack: () => void
}

export default function ProjectTimeline({ project, onBack }: Props) {
  const { addMilestone, updateMilestone, removeMilestone } = useJournalStore()
  const currency = useProfilStore((s) => s.currency)
  const [selected, setSelected] = useState<string | null>(null)
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)

  const milestones = [...project.milestones].sort((a, b) => a.date.localeCompare(b.date))

  function handleAddMilestone(data: Omit<Milestone, 'id'>) {
    addMilestone(project.id, { ...data, id: crypto.randomUUID() })
    setShowMilestoneForm(false)
  }

  function toggleStatus(m: Milestone) {
    const next: MilestoneStatus = m.status === 'planned' ? 'in-progress' : m.status === 'in-progress' ? 'done' : 'planned'
    updateMilestone(project.id, m.id, { status: next })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-neutral-100/90 dark:bg-neutral-800/90 backdrop-blur-md px-4 pt-4 pb-3 border-b border-neutral-200/50 dark:border-neutral-700/50">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 mb-3 transition-colors">
          <Icon name="arrow" size={16} className="rotate-180" />
          Projets
        </button>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 truncate">{project.name}</h2>
        {project.description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{project.description}</p>
        )}
        <div className="flex flex-wrap gap-3 mt-2">
          {project.targetAmount && (
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2.5 py-1 rounded-full">
              🎯 {formatCurrency(project.targetAmount, currency)}
            </span>
          )}
          {project.startDate && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2.5 py-1 rounded-full">
              {formatDate(project.startDate)} → {project.endDate ? formatDate(project.endDate) : '…'}
            </span>
          )}
        </div>
      </div>

      {/* Timeline horizontale */}
      <div className="flex-1 overflow-auto px-4 py-8">
        {milestones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span className="text-3xl">🗓️</span>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">Aucun jalon pour l'instant.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="relative inline-flex items-center min-w-full" style={{ minWidth: `${Math.max(milestones.length * 180, 400)}px` }}>
              {/* Ligne centrale */}
              <div className="absolute left-16 right-16 top-1/2 h-0.5 bg-neutral-200 dark:bg-neutral-700 -translate-y-1/2" />

              {milestones.map((m, i) => {
                const above = i % 2 === 0
                const isSelected = selected === m.id
                return (
                  <div
                    key={m.id}
                    className="relative flex flex-col items-center"
                    style={{ flex: '0 0 180px' }}
                  >
                    {/* Label haut */}
                    {above && (
                      <div
                        className="mb-2 cursor-pointer"
                        style={{ paddingBottom: '24px' }}
                        onClick={() => setSelected(isSelected ? null : m.id)}
                      >
                        <MilestoneLabel m={m} isSelected={isSelected} />
                      </div>
                    )}
                    {!above && <div style={{ height: '64px' }} />}

                    {/* Point */}
                    <button
                      onClick={() => setSelected(isSelected ? null : m.id)}
                      title="Changer le statut"
                      className={`relative z-10 w-5 h-5 rounded-full border-2 transition-all hover:scale-125 ${STATUS_COLORS[m.status]} shrink-0`}
                    />

                    {/* Label bas */}
                    {!above && (
                      <div
                        className="mt-2 cursor-pointer"
                        style={{ paddingTop: '24px' }}
                        onClick={() => setSelected(isSelected ? null : m.id)}
                      >
                        <MilestoneLabel m={m} isSelected={isSelected} />
                      </div>
                    )}
                    {above && <div style={{ height: '64px' }} />}

                    {/* Popup actions */}
                    {isSelected && (
                      <div className="absolute z-20 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl p-3 w-48 text-center"
                        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: above ? '60px' : '-60px' }}
                      >
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-50 mb-1">{m.title}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{formatDate(m.date)}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleStatus(m) }}
                          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline block w-full mb-1"
                        >
                          → {STATUS_LABELS[m.status === 'planned' ? 'in-progress' : m.status === 'in-progress' ? 'done' : 'planned']}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeMilestone(project.id, m.id); setSelected(null) }}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Légende */}
        {milestones.length > 0 && (
          <div className="flex gap-4 mt-2 px-2">
            {(Object.entries(STATUS_LABELS) as [MilestoneStatus, string][]).map(([s, label]) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[s]}`} />
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire nouveau jalon */}
      {showMilestoneForm && (
        <MilestoneForm onSave={handleAddMilestone} onCancel={() => setShowMilestoneForm(false)} />
      )}

      {/* Bouton flottant */}
      {!showMilestoneForm && (
        <button
          onClick={() => setShowMilestoneForm(true)}
          className="fixed bottom-[120px] lg:bottom-8 right-6 flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-colors z-40"
        >
          <Icon name="plus" size={16} />
          Ajouter un jalon
        </button>
      )}
    </div>
  )
}

function MilestoneLabel({ m, isSelected }: { m: Milestone; isSelected: boolean }) {
  return (
    <div className={`text-center px-2 max-w-[140px] ${isSelected ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}>
      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{m.title}</p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500">{new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
      <span className={`text-xs font-medium ${
        m.status === 'done' ? 'text-green-600 dark:text-green-400' :
        m.status === 'in-progress' ? 'text-primary-600 dark:text-primary-400' :
        'text-neutral-400'
      }`}>
        {STATUS_LABELS[m.status]}
      </span>
    </div>
  )
}

function MilestoneForm({ onSave, onCancel }: {
  onSave: (data: Omit<Milestone, 'id'>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState<MilestoneStatus>('planned')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  function handleSave() {
    if (!title.trim()) { setError('Titre requis'); return }
    if (!date) { setError('Date requise'); return }
    onSave({ title: title.trim(), date, status, description: description.trim() || undefined })
  }

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-4 space-y-3">
      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Nouveau jalon</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError('') }}
            placeholder="Titre du jalon *"
            className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700"
          />
        </div>
        <div>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setError('') }}
            className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700"
        >
          <option value="planned">Planifié</option>
          <option value="in-progress">En cours</option>
          <option value="done">Terminé</option>
        </select>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-3">
        <Button variant="grey-outline" size="md" className="flex-1 rounded-2xl" onClick={onCancel}>Annuler</Button>
        <Button variant="primary" size="md" className="flex-1 rounded-2xl" onClick={handleSave}>Ajouter</Button>
      </div>
    </div>
  )
}
