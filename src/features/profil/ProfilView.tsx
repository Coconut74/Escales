import { useState } from 'react'
import { useProfilStore } from './profil.store'
import { useAccueilStore } from '@/features/accueil/accueil.store'
import { formatDate } from '@/lib/formatting'
import Icon from '@/components/ui/Icon'
import type { Currency, Language, Theme } from './profil.types'
import { COLOR_THEMES } from './color-themes'

const AVATAR_OPTIONS = ['🧑', '👩', '👨', '🧑‍💼', '👩‍💼', '👨‍💼', '🦊', '🐻', '🐼', '🦁', '🐯', '🦝']

const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'USD', label: 'Dollar US', symbol: '$' },
  { value: 'GBP', label: 'Livre sterling', symbol: '£' },
  { value: 'CHF', label: 'Franc suisse', symbol: 'CHF' },
]

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
]

export default function ProfilView() {
  const {
    firstName, lastName, avatarEmoji, currency, language, theme, colorTheme, finnhubKey, memberSince,
    setFirstName, setLastName, setAvatarEmoji, setCurrency, setLanguage, setTheme, setColorTheme, setFinnhubKey,
    resetProfil,
  } = useProfilStore()

  const investments = useAccueilStore((s) => s.investments)
  const resetInvestments = useAccueilStore((s) => s.resetInvestments)

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Mon profil'

  function handleReset() {
    resetInvestments()
    resetProfil()
    setShowResetConfirm(false)
  }

  return (
    <div className="min-h-full pb-32 lg:pb-8">
      <div className="max-w-4xl mx-auto px-4 pt-8">

        {/* Grid desktop 2 colonnes */}
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">

          {/* Header profil — pleine largeur */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-2xl p-6 flex items-center gap-5 border border-neutral-200 dark:border-neutral-700">
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-4xl select-none">
              {avatarEmoji}
            </div>
            <div>
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">{displayName}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Membre depuis {formatDate(memberSince)}
              </p>
            </div>
          </div>

          {/* Colonne gauche */}
          <Section title="Mes informations">
            <Field label="Prénom">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
              />
            </Field>
            <Field label="Nom">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
              />
            </Field>
            <Field label="Avatar">
              <div className="flex flex-wrap gap-2 mt-1">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setAvatarEmoji(emoji)}
                    className={`w-10 h-10 rounded-xl text-xl transition-all
                      ${avatarEmoji === emoji
                        ? 'bg-primary-100 dark:bg-primary-900/50 ring-2 ring-primary-500'
                        : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-primary-50 dark:hover:bg-neutral-600'
                      }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          {/* Colonne droite — sections empilées */}
          <div className="space-y-6">
            <Section title="Apparence">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Mode d'affichage</span>
                <div className="flex gap-2">
                  <ThemeButton active={theme === 'light'} onClick={() => setTheme('light')} icon="sun" label="Clair" />
                  <ThemeButton active={theme === 'dark'} onClick={() => setTheme('dark')} icon="moon" label="Sombre" />
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Couleur d'accentuation</span>
                <div className="flex gap-3">
                  {COLOR_THEMES.map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => setColorTheme(ct.id)}
                      title={ct.label}
                      className="relative w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none"
                      style={{ backgroundColor: ct.swatch }}
                    >
                      {colorTheme === ct.id && (
                        <span
                          className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-800"
                          style={{ '--tw-ring-color': ct.swatch } as React.CSSProperties}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            <Section title="Préférences">
              <Field label="Devise">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.symbol} — {c.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Langue">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </Field>
              <Field
                label={
                  <span className="flex items-center gap-1.5">
                    Clé API Finnhub
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                      title={showKey ? 'Masquer la clé' : 'Afficher la clé'}
                    >
                      <Icon name={showKey ? 'eye-off' : 'eye'} size={16} />
                    </button>
                  </span>
                }
              >
                <div className="flex gap-2">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={finnhubKey}
                    onChange={(e) => setFinnhubKey(e.target.value)}
                    placeholder="Clé Finnhub"
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
                  />
                  <a
                    href="https://finnhub.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors whitespace-nowrap"
                  >
                    <Icon name="external-link" size={14} />
                    Obtenir une clé
                  </a>
                </div>
                {finnhubKey && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Prix live activés</p>
                )}
              </Field>
            </Section>

            <Section title="Mes statistiques">
              <StatRow label="Membre depuis" value={formatDate(memberSince)} />
              <StatRow label="Investissements suivis" value={String(investments.length)} />
            </Section>
          </div>

          {/* Zone danger — pleine largeur */}
          <div className="lg:col-span-2 bg-red-50 dark:bg-red-950/30 rounded-2xl p-5 border border-red-200 dark:border-red-900">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Zone de danger</p>
            <p className="text-xs text-red-500 dark:text-red-500 mb-4">
              Ces actions sont irréversibles. Les données démo seront restaurées.
            </p>

            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              >
                <Icon name="reset" size={16} />
                Réinitialiser mes données
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  Confirmer la réinitialisation ?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    Oui, réinitialiser
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700 space-y-4">
      <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{label}</label>
      {children}
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{value}</span>
    </div>
  )
}

function ThemeButton({
  active, onClick, icon, label
}: {
  active: boolean; onClick: () => void; icon: 'sun' | 'moon'; label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all
        ${active
          ? 'bg-primary-600 text-white shadow-sm'
          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600'
        }`}
    >
      <Icon name={icon} size={16} />
      {label}
    </button>
  )
}
