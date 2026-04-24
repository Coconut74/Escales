import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Note, Project, ChecklistItem } from './journal.types'

interface JournalStore {
  notes: Note[]
  projects: Project[]
  addNote(note: Note): void
  updateNote(id: string, patch: Partial<Note>): void
  removeNote(id: string): void
  addProject(project: Project): void
  updateProject(id: string, patch: Partial<Project>): void
  removeProject(id: string): void
  toggleChecklistItem(projectId: string, itemId: string): void
  addChecklistItem(projectId: string, item: ChecklistItem): void
  removeChecklistItem(projectId: string, itemId: string): void
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set) => ({
      notes: [],
      projects: [],

      addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
      updateNote: (id, patch) => set((s) => ({
        notes: s.notes.map((n) => n.id === id ? { ...n, ...patch } : n),
      })),
      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      addProject: (project) => set((s) => ({ projects: [project, ...s.projects] })),
      updateProject: (id, patch) => set((s) => ({
        projects: s.projects.map((p) => p.id === id ? { ...p, ...patch } : p),
      })),
      removeProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      toggleChecklistItem: (projectId, itemId) => set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, checklist: p.checklist.map((i) => i.id === itemId ? { ...i, done: !i.done } : i) }
            : p
        ),
      })),
      addChecklistItem: (projectId, item) => set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId ? { ...p, checklist: [...p.checklist, item] } : p
        ),
      })),
      removeChecklistItem: (projectId, itemId) => set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId ? { ...p, checklist: p.checklist.filter((i) => i.id !== itemId) } : p
        ),
      })),
    }),
    {
      name: 'escales-journal',
      version: 2,
      migrate: (state: unknown) => {
        const s = state as { notes?: unknown[]; projects?: unknown[] }
        return {
          notes: s.notes ?? [],
          // Drop projects that don't have the new type field (old format)
          projects: (s.projects ?? []).filter(
            (p) => typeof (p as { type?: string }).type === 'string'
          ),
        }
      },
    }
  )
)
