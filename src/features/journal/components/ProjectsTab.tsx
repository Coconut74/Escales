import { useState } from 'react'
import { useJournalStore } from '../journal.store'
import type { Project } from '../journal.types'
import ProjectEditor from './ProjectEditor'
import ProjectTimeline from './ProjectTimeline'
import { formatCurrency, formatDate } from '@/lib/formatting'
import { useProfilStore } from '@/features/profil/profil.store'
import Icon from '@/components/ui/Icon'

export default function ProjectsTab() {
  const { projects, addProject, updateProject, removeProject } = useJournalStore()
  const currency = useProfilStore((s) => s.currency)
  const [showEditor, setShowEditor] = useState(false)
  const [selected, setSelected] = useState<Project | null>(null)

  function handleCreate(data: Omit<Project, 'id' | 'milestones' | 'createdAt'>) {
    addProject({ ...data, id: crypto.randomUUID(), milestones: [], createdAt: new Date().toISOString() })
    setShowEditor(false)
  }

  if (selected) {
    // Toujours lire la version fraîche du store
    const live = projects.find((p) => p.id === selected.id) ?? selected
    return <ProjectTimeline project={live} onBack={() => setSelected(null)} />
  }

  return (
    <div className="relative min-h-full pb-32 lg:pb-8">
      <div className="px-4 pt-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <span className="text-4xl">🗂️</span>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">Aucun projet pour l'instant.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
                onClick={() => setSelected(project)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-50 truncate">{project.name}</p>
                    {project.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">{project.description}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeProject(project.id) }}
                    className="p-1 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all shrink-0"
                    aria-label="Supprimer"
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {project.targetAmount && (
                    <span className="text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
                      🎯 {formatCurrency(project.targetAmount, currency)}
                    </span>
                  )}
                  {project.startDate && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
                      {formatDate(project.startDate)}{project.endDate ? ` → ${formatDate(project.endDate)}` : ''}
                    </span>
                  )}
                  {project.milestones.length > 0 && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
                      {project.milestones.length} jalon{project.milestones.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
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
        Nouveau projet
      </button>

      {showEditor && (
        <ProjectEditor onSave={handleCreate} onCancel={() => setShowEditor(false)} />
      )}
    </div>
  )
}
