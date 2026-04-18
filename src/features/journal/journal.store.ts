import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { JournalEntry } from './journal.types'

interface JournalStore {
  entries: JournalEntry[]
  addEntry: (entry: JournalEntry) => void
  removeEntry: (id: string) => void
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) => set((s) => ({ entries: [...s.entries, entry] })),
      removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    { name: 'escales-journal' }
  )
)
