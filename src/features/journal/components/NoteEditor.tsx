import { useEffect, useRef, useCallback } from 'react'
import type { Note } from '../journal.types'
import { useJournalStore } from '../journal.store'
import Icon from '@/components/ui/Icon'

interface Props {
  note: Note
  onClose: () => void
}

export default function NoteEditor({ note, onClose }: Props) {
  const updateNote = useJournalStore((s) => s.updateNote)
  const titleRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  // Initialise le contenu HTML au montage
  useEffect(() => {
    if (bodyRef.current && bodyRef.current.innerHTML !== note.content) {
      bodyRef.current.innerHTML = note.content
    }
    titleRef.current?.focus()
  }, [note.id])  // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleSave = useCallback((patch: Partial<Note>) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateNote(note.id, { ...patch, updatedAt: new Date().toISOString() })
    }, 500)
  }, [note.id, updateNote])

  function handleTitleChange(v: string) {
    scheduleSave({ title: v })
  }

  function handleBodyInput() {
    scheduleSave({ content: bodyRef.current?.innerHTML ?? '' })
  }

  function execFmt(cmd: string, value?: string) {
    document.execCommand(cmd, false, value)
    bodyRef.current?.focus()
    handleBodyInput()
  }

  // Flush avant fermeture
  function handleClose() {
    clearTimeout(saveTimer.current)
    updateNote(note.id, {
      title: titleRef.current?.value ?? note.title,
      content: bodyRef.current?.innerHTML ?? note.content,
      updatedAt: new Date().toISOString(),
    })
    onClose()
  }

  useEffect(() => () => clearTimeout(saveTimer.current), [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-neutral-900">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
        <button
          onClick={handleClose}
          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Retour"
        >
          <Icon name="arrow" size={20} className="rotate-180" />
        </button>
        <div className="flex-1" />
        <ToolbarBtn onClick={() => execFmt('bold')} label="Gras" title="Gras">
          <strong className="text-sm">G</strong>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => execFmt('italic')} label="Italique" title="Italique">
          <em className="text-sm">I</em>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => execFmt('insertUnorderedList')} label="Liste à puces" title="Liste à puces">
          <span className="text-sm">•≡</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => execFmt('insertOrderedList')} label="Liste numérotée" title="Liste numérotée">
          <span className="text-sm">1≡</span>
        </ToolbarBtn>
      </div>

      {/* Titre */}
      <input
        ref={titleRef}
        type="text"
        defaultValue={note.title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Titre"
        className="w-full px-6 pt-5 pb-2 text-2xl font-bold bg-transparent text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus:outline-none"
      />

      {/* Corps */}
      <div
        ref={bodyRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleBodyInput}
        data-placeholder="Commencez à écrire…"
        className="flex-1 px-6 py-2 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed focus:outline-none overflow-auto
          [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5
          empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-300 dark:empty:before:text-neutral-600 empty:before:pointer-events-none"
      />
    </div>
  )
}

function ToolbarBtn({ onClick, label, title, children }: {
  onClick: () => void; label: string; title: string; children: React.ReactNode
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      aria-label={label}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      {children}
    </button>
  )
}
