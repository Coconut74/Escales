import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'grey-outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary:      'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  secondary:    'bg-primary-50 text-primary-600 hover:bg-primary-100 active:bg-primary-200',
  'grey-outline': 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
        disabled:opacity-40 disabled:pointer-events-none
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
