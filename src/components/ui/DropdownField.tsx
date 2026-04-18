import { SelectHTMLAttributes } from 'react'
import Icon from './Icon'

interface DropdownFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
  error?: string
}

export default function DropdownField({ label, options, error, className = '', id, ...props }: DropdownFieldProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <select
          id={selectId}
          className={`
            w-full appearance-none px-4 py-3.5 pr-10 rounded-xl border text-sm font-sans
            bg-white text-gray-900
            border-gray-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100
            disabled:bg-gray-50 disabled:text-gray-400
            ${error ? 'border-red-400' : ''}
            ${className}
          `.trim()}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon name="arrow" size={18} className="rotate-90" />
        </span>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
