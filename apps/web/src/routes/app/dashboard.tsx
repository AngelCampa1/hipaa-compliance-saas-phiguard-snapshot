import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import {
  Alert,
  cn,
  PageHeader,
  Panel,
  PanelHeader,
  SummaryMetric,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableShell,
} from "@phiguard/ui";
import { getDashboardSummaryFn, type ActionItem } from "../../server/dashboard";
import { FirstRunBanner } from "../../components/help-guidance";
import { AppRouteErrorBoundary } from "../../components/compliance-error-boundary";
import { formatPlanLabel } from "../../lib/plan-display";
import { trackProductEvent } from "../../lib/product-analytics-browser";

export const Route = createFileRoute("/app/dashboard")({
  validateSearch: (search: Record<string, unknown>) => ({
    locationId: (search.locationId as string | undefined) ?? undefined,
  }),
  beforeLoad: async ({ search }) => {
    const summary = await getDashboardSummaryFn({
      data: {
        locationId: search.locationId,
      },
    });

    return { summary };
  },
  component: DashboardPage,
  errorComponent: AppRouteErrorBoundary,
});

const SEVERITY_STYLES = {
  urgent: {
    wrapper: "border-danger-200 bg-danger-50",
    title: "text-danger-900",
    detail: "text-danger-700",
    cta: "text-danger-700 font-semibold hover:text-danger-900",
  },
  warning: {
    wrapper: "border-warning-200 bg-warning-50",
    title: "text-warning-900",
    detail: "text-warning-700",
    cta: "text-warning-700 font-semibold hover:text-warning-900",
  },
  normal: {
    wrapper: "border-border-default bg-surface-0",
    title: "text-text-primary",
    detail: "text-text-secondary",
    cta: "text-brand-700 font-semibold hover:text-brand-800",
  },
} as const;

