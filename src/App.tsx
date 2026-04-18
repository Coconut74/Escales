import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import MapView from '@/features/map/MapView'
import JournalView from '@/features/journal/JournalView'
import PlannerView from '@/features/planner/PlannerView'

export type View = 'map' | 'journal' | 'planner'

export default function App() {
  const [activeView, setActiveView] = useState<View>('journal')

  const views: Record<View, JSX.Element> = {
    map:     <MapView />,
    journal: <JournalView />,
    planner: <PlannerView />,
  }

  return (
    <div className="flex h-screen bg-surface font-sans text-neutral-900">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header activeView={activeView} />
        <main className="flex-1 overflow-auto">
          {views[activeView]}
        </main>
      </div>
      <BottomNav activeView={activeView} onNavigate={setActiveView} />
    </div>
  )
}
