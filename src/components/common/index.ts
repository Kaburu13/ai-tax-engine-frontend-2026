// src/components/common/index.ts
// Common Components Index
// This file exports all common components for easier importing

export { default as Button } from './button'
export { default as Card, CardHeader, CardContent, CardFooter } from './card'
export { default as LoadingSpinner, InlineSpinner, Skeleton } from './loading_spinner'
export { default as ErrorMessage, InlineError } from './error_message'
export { default as Modal, ConfirmModal } from './modal'
export { default as Table, Pagination } from './table'

// Usage example:
// import { Button, Card, LoadingSpinner } from '@/components/common'