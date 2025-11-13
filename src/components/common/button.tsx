// src/components/common/button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed'

    const variantStyles = {
      primary: 'bg-kpmg-blue text-white hover:bg-kpmg-blue-dark active:bg-kpmg-blue-dark shadow-sm',
      secondary: 'bg-kpmg-gray-200 text-kpmg-gray-900 hover:bg-kpmg-gray-300 active:bg-kpmg-gray-400',
      outline: 'border-2 border-kpmg-blue text-kpmg-blue hover:bg-kpmg-blue hover:text-white',
      ghost: 'text-kpmg-blue hover:bg-kpmg-blue/10 active:bg-kpmg-blue/20',
      danger: 'bg-error text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
    }

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button