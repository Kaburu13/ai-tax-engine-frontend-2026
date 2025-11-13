// src/components/common/error_message.tsx
import { AlertCircle, RefreshCw, X } from 'lucide-react'
import { clsx } from 'clsx'
import Button from './button'

interface ErrorMessageProps {
  title?: string
  message: string
  error?: Error | unknown
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'error' | 'warning' | 'info'
  className?: string
}

export default function ErrorMessage({
  title,
  message,
  error,
  onRetry,
  onDismiss,
  variant = 'error',
  className,
}: ErrorMessageProps) {
  const variantStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      message: 'text-red-800',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      message: 'text-yellow-800',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      message: 'text-blue-800',
    },
  }

  const styles = variantStyles[variant]

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message
    if (typeof err === 'string') return err
    return 'An unexpected error occurred'
  }

  return (
    <div
      className={clsx(
        'rounded-lg border p-4',
        styles.container,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className={clsx('flex-shrink-0 mt-0.5', styles.icon)} size={20} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={clsx('text-sm font-semibold mb-1', styles.title)}>
              {title}
            </h4>
          )}
          <p className={clsx('text-sm', styles.message)}>{message}</p>
          
         {error ? (
           <details className="mt-2">
            <summary className="text-xs cursor-pointer hover:underline">
               Technical details
             </summary>
            <pre className="mt-2 text-xs bg-white/50 p-2 rounded overflow-x-auto">
              {getErrorMessage(error)}
              </pre>
           </details>
        ) : null}

          {onRetry && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="!text-xs"
              >
                <RefreshCw size={14} />
                Retry
              </Button>
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} className={styles.icon} />
          </button>
        )}
      </div>
    </div>
  )
}

// Inline error for form fields
interface InlineErrorProps {
  message: string
  className?: string
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div className={clsx('flex items-center gap-1 text-xs text-error mt-1', className)}>
      <AlertCircle size={12} />
      <span>{message}</span>
    </div>
  )
}