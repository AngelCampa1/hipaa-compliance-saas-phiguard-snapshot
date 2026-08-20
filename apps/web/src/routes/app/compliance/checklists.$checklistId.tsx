import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, LayoutList, AlertTriangle } from "lucide-react";
import { computeProgress } from "@phiguard/compliance";
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
  Button,
  cn,
  PageHeader,
  Panel,
  PanelHeader,
  SummaryMetric,
} from "@phiguard/ui";
import {
  archiveChecklistFn,
  getComplianceScopeFn,
  getChecklistFn,
  completeItemFn,
  reopenItemFn,
  presignChecklistEvidenceUploadFn,
  completeChecklistEvidenceUploadFn,
  downloadChecklistEvidenceFn,
} from "../../../server/compliance.js";
import { CREATE_ONLY_UPLOAD_HEADERS } from "../../../lib/s3.js";
import { NewTaskModal } from "../../../components/new-task-modal.js";
import { AppRouteErrorBoundary } from "../../../components/compliance-error-boundary";
import { trackProductEvent } from "../../../lib/product-analytics-browser";

type ChecklistItem = Awaited<
  ReturnType<typeof getChecklistFn>
>["items"][number];
type EvidenceScanStatus = ChecklistItem["evidenceScanStatus"];

function isEvidenceDownloadable(status: EvidenceScanStatus) {
  return status === "clean" || status === "skipped";
}

function evidenceStatusLabel(status: EvidenceScanStatus) {
  if (status === "clean" || status === "skipped") return "Evidence attached";
  if (status === "infected") return "Evidence blocked by scan";
  if (status === "pending") return "Evidence scan pending";
  return "Evidence attached; scan status unavailable";
}

