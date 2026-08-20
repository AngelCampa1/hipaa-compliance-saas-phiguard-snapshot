import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  archiveChecklistFn,
  assignChecklistTemplateFn,
  deleteChecklistFn,
  getComplianceScopeFn,
  listChecklistTemplatesFn,
  listChecklistsFn,
  renameChecklistFn,
} from "../../../server/compliance.js";
import { formatDate } from "../../../lib/dates";
import {
  getProductAnalyticsRowCountBucket,
  trackProductEvent,
} from "../../../lib/product-analytics-browser";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputPrimitive,
  Label,
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
import { ContextualHelpPanel, InlineHelpLabel } from "../../../components/help-guidance";
import { AppRouteErrorBoundary } from "../../../components/compliance-error-boundary";

export const Route = createFileRoute("/app/compliance/checklists/")({
  validateSearch: (search: Record<string, unknown>) => ({
    locationId: (search.locationId as string | undefined) ?? undefined,
  }),
  beforeLoad: async ({ search }) => {
    const [checklists, scope, templates] = await Promise.all([
      listChecklistsFn({
        data: {
          locationId: search.locationId,
        },
      }),
      getComplianceScopeFn(),
      listChecklistTemplatesFn(),
    ]);

    return {
      checklists,
      scope,
      templates,
      initialLocationId: search.locationId,
    };
  },
  component: ChecklistsIndexPage,
  errorComponent: AppRouteErrorBoundary,
});

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

const CHECKLIST_INDEX_ANALYTICS_ROUTE = "/app/compliance/checklists";

