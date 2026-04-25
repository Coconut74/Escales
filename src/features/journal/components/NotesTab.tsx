import { useState } from 'react'
import { useJournalStore } from '../journal.store'
import { useProfilStore } from '@/features/profil/profil.store'
import type { Note } from '../journal.types'
import NoteEditor from './NoteEditor'
import Icon from '@/components/ui/Icon'
import { useT } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'

type TFunc = ReturnType<typeof useT>

function relativeDate(iso: string, t: TFunc, lang: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return t('notes.justNow')
  if (min < 60) return t('notes.minutesAgo' as TKey, { n: min })
  const h = Math.floor(min / 60)
  if (h < 24) return t('notes.hoursAgo' as TKey, { n: h })
  const d = Math.floor(h / 24)
  if (d < 7) return t('notes.daysAgo' as TKey, { n: d })
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'fr-FR').format(new Date(iso))
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function NotesTab() {
  const { notes, addNote, removeNote } = useJournalStore()
  const [editing, setEditing] = useState<Note | null>(null)
  const t = useT()
  const lang = useProfilStore((s) => s.language)

  function createNote() {
    const note: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addNote(note)
    setEditing(note)
  }

  if (editing) {
    return (
      <NoteEditor
        note={editing}
        onClose={() => setEditing(null)}
        onDelete={() => { removeNote(editing.id); setEditing(null) }}
      />
    )
  }

  return (
    <div className="relative min-h-full pb-32 lg:pb-8">
      <div className="px-4 pt-4">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <span className="text-4xl">📝</span>
            <p className="text-sm text-neutral-400 dark:text-neutral-500">{t('notes.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group relative bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
                onClick={() => setEditing(note)}
              >
                <p className="font-semibold text-neutral-900 dark:text-neutral-50 truncate mb-1">
                  {note.title || <span className="italic text-neutral-400">{t('notes.noTitle')}</span>}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
                  {stripHtml(note.content) || <span className="italic">{t('notes.emptyNote')}</span>}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">{relativeDate(note.updatedAt, t, lang)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bouton flottant */}
      <button
        onClick={createNote}
        className="fixed bottom-[120px] lg:bottom-8 right-6 flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-colors z-40"
      >
        <Icon name="plus" size={16} />
        {t('notes.newNote')}
      </button>
    </div>
  )
}