export const Route = createFileRoute("/app/compliance/checklists/$checklistId")(
  {
    loader: async ({ params }) => {
      const [checklistData, scope] = await Promise.all([
        getChecklistFn({ data: { checklistId: params.checklistId } }),
        getComplianceScopeFn(),
      ]);
      return { ...checklistData, scope };
    },
    component: ChecklistDetailPage,
    errorComponent: AppRouteErrorBoundary,
  },
);

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div
      className="h-2 w-full max-w-sm overflow-hidden rounded bg-border-default"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full transition-all duration-300 ${
          pct === 100 ? "bg-success-600" : "bg-brand-600"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function WizardView({
  items,
  canWrite,
  onComplete,
  onReopen,
  onEvidenceUpload,
  onEvidenceDownload,
  uploadingFor,
  uploadError,
  busy,
}: {
  items: ChecklistItem[];
  canWrite: boolean;
  onComplete: (id: string) => Promise<void>;
  onReopen: (id: string) => Promise<void>;
  onEvidenceUpload: (id: string, file: File) => Promise<void>;
  onEvidenceDownload: (id: string) => Promise<void>;
  uploadingFor: string | null;
  uploadError: string | null;
  busy: string | null;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, "done" | "not-yet" | "not-sure">
  >({});
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [prefillTitle, setPrefillTitle] = useState("");

  const currentItem = items[currentIndex];
  const progress = Math.round(((currentIndex + 1) / items.length) * 100);
  const isLast = currentIndex === items.length - 1;
  const isFirst = currentIndex === 0;

  if (!currentItem) return null;

  const currentAnswer = answers[currentItem.id];

  async function handleAnswer(answer: "done" | "not-yet" | "not-sure") {
    if (!currentItem) return;
    const previousAnswer = answers[currentItem.id];
    setAnswers((prev) => ({ ...prev, [currentItem.id]: answer }));
    setShowTaskPrompt(false);
    setAnswerError(null);

    try {
      if (answer === "done" && currentItem.status !== "complete") {
        await onComplete(currentItem.id);
      } else if (answer !== "done" && currentItem.status === "complete") {
        await onReopen(currentItem.id);
      }
    } catch {
      setAnswers((prev) => {
        const next = { ...prev };
        if (previousAnswer === undefined) {
          delete next[currentItem.id];
        } else {
          next[currentItem.id] = previousAnswer;
        }
        return next;
      });
      setAnswerError("Could not save your answer. Please try again.");
      return;
    }

    if (answer === "not-yet") {
      setShowTaskPrompt(true);
    } else if (!isLast) {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleNext() {
    setShowTaskPrompt(false);
    if (!isLast) setCurrentIndex((i) => i + 1);
  }

  function handlePrev() {
    setShowTaskPrompt(false);
    if (!isFirst) setCurrentIndex((i) => i - 1);
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-2 flex items-center justify-between text-sm text-text-muted">
        <span>
          Item {currentIndex + 1} of {items.length}
        </span>
        <span>
          {items.filter((i) => i.status === "complete").length} complete
        </span>
      </div>
      <div className="mb-8">
        <ProgressBar pct={progress} />
      </div>

      {/* Item card */}
      <div
        data-checklist-item-id={currentItem.id}
        className="rounded-2xl border border-border-default bg-surface-0 p-6 shadow-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Safeguard {currentIndex + 1}
        </p>
        <h2 className="mt-3 text-xl font-semibold text-text-primary">
          {currentItem.title}
        </h2>

        {currentItem.hipaaReference && (
          <span className="mt-2 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {currentItem.hipaaReference}
          </span>
        )}

        {currentItem.description && (
          <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              What this means
            </p>
            <p className="mt-1 text-sm leading-6 text-brand-900">
              {currentItem.description}
            </p>
          </div>
        )}

        {currentItem.evidence && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "text-xs",
                isEvidenceDownloadable(currentItem.evidenceScanStatus)
                  ? "text-success-700"
                  : "text-warning-700",
              )}
            >
              {evidenceStatusLabel(currentItem.evidenceScanStatus)}
            </p>
            {isEvidenceDownloadable(currentItem.evidenceScanStatus) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void onEvidenceDownload(currentItem.id)}
                disabled={!!busy}
              >
                Download evidence
              </Button>
            )}
          </div>
        )}
        {uploadError && uploadingFor === null && (
          <p role="alert" className="mt-2 text-xs text-danger-700">
            {uploadError}
          </p>
        )}

        {canWrite && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-text-primary">
              Is this in place at your clinic?
            </p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => void handleAnswer("done")}
                disabled={!!busy}
                className={cn(
                  "flex-1 rounded-full border-2 py-2.5 text-sm font-semibold transition",
                  currentAnswer === "done"
                    ? "border-success-500 bg-success-50 text-success-700"
                    : "border-border-default bg-surface-0 text-text-primary hover:border-success-300 hover:bg-success-50",
                )}
              >
                ✓ Yes, it&apos;s set up
              </button>
              <button
                type="button"
                onClick={() => void handleAnswer("not-yet")}
                disabled={!!busy}
                className={cn(
                  "flex-1 rounded-full border-2 py-2.5 text-sm font-semibold transition",
                  currentAnswer === "not-yet"
                    ? "border-warning-500 bg-warning-50 text-warning-700"
                    : "border-border-default bg-surface-0 text-text-primary hover:border-warning-300 hover:bg-warning-50",
                )}
              >
                ✗ Not yet
              </button>
              <button
                type="button"
                onClick={() => void handleAnswer("not-sure")}
                disabled={!!busy}
                className={cn(
                  "flex-1 rounded-full border-2 py-2.5 text-sm font-semibold transition",
                  currentAnswer === "not-sure"
                    ? "border-border-strong bg-surface-100 text-text-secondary"
                    : "border-border-default bg-surface-0 text-text-primary hover:border-border-strong hover:bg-surface-50",
                )}
              >
                ? Not sure
              </button>
            </div>

            {answerError && (
              <p role="alert" className="mt-3 text-sm text-danger-700">
                {answerError}
              </p>
            )}

            {/* Task creation prompt - shown after "Not yet" */}
            {showTaskPrompt && (
              <div className="mt-4 rounded-lg border border-warning-200 bg-warning-50 p-4">
                <p className="text-sm font-semibold text-warning-900">
                  Track this as a follow-up task?
                </p>
                <p className="mt-1 text-sm text-warning-700">
                  A task adds an owner and a due date so nothing gets missed.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPrefillTitle(currentItem.title);
                    setIsTaskModalOpen(true);
                  }}
                  className="mt-3 rounded-full border border-warning-400 bg-surface-0 px-4 py-1.5 text-sm font-semibold text-warning-900 hover:bg-warning-100"
                >
                  Create task →
                </button>
              </div>
            )}

            {/* Evidence upload - only when answered "done" */}
            {currentAnswer === "done" && (
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`evidence-upload-${currentItem.id}`}
                    className={cn(
                      "cursor-pointer text-xs font-medium text-text-link underline",
                      uploadingFor === currentItem.id && "cursor-wait",
                    )}
                  >
                    {uploadingFor === currentItem.id
                      ? "Uploading…"
                      : "Attach evidence file (optional)"}
                  </label>
                  <input
                    id={`evidence-upload-${currentItem.id}`}
                    type="file"
                    disabled={uploadingFor !== null}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void onEvidenceUpload(currentItem.id, file);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={isFirst || !!busy}
        >
          ← Previous
        </Button>
        {isLast ? (
          <p className="text-sm font-semibold text-success-700">
            All items reviewed ✓
          </p>
        ) : (
          <Button type="button" onClick={handleNext} disabled={!!busy}>
            {currentAnswer ? "Next →" : "Skip →"}
          </Button>
        )}
      </div>

      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        prefillTitle={prefillTitle}
      />
    </div>
  );
}

