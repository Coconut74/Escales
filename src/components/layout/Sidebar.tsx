import Icon from '@/components/ui/Icon'
import type { View } from '@/App'

const NAV_ITEMS: { id: View; label: string; icon: 'accueil' | 'journal' | 'map' | 'coffre' }[] = [
  { id: 'journal', label: 'Journal', icon: 'journal' },
  { id: 'map',     label: 'Map',     icon: 'map'     },
  { id: 'coffre',  label: 'Coffre',  icon: 'coffre'  },
]

interface SidebarProps {
  activeView: View
  onNavigate: (view: View) => void
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <nav className="hidden lg:flex w-56 bg-surface-raised border-r border-gray-200 flex-col py-6 px-3 gap-1">
      <span className="text-xl font-semibold text-primary-500 px-3 mb-6 tracking-tight">
        Escales
      </span>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors
            ${activeView === item.id
              ? 'bg-primary-500 text-white'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
        >
          <Icon name={item.icon} size={20} />
          {item.label}
        </button>
      ))}
    </nav>
  )
}
