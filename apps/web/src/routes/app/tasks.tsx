import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  EmptyState,
  PageHeader,
  Panel,
  SummaryMetric,
  cn,
} from "@phiguard/ui";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  getTaskScopeFn,
  listTasksFn,
  bulkUpdateStatusFn,
  bulkAssignFn,
} from "../../server/tasks.js";
import { getMembersAndInvitationsFn } from "../../server/organizations.js";
import { formatDate } from "../../lib/dates";
import { ContextualHelpPanel } from "../../components/help-guidance";
import {
  STATUS_BADGE,
  PRIORITY_BADGE,
  formatStatusLabel,
  getDueState,
} from "../../lib/task-display.js";
import { AppRouteErrorBoundary } from "../../components/compliance-error-boundary.js";
import {
  getProductAnalyticsRowCountBucket,
  trackProductEvent,
} from "../../lib/product-analytics-browser";

type SortField = "default" | "dueAt" | "priority" | "createdAt" | "title";
type SortDir = "asc" | "desc";

export const Route = createFileRoute("/app/tasks")({
  validateSearch: (search: Record<string, unknown>) => ({
    status: (search.status as string | undefined) ?? undefined,
    locationId: (search.locationId as string | undefined) ?? undefined,
    sort: (search.sort as SortField | undefined) ?? undefined,
    sortDir: (search.sortDir as SortDir | undefined) ?? undefined,
    page: typeof search.page === "number" ? search.page : undefined,
    pageSize: typeof search.pageSize === "number" ? search.pageSize : undefined,
    assigneeId: (search.assigneeId as string | undefined) ?? undefined,
  }),
  beforeLoad: async ({ search }) => {
    const [result, scope, membersResult] = await Promise.all([
      listTasksFn({
        data: {
          status: search.status as
            | "open"
            | "in_progress"
            | "blocked"
            | "done"
            | undefined,
          locationId: search.locationId,
          sort: (search.sort ?? "default") as SortField,
          sortDir: (search.sortDir ?? "asc") as SortDir,
          page: search.page ?? 1,
          pageSize: search.pageSize ?? 25,
          assigneeId: search.assigneeId,
        },
      }),
      getTaskScopeFn(),
      getMembersAndInvitationsFn()
        .then((membersState) => ({ membersState, membersLoadFailed: false }))
        .catch(() => ({ membersState: null, membersLoadFailed: true })),
    ]);

    return {
      tasks: result.tasks,
      total: result.total,
      scope,
      membersState: membersResult.membersState,
      membersLoadFailed: membersResult.membersLoadFailed,
    };
  },
  component: TasksPage,
  errorComponent: AppRouteErrorBoundary,
});

const STATUS_TABS = [
  { label: "All", value: undefined },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Blocked", value: "blocked" },
  { label: "Done", value: "done" },
] as const;

const SORT_COLUMNS: { field: SortField; label: string }[] = [
  { field: "default", label: "Default" },
  { field: "dueAt", label: "Due date" },
  { field: "priority", label: "Priority" },
  { field: "createdAt", label: "Created" },
  { field: "title", label: "Title" },
];

const TASK_LIST_ANALYTICS_ROUTE = "/app/tasks";

function getTaskSearchLengthBucket(value: string) {
  const length = value.trim().length;
  if (length === 0) return "empty";
  if (length < 4) return "short";
  if (length < 12) return "medium";
  return "long";
}

function SortHeader({
  field,
  label,
  currentSort,
  currentDir,
  onSort,
}: {
  field: SortField;
  label: string;
  currentSort: SortField;
  currentDir: SortDir;
  onSort: (field: SortField) => void;
}) {
  const isActive = currentSort === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
        isActive
          ? "bg-brand-50 text-brand-700"
          : "text-text-muted hover:text-text-primary",
      )}
      aria-pressed={isActive}
    >
      {label}
      {isActive ? (
        currentDir === "asc" ? (
          <ArrowUp className="h-3 w-3" aria-label="ascending" />
        ) : (
          <ArrowDown className="h-3 w-3" aria-label="descending" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />
      )}
    </button>
  );
}

