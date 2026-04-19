import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import AccueilView from '@/features/accueil/AccueilView'
import JournalView from '@/features/journal/JournalView'
import PlannerView from '@/features/planner/PlannerView'
import ProfilView from '@/features/profil/ProfilView'
import { useProfilStore } from '@/features/profil/profil.store'

export type View = 'accueil' | 'journal' | 'planner' | 'profil'

export default function App() {
  const [activeView, setActiveView] = useState<View>('accueil')
  const theme = useProfilStore((s) => s.theme)

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  const views: Record<View, JSX.Element> = {
    accueil: <AccueilView />,
    journal: <JournalView />,
    planner: <PlannerView />,
    profil: <ProfilView />,
  }

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 font-sans text-neutral-900 dark:text-neutral-50">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <div className="flex flex-col flex-1 overflow-hidden lg:pl-[248px]">
        <main className="flex-1 overflow-auto">
          {views[activeView]}
        </main>
      </div>
      <BottomNav activeView={activeView} onNavigate={setActiveView} />
    </div>
  )
}
