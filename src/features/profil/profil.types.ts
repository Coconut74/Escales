import type { ColorTheme } from './color-themes'
export type { ColorTheme }
export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF'
export type Language = 'fr' | 'en'
export type Theme = 'light' | 'dark'

export interface ProfilState {
  firstName: string
  lastName: string
  avatarId: string
  currency: Currency
  language: Language
  theme: Theme
  colorTheme: ColorTheme
  finnhubKey: string
  memberSince: string
  setFirstName: (v: string) => void
  setLastName: (v: string) => void
  setAvatarId: (v: string) => void
  setCurrency: (v: Currency) => void
  setLanguage: (v: Language) => void
  setTheme: (v: Theme) => void
  setColorTheme: (v: ColorTheme) => void
  setFinnhubKey: (v: string) => void
  loadFromCloud: (userId: string) => Promise<void>
  resetData: () => void
  resetProfil: () => void
}
