import Icon from '@/components/ui/Icon'
import type { View } from '@/App'

const NAV_ITEMS: { id: View; label: string; icon: 'accueil' | 'journal' | 'event' | 'profile' }[] = [
  { id: 'accueil', label: 'Accueil',         icon: 'accueil'  },
  { id: 'journal', label: 'Journal de bord', icon: 'journal'  },
  { id: 'planner', label: 'Planner',         icon: 'event'    },
  { id: 'profil',  label: 'Profil',          icon: 'profile'  },
]

const ITEM_SIZE = 60
const GAP = 8

interface BottomNavProps {
  activeView: View
  onNavigate: (view: View) => void
}

export default function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const activeIndex = NAV_ITEMS.findIndex(i => i.id === activeView)

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <nav
        className="relative flex items-center gap-2 px-2 py-2 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-neutral-900/75 border border-neutral-200/70 dark:border-white/10 shadow-xl shadow-neutral-300/40 dark:shadow-black/30"
      >
        {/* orange sliding indicator */}
        <div
          aria-hidden
          className="absolute top-2 left-2 rounded-xl bg-primary-500"
          style={{
            width: ITEM_SIZE,
            height: ITEM_SIZE,
            transform: `translateX(${activeIndex * (ITEM_SIZE + GAP)}px)`,
            transition: 'transform 380ms cubic-bezier(0.25, 1.2, 0.5, 1)',
          }}
        />

        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
              className="relative z-10 flex items-center justify-center"
              style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
            >
              <Icon
                name={item.icon}
                size={22}
                className={isActive ? 'text-white' : 'text-neutral-400 dark:text-neutral-500'}
              />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
