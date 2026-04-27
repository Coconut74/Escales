import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Note, Project, ChecklistItem } from './journal.types'

interface JournalStore {
  notes: Note[]
  projects: Project[]
  loading: boolean
  loadFromCloud: (userId: string) => Promise<void>
  resetData: () => void
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

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}

function noteToRow(note: Note, userId: string) {
  return {
    id: note.id,
    user_id: userId,
    title: note.title,
    content: note.content,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  }
}

function noteFromRow(row: Record<string, unknown>): Note {
  return {
    id: row.id as string,
    title: row.title as string,
    content: row.content as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function projectToRow(project: Project, userId: string) {
  return {
    id: project.id,
    user_id: userId,
    type: project.type,
    name: project.name,
    description: project.description ?? null,
    target_amount: project.targetAmount ?? null,
    current_amount: project.currentAmount ?? null,
    city: project.city ?? null,
    property_type: project.propertyType ?? null,
    asset_name: project.assetName ?? null,
    loan_amount: project.loanAmount ?? null,
    loan_duration_months: project.loanDurationMonths ?? null,
    loan_start_date: project.loanStartDate ?? null,
    checklist: JSON.stringify(project.checklist),
    created_at: project.createdAt,
  }
}

function projectFromRow(row: Record<string, unknown>): Project {
  let checklist: ChecklistItem[] = []
  try {
    const raw = row.checklist
    checklist = typeof raw === 'string' ? JSON.parse(raw) : (raw as ChecklistItem[]) ?? []
  } catch { checklist = [] }
  return {
    id: row.id as string,
    type: row.type as Project['type'],
    name: row.name as string,
    description: row.description != null ? (row.description as string) : undefined,
    targetAmount: row.target_amount != null ? (row.target_amount as number) : undefined,
    currentAmount: row.current_amount != null ? (row.current_amount as number) : undefined,
    city: row.city != null ? (row.city as string) : undefined,
    propertyType: row.property_type != null ? (row.property_type as string) : undefined,
    assetName: row.asset_name != null ? (row.asset_name as string) : undefined,
    loanAmount: row.loan_amount != null ? (row.loan_amount as number) : undefined,
    loanDurationMonths: row.loan_duration_months != null ? (row.loan_duration_months as number) : undefined,
    loanStartDate: row.loan_start_date != null ? (row.loan_start_date as string) : undefined,
    checklist,
    createdAt: row.created_at as string,
  }
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  notes: [],
  projects: [],
  loading: false,

  loadFromCloud: async (userId) => {
    set({ loading: true })
    const [notesRes, projectsRes] = await Promise.all([
      supabase.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ])
    set({
      notes: notesRes.data ? notesRes.data.map(noteFromRow) : [],
      projects: projectsRes.data ? projectsRes.data.map(projectFromRow) : [],
      loading: false,
    })
  },

  resetData: () => set({ notes: [], projects: [], loading: false }),

  addNote: async (note) => {
    const userId = await currentUserId()
    if (!userId) return
    set((s) => ({ notes: [note, ...s.notes] }))
    await supabase.from('notes').insert(noteToRow(note, userId))
  },

  updateNote: async (id, patch) => {
    const userId = await currentUserId()
    set((s) => ({
      notes: s.notes.map((n) => n.id === id ? { ...n, ...patch } : n),
    }))
    if (!userId) return
    const updated = get().notes.find((n) => n.id === id)
    if (updated) await supabase.from('notes').update(noteToRow(updated, userId)).eq('id', id)
  },

  removeNote: async (id) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
    await supabase.from('notes').delete().eq('id', id)
  },

  addProject: async (project) => {
    const userId = await currentUserId()
    if (!userId) return
    set((s) => ({ projects: [project, ...s.projects] }))
    await supabase.from('projects').insert(projectToRow(project, userId))
  },

  updateProject: async (id, patch) => {
    const userId = await currentUserId()
    set((s) => ({
      projects: s.projects.map((p) => p.id === id ? { ...p, ...patch } : p),
    }))
    if (!userId) return
    const updated = get().projects.find((p) => p.id === id)
    if (updated) await supabase.from('projects').update(projectToRow(updated, userId)).eq('id', id)
  },

  removeProject: async (id) => {
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }))
    await supabase.from('projects').delete().eq('id', id)
  },

  toggleChecklistItem: async (projectId, itemId) => {
    const userId = await currentUserId()
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? { ...p, checklist: p.checklist.map((i) => i.id === itemId ? { ...i, done: !i.done } : i) }
          : p
      ),
    }))
    if (!userId) return
    const updated = get().projects.find((p) => p.id === projectId)
    if (updated) await supabase.from('projects').update({ checklist: JSON.stringify(updated.checklist) }).eq('id', projectId)
  },

  addChecklistItem: async (projectId, item) => {
    const userId = await currentUserId()
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId ? { ...p, checklist: [...p.checklist, item] } : p
      ),
    }))
    if (!userId) return
    const updated = get().projects.find((p) => p.id === projectId)
    if (updated) await supabase.from('projects').update({ checklist: JSON.stringify(updated.checklist) }).eq('id', projectId)
  },

  removeChecklistItem: async (projectId, itemId) => {
    const userId = await currentUserId()
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId ? { ...p, checklist: p.checklist.filter((i) => i.id !== itemId) } : p
      ),
    }))
    if (!userId) return
    const updated = get().projects.find((p) => p.id === projectId)
    if (updated) await supabase.from('projects').update({ checklist: JSON.stringify(updated.checklist) }).eq('id', projectId)
  },
}))
