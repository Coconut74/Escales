import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Converts a plain username to a valid email for Supabase auth
export function normalizeIdentifier(id: string): string {
  const t = id.trim().toLowerCase()
  return t.includes('@') ? t : `${t}@escales.app`
}

export function isEmail(id: string): boolean {
  return id.trim().includes('@')
}

function friendlyError(msg: string): string {
  if (!msg || msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion internet.'
  }
  if (msg.includes('Invalid login credentials')) return 'Identifiant ou mot de passe incorrect.'
  if (msg.includes('Email not confirmed')) return 'Compte non confirmé. Cliquez sur le lien reçu par e-mail.'
  if (msg.includes('User already registered')) return 'Cet identifiant est déjà utilisé.'
  if (msg.includes('Password should be at least')) return 'Le mot de passe doit contenir au moins 8 caractères.'
  if (msg.includes('Unable to validate email address')) return 'Identifiant invalide. Utilisez uniquement des lettres, chiffres et tirets.'
  if (msg.includes('signup is disabled')) return 'La création de compte est temporairement désactivée.'
  if (msg.includes('too many requests') || msg.includes('rate limit')) return 'Trop de tentatives. Réessayez dans quelques secondes.'
  return msg
}

interface AuthStore {
  user: User | null
  session: Session | null
  isGuest: boolean
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<boolean>
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

      signIn: async (identifier, password) => {
        set({ loading: true, error: null, isGuest: false })
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email: normalizeIdentifier(identifier), password })
          if (error) {
            let msg = friendlyError(error.message)
            if (error.message.includes('Email not confirmed') && !isEmail(identifier)) {
              msg = 'Connexion impossible : la confirmation e-mail est activée sur Supabase. Désactivez-la dans Authentication → Settings → Email.'
            }
            set({ loading: false, error: msg })
            return
          }
          set({ user: data.user, session: data.session, loading: false })
        } catch (e) {
          set({ loading: false, error: friendlyError((e as Error).message) })
        }
      },

      signUp: async (identifier, password) => {
        set({ loading: true, error: null, isGuest: false })
        try {
          const { data, error } = await supabase.auth.signUp({ email: normalizeIdentifier(identifier), password })
          if (error) { set({ loading: false, error: friendlyError(error.message) }); return false }
          set({ user: data.user, session: data.session, loading: false })
          return true
        } catch (e) {
          set({ loading: false, error: friendlyError((e as Error).message) })
          return false
        }
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
