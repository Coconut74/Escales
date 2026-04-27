import { useState } from 'react'
import { useAuthStore } from './auth.store'
import { useAccueilStore } from '@/features/accueil/accueil.store'
import { useJournalStore } from '@/features/journal/journal.store'

export function hasMigratableData(): boolean {
  try {
    const accueil = localStorage.getItem('escales-accueil')
    const journal = localStorage.getItem('escales-journal')
    if (accueil) {
      const parsed = JSON.parse(accueil)
      if ((parsed.state?.investments?.length ?? 0) > 0) return true
    }
    if (journal) {
      const parsed = JSON.parse(journal)
      if ((parsed.state?.notes?.length ?? 0) > 0) return true
      if ((parsed.state?.projects?.length ?? 0) > 0) return true
    }
  } catch { /* ignore */ }
  return false
}

export default function MigrationBanner() {
  const { user } = useAuthStore()
  const { setInvestments, investments } = useAccueilStore()
  const { addNote, addProject } = useJournalStore()
  const [dismissed, setDismissed] = useState(false)
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)

  if (dismissed || done || !user || investments.length > 0) return null
  if (!hasMigratableData()) return null

  async function handleImport() {
    setImporting(true)
    try {
      const accueil = localStorage.getItem('escales-accueil')
      const journal = localStorage.getItem('escales-journal')

      if (accueil) {
        const parsed = JSON.parse(accueil)
        const invs = parsed.state?.investments ?? []
        if (invs.length > 0) await setInvestments(invs)
      }

      if (journal) {
        const parsed = JSON.parse(journal)
        const notes = parsed.state?.notes ?? []
        const projects = parsed.state?.projects ?? []
        for (const note of notes) await addNote(note)
        for (const project of projects) await addProject(project)
      }

      localStorage.removeItem('escales-accueil')
      localStorage.removeItem('escales-journal')
      setDone(true)
    } catch { /* ignore */ }
    setImporting(false)
  }

  return (
    <div className="mx-4 mt-4 px-4 py-3 rounded-2xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 flex items-center justify-between gap-4">
      <p className="text-sm text-primary-800 dark:text-primary-200">
        Vous avez des données locales non synchronisées. Voulez-vous les importer dans votre compte ?
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setDismissed(true)}
          className="text-sm text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 px-2 py-1"
        >
          Ignorer
        </button>
        <button
          onClick={handleImport}
          disabled={importing}
          className="text-sm font-semibold px-3 py-1.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {importing ? 'Import…' : 'Importer'}
        </button>
      </div>
    </div>
  )
}
