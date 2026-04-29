import { useState } from 'react'
import NotesTab from './components/NotesTab'
import ProjectsTab from './components/ProjectsTab'
import { useT } from '@/lib/i18n'

type Tab = 'notes' | 'projects'

export default function JournalView() {
  const [tab, setTab] = useState<Tab>('notes')
  const t = useT()

  return (
    <div className="flex flex-col h-full">
      {/* Header + onglets */}
      <div className="sticky top-0 z-10 bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-md px-4 pt-6 pb-3">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">{t('journal.title')}</h1>
        <div role="tablist" aria-label={t('journal.title')} className="flex gap-2">
          <button
            role="tab"
            aria-selected={tab === 'notes'}
            id="tab-notes"
            aria-controls="panel-notes"
            onClick={() => setTab('notes')}
            className={`px-4 py-1.5 rounded-full text-base font-semibold transition-all ${
              tab === 'notes'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            {t('journal.notes')}
          </button>
          <button
            role="tab"
            aria-selected={tab === 'projects'}
            id="tab-projects"
            aria-controls="panel-projects"
            onClick={() => setTab('projects')}
            className={`px-4 py-1.5 rounded-full text-base font-semibold transition-all ${
              tab === 'projects'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            {t('journal.projects')}
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto">
        <div role="tabpanel" id="panel-notes" aria-labelledby="tab-notes" hidden={tab !== 'notes'}>
          <NotesTab />
        </div>
        <div role="tabpanel" id="panel-projects" aria-labelledby="tab-projects" hidden={tab !== 'projects'}>
          <ProjectsTab />
        </div>
      </div>
    </div>
  )
}