function TasksPage() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const navigate = useNavigate();
  const router = useRouter();
  const { tasks, total, scope, membersState, membersLoadFailed } =
    Route.useRouteContext();
  const {
    status,
    locationId,
    sort: rawSort,
    sortDir: rawSortDir,
    page: rawPage,
    pageSize: rawPageSize,
    assigneeId,
  } = Route.useSearch();
  const sort: SortField = rawSort ?? "default";
  const sortDir: SortDir = rawSortDir ?? "asc";
  const page = rawPage ?? 1;
  const pageSize = rawPageSize ?? 25;
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [bulkAssigneeId, setBulkAssigneeId] = useState<string>("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const emptyStateTrackedRef = useRef<string | null>(null);
  const listViewTrackedRef = useRef<string | null>(null);

  const canWrite = scope.canWrite;

  const memberOptions = (membersState?.organization?.members ?? []).map(
    (m: {
      userId: string;
      user?: { name?: string | null; email?: string | null };
    }) => ({
      userId: m.userId,
      name: m.user?.name || m.user?.email || m.userId,
      email: m.user?.email ?? "",
    }),
  );

  const openCount = tasks.filter((t) => t.status !== "done").length;
  const blockedCount = tasks.filter((t) => t.status === "blocked").length;
  const urgentCount = tasks.filter((t) => t.priority === "urgent").length;
  const dueSoonCount = tasks.filter((t) => {
    const dueState = getDueState(t.dueAt);
    return (
      t.status !== "done" &&
      (dueState === "overdue" || dueState === "due-soon")
    );
  }).length;

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q),
    );
  }, [tasks, query]);

  const hasActiveFilters = Boolean(status || locationId || assigneeId || query.trim());

  useEffect(() => {
    if (pathname !== TASK_LIST_ANALYTICS_ROUTE) return;

    const trackingKey = [
      tasks.length,
      filteredTasks.length,
      total,
      page,
      pageSize,
      sort,
      sortDir,
      hasActiveFilters,
      canWrite,
    ].join(":");
    if (listViewTrackedRef.current === trackingKey) return;
    listViewTrackedRef.current = trackingKey;

    trackProductEvent("task_list_viewed", {
      route: TASK_LIST_ANALYTICS_ROUTE,
      row_count_bucket: getProductAnalyticsRowCountBucket(total),
      visible_row_count_bucket: getProductAnalyticsRowCountBucket(filteredTasks.length),
      has_active_filters: hasActiveFilters,
      can_manage: canWrite,
    });
  }, [
    canWrite,
    filteredTasks.length,
    hasActiveFilters,
    page,
    pageSize,
    pathname,
    sort,
    sortDir,
    tasks.length,
    total,
  ]);

  useEffect(() => {
    if (pathname !== "/app/tasks") return;
    if (filteredTasks.length > 0) return;

    const emptyKind = tasks.length === 0 ? "no_tasks" : "no_matches";
    const trackingKey = `${emptyKind}:${canWrite}:${hasActiveFilters}:${tasks.length}`;
    if (emptyStateTrackedRef.current === trackingKey) return;
    emptyStateTrackedRef.current = trackingKey;

    trackProductEvent("task_empty_state_viewed", {
      route: TASK_LIST_ANALYTICS_ROUTE,
      category: emptyKind,
      status: tasks.length === 0 ? "empty" : "filtered_empty",
      count: tasks.length,
      has_active_filters: hasActiveFilters,
      can_manage: canWrite,
    });
  }, [
    assigneeId,
    canWrite,
    filteredTasks.length,
    locationId,
    pathname,
    query,
    status,
    tasks.length,
  ]);

  if (pathname !== "/app/tasks") {
    return <Outlet />;
  }

  const effectiveLocationId =
    locationId ?? scope.defaultLocationId ?? undefined;
  const activeLocationName =
    scope.locations.find((location) => location.id === effectiveLocationId)
      ?.name ?? "All locations";

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function handleSort(field: SortField) {
    const nextDir: SortDir =
      field === sort && sortDir === "asc" ? "desc" : "asc";
    trackProductEvent("task_sort_changed", {
      route: TASK_LIST_ANALYTICS_ROUTE,
      sort_key: field,
      sort_dir: nextDir,
      row_count_bucket: getProductAnalyticsRowCountBucket(total),
      has_active_filters: hasActiveFilters,
    });
    void navigate({
      to: "/app/tasks",
      search: {
        status,
        locationId,
        sort: field,
        sortDir: nextDir,
        page: 1,
        pageSize,
        assigneeId,
      },
    });
  }

  function handlePageChange(next: number) {
    trackProductEvent("task_page_changed", {
      route: TASK_LIST_ANALYTICS_ROUTE,
      action: next > page ? "next" : "previous",
      row_count_bucket: getProductAnalyticsRowCountBucket(total),
      has_active_filters: hasActiveFilters,
    });
    void navigate({
      to: "/app/tasks",
      search: { status, locationId, sort, sortDir, page: next, pageSize, assigneeId },
    });
  }

  const allVisibleSelected =
    filteredTasks.length > 0 &&
    filteredTasks.every((t) => selectedIds.has(t.id));

  function toggleSelectAll() {
    if (allVisibleSelected) {
      trackProductEvent("task_selection_changed", {
        route: TASK_LIST_ANALYTICS_ROUTE,
        action: "clear_all",
        count: selectedIds.size,
      });
      setSelectedIds(new Set());
    } else {
      trackProductEvent("task_selection_changed", {
        route: TASK_LIST_ANALYTICS_ROUTE,
        action: "select_all_visible",
        count: filteredTasks.length,
      });
      setSelectedIds(new Set(filteredTasks.map((t) => t.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        trackProductEvent("task_selection_changed", {
          route: TASK_LIST_ANALYTICS_ROUTE,
          action: "deselect_one",
          count: next.size,
        });
      } else {
        next.add(id);
        trackProductEvent("task_selection_changed", {
          route: TASK_LIST_ANALYTICS_ROUTE,
          action: "select_one",
          count: next.size,
        });
      }
      return next;
    });
  }

  async function handleBulkStatusChange() {
    if (!bulkStatus || selectedIds.size === 0) return;
    setBulkLoading(true);
    setBulkError(null);
    try {
      await bulkUpdateStatusFn({
        data: {
          taskIds: Array.from(selectedIds),
          status: bulkStatus as "open" | "in_progress" | "blocked" | "done",
        },
      });
      trackProductEvent("task_bulk_status_changed", {
        route: TASK_LIST_ANALYTICS_ROUTE,
        status: bulkStatus,
        count: selectedIds.size,
      });
      setSelectedIds(new Set());
      setBulkStatus("");
      await router.invalidate();
    } catch (err) {
      trackProductEvent("task_action_failed", {
        route: TASK_LIST_ANALYTICS_ROUTE,
        operation: "task.bulk_status_change",
      });
      setBulkError(err instanceof Error ? err.message : "Bulk update failed.");
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkAssign() {
    if (!bulkAssigneeId || selectedIds.size === 0) return;
    setBulkLoading(true);
    setBulkError(null);
    try {
      await bulkAssignFn({
        data: {
          taskIds: Array.from(selectedIds),
          userId: bulkAssigneeId,
        },
      });
      trackProductEvent("task_bulk_assigned", {
        route: TASK_LIST_ANALYTICS_ROUTE,
        count: selectedIds.size,
      });
      setSelectedIds(new Set());
      setBulkAssigneeId("");
      await router.invalidate();
    } catch (err) {
      trackProductEvent("task_action_failed", {
        route: TASK_LIST_ANALYTICS_ROUTE,
        operation: "task.bulk_assign",
      });
      setBulkError(err instanceof Error ? err.message : "Bulk assign failed.");
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Tasks"
        description={`Follow-up tasks for ${activeLocationName}.`}
        actions={
          canWrite ? (
            <Button asChild>
              <Link
                to="/app/tasks/new"
                search={{ status: undefined, locationId, sort: undefined, sortDir: undefined, page: undefined, pageSize: undefined, assigneeId: undefined }}
                onClick={() =>
                  trackProductEvent("task_create_started", {
                    route: TASK_LIST_ANALYTICS_ROUTE,
                    source: "page_header",
                    can_manage: canWrite,
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Create new task
              </Link>
            </Button>
          ) : null
        }
      />

      {/* Active filter chips. The location scope is already named in the PageHeader
          description, so we only surface clearable filter state here. */}
      {assigneeId && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors"
            onClick={() => {
              trackProductEvent("task_filter_changed", {
                route: TASK_LIST_ANALYTICS_ROUTE,
                filter_type: "assignee",
                action: "clear_filter",
                has_active_filters: Boolean(status || locationId || query.trim()),
                row_count_bucket: getProductAnalyticsRowCountBucket(total),
              });
              void navigate({
                to: "/app/tasks",
                search: {
                  status,
                  locationId,
                  sort,
                  sortDir,
                  page: 1,
                  pageSize,
                  assigneeId: undefined,
                },
              });
            }}
          >
            Filtered by assignee
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {!canWrite && (
        <Alert tone="info" className="mb-6" title="Read-only access">
          You can view tasks, but you cannot create or update them.
        </Alert>
      )}

      <section
        className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Task summary"
      >
        <SummaryMetric
          label="Open"
          value={openCount}
          detail={`${total} total task${total !== 1 ? "s" : ""}`}
          tone={openCount > 0 ? "brand" : "success"}
        />
        <SummaryMetric
          label="Blocked"
          value={blockedCount}
          detail="Waiting on a decision or dependency"
          tone={blockedCount > 0 ? "danger" : "neutral"}
        />
        <SummaryMetric
          label="Due soon"
          value={dueSoonCount}
          detail="Due in the next 7 days or overdue"
          tone={dueSoonCount > 0 ? "warning" : "neutral"}
        />
        <SummaryMetric
          label="Urgent"
          value={urgentCount}
          detail="Marked urgent priority"
          tone={urgentCount > 0 ? "danger" : "neutral"}
        />
      </section>

      <Alert
        tone={blockedCount > 0 || urgentCount > 0 ? "warning" : "info"}
        className="mb-6"
        title="Next action"
      >
        {blockedCount > 0
          ? "Clear blocked tasks first so dependent items can move forward."
          : urgentCount > 0
            ? "Review urgent tasks before routine items."
            : openCount > 0
              ? "Open the oldest due task and move it forward."
              : "No active task action is needed in this scope."}
      </Alert>

      <ContextualHelpPanel
        className="mb-6"
        title="Tasks are your clinic follow-up list"
        description="Create a task when one person needs to do something. Update the status and add comments to keep a record."
        topicId="create-first-task"
      />

      <nav
        role="tablist"
        aria-label="Task status filter"
        className="flex flex-wrap gap-1 mb-4 border-b border-border-default"
      >
        {STATUS_TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <Link
              key={tab.label}
              role="tab"
              to="/app/tasks"
              search={{
                status: tab.value,
                locationId,
                sort,
                sortDir,
                page: 1,
                pageSize,
                assigneeId,
              }}
              aria-current={active ? "page" : undefined}
              aria-selected={active}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                active
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-text-muted hover:text-text-primary",
              )}
              onClick={() =>
                trackProductEvent("task_filter_changed", {
                  route: TASK_LIST_ANALYTICS_ROUTE,
                  filter_type: "status",
                  status: tab.value ?? "all",
                  action: tab.value ? "apply_filter" : "clear_filter",
                  has_active_filters: Boolean(tab.value || locationId || assigneeId || query.trim()),
                  row_count_bucket: getProductAnalyticsRowCountBucket(total),
                })
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              trackProductEvent("task_search_performed", {
                route: TASK_LIST_ANALYTICS_ROUTE,
                query_length_bucket: getTaskSearchLengthBucket(nextQuery),
                has_active_filters: Boolean(status || locationId || assigneeId || nextQuery.trim()),
                row_count_bucket: getProductAnalyticsRowCountBucket(total),
              });
            }}
            placeholder="Search tasks by title or description"
            aria-label="Search tasks"
            className="w-full rounded-md border border-border-default bg-surface-0 pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>

        {scope.locations.length > 1 && (
          <div className="sm:w-64">
            <label htmlFor="location-filter" className="sr-only">
              Location scope
            </label>
            <select
              id="location-filter"
              value={locationId ?? ""}
              onChange={(event) => {
                const nextLocationId = event.target.value || undefined;
                trackProductEvent("task_filter_changed", {
                  route: TASK_LIST_ANALYTICS_ROUTE,
                  filter_type: "location",
                  action: nextLocationId ? "apply_filter" : "clear_filter",
                  has_active_filters: Boolean(status || nextLocationId || assigneeId || query.trim()),
                  row_count_bucket: getProductAnalyticsRowCountBucket(total),
                });
                void navigate({
                  to: "/app/tasks",
                  search: {
                    status,
                    locationId: nextLocationId,
                    sort,
                    sortDir,
                    page: 1,
                    pageSize,
                    assigneeId,
                  },
                });
              }}
              className="w-full rounded-md border border-border-default bg-surface-0 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              {scope.canAccessAllLocations && (
                <option value="">All locations</option>
              )}
              {scope.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {!membersLoadFailed && memberOptions.length > 0 && (
          <div className="sm:w-56">
            <label htmlFor="assignee-filter" className="sr-only">
              Filter by assignee
            </label>
            <select
              id="assignee-filter"
              value={assigneeId ?? ""}
              onChange={(event) => {
                const nextAssigneeId = event.target.value || undefined;
                trackProductEvent("task_filter_changed", {
                  route: TASK_LIST_ANALYTICS_ROUTE,
                  filter_type: "assignee",
                  action: nextAssigneeId ? "apply_filter" : "clear_filter",
                  has_active_filters: Boolean(status || locationId || nextAssigneeId || query.trim()),
                  row_count_bucket: getProductAnalyticsRowCountBucket(total),
                });
                void navigate({
                  to: "/app/tasks",
                  search: {
                    status,
                    locationId,
                    sort,
                    sortDir,
                    page: 1,
                    pageSize,
                    assigneeId: nextAssigneeId,
                  },
                });
              }}
              className="w-full rounded-md border border-border-default bg-surface-0 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="">All assignees</option>
              {memberOptions.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sort controls */}
      <div className="flex flex-wrap items-center gap-1 mb-3 text-xs text-text-muted">
        <span className="mr-1 font-medium">Sort:</span>
        {SORT_COLUMNS.map((col) => (
          <SortHeader
            key={col.field}
            field={col.field}
            label={col.label}
            currentSort={sort}
            currentDir={sortDir}
            onSort={handleSort}
          />
        ))}
      </div>

      {/* Bulk action bar */}
      {canWrite && selectedIds.size > 0 && (
        <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-brand-800">
            {selectedIds.size} selected
          </span>

          <div className="flex items-center gap-2">
            <label htmlFor="bulk-status" className="sr-only">
              Change status
            </label>
            <select
              id="bulk-status"
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="rounded-md border border-brand-300 bg-surface-0 px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="">Change status…</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleBulkStatusChange()}
              disabled={!bulkStatus || bulkLoading}
            >
              Apply
            </Button>
          </div>

          {!membersLoadFailed && memberOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="bulk-assign" className="sr-only">
                Assign to
              </label>
              <select
                id="bulk-assign"
                value={bulkAssigneeId}
                onChange={(e) => setBulkAssigneeId(e.target.value)}
                className="rounded-md border border-brand-300 bg-surface-0 px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                <option value="">Assign to…</option>
                {memberOptions.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleBulkAssign()}
                disabled={!bulkAssigneeId || bulkLoading}
              >
                Assign
              </Button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              trackProductEvent("task_selection_changed", {
                route: TASK_LIST_ANALYTICS_ROUTE,
                action: "clear_selection",
                count: selectedIds.size,
              });
              setSelectedIds(new Set());
            }}
            className="ml-auto text-sm text-text-muted hover:text-text-primary"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>

          {bulkError && (
            <p className="w-full text-xs text-danger-800">{bulkError}</p>
          )}
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          heading={tasks.length === 0 ? "No tasks yet" : "No matching tasks"}
          description={
            tasks.length === 0
              ? canWrite
                ? "Create your first task. Or start from a checklist if this is part of a larger HIPAA process."
                : "You can view tasks here, but you do not have permission to create new ones."
              : "Try a different search term or clear filters."
          }
          action={
            tasks.length === 0 && canWrite ? (
              <Button asChild>
                <Link
                  to="/app/tasks/new"
                  search={{ status: undefined, locationId, sort: undefined, sortDir: undefined, page: undefined, pageSize: undefined, assigneeId: undefined }}
                  onClick={() =>
                    trackProductEvent("task_create_started", {
                      route: TASK_LIST_ANALYTICS_ROUTE,
                      source: "empty_state",
                      can_manage: canWrite,
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Create your first task
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {canWrite && (
            <div className="flex items-center gap-3 px-4 py-2 mb-1 text-xs text-text-muted font-medium">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all visible tasks"
              />
              <span className="flex-1">Task</span>
              <span className="hidden sm:block w-24 text-right">Status</span>
              <span className="hidden sm:block w-20 text-right">Priority</span>
            </div>
          )}

          <ul className="space-y-2">
            {filteredTasks.map((task) => {
              const taskLocationName =
                scope.locations.find((loc) => loc.id === task.locationId)
                  ?.name ?? null;
              const dueState = getDueState(task.dueAt);
              const isSelected = selectedIds.has(task.id);
              return (
                <li key={task.id}>
                  <Panel
                    className={cn(
                      "p-0 transition-colors hover:border-border-strong",
                      isSelected && "border-brand-400 bg-brand-50/30",
                    )}
                  >
                    <div className="flex items-start gap-3 p-4">
                      {canWrite && (
                        <div className="pt-0.5 shrink-0">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(task.id)}
                            aria-label={`Select task: ${task.title}`}
                          />
                        </div>
                      )}
                      <Link
                        to="/app/tasks/$taskId"
                        params={{ taskId: task.id }}
                        search={{ locationId, status, sort: undefined, sortDir: undefined, page: undefined, pageSize: undefined, assigneeId: undefined }}
                        className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-text-primary">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="mt-1 line-clamp-2 break-words text-sm text-text-muted">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                            {taskLocationName && (
                              <span className="min-w-0 max-w-full truncate">
                                {taskLocationName}
                              </span>
                            )}
                            {task.dueAt && (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                                  dueState === "overdue" &&
                                    "bg-danger-50 text-danger-800",
                                  dueState === "due-soon" &&
                                    "bg-warning-50 text-warning-800",
                                  dueState === "scheduled" &&
                                    "bg-surface-100 text-text-secondary",
                                )}
                              >
                                {dueState !== "scheduled" && (
                                  <AlertTriangle
                                    className="h-3 w-3"
                                    aria-hidden="true"
                                  />
                                )}
                                Due{" "}
                                {formatDate(task.dueAt, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-1.5 sm:flex-col sm:items-end">
                          <Badge
                            variant={STATUS_BADGE[task.status] ?? "default"}
                          >
                            {formatStatusLabel(task.status)}
                          </Badge>
                          <Badge
                            variant={
                              PRIORITY_BADGE[task.priority] ?? "default"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </Link>
                    </div>
                  </Panel>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-text-muted">
              <span>
                Page {page} of {totalPages} ({total} tasks)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
