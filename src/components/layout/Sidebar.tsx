import type { View } from '@/App'

const NAV_ITEMS: { id: View; label: string; icon: string }[] = [
  { id: 'journal', label: 'Journal', icon: '📒' },
  { id: 'map', label: 'Map', icon: '🗺️' },
  { id: 'coffre', label: 'Coffre', icon: '🔐' },
]

interface SidebarProps {
  activeView: View
  onNavigate: (view: View) => void
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <nav className="w-56 bg-white border-r border-gray-200 flex flex-col py-6 px-3 gap-1">
      <span className="text-xl font-bold text-primary px-3 mb-6">Escales</span>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${activeView === item.id
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}
