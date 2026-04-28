import { useEffect, useState } from 'react'
import { useProfilStore } from './profil.store'

export function useIsDark(): boolean {
  const theme = useProfilStore((s) => s.theme)
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    setSystemDark(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  if (theme === 'dark') return true
  if (theme === 'light') return false
  return systemDark
}
