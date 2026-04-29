import { useState } from 'react'
import type { Project, ProjectType, ChecklistItem } from '../journal.types'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { useT } from '@/lib/i18n'
import type { TKey } from '@/lib/i18n'

const PROPERTY_TYPE_VALUES = ['Appartement', 'Maison', 'Locatif', 'Commercial', 'Terrain'] as const
const PROPERTY_TKEYS: Record<typeof PROPERTY_TYPE_VALUES[number], TKey> = {
  'Appartement': 'propertyType.apartment',
  'Maison': 'propertyType.house',
  'Locatif': 'propertyType.rental',
  'Commercial': 'propertyType.commercial',
  'Terrain': 'propertyType.land',
}

interface Props {
  initial?: Project
  onSave: (project: Omit<Project, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

export default function ProjectEditor({ initial, onSave, onCancel }: Props) {
  const t = useT()

  const PROJECT_TYPES: { value: ProjectType; label: string; icon: string; description: string }[] = [
    { value: 'savings',     icon: '/3dicon/Saving.png', label: t('projectEditor.savings.label'),    description: t('projectEditor.savings.desc') },
    { value: 'real-estate', icon: '/3dicon/House.png',  label: t('projectEditor.realEstate.label'), description: t('projectEditor.realEstate.desc') },
    { value: 'investment',  icon: '/3dicon/Invest.png', label: t('projectEditor.investment.label'), description: t('projectEditor.investment.desc') },
    { value: 'loan',        icon: '/3dicon/Loan.png',   label: t('projectEditor.loan.label'),       description: t('projectEditor.loan.desc') },
    { value: 'free',        icon: '/3dicon/Task.png',   label: t('projectEditor.free.label'),       description: t('projectEditor.free.desc') },
  ]

  const [type, setType] = useState<ProjectType>(initial?.type ?? 'savings')
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [targetAmount, setTargetAmount] = useState(initial?.targetAmount?.toString() ?? '')
  const [currentAmount, setCurrentAmount] = useState(initial?.currentAmount?.toString() ?? '')
  const [city, setCity] = useState(initial?.city ?? '')
  const [propertyType, setPropertyType] = useState(initial?.propertyType ?? PROPERTY_TYPE_VALUES[0])
  const [assetName, setAssetName] = useState(initial?.assetName ?? '')
  const [loanAmount, setLoanAmount] = useState(initial?.loanAmount?.toString() ?? '')
  const [loanDurationMonths, setLoanDurationMonths] = useState(initial?.loanDurationMonths?.toString() ?? '')
  const [loanStartDate, setLoanStartDate] = useState(initial?.loanStartDate ?? '')
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initial?.checklist ?? [])
  const [newItem, setNewItem] = useState('')
  const [error, setError] = useState('')

  function handleTypeChange(newType: ProjectType) {
    setType(newType)
    setError('')
    if (newType === 'real-estate' && checklist.length === 0) {
      setChecklist(
        Array.from({ length: 7 }, (_, i) => ({
          id: crypto.randomUUID(),
          label: t(`reChecklist.${i}` as TKey),
          done: false,
        }))
      )
    } else if (newType !== 'real-estate' && newType !== 'free') {
      setChecklist([])
    }
  }

  function addItem() {
    if (!newItem.trim()) return
    setChecklist((c) => [...c, { id: crypto.randomUUID(), label: newItem.trim(), done: false }])
    setNewItem('')
  }

  function removeItem(id: string) {
    setChecklist((c) => c.filter((i) => i.id !== id))
  }

  function handleSave() {
    if (!name.trim()) { setError(t('projectEditor.errorName')); return }
    if (type === 'savings' && !targetAmount) { setError(t('projectEditor.errorTarget')); return }
    if (type === 'investment' && !targetAmount) { setError(t('projectEditor.errorTarget')); return }
    if (type === 'loan' && (!loanAmount || !loanDurationMonths)) { setError(t('projectEditor.errorLoan')); return }

    onSave({
      type,
      name: name.trim(),
      description: description.trim() || undefined,
      targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
      currentAmount: currentAmount ? parseFloat(currentAmount) : undefined,
      city: city.trim() || undefined,
      propertyType: type === 'real-estate' ? propertyType : undefined,
      assetName: assetName.trim() || undefined,
      loanAmount: loanAmount ? parseFloat(loanAmount) : undefined,
      loanDurationMonths: loanDurationMonths ? parseInt(loanDurationMonths) : undefined,
      loanStartDate: loanStartDate || undefined,
      checklist,
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-4 lg:p-8">
      <div className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0 border-b border-neutral-100 dark:border-neutral-700">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
            {initial ? t('projectEditor.editTitle') : t('projectEditor.newTitle')}
          </h2>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-lg">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Nom */}
          <div className="space-y-1">
            <label className={labelCls}>{t('projectEditor.nameLabel')}</label>
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder={t('projectEditor.namePlaceholder')} className={inputCls(!!error && !name)} />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className={labelCls}>{t('projectEditor.typeLabel')}</label>
            <div className="grid grid-cols-1 gap-2">
              {PROJECT_TYPES.map((pt) => (
                <button key={pt.value} onClick={() => handleTypeChange(pt.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all ${
                    type === pt.value
                      ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <img src={pt.icon} alt="" className="w-11 h-11 object-contain shrink-0" />
                  <div>
                    <p className={`text-sm font-semibold ${type === pt.value ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-800 dark:text-neutral-100'}`}>{pt.label}</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">{pt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Champs spécifiques par type */}
          {(type === 'savings' || type === 'investment') && (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('projectEditor.targetAmount')}>
                <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="50 000" className={inputCls(false)} />
              </Field>
              <Field label={t('projectEditor.currentAmount')}>
                <input type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0" className={inputCls(false)} />
              </Field>
              {type === 'investment' && (
                <div className="col-span-2">
                  <Field label={t('projectEditor.assetName')}>
                    <input type="text" value={assetName} onChange={(e) => setAssetName(e.target.value)} placeholder={t('projectEditor.assetPlaceholder')} className={inputCls(false)} />
                  </Field>
                </div>
              )}
            </div>
          )}

          {type === 'real-estate' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('projectEditor.city')}>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('projectEditor.cityPlaceholder')} className={inputCls(false)} />
              </Field>
              <Field label={t('projectEditor.propertyType')}>
                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={inputCls(false)}>
                  {PROPERTY_TYPE_VALUES.map((p) => (
                    <option key={p} value={p}>{t(PROPERTY_TKEYS[p])}</option>
                  ))}
                </select>
              </Field>
              <div className="col-span-2">
                <Field label={t('projectEditor.budget')}>
                  <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="200 000" className={inputCls(false)} />
                </Field>
              </div>
            </div>
          )}

          {type === 'loan' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('projectEditor.loanAmount')}>
                <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="150 000" className={inputCls(false)} />
              </Field>
              <Field label={t('projectEditor.loanDuration')}>
                <input type="number" value={loanDurationMonths} onChange={(e) => setLoanDurationMonths(e.target.value)} placeholder="240" className={inputCls(false)} />
              </Field>
              <div className="col-span-2">
                <Field label={t('projectEditor.loanStart')}>
                  <input type="date" value={loanStartDate} onChange={(e) => setLoanStartDate(e.target.value)} className={inputCls(false)} />
                </Field>
              </div>
            </div>
          )}

          {/* Description */}
          {(type === 'free' || type === 'investment' || type === 'savings') && (
            <Field label={t('projectEditor.description')}>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder={t('projectEditor.descPlaceholder')} rows={2} className={`${inputCls(false)} resize-none`} />
            </Field>
          )}

          {/* Checklist */}
          {(type === 'real-estate' || type === 'free') && (
            <div className="space-y-2">
              <label className={labelCls}>{type === 'real-estate' ? t('projectEditor.steps') : t('projects.checklist')}</label>
              <div className="space-y-1.5">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <span className="text-neutral-300 dark:text-neutral-600 text-sm shrink-0">•</span>
                    <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-200">{item.label}</span>
                    <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-red-500 transition-all">
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
                  placeholder={t('projectEditor.addStep')} className={`${inputCls(false)} flex-1`} />
                <button onClick={addItem} className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <Icon name="plus" size={15} />
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 shrink-0 flex gap-3">
          <Button variant="grey-outline" size="lg" className="flex-1 rounded-2xl" onClick={onCancel}>{t('projectEditor.cancel')}</Button>
          <Button variant="primary" size="lg" className="flex-1 rounded-2xl" onClick={handleSave}>{initial ? t('projectEditor.save') : t('projectEditor.create')}</Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

const labelCls = 'text-xs font-medium text-neutral-500 dark:text-neutral-400'
const inputCls = (err: boolean) =>
  `w-full px-3 py-2 rounded-xl border text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 transition-colors ${
    err ? 'border-red-400' : 'border-neutral-200 dark:border-neutral-600'
  }`
