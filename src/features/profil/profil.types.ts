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
  memberSince: string
  setFirstName: (v: string) => void
  setLastName: (v: string) => void
  setAvatarEmoji: (v: string) => void
  setCurrency: (v: Currency) => void
  setLanguage: (v: Language) => void
  setTheme: (v: Theme) => void
}
