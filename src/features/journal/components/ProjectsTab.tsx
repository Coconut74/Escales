import { useState } from 'react'
import { useJournalStore } from '../journal.store'
import type { Project, ProjectType } from '../journal.types'
import ProjectEditor from './ProjectEditor'
import { formatCurrency } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import { useT } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'

const TYPE_META: Record<ProjectType, { icon: string }> = {
  savings:       { icon: '/3dicon/Saving.png' },
  'real-estate': { icon: '/3dicon/House.png' },
  investment:    { icon: '/3dicon/Invest.png' },
  loan:          { icon: '/3dicon/Loan.png' },
  free:          { icon: '/3dicon/Task.png' },
}

const TYPE_LABEL_KEYS: Record<ProjectType, TKey> = {
  savings: 'projectType.savings',
  'real-estate': 'projectType.realEstate',
  investment: 'projectType.investment',
  loan: 'projectType.loan',
  free: 'projectType.free',
}

function calcProgress(p: Project): number {
  switch (p.type) {
    case 'savings':
    case 'investment':
      if (!p.targetAmount || !p.currentAmount) return 0
      return Math.min(100, Math.round((p.currentAmount / p.targetAmount) * 100))
    case 'real-estate':
    case 'free': {
      if (p.checklist.length === 0) return 0
      const done = p.checklist.filter((i) => i.done).length
      return Math.round((done / p.checklist.length) * 100)
    }
    case 'loan': {
      if (!p.loanStartDate || !p.loanDurationMonths) return 0
      const start = new Date(p.loanStartDate)
      const now = new Date()
      const elapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
      return Math.min(100, Math.round((Math.max(0, elapsed) / p.loanDurationMonths) * 100))
    }
  }
}

function elapsedMonths(loanStartDate: string): number {
  const start = new Date(loanStartDate)
  const now = new Date()
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()))
}

export default function ProjectsTab() {
  const { projects, addProject, removeProject } = useJournalStore()
  const [showEditor, setShowEditor] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const t = useT()

  function handleCreate(data: Omit<Project, 'id' | 'createdAt'>) {
    addProject({ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
    setShowEditor(false)
  }

  const selectedProject = selected ? projects.find((p) => p.id === selected) : null

  return (
    <div className="relative min-h-full pb-32 lg:pb-8">
      <div className="px-4 pt-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <img src="/3dicon/Project.png" alt="" className="w-16 h-16 object-contain" />
            <p className="text-sm text-neutral-400 dark:text-neutral-500">{t('projects.empty')}</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-600">{t('projects.emptyHint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelected(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bouton flottant */}
      <button
        onClick={() => setShowEditor(true)}
        className="fixed bottom-[120px] lg:bottom-8 right-6 flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-colors z-40"
      >
        <Icon name="plus" size={16} />
        {t('projects.new')}
      </button>

      {showEditor && (
        <ProjectEditor onSave={handleCreate} onCancel={() => setShowEditor(false)} />
      )}

      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelected(null)}
          onDelete={() => { removeProject(selectedProject.id); setSelected(null) }}
        />
      )}
    </div>
  )
}

function ProjectCard({ project, onClick }: {
  project: Project
  onClick: () => void
}) {
  const currency = useProfilStore((s) => s.currency)
  const t = useT()
  const meta = TYPE_META[project.type] ?? { icon: '📋' }
  const typeLabel = t(TYPE_LABEL_KEYS[project.type] ?? 'projectType.free' as TKey)
  const progress = calcProgress(project)

  return (
    <div
      className="group relative bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <img src={meta.icon} alt="" className="w-8 h-8 object-contain shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-900 dark:text-neutral-50 truncate">{project.name}</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">{typeLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{progress}%</span>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mt-3 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Métriques spécifiques au type */}
      <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
        <CardMeta project={project} currency={currency} />
      </div>
    </div>
  )
}

function CardMeta({ project, currency }: { project: Project; currency: string }) {
  const t = useT()
  switch (project.type) {
    case 'savings':
    case 'investment':
      return (
        <>
          {project.currentAmount !== undefined && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatCurrency(project.currentAmount, currency)}
              {project.targetAmount ? <span className="text-neutral-300 dark:text-neutral-600"> / {formatCurrency(project.targetAmount, currency)}</span> : null}
            </span>
          )}
          {project.type === 'investment' && project.assetName && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">{project.assetName}</span>
          )}
        </>
      )
    case 'real-estate':
    case 'free': {
      const done = project.checklist.filter((i) => i.done).length
      const total = project.checklist.length
      return (
        <>
          {total > 0 && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {done}/{total} {t('projects.step')}{total > 1 ? 's' : ''}
            </span>
          )}
          {project.type === 'real-estate' && project.city && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">{project.city}</span>
          )}
        </>
      )
    }
    case 'loan': {
      if (!project.loanStartDate || !project.loanDurationMonths) return null
      const elapsed = elapsedMonths(project.loanStartDate)
      const remaining = Math.max(0, project.loanDurationMonths - elapsed)
      return (
        <>
          {project.loanAmount && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatCurrency(project.loanAmount, currency)}
            </span>
          )}
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            {t('projects.monthsRemaining', { n: remaining })}
          </span>
        </>
      )
    }
  }
}

