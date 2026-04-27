import type { ColorTheme } from './color-themes'
export type { ColorTheme }
export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF'
export type Language = 'fr' | 'en'
export type Theme = 'light' | 'dark'

export interface ProfilState {
  pseudonyme: string
  avatarId: string
  currency: Currency
  language: Language
  theme: Theme
  colorTheme: ColorTheme
  memberSince: string
  setPseudonyme: (v: string) => Promise<void>
  setAvatarId: (v: string) => Promise<void>
  setCurrency: (v: Currency) => Promise<void>
  setLanguage: (v: Language) => Promise<void>
  setTheme: (v: Theme) => void
  setColorTheme: (v: ColorTheme) => void
  loadFromCloud: (userId: string) => Promise<void>
  resetData: () => void
}
