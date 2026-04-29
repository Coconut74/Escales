import { useEffect, useRef, useCallback } from 'react'
import type { Note } from '../journal.types'
import { useJournalStore } from '../journal.store'
import Icon from '@/components/ui/Icon'
import { useT } from '@/lib/i18n'

interface Props {
  note: Note
  onClose: () => void
  onDelete: () => void
}

export default function NoteEditor({ note, onClose, onDelete }: Props) {
  const updateNote = useJournalStore((s) => s.updateNote)
  const t = useT()
  const titleRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.innerHTML = note.content
    titleRef.current?.focus()
  }, [note.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleSave = useCallback((patch: Partial<Note>) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updateNote(note.id, { ...patch, updatedAt: new Date().toISOString() })
    }, 500)
  }, [note.id, updateNote])

  function handleBodyInput() {
    scheduleSave({ content: bodyRef.current?.innerHTML ?? '' })
  }

  function execFmt(cmd: string, value?: string) {
    document.execCommand(cmd, false, value)
    bodyRef.current?.focus()
    handleBodyInput()
  }

  function insertCheckbox() {
    document.execCommand('insertHTML', false,
      '<span data-cb="false" style="cursor:pointer;user-select:none">&#9744;</span>&nbsp;'
    )
    bodyRef.current?.focus()
    handleBodyInput()
  }

  // Toggle checkbox on click
  function handleBodyClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    if (target.dataset.cb !== undefined) {
      const done = target.dataset.cb === 'true'
      target.dataset.cb = done ? 'false' : 'true'
      target.innerHTML = done ? '&#9744;' : '&#9745;'
      scheduleSave({ content: bodyRef.current?.innerHTML ?? '' })
    }
  }

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-editor-title"
      className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-4 lg:p-8"
    >
      <div className="w-full max-w-2xl h-[85vh] rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-2xl flex flex-col overflow-hidden bg-white dark:bg-neutral-800">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors mr-1"
            aria-label={t('noteEditor.back')}
          >
            <Icon name="arrow" size={20} className="rotate-180" />
          </button>
          <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mx-1" />
          <ToolbarBtn onClick={() => execFmt('bold')} label={t('noteEditor.bold')}><strong className="text-base">G</strong></ToolbarBtn>
          <ToolbarBtn onClick={() => execFmt('italic')} label={t('noteEditor.italic')}><em className="text-base font-serif">I</em></ToolbarBtn>
          <ToolbarBtn onClick={() => execFmt('insertUnorderedList')} label={t('noteEditor.bulletList')}><span className="text-base">•≡</span></ToolbarBtn>
          <ToolbarBtn onClick={() => execFmt('insertOrderedList')} label={t('noteEditor.numberedList')}><span className="text-base">1≡</span></ToolbarBtn>
          <ToolbarBtn onClick={insertCheckbox} label={t('noteEditor.checkbox')}><span className="text-base leading-none">☑</span></ToolbarBtn>
          <div className="flex-1" />
          <button
            onClick={onDelete}
            className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-semibold transition-colors"
          >
            {t('noteEditor.delete')}
          </button>
        </div>

        {/* Titre */}
        <input
          id="note-editor-title"
          ref={titleRef}
          type="text"
          defaultValue={note.title}
          onChange={(e) => scheduleSave({ title: e.target.value })}
          placeholder={t('noteEditor.titlePlaceholder')}
          aria-label={t('noteEditor.titleLabel')}
          className="w-full px-6 pt-5 pb-2 text-xl font-bold bg-transparent text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus:outline-none shrink-0"
        />

        {/* Corps */}
        <div
          ref={bodyRef}
          role="textbox"
          aria-multiline="true"
          aria-label={t('noteEditor.bodyLabel')}
          contentEditable
          suppressContentEditableWarning
          onInput={handleBodyInput}
          onClick={handleBodyClick}
          data-placeholder={t('noteEditor.bodyPlaceholder')}
          className="flex-1 px-6 py-2 pb-6 text-base text-neutral-800 dark:text-neutral-200 leading-relaxed focus:outline-none overflow-auto
            [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5
            empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-300 dark:empty:before:text-neutral-600 empty:before:pointer-events-none"
        />
      </div>
    </div>
  )
}

function ToolbarBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      aria-label={label}
      title={label}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      {children}
    </button>
  )
}
