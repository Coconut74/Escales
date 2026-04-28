import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { ColorTheme, Currency, Language, ProfilState, Theme } from './profil.types'

export const useProfilStore = create<ProfilState>()(
  persist(
    (set, get) => ({
      pseudonyme: '',
      avatarId: 'avatar-1',
      currency: 'EUR' as Currency,
      language: 'fr' as Language,
      theme: 'system' as Theme,
      colorTheme: 'orange' as ColorTheme,
      memberSince: new Date().toISOString(),

      setPseudonyme: async (pseudonyme) => {
        set({ pseudonyme })
        await syncProfile({ first_name: pseudonyme })
      },
      setAvatarId: async (avatarId) => {
        set({ avatarId })
        await syncProfile({ avatar_emoji: avatarId })
      },
      setCurrency: async (currency) => {
        set({ currency })
        await syncProfile({ currency })
      },
      setLanguage: async (language) => {
        set({ language })
        await syncProfile({ language })
      },
      setTheme: (theme) => set({ theme }),
      setColorTheme: (colorTheme) => set({ colorTheme }),

      loadFromCloud: async (userId) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
        if (data) {
          set({
            pseudonyme: data.first_name ?? '',
            avatarId: data.avatar_emoji ?? 'avatar-1',
            currency: (data.currency ?? 'EUR') as Currency,
            language: (data.language ?? 'fr') as Language,
            memberSince: data.member_since ?? new Date().toISOString(),
          })
        } else {
          await supabase.from('profiles').insert({
            id: userId,
            first_name: get().pseudonyme,
            avatar_emoji: get().avatarId,
            currency: get().currency,
            language: get().language,
            member_since: get().memberSince,
          })
        }
      },

      resetData: () => set({
        pseudonyme: '',
        avatarId: 'avatar-1',
        currency: 'EUR' as Currency,
        language: 'fr' as Language,
        memberSince: new Date().toISOString(),
      }),
    }),
    {
      name: 'escales-profil-ui',
      partialize: (state) => ({
        theme: state.theme,
        colorTheme: state.colorTheme,
        pseudonyme: state.pseudonyme,
        avatarId: state.avatarId,
        currency: state.currency,
        language: state.language,
        memberSince: state.memberSince,
      }),
    }
  )
)

async function syncProfile(patch: Record<string, unknown>) {
  const { data } = await supabase.auth.getSession()
  const userId = data.session?.user.id
  if (!userId) return
  await supabase.from('profiles').update(patch).eq('id', userId)
}
