import { useT } from '@/lib/i18n'

export default function EducationView() {
  const t = useT()
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
      <span className="text-5xl">📚</span>
      <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">{t('education.title')}</p>
      <p className="text-sm text-neutral-400 dark:text-neutral-500">{t('education.wip')}</p>
    </div>
  )
}
