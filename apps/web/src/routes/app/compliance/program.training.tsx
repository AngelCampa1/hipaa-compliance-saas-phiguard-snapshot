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
  BackLinkAnchor,
  BackLinkNav,
  Badge,
  Button,
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
import { CREATE_ONLY_UPLOAD_HEADERS } from "../../../lib/s3.js";
import { getOrgFeatureContextFn } from "../../../server/feature-context.js";
import {
  getProductAnalyticsRowCountBucket,
  trackProductEvent,
} from "../../../lib/product-analytics-browser";
import {
  assignCourseFn,
  createTrainingCourseFn,
  deactivateTrainingCourseFn,
  downloadTrainingCertificateFn,
  listTrainingRecordsFn,
  markTrainingCompletedFn,
  presignTrainingCertificateUploadFn,
  reactivateTrainingCourseFn,
  reassignTrainingFn,
  reopenTrainingCompletionFn,
  unassignTrainingFn,
  updateTrainingDueDateFn,
} from "../../../server/program.js";

export const Route = createFileRoute("/app/compliance/program/training")({
  validateSearch: (search: Record<string, unknown>) => ({
    status: (search.status as string | undefined) ?? undefined,
    courseId: (search.courseId as string | undefined) ?? undefined,
    userId: (search.userId as string | undefined) ?? undefined,
    q: (search.q as string | undefined) ?? undefined,
    sort: (search.sort as string | undefined) ?? undefined,
    dir: (search.dir as "asc" | "desc" | undefined) ?? undefined,
  }),
  loader: async () => {
    try {
      return await listTrainingRecordsFn();
    } catch (err) {
      if (isFeatureGateError(err))
        return { gatedOrg: await getOrgFeatureContextFn() };
      throw err;
    }
  },
  component: TrainingPage,
  errorComponent: AppRouteErrorBoundary,
});

type TrainingRecord = Awaited<
  ReturnType<typeof listTrainingRecordsFn>
>["records"][number];
type CertificateScanStatus = TrainingRecord["certificateScanStatus"];

function isCertificateDownloadable(status: CertificateScanStatus) {
  return status === "clean" || status === "skipped";
}

function certificateStatusLabel(status: CertificateScanStatus) {
  if (status === "clean" || status === "skipped") return "Certificate ready";
  if (status === "infected") return "Certificate blocked by scan";
  if (status === "pending") return "Certificate scan pending";
  return "Certificate uploaded; scan status unavailable";
}

// Sentinel for the "All" filter option — Radix Select.Item cannot use an empty string.
const ALL_FILTER = "all";

const DUE_STATUS_LABELS: Record<string, string> = {
  overdue: "Overdue",
  due_soon: "Due soon",
  not_started: "Not started",
  ok: "On track",
};

const DUE_STATUS_BADGE: Record<
  string,
  "danger" | "warning" | "success" | "default"
> = {
  overdue: "danger",
  due_soon: "warning",
  not_started: "default",
  ok: "success",
};

const CERTIFICATE_ACCEPT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "text/plain",
].join(",");

type SortTrainingKey = "courseTitle" | "userName" | "dueStatus" | "dueAt" | "completedAt";

function TrainingPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/app/compliance/program/training" });
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseFrequencyDays, setCourseFrequencyDays] = useState("365");
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [deactivatingCourseId, setDeactivatingCourseId] = useState<
    string | null
  >(null);
  const [completingRecordId, setCompletingRecordId] = useState<string | null>(
    null,
  );
  const [downloadingRecordId, setDownloadingRecordId] = useState<string | null>(
    null,
  );
  const [certificateFiles, setCertificateFiles] = useState<
    Record<string, File | null>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Edit due date dialog
  const [editDueDateRecordId, setEditDueDateRecordId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState("");
  const [savingDueDate, setSavingDueDate] = useState(false);

  // Reassign dialog
  const [reassignRecordId, setReassignRecordId] = useState<string | null>(null);
  const [reassignUserId, setReassignUserId] = useState("");
  const [savingReassign, setSavingReassign] = useState(false);

  // Filter/search state
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
        void navigate({ search: (prev) => ({ ...prev, q: value }) });
      }, 300);
    },
    [navigate],
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      // Radix Select forbids empty-string item values, so the "All" option uses
      // the ALL_FILTER sentinel; map it back to undefined to clear the filter.
      const next = value === ALL_FILTER || value === "" ? undefined : value;
      void navigate({ search: (prev) => ({ ...prev, [key]: next }) });
    },
    [navigate],
  );

  const clearFilters = useCallback(() => {
    void navigate({ search: () => ({ status: undefined, courseId: undefined, userId: undefined, q: undefined, sort: undefined, dir: undefined }) });
    setLocalQ("");
  }, [navigate]);

  const toggleSort = useCallback(
    (col: SortTrainingKey) => {
      void navigate({
        search: (prev) => ({
          ...prev,
          sort: col,
          dir: prev.sort === col && prev.dir === "desc" ? "asc" : "desc",
        }),
      });
    },
    [navigate],
  );

  if ("gatedOrg" in data) {
    return (
      <div className="mx-auto max-w-5xl">
        <BackLink />
        <PageHeader
          title="Training"
          description="HIPAA training assignments and their completion status."
        />
        <FeatureGate feature="compliance_addon" org={data.gatedOrg}>
          {null}
        </FeatureGate>
      </div>
    );
  }

  const router = useRouter();
  const { records, canAdmin, canDownloadCertificates, courses, users } = data;

  // Client-side filter + sort for records table
  const q = deferredQ.trim().toLowerCase();
  let filteredRecords = records;
  if (search.status) {
    filteredRecords = filteredRecords.filter((r) => r.dueStatus === search.status);
  }
  if (search.courseId) {
    filteredRecords = filteredRecords.filter((r) => r.courseId === search.courseId);
  }
  if (search.userId) {
    filteredRecords = filteredRecords.filter((r) => r.userId === search.userId);
  }
  if (q) {
    filteredRecords = filteredRecords.filter(
      (r) =>
        (r.courseTitle ?? r.courseId).toLowerCase().includes(q) ||
        (r.userName ?? r.userEmail ?? r.userId ?? "").toLowerCase().includes(q) ||
        (r.userEmail ?? "").toLowerCase().includes(q),
    );
  }

  const sortKey = (search.sort as SortTrainingKey | undefined) ?? "dueAt";
  const sortDir = search.dir ?? "asc";
  filteredRecords = [...filteredRecords].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "dueAt") {
      cmp = new Date(a.dueAt ?? 0).getTime() - new Date(b.dueAt ?? 0).getTime();
    } else if (sortKey === "completedAt") {
      cmp = new Date(a.completedAt ?? 0).getTime() - new Date(b.completedAt ?? 0).getTime();
    } else if (sortKey === "courseTitle") {
      cmp = (a.courseTitle ?? "").localeCompare(b.courseTitle ?? "");
    } else if (sortKey === "userName") {
      cmp = (a.userName ?? a.userEmail ?? "").localeCompare(b.userName ?? b.userEmail ?? "");
    } else if (sortKey === "dueStatus") {
      const order: Record<string, number> = { overdue: 4, due_soon: 3, not_started: 2, ok: 1 };
      cmp = (order[a.dueStatus] ?? 0) - (order[b.dueStatus] ?? 0);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const hasActiveFilters = Boolean(search.status || search.courseId || search.userId || search.q);

  function SortIndicatorT({ col }: { col: SortTrainingKey }) {
    if (sortKey !== col) return null;
    return <span className="ml-1 text-text-muted">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  function SortableTrainingHead({
    col,
    children,
    className,
  }: {
    col: SortTrainingKey;
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
        <SortIndicatorT col={col} />
      </TableHead>
    );
  }

  // CSV export - no PHI. Exports course+user display name + status only.
  const handleExportCsv = () => {
    trackProductEvent('training_exported', {
      route: '/app/compliance/program/training',
      export_format: 'csv',
      row_count_bucket: getProductAnalyticsRowCountBucket(filteredRecords.length),
      has_active_filters: hasActiveFilters,
    });
    const headers = ["Course", "Assigned to", "Status", "Due", "Completed"];
    const rows = filteredRecords.map((r) => [
      `"${(r.courseTitle ?? r.courseId).replace(/"/g, '""')}"`,
      `"${(r.userName ?? r.userEmail ?? r.userId ?? "").replace(/"/g, '""')}"`,
      DUE_STATUS_LABELS[r.dueStatus] ?? r.dueStatus,
      r.dueAt ? new Date(r.dueAt).toLocaleDateString() : "",
      r.completedAt ? new Date(r.completedAt).toLocaleDateString() : "",
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "training-records.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const overdueCount = records.filter(
    (record) => record.dueStatus === "overdue",
  ).length;
  const dueSoonCount = records.filter(
    (record) => record.dueStatus === "due_soon",
  ).length;
  const completedCount = records.filter((record) => record.completedAt).length;
  const canAssign = canAdmin && courses.length > 0 && users.length > 0;

  const handleCreateCourse = async (event: FormEvent) => {
    event.preventDefault();
    const frequencyDays = Number(courseFrequencyDays);
    if (!courseTitle.trim() || !Number.isInteger(frequencyDays)) return;
    setError(null);
    setCreatingCourse(true);
    try {
      await createTrainingCourseFn({
        data: {
          title: courseTitle.trim(),
          description: courseDescription.trim() || undefined,
          frequencyDays,
        },
      });
      setNotice("Training course added.");
      setShowCourseForm(false);
      setCourseTitle("");
      setCourseDescription("");
      setCourseFrequencyDays("365");
      trackProductEvent('training_course_created', {
        route: '/app/compliance/program/training',
      });
      await router.invalidate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleDeactivateCourse = async (courseId: string) => {
    setError(null);
    setDeactivatingCourseId(courseId);
    try {
      await deactivateTrainingCourseFn({ data: { courseId } });
      trackProductEvent('training_course_status_changed', {
        route: '/app/compliance/program/training',
        status: 'inactive',
        action: 'deactivate',
      });
      setNotice("Training course deactivated.");
      await router.invalidate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeactivatingCourseId(null);
    }
  };

  const handleReactivateCourse = async (courseId: string) => {
    setError(null);
    try {
      await reactivateTrainingCourseFn({ data: { courseId } });
      trackProductEvent('training_course_status_changed', {
        route: '/app/compliance/program/training',
        status: 'active',
        action: 'reactivate',
      });
      setNotice("Training course reactivated.");
      await router.invalidate();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAssignCourse = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedUserId || !selectedCourseId || !dueAt) return;
    setError(null);
    setAssigning(true);
    try {
      await assignCourseFn({
        data: {
          userId: selectedUserId,
          courseId: selectedCourseId,
          dueAt: new Date(dueAt).toISOString(),
        },
      });
      setNotice("Training assigned.");
      setShowAssignForm(false);
      setSelectedUserId("");
      setSelectedCourseId("");
      setDueAt("");
      trackProductEvent('training_assigned', {
        route: '/app/compliance/program/training',
        count: 1,
      });
      await router.invalidate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAssigning(false);
    }
  };

  const handleCompleteTraining = async (recordId: string) => {
    setError(null);
    setCompletingRecordId(recordId);
    try {
      const certificateFile = certificateFiles[recordId];
      let certificateFileKey: string | undefined;

      if (certificateFile) {
        const upload = await presignTrainingCertificateUploadFn({
          data: {
            recordId,
            filename: certificateFile.name,
            contentType: certificateFile.type,
            sizeBytes: certificateFile.size,
          },
        });

        const uploadResponse = await fetch(upload.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": certificateFile.type,
            ...CREATE_ONLY_UPLOAD_HEADERS,
          },
          body: certificateFile,
        });

        if (!uploadResponse.ok) {
          throw new Error("Certificate upload failed");
        }

        certificateFileKey = upload.key;
      }

      await markTrainingCompletedFn({ data: { recordId, certificateFileKey } });
      trackProductEvent('training_record_completed', {
        route: '/app/compliance/program/training',
      });
      setNotice("Training marked complete.");
      await router.invalidate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCompletingRecordId(null);
    }
  };

  const handleDownloadCertificate = async (recordId: string) => {
    setError(null);
    setDownloadingRecordId(recordId);
    try {
      const { downloadUrl } = await downloadTrainingCertificateFn({
        data: { recordId },
      });
      trackProductEvent('training_certificate_downloaded', {
        route: '/app/compliance/program/training',
      });
      window.location.assign(downloadUrl);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDownloadingRecordId(null);
    }
  };

  const handleUnassign = async (recordId: string) => {
    setError(null);
    try {
      await unassignTrainingFn({ data: { recordId } });
      trackProductEvent('training_unassigned', {
        route: '/app/compliance/program/training',
      });
      setNotice("Training assignment removed.");
      await router.invalidate();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleReopenCompletion = async (recordId: string) => {
    setError(null);
    try {
      await reopenTrainingCompletionFn({ data: { recordId } });
      trackProductEvent('training_completion_reopened', {
        route: '/app/compliance/program/training',
        status: 'not_started',
      });
      setNotice("Training completion reopened.");
      await router.invalidate();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const openEditDueDate = (record: TrainingRecord) => {
    setNewDueDate(
      record.dueAt
        ? new Date(record.dueAt).toISOString().slice(0, 10)
        : "",
    );
    setEditDueDateRecordId(record.id);
  };

  const handleSaveDueDate = async (event: FormEvent) => {
    event.preventDefault();
    if (!editDueDateRecordId || !newDueDate) return;
    setError(null);
    setSavingDueDate(true);
    try {
      await updateTrainingDueDateFn({
        data: {
          recordId: editDueDateRecordId,
          dueAt: new Date(newDueDate).toISOString(),
        },
      });
      setNotice("Due date updated.");
      setEditDueDateRecordId(null);
      trackProductEvent('training_due_date_updated', {
        route: '/app/compliance/program/training',
      });
      await router.invalidate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingDueDate(false);
    }
  };

  const openReassign = (record: TrainingRecord) => {
    setReassignUserId("");
    setReassignRecordId(record.id);
  };

  const handleReassign = async (event: FormEvent) => {
    event.preventDefault();
    if (!reassignRecordId || !reassignUserId) return;
    setError(null);
    setSavingReassign(true);
    try {
      await reassignTrainingFn({
        data: { recordId: reassignRecordId, userId: reassignUserId },
      });
      trackProductEvent('training_reassigned', {
        route: '/app/compliance/program/training',
      });
      setNotice("Training reassigned.");
      setReassignRecordId(null);
      await router.invalidate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingReassign(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <BackLink />

      <PageHeader
        title="Training"
        description="Manage HIPAA training assignments and track due dates and completion."
        actions={
          <div className="flex flex-wrap gap-2">
            {canAdmin ? (
              <>
                <Button variant="outline" onClick={() => setShowCourseForm(true)}>
                  Add Course
                </Button>
                <Button
                  onClick={() => setShowAssignForm(true)}
                  disabled={courses.length === 0}
                >
                  Assign Training
                </Button>
              </>
            ) : null}
            {canAdmin && filteredRecords.length > 0 ? (
              <Button size="sm" variant="outline" onClick={handleExportCsv}>
                Download CSV
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryMetric
          label="Overdue"
          value={overdueCount}
          detail="Past due"
          tone={overdueCount > 0 ? "danger" : "success"}
        />
        <SummaryMetric
          label="Due soon"
          value={dueSoonCount}
          detail="Coming up soon"
          tone={dueSoonCount > 0 ? "warning" : "neutral"}
        />
        <SummaryMetric
          label="Completed"
          value={completedCount}
          detail={`of ${records.length} assignment(s)`}
          tone="brand"
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

      {/* Edit due date dialog */}
      <Dialog
        open={editDueDateRecordId !== null}
        onOpenChange={(open) => {
          if (!open) setEditDueDateRecordId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update due date</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveDueDate}>
            <div className="py-2">
              <Label htmlFor="edit-due-date">Due date *</Label>
              <InputPrimitive
                id="edit-due-date"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={savingDueDate || !newDueDate}>
                {savingDueDate ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDueDateRecordId(null)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reassign dialog */}
      <Dialog
        open={reassignRecordId !== null}
        onOpenChange={(open) => {
          if (!open) setReassignRecordId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign training</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReassign}>
            <div className="py-2">
              <Label htmlFor="reassign-user">Workforce member *</Label>
              <select
                id="reassign-user"
                value={reassignUserId}
                onChange={(e) => setReassignUserId(e.target.value)}
                required
                className="h-10 w-full rounded-md border border-border-subtle bg-surface px-3 text-sm text-text"
              >
                <option value="">Select a member</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name ? `${user.name} (${user.email})` : user.email}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="submit"
                disabled={savingReassign || !reassignUserId}
              >
                {savingReassign ? "Reassigning..." : "Reassign"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setReassignRecordId(null)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {canAdmin ? (
        <Panel className="mb-6">
          <PanelHeader
            title="Courses"
            description="Active courses that can be assigned to workforce members."
            actions={
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCourseForm(true)}
              >
                Add Course
              </Button>
            }
          />
          {showCourseForm ? (
            <form onSubmit={handleCreateCourse} className="mb-4">
              <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-training-course-form">
                <div className="min-w-0">
                  <Label htmlFor="training-course-title">Title *</Label>
                  <InputPrimitive
                    id="training-course-title"
                    value={courseTitle}
                    onChange={(event) => setCourseTitle(event.target.value)}
                    required
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="training-course-description">
                    Description
                  </Label>
                  <InputPrimitive
                    id="training-course-description"
                    value={courseDescription}
                    onChange={(event) =>
                      setCourseDescription(event.target.value)
                    }
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="training-course-frequency">
                    Frequency days *
                  </Label>
                  <InputPrimitive
                    id="training-course-frequency"
                    type="number"
                    min={1}
                    max={3650}
                    value={courseFrequencyDays}
                    onChange={(event) =>
                      setCourseFrequencyDays(event.target.value)
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={creatingCourse || !courseTitle.trim()}
                >
                  {creatingCourse ? "Adding..." : "Add Course"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCourseForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
          {courses.length === 0 ? (
            <Alert tone="warning">
              Add at least one active course before assigning training.
            </Alert>
          ) : (
            <TableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="min-w-64 break-words">
                        <div className="font-medium">{course.title}</div>
                        {course.description ? (
                          <div className="mt-1 text-sm text-text-muted">
                            {course.description}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {course.frequencyDays} days
                      </TableCell>
                      <TableCell className="space-x-2">
                        {course.isActive ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={deactivatingCourseId === course.id}
                              >
                                {deactivatingCourseId === course.id
                                  ? "Deactivating..."
                                  : "Deactivate"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Deactivate course?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {course.title} will be deactivated. Existing assignments are preserved and can still be completed. New assignments will be blocked until you reactivate the course.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    void handleDeactivateCourse(course.id)
                                  }
                                >
                                  Deactivate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              void handleReactivateCourse(course.id)
                            }
                          >
                            Reactivate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableShell>
          )}
        </Panel>
      ) : null}

      {showAssignForm ? (
        <Panel className="mb-6">
          <form onSubmit={handleAssignCourse}>
            <PanelHeader
              title="Assign Training"
              description="Pick a course and workforce member, then set the due date."
            />
            {!canAssign ? (
              <Alert tone="warning" className="mb-4">
                Add an active course and an accepted organization member before assigning training.
              </Alert>
            ) : null}
            <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="min-w-0">
                <Label htmlFor="training-user">Workforce member *</Label>
                <select
                  id="training-user"
                  value={selectedUserId}
                  onChange={(event) => setSelectedUserId(event.target.value)}
                  required
                  className="h-10 w-full rounded-md border border-border-subtle bg-surface px-3 text-sm text-text"
                >
                  <option value="">Select a member</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name ? `${user.name} (${user.email})` : user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <Label htmlFor="training-course">Course *</Label>
                <select
                  id="training-course"
                  value={selectedCourseId}
                  onChange={(event) => setSelectedCourseId(event.target.value)}
                  required
                  className="h-10 w-full rounded-md border border-border-subtle bg-surface px-3 text-sm text-text"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <Label htmlFor="training-due-at">Due date *</Label>
                <InputPrimitive
                  id="training-due-at"
                  type="date"
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={
                  assigning ||
                  !canAssign ||
                  !selectedUserId ||
                  !selectedCourseId ||
                  !dueAt
                }
              >
                {assigning ? "Assigning..." : "Assign Training"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAssignForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      {/* Filter bar */}
      {records.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <Select value={search.status || ALL_FILTER} onValueChange={(v) => setFilter("status", v)}>
            <SelectTrigger className="w-36 text-sm" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER}>All statuses</SelectItem>
              {Object.entries(DUE_STATUS_LABELS).map(([k, label]) => (
                <SelectItem key={k} value={k}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {courses.length > 0 ? (
            <Select value={search.courseId || ALL_FILTER} onValueChange={(v) => setFilter("courseId", v)}>
              <SelectTrigger className="w-44 text-sm" aria-label="Filter by course">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>All courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {users.length > 0 ? (
            <Select value={search.userId || ALL_FILTER} onValueChange={(v) => setFilter("userId", v)}>
              <SelectTrigger className="w-52 text-sm" aria-label="Filter by workforce member">
                <SelectValue placeholder="Workforce member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>All members</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name ? `${u.name} (${u.email})` : u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <InputPrimitive
            type="search"
            placeholder="Search course or member…"
            value={localQ}
            onChange={(e) => handleQChange(e.target.value)}
            className="w-56 text-sm"
            aria-label="Search training records"
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
              {filteredRecords.length} of {records.length} shown
            </span>
          ) : null}
        </div>
      ) : null}

      {records.length === 0 ? (
        <EmptyState
          heading="No training records yet"
          description="Assign training to workforce members to start tracking due dates and completion."
          action={
            canAdmin ? (
              <Button
                onClick={() => setShowAssignForm(true)}
                disabled={courses.length === 0}
              >
                Assign Training
              </Button>
            ) : null
          }
        />
      ) : filteredRecords.length === 0 ? (
        <div className="rounded-md border border-dashed border-border-subtle px-4 py-8 text-center text-sm text-text-muted">
          No records match the current filters.{" "}
          <button type="button" onClick={clearFilters} className="text-text-link hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <TableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTrainingHead col="courseTitle">Course</SortableTrainingHead>
                <SortableTrainingHead col="userName">Assigned to</SortableTrainingHead>
                <SortableTrainingHead col="dueStatus">Status</SortableTrainingHead>
                <SortableTrainingHead col="dueAt">Due</SortableTrainingHead>
                <SortableTrainingHead col="completedAt">Completed</SortableTrainingHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="min-w-64 break-words font-medium">
                    {record.courseTitle ?? record.courseId}
                  </TableCell>
                  <TableCell className="min-w-56 break-words">
                    {record.userName ?? record.userEmail ?? record.userId}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={DUE_STATUS_BADGE[record.dueStatus] ?? "default"}
                    >
                      {DUE_STATUS_LABELS[record.dueStatus] ?? record.dueStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(record.dueAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {record.completedAt
                      ? formatDate(record.completedAt)
                      : "Not completed"}
                  </TableCell>
                  <TableCell>
                    {record.completedAt ? (
                      <div className="flex flex-col gap-2">
                        {canDownloadCertificates &&
                        record.hasCertificateFile &&
                        isCertificateDownloadable(
                          record.certificateScanStatus,
                        ) ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={downloadingRecordId === record.id}
                            onClick={() =>
                              void handleDownloadCertificate(record.id)
                            }
                          >
                            {downloadingRecordId === record.id
                              ? "Preparing..."
                              : "Download certificate"}
                          </Button>
                        ) : record.hasCertificateFile ? (
                          <span className="text-sm text-warning-700">
                            {certificateStatusLabel(
                              record.certificateScanStatus,
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-text-muted">
                            Complete
                          </span>
                        )}
                        {canAdmin ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                              >
                                Reopen
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Reopen training completion?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will clear the completion date and certificate. The assignment returns to "Not started" status.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    void handleReopenCompletion(record.id)
                                  }
                                >
                                  Reopen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : null}
                      </div>
                    ) : (
                      <div className="flex min-w-56 flex-col gap-2">
                        <InputPrimitive
                          type="file"
                          aria-label={`Certificate for ${record.courseTitle ?? record.courseId}`}
                          accept={CERTIFICATE_ACCEPT_TYPES}
                          onChange={(event) =>
                            setCertificateFiles((current) => ({
                              ...current,
                              [record.id]: event.target.files?.[0] ?? null,
                            }))
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleCompleteTraining(record.id)}
                          disabled={completingRecordId === record.id}
                        >
                          {completingRecordId === record.id
                            ? "Completing..."
                            : "Mark complete"}
                        </Button>
                        {canAdmin ? (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDueDate(record)}
                            >
                              Edit due date
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openReassign(record)}
                            >
                              Reassign
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                >
                                  Remove
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remove assignment?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This training assignment will be permanently removed. The audit trail is preserved.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      void handleUnassign(record.id)
                                    }
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ) : null}
                      </div>
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

function BackLink() {
  return (
    <BackLinkNav>
      <BackLinkAnchor as={Link} to="/app/compliance/program">
        Back to Compliance Program
      </BackLinkAnchor>
    </BackLinkNav>
  );
}
