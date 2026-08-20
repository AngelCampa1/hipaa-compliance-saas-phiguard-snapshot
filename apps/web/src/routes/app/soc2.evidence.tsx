import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { isFeatureGateError } from "@phiguard/billing";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { z } from "zod";
import {
  Alert,
  BACK_LINK_ANCHOR_CLASS,
  BackLinkAnchor,
  BackLinkNav,
  Button,
  EmptyState,
  InputPrimitive,
  Label,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SummaryMetric,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableShell,
} from "@phiguard/ui";
import { FeatureGate } from "../../components/feature-gate.js";
import { AppRouteErrorBoundary } from "../../components/compliance-error-boundary";
import { formatDate } from "../../lib/dates.js";
import { CREATE_ONLY_UPLOAD_HEADERS } from "../../lib/s3.js";
import {
  getProductAnalyticsRowCountBucket,
  trackProductEvent,
} from "../../lib/product-analytics-browser.js";
import {
  collectAuditEvidenceFn,
  downloadSoc2EvidenceFn,
  exportEvidenceBundleFn,
  listControlsFn,
  listEvidenceFn,
  presignSoc2EvidenceUploadFn,
  recordManualEvidenceFn,
} from "../../server/soc2.js";
import { getOrgFeatureContextFn } from "../../server/feature-context.js";
import type { FeatureGateFallback } from "../../server/feature-context.js";

const searchSchema = z.object({
  controlId: z.string().optional(),
  source: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sort: z.string().optional(),
  dir: z.enum(["asc", "desc"]).optional(),
});

function isFeatureGateFallback(data: unknown): data is FeatureGateFallback {
  return Boolean(data && typeof data === "object" && "gatedOrg" in data);
}

export const Route = createFileRoute("/app/soc2/evidence")({
  validateSearch: searchSchema,
  loader: async ({ location }) => {
    const controlId = searchSchema.parse(location.search).controlId;
    try {
      const [evidenceData, controls] = await Promise.all([
        listEvidenceFn({ data: { controlId } }),
        listControlsFn(),
      ]);
      return { ...evidenceData, controls };
    } catch (err) {
      if (isFeatureGateError(err))
        return { gatedOrg: await getOrgFeatureContextFn() };
      throw err;
    }
  },
  component: Soc2EvidencePage,
  errorComponent: AppRouteErrorBoundary,
});

type SortEvidenceKey = "controlId" | "source" | "collectedAt";
const SOC2_EVIDENCE_ANALYTICS_ROUTE = "/app/soc2/evidence";
const ALL_FILTER = "all";

