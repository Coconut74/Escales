import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Investment, InvestmentSnapshot } from './accueil.types'

interface AccueilStore {
  investments: Investment[]
  snapshots: InvestmentSnapshot[]
  loading: boolean
  loadFromCloud: (userId: string) => Promise<void>
  resetData: () => void
  setInvestments: (investments: Investment[]) => void
  updateInvestment: (id: string, patch: Partial<Investment>) => void
  addInvestment: (inv: Investment) => void
  removeInvestment: (id: string) => void
  resetInvestments: () => void
  addSnapshot: (snapshot: InvestmentSnapshot) => Promise<void>
  removeSnapshot: (id: string) => Promise<void>
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

function snapshotFromRow(row: Record<string, unknown>): InvestmentSnapshot {
  return {
    id: row.id as string,
    investmentId: row.investment_id as string,
    value: Number(row.value),
    date: (row.date as string).slice(0, 10),
    note: row.note != null ? (row.note as string) : undefined,
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
      snapshots: [],
      loading: false,

      loadFromCloud: async (userId) => {
        set({ loading: true })
        const [invResult, snapResult] = await Promise.all([
          supabase.from('investments').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
          supabase.from('investment_snapshots').select('*').eq('user_id', userId).order('date', { ascending: true }),
        ])
        if (!invResult.error && invResult.data) {
          set({ investments: invResult.data.map(fromRow) })
        }
        if (!snapResult.error && snapResult.data) {
          set({ snapshots: snapResult.data.map(snapshotFromRow) })
        }
        set({ loading: false })
      },

      resetData: () => set({ investments: [], snapshots: [], loading: false }),

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
        set((s) => ({
          investments: s.investments.filter((i) => i.id !== id),
          snapshots: s.snapshots.filter((s) => s.investmentId !== id),
        }))
        const userId = await currentUserId()
        if (!userId) return
        await Promise.all([
          supabase.from('investments').delete().eq('id', id),
          supabase.from('investment_snapshots').delete().eq('investment_id', id).eq('user_id', userId),
        ])
      },

      resetInvestments: async () => {
        const userId = await currentUserId()
        set({ investments: [], snapshots: [] })
        if (userId) {
          await Promise.all([
            supabase.from('investments').delete().eq('user_id', userId),
            supabase.from('investment_snapshots').delete().eq('user_id', userId),
          ])
        }
      },

      addSnapshot: async (snapshot) => {
        set((s) => ({ snapshots: [...s.snapshots, snapshot] }))
        const userId = await currentUserId()
        if (!userId) return
        await supabase.from('investment_snapshots').insert({
          id: snapshot.id,
          user_id: userId,
          investment_id: snapshot.investmentId,
          value: snapshot.value,
          date: snapshot.date,
          note: snapshot.note ?? null,
        })
      },

      removeSnapshot: async (id) => {
        set((s) => ({ snapshots: s.snapshots.filter((s) => s.id !== id) }))
        const userId = await currentUserId()
        if (!userId) return
        await supabase.from('investment_snapshots').delete().eq('id', id)
      },
    }),
    {
      name: 'escales-investments',
      partialize: (state) => ({ investments: state.investments, snapshots: state.snapshots }),
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

// currentValue permet de passer la valeur live (Finnhub) comme "dernière valeur"
export function selectEffectiveChange(
  inv: Investment,
  snapshots: InvestmentSnapshot[],
  currentValue?: number
): number | null {
  const invSnaps = snapshots
    .filter((s) => s.investmentId === inv.id)
    .sort((a, b) => a.date.localeCompare(b.date))
  if (invSnaps.length === 0) return null
  const firstSnap = invSnaps[0]!
  if (firstSnap.value === 0) return null
  // Avec currentValue (live) : 1 snapshot suffit ; sans : il en faut 2
  const last = currentValue ?? (invSnaps.length >= 2 ? invSnaps[invSnaps.length - 1]!.value : null)
  if (last === null) return null
  return ((last - firstSnap.value) / firstSnap.value) * 100
}
