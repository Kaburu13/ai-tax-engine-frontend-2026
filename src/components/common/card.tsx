// src/components/common/card.tsx
import { HTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  noPadding?: boolean
}

export function Card({ children, hover = false, noPadding = false, className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-kpmg-gray-200 shadow-sm',
        hover && 'card-hover cursor-pointer',
        !noPadding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={clsx('flex items-start justify-between mb-4', className)}>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-kpmg-gray-900">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-kpmg-gray-600">{subtitle}</p>}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  )
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={clsx('text-kpmg-gray-700', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
}

export function CardFooter({ children, bordered = true, className, ...props }: CardFooterProps) {
  return (
    <div
      className={clsx(
        'mt-4 pt-4',
        bordered && 'border-t border-kpmg-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card