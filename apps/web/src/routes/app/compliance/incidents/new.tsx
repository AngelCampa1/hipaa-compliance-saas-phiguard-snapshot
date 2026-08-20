import { createFileRoute, useNavigate, Link, useBlocker } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppRouteErrorBoundary } from '../../../../components/compliance-error-boundary'
import { getClientErrorMessage } from "../../../../lib/client-errors.js";
import {
  Alert,
  Button,
  Checkbox,
  InputPrimitive,
  Label,
  PageHeader,
  Panel,
  PanelHeader,
  TextareaPrimitive,
} from "@phiguard/ui";
import {
  createIncidentFn,
  getComplianceScopeFn,
} from "../../../../server/compliance.js";
import { trackProductEvent } from "../../../../lib/product-analytics-browser";
import { detectPhiShape } from "../../../../lib/phi-detect.js";

export const Route = createFileRoute("/app/compliance/incidents/new")({
  beforeLoad: async () => {
    const scope = await getComplianceScopeFn();
    return { scope };
  },
  component: NewIncidentPage,
  errorComponent: AppRouteErrorBoundary,
});

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
] as const;

const CATEGORY_OPTIONS = [
  { value: "unauthorized_access", label: "Unauthorized Access" },
  { value: "lost_device", label: "Lost or Stolen Device" },
  { value: "phishing", label: "Phishing" },
  { value: "improper_disposal", label: "Improper Disposal of PHI" },
  { value: "system_compromise", label: "System Compromise" },
  { value: "workforce_violation", label: "Workforce Policy Violation" },
  { value: "other", label: "Other" },
] as const;

const SYSTEM_OPTIONS = [
  "EHR System",
  "Practice Management Software",
  "Email",
  "Physical Records",
  "Portable Device (laptop, tablet, phone)",
  "Network / VPN",
  "Cloud Storage",
  "Other",
];

type Severity = (typeof SEVERITY_OPTIONS)[number]["value"];
type Category = (typeof CATEGORY_OPTIONS)[number]["value"];

const selectClass =
  "w-full rounded-md border border-border-strong bg-background p-2 text-sm text-text-primary";

