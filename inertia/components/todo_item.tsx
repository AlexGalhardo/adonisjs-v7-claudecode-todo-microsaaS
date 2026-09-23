import { Checkbox } from '@base-ui/react/checkbox'
import { Dialog } from '@base-ui/react/dialog'
import type { Data } from '@generated/data'
import { router } from '@inertiajs/react'
import { useState } from 'react'
import Button from '~/components/button'
import { PencilIcon, TrashIcon } from '~/components/icons'
import { categoryLabel } from '~/lib/todo_categories'

type TodoItemProps = {
  todo: Data.Todo
  onEdit: (todo: Data.Todo) => void
}

export default function TodoItem({ todo, onEdit }: TodoItemProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function toggleCompleted() {
    router.put(`/todos/${todo.id}`, { completed: !todo.completed }, { preserveScroll: true })
  }

  function destroy() {
    router.delete(`/todos/${todo.id}`, {
      preserveScroll: true,
      onFinish: () => setConfirmingDelete(false),
    })
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

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Edit todo"
          onClick={() => onEdit(todo)}
          className="rounded p-1.5 text-gray-6 hover:bg-gray-1 hover:text-gray-12"
        >
          <PencilIcon width={16} height={16} />
        </button>
        <button
          type="button"
          aria-label="Delete todo"
          onClick={() => setConfirmingDelete(true)}
          className="rounded p-1.5 text-gray-6 hover:bg-red-50 hover:text-red-600"
        >
          <TrashIcon width={16} height={16} />
        </button>
      </div>

      <Dialog.Root open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/30" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-3 bg-gray-1 p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-gray-12">Delete todo</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-6">
              Are you sure you want to delete "{todo.title}"? This can't be undone.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close render={<Button type="button" variant="secondary" />}>
                Cancel
              </Dialog.Close>
              <Button type="button" variant="danger" onClick={destroy}>
                Delete
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </li>
  )
}
