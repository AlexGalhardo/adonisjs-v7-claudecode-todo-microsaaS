import { Dialog } from '@base-ui/react/dialog'
import type { Data } from '@generated/data'
import { router } from '@inertiajs/react'
import { type SubmitEvent, useState } from 'react'
import Button from '~/components/button'
import TextField from '~/components/text_field'
import { TODO_CATEGORIES } from '~/lib/todo_categories'

const TITLE_MIN = 4
const TITLE_MAX = 24
const DESCRIPTION_MIN = 4
const DESCRIPTION_MAX = 128

type TodoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  todo?: Data.Todo
}

export default function TodoDialog({ open, onOpenChange, todo }: TodoDialogProps) {
  const [title, setTitle] = useState(todo?.title ?? '')
  const [hasDescription, setHasDescription] = useState(!!todo?.description)
  const [description, setDescription] = useState(todo?.description ?? '')
  const [category, setCategory] = useState(todo?.category ?? '')
  const [dueDate, setDueDate] = useState(todo?.dueDate ? todo.dueDate.slice(0, 10) : '')
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setProcessing(true)

    const payload = {
      title,
      description: hasDescription ? description : null,
      category: category || null,
      dueDate: dueDate || null,
    }
    const options = {
      onSuccess: () => onOpenChange(false),
      onError: (formErrors: Record<string, string>) => setErrors(formErrors),
      onFinish: () => setProcessing(false),
    }

    if (todo) {
      router.put(`/todos/${todo.id}`, payload, options)
    } else {
      router.post('/todos', payload, options)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/30" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-3 bg-gray-1 p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-gray-12">
            {todo ? 'Edit todo' : 'New todo'}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <TextField
              label="Title"
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value.toUpperCase())}
              minLength={TITLE_MIN}
              maxLength={TITLE_MAX}
              error={errors.title}
              autoFocus
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-12">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required={!todo}
                  className="h-10 w-full rounded-md border border-gray-4 bg-white px-3 text-sm text-black outline-none focus:border-gray-8"
                >
                  {todo ? (
                    <option value="">No category</option>
                  ) : (
                    <option value="" disabled>
                      Select a category
                    </option>
                  )}
                  {TODO_CATEGORIES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm font-medium text-red-500">{errors.category}</p>
                )}
              </div>

              <div>
                <label htmlFor="dueDate" className="mb-1 block text-sm font-medium text-gray-12">
                  Due date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="h-10 w-full rounded-md border border-gray-4 bg-white px-3 text-sm text-black outline-none focus:border-gray-8"
                />
                {errors.dueDate && (
                  <p className="mt-1 text-sm font-medium text-red-500">{errors.dueDate}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="hasDescription"
                className="mb-1 block text-sm font-medium text-gray-12"
              >
                Add a description?
              </label>
              <select
                id="hasDescription"
                value={hasDescription ? 'yes' : 'no'}
                onChange={(event) => setHasDescription(event.target.value === 'yes')}
                className="h-10 w-full rounded-md border border-gray-4 bg-white px-3 text-sm text-black outline-none focus:border-gray-8"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            {hasDescription && (
              <div>
                <label
                  htmlFor="description"
                  className="mb-1 block text-sm font-medium text-gray-12"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value.toUpperCase())}
                  rows={3}
                  minLength={DESCRIPTION_MIN}
                  maxLength={DESCRIPTION_MAX}
                  className="w-full rounded-md border border-gray-4 px-4 py-2 text-sm text-gray-12 outline-none focus:border-gray-8"
                />
                <div className="mt-1 flex items-center justify-between">
                  {errors.description ? (
                    <p className="text-sm font-medium text-red-500">{errors.description}</p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-gray-6">
                    {description.length}/{DESCRIPTION_MAX} characters
                  </span>
                </div>
              </div>
            )}

            <div className="mt-2 flex justify-end gap-3">
              <Dialog.Close render={<Button type="button" variant="secondary" />}>
                Cancel
              </Dialog.Close>
              <Button type="submit" disabled={processing}>
                {todo ? 'Save' : 'Create'}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
