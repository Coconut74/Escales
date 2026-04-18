import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project } from './coffre.types'

// Les projets sont stockés en clair dans localStorage (MVP) — ajouter chiffrement Web Crypto en v2
interface CoffreStore {
  projects: Project[]
  addProject: (project: Project) => void
  removeProject: (id: string) => void
}

export const useCoffreStore = create<CoffreStore>()(
  persist(
    (set) => ({
      projects: [],
      addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
      removeProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
    }),
    { name: 'escales-coffre' }
  )
)
