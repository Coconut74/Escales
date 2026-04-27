import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { ColorTheme, Currency, Language, ProfilState, Theme } from './profil.types'

type LocalPrefs = Pick<ProfilState, 'theme' | 'colorTheme'>

export const useProfilStore = create<ProfilState>()(
  persist(
    (set, get) => ({
      firstName: '',
      lastName: '',
      avatarEmoji: '🧑',
      currency: 'EUR' as Currency,
      language: 'fr' as Language,
      theme: 'light' as Theme,
      colorTheme: 'orange' as ColorTheme,
      finnhubKey: '',
      memberSince: new Date().toISOString(),

      setFirstName: async (firstName) => {
        set({ firstName })
        await syncProfile({ first_name: firstName })
      },
      setLastName: async (lastName) => {
        set({ lastName })
        await syncProfile({ last_name: lastName })
      },
      setAvatarEmoji: async (avatarEmoji) => {
        set({ avatarEmoji })
        await syncProfile({ avatar_emoji: avatarEmoji })
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
      setFinnhubKey: async (finnhubKey) => {
        set({ finnhubKey })
        await syncProfile({ finnhub_key: finnhubKey })
      },

      loadFromCloud: async (userId) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
        if (data) {
          set({
            firstName: data.first_name ?? '',
            lastName: data.last_name ?? '',
            avatarEmoji: data.avatar_emoji ?? '🧑',
            currency: (data.currency ?? 'EUR') as Currency,
            language: (data.language ?? 'fr') as Language,
            finnhubKey: data.finnhub_key ?? '',
            memberSince: data.member_since ?? new Date().toISOString(),
          })
        } else {
          await supabase.from('profiles').insert({
            id: userId,
            first_name: get().firstName,
            last_name: get().lastName,
            avatar_emoji: get().avatarEmoji,
            currency: get().currency,
            language: get().language,
            theme: get().theme,
            color_theme: get().colorTheme,
            finnhub_key: get().finnhubKey,
            member_since: get().memberSince,
          })
        }
      },

      resetData: () => set({
        firstName: '',
        lastName: '',
        avatarEmoji: '🧑',
        currency: 'EUR' as Currency,
        language: 'fr' as Language,
        finnhubKey: '',
        memberSince: new Date().toISOString(),
      }),

      resetProfil: async () => {
        const { data: sessionData } = await supabase.auth.getSession()
        const userId = sessionData.session?.user.id
        const resetValues = {
          firstName: '',
          lastName: '',
          avatarEmoji: '🧑',
          currency: 'EUR' as Currency,
          language: 'fr' as Language,
          theme: 'light' as Theme,
          colorTheme: 'orange' as ColorTheme,
          finnhubKey: '',
          memberSince: new Date().toISOString(),
        }
        set(resetValues)
        if (userId) {
          await supabase.from('profiles').update({
            first_name: '',
            last_name: '',
            avatar_emoji: '🧑',
            currency: 'EUR',
            language: 'fr',
            finnhub_key: '',
          }).eq('id', userId)
        }
      },
    }),
    {
      name: 'escales-profil-ui',
      partialize: (state): LocalPrefs => ({
        theme: state.theme,
        colorTheme: state.colorTheme,
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
