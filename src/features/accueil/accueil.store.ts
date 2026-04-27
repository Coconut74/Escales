import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Investment } from './accueil.types'

interface AccueilStore {
  investments: Investment[]
  loading: boolean
  loadFromCloud: (userId: string) => Promise<void>
  resetData: () => void
  setInvestments: (investments: Investment[]) => void
  updateInvestment: (id: string, patch: Partial<Investment>) => void
  addInvestment: (inv: Investment) => void
  removeInvestment: (id: string) => void
  resetInvestments: () => void
}

function toRow(inv: Investment, userId: string) {
  return {
    id: inv.id,
    user_id: userId,
    label: inv.label,
    category: inv.category,
    value: inv.value,
    change: inv.change ?? null,
    ticker: inv.ticker ?? null,
    shares: inv.shares ?? null,
  }
}

function fromRow(row: Record<string, unknown>): Investment {
  return {
    id: row.id as string,
    label: row.label as string,
    category: row.category as Investment['category'],
    value: row.value as number,
    change: row.change != null ? (row.change as number) : undefined,
    ticker: row.ticker != null ? (row.ticker as string) : undefined,
    shares: row.shares != null ? (row.shares as number) : undefined,
  }
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id ?? null
}

export const useAccueilStore = create<AccueilStore>()(
  persist(
    (set, get) => ({
      investments: [],
      loading: false,

      loadFromCloud: async (userId) => {
        set({ loading: true })
        const { data, error } = await supabase
          .from('investments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
        if (!error && data) {
          set({ investments: data.map(fromRow) })
        }
        set({ loading: false })
      },

      resetData: () => set({ investments: [], loading: false }),

      setInvestments: async (investments) => {
        set({ investments })
        const userId = await currentUserId()
        if (!userId) return
        await supabase.from('investments').delete().eq('user_id', userId)
        if (investments.length > 0) {
          await supabase.from('investments').insert(investments.map((inv) => toRow(inv, userId)))
        }
      },

      addInvestment: async (inv) => {
        set((s) => ({ investments: [...s.investments, inv] }))
        const userId = await currentUserId()
        if (!userId) return
        await supabase.from('investments').insert(toRow(inv, userId))
      },

      updateInvestment: async (id, patch) => {
        const userId = await currentUserId()
        set((s) => ({
          investments: s.investments.map((inv) =>
            inv.id === id ? { ...inv, ...patch } : inv
          ),
        }))
        if (!userId) return
        const updated = get().investments.find((i) => i.id === id)
        if (updated) {
          await supabase.from('investments').update(toRow(updated, userId)).eq('id', id)
        }
      },

      removeInvestment: async (id) => {
        set((s) => ({ investments: s.investments.filter((i) => i.id !== id) }))
        const userId = await currentUserId()
        if (!userId) return
        await supabase.from('investments').delete().eq('id', id)
      },

      resetInvestments: async () => {
        const userId = await currentUserId()
        set({ investments: [] })
        if (userId) await supabase.from('investments').delete().eq('user_id', userId)
      },
    }),
    {
      name: 'escales-investments',
      partialize: (state) => ({ investments: state.investments }),
    }
  )
)

export function selectTotal(investments: Investment[]): number {
  return investments.reduce((sum, inv) => sum + inv.value, 0)
}

export function selectAverageChange(investments: Investment[]): number | null {
  const withChange = investments.filter((inv) => inv.change !== undefined)
  if (withChange.length === 0) return null
  return withChange.reduce((sum, inv) => sum + inv.change!, 0) / withChange.length
}
