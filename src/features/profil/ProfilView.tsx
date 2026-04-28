import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase'
import { useProfilStore } from './profil.store'
import { useAuthStore, normalizeIdentifier } from '@/features/auth/auth.store'
import Icon from '@/components/ui/Icon'
import type { Currency, Language, Theme } from './profil.types'
import { COLOR_THEMES } from './color-themes'
import { useT, type TKey } from '@/lib/i18n'

const AVATAR_OPTIONS = [
  'avatar-1',  'avatar-2',  'avatar-3',  'avatar-4',  'avatar-5',
  'avatar-6',  'avatar-7',  'avatar-8',  'avatar-9',  'avatar-10',
  'avatar-11', 'avatar-12', 'avatar-13', 'avatar-14', 'avatar-15',
]

const CURRENCY_SYMBOLS: Record<Currency, string> = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF' }
const CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP', 'CHF']
const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
]

type ModalType = 'account' | 'preferences' | 'security' | null

export default function ProfilView() {
  const t = useT()
  const { pseudonyme, avatarId } = useProfilStore()
  const { signOut, user } = useAuthStore()
  const [openModal, setOpenModal] = useState<ModalType>(null)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  const displayIdentifier = user?.email
    ? (user.email.endsWith('@escales.app') ? user.email.split('@')[0] : user.email)
    : null
  const displayName = pseudonyme || displayIdentifier || t('nav.profile')

  const MENU_ITEMS: { id: ModalType; icon: 'profile' | 'preferences' | 'coffre'; labelKey: TKey }[] = [
    { id: 'account',     icon: 'profile',     labelKey: 'profil.accountInfo'   },
    { id: 'preferences', icon: 'preferences', labelKey: 'profil.preferences'   },
    { id: 'security',    icon: 'coffre',      labelKey: 'profil.securityTitle' },
  ]

  return (
    <div className="min-h-full pb-32 lg:pb-8">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-3">

        {/* Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 flex items-center gap-4 border border-neutral-200 dark:border-neutral-700">
          <img src={`/avatars/${avatarId}.png`} alt="avatar" className="w-16 h-16 rounded-2xl object-cover shrink-0" />
          <div className="min-w-0">
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 truncate">{displayName}</p>
            {displayIdentifier && (
              <p className="text-sm text-neutral-400 dark:text-neutral-500 truncate">{displayIdentifier}</p>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setOpenModal(item.id)}
              className="w-full flex items-center gap-4 px-5 py-4 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors"
            >
              <Icon name={item.icon} size={20} className="text-neutral-500 dark:text-neutral-400 shrink-0" />
              <span className="flex-1 text-left text-sm font-medium text-neutral-800 dark:text-neutral-100">{t(item.labelKey)}</span>
              <Icon name="arrow" size={16} className="text-neutral-400 shrink-0" />
            </button>
          ))}
        </div>

        {/* Déconnexion */}
        <button
          onClick={() => setShowSignOutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
        >
          <Icon name="logout" size={16} />
          {t('profil.signOut')}
        </button>

      </div>

      {openModal === 'account'     && <AccountModal     onClose={() => setOpenModal(null)} />}
      {openModal === 'preferences' && <PreferencesModal onClose={() => setOpenModal(null)} />}
      {openModal === 'security'    && <SecurityModal    onClose={() => setOpenModal(null)} user={user} signOut={signOut} />}

      {showSignOutConfirm && (
        <ConfirmDialog
          title={t('profil.signOutConfirmTitle')}
          message={t('profil.signOutConfirmMsg')}
          confirmLabel={t('profil.signOutConfirmAction')}
          onCancel={() => setShowSignOutConfirm(false)}
          onConfirm={signOut}
          dangerous
        />
      )}
    </div>
  )
}

/* ─── Modal wrapper ──────────────────────────────────────── */

function SettingsModal({ title, children, onClose, onConfirm, saving }: {
  title: string
  children: React.ReactNode
  onClose: () => void
  onConfirm?: () => Promise<void>
  saving?: boolean
}) {
  const t = useT()
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-700">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{title}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">{children}</div>
        <div className="flex gap-3 px-5 py-4 border-t border-neutral-100 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            {onConfirm ? t('profil.abandon') : t('profil.close')}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {saving ? t('profil.saving') : t('profil.confirm')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Confirm dialog ─────────────────────────────────────── */

function ConfirmDialog({
  title, message, confirmLabel, onCancel, onConfirm, loading, dangerous,
}: {
  title: string
  message: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
  loading?: boolean
  dangerous?: boolean
}) {
  const t = useT()
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            {t('profil.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-colors ${
              dangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {loading ? '…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ─── Account modal ──────────────────────────────────────── */

function AccountModal({ onClose }: { onClose: () => void }) {
  const t = useT()
  const { pseudonyme, avatarId, setPseudonyme, setAvatarId } = useProfilStore()
  const [localPseudonyme, setLocalPseudonyme] = useState(pseudonyme)
  const [localAvatarId, setLocalAvatarId] = useState(avatarId)
  const [saving, setSaving] = useState(false)

  async function handleConfirm() {
    setSaving(true)
    await setPseudonyme(localPseudonyme.trim())
    await setAvatarId(localAvatarId)
    setSaving(false)
    onClose()
  }

  return (
    <SettingsModal title={t('profil.accountInfo')} onClose={onClose} onConfirm={handleConfirm} saving={saving}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{t('profil.pseudonyme')}</label>
        <input
          type="text"
          value={localPseudonyme}
          onChange={(e) => setLocalPseudonyme(e.target.value)}
          placeholder={t('profil.pseudonymePlaceholder')}
          className={inputCls}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{t('profil.avatar')}</label>
        <div className="grid grid-cols-5 gap-2">
          {AVATAR_OPTIONS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setLocalAvatarId(id)}
              className={`aspect-square rounded-xl overflow-hidden transition-all ${
                localAvatarId === id
                  ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-800'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img src={`/avatars/${id}.png`} alt={id} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </SettingsModal>
  )
}

/* ─── Preferences modal ──────────────────────────────────── */

function PreferencesModal({ onClose }: { onClose: () => void }) {
  const t = useT()
  const { currency, language, theme, colorTheme, setCurrency, setLanguage, setTheme, setColorTheme } = useProfilStore()
  const [localCurrency, setLocalCurrency] = useState<Currency>(currency)
  const [localLanguage, setLocalLanguage] = useState<Language>(language)
  const [localTheme, setLocalTheme] = useState<Theme>(theme)
  const [localColorTheme, setLocalColorTheme] = useState(colorTheme)
  const [saving, setSaving] = useState(false)

  async function handleConfirm() {
    setSaving(true)
    await setCurrency(localCurrency)
    await setLanguage(localLanguage)
    setTheme(localTheme)
    setColorTheme(localColorTheme)
    setSaving(false)
    onClose()
  }

  return (
    <SettingsModal title={t('profil.preferences')} onClose={onClose} onConfirm={handleConfirm} saving={saving}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{t('profil.currency')}</label>
        <div className="relative">
          <select
            value={localCurrency}
            onChange={(e) => setLocalCurrency(e.target.value as Currency)}
            className={`${inputCls} appearance-none pr-10`}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{CURRENCY_SYMBOLS[c]} — {t(`currency.${c}` as TKey)}</option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <Icon name="arrow" size={16} />
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{t('profil.language')}</label>
        <div className="relative">
          <select
            value={localLanguage}
            onChange={(e) => setLocalLanguage(e.target.value as Language)}
            className={`${inputCls} appearance-none pr-10`}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <Icon name="arrow" size={16} />
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{t('profil.displayMode')}</label>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as Theme[]).map((th) => (
            <button
              key={th}
              type="button"
              onClick={() => setLocalTheme(th)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                localTheme === th
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600'
              }`}
            >
              <Icon name={th === 'light' ? 'sun' : th === 'dark' ? 'moon' : 'monitor'} size={15} />
              {t(th === 'light' ? 'profil.light' : th === 'dark' ? 'profil.dark' : 'profil.system')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{t('profil.accentColor')}</label>
        <div className="flex gap-3">
          {COLOR_THEMES.map((ct) => (
            <button
              key={ct.id}
              type="button"
              onClick={() => setLocalColorTheme(ct.id)}
              title={ct.label}
              className="relative w-9 h-9 rounded-full transition-transform hover:scale-110 focus:outline-none"
              style={{ backgroundColor: ct.swatch }}
            >
              {localColorTheme === ct.id && (
                <span
                  className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-800"
                  style={{ '--tw-ring-color': ct.swatch } as React.CSSProperties}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </SettingsModal>
  )
}

/* ─── Security modal ─────────────────────────────────────── */

function SecurityModal({ onClose, user, signOut }: {
  onClose: () => void
  user: { id: string; email?: string } | null
  signOut: () => Promise<void>
}) {
  const t = useT()

  const displayIdentifier = user?.email
    ? (user.email.endsWith('@escales.app') ? user.email.split('@')[0] : user.email)
    : '—'

  const [newId, setNewId] = useState('')
  const [idMsg, setIdMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [savingId, setSavingId] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [savingPw, setSavingPw] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleChangeId() {
    if (!newId.trim()) return
    setSavingId(true)
    setIdMsg(null)
    const { error } = await supabase.auth.updateUser({ email: normalizeIdentifier(newId.trim()) })
    setSavingId(false)
    if (error) setIdMsg({ text: error.message, ok: false })
    else { setIdMsg({ text: t('profil.idUpdated'), ok: true }); setNewId('') }
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) { setPwMsg({ text: t('profil.passwordMin'), ok: false }); return }
    if (newPassword !== confirmPassword) { setPwMsg({ text: t('profil.passwordMismatch'), ok: false }); return }
    setSavingPw(true)
    setPwMsg(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPw(false)
    if (error) setPwMsg({ text: error.message, ok: false })
    else { setPwMsg({ text: t('profil.passwordUpdated'), ok: true }); setNewPassword(''); setConfirmPassword('') }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    if (user?.id) await supabase.from('profiles').delete().eq('id', user.id)
    await signOut()
  }

  return (
    <SettingsModal title={t('profil.securityTitle')} onClose={onClose}>
      {/* Identifiant actuel */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{t('profil.currentId')}</p>
        <div className={`${inputCls} text-neutral-500 dark:text-neutral-400 select-all`}>{displayIdentifier}</div>
      </div>

      {/* Changer identifiant */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{t('profil.changeId')}</p>
        <input
          type="text"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          placeholder={t('profil.newIdPlaceholder')}
          className={inputCls}
        />
        {idMsg && <p className={`text-xs ${idMsg.ok ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>{idMsg.text}</p>}
        <button
          onClick={handleChangeId}
          disabled={savingId || !newId.trim()}
          className="w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-40 transition-colors"
        >
          {savingId ? t('profil.updating') : t('profil.update')}
        </button>
      </div>

      {/* Changer mot de passe */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{t('profil.changePassword')}</p>
        <div className="relative">
          <input
            type={showNewPw ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('profil.newPasswordPlaceholder')}
            className={`${inputCls} pr-10`}
          />
          <button type="button" onClick={() => setShowNewPw(v => !v)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
            <Icon name={showNewPw ? 'eye-off' : 'eye'} size={16} />
          </button>
        </div>
        <input
          type={showNewPw ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t('profil.confirmPasswordPlaceholder')}
          className={inputCls}
        />
        {pwMsg && <p className={`text-xs ${pwMsg.ok ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>{pwMsg.text}</p>}
        <button
          onClick={handleChangePassword}
          disabled={savingPw || !newPassword}
          className="w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-40 transition-colors"
        >
          {savingPw ? t('profil.updating') : t('profil.update')}
        </button>
      </div>

      {/* Supprimer le compte */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700 space-y-3">
        <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{t('profil.dangerZone')}</p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-900 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          {t('profil.deleteAccount')}
        </button>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title={t('profil.deleteConfirmTitle')}
          message={t('profil.deleteWarning')}
          confirmLabel={deleting ? t('profil.deleting') : t('profil.deleteConfirmAction')}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteAccount}
          loading={deleting}
          dangerous
        />
      )}
    </SettingsModal>
  )
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800'
