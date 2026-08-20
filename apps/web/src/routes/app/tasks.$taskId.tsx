import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import {
  getTaskFn,
  getTaskScopeFn,
  updateStatusFn,
  updateDueAtFn,
  addCommentFn,
  assignTaskFn,
  presignUploadFn,
  completeUploadFn,
  downloadTaskAttachmentFn,
  listTaskAttachmentsFn,
  listTaskActivityFn,
  listTaskCommentsFn,
  updateTaskFn,
  archiveTaskFn,
} from '../../server/tasks.js'
import { CREATE_ONLY_UPLOAD_HEADERS } from '../../lib/s3.js'
import { getMembersAndInvitationsFn } from '../../server/organizations.js'
import type { Task, TaskAttachment, TaskComment } from '@phiguard/db/tasks'
import {
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  PageHeader,
  Panel,
  PanelHeader,
  SummaryMetric,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@phiguard/ui'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  Paperclip,
  Pencil,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'
import { formatDate, formatDateTime } from '../../lib/dates'
import { trackProductEvent } from '../../lib/product-analytics-browser'
import { getClientErrorMessage } from '../../lib/client-errors'
import {
  STATUS_BADGE,
  PRIORITY_BADGE,
  formatStatusLabel,
  getDueState,
  friendlyMimeLabel,
  AV_STATUS_HELP,
} from '../../lib/task-display.js'
import { humanFileSize } from '../../lib/format.js'
import { appPublicGuidanceCopy } from '../../lib/help-content'
import { AppRouteErrorBoundary } from '../../components/compliance-error-boundary'

export const Route = createFileRoute('/app/tasks/$taskId')({
  validateSearch: (search: Record<string, unknown>) => ({
    locationId: (search.locationId as string | undefined) ?? undefined,
    status: (search.status as string | undefined) ?? undefined,
  }),
  beforeLoad: async ({ params }) => {
    const [task, scope, membersResult, activity, comments, attachments] = await Promise.all([
      getTaskFn({ data: { taskId: params.taskId } }),
      getTaskScopeFn(),
      getMembersAndInvitationsFn()
        .then((membersState) => ({ membersState, membersLoadFailed: false }))
        .catch(() => ({ membersState: null, membersLoadFailed: true })),
      listTaskActivityFn({ data: { taskId: params.taskId } }),
      listTaskCommentsFn({ data: { taskId: params.taskId } }),
      listTaskAttachmentsFn({ data: { taskId: params.taskId } }),
    ])
    return {
      task,
      scope,
      membersState: membersResult.membersState,
      membersLoadFailed: membersResult.membersLoadFailed,
      activity,
      comments,
      attachments,
    }
  },
  component: TaskDetailPage,
  errorComponent: AppRouteErrorBoundary,
})

const STATUS_OPTIONS = ['open', 'in_progress', 'blocked', 'done'] as const
type TaskStatus = (typeof STATUS_OPTIONS)[number]

const ACTIVITY_LABELS: Record<string, string> = {
  'task.created': 'Task created',
  'task.status_updated': 'Status updated',
  'task.assigned': 'Assigned to member',
  'task.comment.added': 'Comment added',
  'task.attachment.uploaded': 'Attachment uploaded',
  'task.attachment.scan_completed': 'Attachment scan completed',
  'task.updated': 'Task details updated',
  'task.archived': 'Task archived',
}

const ATTACHMENT_SCAN_BADGE: Record<
  TaskAttachment['avStatus'],
  { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }
> = {
  pending: { label: 'Scan pending', variant: 'warning' },
  clean: { label: 'Clean', variant: 'success' },
  infected: { label: 'Blocked', variant: 'danger' },
  skipped: { label: 'Not scanned', variant: 'default' },
}

function parseJsonField(value: string | null): Record<string, string> | null {
  if (!value) return null
  try {
    return JSON.parse(value) as Record<string, string>
  } catch {
    return null
  }
}

function activityLabel(action: string, after: Record<string, string> | null): string {
  if (action === 'task.status_updated' && after?.status) {
    return `Status changed to ${formatStatusLabel(after.status)}`
  }
  return (
    ACTIVITY_LABELS[action] ?? action.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

function statusIcon(status: string) {
  if (status === 'done') return <CheckCircle2 className="h-4 w-4 text-success-800" />
  if (status === 'blocked') return <AlertCircle className="h-4 w-4 text-danger-800" />
  return <Clock className="h-4 w-4 text-text-muted" />
}

type MemberOption = { userId: string; name: string; email: string }

function formatDateTimeLocalValue(dueAt: Date | string | null | undefined) {
  if (!dueAt) return ''

  const date = new Date(dueAt)
  if (Number.isNaN(date.getTime())) return ''

  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16)
}

const MAX_POLL_INTERVAL_MS = 8_000

function TaskDetailPage() {
  const router = useRouter()
  const {
    task: initialTask,
    scope,
    membersState,
    membersLoadFailed,
    activity,
    comments: initialComments,
    attachments: initialAttachments,
  } = Route.useRouteContext()
  const { locationId, status } = Route.useSearch()
  const canWrite = scope.canWrite
  const [task, setTask] = useState<Task>(initialTask)
  const [commentBody, setCommentBody] = useState('')
  const [comments, setComments] = useState<TaskComment[]>(initialComments ?? [])
  const [activityEvents, setActivityEvents] = useState<typeof activity>(activity)
  const [attachments, setAttachments] = useState<TaskAttachment[]>(initialAttachments ?? [])
  const [error, setError] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [pendingDoneStatus, setPendingDoneStatus] = useState<boolean>(false)
  const [dueAtValue, setDueAtValue] = useState(formatDateTimeLocalValue(initialTask.dueAt))
  const [dueAtDirty, setDueAtDirty] = useState(false)
  const [dueUpdating, setDueUpdating] = useState(false)
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState<string | null>(null)
  const [refreshingAttachments, setRefreshingAttachments] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollIntervalRef = useRef<number>(1_000)

  const [editOpen, setEditOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description ?? '')
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const memberOptions: MemberOption[] = (membersState?.organization?.members ?? []).map(
    (m: { userId: string; user?: { name?: string | null; email?: string | null } }) => ({
      userId: m.userId,
      name: m.user?.name || m.user?.email || m.userId,
      email: m.user?.email ?? '',
    }),
  )

  const [assigneeId, setAssigneeId] = useState<string>(initialTask.assigneeId ?? '')
  const [currentAssigneeId, setCurrentAssigneeId] = useState<string | null>(
    initialTask.assigneeId ?? null,
  )

  useEffect(() => {
    setTask(initialTask)
    setComments(initialComments ?? [])
    setActivityEvents(activity)
    setAttachments(initialAttachments ?? [])
    setAssigneeId(initialTask.assigneeId ?? '')
    setCurrentAssigneeId(initialTask.assigneeId ?? null)
    setDueAtValue(formatDateTimeLocalValue(initialTask.dueAt))
    setDueAtDirty(false)
    setError(null)
  }, [initialTask, initialComments, initialAttachments, activity])

  // The Activity timeline is server-rendered in beforeLoad. After any mutation
  // that records an audit event (status, due date, assignee, comment, upload,
  // edit), refetch it so the on-page trail reflects the change without a manual
  // reload. Non-fatal: a failed refresh leaves the prior trail in place.
  async function refreshActivity() {
    try {
      const next = await listTaskActivityFn({ data: { taskId: task.id } })
      setActivityEvents(next)
    } catch {
      // Activity refresh is best-effort; the mutation itself already succeeded.
    }
  }

  useEffect(() => {
    const hasPending = attachments.some((a) => a.avStatus === 'pending')
    if (!hasPending) {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current)
        pollTimerRef.current = null
      }
      pollIntervalRef.current = 1_000
      return
    }

    function schedulePoll() {
      pollTimerRef.current = setTimeout(async () => {
        try {
          const refreshed = await listTaskAttachmentsFn({
            data: { taskId: task.id },
          })
          setAttachments(refreshed)
          const stillPending = refreshed.some((a) => a.avStatus === 'pending')
          if (stillPending) {
            pollIntervalRef.current = Math.min(pollIntervalRef.current * 2, MAX_POLL_INTERVAL_MS)
            schedulePoll()
          } else {
            pollIntervalRef.current = 1_000
          }
        } catch {
          // Stop polling silently on error
        }
      }, pollIntervalRef.current)
    }

    schedulePoll()

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current)
    }
  }, [attachments, task.id])

  const locationName =
    scope.locations.find((location) => location.id === task.locationId)?.name ?? task.locationId
  const assigneeName = currentAssigneeId
    ? (memberOptions.find((m) => m.userId === currentAssigneeId)?.name ?? currentAssigneeId)
    : 'Unassigned'
  const dueState = getDueState(task.dueAt)
  const nextAction = !canWrite
    ? 'Review the task details and activity history.'
    : task.status === 'blocked'
      ? 'Document what is blocking this task, then update the status when the blocker clears.'
      : task.status === 'done'
        ? 'Review the activity trail for the completed task.'
        : dueState === 'overdue'
          ? 'Update the status or add a comment explaining the overdue item.'
          : 'Move the task to the next status or add a clear progress comment.'

  async function handleStatusChange(nextStatus: TaskStatus) {
    setStatusUpdating(true)
    setError(null)
    try {
      const updated = await updateStatusFn({
        data: { taskId: task.id, status: nextStatus },
      })
      setTask(updated)
      void refreshActivity()
      trackProductEvent('task_status_changed', {
        route: '/app/tasks/$taskId',
        status: nextStatus,
        priority: task.priority,
      })
      if (nextStatus === 'done') {
        trackProductEvent('task_completed', {
          route: '/app/tasks',
          status: nextStatus,
          priority: task.priority,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.')
    } finally {
      setStatusUpdating(false)
      setPendingDoneStatus(false)
    }
  }

  async function handleDueAtUpdate(e: React.FormEvent) {
    e.preventDefault()
    setDueUpdating(true)
    setError(null)
    try {
      const updated = await updateDueAtFn({
        data: {
          taskId: task.id,
          dueAt: dueAtValue ? new Date(dueAtValue).toISOString() : null,
        },
      })
      setTask(updated)
      setDueAtValue(formatDateTimeLocalValue(updated.dueAt))
      setDueAtDirty(false)
      void refreshActivity()
      trackProductEvent('task_due_date_updated', {
        route: '/app/tasks/$taskId',
        action: dueAtValue ? 'set' : 'clear',
      })
    } catch (err) {
      setError(
        getClientErrorMessage(err, {
          route: '/app/tasks/$taskId',
          operation: 'task.due_date.update',
          fallbackMessage: 'Failed to update due date.',
        }),
      )
    } finally {
      setDueUpdating(false)
    }
  }

  async function handleClearDueAt() {
    setDueAtValue('')
    setDueAtDirty(false)
    setDueUpdating(true)
    setError(null)
    try {
      const updated = await updateDueAtFn({
        data: { taskId: task.id, dueAt: null },
      })
      setTask(updated)
      void refreshActivity()
      trackProductEvent('task_due_date_updated', {
        route: '/app/tasks/$taskId',
        action: 'clear',
      })
    } catch (err) {
      setError(
        getClientErrorMessage(err, {
          route: '/app/tasks/$taskId',
          operation: 'task.due_date.update',
          fallbackMessage: 'Failed to clear due date.',
        }),
      )
    } finally {
      setDueUpdating(false)
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentBody.trim()) return
    setCommentSubmitting(true)
    setError(null)
    try {
      const comment = await addCommentFn({
        data: { taskId: task.id, body: commentBody.trim() },
      })
      setComments((prev) => [...prev, comment])
      setCommentBody('')
      void refreshActivity()
      trackProductEvent('task_comment_added', {
        route: '/app/tasks',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment.')
    } finally {
      setCommentSubmitting(false)
    }
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!assigneeId) return
    setAssigning(true)
    setError(null)
    try {
      await assignTaskFn({ data: { taskId: task.id, userId: assigneeId } })
      setCurrentAssigneeId(assigneeId)
      void refreshActivity()
      trackProductEvent('task_assigned', {
        route: '/app/tasks',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign task.')
    } finally {
      setAssigning(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const { uploadUrl, key } = await presignUploadFn({
        data: {
          taskId: task.id,
          filename: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        },
      })

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type, ...CREATE_ONLY_UPLOAD_HEADERS },
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed.')
      }

      const attachment = await completeUploadFn({
        data: {
          taskId: task.id,
          s3Key: key,
          contentType: file.type,
          sizeBytes: file.size,
        },
      })

      setAttachments((prev) => [...prev, attachment])
      pollIntervalRef.current = 1_000
      void refreshActivity()
      trackProductEvent('task_attachment_added', {
        route: '/app/tasks',
      })
    } catch (err) {
      setError(
        getClientErrorMessage(err, {
          route: '/app/tasks/$taskId',
          operation: 'task.attachment.upload',
          fallbackMessage: 'Failed to upload attachment.',
        }),
      )
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleAttachmentDownload(attachmentId: string) {
    setDownloadingAttachmentId(attachmentId)
    setError(null)
    try {
      const { downloadUrl } = await downloadTaskAttachmentFn({
        data: { taskId: task.id, attachmentId },
      })
      window.location.assign(downloadUrl)
    } catch (err) {
      setError(
        getClientErrorMessage(err, {
          route: '/app/tasks/$taskId',
          operation: 'task.attachment.download',
          fallbackMessage: 'Failed to download attachment.',
        }),
      )
    } finally {
      setDownloadingAttachmentId(null)
    }
  }

  async function handleRefreshAttachments() {
    setRefreshingAttachments(true)
    setError(null)
    try {
      const refreshed = await listTaskAttachmentsFn({
        data: { taskId: task.id },
      })
      setAttachments(refreshed)
    } catch (err) {
      setError(
        getClientErrorMessage(err, {
          route: '/app/tasks/$taskId',
          operation: 'task.attachment.refresh',
          fallbackMessage: 'Failed to refresh attachment status.',
        }),
      )
    } finally {
      setRefreshingAttachments(false)
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editTitle.trim()) return
    setEditSubmitting(true)
    setError(null)
    try {
      const updated = await updateTaskFn({
        data: {
          taskId: task.id,
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          priority: editPriority as 'low' | 'medium' | 'high' | 'urgent',
        },
      })
      setTask(updated)
      setEditOpen(false)
      void refreshActivity()
      trackProductEvent('task_updated', {
        route: '/app/tasks/$taskId',
        priority: editPriority,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task.')
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleArchive() {
    setArchiving(true)
    setError(null)
    try {
      await archiveTaskFn({ data: { taskId: task.id } })
      trackProductEvent('task_archived', {
        route: '/app/tasks/$taskId',
        status: task.status,
        priority: task.priority,
      })
      await router.invalidate()
      void router.navigate({
        to: '/app/tasks',
        search: {
          status,
          locationId,
          sort: undefined,
          sortDir: undefined,
          page: undefined,
          pageSize: undefined,
          assigneeId: undefined,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive task.')
      setArchiving(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto">
        <Link
          to="/app/tasks"
          search={{
            status,
            locationId,
            sort: undefined,
            sortDir: undefined,
            page: undefined,
            pageSize: undefined,
            assigneeId: undefined,
          }}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tasks
        </Link>

        {error && (
          <Alert tone="danger" className="mb-4" title="Task update failed">
            {error}
          </Alert>
        )}

        <PageHeader
          title={task.title}
          description={`Location: ${locationName}`}
          actions={
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Badge variant={STATUS_BADGE[task.status] ?? 'default'}>
                {formatStatusLabel(task.status)}
              </Badge>
              <Badge variant={PRIORITY_BADGE[task.priority] ?? 'default'}>{task.priority}</Badge>
              {canWrite && (
                <>
                  <Dialog
                    open={editOpen}
                    onOpenChange={(open) => {
                      setEditOpen(open)
                      if (open) {
                        setEditTitle(task.title)
                        setEditDescription(task.description ?? '')
                        setEditPriority(task.priority)
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                        Edit task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit task</DialogTitle>
                        <DialogDescription>
                          Update the title, description, or priority.
                        </DialogDescription>
                      </DialogHeader>
                      <form id="edit-task-form" onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="edit-title">
                            Title{' '}
                            <span aria-hidden="true" className="text-danger-600">
                              *
                            </span>
                          </Label>
                          <input
                            id="edit-title"
                            type="text"
                            required
                            aria-required="true"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full rounded-md border border-border-default bg-surface-0 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="edit-priority">Priority</Label>
                          <select
                            id="edit-priority"
                            value={editPriority}
                            onChange={(e) =>
                              setEditPriority(
                                e.target.value as 'low' | 'medium' | 'high' | 'urgent',
                              )
                            }
                            className="w-full rounded-md border border-border-default bg-surface-0 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </form>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline" type="button">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          form="edit-task-form"
                          disabled={editSubmitting || !editTitle.trim()}
                        >
                          {editSubmitting ? 'Saving...' : 'Save changes'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={archiving}>
                        {archiving ? 'Archiving...' : 'Archive'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Archive this task?</AlertDialogTitle>
                        <AlertDialogDescription>
                          The task will be hidden from the default list. The full audit trail is
                          kept. You cannot undo this from the app.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => void handleArchive()}
                          className="bg-danger-600 hover:bg-danger-700 text-white"
                        >
                          Archive task
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          }
        />

        <div className="mb-6 space-y-4">
          {/* No meta strip: location is in the PageHeader description; status, priority, and due
              date are surfaced in the Task summary metrics below. Kept out to avoid duplication. */}

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Task summary">
            <SummaryMetric
              label="Status"
              value={formatStatusLabel(task.status)}
              detail={
                task.status === 'blocked' ? 'Blocked. Needs attention.' : 'Current status'
              }
              tone={
                task.status === 'blocked' ? 'danger' : task.status === 'done' ? 'success' : 'brand'
              }
            />
            <SummaryMetric
              label="Priority"
              value={task.priority}
              detail={
                task.priority === 'urgent'
                  ? 'Do this before other work'
                  : 'Task priority'
              }
              tone={
                task.priority === 'urgent'
                  ? 'danger'
                  : task.priority === 'high'
                    ? 'warning'
                    : 'neutral'
              }
            />
            <SummaryMetric
              label="Due"
              value={
                task.dueAt
                  ? formatDate(task.dueAt, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'No date'
              }
              detail={
                dueState === 'overdue'
                  ? 'Overdue'
                  : dueState === 'due-soon'
                    ? 'Due within 7 days'
                    : 'Deadline'
              }
              tone={
                dueState === 'overdue' ? 'danger' : dueState === 'due-soon' ? 'warning' : 'neutral'
              }
            />
            <SummaryMetric
              label="Assignee"
              value={assigneeName}
              detail="Current owner"
              tone={currentAssigneeId ? 'neutral' : 'warning'}
            />
          </section>
          <Alert
            tone={task.status === 'blocked' || dueState === 'overdue' ? 'warning' : 'info'}
            title="Next action"
          >
            {nextAction}
          </Alert>
          {!canWrite && (
            <p className="mt-2 text-sm text-text-muted">
              Read-only access. You cannot change status, assign, comment, or upload attachments.
            </p>
          )}
        </div>

        {task.description && (
          <Panel className="mb-6">
            <PanelHeader title="Description" />
            <p className="whitespace-pre-wrap break-words text-sm text-text-primary">
              {task.description}
            </p>
          </Panel>
        )}

        {canWrite ? (
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Panel>
              <PanelHeader title="Status" />
              <Label htmlFor="task-status" className="sr-only">
                Task status
              </Label>
              <AlertDialog open={pendingDoneStatus} onOpenChange={setPendingDoneStatus}>
                <select
                  id="task-status"
                  value={task.status}
                  onChange={(e) => {
                    const next = e.target.value as TaskStatus
                    if (next === 'done') {
                      setPendingDoneStatus(true)
                    } else {
                      void handleStatusChange(next)
                    }
                  }}
                  disabled={statusUpdating}
                  className="w-full rounded-md border border-border-default bg-surface-0 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {formatStatusLabel(s)}
                    </option>
                  ))}
                </select>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mark task as done?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This records a completion event in the audit trail. Completed tasks stay on
                      record.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => void handleStatusChange('done')}>
                      Mark as done
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Panel>

            <Panel>
              <PanelHeader title="Due date" />
              <form onSubmit={handleDueAtUpdate} className="space-y-3">
                <Label htmlFor="task-dueAt" className="sr-only">
                  Due date
                </Label>
                <input
                  id="task-dueAt"
                  type="datetime-local"
                  value={dueAtValue}
                  onChange={(e) => {
                    setDueAtValue(e.target.value)
                    setDueAtDirty(true)
                  }}
                  disabled={dueUpdating}
                  className="w-full rounded-md border border-border-default bg-surface-0 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:opacity-50"
                />
                {dueAtDirty && <p className="text-xs text-warning-700">Unsaved changes</p>}
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" variant="outline" disabled={dueUpdating}>
                    {dueUpdating ? 'Saving...' : 'Save due date'}
                  </Button>
                  {task.dueAt && (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={dueUpdating}
                      onClick={() => void handleClearDueAt()}
                    >
                      Clear due date
                    </Button>
                  )}
                </div>
              </form>
            </Panel>

            <Panel>
              <PanelHeader title="Assignee" description={`Currently: ${assigneeName}`} />
              {membersLoadFailed ? (
                <Alert tone="warning" className="mb-3" title="Could not load team members">
                  Assignment is off until the member list loads. Refresh the page and try again.
                </Alert>
              ) : null}
              <form onSubmit={handleAssign} className="flex flex-col gap-2 sm:flex-row min-w-0">
                <Label htmlFor="task-assignee" className="sr-only">
                  Assignee
                </Label>
                <select
                  id="task-assignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  disabled={membersLoadFailed}
                  className="flex-1 min-w-0 rounded-md border border-border-default bg-surface-0 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  <option value="">
                    {membersLoadFailed ? 'Unable to load members' : 'Select a member...'}
                  </option>
                  {memberOptions.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.name}
                      {member.email && member.email !== member.name ? ` (${member.email})` : ''}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={
                    assigning ||
                    membersLoadFailed ||
                    !assigneeId ||
                    assigneeId === currentAssigneeId
                  }
                >
                  {assigning ? 'Assigning...' : 'Assign'}
                </Button>
              </form>
            </Panel>
          </section>
        ) : null}

        <section className="mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Activity</h2>
          <Card>
            <CardContent className="p-6">
              {activityEvents.length === 0 ? (
                <p className="text-sm text-text-muted">No activity recorded yet.</p>
              ) : (
                <ol className="relative space-y-4 border-l border-border-muted pl-6">
                  {activityEvents.map((event) => {
                    const after = parseJsonField(event.after)
                    return (
                      <li key={event.id} className="relative">
                        <span className="absolute -left-8 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface-100">
                          {statusIcon(after?.status ?? '')}
                        </span>
                        <p className="text-sm text-text-primary">
                          {activityLabel(event.action, after)}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatDateTime(event.createdAt)}
                        </p>
                      </li>
                    )
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Comments</h2>

          {comments.length === 0 ? (
            <p className="text-sm text-text-muted mb-4">No comments yet.</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {comments.map((c) => {
                const author = memberOptions.find((m) => m.userId === c.authorId)
                const authorLabel = author ? author.name || author.email : 'Unknown'
                return (
                  <li key={c.id}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-medium text-text-primary">
                            {authorLabel}
                          </span>
                          <span className="text-xs text-text-muted">{formatDate(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-text-primary whitespace-pre-wrap">{c.body}</p>
                      </CardContent>
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}

          {canWrite ? (
            <form onSubmit={handleAddComment} className="space-y-2">
              <Label htmlFor="comment-body" className="sr-only">
                Add a comment
              </Label>
              <Textarea
                id="comment-body"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
              />
              <p className="mt-1 flex items-center gap-1 text-xs text-phi-warn-text">
                <ShieldAlert className="h-3 w-3" />
                {appPublicGuidanceCopy.commentNoPhiWarning}
              </p>
              <div>
                <Button type="submit" disabled={commentSubmitting || !commentBody.trim()}>
                  {commentSubmitting ? 'Adding...' : 'Add comment'}
                </Button>
              </div>
            </form>
          ) : null}
        </section>

        <section className="mb-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-text-primary">Attachments</h2>
            {attachments.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void handleRefreshAttachments()}
                disabled={refreshingAttachments}
              >
                <RefreshCw className="h-4 w-4" />
                {refreshingAttachments ? 'Refreshing...' : 'Refresh scan status'}
              </Button>
            )}
          </div>

          {attachments.length === 0 ? (
            <p className="text-sm text-text-muted mb-3">No attachments yet.</p>
          ) : (
            <ul className="space-y-2 mb-3">
              {attachments.map((a) => {
                const scanInfo = ATTACHMENT_SCAN_BADGE[a.avStatus]
                const avHelp = AV_STATUS_HELP[a.avStatus]
                const filename = a.s3Key.split('/').pop() ?? a.s3Key
                const mimeLabel = friendlyMimeLabel(a.contentType)
                const sizeLabel = humanFileSize(a.sizeBytes)
                return (
                  <li key={a.id} data-attachment-id={a.id}>
                    <Card>
                      <CardContent className="p-3 text-sm text-text-primary">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <Paperclip
                            className="h-4 w-4 shrink-0 text-text-muted"
                            aria-hidden="true"
                          />
                          <span className="truncate min-w-0 flex-1">{filename}</span>
                          <div className="flex items-center gap-1">
                            <Badge variant={scanInfo.variant}>{scanInfo.label}</Badge>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  aria-label={`Scan status info: ${scanInfo.label}`}
                                  className="text-text-muted hover:text-text-primary focus:outline-none"
                                >
                                  <HelpCircle className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top">{avHelp}</TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="shrink-0 text-xs text-text-muted">
                            {mimeLabel} &middot; {sizeLabel}
                          </span>
                          {a.avStatus === 'clean' ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void handleAttachmentDownload(a.id)}
                              disabled={downloadingAttachmentId === a.id}
                            >
                              {downloadingAttachmentId === a.id
                                ? 'Preparing...'
                                : 'Download attachment'}
                            </Button>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}

          {canWrite ? (
            <>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="h-4 w-4" />
                Upload attachment
              </Button>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </>
          ) : null}
        </section>
      </div>
    </TooltipProvider>
  )
}