function ChecklistsIndexPage() {
  const { checklists, scope, templates, initialLocationId } =
    Route.useRouteContext();
  const { locationId } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const canAdmin = scope.canAdmin;
  const effectiveLocationId =
    locationId ?? scope.defaultLocationId ?? undefined;
  const activeLocationName =
    scope.locations.find((location) => location.id === effectiveLocationId)
      ?.name ?? "All locations";
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [dueAt, setDueAt] = useState("");
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(
    initialLocationId
      ? [initialLocationId]
      : scope.locations.map((location) => location.id),
  );
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Rename checklist dialog
  const [renamingChecklist, setRenamingChecklist] = useState<{ id: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renamingBusy, setRenamingBusy] = useState(false);

  // Archive/delete busy state
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredChecklists = useMemo(() => {
    if (!locationId) {
      return checklists;
    }

    return checklists.filter(
      (checklist) => checklist.locationId === locationId,
    );
  }, [checklists, locationId]);

  const checklistsByLocation = useMemo(() => {
    return scope.locations.map((location) => {
      const rows = checklists.filter(
        (checklist) => checklist.locationId === location.id,
      );

      return {
        locationId: location.id,
        locationName: location.name,
        active: rows.filter((row) => row.status === "active").length,
        completed: rows.filter((row) => row.status === "completed").length,
        total: rows.length,
      };
    });
  }, [checklists, scope.locations]);

  const activeCount = filteredChecklists.filter((checklist) => checklist.status === "active").length;
  const completedCount = filteredChecklists.filter((checklist) => checklist.status === "completed").length;
  const dueCount = filteredChecklists.filter((checklist) => checklist.dueAt).length;

  const trackChecklistActionFailed = (operation: string) => {
    trackProductEvent("checklist_action_failed", {
      route: CHECKLIST_INDEX_ANALYTICS_ROUTE,
      operation,
    });
  };

  const getChecklistStatus = (checklistId: string) =>
    checklists.find((checklist) => checklist.id === checklistId)?.status ?? "unknown";

  const handleAssignChecklist = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsAssigning(true);

    try {
      const result = await assignChecklistTemplateFn({
        data: {
          templateId,
          locationIds: selectedLocationIds,
          dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
        },
      });

      const createdCount = result.created.length;
      const skippedCount = result.skippedLocationIds.length;
      trackProductEvent("checklist_assigned", {
        route: CHECKLIST_INDEX_ANALYTICS_ROUTE,
        count: createdCount,
      });

      setNotice(
        skippedCount > 0
          ? `Assigned ${createdCount} checklist${createdCount === 1 ? "" : "s"} and skipped ${skippedCount} location${skippedCount === 1 ? "" : "s"} that already had this template.`
          : `Assigned ${createdCount} checklist${createdCount === 1 ? "" : "s"}.`,
      );
      await router.invalidate();
    } catch (assignError) {
      trackChecklistActionFailed("checklist.assign");
      setError((assignError as Error).message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRenameChecklist = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!renamingChecklist || !renameValue.trim()) return;
    setRenamingBusy(true);
    setError(null);
    try {
      const checklistStatus = getChecklistStatus(renamingChecklist.id);
      await renameChecklistFn({ data: { checklistId: renamingChecklist.id, name: renameValue.trim() } });
      trackProductEvent("checklist_renamed", {
        route: CHECKLIST_INDEX_ANALYTICS_ROUTE,
        status: checklistStatus,
      });
      setRenamingChecklist(null);
      await router.invalidate();
      setNotice('Checklist renamed.');
    } catch (err) {
      trackChecklistActionFailed("checklist.rename");
      setError((err as Error).message);
    } finally {
      setRenamingBusy(false);
    }
  };

  const handleArchiveChecklist = async (checklistId: string) => {
    setError(null);
    setArchivingId(checklistId);
    try {
      const checklistStatus = getChecklistStatus(checklistId);
      await archiveChecklistFn({ data: { checklistId } });
      trackProductEvent("checklist_archived", {
        route: CHECKLIST_INDEX_ANALYTICS_ROUTE,
        status: checklistStatus,
      });
      await router.invalidate();
      setNotice('Checklist archived.');
    } catch (err) {
      trackChecklistActionFailed("checklist.archive");
      setError((err as Error).message);
    } finally {
      setArchivingId(null);
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    setError(null);
    setDeletingId(checklistId);
    try {
      const checklistStatus = getChecklistStatus(checklistId);
      await deleteChecklistFn({ data: { checklistId } });
      trackProductEvent("checklist_deleted", {
        route: CHECKLIST_INDEX_ANALYTICS_ROUTE,
        status: checklistStatus,
      });
      await router.invalidate();
      setNotice('Checklist deleted.');
    } catch (err) {
      trackChecklistActionFailed("checklist.delete");
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <nav className="mb-4">
        <Link to="/app/compliance">← Compliance</Link>
      </nav>

      <PageHeader
        eyebrow="Compliance"
        title="Checklists"
        description={
          locationId
            ? `Checklists for ${activeLocationName}.`
            : "Compliance checklists across all locations."
        }
      />
      {!canAdmin && (
        <p className="text-sm text-text-muted">
          Read-only access. Only an admin can assign starter templates.
        </p>
      )}

      <ContextualHelpPanel
        title="Start here if compliance feels overwhelming"
        description="Assigning a starter template creates a checklist for the selected location. Work through the items one at a time."
        topicId="start-checklist"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryMetric label="Active" value={activeCount} detail="Currently in progress" tone="brand" />
        <SummaryMetric label="Completed" value={completedCount} detail="Finished checklists" tone="success" />
        <SummaryMetric label="With due dates" value={dueCount} detail="Scheduled review work" tone="neutral" />
      </div>

      {scope.locations.length > 1 && (
        <div className="mb-6">
          <InlineHelpLabel
            htmlFor="checklist-location-filter"
            label="Location scope"
            help="All locations shows the big picture. A single location narrows the checklist list to that clinic site."
            className="mb-1"
          />
          <select
            id="checklist-location-filter"
            value={locationId ?? ""}
            onChange={(event) => {
              const nextLocationId = event.target.value || undefined;
              trackProductEvent("checklist_location_filter_changed", {
                route: CHECKLIST_INDEX_ANALYTICS_ROUTE,
                action: nextLocationId ? "single_location" : "all_locations",
                has_active_filters: Boolean(nextLocationId),
                row_count_bucket: getProductAnalyticsRowCountBucket(checklists.length),
              });
              void navigate({
                to: "/app/compliance/checklists",
                search: { locationId: nextLocationId },
              });
            }}
            className="p-2 border border-border-default rounded"
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

      {canAdmin ? (
        <Panel>
          <PanelHeader
            title="Assign starter template"
            description="Assign one template to multiple locations at once. Each location gets its own copy."
          />

          <form onSubmit={handleAssignChecklist}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <InlineHelpLabel
                  htmlFor="templateId"
                  label="Template"
                  help="A starter template creates the checklist items for you so your clinic does not start from a blank page."
                  className="mb-1"
                />
                <select
                  id="templateId"
                  value={templateId}
                  onChange={(event) => setTemplateId(event.target.value)}
                  className="w-full p-2 border border-border-default rounded"
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} · {template.itemCount} items
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <InlineHelpLabel
                  htmlFor="dueAt"
                  label="Due date"
                  help="Use a target date when the checklist should be reviewed or completed by a specific day."
                  className="mb-1"
                />
                <input
                  id="dueAt"
                  type="date"
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                  className="w-full p-2 border border-border-default rounded"
                />
              </div>
            </div>

            <div className="mt-4">
              <InlineHelpLabel
                label="Assign to locations"
                help="Each location gets its own checklist so progress is tracked separately."
                className="mb-2"
              />
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {scope.locations.map((location) => (
                  <label
                    key={location.id}
                    className="flex items-center gap-2 border border-border-default rounded-md p-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLocationIds.includes(location.id)}
                      onChange={(event) => {
                        setSelectedLocationIds((current) =>
                          event.target.checked
                            ? Array.from(new Set([...current, location.id]))
                            : current.filter(
                                (candidate) => candidate !== location.id,
                              ),
                        );
                      }}
                    />
                    <span>{location.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {error ? <Alert tone="danger" className="mt-4">{error}</Alert> : null}
            {notice ? <Alert tone="success" className="mt-4">{notice}</Alert> : null}

            <Button
              type="submit"
              disabled={isAssigning || !templateId || selectedLocationIds.length === 0}
              className="mt-4"
            >
              {isAssigning ? "Assigning checklist..." : "Assign starter checklist"}
            </Button>
          </form>
        </Panel>
      ) : null}

      {!locationId && checklistsByLocation.length > 0 ? (
        <Panel>
          <PanelHeader title="Completion by location" description="See where active checklist work is concentrated." />
          <TableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checklistsByLocation.map((row) => (
                  <TableRow key={row.locationId}>
                    <TableCell>{row.locationName}</TableCell>
                    <TableCell>{row.active}</TableCell>
                    <TableCell>{row.completed}</TableCell>
                    <TableCell>{row.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableShell>
        </Panel>
      ) : null}

      {filteredChecklists.length === 0 ? (
        <section className="rounded-xl border border-dashed border-border-default bg-surface-50 p-8 text-center">
          <h2 className="text-lg font-semibold text-text-primary">No checklists yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            {canAdmin
              ? `Assign a starter checklist for ${activeLocationName}. PHIGuard creates the items for you.`
              : `No checklists found for ${activeLocationName}. Only an admin can assign a starter checklist.`}
          </p>
        </section>
      ) : (
        <Panel>
          <PanelHeader title="Checklist progress" description="Open a checklist to continue guided review or add evidence to items." />
          <ul className="list-none divide-y divide-border-default p-0">
          {filteredChecklists.map((checklist) => {
            const locationName =
              scope.locations.find(
                (location) => location.id === checklist.locationId,
              )?.name ?? checklist.locationId;

            return (
              <li
                key={checklist.id}
                className="flex min-w-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    to="/app/compliance/checklists/$checklistId"
                    params={{ checklistId: checklist.id }}
                    className="break-words font-medium text-text-link"
                  >
                    {checklist.name}
                  </Link>
                  <div className="mt-1 text-xs leading-5 text-text-secondary">
                    {locationName}
                    {checklist.dueAt
                      ? ` · Due ${formatDate(checklist.dueAt)}`
                      : ""}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      checklist.status === "completed"
                        ? "success"
                        : checklist.status === "archived"
                          ? "default"
                          : "default"
                    }
                  >
                    {STATUS_LABELS[checklist.status] ?? checklist.status}
                  </Badge>
                  {canAdmin && checklist.status !== "archived" ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRenamingChecklist({ id: checklist.id, name: checklist.name });
                          setRenameValue(checklist.name);
                        }}
                      >
                        Rename
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={archivingId === checklist.id}
                          >
                            {archivingId === checklist.id ? 'Archiving...' : 'Archive'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Archive checklist?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Archiving hides "{checklist.name}" from the default view. Contact support to restore it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void handleArchiveChecklist(checklist.id)}>
                              Archive
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={deletingId === checklist.id}
                          >
                            {deletingId === checklist.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete checklist?</AlertDialogTitle>
                            <AlertDialogDescription>
                              If any items are completed, you will be asked to archive instead. Deletion cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void handleDeleteChecklist(checklist.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
          </ul>
        </Panel>
      )}

      {/* Rename checklist Dialog */}
      <Dialog
        open={renamingChecklist !== null}
        onOpenChange={(open) => { if (!open) setRenamingChecklist(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Checklist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenameChecklist}>
            <div className="py-2">
              <Label htmlFor="rename-checklist-name">Name</Label>
              <InputPrimitive
                id="rename-checklist-name"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Checklist name"
                autoFocus
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={renamingBusy || !renameValue.trim()}>
                {renamingBusy ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setRenamingChecklist(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
