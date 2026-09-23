import { Dialog } from '@base-ui/react/dialog'
import type { Data } from '@generated/data'
import { router } from '@inertiajs/react'
import { type SubmitEvent, useState } from 'react'
import Button from '~/components/button'
import TextField from '~/components/text_field'

type TodoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  todo?: Data.Todo
}

export default function TodoDialog({ open, onOpenChange, todo }: TodoDialogProps) {
  const [title, setTitle] = useState(todo?.title ?? '')
  const [description, setDescription] = useState(todo?.description ?? '')
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({})

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setProcessing(true)

    const payload = { title, description: description || null }
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
        <Dialog.Popup className="fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-3 bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-gray-12">
            {todo ? 'Edit todo' : 'New todo'}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <TextField
              label="Title"
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              error={errors.title}
              autoFocus
            />

            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-12">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-4 px-4 py-2 text-sm text-gray-12 outline-none focus:border-gray-8"
              />
              {errors.description && (
                <p className="mt-1 text-sm font-medium text-red-500">{errors.description}</p>
              )}
            </div>

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
