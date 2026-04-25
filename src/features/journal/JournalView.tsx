import { useState } from 'react'
import NotesTab from './components/NotesTab'
import ProjectsTab from './components/ProjectsTab'

type Tab = 'notes' | 'projects'

export default function JournalView() {
  const [tab, setTab] = useState<Tab>('notes')

  return (
    <div className="flex flex-col h-full">
      {/* Header + onglets */}
      <div className="sticky top-0 z-10 bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-md px-4 pt-6 pb-3">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">Journal de bord</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('notes')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              tab === 'notes'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setTab('projects')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              tab === 'projects'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            Projets
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto">
        {tab === 'notes' ? <NotesTab /> : <ProjectsTab />}
      </div>
    </div>
  )
}
