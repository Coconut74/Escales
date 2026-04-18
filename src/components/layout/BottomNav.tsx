import Icon from '@/components/ui/Icon'
import type { View } from '@/App'

const NAV_ITEMS: { id: View; icon: 'journal' | 'map' | 'coffre' }[] = [
  { id: 'journal', icon: 'journal' },
  { id: 'map',     icon: 'map'     },
  { id: 'coffre',  icon: 'coffre'  },
]

interface BottomNavProps {
  activeView: View
  onNavigate: (view: View) => void
}

export default function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  return (
    <nav className="flex lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-raised border-t border-neutral-200 justify-center items-center gap-10 z-50">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors
            ${activeView === item.id ? 'text-primary-600' : 'text-neutral-400 hover:text-neutral-600'}`}
          aria-label={item.id}
        >
          <Icon name={item.icon} size={24} />
        </button>
      ))}
    </nav>
  )
}
