import { useState } from 'react'
import { useAuthStore } from './auth.store'
import Button from '@/components/ui/Button'

interface Props {
  onSwitchToSignup: () => void
  onContinueAsGuest: () => void
}

export default function LoginView({ onSwitchToSignup, onContinueAsGuest }: Props) {
  const { signIn, loading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await signIn(email, password)
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Connexion</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Accédez à votre espace Escales</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-400 flex items-center justify-between gap-2">
            <span>{error}</span>
            <button type="button" onClick={clearError} className="text-red-400 hover:text-red-600 shrink-0">✕</button>
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
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full rounded-2xl" disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        Pas encore de compte ?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
        >
          Créer un compte
        </button>
      </p>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-900">ou</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinueAsGuest}
        className="w-full py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
      >
        Continuer en tant qu'invité
        <span className="block text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">Données sauvegardées localement</span>
      </button>
    </div>
  )
}
