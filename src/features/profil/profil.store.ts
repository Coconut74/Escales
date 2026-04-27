import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ColorTheme, Currency, Language, ProfilState, Theme } from './profil.types'

export const useProfilStore = create<ProfilState>()(
  persist(
    (set) => ({
      firstName: '',
      lastName: '',
      avatarId: 'avatar-1',
      currency: 'EUR' as Currency,
      language: 'fr' as Language,
      theme: 'light' as Theme,
      colorTheme: 'orange' as ColorTheme,
      finnhubKey: 'd7iv50hr01qn2qavhu30d7iv50hr01qn2qavhu3g',
      memberSince: new Date().toISOString(),
      setFirstName: (firstName) => set({ firstName }),
      setLastName: (lastName) => set({ lastName }),
      setAvatarId: (avatarId) => set({ avatarId }),
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setColorTheme: (colorTheme) => set({ colorTheme }),
      setFinnhubKey: (finnhubKey) => set({ finnhubKey }),
      resetProfil: () => set({
        firstName: '',
        lastName: '',
        avatarId: 'avatar-1',
        currency: 'EUR' as Currency,
        language: 'fr' as Language,
        theme: 'light' as Theme,
        colorTheme: 'orange' as ColorTheme,
        finnhubKey: 'd7iv50hr01qn2qavhu30d7iv50hr01qn2qavhu3g',
        memberSince: new Date().toISOString(),
      }),
    }),
    {
      name: 'escales-profil',
      version: 2,
      migrate: (persisted: unknown) => {
        const s = { ...(persisted as Record<string, unknown>) }
        if (!s.finnhubKey) s.finnhubKey = 'd7iv50hr01qn2qavhu30d7iv50hr01qn2qavhu3g'
        if (!s.avatarId) s.avatarId = 'avatar-1'
        if (!s.memberSince) s.memberSince = new Date().toISOString()
        return s
      },
      partialize: (state) => ({
        firstName: state.firstName,
        lastName: state.lastName,
        avatarId: state.avatarId,
        currency: state.currency,
        language: state.language,
        theme: state.theme,
        colorTheme: state.colorTheme,
        finnhubKey: state.finnhubKey,
        memberSince: state.memberSince,
      }),
    }
  )
)