function ChecklistDetailPage() {
  const { checklist, items, scope } = Route.useLoaderData();
  const canWrite = scope.canWrite;
  const canAdmin = scope.canAdmin;
  const router = useRouter();
  const navigate = useNavigate();
  const [localItems, setLocalItems] = useState(items);
  const [busy, setBusy] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [downloadingFor, setDownloadingFor] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mode, setMode] = useState<"wizard" | "list">("wizard");
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const localProgress = computeProgress(localItems);

  const handleComplete = async (itemId: string) => {
    setBusy(itemId);
    try {
      const updated = await completeItemFn({ data: { itemId } });
      const nextItems = localItems.map((i) =>
          i.id === itemId
            ? { ...updated, evidenceScanStatus: i.evidenceScanStatus }
            : i,
        );
      setLocalItems(nextItems);
      trackProductEvent("checklist_item_completed", {
        route: "/app/compliance/checklists/$checklistId",
      });
      if (nextItems.length > 0 && nextItems.every((item) => item.status === "complete")) {
        trackProductEvent("checklist_completed", {
          route: "/app/compliance/checklists/$checklistId",
        });
      }
    } finally {
      setBusy(null);
    }
  };

  const handleReopen = async (itemId: string) => {
    setBusy(itemId);
    try {
      const updated = await reopenItemFn({ data: { itemId } });
      setLocalItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...updated, evidenceScanStatus: i.evidenceScanStatus }
            : i,
        ),
      );
      trackProductEvent("checklist_item_reopened", {
        route: "/app/compliance/checklists/$checklistId",
        status: "open",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleEvidenceUpload = async (itemId: string, file: File) => {
    setUploadingFor(itemId);
    setUploadError(null);
    try {
      const contentType = file.type || "application/octet-stream";
      const { uploadUrl, key } = await presignChecklistEvidenceUploadFn({
        data: {
          itemId,
          filename: file.name,
          contentType,
          sizeBytes: file.size,
        },
      });
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": contentType, ...CREATE_ONLY_UPLOAD_HEADERS },
      });
      if (!uploadResponse.ok) throw new Error("Upload failed");
      const updated = await completeChecklistEvidenceUploadFn({
        data: { itemId, s3Key: key, contentType, sizeBytes: file.size },
      });
      setLocalItems((prev) =>
        prev.map((entry) => (entry.id === itemId ? updated : entry)),
      );
      trackProductEvent("checklist_evidence_uploaded", {
        route: "/app/compliance/checklists/$checklistId",
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingFor(null);
    }
  };

  const handleEvidenceDownload = async (itemId: string) => {
    setDownloadingFor(itemId);
    setUploadError(null);
    try {
      const { downloadUrl } = await downloadChecklistEvidenceFn({
        data: { itemId },
      });
      trackProductEvent("checklist_evidence_downloaded", {
        route: "/app/compliance/checklists/$checklistId",
      });
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadingFor(null);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    setArchiveError(null);
    try {
      await archiveChecklistFn({ data: { checklistId: checklist.id } });
      trackProductEvent("checklist_archived", {
        route: "/app/compliance/checklists/$checklistId",
        status: "archived",
      });
      await router.invalidate();
      await navigate({ to: '/app/compliance/checklists', search: { locationId: undefined } });
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : 'Archive failed');
      setArchiving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back link with ArrowLeft icon */}
      <nav className="mb-6">
        <Link
          to="/app/compliance/checklists"
          search={(prev) => ({ ...prev, locationId: undefined })}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Checklists
        </Link>
      </nav>

      {/* Single page-level PHI warning */}
      {canWrite && (
        <Alert tone="warning" className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-600" />
          <span>
            Do not upload files containing patient names, MRNs, or other PHI as evidence. Confirm your clinic's de-identification policy before uploading.
          </span>
        </Alert>
      )}

      {archiveError ? (
        <Alert tone="danger" className="mb-4">{archiveError}</Alert>
      ) : null}

      <PageHeader
        eyebrow="Checklist"
        title={checklist.name}
        description={
          !canWrite
            ? "Read-only access. Completing items and uploading evidence are disabled."
            : "Work through items in guided mode or scan the full list."
        }
        actions={
          canAdmin && checklist.status !== 'archived' ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" disabled={archiving}>
                  {archiving ? 'Archiving...' : 'Archive'}
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
                  <AlertDialogAction onClick={() => void handleArchive()}>Archive</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryMetric
          label="Complete"
          value={localProgress.complete}
          detail={`${localProgress.pct}% of checklist`}
          tone={localProgress.pct === 100 ? "success" : "brand"}
        />
        <SummaryMetric
          label="Open"
          value={Math.max(localProgress.total - localProgress.complete, 0)}
          detail="Items remaining"
          tone="warning"
        />
        <SummaryMetric
          label="Total items"
          value={localProgress.total}
          detail="Total in checklist"
          tone="neutral"
        />
      </div>

      {/* Progress bar + mode toggle */}
      <div className="mb-8 mt-4 flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <ProgressBar pct={localProgress.pct} />
          <span className="whitespace-nowrap text-sm font-semibold text-text-secondary">
            {localProgress.complete} / {localProgress.total} complete (
            {localProgress.pct}%)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMode((m) => (m === "wizard" ? "list" : "wizard"))}
          className="inline-flex items-center gap-1.5 rounded-full border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-50"
        >
          <LayoutList className="h-3.5 w-3.5" />
          {mode === "wizard" ? "View all items" : "Guided mode"}
        </button>
      </div>

      {localItems.length === 0 ? (
        <Panel className="border-dashed bg-surface-50 text-center">
          <PanelHeader
            title="No checklist items"
            description="No items have been added to this checklist yet."
          />
        </Panel>
      ) : mode === "wizard" ? (
        <WizardView
          items={localItems}
          canWrite={canWrite}
          onComplete={handleComplete}
          onReopen={handleReopen}
          onEvidenceUpload={handleEvidenceUpload}
          onEvidenceDownload={handleEvidenceDownload}
          uploadingFor={uploadingFor}
          uploadError={uploadError}
          busy={busy ?? downloadingFor}
        />
      ) : (
        /* List mode - flat scannable list */
        <ul className="list-none p-0">
          {localItems.map((item) => (
            <li
              key={item.id}
              className={`flex items-start gap-4 border-b border-border-default p-4 ${
                item.status === "complete" ? "opacity-70" : ""
              }`}
            >
              {canWrite ? (
                <input
                  type="checkbox"
                  checked={item.status === "complete"}
                  disabled={busy === item.id}
                  onChange={() =>
                    item.status === "complete"
                      ? void handleReopen(item.id)
                      : void handleComplete(item.id)
                  }
                  aria-label={`Mark "${item.title}" as ${item.status === "complete" ? "incomplete" : "complete"}`}
                  className="mt-1 cursor-pointer"
                />
              ) : (
                <span className="mt-1 inline-block text-xs text-text-disabled">
                  {item.status === "complete" ? "Completed" : "Open"}
                </span>
              )}
              <div className="flex-1">
                <div
                  className={`font-medium ${item.status === "complete" ? "line-through" : ""}`}
                >
                  {item.title}
                </div>
                {item.description && (
                  <p className="mt-1 text-sm text-text-muted">
                    {item.description}
                  </p>
                )}
                {item.hipaaReference && (
                  <span className="mt-1 inline-block rounded bg-blue-50 px-1.5 py-0.5 text-xs text-text-link">
                    {item.hipaaReference}
                  </span>
                )}
                {item.evidence && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <div
                      className={cn(
                        "text-xs",
                        isEvidenceDownloadable(item.evidenceScanStatus)
                          ? "text-success-700"
                          : "text-warning-700",
                      )}
                    >
                      {evidenceStatusLabel(item.evidenceScanStatus)}
                    </div>
                    {isEvidenceDownloadable(item.evidenceScanStatus) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void handleEvidenceDownload(item.id)}
                        disabled={!!busy || downloadingFor === item.id}
                      >
                        {downloadingFor === item.id
                          ? "Preparing..."
                          : "Download evidence"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {canWrite && busy === item.id && (
                <span className="text-xs text-text-disabled">Saving…</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