function ActionList({ items }: { items: ActionItem[] }) {
  if (items.length === 0) {
    return (
      <Alert tone="success" title="All clear">
        <p>
          Nothing needs attention right now. Check back after your next
          checklist session.
        </p>
      </Alert>
    );
  }

  return (
    <Panel>
      <PanelHeader
        title="Next action"
        description={`${items.length} item${items.length !== 1 ? "s" : ""} need${items.length === 1 ? "s" : ""} attention. Start with the first urgent or blocked item.`}
      />
      <div className="space-y-3">
        {items.map((item) => {
          const s = SEVERITY_STYLES[item.severity];
          return (
            <Link
              key={item.href}
              to={item.href as never}
              onClick={() =>
                trackProductEvent("dashboard_action_clicked", {
                  route: "/app/dashboard",
                  destination_route: item.href,
                  priority: item.severity,
                })
              }
              className={cn(
                "flex items-start justify-between gap-4 rounded-xl border p-4 shadow-sm transition hover:shadow-md",
                s.wrapper,
              )}
            >
              <div className="min-w-0">
                <p className={cn("break-words font-semibold", s.title)}>
                  {item.title}
                </p>
                <p className={cn("mt-0.5 break-words text-sm", s.detail)}>
                  {item.detail}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm",
                  s.cta,
                )}
              >
                {item.cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>
    </Panel>
  );
}

function DashboardPage() {
  const { summary } = Route.useRouteContext();
  const { locationId } = Route.useSearch();
  const navigate = useNavigate();
  const legalReady =
    !!summary.organization?.termsAcceptedAt &&
    !!summary.organization?.baaSignedAt;

  const isFirstRun =
    summary.tasks.total === 0 &&
    summary.incidents.total === 0 &&
    summary.checklists.total === 0;

  function trackDashboardMetric(metric: string, destinationRoute: string, count: number) {
    trackProductEvent("dashboard_metric_clicked", {
      route: "/app/dashboard",
      destination_route: destinationRoute,
      metric,
      count,
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your clinic's open tasks, incidents, and compliance work."
      />

      {/* Compact org header strip */}
      <Panel className="flex flex-wrap items-center gap-3 text-sm">
        <span className="min-w-0 break-words font-semibold text-text-primary">
          {summary.organization?.name ?? "Workspace"}
        </span>
        <span className="rounded-full bg-surface-100 px-3 py-1 text-text-muted">
          {formatPlanLabel(
            summary.organization?.plan,
            summary.organization?.planStatus,
          )}
        </span>
        <span
          className={cn(
            "flex min-w-0 items-center gap-1 rounded-full px-3 py-1",
            legalReady
              ? "bg-success-100 text-success-700"
              : "bg-warning-100 text-warning-700",
          )}
        >
          {legalReady ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5" /> Legal agreements complete
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" /> Legal agreements pending
            </>
          )}
        </span>
        {summary.scope.locations.length > 1 && (
          <select
            value={locationId ?? ""}
            onChange={(e) => {
              const next = e.target.value || undefined;
              trackProductEvent("dashboard_scope_changed", {
                route: "/app/dashboard",
                action: next ? "location_selected" : "all_locations",
              });
              void navigate({
                to: "/app/dashboard",
                search: { locationId: next },
              });
            }}
            className="min-w-0 rounded-md border border-border-default bg-surface-0 px-3 py-1.5 text-sm text-text-secondary"
            aria-label="Location scope"
          >
            {summary.scope.canAccessAllLocations && (
              <option value="">All locations</option>
            )}
            {summary.scope.locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        )}
      </Panel>

      <section
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Workspace summary"
      >
        <Link
          to="/app/tasks"
          search={{ status: "open", locationId: undefined, sort: undefined, sortDir: undefined, page: undefined, pageSize: undefined, assigneeId: undefined }}
          className="block"
          onClick={() => trackDashboardMetric("open_tasks", "/app/tasks", summary.tasks.open)}
        >
          <SummaryMetric
            label="Open tasks"
            value={summary.tasks.open}
            detail={`${summary.tasks.total} total task${summary.tasks.total !== 1 ? "s" : ""}`}
            tone={summary.tasks.open > 0 ? "brand" : "success"}
          />
        </Link>
        <Link
          to="/app/compliance/incidents"
          search={{ locationId: undefined, severity: undefined, status: undefined, category: undefined, q: undefined, sort: undefined, dir: undefined }}
          className="block"
          onClick={() =>
            trackDashboardMetric(
              "open_incidents",
              "/app/compliance/incidents",
              summary.incidents.open,
            )
          }
        >
          <SummaryMetric
            label="Open incidents"
            value={summary.incidents.open}
            detail={`${summary.incidents.total} total incident${summary.incidents.total !== 1 ? "s" : ""}`}
            tone={summary.incidents.open > 0 ? "danger" : "success"}
          />
        </Link>
        <Link
          to="/app/compliance/checklists"
          search={{ locationId: undefined }}
          className="block"
          onClick={() =>
            trackDashboardMetric(
              "active_checklists",
              "/app/compliance/checklists",
              summary.checklists.active,
            )
          }
        >
          <SummaryMetric
            label="Active checklists"
            value={summary.checklists.active}
            detail={`${summary.checklists.active}/${summary.checklists.total} active`}
            tone={summary.checklists.active > 0 ? "brand" : "neutral"}
          />
        </Link>
        <Link
          to="/app/settings/members"
          className="block"
          onClick={() =>
            trackDashboardMetric("team_members", "/app/settings/members", summary.members.total)
          }
        >
          <SummaryMetric
            label="Team members"
            value={summary.members.total}
            detail={
              legalReady ? "Agreements complete" : "Legal agreements pending"
            }
            tone={legalReady ? "neutral" : "warning"}
          />
        </Link>
      </section>

      {/* First-run banner - shown when org is brand new */}
      {isFirstRun && summary.organization?.id && (
        <FirstRunBanner organizationId={summary.organization.id} />
      )}

      {/* Action list */}
      <ActionList items={summary.actionItems} />

      {/* Location breakdown (multi-location orgs only) */}
      {summary.locationBreakdown.length > 0 && (
        <Panel>
          <PanelHeader
            title="Location breakdown"
            description="See open tasks and compliance progress for each location."
          />
          <TableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Open tasks</TableHead>
                  <TableHead>Open incidents</TableHead>
                  <TableHead>Active checklists</TableHead>
                  <TableHead>Completed checklists</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.locationBreakdown.map((row) => (
                  <TableRow key={row.locationId}>
                    <TableCell className="min-w-48 max-w-72 truncate font-medium">
                      <Link
                        to="/app/dashboard"
                        search={{ locationId: row.locationId }}
                        className="hover:underline"
                        onClick={() =>
                          trackProductEvent("dashboard_scope_changed", {
                            route: "/app/dashboard",
                            action: "location_selected",
                          })
                        }
                      >
                        {row.locationName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      <Link
                        to="/app/tasks"
                        search={{ locationId: row.locationId, status: "open", sort: undefined, sortDir: undefined, page: undefined, pageSize: undefined, assigneeId: undefined }}
                        className="hover:underline"
                        onClick={() =>
                          trackDashboardMetric("location_open_tasks", "/app/tasks", row.tasksOpen)
                        }
                      >
                        {row.tasksOpen} / {row.tasksTotal}
                      </Link>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      <Link
                        to="/app/compliance/incidents" search={{ locationId: row.locationId, severity: undefined, status: undefined, category: undefined, q: undefined, sort: undefined, dir: undefined }}
                        className="hover:underline"
                        onClick={() =>
                          trackDashboardMetric(
                            "location_open_incidents",
                            "/app/compliance/incidents",
                            row.incidentsOpen,
                          )
                        }
                      >
                        {row.incidentsOpen} / {row.incidentsTotal}
                      </Link>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      <Link
                        to="/app/compliance/checklists"
                        search={{ locationId: row.locationId }}
                        className="hover:underline"
                        onClick={() =>
                          trackDashboardMetric(
                            "location_active_checklists",
                            "/app/compliance/checklists",
                            row.checklistsActive,
                          )
                        }
                      >
                        {row.checklistsActive} / {row.checklistsTotal}
                      </Link>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {row.checklistsCompleted}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableShell>
        </Panel>
      )}
    </div>
  );
}
