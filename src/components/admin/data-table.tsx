import { useMemo, useState } from 'react'
import { ArrowUpDown, ChevronLeft, ChevronRight, Download, Funnel, Search, X } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink } from '@/components/admin/admin-link'
import { EmptyState } from '@/components/admin/primitives'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type Column<T> = {
  key: string
  header: string
  /** Cell renderer. Return a string for plain text. */
  cell: (row: T) => React.ReactNode
  /** Sort accessor — omit to make the column unsortable. */
  sortBy?: (row: T) => string | number
  align?: 'left' | 'right'
  className?: string
  /** Hide below the given breakpoint to keep tables readable on small screens. */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl'
}

export type FilterDef = {
  key: string
  label: string
  options: string[]
}

const HIDE = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
} as const

/**
 * The one list surface used by every admin module: search, filters, sorting,
 * selection, bulk actions, page size, pagination, export and empty state.
 */
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchKeys,
  searchPlaceholder = 'Search…',
  filters = [],
  activeFilters = {},
  onFilterChange,
  rowHref,
  selectable = false,
  bulkActions,
  exportName,
  empty,
  toolbarExtra,
  initialPageSize = 10,
}: {
  rows: T[]
  columns: Column<T>[]
  searchKeys: (row: T) => string
  searchPlaceholder?: string
  filters?: FilterDef[]
  activeFilters?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  rowHref?: (row: T) => { to: string; search?: Record<string, string> }
  selectable?: boolean
  bulkActions?: (selected: T[], clear: () => void) => React.ReactNode
  exportName?: string
  empty?: { title: string; body: string }
  toolbarExtra?: React.ReactNode
  initialPageSize?: number
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let out = q ? rows.filter((r) => searchKeys(r).toLowerCase().includes(q)) : rows
    if (sort) {
      const col = columns.find((c) => c.key === sort.key)
      if (col?.sortBy) {
        out = [...out].sort((a, b) => {
          const av = col.sortBy!(a)
          const bv = col.sortBy!(b)
          const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
          return sort.dir === 'asc' ? cmp : -cmp
        })
      }
    }
    return out
  }, [rows, query, sort, columns, searchKeys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const selectedRows = filtered.filter((r) => selected.has(r.id))
  const activeFilterEntries = Object.entries(activeFilters).filter(([, v]) => v)

  function toggleSort(key: string) {
    setSort((prev) => (prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 border-b px-4 py-3">
        <div className="relative min-w-0 flex-1 sm:max-w-[320px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 pl-9 text-[13px]"
          />
        </div>

        {filters.map((f) => (
          <Select
            key={f.key}
            value={activeFilters[f.key] ?? 'all'}
            onValueChange={(v) => onFilterChange?.(f.key, v === 'all' ? '' : v)}
          >
            <SelectTrigger size="sm" className="w-auto min-w-[132px] gap-2 text-[13px]">
              <Funnel className="size-3.5 text-ink-400" />
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{f.label}: All</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {toolbarExtra}

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-[12px] text-ink-500 sm:block">
            {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
          </span>
          {exportName && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(`Export queued`, { description: `${exportName} · CSV · ${filtered.length} rows` })}
            >
              <Download className="size-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Filtered by</span>
          {activeFilterEntries.map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => onFilterChange?.(key, '')}
              className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-[11px] font-semibold text-ink-700 transition-colors hover:border-ink-400 dark:text-ink-200"
            >
              {value}
              <X className="size-3" />
            </button>
          ))}
        </div>
      )}

      {/* Bulk action bar */}
      {selectable && selectedRows.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b bg-brand-50 px-4 py-2.5 dark:bg-brand-950/60">
          <span className="text-[12px] font-semibold text-brand-800 dark:text-brand-200">
            {selectedRows.length} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {bulkActions?.(selectedRows, () => setSelected(new Set()))}
          </div>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-[12px] font-semibold text-brand-700 hover:underline dark:text-brand-300"
          >
            Clear
          </button>
        </div>
      )}

      {pageRows.length === 0 ? (
        <EmptyState title={empty?.title ?? 'Nothing to show'} body={empty?.body ?? 'No records match the current filters.'} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/60">
              {selectable && (
                <TableHead className="w-10 pr-0">
                  <Checkbox
                    aria-label="Select all rows on this page"
                    checked={pageRows.every((r) => selected.has(r.id))}
                    onCheckedChange={(checked) =>
                      setSelected((prev) => {
                        const next = new Set(prev)
                        pageRows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)))
                        return next
                      })
                    }
                  />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(col.align === 'right' && 'text-right', col.hideBelow && HIDE[col.hideBelow], col.className)}
                >
                  {col.sortBy ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        'inline-flex items-center gap-1.5 uppercase tracking-[0.06em] transition-colors hover:text-ink-800 dark:hover:text-white',
                        sort?.key === col.key && 'text-ink-800 dark:text-white'
                      )}
                    >
                      {col.header}
                      <ArrowUpDown className="size-3" />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
              {rowHref && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => (
              <TableRow key={row.id} data-state={selected.has(row.id) ? 'selected' : undefined}>
                {selectable && (
                  <TableCell className="pr-0">
                    <Checkbox
                      aria-label={`Select ${row.id}`}
                      checked={selected.has(row.id)}
                      onCheckedChange={(checked) =>
                        setSelected((prev) => {
                          const next = new Set(prev)
                          checked ? next.add(row.id) : next.delete(row.id)
                          return next
                        })
                      }
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(col.align === 'right' && 'text-right', col.hideBelow && HIDE[col.hideBelow], col.className)}
                  >
                    {col.cell(row)}
                  </TableCell>
                ))}
                {rowHref && (
                  <TableCell className="text-right">
                    <AdminLink
                      {...rowHref(row)}
                      aria-label={`Open ${row.id}`}
                      className="inline-grid size-8 place-items-center rounded-sm text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-secondary dark:hover:text-white"
                    >
                      <ChevronRight className="size-4" />
                    </AdminLink>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-ink-500">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v))
                setPage(1)
              }}
            >
              <SelectTrigger size="sm" className="h-8 w-[74px] text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[12px] text-ink-500 tabular">
              {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="px-1.5 text-[12px] font-semibold tabular">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                aria-label="Next page"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
