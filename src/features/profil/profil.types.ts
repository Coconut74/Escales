import type { ColorTheme } from './color-themes'
export type { ColorTheme }
export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF'
export type Language = 'fr' | 'en'
export type Theme = 'light' | 'dark'

export interface ProfilState {
  firstName: string
  lastName: string
  avatarEmoji: string
  currency: Currency
  language: Language
  theme: Theme
  colorTheme: ColorTheme
  memberSince: string
  setFirstName: (v: string) => void
  setLastName: (v: string) => void
  setAvatarEmoji: (v: string) => void
  setCurrency: (v: Currency) => void
  setLanguage: (v: Language) => void
  finnhubKey: string
  setTheme: (v: Theme) => void
  setColorTheme: (v: ColorTheme) => void
  setFinnhubKey: (v: string) => void
  resetProfil: () => void
}
