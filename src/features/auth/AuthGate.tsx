import { useEffect, useState } from 'react'
import { useAuthStore } from './auth.store'
import { useAccueilStore } from '@/features/accueil/accueil.store'
import { useJournalStore } from '@/features/journal/journal.store'
import { useProfilStore } from '@/features/profil/profil.store'
import LoginView from './LoginView'
import SignupView from './SignupView'

interface Props {
  children: React.ReactNode
}

export default function AuthGate({ children }: Props) {
  const { user, loading, init, isGuest, signInAsGuest } = useAuthStore()
  const loadAccueil = useAccueilStore((s) => s.loadFromCloud)
  const loadJournal = useJournalStore((s) => s.loadFromCloud)
  const loadProfil = useProfilStore((s) => s.loadFromCloud)
  const resetAccueil = useAccueilStore((s) => s.resetData)
  const resetJournal = useJournalStore((s) => s.resetData)
  const resetProfil = useProfilStore((s) => s.resetData)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (user) {
      loadAccueil(user.id)
      loadJournal(user.id)
      loadProfil(user.id)
    } else if (!isGuest) {
      resetAccueil()
      resetJournal()
      resetProfil()
    }
  }, [user?.id, isGuest])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin text-primary-500" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.25" />
            <path d="M21 12a9 9 0 00-9-9" />
          </svg>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Chargement…</p>
        </div>
      </div>
    )
  }

  if (!user && !isGuest) {
    return (
      <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900">
        {/* Panneau gauche — branding (desktop uniquement) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center p-12">
          <div className="max-w-sm text-white space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold text-white">
              E
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-bold">Escales</h2>
              <p className="text-lg text-primary-100 leading-relaxed">
                Votre carnet de route pour piloter vos investissements comme un pro.
              </p>
            </div>
            <div className="space-y-3 pt-4">
              {['Suivez votre portefeuille en temps réel', 'Organisez vos projets et objectifs', 'Prenez des décisions éclairées'].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-primary-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panneau droit — formulaire */}
        <div className="flex-1 flex items-center justify-center p-6">
          {mode === 'login'
            ? <LoginView onSwitchToSignup={() => setMode('signup')} onContinueAsGuest={signInAsGuest} />
            : <SignupView onSwitchToLogin={() => setMode('login')} onContinueAsGuest={signInAsGuest} />
          }
        </div>
      </div>
    )
  }

  return <>{children}</>
}
