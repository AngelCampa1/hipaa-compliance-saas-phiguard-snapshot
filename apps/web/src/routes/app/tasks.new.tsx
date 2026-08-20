import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  Alert,
  Button,
  InputPrimitive,
  PageHeader,
  Panel,
  SummaryMetric,
  TextareaPrimitive,
} from "@phiguard/ui";
import { getClientErrorMessage } from "../../lib/client-errors";
import { trackProductEvent } from "../../lib/product-analytics-browser";
import { createTaskFn, getTaskScopeFn } from "../../server/tasks.js";
import {
  GuidanceCallout,
  InlineHelpLabel,
} from "../../components/help-guidance";
import { appPublicGuidanceCopy } from "../../lib/help-content";
import { AppRouteErrorBoundary } from "../../components/compliance-error-boundary";

export const Route = createFileRoute("/app/tasks/new")({
  beforeLoad: async () => {
    const scope = await getTaskScopeFn();
    return { scope };
  },
  component: NewTaskPage,
  errorComponent: AppRouteErrorBoundary,
});

function NewTaskPage() {
  const { scope } = Route.useRouteContext();
  const navigate = useNavigate();
  const router = useRouter();
  const isReadOnly = !scope.canWrite;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");
  const [dueAt, setDueAt] = useState("");
  const [locationId, setLocationId] = useState(scope.defaultLocationId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const task = await createTaskFn({
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
          locationId: locationId || undefined,
        },
      });

      if (!task?.id) {
        throw new Error("Task created without an id.");
      }

      trackProductEvent("task_created", {
        route: "/app/tasks/new",
        priority,
      });

      await router.invalidate();
      await navigate({
        to: "/app/tasks/$taskId",
        params: { taskId: task.id },
        search: { locationId: locationId || undefined, status: undefined, sort: undefined, sortDir: undefined, page: undefined, pageSize: undefined, assigneeId: undefined },
      });
    } catch (err) {
      setError(
        getClientErrorMessage(err, {
          route: "/app/tasks/new",
          operation: "task.create",
          fallbackMessage: "Failed to create task.",
        }),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedLocationName =
    scope.locations.find((location) => location.id === locationId)?.name ??
    "No location selected";
  const selectedDueLabel = dueAt
    ? new Date(dueAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No due date";
  const selectClass =
    "min-w-0 rounded-md border border-border-strong bg-background p-2 text-sm text-text-primary";

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="New task"
        description="Add one follow-up item for your clinic."
      />

      {isReadOnly ? (
        <>
          <Alert tone="info" title="Read-only access">
            You cannot create tasks in this workspace.
          </Alert>
          <Link
            to="/app/tasks"
            search={{ status: undefined, locationId: undefined, sort: undefined, sortDir: undefined, page: undefined, pageSize: undefined, assigneeId: undefined }}
            className="mt-4 inline-block text-text-link"
          >
            Back to tasks
          </Link>
        </>
      ) : null}

      {error && (
        <Alert tone="danger" className="mb-4" title="Task was not created">
          {error}
        </Alert>
      )}

      {!isReadOnly ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <section
            className="grid gap-3 sm:grid-cols-3"
            aria-label="Task draft summary"
          >
            <SummaryMetric
              label="Priority"
              value={priority}
              detail="Use urgent only for real risk or a hard deadline"
              tone={
                priority === "urgent"
                  ? "danger"
                  : priority === "high"
                    ? "warning"
                    : "neutral"
              }
            />
            <SummaryMetric
              label="Due"
              value={selectedDueLabel}
              detail="Optional deadline"
              tone={dueAt ? "warning" : "neutral"}
            />
            <SummaryMetric
              label="Location"
              value={selectedLocationName}
              detail="Reporting owner"
              tone={
                scope.locations.length > 1 && !locationId
                  ? "warning"
                  : "neutral"
              }
            />
          </section>

          <Alert tone="info" title="Next action">
            Add a short title, then choose a location before creating the task.
          </Alert>

          <GuidanceCallout title="Write this for a teammate" tone="warning">
            {appPublicGuidanceCopy.noPhiTaskWarning}
          </GuidanceCallout>

          <Panel>
            {scope.locations.length > 1 && (
              <div className="mb-4 min-w-0">
                <InlineHelpLabel
                  htmlFor="location"
                  label="Location"
                  help="Pick the clinic location that owns this task so reports stay accurate."
                />
                <select
                  id="location"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className={`${selectClass} w-full sm:max-w-sm`}
                >
                  <option value="">Select a location</option>
                  {scope.locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4 min-w-0">
              <InlineHelpLabel
                  htmlFor="title"
                  label="Title"
                  help={appPublicGuidanceCopy.taskTitleHelp}
              />
              <span aria-hidden className="ml-1 text-text-danger">
                *
              </span>
              <InputPrimitive
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-4 min-w-0">
              <InlineHelpLabel
                htmlFor="description"
                label="Description"
                help={appPublicGuidanceCopy.taskDescriptionHelp}
              />
              <TextareaPrimitive
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="mb-4 min-w-0">
              <InlineHelpLabel
                htmlFor="priority"
                label="Priority"
                help={appPublicGuidanceCopy.taskPriorityHelp}
              />
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className={selectClass}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="mb-6 min-w-0">
              <InlineHelpLabel
                htmlFor="dueAt"
                label="Due date"
                help={appPublicGuidanceCopy.taskDueDateHelp}
              />
              <InputPrimitive
                id="dueAt"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={
                submitting || (scope.locations.length > 1 && !locationId)
              }
            >
              {submitting ? "Creating..." : "Create task"}
            </Button>
          </Panel>
        </form>
      ) : null}
    </div>
  );
}
