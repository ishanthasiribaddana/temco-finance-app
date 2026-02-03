import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

interface Column<T> {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: unknown, row: T, index: number) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  selectedRows?: Set<string | number>
  onSelectRow?: (id: string | number) => void
  showPagination?: boolean
  pageSize?: number
  currentPage?: number
  totalItems?: number
  onPageChange?: (page: number) => void
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  selectedRows,
  onSelectRow,
  showPagination = true,
  pageSize = 10,
  currentPage = 1,
  totalItems,
  onPageChange
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (aVal === bVal) return 0
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    const comparison = aVal < bVal ? -1 : 1
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const total = totalItems || data.length
  const totalPages = Math.ceil(total / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, total)

  const getValue = (row: T, key: string): unknown => {
    return key.split('.').reduce((obj: unknown, k) => {
      if (obj && typeof obj === 'object') {
        return (obj as Record<string, unknown>)[k]
      }
      return undefined
    }, row)
  }

  return (
    <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary-50 border-b border-secondary-200">
              {onSelectRow && (
                <th className="px-4 py-3 w-12">
                  <input type="checkbox" className="rounded border-secondary-300" />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.sortable ? 'cursor-pointer hover:bg-secondary-100' : ''}`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-secondary-400">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (onSelectRow ? 1 : 0)} className="px-4 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-secondary-500">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onSelectRow ? 1 : 0)} className="px-4 py-12 text-center text-secondary-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => {
                const rowId = row[keyField] as string | number
                const isSelected = selectedRows?.has(rowId)
                return (
                  <tr
                    key={rowId}
                    className={`
                      ${onRowClick ? 'cursor-pointer hover:bg-primary-50' : 'hover:bg-secondary-50'}
                      ${isSelected ? 'bg-primary-50' : ''}
                      transition-colors
                    `}
                    onClick={() => onRowClick?.(row)}
                  >
                    {onSelectRow && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow(rowId)}
                          className="rounded border-secondary-300"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm text-secondary-900 ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {col.render ? col.render(getValue(row, col.key), row, index) : String(getValue(row, col.key) ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-secondary-200 bg-secondary-50">
          <div className="text-sm text-secondary-600">
            Showing {startItem} to {endItem} of {total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-sm text-secondary-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
