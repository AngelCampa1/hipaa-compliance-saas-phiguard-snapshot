import { useEffect, useState } from 'react'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, InputPrimitive } from '@phiguard/ui'
import { createTaskFn, getTaskScopeFn } from '../server/tasks.js'
import { getClientErrorMessage } from '../lib/client-errors'
import { appPublicGuidanceCopy } from '../lib/help-content'
import { trackProductEvent } from '../lib/product-analytics-browser'
import { GuidanceCallout, InlineHelpLabel } from './help-guidance'

type Scope = Awaited<ReturnType<typeof getTaskScopeFn>>

type Props = {
  isOpen: boolean
  onClose: () => void
  prefillTitle?: string
  onCreated?: (taskId: string) => void
}

export function NewTaskModal({ isOpen, onClose, prefillTitle, onCreated }: Props) {
  const [scope, setScope] = useState<Scope | null>(null)
  const [scopeError, setScopeError] = useState<string | null>(null)
  const [title, setTitle] = useState(prefillTitle ?? '')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [dueAt, setDueAt] = useState('')
  const [locationId, setLocationId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load scope data when modal opens
  useEffect(() => {
    if (!isOpen) return
    setScopeError(null)
    getTaskScopeFn().then((s) => {
      setScope(s)
      setLocationId(s.defaultLocationId ?? '')
    }).catch((scopeLoadError) => {
      setScope(null)
      setScopeError(getClientErrorMessage(scopeLoadError, {
        route: '/app/tasks',
        operation: 'task.scope.load',
        fallbackMessage: 'Unable to load workspace permissions.',
      }))
    })
  }, [isOpen])

  // Sync prefillTitle when it changes
  useEffect(() => {
    setTitle(prefillTitle ?? '')
  }, [prefillTitle])

  const canWrite = scope?.canWrite ?? false
  const showLocationSelect = (scope?.locations.length ?? 0) > 1

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Task name is required.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const task = await createTaskFn({
        data: {
          title: title.trim(),
          priority,
          dueAt: dueAt ? new Date(`${dueAt}T00:00:00`).toISOString() : undefined,
          locationId: locationId || undefined,
        },
      })
      trackProductEvent('task_created', {
        route: '/app/tasks',
        priority,
      })
      setTitle('')
      setPriority('medium')
      setDueAt('')
      setLocationId('')
      onCreated?.(task.id)
      onClose()
    } catch (createError) {
      setError(getClientErrorMessage(createError, {
        route: '/app/tasks',
        operation: 'task.create',
        fallbackMessage: 'Could not create task. Please try again.',
      }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>

        {scopeError ? (
          <p className="text-sm text-danger-700">
            {scopeError}
          </p>
        ) : !scope ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : !canWrite ? (
          <p className="text-sm text-text-muted">
            You do not have permission to create tasks in this workspace.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
                {error}
              </div>
            )}

            <GuidanceCallout title="Keep task details safe" tone="warning">
              {appPublicGuidanceCopy.noPhiTaskWarning}
            </GuidanceCallout>

            <div>
              <InlineHelpLabel
                htmlFor="modal-task-title"
                label="Task name"
                help={appPublicGuidanceCopy.taskTitleHelp}
              />
              <span aria-hidden className="ml-1 text-text-danger">*</span>
              <InputPrimitive
                id="modal-task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1.5"
                autoFocus
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <InlineHelpLabel
                  htmlFor="modal-task-priority"
                  label="Priority"
                  help={appPublicGuidanceCopy.taskPriorityHelp}
                />
                <select
                  id="modal-task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as typeof priority)}
                  className="mt-1.5 w-full rounded-md border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-primary outline-none transition focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 focus-visible:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <InlineHelpLabel
                  htmlFor="modal-task-due"
                  label="Due date"
                  help={appPublicGuidanceCopy.taskDueDateHelp}
                />
                <InputPrimitive
                  id="modal-task-due"
                  type="date"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            {showLocationSelect && (
              <div>
                <InlineHelpLabel
                  htmlFor="modal-task-location"
                  label="Location"
                  help="Pick the clinic location that owns this task. This keeps reports and follow-up lists clean."
                />
                <select
                  id="modal-task-location"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-primary outline-none transition focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 focus-visible:border-transparent"
                >
                  <option value="">Select a location</option>
                  {scope?.locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={submitting || (showLocationSelect && !locationId)}
              >
                {submitting ? 'Adding…' : 'Add task'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
