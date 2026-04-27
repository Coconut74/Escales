import Icon from '@/components/ui/Icon'
import { useProfilStore } from '@/features/profil/profil.store'
import { useAuthStore } from '@/features/auth/auth.store'
import { useT } from '@/lib/i18n'
import type { View } from '@/App'

interface SidebarProps {
  activeView: View
  onNavigate: (view: View) => void
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const t = useT()
  const { firstName, lastName, avatarId } = useProfilStore()
  const { signOut, user } = useAuthStore()
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || user?.email?.split('@')[0] || 'Utilisateur'

  const NAV_ITEMS: { id: View; label: string; icon: 'accueil' | 'journal' | 'book' }[] = [
    { id: 'accueil',   label: t('nav.home'),      icon: 'accueil' },
    { id: 'journal',   label: t('nav.journal'),   icon: 'journal' },
    { id: 'education', label: t('nav.education'), icon: 'book'    },
  ]

  return (
    <aside
      className="hidden lg:flex fixed left-4 top-4 bottom-4 z-40 w-56 flex-col rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-white/10 shadow-xl shadow-neutral-300/40 dark:shadow-black/30"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 pt-6 pb-5">
        <img src="/logo.png" alt="Escales" className="w-7 h-7 object-contain" />
        <span className="text-base font-bold tracking-widest text-primary-500 uppercase">
          Escales
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 w-full text-left
                ${isActive
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 hover:text-neutral-700'
                }`}
            >
              <Icon name={item.icon} size={19} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="flex-1" />

      {/* User */}
      <div className="px-3 pb-5 space-y-1">
        <button
          onClick={() => onNavigate('profil')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 w-full text-left
            ${activeView === 'profil'
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 hover:text-neutral-700'
            }`}
        >
          <img src={`/avatars/${avatarId || 'avatar-1'}.png`} alt="avatar" className="w-6 h-6 rounded-full object-cover shrink-0" />
          <span className="truncate">{displayName}</span>
        </button>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 w-full text-left text-neutral-400 dark:text-neutral-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 dark:hover:text-red-400"
        >
          <Icon name="logout" size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