function NewIncidentPage() {
  const navigate = useNavigate();
  const { scope } = Route.useRouteContext();
  const isReadOnly = !scope.canWrite;

  // Auto-bind single location
  const singleLocation = scope.locations.length === 1 ? scope.locations[0] : null;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [severity, setSeverity] = useState<Severity>("low");
  const [category, setCategory] = useState<Category>("other");
  const [discoveredAt, setDiscoveredAt] = useState("");
  const [locationId, setLocationId] = useState(
    singleLocation?.id ?? scope.defaultLocationId ?? "",
  );
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [phiAcknowledged, setPhiAcknowledged] = useState(false);

  // Dirty tracking for navigation block
  const isDirty = title.trim() !== "" || summary.trim() !== "" || discoveredAt !== "";

  // PHI shape detection on summary
  const phiHits = detectPhiShape(summary).hits;
  const hasPhiWarning = phiHits.length > 0;

  // Block navigation when form is dirty and not yet submitted
  useBlocker({
    blockerFn: () =>
      window.confirm(
        "You have unsaved changes. Leave this page and discard the incident report?",
      ),
    condition: isDirty && !submitting,
  });

  // Also block on browser back/close
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const toggleSystem = (system: string) => {
    setSelectedSystems((prev) =>
      prev.includes(system)
        ? prev.filter((s) => s !== system)
        : [...prev, system],
    );
  };

  const canSubmit =
    !submitting &&
    title.trim() !== "" &&
    discoveredAt !== "" &&
    (scope.locations.length <= 1 || locationId !== "") &&
    (!hasPhiWarning || phiAcknowledged);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const created = await createIncidentFn({
        data: {
          title: title.trim(),
          summary: summary.trim() || undefined,
          severity,
          locationId: locationId || undefined,
          category,
          discoveredAt: new Date(discoveredAt).toISOString(),
          affectedSystems:
            selectedSystems.length > 0 ? selectedSystems : undefined,
        },
      });
      trackProductEvent("incident_created", {
        route: "/app/compliance/incidents",
        status: created.status,
      });
      await navigate({
        to: "/app/compliance/incidents/$incidentId",
        params: { incidentId: created.id },
      });
    } catch (err) {
      setError(getClientErrorMessage(err, {
        route: '/app/compliance/incidents/new',
        operation: 'incident.create',
        fallbackMessage: 'Failed to file the incident report. Please try again.',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <nav>
        <Link to="/app/compliance/incidents" search={{ locationId: undefined, severity: undefined, status: undefined, category: undefined, q: undefined, sort: undefined, dir: undefined }} className="text-sm text-text-muted hover:text-text-primary">
          &larr; Incidents
        </Link>
      </nav>

      <PageHeader
        eyebrow="Incident response"
        title="Report security incident"
        description="File a factual incident record. Do not include patient-identifying details."
      />

      {isReadOnly ? (
        <Alert tone="warning">Read-only access. Incident reporting is disabled in this workspace.</Alert>
      ) : null}

      {error ? <Alert tone="danger">{error}</Alert> : null}

      {!isReadOnly ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Panel>
            <PanelHeader title="Incident classification" description="Select the location, severity, category, and discovery time." />
            <div className="grid gap-4 sm:grid-cols-2">
              {singleLocation ? (
                <div className="sm:col-span-2">
                  <p className="text-sm text-text-secondary">
                    Reporting for: <span className="font-medium text-text-primary">{singleLocation.name}</span>
                  </p>
                </div>
              ) : scope.locations.length > 1 ? (
                <div className="sm:col-span-2">
                  <Label htmlFor="location">
                    Location <span aria-hidden>*</span>
                  </Label>
                  <select
                    id="location"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    required
                    className={selectClass}
                  >
                    <option value="">Select a location</option>
                    {scope.locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="sm:col-span-2">
                <Label htmlFor="title">
                  Incident title <span aria-hidden>*</span>
                </Label>
                <InputPrimitive
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  placeholder="e.g. Laptop reported lost by staff member"
                />
              </div>

              <div>
                <Label htmlFor="severity">
                  Severity <span aria-hidden>*</span>
                </Label>
                <select
                  id="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  required
                  className={selectClass}
                >
                  {SEVERITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="category">
                  Incident category <span aria-hidden>*</span>
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  required
                  className={selectClass}
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="discoveredAt">
                  Date/time discovered <span aria-hidden>*</span>
                </Label>
                <InputPrimitive
                  id="discoveredAt"
                  type="datetime-local"
                  required
                  value={discoveredAt}
                  onChange={(e) => setDiscoveredAt(e.target.value)}
                />
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Affected systems" description="Select each system involved in the incident." />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SYSTEM_OPTIONS.map((sys) => (
                <label key={sys} className="flex min-w-0 cursor-pointer items-center gap-2 rounded-md border border-border-default p-3">
                  <input
                    type="checkbox"
                    checked={selectedSystems.includes(sys)}
                    onChange={() => toggleSystem(sys)}
                  />
                  <span className="break-words text-sm">{sys}</span>
                </label>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Summary" description="Describe what happened using operational facts only." />
            <Alert role="note" tone="warning" className="mb-3" title="Do not include PHI">
              Do not include patient names, MRNs, dates of birth, or other PHI.
            </Alert>
            <Label htmlFor="summary" className="sr-only">
              Incident summary
            </Label>
            <TextareaPrimitive
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Describe what happened without including patient-identifying information."
              className="resize-y"
            />
            <div className="mt-1 text-right text-xs text-text-disabled">
              {summary.length} / 2000
            </div>

            {hasPhiWarning ? (
              <div className="mt-3 rounded-md border border-danger-200 bg-danger-50 p-3">
                <p className="text-sm font-semibold text-danger-800">
                  Possible PHI detected in summary
                </p>
                <p className="mt-1 text-xs text-danger-700">
                  The summary may contain patient-identifying information ({phiHits.map((h) => h.type.toUpperCase()).join(', ')} pattern detected).
                  Review and remove any PHI before filing.
                </p>
                <div className="mt-3 flex items-start gap-2">
                  <Checkbox
                    id="phi-acknowledge"
                    checked={phiAcknowledged}
                    onCheckedChange={(checked) => setPhiAcknowledged(checked === true)}
                  />
                  <label htmlFor="phi-acknowledge" className="cursor-pointer text-xs text-danger-800">
                    I have reviewed the summary. It does not contain PHI, or I have authorization to include this information.
                  </label>
                </div>
              </div>
            ) : null}
          </Panel>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="submit"
              disabled={!canSubmit}
            >
              {submitting ? "Filing incident..." : "File incident report"}
            </Button>
            <Link
              to="/app/compliance/incidents" search={{ locationId: undefined, severity: undefined, status: undefined, category: undefined, q: undefined, sort: undefined, dir: undefined }}
              className="px-4 py-2 text-text-muted"
            >
              Cancel
            </Link>
          </div>
        </form>
      ) : null}
    </div>
  );
}
