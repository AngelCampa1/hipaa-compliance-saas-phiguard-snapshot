import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useCallback, useDeferredValue, useEffect, useRef, useState, type FormEvent } from "react";
import { isFeatureGateError } from "@phiguard/billing";
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
  BackLinkAnchor,
  BackLinkNav,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  InputPrimitive,
  Label,
  PageHeader,
  Panel,
  PanelHeader,
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
import { FeatureGate } from "../../../components/feature-gate.js";
import { AppRouteErrorBoundary } from "../../../components/compliance-error-boundary";
import { formatDate } from "../../../lib/dates.js";
import {
  getProductAnalyticsRowCountBucket,
  trackProductEvent,
} from "../../../lib/product-analytics-browser.js";
import { CREATE_ONLY_UPLOAD_HEADERS } from "../../../lib/s3.js";
import { getOrgFeatureContextFn } from "../../../server/feature-context.js";
import {
  createVendorFn,
  downloadVendorBaaEvidenceFn,
  listVendorsFn,
  listVendorBaasFn,
  markVendorInactiveFn,
  presignVendorBaaUploadFn,
  reactivateVendorFn,
  recordVendorBaaFn,
  updateLatestVendorBaaFn,
  updateVendorFn,
} from "../../../server/program.js";

export const Route = createFileRoute("/app/compliance/program/vendors")({
  validateSearch: (search: Record<string, unknown>) => ({
    baaState: (search.baaState as string | undefined) ?? undefined,
    q: (search.q as string | undefined) ?? undefined,
    sort: (search.sort as string | undefined) ?? undefined,
    dir: (search.dir as "asc" | "desc" | undefined) ?? undefined,
  }),
  loader: async () => {
    try {
      return await listVendorsFn();
    } catch (err) {
      if (isFeatureGateError(err))
        return { gatedOrg: await getOrgFeatureContextFn() };
      throw err;
    }
  },
  component: VendorsPage,
  errorComponent: AppRouteErrorBoundary,
});

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  pending_baa: "BAA Pending",
};

const STATUS_BADGE: Record<string, "success" | "default" | "warning"> = {
  active: "success",
  inactive: "default",
  pending_baa: "warning",
};

const VENDOR_DATA_CATEGORY_OPTIONS = [
  "PHI",
  "Billing records",
  "User accounts",
  "Device identifiers",
  "Support tickets",
];

// Normalize website: lowercase, ensure https:// prefix
function normalizeWebsite(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/^http:\/\//, "https://");
  }
  return `https://${trimmed}`;
}

// Sentinel for the "All" filter option — Radix Select.Item cannot use an empty string.
const ALL_FILTER = "all";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/.+\..+/;

type SortVendorKey = "name" | "status" | "baaState";
const VENDOR_ANALYTICS_ROUTE = "/app/compliance/program/vendors";

function trackVendorActionFailed(operation: string) {
  trackProductEvent("vendor_action_failed", {
    route: VENDOR_ANALYTICS_ROUTE,
    operation,
    error_type: "client_error",
  });
}

function VendorsPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/app/compliance/program/vendors" });
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showRecordBaa, setShowRecordBaa] = useState<string | null>(null);
  const [editVendorId, setEditVendorId] = useState<string | null>(null);
  const [showBaaHistory, setShowBaaHistory] = useState<string | null>(null);
  const [editBaaVendorId, setEditBaaVendorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Add vendor form
  const [vendorName, setVendorName] = useState("");
  const [vendorWebsite, setVendorWebsite] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorCategories, setVendorCategories] = useState<string[]>([]);
  const [addingVendor, setAddingVendor] = useState(false);
  const [downloadingBaaId, setDownloadingBaaId] = useState<string | null>(null);

  // Search/filter state
  const [localQ, setLocalQ] = useState(search.q ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deferredQ = useDeferredValue(localQ);

  useEffect(() => {
    setLocalQ(search.q ?? "");
  }, [search.q]);

  const handleQChange = useCallback(
    (value: string) => {
      setLocalQ(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        trackProductEvent("vendor_filter_changed", {
          route: VENDOR_ANALYTICS_ROUTE,
          has_active_filters: Boolean(value.trim() || search.baaState),
        });
        void navigate({ search: (prev) => ({ ...prev, q: value }) });
      }, 300);
    },
    [navigate, search.baaState],
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      // Radix Select.Item cannot use an empty value; the "All" option uses the
      // ALL_FILTER sentinel, mapped back to undefined to clear the filter.
      const next = value === ALL_FILTER || value === "" ? undefined : value;
      trackProductEvent("vendor_filter_changed", {
        route: VENDOR_ANALYTICS_ROUTE,
        has_active_filters: Boolean(next || search.q),
      });
      void navigate({ search: (prev) => ({ ...prev, [key]: next }) });
    },
    [navigate, search.q],
  );

  const clearFilters = useCallback(() => {
    trackProductEvent("vendor_filter_changed", {
      route: VENDOR_ANALYTICS_ROUTE,
      has_active_filters: false,
    });
    void navigate({ search: () => ({ baaState: undefined, q: undefined, sort: undefined, dir: undefined }) });
    setLocalQ("");
  }, [navigate]);

  const toggleSort = useCallback(
    (col: SortVendorKey) => {
      const nextDir = search.sort === col && search.dir === "desc" ? "asc" : "desc";
      trackProductEvent("vendor_sort_changed", {
        route: VENDOR_ANALYTICS_ROUTE,
        sort_key: col,
        sort_dir: nextDir,
      });
      void navigate({
        search: (prev) => ({
          ...prev,
          sort: col,
          dir: prev.sort === col && prev.dir === "desc" ? "asc" : "desc",
        }),
      });
    },
    [navigate, search.dir, search.sort],
  );

  // Edit vendor form
  const [editName, setEditName] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [savingVendor, setSavingVendor] = useState(false);

  // Record BAA form
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signedAt, setSignedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [baaFile, setBaaFile] = useState<File | null>(null);
  const [recordingBaa, setRecordingBaa] = useState(false);
  const [inactivatingVendorId, setInactivatingVendorId] = useState<
    string | null
  >(null);

  // BAA history
  const [baaHistoryList, setBaaHistoryList] = useState<
    Awaited<ReturnType<typeof listVendorBaasFn>> | null
  >(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Edit BAA form
  const [editBaaSignerName, setEditBaaSignerName] = useState("");
  const [editBaaSignerEmail, setEditBaaSignerEmail] = useState("");
  const [editBaaSignedAt, setEditBaaSignedAt] = useState("");
  const [editBaaExpiresAt, setEditBaaExpiresAt] = useState("");
  const [savingBaa, setSavingBaa] = useState(false);

  if ("gatedOrg" in data) {
    return (
      <div className="mx-auto max-w-5xl">
        <BackLink />
        <PageHeader
          title="Vendors"
          description="Business associates and their BAA status."
        />
        <FeatureGate feature="compliance_addon" org={data.gatedOrg}>
          {null}
        </FeatureGate>
      </div>
    );
  }

  const { vendors, canAdmin } = data;

  // Client-side filter + sort
  const baaStateLabels: Record<string, string> = {
    current: "BAA Active",
    expiring: "BAA Expiring",
    expired: "BAA Expired",
    missing: "BAA Pending",
    inactive: "Inactive",
  };

  const q = deferredQ.trim().toLowerCase();
  let filteredVendors = vendors;
  if (search.baaState) {
    filteredVendors = filteredVendors.filter((v) => {
      if (search.baaState === "inactive") return v.status === "inactive";
      const state = v.latestBaa?.baaState ?? "missing";
      if (v.status !== "inactive" && search.baaState === "missing") return state === "missing";
      return state === search.baaState && v.status !== "inactive";
    });
  }
  if (q) {
    filteredVendors = filteredVendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        (v.contactEmail ?? "").toLowerCase().includes(q) ||
        (v.website ?? "").toLowerCase().includes(q),
    );
  }

  const sortKey = (search.sort as SortVendorKey | undefined) ?? "name";
  const sortDir = search.dir ?? "asc";
  filteredVendors = [...filteredVendors].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "baaState") {
      const stateA = a.latestBaa?.baaState ?? "missing";
      const stateB = b.latestBaa?.baaState ?? "missing";
      cmp = stateA.localeCompare(stateB);
    } else if (sortKey === "status") {
      cmp = a.status.localeCompare(b.status);
    } else {
      cmp = a.name.localeCompare(b.name);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const hasActiveFilters = Boolean(search.baaState || search.q);

  function SortIndicator({ col }: { col: SortVendorKey }) {
    if (sortKey !== col) return null;
    return <span className="ml-1 text-text-muted">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  function SortableVendorHead({
    col,
    children,
    className,
  }: {
    col: SortVendorKey;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <TableHead
        className={className}
        onClick={() => toggleSort(col)}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        {children}
        <SortIndicator col={col} />
      </TableHead>
    );
  }

  const activeVendors = vendors.filter(
    (vendor) => vendor.status !== "inactive",
  );
  const pendingBaaCount = activeVendors.filter(
    (vendor) => vendor.status === "pending_baa",
  ).length;
  const expiredBaaCount = activeVendors.filter(
    (vendor) => vendor.latestBaa?.baaState === "expired",
  ).length;
  const expiringBaaCount = activeVendors.filter(
    (vendor) => vendor.latestBaa?.baaState === "expiring",
  ).length;

  const handleAddVendor = async (event: FormEvent) => {
    event.preventDefault();
    if (!vendorName.trim()) return;

    // Validate website
    const normalizedWebsite = vendorWebsite
      ? normalizeWebsite(vendorWebsite)
      : "";
    if (normalizedWebsite && !URL_PATTERN.test(normalizedWebsite)) {
      setError("Website must be a valid URL.");
      return;
    }

    // Validate contact email
    if (vendorEmail && !EMAIL_PATTERN.test(vendorEmail)) {
      setError("Contact email must be a valid email address.");
      return;
    }

    setError(null);
    setAddingVendor(true);
    try {
      await createVendorFn({
        data: {
          name: vendorName.trim(),
          website: normalizedWebsite || undefined,
          contactEmail: vendorEmail || undefined,
          dataCategories: vendorCategories,
        },
      });
      trackProductEvent("vendor_added", {
        route: VENDOR_ANALYTICS_ROUTE,
      });
      setNotice("Vendor added.");
      setShowAddVendor(false);
      setVendorName("");
      setVendorWebsite("");
      setVendorEmail("");
      setVendorCategories([]);
      await router.invalidate();
    } catch (err) {
      trackVendorActionFailed("vendor.create");
      setError((err as Error).message);
    } finally {
      setAddingVendor(false);
    }
  };

  const toggleVendorCategory = (
    category: string,
    current: string[],
    setter: (fn: (prev: string[]) => string[]) => void,
  ) => {
    setter((prev) =>
      prev.includes(category)
        ? prev.filter((entry) => entry !== category)
        : [...prev, category],
    );
  };

  const handleMarkVendorInactive = async (vendorId: string) => {
    setError(null);
    setNotice(null);
    setInactivatingVendorId(vendorId);
    try {
      await markVendorInactiveFn({ data: { vendorId } });
      trackProductEvent("vendor_status_changed", {
        route: VENDOR_ANALYTICS_ROUTE,
        status: "inactive",
      });
      setNotice("Vendor marked inactive.");
      await router.invalidate();
    } catch (err) {
      trackVendorActionFailed("vendor.mark_inactive");
      setError((err as Error).message);
    } finally {
      setInactivatingVendorId(null);
    }
  };

  const handleReactivateVendor = async (vendorId: string) => {
    setError(null);
    setNotice(null);
    try {
      await reactivateVendorFn({ data: { vendorId } });
      trackProductEvent("vendor_status_changed", {
        route: VENDOR_ANALYTICS_ROUTE,
        status: "active",
      });
      setNotice("Vendor reactivated.");
      await router.invalidate();
    } catch (err) {
      trackVendorActionFailed("vendor.reactivate");
      setError((err as Error).message);
    }
  };

  const openEditVendor = (vendor: (typeof vendors)[number]) => {
    setEditName(vendor.name);
    setEditWebsite(vendor.website ?? "");
    setEditEmail(vendor.contactEmail ?? "");
    setEditCategories(vendor.dataCategories ?? []);
    setEditVendorId(vendor.id);
    setError(null);
  };

  const handleSaveVendor = async (event: FormEvent) => {
    event.preventDefault();
    if (!editVendorId) return;

    const normalizedWebsite = editWebsite ? normalizeWebsite(editWebsite) : "";
    if (normalizedWebsite && !URL_PATTERN.test(normalizedWebsite)) {
      setError("Website must be a valid URL.");
      return;
    }
    if (editEmail && !EMAIL_PATTERN.test(editEmail)) {
      setError("Contact email must be a valid email address.");
      return;
    }

    setError(null);
    setSavingVendor(true);
    try {
      await updateVendorFn({
        data: {
          vendorId: editVendorId,
          name: editName.trim() || undefined,
          website: normalizedWebsite || null,
          contactEmail: editEmail || null,
          dataCategories: editCategories,
        },
      });
      trackProductEvent("vendor_updated", {
        route: VENDOR_ANALYTICS_ROUTE,
      });
      setNotice("Vendor updated.");
      setEditVendorId(null);
      await router.invalidate();
    } catch (err) {
      trackVendorActionFailed("vendor.update");
      setError((err as Error).message);
    } finally {
      setSavingVendor(false);
    }
  };

  const handleDownloadBaaEvidence = async (baaId: string) => {
    setError(null);
    setDownloadingBaaId(baaId);
    try {
      const { downloadUrl } = await downloadVendorBaaEvidenceFn({
        data: { baaId },
      });
      trackProductEvent("vendor_baa_evidence_downloaded", {
        route: VENDOR_ANALYTICS_ROUTE,
        document_type: "baa",
      });
      window.location.assign(downloadUrl);
    } catch (err) {
      trackVendorActionFailed("vendor_baa.download");
      setError((err as Error).message);
    } finally {
      setDownloadingBaaId(null);
    }
  };

  const handleRecordBaa = async (event: FormEvent) => {
    event.preventDefault();
    if (!showRecordBaa || !signerName || !signerEmail || !signedAt) return;

    // Validate: expiresAt must be after signedAt
    if (expiresAt && expiresAt <= signedAt) {
      setError("Expiration date must be after the signed date.");
      return;
    }

    setError(null);
    setRecordingBaa(true);
    try {
      let documentFileKey: string | undefined;
      if (baaFile) {
        const upload = await presignVendorBaaUploadFn({
          data: {
            vendorId: showRecordBaa,
            filename: baaFile.name,
            contentType: baaFile.type,
            sizeBytes: baaFile.size,
          },
        });

        const uploadResponse = await fetch(upload.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": baaFile.type,
            ...CREATE_ONLY_UPLOAD_HEADERS,
          },
          body: baaFile,
        });

        if (!uploadResponse.ok) {
          throw new Error("BAA evidence upload failed");
        }

        documentFileKey = upload.key;
      }

      await recordVendorBaaFn({
        data: {
          vendorId: showRecordBaa,
          signedAt: new Date(signedAt).toISOString(),
          signerName,
          signerEmail,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
          documentFileKey,
        },
      });
      trackProductEvent("vendor_baa_recorded", {
        route: VENDOR_ANALYTICS_ROUTE,
        status: "active",
      });

      if (!expiresAt) {
        setNotice(
          "BAA recorded. No expiration date was set - add one to enable renewal tracking.",
        );
      } else {
        setNotice("BAA recorded.");
      }

      setShowRecordBaa(null);
      setSignerName("");
      setSignerEmail("");
      setSignedAt("");
      setExpiresAt("");
      setBaaFile(null);
      await router.invalidate();
    } catch (err) {
      trackVendorActionFailed("vendor_baa.record");
      setError((err as Error).message);
    } finally {
      setRecordingBaa(false);
    }
  };

  const openBaaHistory = async (vendorId: string) => {
    setShowBaaHistory(vendorId);
    setLoadingHistory(true);
    setBaaHistoryList(null);
    try {
      const list = await listVendorBaasFn({ data: { vendorId } });
      setBaaHistoryList(list);
      trackProductEvent("vendor_baa_history_opened", {
        route: VENDOR_ANALYTICS_ROUTE,
        row_count_bucket: getProductAnalyticsRowCountBucket(list.length),
      });
    } catch (err) {
      trackVendorActionFailed("vendor_baa.history");
      setError((err as Error).message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const openEditBaa = (baa: {
    signerName: string;
    signerEmail: string;
    signedAt: Date | string;
    expiresAt: Date | string | null;
  }) => {
    setEditBaaSignerName(baa.signerName);
    setEditBaaSignerEmail(baa.signerEmail);
    setEditBaaSignedAt(
      new Date(baa.signedAt).toISOString().slice(0, 16),
    );
    setEditBaaExpiresAt(
      baa.expiresAt
        ? new Date(baa.expiresAt).toISOString().slice(0, 16)
        : "",
    );
  };

  const handleSaveBaa = async (event: FormEvent) => {
    event.preventDefault();
    if (!editBaaVendorId) return;

    if (editBaaExpiresAt && editBaaSignedAt && editBaaExpiresAt <= editBaaSignedAt) {
      setError("Expiration date must be after the signed date.");
      return;
    }

    setError(null);
    setSavingBaa(true);
    try {
      await updateLatestVendorBaaFn({
        data: {
          vendorId: editBaaVendorId,
          signerName: editBaaSignerName || undefined,
          signerEmail: editBaaSignerEmail || undefined,
          signedAt: editBaaSignedAt
            ? new Date(editBaaSignedAt).toISOString()
            : undefined,
          expiresAt: editBaaExpiresAt
            ? new Date(editBaaExpiresAt).toISOString()
            : null,
        },
      });
      trackProductEvent("vendor_baa_metadata_updated", {
        route: VENDOR_ANALYTICS_ROUTE,
        document_type: "baa",
      });
      setNotice("BAA metadata updated.");
      setEditBaaVendorId(null);
      setShowBaaHistory(null);
      await router.invalidate();
    } catch (err) {
      trackVendorActionFailed("vendor_baa.update");
      setError((err as Error).message);
    } finally {
      setSavingBaa(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink />

      <PageHeader
        title="Vendors"
        description="Track business associates and their BAA status for compliance review."
        actions={
          canAdmin ? (
            <Button onClick={() => setShowAddVendor(true)}>Add Vendor</Button>
          ) : null
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryMetric
          label="Vendors"
          value={vendors.length}
          detail="Business associates on file"
        />
        <SummaryMetric
          label="BAA pending"
          value={pendingBaaCount}
          detail="No BAA recorded yet"
          tone={pendingBaaCount > 0 ? "warning" : "success"}
        />
        <SummaryMetric
          label="Expired BAAs"
          value={expiredBaaCount}
          detail="Needs renewal now"
          tone={expiredBaaCount > 0 ? "danger" : "success"}
        />
        <SummaryMetric
          label="Expiring BAAs"
          value={expiringBaaCount}
          detail="Next 60 days"
          tone={expiringBaaCount > 0 ? "warning" : "success"}
        />
      </div>

      {error ? (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {notice ? (
        <Alert tone="success" className="mb-4">
          {notice}
        </Alert>
      ) : null}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Select value={search.baaState || ALL_FILTER} onValueChange={(v) => setFilter("baaState", v)}>
          <SelectTrigger className="w-40 text-sm" aria-label="Filter by BAA status">
            <SelectValue placeholder="BAA status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All statuses</SelectItem>
            {Object.entries(baaStateLabels).map(([k, label]) => (
              <SelectItem key={k} value={k}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <InputPrimitive
          type="search"
          placeholder="Search by name or email…"
          value={localQ}
          onChange={(e) => handleQChange(e.target.value)}
          className="w-60 text-sm"
          aria-label="Search vendors"
        />

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-text-link hover:underline"
          >
            Clear filters
          </button>
        ) : null}

        {hasActiveFilters ? (
          <span className="text-sm text-text-muted">
            {filteredVendors.length} of {vendors.length} shown
          </span>
        ) : null}
      </div>

      {showAddVendor ? (
        <Panel className="mb-6">
          <form onSubmit={handleAddVendor}>
            <PanelHeader
              title="Add Vendor"
              description="Add the vendor now. You can record BAA details later when available."
            />
            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="min-w-0">
                <Label htmlFor="vendor-name">Vendor name *</Label>
                <InputPrimitive
                  id="vendor-name"
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                />
              </div>
              <div className="min-w-0">
                <Label htmlFor="vendor-email">Contact email</Label>
                <InputPrimitive
                  id="vendor-email"
                  type="email"
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                />
              </div>
              <div className="min-w-0">
                <Label htmlFor="vendor-website">Website</Label>
                <InputPrimitive
                  id="vendor-website"
                  type="text"
                  placeholder="example.com"
                  value={vendorWebsite}
                  onChange={(e) => setVendorWebsite(e.target.value)}
                />
                <p className="mt-1 text-xs text-text-muted">
                  URL will be normalized to https://
                </p>
              </div>
              <fieldset className="min-w-0 md:col-span-2">
                <legend className="mb-2 text-sm font-medium text-text-primary">
                  Data categories
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {VENDOR_DATA_CATEGORY_OPTIONS.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 text-sm text-text-secondary"
                    >
                      <input
                        type="checkbox"
                        checked={vendorCategories.includes(category)}
                        onChange={() =>
                          toggleVendorCategory(
                            category,
                            vendorCategories,
                            setVendorCategories,
                          )
                        }
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={addingVendor || !vendorName.trim()}
              >
                {addingVendor ? "Adding..." : "Add Vendor"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddVendor(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      {showRecordBaa ? (
        <Panel className="mb-6">
          <form onSubmit={handleRecordBaa}>
            <PanelHeader
              title="Record BAA metadata"
              description="Enter the signer name and signed date. Upload the signed BAA file when you have it."
            />
            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="min-w-0">
                <Label htmlFor="baa-signer-name">Signer name *</Label>
                <InputPrimitive
                  id="baa-signer-name"
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  required
                />
              </div>
              <div className="min-w-0">
                <Label htmlFor="baa-signer-email">Signer email *</Label>
                <InputPrimitive
                  id="baa-signer-email"
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  required
                />
              </div>
              <div className="min-w-0">
                <Label htmlFor="baa-signed-at">Signed date *</Label>
                <InputPrimitive
                  id="baa-signed-at"
                  type="date"
                  value={signedAt}
                  onChange={(e) => setSignedAt(e.target.value)}
                  required
                />
              </div>
              <div className="min-w-0">
                <Label htmlFor="baa-expires-at">Expires date</Label>
                <InputPrimitive
                  id="baa-expires-at"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
                {!expiresAt ? (
                  <p className="mt-1 text-xs text-warning-700">
                    No expiration date set. Renewal tracking will not be active.
                  </p>
                ) : null}
                {expiresAt && signedAt && expiresAt <= signedAt ? (
                  <p className="mt-1 text-xs text-danger-700">
                    Expiration date must be after the signed date.
                  </p>
                ) : null}
              </div>
              <div className="min-w-0 md:col-span-2">
                <Label htmlFor="baa-document">Signed BAA evidence</Label>
                <InputPrimitive
                  id="baa-document"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={(event) =>
                    setBaaFile(event.target.files?.[0] ?? null)
                  }
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={recordingBaa}>
                {recordingBaa ? "Recording..." : "Record BAA metadata"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRecordBaa(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      {/* Edit vendor dialog */}
      <Dialog
        open={editVendorId !== null}
        onOpenChange={(open) => {
          if (!open) setEditVendorId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveVendor}>
            <div className="grid gap-3 py-2">
              <div>
                <Label htmlFor="edit-vendor-name">Vendor name *</Label>
                <InputPrimitive
                  id="edit-vendor-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-vendor-email">Contact email</Label>
                <InputPrimitive
                  id="edit-vendor-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-vendor-website">Website</Label>
                <InputPrimitive
                  id="edit-vendor-website"
                  type="text"
                  placeholder="example.com"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                />
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-text-primary">
                  Data categories
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {VENDOR_DATA_CATEGORY_OPTIONS.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 text-sm text-text-secondary"
                    >
                      <input
                        type="checkbox"
                        checked={editCategories.includes(category)}
                        onChange={() =>
                          toggleVendorCategory(
                            category,
                            editCategories,
                            setEditCategories,
                          )
                        }
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={savingVendor || !editName.trim()}>
                {savingVendor ? "Saving..." : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditVendorId(null)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* BAA history dialog */}
      <Dialog
        open={showBaaHistory !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowBaaHistory(null);
            setEditBaaVendorId(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>BAA History</DialogTitle>
          </DialogHeader>
          {loadingHistory ? (
            <p className="py-4 text-sm text-text-muted">Loading…</p>
          ) : editBaaVendorId ? (
            <form onSubmit={handleSaveBaa}>
              <div className="grid gap-3 py-2">
                <div>
                  <Label htmlFor="edit-baa-signer-name">Signer name</Label>
                  <InputPrimitive
                    id="edit-baa-signer-name"
                    type="text"
                    value={editBaaSignerName}
                    onChange={(e) => setEditBaaSignerName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-baa-signer-email">Signer email</Label>
                  <InputPrimitive
                    id="edit-baa-signer-email"
                    type="email"
                    value={editBaaSignerEmail}
                    onChange={(e) => setEditBaaSignerEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-baa-signed-at">Signed date</Label>
                  <InputPrimitive
                    id="edit-baa-signed-at"
                    type="datetime-local"
                    value={editBaaSignedAt}
                    onChange={(e) => setEditBaaSignedAt(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-baa-expires-at">Expires date</Label>
                  <InputPrimitive
                    id="edit-baa-expires-at"
                    type="datetime-local"
                    value={editBaaExpiresAt}
                    onChange={(e) => setEditBaaExpiresAt(e.target.value)}
                  />
                  {editBaaExpiresAt && editBaaSignedAt && editBaaExpiresAt <= editBaaSignedAt ? (
                    <p className="mt-1 text-xs text-danger-700">
                      Expiration must be after the signed date.
                    </p>
                  ) : null}
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={savingBaa}>
                  {savingBaa ? "Saving..." : "Save BAA metadata"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditBaaVendorId(null)}
                >
                  Back
                </Button>
              </DialogFooter>
            </form>
          ) : baaHistoryList && baaHistoryList.length > 0 ? (
            <div className="py-2">
              <TableShell>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Signed</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Signer</TableHead>
                      {canAdmin ? <TableHead /> : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {baaHistoryList.map((baa, idx) => (
                      <TableRow key={baa.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(baa.signedAt)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {baa.expiresAt ? (
                            formatDate(baa.expiresAt)
                          ) : (
                            <span className="text-warning-700">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="break-all text-sm">
                          {baa.signerName}
                        </TableCell>
                        {canAdmin ? (
                          <TableCell>
                            {idx === 0 ? (
                              <Button
                                size="sm"
                                variant="outline"
                                type="button"
                                onClick={() => {
                                  if (showBaaHistory) {
                                    setEditBaaVendorId(showBaaHistory);
                                    openEditBaa(baa);
                                  }
                                }}
                              >
                                Edit
                              </Button>
                            ) : null}
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableShell>
            </div>
          ) : (
            <p className="py-4 text-sm text-text-muted">
              No BAAs on file for this vendor.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {vendors.length === 0 ? (
        <EmptyState
          heading="No vendors yet"
          description="Add the business associates that handle PHI on behalf of your organization."
          action={
            canAdmin ? (
              <Button onClick={() => setShowAddVendor(true)}>Add Vendor</Button>
            ) : null
          }
        />
      ) : filteredVendors.length === 0 ? (
        <div className="rounded-md border border-dashed border-border-subtle px-4 py-8 text-center text-sm text-text-muted">
          No vendors match the current filters.{" "}
          <button type="button" onClick={clearFilters} className="text-text-link hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <TableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableVendorHead col="name">Vendor</SortableVendorHead>
                <TableHead>Contact</TableHead>
                <SortableVendorHead col="baaState">BAA Status</SortableVendorHead>
                <TableHead>Latest BAA</TableHead>
                {canAdmin ? <TableHead>Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <div className="max-w-sm break-words font-semibold">
                      {vendor.name}
                    </div>
                    {vendor.website ? (
                      <div className="max-w-sm break-all text-xs text-text-muted">
                        <a
                          href={vendor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-link"
                        >
                          {vendor.website}
                        </a>
                      </div>
                    ) : null}
                    {vendor.dataCategories.length > 0 ? (
                      <div className="mt-2 flex max-w-sm flex-wrap gap-1">
                        {vendor.dataCategories.map((category) => (
                          <Badge key={category} variant="default">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="break-all">
                    {vendor.contactEmail ?? "Not provided"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getBaaBadgeVariant(
                        vendor.latestBaa,
                        vendor.status,
                      )}
                    >
                      {getBaaLabel(vendor.latestBaa, vendor.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-56">
                    {vendor.latestBaa ? (
                      <div className="text-sm">
                        <div>
                          Signed {formatDate(vendor.latestBaa.signedAt)}
                        </div>
                        <div className="text-text-muted">
                          Expires{" "}
                          {vendor.latestBaa.expiresAt ? (
                            formatDate(vendor.latestBaa.expiresAt)
                          ) : (
                            <span className="text-warning-700">Not set</span>
                          )}
                        </div>
                        {vendor.latestBaa.hasEvidence ? (
                          canAdmin ? (
                            <div className="mt-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDownloadBaaEvidence(
                                    vendor.latestBaa!.id,
                                  )
                                }
                                disabled={
                                  downloadingBaaId === vendor.latestBaa.id
                                }
                              >
                                {downloadingBaaId === vendor.latestBaa.id
                                  ? "Preparing..."
                                  : "Download evidence"}
                              </Button>
                            </div>
                          ) : (
                            <div className="mt-1 break-all text-xs text-text-muted">
                              Evidence recorded
                            </div>
                          )
                        ) : (
                          <div className="mt-1 text-xs text-warning-800">
                            No evidence file
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-text-muted">
                        Not recorded
                      </span>
                    )}
                  </TableCell>
                  {canAdmin ? (
                    <TableCell className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditVendor(vendor)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRecordBaa(vendor.id)}
                      >
                        Record BAA
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void openBaaHistory(vendor.id)}
                      >
                        BAA history
                      </Button>
                      {vendor.status !== "inactive" ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={inactivatingVendorId === vendor.id}
                            >
                              {inactivatingVendorId === vendor.id
                                ? "Marking..."
                                : "Mark inactive"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Mark vendor inactive?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {vendor.name} will be marked inactive. BAA records are kept. You can reactivate the vendor at any time.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  void handleMarkVendorInactive(vendor.id)
                                }
                              >
                                Mark inactive
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleReactivateVendor(vendor.id)}
                        >
                          Reactivate
                        </Button>
                      )}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
      )}
    </div>
  );
}

type LatestBaa = NonNullable<
  Awaited<ReturnType<typeof listVendorsFn>>["vendors"][number]["latestBaa"]
>;

function getBaaLabel(baa: LatestBaa | null, fallbackStatus: string) {
  if (fallbackStatus === "inactive") return STATUS_LABELS.inactive;

  const state = baa?.baaState ?? "missing";
  if (state === "missing")
    return STATUS_LABELS[fallbackStatus] ?? fallbackStatus;
  if (state === "expired") return "BAA Expired";
  if (state === "expiring") return "BAA Expiring";
  return "BAA Active";
}

function getBaaBadgeVariant(baa: LatestBaa | null, fallbackStatus: string) {
  if (fallbackStatus === "inactive") return STATUS_BADGE.inactive;

  const state = baa?.baaState ?? "missing";
  if (state === "expired") return "danger";
  if (state === "expiring") return "warning";
  if (state === "current") return "success";
  return STATUS_BADGE[fallbackStatus] ?? "default";
}

function BackLink() {
  return (
    <BackLinkNav>
      <BackLinkAnchor as={Link} to="/app/compliance/program">
        Back to Compliance Program
      </BackLinkAnchor>
    </BackLinkNav>
  );
}
