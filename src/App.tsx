import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import AccueilView from '@/features/accueil/AccueilView'
import JournalView from '@/features/journal/JournalView'
import EducationView from '@/features/education/EducationView'
import ProfilView from '@/features/profil/ProfilView'
import AuthGate from '@/features/auth/AuthGate'
import MigrationBanner from '@/features/auth/MigrationBanner'
import { useProfilStore } from '@/features/profil/profil.store'
import { COLOR_THEME_VARS } from '@/features/profil/color-themes'

export type View = 'accueil' | 'journal' | 'education' | 'profil'

function AppShell() {
  const [activeView, setActiveView] = useState<View>('accueil')
  const theme = useProfilStore((s) => s.theme)
  const colorTheme = useProfilStore((s) => s.colorTheme)

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  useEffect(() => {
    const vars = COLOR_THEME_VARS[colorTheme]
    const root = document.documentElement
    Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val))
  }, [colorTheme])

  const views: Record<View, JSX.Element> = {
    accueil: <AccueilView />,
    journal: <JournalView />,
    education: <EducationView />,
    profil: <ProfilView />,
  }

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 font-sans text-neutral-900 dark:text-neutral-50">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <div className="flex flex-col flex-1 overflow-hidden lg:pl-[248px]">
        <MigrationBanner />
        <main className="flex-1 overflow-auto">
          {views[activeView]}
        </main>
      </div>
      <BottomNav activeView={activeView} onNavigate={setActiveView} />
    </div>
  )
}

export default function App() {
  return (
    <AuthGate>
      <AppShell />
    </AuthGate>
  )
}