function Soc2EvidencePage() {
  const router = useRouter();
  const data = Route.useLoaderData();
  const { controlId, source, dateFrom, dateTo, sort: sortParam, dir: dirParam } = Route.useSearch();
  const navigate = useNavigate({ from: "/app/soc2/evidence" });
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<{
    key: string;
    downloadUrl: string;
    expiresAt: Date;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadingEvidenceId, setDownloadingEvidenceId] = useState<
    string | null
  >(null);
  const [bundleExpired, setBundleExpired] = useState(false);

  // Auto-dismiss export bundle alert after 15 minutes
  useEffect(() => {
    if (!exportResult) return;
    setBundleExpired(false);
    const timeout = setTimeout(
      () => {
        setExportResult(null);
        setBundleExpired(true);
      },
      15 * 60 * 1000,
    );
    return () => clearTimeout(timeout);
  }, [exportResult]);

  const gatedOrg = isFeatureGateFallback(data) ? data.gatedOrg : null;
  const evidenceData = isFeatureGateFallback(data) ? null : data;
  const evidence = evidenceData?.evidence ?? [];
  const controlOptions = evidenceData?.controls ?? [];
  const canAdmin = evidenceData?.canAdmin ?? false;
  type EvidenceRow = (typeof evidence)[number];
  const [recordError, setRecordError] = useState<string | null>(null);
  const [recordResult, setRecordResult] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const setFilter = useCallback(
    (key: string, value: string) => {
      // Radix Select.Item cannot use an empty value; the "All" option uses the
      // ALL_FILTER sentinel, mapped back to undefined to clear the filter.
      const next = value === ALL_FILTER || value === "" ? undefined : value;
      trackProductEvent("soc2_evidence_filter_changed", {
        route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
        filter_type: key,
        action: next ? "apply_filter" : "clear_filter",
      });
      void navigate({ search: (prev) => ({ ...prev, [key]: next }) });
    },
    [navigate],
  );

  const clearFilters = useCallback(() => {
    trackProductEvent("soc2_evidence_filter_changed", {
      route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
      filter_type: "all",
      action: "clear_filter",
    });
    void navigate({ search: (prev) => ({ controlId: prev.controlId }) });
  }, [navigate]);

  const toggleSortEvidence = useCallback(
    (col: SortEvidenceKey) => {
      const nextDir = sortParam === col && dirParam === "desc" ? "asc" : "desc";
      trackProductEvent("soc2_evidence_sort_changed", {
        route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
        sort_key: col,
        sort_dir: nextDir,
      });
      void navigate({
        search: (prev) => ({
          ...prev,
          sort: col,
          dir: nextDir,
        }),
      });
    },
    [dirParam, navigate, sortParam],
  );

  const selectedControl = useMemo(
    () =>
      controlId
        ? controlOptions.find((ctrl) => ctrl.controlId === controlId)
        : null,
    [controlId, controlOptions],
  );
  const hasInvalidControlFilter = Boolean(controlId && !selectedControl);

  // Client-side filter + sort
  const sources = [...new Set(evidence.map((ev) => ev.source).filter(Boolean))].sort();
  let filteredEvidence = evidence;
  if (source) {
    filteredEvidence = filteredEvidence.filter((ev) => ev.source === source);
  }
  if (dateFrom) {
    const from = new Date(dateFrom).getTime();
    filteredEvidence = filteredEvidence.filter(
      (ev) => new Date(ev.collectedAt).getTime() >= from,
    );
  }
  if (dateTo) {
    const to = new Date(dateTo).getTime() + 86400000 - 1; // inclusive end-of-day
    filteredEvidence = filteredEvidence.filter(
      (ev) => new Date(ev.collectedAt).getTime() <= to,
    );
  }

  const sortKey = (sortParam as SortEvidenceKey | undefined) ?? "collectedAt";
  const sortDir = dirParam ?? "desc";
  filteredEvidence = [...filteredEvidence].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "collectedAt") {
      cmp = new Date(a.collectedAt).getTime() - new Date(b.collectedAt).getTime();
    } else if (sortKey === "controlId") {
      cmp = a.controlId.localeCompare(b.controlId);
    } else if (sortKey === "source") {
      cmp = a.source.localeCompare(b.source);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const hasActiveEvidenceFilters = Boolean(source || dateFrom || dateTo);

  function SortIndicatorE({ col }: { col: SortEvidenceKey }) {
    if (sortKey !== col) return null;
    return <span className="ml-1 text-text-muted">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  function SortableEvidenceHead({
    col,
    children,
    className,
  }: {
    col: SortEvidenceKey;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <TableHead
        className={className}
        onClick={() => toggleSortEvidence(col)}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        {children}
        <SortIndicatorE col={col} />
      </TableHead>
    );
  }

  useEffect(() => {
    setRecordError(null);
  }, [evidence]);

  useEffect(() => {
    if (!gatedOrg) return;
    trackProductEvent("soc2_evidence_feature_gate_viewed", {
      route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
      feature: "soc2_evidence",
      status: "blocked",
    });
  }, [gatedOrg]);

  useEffect(() => {
    if (gatedOrg) return;
    trackProductEvent("soc2_evidence_viewed", {
      route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
      row_count_bucket: getProductAnalyticsRowCountBucket(evidence.length),
      visible_row_count_bucket: getProductAnalyticsRowCountBucket(filteredEvidence.length),
      has_active_filters: hasActiveEvidenceFilters,
      can_manage: canAdmin,
    });
  }, [canAdmin, evidence.length, filteredEvidence.length, gatedOrg, hasActiveEvidenceFilters]);

  useEffect(() => {
    if (gatedOrg) return;
    const emptyStateType =
      evidence.length === 0 ? "no_evidence" : filteredEvidence.length === 0 ? "no_matches" : null;
    if (!emptyStateType) return;
    trackProductEvent("soc2_evidence_empty_state_viewed", {
      route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
      empty_state_type: emptyStateType,
      has_active_filters: hasActiveEvidenceFilters,
      can_manage: canAdmin,
    });
  }, [canAdmin, evidence.length, filteredEvidence.length, gatedOrg, hasActiveEvidenceFilters]);

  if (gatedOrg) {
    return (
      <div className="mx-auto max-w-5xl">
        <BackLink controlId={controlId} />
        <PageHeader
          title="Evidence"
          description="Audit evidence collected for your SOC 2 controls."
        />
        <FeatureGate feature="soc2_evidence" org={gatedOrg}>
          {null}
        </FeatureGate>
      </div>
    );
  }

  const now = new Date();
  const quarterStart = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3,
    1,
  );
  const quarterEnd = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3 + 3,
    0,
    23,
    59,
    59,
  );
  const sourceCount = new Set(evidence.map((row) => row.source)).size;

  const getEvidenceSummary = (row: EvidenceRow) => {
    if (
      row.metadata &&
      typeof row.metadata === "object" &&
      !Array.isArray(row.metadata)
    ) {
      const count = row.metadata.count;
      if (typeof count === "number") {
        return `${count} event(s)`;
      }
    }

    return row.queryRef ?? "Not provided";
  };

  const handleExportBundle = async () => {
    setExportError(null);
    setDownloadError(null);
    setBundleExpired(false);
    setExporting(true);
    try {
      const result = await exportEvidenceBundleFn({
        data: {
          from: quarterStart.toISOString(),
          to: quarterEnd.toISOString(),
        },
      });
      setExportResult({
        ...result,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
      trackProductEvent("soc2_evidence_bundle_exported", {
        route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
        export_format: "zip",
        status: "succeeded",
      });
    } catch (err) {
      trackProductEvent("soc2_evidence_action_failed", {
        route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
        operation: "evidence.export_bundle",
      });
      setExportError((err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const handleCollectAuditEvidence = async () => {
    if (!selectedControl) return;
    setRecordError(null);
    setRecordResult(null);
    setDownloadError(null);
    setCollecting(true);
    try {
      const result = await collectAuditEvidenceFn({
        data: {
          controlId: selectedControl.controlId,
          from: quarterStart.toISOString(),
          to: quarterEnd.toISOString(),
        },
      });
      await router.invalidate();
      trackProductEvent("soc2_audit_evidence_collected", {
        route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
        count: result.count,
      });
      setRecordResult(
        `Audit evidence collected from ${result.count} event(s).`,
      );
    } catch (err) {
      trackProductEvent("soc2_evidence_action_failed", {
        route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
        operation: "evidence.collect_audit",
      });
      setRecordError((err as Error).message);
    } finally {
      setCollecting(false);
    }
  };

  const handleDownloadEvidence = async (evidenceId: string) => {
    setDownloadError(null);
    setDownloadingEvidenceId(evidenceId);
    try {
      const { downloadUrl } = await downloadSoc2EvidenceFn({
        data: { evidenceId },
      });
      trackProductEvent("soc2_evidence_downloaded", {
        route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
        feature: "soc2_evidence",
      });
      window.location.assign(downloadUrl);
    } catch (err) {
      trackProductEvent("soc2_evidence_action_failed", {
        route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
        operation: "evidence.download",
      });
      setDownloadError((err as Error).message);
    } finally {
      setDownloadingEvidenceId(null);
    }
  };

  const handleRecordEvidence = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const controlIdValue =
      selectedControl?.controlId ??
      String(formData.get("controlId") ?? "").trim();
    const summaryValue = String(formData.get("summary") ?? "").trim();
    const evidenceFile = formData.get("evidenceFile");
    const controlIsKnown = controlOptions.some(
      (ctrl) => ctrl.controlId === controlIdValue,
    );

    setRecordError(null);
    setRecordResult(null);
    setDownloadError(null);
    setRecording(true);
    try {
      if (!controlIdValue || !controlIsKnown) {
        throw new Error(
          "Select a valid SOC 2 control before uploading evidence",
        );
      }

      let evidenceFileKey = "";
      if (
        typeof File !== "undefined" &&
        evidenceFile instanceof File &&
        evidenceFile.size > 0
      ) {
        const contentType = evidenceFile.type;
        const upload = await presignSoc2EvidenceUploadFn({
          data: {
            filename: evidenceFile.name,
            contentType,
            sizeBytes: evidenceFile.size,
          },
        });
        const uploadResponse = await fetch(upload.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": contentType,
            ...CREATE_ONLY_UPLOAD_HEADERS,
          },
          body: evidenceFile,
        });

        if (!uploadResponse.ok) {
          throw new Error("Evidence file upload failed");
        }

        evidenceFileKey = upload.key;
      }

      if (!evidenceFileKey) {
        throw new Error("Upload an evidence file to record evidence.");
      }

      await recordManualEvidenceFn({
        data: {
          controlId: controlIdValue,
          fileKey: evidenceFileKey,
          summary: summaryValue,
        },
      });
      await router.invalidate();
      trackProductEvent("soc2_evidence_recorded", {
        route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
        source: "manual_upload",
      });
      setRecordResult("Evidence recorded.");
      form.reset();
    } catch (err) {
      trackProductEvent("soc2_evidence_action_failed", {
        route: SOC2_EVIDENCE_ANALYTICS_ROUTE,
        operation: "evidence.record_manual",
      });
      setRecordError((err as Error).message);
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink controlId={controlId} />

      <PageHeader
        title={controlId ? `Evidence - ${controlId}` : "Evidence"}
        description="Audit evidence collected for SOC 2 controls."
        actions={
          canAdmin ? (
            <div className="flex flex-wrap gap-2">
              {selectedControl?.hasAuditEvidenceMapping ? (
                <Button
                  variant="outline"
                  onClick={handleCollectAuditEvidence}
                  disabled={collecting}
                  size="sm"
                >
                  {collecting ? "Collecting..." : "Collect audit evidence"}
                </Button>
              ) : null}
              <Button
                onClick={handleExportBundle}
                disabled={exporting}
                size="sm"
              >
                {exporting ? "Exporting..." : "Export Bundle"}
              </Button>
            </div>
          ) : null
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryMetric
          label="Evidence items"
          value={evidence.length}
          detail={controlId ? `Filtered to ${controlId}` : "Across all controls"}
          tone="brand"
        />
        <SummaryMetric
          label="Sources"
          value={sourceCount}
          detail="Evidence sources"
        />
        <SummaryMetric
          label="Export window"
          value="Current quarter"
          detail={`${formatDate(quarterStart.toISOString())} to ${formatDate(quarterEnd.toISOString())}`}
        />
      </div>

      {hasInvalidControlFilter ? (
        <Alert tone="warning" className="mb-4">
          The control in this URL is not available. Select a valid control below, or{" "}
          <Link to="/app/soc2/evidence" className="text-text-link underline">
            clear the filter
          </Link>
          .
        </Alert>
      ) : null}

      {canAdmin ? (
        <form
          onSubmit={handleRecordEvidence}
          className="mb-6 rounded-lg border border-border-subtle bg-surface p-4"
        >
          <div className="grid gap-4 md:grid-cols-manual-evidence-form">
            <div>
              <label
                htmlFor="manual-control-id"
                className="mb-1 block text-sm font-medium text-text-secondary"
              >
                Control ID
              </label>
              {selectedControl ? (
                <input
                  type="hidden"
                  name="controlId"
                  value={selectedControl.controlId}
                />
              ) : null}
              <select
                id="manual-control-id"
                name={selectedControl ? undefined : "controlId"}
                required
                defaultValue={selectedControl?.controlId ?? ""}
                disabled={
                  Boolean(selectedControl) || controlOptions.length === 0
                }
                className="w-full rounded-md border border-border-strong px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  {controlOptions.length === 0
                    ? "No controls available"
                    : "Select control"}
                </option>
                {controlOptions.map((ctrl) => (
                  <option key={ctrl.id} value={ctrl.controlId}>
                    {ctrl.controlId} - {ctrl.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="manual-evidence-file"
                className="mb-1 block text-sm font-medium text-text-secondary"
              >
                Evidence file
              </label>
              <input
                id="manual-evidence-file"
                name="evidenceFile"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp"
                className="w-full rounded-md border border-border-strong px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="manual-summary"
                className="mb-1 block text-sm font-medium text-text-secondary"
              >
                Summary
              </label>
              <textarea
                id="manual-summary"
                name="summary"
                required
                rows={3}
                placeholder="e.g. Quarterly access review evidence, collected after admin sign-off."
                className="w-full rounded-md border border-border-strong px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              size="sm"
              disabled={recording || controlOptions.length === 0}
            >
              {recording ? "Saving..." : "Record Evidence"}
            </Button>
            {recordResult ? (
              <span role="status" className="text-sm text-success-700">
                {recordResult}
              </span>
            ) : null}
          </div>
          {recordError ? (
            <Alert tone="danger" className="mt-4">
              {recordError}
            </Alert>
          ) : null}
        </form>
      ) : null}

      {exportError ? (
        <Alert tone="danger" className="mb-4">
          {exportError}
        </Alert>
      ) : null}

      {downloadError ? (
        <Alert tone="danger" className="mb-4">
          {downloadError}
        </Alert>
      ) : null}

      {exportResult ? (
        <Alert tone="success" title="Bundle ready" className="mb-4">
          <a
            href={exportResult.downloadUrl}
            download
            className="text-success-700 underline"
          >
            Download evidence bundle
          </a>
          <span className="text-text-muted">
            {" "}
            You must be signed in as a SOC 2 admin to download.{" "}
            This link expires at{" "}
            {exportResult.expiresAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            (15 minutes).
          </span>
        </Alert>
      ) : null}
      {bundleExpired ? (
        <Alert tone="warning" className="mb-4">
          The download link has expired. Export a new bundle to get a fresh link.
        </Alert>
      ) : null}

      {/* Filter bar */}
      {evidence.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {sources.length > 1 ? (
            <Select value={source || ALL_FILTER} onValueChange={(v) => setFilter("source", v)}>
              <SelectTrigger className="w-48 text-sm" aria-label="Filter by source">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>All sources</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <div className="flex items-center gap-2">
            <Label htmlFor="evidence-date-from" className="text-sm text-text-secondary whitespace-nowrap">
              From
            </Label>
            <InputPrimitive
              id="evidence-date-from"
              type="date"
              value={dateFrom ?? ""}
              onChange={(e) => setFilter("dateFrom", e.target.value)}
              className="w-36 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="evidence-date-to" className="text-sm text-text-secondary whitespace-nowrap">
              To
            </Label>
            <InputPrimitive
              id="evidence-date-to"
              type="date"
              value={dateTo ?? ""}
              onChange={(e) => setFilter("dateTo", e.target.value)}
              className="w-36 text-sm"
            />
          </div>

          {hasActiveEvidenceFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-text-link hover:underline"
            >
              Clear filters
            </button>
          ) : null}

          {hasActiveEvidenceFilters ? (
            <span className="text-sm text-text-muted">
              {filteredEvidence.length} of {evidence.length} shown
            </span>
          ) : null}
        </div>
      ) : null}

      {evidence.length === 0 ? (
        <EmptyState
          heading={
            controlId ? `No evidence for ${controlId}` : "No evidence collected"
          }
          description="Evidence will appear here after you upload files or run a collection job for a control."
          action={
            <Button asChild variant="outline">
              <Link to="/app/soc2/controls" search={{ missingOnly: undefined, q: undefined, sort: undefined, dir: undefined }}>View controls</Link>
            </Button>
          }
        />
      ) : filteredEvidence.length === 0 ? (
        <div className="rounded-md border border-dashed border-border-subtle px-4 py-8 text-center text-sm text-text-muted">
          No evidence matches these filters.{" "}
          <button type="button" onClick={clearFilters} className="text-text-link hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <TableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableEvidenceHead col="controlId">Control</SortableEvidenceHead>
                <SortableEvidenceHead col="source">Source</SortableEvidenceHead>
                <SortableEvidenceHead col="collectedAt">Collected</SortableEvidenceHead>
                <TableHead>Summary</TableHead>
                <TableHead>Artifact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvidence.map((ev: EvidenceRow) => (
                <TableRow key={ev.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    {ev.controlId}
                  </TableCell>
                  <TableCell className="min-w-40 break-words text-text-secondary">
                    {ev.source}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-text-secondary">
                    {formatDate(ev.collectedAt)}
                  </TableCell>
                  <TableCell className="min-w-72 break-words">
                    {getEvidenceSummary(ev)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {ev.hasArtifact ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadEvidence(ev.id)}
                        disabled={downloadingEvidenceId === ev.id}
                      >
                        {downloadingEvidenceId === ev.id
                          ? "Downloading..."
                          : "Download artifact"}
                      </Button>
                    ) : ev.artifactScanStatus === "pending" ? (
                      <span className="text-text-muted">Scan pending</span>
                    ) : ev.artifactScanStatus === "infected" ? (
                      <span className="text-danger-700">Blocked</span>
                    ) : (
                      <span className="text-text-muted">Not attached</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      )}
    </div>
  );
}

function BackLink({ controlId }: { controlId?: string }) {
  return (
    <BackLinkNav>
      <BackLinkAnchor as={Link} to="/app/soc2">
        Back to SOC 2
      </BackLinkAnchor>
      {controlId ? (
        <Link
          to="/app/soc2/controls"
          search={{ missingOnly: undefined, q: undefined, sort: undefined, dir: undefined }}
          className={BACK_LINK_ANCHOR_CLASS}
        >
          Back to controls
        </Link>
      ) : null}
    </BackLinkNav>
  );
}
