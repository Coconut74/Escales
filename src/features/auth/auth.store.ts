import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  session: Session | null
  isGuest: boolean
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInAsGuest: () => void
  clearError: () => void
  init: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isGuest: false,
      loading: true,
      error: null,

      signIn: async (email, password) => {
        set({ loading: true, error: null, isGuest: false })
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          set({ loading: false, error: error.message })
          return
        }
        set({ user: data.user, session: data.session, loading: false })
      },

      signUp: async (email, password) => {
        set({ loading: true, error: null, isGuest: false })
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) {
          set({ loading: false, error: error.message })
          return
        }
        set({ user: data.user, session: data.session, loading: false })
      },

      signOut: async () => {
        if (!get().isGuest) {
          await supabase.auth.signOut()
        }
        set({ user: null, session: null, isGuest: false })
      },

      signInAsGuest: () => {
        set({ isGuest: true, loading: false, error: null })
      },

      clearError: () => set({ error: null }),

      init: async () => {
        const { data } = await supabase.auth.getSession()
        set((s) => ({
          user: data.session?.user ?? null,
          session: data.session,
          loading: false,
          isGuest: data.session ? false : s.isGuest,
        }))
        supabase.auth.onAuthStateChange((_event, session) => {
          set({ user: session?.user ?? null, session, ...(session ? { isGuest: false } : {}) })
        })
      },
    }),
    {
      name: 'escales-auth',
      partialize: (state) => ({ isGuest: state.isGuest }),
    }
  )
)
