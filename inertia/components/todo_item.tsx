import { Checkbox } from '@base-ui/react/checkbox'
import { Menu } from '@base-ui/react/menu'
import type { Data } from '@generated/data'
import { router } from '@inertiajs/react'
import { categoryLabel } from '~/lib/todo_categories'

type TodoItemProps = {
  todo: Data.Todo
  onEdit: (todo: Data.Todo) => void
}

export default function TodoItem({ todo, onEdit }: TodoItemProps) {
  function toggleCompleted() {
    router.put(`/todos/${todo.id}`, { completed: !todo.completed }, { preserveScroll: true })
  }

  function destroy() {
    router.delete(`/todos/${todo.id}`, { preserveScroll: true })
  }

  return (
    <li className="flex items-start gap-3 border-b border-gray-3 py-4 last:border-b-0">
      <Checkbox.Root
        checked={todo.completed}
        onCheckedChange={toggleCompleted}
        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-4 data-[checked]:border-gray-12 data-[checked]:bg-gray-12"
      >
        <Checkbox.Indicator className="text-xs font-bold text-white dark:text-black">
          ✓
        </Checkbox.Indicator>
      </Checkbox.Root>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium text-gray-12 ${todo.completed ? 'line-through text-gray-6' : ''}`}
        >
          {todo.title}
        </p>
        {todo.description && <p className="mt-1 text-sm text-gray-6">{todo.description}</p>}
        {(todo.category || todo.dueDate) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-6">
            {todo.category && (
              <span className="rounded-full border border-gray-4 px-2 py-0.5">
                {categoryLabel(todo.category)}
              </span>
            )}
            {todo.dueDate && (
              <span className="rounded-full border border-gray-4 px-2 py-0.5">
                Due {todo.dueDate.slice(0, 10)}
              </span>
            )}
          </div>
        )}
      </div>

      <Menu.Root>
        <Menu.Trigger className="rounded p-1 text-gray-6 hover:bg-gray-1 hover:text-gray-12">
          ⋯
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner sideOffset={4} align="end">
            <Menu.Popup className="min-w-32 rounded-md border border-gray-3 bg-white py-1 shadow-lg">
              <Menu.Item
                onClick={() => onEdit(todo)}
                className="cursor-pointer px-3 py-1.5 text-sm text-black transition-colors hover:bg-blue-600 hover:text-white"
              >
                Edit
              </Menu.Item>
              <Menu.Item
                onClick={destroy}
                className="cursor-pointer px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-600 hover:text-white"
              >
                Delete
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </li>
  )
}
