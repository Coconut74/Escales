import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ColorTheme, Currency, Language, ProfilState, Theme } from './profil.types'

export const useProfilStore = create<ProfilState>()(
  persist(
    (set) => ({
      firstName: '',
      lastName: '',
      avatarEmoji: '🧑',
      currency: 'EUR' as Currency,
      language: 'fr' as Language,
      theme: 'light' as Theme,
      colorTheme: 'orange' as ColorTheme,
      memberSince: new Date().toISOString(),
      setFirstName: (firstName) => set({ firstName }),
      setLastName: (lastName) => set({ lastName }),
      setAvatarEmoji: (avatarEmoji) => set({ avatarEmoji }),
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setColorTheme: (colorTheme) => set({ colorTheme }),
      resetProfil: () => set({
        firstName: '',
        lastName: '',
        avatarEmoji: '🧑',
        currency: 'EUR' as Currency,
        language: 'fr' as Language,
        theme: 'light' as Theme,
        colorTheme: 'orange' as ColorTheme,
        memberSince: new Date().toISOString(),
      }),
    }),
    {
      name: 'escales-profil',
      partialize: (state) => ({
        firstName: state.firstName,
        lastName: state.lastName,
        avatarEmoji: state.avatarEmoji,
        currency: state.currency,
        language: state.language,
        theme: state.theme,
        colorTheme: state.colorTheme,
        memberSince: state.memberSince,
      }),
    }
  )
)
