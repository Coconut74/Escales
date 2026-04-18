import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import JournalView from '@/features/journal/JournalView'
import MapView from '@/features/map/MapView'
import CoffreView from '@/features/coffre/CoffreView'

export type View = 'journal' | 'map' | 'coffre'

export default function App() {
  const [activeView, setActiveView] = useState<View>('journal')

  const views: Record<View, JSX.Element> = {
    journal: <JournalView />,
    map: <MapView />,
    coffre: <CoffreView />,
  }

  return (
    <div className="flex h-screen bg-surface text-gray-900">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header activeView={activeView} />
        <main className="flex-1 overflow-auto p-6">
          {views[activeView]}
        </main>
      </div>
    </div>
  )
}
