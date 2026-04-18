import { InputHTMLAttributes } from 'react'
import Icon from './Icon'

interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function SearchField({ label, className = '', id, ...props }: SearchFieldProps) {
  const inputId = id ?? 'search-field'
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon name="search" size={18} />
        </span>
        <input
          id={inputId}
          type="search"
          className={`
            w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm font-sans
            bg-white placeholder-gray-400 text-gray-900
            border-gray-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100
            ${className}
          `.trim()}
          {...props}
        />
      </div>
    </div>
  )
}
