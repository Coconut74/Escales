import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import AccueilView from '@/features/accueil/AccueilView'
import JournalView from '@/features/journal/JournalView'
import EducationView from '@/features/education/EducationView'
import ProfilView from '@/features/profil/ProfilView'
import AuthGate from '@/features/auth/AuthGate'
import { useProfilStore } from '@/features/profil/profil.store'
import { useAuthStore } from '@/features/auth/auth.store'
import { useIsDark } from '@/features/profil/useIsDark'
import { COLOR_THEME_VARS } from '@/features/profil/color-themes'

export type View = 'accueil' | 'journal' | 'education' | 'profil'

function AppShell() {
  const [activeView, setActiveView] = useState<View>('accueil')

  const views: Record<View, JSX.Element> = {
    accueil: <AccueilView />,
    journal: <JournalView />,
    education: <EducationView />,
    profil: <ProfilView />,
  }

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 font-sans text-neutral-900 dark:text-neutral-50">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <div className="flex flex-col flex-1 overflow-hidden lg:pl-[312px]">
        <main className="flex-1 overflow-auto">
          {views[activeView]}
        </main>
      </div>
      <BottomNav activeView={activeView} onNavigate={setActiveView} />
    </div>
  )
}

export default function App() {
  const user = useAuthStore((s) => s.user)
  const isGuest = useAuthStore((s) => s.isGuest)
  const colorTheme = useProfilStore((s) => s.colorTheme)
  const isDark = useIsDark()

  const isAuthenticated = !!user || isGuest

  // Page de connexion : suit la préférence OS (reactive)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    if (isAuthenticated) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    setSystemDark(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [isAuthenticated])

  const effectiveDark = isAuthenticated ? isDark : systemDark

  useEffect(() => {
    if (effectiveDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [effectiveDark])

  useEffect(() => {
    // Page de connexion : toujours orange
    const vars = COLOR_THEME_VARS[isAuthenticated ? colorTheme : 'orange']
    const root = document.documentElement
    Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val))
  }, [isAuthenticated, colorTheme])

  return (
    <AuthGate>
      <AppShell />
    </AuthGate>
  )
}
