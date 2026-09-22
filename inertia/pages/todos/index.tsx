import { useState } from 'react'
import { type Data } from '@generated/data'
import Button from '~/components/button'
import TodoItem from '~/components/todo_item'
import TodoDialog from '~/components/todo_dialog'

export default function TodosIndex({ todos }: { todos: Data.Todo[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Data.Todo | undefined>(undefined)
  // Bumped on every open so TodoDialog remounts with fresh field state,
  // even when re-opening the same "new todo" or the same todo to edit.
  const [dialogKey, setDialogKey] = useState(0)

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

  return (
    <div className="py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-12">Your todos</h1>
        <Button onClick={openCreateDialog}>New todo</Button>
      </div>

      {todos.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-4 py-16 text-center text-gray-6">
          No todos yet — create your first one.
        </p>
      ) : (
        <ul className="rounded-md border border-gray-3 px-4">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onEdit={openEditDialog} />
          ))}
        </ul>
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
