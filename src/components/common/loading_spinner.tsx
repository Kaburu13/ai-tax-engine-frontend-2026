// src/components/common/loading_spinner.tsx
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  fullScreen?: boolean
  className?: string
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
}

export default function LoadingSpinner({
  size = 'md',
  message,
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className="animate-spin text-kpmg-blue" size={sizeMap[size]} />
      {message && (
        <p className="text-sm text-kpmg-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

// Inline spinner for buttons and small spaces
interface InlineSpinnerProps {
  size?: number
  className?: string
}

export function InlineSpinner({ size = 16, className }: InlineSpinnerProps) {
  return <Loader2 className={clsx('animate-spin', className)} size={size} />
}

// Skeleton loader for content
interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'animate-pulse bg-kpmg-gray-200 rounded',
            className
          )}
        />
      ))}
    </>
  )
}