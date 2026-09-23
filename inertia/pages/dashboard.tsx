import type { Data } from '@generated/data'
import { router } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'
import Button from '~/components/button'
import TodoDialog from '~/components/todo_dialog'
import TodoItem from '~/components/todo_item'
import { TODO_CATEGORIES } from '~/lib/todo_categories'

type PaginationMeta = {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
}

type Filters = {
  q: string
  category: string
  dateFrom: string
  dateTo: string
}

type DashboardProps = {
  todos: { data: Data.Todo[]; metadata: PaginationMeta }
  filters: Filters
}

const selectClassName =
  'h-10 rounded-md border border-gray-4 bg-white px-3 text-sm text-black outline-none focus:border-gray-8'

export default function Dashboard({ todos, filters }: DashboardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Data.Todo | undefined>(undefined)
  // Bumped on every open so TodoDialog remounts with fresh field state,
  // even when re-opening the same "new todo" or the same todo to edit.
  const [dialogKey, setDialogKey] = useState(0)

  const [search, setSearch] = useState(filters.q)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function applyFilters(next: Partial<Filters>) {
    router.get(
      '/dashboard',
      { ...filters, ...next, page: 1 },
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }

  function goToPage(page: number) {
    router.get(
      '/dashboard',
      { ...filters, page },
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }

  useEffect(() => {
    setSearch(filters.q)
  }, [filters.q])

  function handleSearchChange(value: string) {
    setSearch(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => applyFilters({ q: value }), 400)
  }

  function openCreateDialog() {
    setEditingTodo(undefined)
    setDialogOpen(true)
    setDialogKey((key) => key + 1)
  }

  function openEditDialog(todo: Data.Todo) {
    setEditingTodo(todo)
    setDialogOpen(true)
    setDialogKey((key) => key + 1)
  }

  const { data, metadata: meta } = todos

  return (
    <div className="py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-12">Your todos</h1>
        <Button onClick={openCreateDialog}>New todo</Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-6">
        <input
          type="text"
          placeholder="Search title or description…"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="h-10 rounded-md border border-gray-4 bg-white px-3 text-sm text-black outline-none placeholder:text-gray-6 focus:border-gray-8 sm:col-span-3"
        />

        <select
          value={filters.category}
          onChange={(event) => applyFilters({ category: event.target.value })}
          className={`${selectClassName} sm:col-span-1`}
        >
          <option value="">All categories</option>
          {TODO_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            type="date"
            aria-label="Due date from"
            value={filters.dateFrom}
            onChange={(event) => applyFilters({ dateFrom: event.target.value })}
            className={`${selectClassName} min-w-0 flex-1`}
          />
          <span className="text-gray-6">–</span>
          <input
            type="date"
            aria-label="Due date to"
            value={filters.dateTo}
            onChange={(event) => applyFilters({ dateTo: event.target.value })}
            className={`${selectClassName} min-w-0 flex-1`}
          />
        </div>
      </div>

      {data.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-4 py-16 text-center text-gray-6">
          {filters.q || filters.category || filters.dateFrom || filters.dateTo
            ? 'No todos match your filters.'
            : 'No todos yet — create your first one.'}
        </p>
      ) : (
        <>
          <ul className="rounded-md border border-gray-3 px-4">
            {data.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onEdit={openEditDialog} />
            ))}
          </ul>

          {meta.lastPage > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-6">
              <span>
                Page {meta.currentPage} of {meta.lastPage} ({meta.total} todos)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={meta.currentPage <= 1}
                  onClick={() => goToPage(meta.currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={meta.currentPage >= meta.lastPage}
                  onClick={() => goToPage(meta.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <TodoDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        todo={editingTodo}
      />
    </div>
  )
}
