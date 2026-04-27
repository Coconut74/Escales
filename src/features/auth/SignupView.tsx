import { useState } from 'react'
import { useAuthStore } from './auth.store'
import Button from '@/components/ui/Button'

interface Props {
  onSwitchToLogin: () => void
}

export default function SignupView({ onSwitchToLogin }: Props) {
  const { signUp, loading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setLocalError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setLocalError('')
    await signUp(email, password)
    setEmailSent(true)
  }

  const displayError = localError || error

  if (emailSent && !error) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-3xl">
          ✉️
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Vérifiez vos e-mails</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Un lien de confirmation a été envoyé à <span className="font-semibold text-neutral-700 dark:text-neutral-200">{email}</span>.
            Cliquez sur ce lien pour activer votre compte.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline"
        >
          Retour à la connexion
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Créer un compte</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Commencez à piloter vos investissements</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {displayError && (
          <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-400 flex items-center justify-between gap-2">
            <span>{displayError}</span>
            <button type="button" onClick={() => { setLocalError(''); clearError() }} className="text-red-400 hover:text-red-600 shrink-0">✕</button>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Adresse e-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            required
            autoComplete="email"
            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
            required
            autoComplete="new-password"
            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full rounded-2xl" disabled={loading}>
          {loading ? 'Création…' : 'Créer mon compte'}
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        Déjà un compte ?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
        >
          Se connecter
        </button>
      </p>
    </div>
  )
}
