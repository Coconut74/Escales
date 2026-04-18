import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PortfolioItem } from './map.types'

interface MapStore {
  items: PortfolioItem[]
  addItem: (item: PortfolioItem) => void
  removeItem: (id: string) => void
}

export const useMapStore = create<MapStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    { name: 'escales-map' }
  )
)
