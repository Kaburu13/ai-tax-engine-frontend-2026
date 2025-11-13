// src/components/common/table.tsx
import { ReactNode, useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import Button from './button'

// Table types
export interface Column<T> {
  key: string
  header: string
  accessor: (row: T) => ReactNode
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (row: T) => string | number
  loading?: boolean
  emptyMessage?: string
  stickyHeader?: boolean
  hoverable?: boolean
  striped?: boolean
  bordered?: boolean
  compact?: boolean
  className?: string
}

type SortDirection = 'asc' | 'desc' | null

export default function Table<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data available',
  stickyHeader = false,
  hoverable = true,
  striped = false,
  bordered = true,
  compact = false,
  className,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (columnKey: string) => {
    if (sortKey === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortKey(null)
        setSortDirection(null)
      }
    } else {
      setSortKey(columnKey)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0

    const column = columns.find(col => col.key === sortKey)
    if (!column) return 0

    const aValue = column.accessor(a)
    const bValue = column.accessor(b)

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const renderSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown size={14} className="opacity-50" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kpmg-blue mx-auto mb-2"></div>
          <p className="text-sm text-kpmg-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('table-container', bordered && 'border', className)}>
      <table className="w-full">
        <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={clsx(
                  compact ? 'px-3 py-2' : 'px-4 py-3',
                  `text-${column.align || 'left'}`,
                  column.width && `w-${column.width}`,
                  column.sortable && 'cursor-pointer select-none hover:bg-kpmg-gray-100'
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2 justify-start">
                  <span>{column.header}</span>
                  {column.sortable && renderSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-kpmg-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr
                key={keyExtractor(row)}
                className={clsx(
                  hoverable && 'hover:bg-kpmg-gray-50',
                  striped && index % 2 === 1 && 'bg-kpmg-gray-50/50'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={clsx(
                      compact ? 'px-3 py-2' : 'px-4 py-3',
                      `text-${column.align || 'left'}`
                    )}
                  >
                    {column.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// Pagination component
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  totalItems?: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
  className,
}: PaginationProps) {
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className={clsx('flex items-center justify-between', className)}>
      {pageSize && totalItems && (
        <div className="text-sm text-kpmg-gray-600">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{' '}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
        >
          <ChevronLeft size={16} />
          Previous
        </Button>

        <div className="flex gap-1">
          {getPageNumbers().map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={clsx(
                  'px-3 py-1.5 text-sm rounded transition-colors focus-ring',
                  page === currentPage
                    ? 'bg-kpmg-blue text-white'
                    : 'text-kpmg-gray-700 hover:bg-kpmg-gray-100'
                )}
              >
                {page}
              </button>
            ) : (
              <span
                key={index}
                className="px-3 py-1.5 text-sm text-kpmg-gray-400"
              >
                {page}
              </span>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}