function ProjectDetail({ project, onClose, onDelete }: { project: Project; onClose: () => void; onDelete: () => void }) {
  const { updateProject, toggleChecklistItem } = useJournalStore()
  const currency = useProfilStore((s) => s.currency)
  const t = useT()
  const [currentInput, setCurrentInput] = useState(project.currentAmount?.toString() ?? '')
  const meta = TYPE_META[project.type] ?? { icon: '📋' }
  const typeLabel = t(TYPE_LABEL_KEYS[project.type] ?? 'projectType.free' as TKey)
  const progress = calcProgress(project)

  function saveCurrentAmount() {
    const val = parseFloat(currentInput)
    if (!isNaN(val)) updateProject(project.id, { currentAmount: val })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-4 lg:p-8">
      <div className="w-full max-w-lg max-h-[85vh] bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0 border-b border-neutral-100 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <img src={meta.icon} alt="" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50 leading-tight">{project.name}</h2>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{typeLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-semibold transition-colors"
            >
              {t('projects.delete')}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Barre de progression */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{t('projects.progress')}</span>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{project.description}</p>
          )}

          {/* Contenu spécifique */}
          <DetailContent
            project={project}
            currency={currency}
            currentInput={currentInput}
            setCurrentInput={setCurrentInput}
            onToggle={(itemId) => toggleChecklistItem(project.id, itemId)}
            onSave={saveCurrentAmount}
          />
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-700 shrink-0">
          <Button variant="grey-outline" size="lg" className="w-full rounded-2xl" onClick={onClose}>
            {t('projects.close')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function DetailContent({ project, currency, currentInput, setCurrentInput, onToggle, onSave }: {
  project: Project
  currency: string
  currentInput: string
  setCurrentInput: (v: string) => void
  onToggle: (itemId: string) => void
  onSave: () => void
}) {
  const t = useT()
  switch (project.type) {
    case 'savings':
    case 'investment': {
      const isDirty = currentInput !== (project.currentAmount?.toString() ?? '')
      return (
        <div className="space-y-3">
          {project.targetAmount && (
            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('projects.target')}</span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                {formatCurrency(project.targetAmount, currency)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl gap-2">
            <span className="text-xs text-primary-700 dark:text-primary-300 shrink-0">{t('projects.current')}</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="0"
                className="w-28 text-right px-2 py-1 rounded-lg border border-primary-200 dark:border-primary-800 bg-transparent text-sm font-semibold text-primary-700 dark:text-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-400 dark:focus:ring-primary-600"
              />
              {isDirty && (
                <>
                  <button
                    onClick={() => setCurrentInput(project.currentAmount?.toString() ?? '')}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-500 transition-colors"
                  >
                    <Icon name="x" size={13} />
                  </button>
                  <button
                    onClick={onSave}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                  >
                    <Icon name="check" size={13} />
                  </button>
                </>
              )}
            </div>
          </div>
          {project.targetAmount && project.currentAmount !== undefined && (
            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('projects.remaining')}</span>
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                {formatCurrency(Math.max(0, project.targetAmount - project.currentAmount), currency)}
              </span>
            </div>
          )}
          {project.type === 'investment' && project.assetName && (
            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('projects.asset')}</span>
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{project.assetName}</span>
            </div>
          )}
        </div>
      )
    }

    case 'real-estate':
    case 'free': {
      if (project.checklist.length === 0) {
        return <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-4">{t('projects.noSteps')}</p>
      }
      return (
        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {project.type === 'real-estate' ? t('projects.steps') : t('projects.checklist')}
          </p>
          {project.checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
            >
              <span className={`text-lg ${item.done ? 'text-green-500' : 'text-neutral-300 dark:text-neutral-600'}`}>
                {item.done ? '✅' : '⬜'}
              </span>
              <span className={`text-sm ${item.done ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-800 dark:text-neutral-100'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )
    }

    case 'loan': {
      if (!project.loanStartDate || !project.loanDurationMonths) return null
      const elapsed = elapsedMonths(project.loanStartDate)
      const remaining = Math.max(0, project.loanDurationMonths - elapsed)
      return (
        <div className="space-y-3">
          {project.loanAmount && (
            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('projects.loanAmount')}</span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                {formatCurrency(project.loanAmount, currency)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('projects.totalDuration')}</span>
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{project.loanDurationMonths} {t('projects.months')}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
            <span className="text-xs text-primary-700 dark:text-primary-300">{t('projects.elapsed')}</span>
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">{elapsed} {t('projects.months')}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('projects.remaining')}</span>
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{remaining} {t('projects.months')}</span>
          </div>
        </div>
      )
    }
  }
}
