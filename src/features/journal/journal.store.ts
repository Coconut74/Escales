import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Note, Project, Milestone } from './journal.types'

interface JournalStore {
  notes: Note[]
  projects: Project[]
  addNote(note: Note): void
  updateNote(id: string, patch: Partial<Note>): void
  removeNote(id: string): void
  addProject(project: Project): void
  updateProject(id: string, patch: Partial<Project>): void
  removeProject(id: string): void
  addMilestone(projectId: string, milestone: Milestone): void
  updateMilestone(projectId: string, milestoneId: string, patch: Partial<Milestone>): void
  removeMilestone(projectId: string, milestoneId: string): void
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

      addMilestone: (projectId, milestone) => set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, milestones: [...p.milestones, milestone].sort((a, b) => a.date.localeCompare(b.date)) }
            : p
        ),
      })),
      updateMilestone: (projectId, milestoneId, patch) => set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, milestones: p.milestones.map((m) => m.id === milestoneId ? { ...m, ...patch } : m) }
            : p
        ),
      })),
      removeMilestone: (projectId, milestoneId) => set((s) => ({
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, milestones: p.milestones.filter((m) => m.id !== milestoneId) }
            : p
        ),
      })),
    }),
    { name: 'escales-journal' }
  )
)
