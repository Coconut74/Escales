import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
  init: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  signIn: async (email, password) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ loading: false, error: error.message })
      return
    }
    set({ user: data.user, session: data.session, loading: false })
  },

  signUp: async (email, password) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      set({ loading: false, error: error.message })
      return
    }
    set({ user: data.user, session: data.session, loading: false })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },

  clearError: () => set({ error: null }),

  init: async () => {
    const { data } = await supabase.auth.getSession()
    set({
      user: data.session?.user ?? null,
      session: data.session,
      loading: false,
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, session })
    })
  },
}))
