import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { auditEvents } from "@phiguard/audit";
import { logger } from "@phiguard/audit";
import { writeAuditEvent } from "@phiguard/audit";
import { runInAuditContextForHeaders } from "../lib/audit.js";
import { runInAuditContext } from "../lib/audit.server.js";
import { getSessionFn, toAppSession } from "../lib/session.js";
import {
  assertCommercialProductAccess,
  getReadLocationIds,
  resolveActiveLocationAccess,
} from "./access.js";

// ---------------------------------------------------------------------------
// Audit action and resource-type enums (server-supplied to UI dropdowns)
// ---------------------------------------------------------------------------

export const AUDIT_ACTIONS = [
  "access_review.closed",
  "access_review.decision_recorded",
  "access_review.opened",
  "audit_log.exported",
  "baa.accepted",
  "billing.payment.failed",
  "billing.subscription.activation_blocked",
  "billing.subscription.canceled",
  "billing.subscription.started",
  "billing.subscription.updated",
  "checklist.archived",
  "checklist.assigned",
  "checklist.deleted",
  "checklist.renamed",
  "checklist_item.completed",
  "checklist_item.create",
  "checklist_item.evidence_uploaded",
  "checklist_item.reopened",
  "integration.installed",
  "integration.revoked",
  "incident.closed",
  "incident.created",
  "incident.resolved",
  "incident.status_changed",
  "incident.update_appended",
  "incident.updated",
  "invitation.accepted",
  "invitation.canceled",
  "invitation.resent",
  "member.removed",
  "member.role_updated",
  "membership.revoked",
  "membership.role_changed",
  "org.created",
  "partner.approved",
  "partner.payout_marked_paid",
  "partner.payout_run",
  "policy.acknowledged",
  "policy.archived",
  "policy.assigned",
  "policy.completed",
  "policy.created",
  "policy.published",
  "policy.reopened",
  "policy.updated",
  "policy.version_created",
  "risk_assessment.created",
  "risk_assessment.deleted",
  "risk_assessment.renamed",
  "risk_assessment.reopened",
  "risk_assessment.reviewed",
  "risk_assessment.updated",
  "risk_item.created",
  "risk_item.deleted",
  "risk_item.updated",
  "soc2.bundle_exported",
  "soc2.evidence_recorded",
  "task.attachment.deleted",
  "task.attachment.scan_completed",
  "task.attachment.uploaded",
  "task.archived",
  "task.assigned",
  "task.comment.added",
  "task.created",
  "task.due_date_updated",
  "task.status_updated",
  "task.updated",
  "terms.accepted",
  "training.assigned",
  "training.completed",
  "training.completion_reopened",
  "training.due_date_updated",
  "training.reassigned",
  "training.unassigned",
  "training_course.created",
  "training_course.deactivated",
  "training_course.reactivated",
  "vendor.baa_recorded",
  "vendor.baa_updated",
  "vendor.created",
  "vendor.inactivated",
  "vendor.reactivated",
  "vendor.updated",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_RESOURCE_TYPES = [
  "access_review",
  "access_review_item",
  "audit_log",
  "checklist",
  "checklist_item",
  "integration_connection",
  "incident",
  "incident_update",
  "legal_acceptance",
  "membership",
  "organization",
  "organization_invitation",
  "organization_member",
  "partner",
  "partner_payout",
  "policy",
  "risk_assessment",
  "risk_item",
  "soc2_bundle",
  "soc2_evidence",
  "task",
  "task_attachment",
  "task_comment",
  "training_assignment",
  "training_course",
  "vendor",
  "vendor_baa",
] as const;

export type AuditResourceType = (typeof AUDIT_RESOURCE_TYPES)[number];

// ---------------------------------------------------------------------------
// Sort schema
// ---------------------------------------------------------------------------

const AuditSortInput = z
  .object({
    field: z.enum(["createdAt", "action", "actorId"]),
    direction: z.enum(["asc", "desc"]),
  })
  .optional();

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const ListAuditEventsInput = z.object({
  actorId: z.string().optional(),
  actorEmail: z.string().optional(),
  locationId: z.string().uuid().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  action: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  cursor: z.string().optional(), // JSON-encoded composite cursor: { ts: ISO string, id: UUID }
  sort: AuditSortInput,
});

const AUDIT_EXPORT_RANGE_MESSAGE =
  "Date range cannot exceed 365 days. For longer exports, use the nightly object-storage export.";

export const AUDIT_EXPORT_LARGE_ROW_THRESHOLD = 50_000;

export const ExportAuditCsvInput = z
  .object({
    dateFrom: z.string().datetime(),
    dateTo: z.string().datetime(),
    actorId: z.string().optional(),
    actorEmail: z.string().optional(),
    resourceType: z.string().optional(),
    resourceId: z.string().optional(),
    action: z.string().optional(),
    search: z.string().optional(),
    locationId: z.string().uuid().optional(),
  })
  .superRefine((input, ctx) => {
    const from = new Date(input.dateFrom);
    const to = new Date(input.dateTo);
    const rangeDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);

    if (to < from) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date range end must be on or after the start.",
        path: ["dateTo"],
      });
    }

    if (rangeDays > 365) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: AUDIT_EXPORT_RANGE_MESSAGE,
        path: ["dateTo"],
      });
    }
  });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadAuditAuth() {
  return import("@phiguard/auth");
}

async function loadAuditDb() {
  return import("@phiguard/db/server");
}

const AUDIT_LOG_ACCESS_ROLES = new Set(["org_owner", "org_admin", "auditor"]);
export const AUDIT_LOG_ACCESS_DENIED_MESSAGE =
  "Access denied: audit log access requires an organization administrator or auditor.";

function assertAuditLogAccess(access: { role: string }) {
  if (!AUDIT_LOG_ACCESS_ROLES.has(access.role)) {
    throw new Error(AUDIT_LOG_ACCESS_DENIED_MESSAGE);
  }
}

async function requireAuditAccess() {
  const session = await getSessionFn();
  if (!session?.user?.id || !session?.session?.activeOrganizationId) {
    throw new Error("Unauthorized");
  }

  const { getDb } = await loadAuditDb();
  const db = getDb();
  const access = await resolveActiveLocationAccess(db, session);
  assertCommercialProductAccess(access);
  assertAuditLogAccess(access);

  return {
    db,
    access,
  };
}

const PAGE_SIZE = 50;
const EXPORT_PAGE_SIZE = 5_000;
const MAX_AUDIT_EXPORT_ROWS = 100_000;
export const AUDIT_EXPORT_ROW_LIMIT_MESSAGE =
  "Audit export exceeds 100,000 rows. Narrow the date range or use the nightly object-storage export.";
const CSV_HEADER =
  "id,created_at,location_id,actor_id,action,resource_type,resource_id,ip,user_agent\n";
const AUDIT_CURSOR_SCHEMA = z.object({
  ts: z.string().datetime(),
  id: z.string().uuid(),
  action: z.string().optional(),
  actorId: z.string().optional(),
});

export function formatCsvField(value: string) {
  const safeValue = /^[\s\u0000-\u001f]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

function formatAuditCsvRow(row: {
  id: string;
  createdAt: Date;
  locationId: string | null;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ip: string | null;
  userAgent: string | null;
}) {
  return [
    row.id,
    row.createdAt.toISOString(),
    row.locationId ?? "",
    row.actorId,
    row.action,
    row.resourceType,
    row.resourceId,
    row.ip ?? "",
    row.userAgent ?? "",
  ]
    .map(formatCsvField)
    .join(",");
}

export function parseAuditCursor(cursor: string) {
  try {
    const parsed = JSON.parse(cursor);
    return AUDIT_CURSOR_SCHEMA.parse(parsed);
  } catch {
    throw new Error("Invalid cursor");
  }
}

type AuditSort = NonNullable<z.infer<typeof AuditSortInput>>;

function getAuditSort(sort: AuditSort | undefined): AuditSort {
  return sort ?? { field: "createdAt", direction: "desc" };
}

export function buildAuditCursorCondition(
  cursor: ReturnType<typeof parseAuditCursor>,
  sort: AuditSort | undefined,
) {
  const resolvedSort = getAuditSort(sort);
  const comparison = resolvedSort.direction === "asc" ? sql.raw(">") : sql.raw("<");

  if (resolvedSort.field === "action") {
    if (!cursor.action) {
      throw new Error("Invalid cursor");
    }

    return sql`(${auditEvents.action}, ${auditEvents.id}) ${comparison} (${cursor.action}, ${cursor.id})`;
  }

  if (resolvedSort.field === "actorId") {
    if (!cursor.actorId) {
      throw new Error("Invalid cursor");
    }

    return sql`(${auditEvents.actorId}, ${auditEvents.createdAt}, ${auditEvents.id}) ${comparison} (${cursor.actorId}, ${new Date(cursor.ts)}, ${cursor.id})`;
  }

  return sql`(${auditEvents.createdAt}, ${auditEvents.id}) ${comparison} (${new Date(cursor.ts)}, ${cursor.id})`;
}

export function buildAuditNextCursor(
  row: {
    id: string;
    createdAt: Date;
    action: string;
    actorId: string;
  },
  sort: AuditSort | undefined,
) {
  const resolvedSort = getAuditSort(sort);
  const cursor: {
    ts: string;
    id: string;
    action?: string;
    actorId?: string;
  } = {
    ts: row.createdAt.toISOString(),
    id: row.id,
  };

  if (resolvedSort.field === "action") {
    cursor.action = row.action;
  }

  if (resolvedSort.field === "actorId") {
    cursor.actorId = row.actorId;
  }

  return JSON.stringify(cursor);
}

async function requireAuditAccessForHeaders(headers: Headers) {
  const session = await resolveAuditSession(headers);
  if (!session?.user?.id || !session?.session?.activeOrganizationId) {
    throw new Error("Unauthorized");
  }

  const { getDb } = await loadAuditDb();
  const db = getDb();
  const access = await resolveActiveLocationAccess(db, session);
  assertCommercialProductAccess(access);
  assertAuditLogAccess(access);

  return {
    db,
    access,
  };
}

async function applyResponseCookies(setCookieHeaders: string[] | undefined) {
  if (!setCookieHeaders?.length) {
    return;
  }

  const { setResponseHeader } = await import("@tanstack/react-start/server");
  setResponseHeader("set-cookie", setCookieHeaders);
}

async function resolveAuditSession(headers: Headers) {
  const { resolveOrganizationAccess, resolveSessionFromHeaders } =
    await loadAuditAuth();
  const { getDb } = await loadAuditDb();
  const resolvedSession = await resolveSessionFromHeaders(headers);
  await applyResponseCookies(resolvedSession?.setCookieHeaders);

  const session = toAppSession(resolvedSession);
  if (!session?.session || !session.user) {
    return null;
  }

  const access = await resolveOrganizationAccess(getDb(), {
    activeOrganizationId: session.session.activeOrganizationId,
    userId: session.user.id,
  });

  if (access.status === "ready") {
    return session;
  }

  if (access.status === "switch-required") {
    return {
      ...session,
      session: {
        ...session.session,
        activeOrganizationId: access.activeOrganizationId,
      },
    };
  }

  return {
    ...session,
    session: {
      ...session.session,
      activeOrganizationId: null,
    },
  };
}

function validateAuditExportRange(input: z.infer<typeof ExportAuditCsvInput>) {
  ExportAuditCsvInput.parse(input);

  const from = new Date(input.dateFrom);
  const to = new Date(input.dateTo);

  return { from, to };
}

function buildAuditLocationScope(locationIds: string[]) {
  if (locationIds.length === 0) {
    return isNull(auditEvents.locationId);
  }

  return (
    or(
      isNull(auditEvents.locationId),
      inArray(auditEvents.locationId, locationIds),
    ) ?? isNull(auditEvents.locationId)
  );
}

type AuditFilterOptions = {
  actorId?: string;
  actorEmail?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  search?: string;
};

/**
 * Build per-filter conditions for audit queries.
 * actorEmail resolves to matching actorIds through tenant memberships.
 * All conditions are READ ONLY - never UPDATE/DELETE on audit_events.
 */
async function buildAuditFilterConditions(
  db: Awaited<ReturnType<typeof requireAuditAccess>>["db"],
  tenantId: string,
  filters: AuditFilterOptions,
) {
  const conditions = [];

  if (filters.actorId) {
    conditions.push(eq(auditEvents.actorId, filters.actorId));
  } else if (filters.actorEmail) {
    const { memberships, users } = await loadAuditDb();
    const emailPattern = `%${filters.actorEmail}%`;
    const matchingUsers = await db
      .select({ id: users.id })
      .from(users)
      .innerJoin(memberships, eq(memberships.userId, users.id))
      .where(
        and(
          eq(memberships.tenantId, tenantId),
          ilike(users.email, emailPattern),
        ),
      );
    const matchingIds = matchingUsers.map((u) => u.id);
    if (matchingIds.length === 0) {
      conditions.push(sql`FALSE`);
    } else {
      conditions.push(inArray(auditEvents.actorId, matchingIds));
    }
  }

  if (filters.action) {
    conditions.push(eq(auditEvents.action, filters.action));
  }
  if (filters.resourceType) {
    conditions.push(eq(auditEvents.resourceType, filters.resourceType));
  }
  if (filters.resourceId) {
    conditions.push(eq(auditEvents.resourceId, filters.resourceId));
  }
  if (filters.search) {
    const searchPattern = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(auditEvents.action, searchPattern),
        ilike(auditEvents.resourceType, searchPattern),
        ilike(auditEvents.resourceId, searchPattern),
      ) ?? ilike(auditEvents.action, searchPattern),
    );
  }

  return conditions;
}

async function fetchAuditExportBatch(input: {
  access: Awaited<ReturnType<typeof requireAuditAccess>>["access"];
  cursor: { createdAt: Date; id: string } | null;
  db: Awaited<ReturnType<typeof requireAuditAccess>>["db"];
  from: Date;
  limit: number;
  locationIds: string[];
  to: Date;
  filters?: AuditFilterOptions;
}) {
  const baseConditions = [
    eq(auditEvents.tenantId, input.access.organizationId),
    buildAuditLocationScope(input.locationIds),
    gte(auditEvents.createdAt, input.from),
    lte(auditEvents.createdAt, input.to),
  ];

  const filterConditions = input.filters
    ? await buildAuditFilterConditions(
        input.db,
        input.access.organizationId,
        input.filters,
      )
    : [];

  const conditions = [...baseConditions, ...filterConditions];

  if (input.cursor) {
    conditions.push(
      sql`(${auditEvents.createdAt}, ${auditEvents.id}) > (${input.cursor.createdAt}, ${input.cursor.id})`,
    );
  }

  return input.db
    .select({
      id: auditEvents.id,
      tenantId: auditEvents.tenantId,
      locationId: auditEvents.locationId,
      actorId: auditEvents.actorId,
      action: auditEvents.action,
      resourceType: auditEvents.resourceType,
      resourceId: auditEvents.resourceId,
      ip: auditEvents.ip,
      userAgent: auditEvents.userAgent,
      createdAt: auditEvents.createdAt,
    })
    .from(auditEvents)
    .where(and(...conditions))
    .orderBy(auditEvents.createdAt, auditEvents.id)
    .limit(input.limit);
}

export async function createAuditCsvDownloadResponse(
  request: Request,
  input: z.infer<typeof ExportAuditCsvInput>,
) {
  const { db, access } = await requireAuditAccessForHeaders(request.headers);
  const { from, to } = validateAuditExportRange(input);
  const filters: AuditFilterOptions = {
    actorId: input.actorId,
    actorEmail: input.actorEmail,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    search: input.search,
  };
  const locationIds = getReadLocationIds(access, input.locationId);
  const chunks = [CSV_HEADER];
  let cursor: { createdAt: Date; id: string } | null = null;
  let exportedCount = 0;

  while (true) {
    const remainingRows = MAX_AUDIT_EXPORT_ROWS - exportedCount;
    if (remainingRows <= 0) {
      const rows = await fetchAuditExportBatch({
        db,
        access,
        from,
        limit: 1,
        locationIds,
        to,
        cursor,
        filters,
      });

      if (rows.length > 0) {
        throw new Error(AUDIT_EXPORT_ROW_LIMIT_MESSAGE);
      }

      break;
    }

    const rows = await fetchAuditExportBatch({
      db,
      access,
      from,
      limit: Math.min(EXPORT_PAGE_SIZE, remainingRows),
      locationIds,
      to,
      cursor,
      filters,
    });

    if (rows.length === 0) {
      break;
    }

    exportedCount += rows.length;
    chunks.push(`${rows.map(formatAuditCsvRow).join("\n")}\n`);

    const lastRow = rows[rows.length - 1];
    if (!lastRow || rows.length < Math.min(EXPORT_PAGE_SIZE, remainingRows)) {
      break;
    }

    cursor = {
      createdAt: lastRow.createdAt,
      id: lastRow.id,
    };
  }

  logger.safe.info(
    {
      count: exportedCount,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      truncated: exportedCount >= MAX_AUDIT_EXPORT_ROWS,
      tenantId: access.organizationId,
    },
    "createAuditCsvDownloadResponse: streamed audit export",
  );

  await runInAuditContextForHeaders(access.userId, request.headers, () =>
    writeAuditEvent(db, {
      tenantId: access.organizationId,
      actorId: access.userId,
      action: "audit_log.exported",
      resourceType: "audit_log",
      resourceId: "direct-csv",
      after: {
        count: exportedCount,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        filters: {
          ...filters,
          locationId: input.locationId,
        },
      },
    }),
  );

  return new Response(chunks.join(""), {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Disposition": `attachment; filename="audit-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
      Expires: "0",
      Pragma: "no-cache",
    },
  });
}

// ---------------------------------------------------------------------------
// listAuditEventsFn
// ---------------------------------------------------------------------------

function buildAuditOrderBy(
  sort: { field: string; direction: string } | undefined,
) {
  const dir = sort?.direction === "asc" ? asc : desc;

  switch (sort?.field) {
    case "action":
      return [dir(auditEvents.action), dir(auditEvents.id)];
    case "actorId":
      return [
        dir(auditEvents.actorId),
        dir(auditEvents.createdAt),
        dir(auditEvents.id),
      ];
    case "createdAt":
    default:
      return [dir(auditEvents.createdAt), dir(auditEvents.id)];
  }
}

export const listAuditEventsFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => ListAuditEventsInput.parse(data))
  .handler(async ({ data }) => {
    const { db, access } = await requireAuditAccess();

    return runInAuditContext(access.userId, async () => {
      const locationIds = getReadLocationIds(access, data.locationId);
      const conditions = [eq(auditEvents.tenantId, access.organizationId)];

      conditions.push(buildAuditLocationScope(locationIds));

      if (data.dateFrom) {
        conditions.push(gte(auditEvents.createdAt, new Date(data.dateFrom)));
      }
      if (data.dateTo) {
        conditions.push(lte(auditEvents.createdAt, new Date(data.dateTo)));
      }

      const filterConditions = await buildAuditFilterConditions(
        db,
        access.organizationId,
        {
          actorId: data.actorId,
          actorEmail: data.actorEmail,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          search: data.search,
        },
      );
      conditions.push(...filterConditions);

      // Composite cursor-based pagination must match the active sort tuple.
      // Otherwise non-createdAt sorts can skip or duplicate rows across pages.
      if (data.cursor) {
        conditions.push(buildAuditCursorCondition(parseAuditCursor(data.cursor), data.sort));
      }

      const orderBy = buildAuditOrderBy(data.sort);

      const rows = await db
        .select({
          id: auditEvents.id,
          tenantId: auditEvents.tenantId,
          locationId: auditEvents.locationId,
          actorId: auditEvents.actorId,
          action: auditEvents.action,
          resourceType: auditEvents.resourceType,
          resourceId: auditEvents.resourceId,
          ip: auditEvents.ip,
          userAgent: auditEvents.userAgent,
          createdAt: auditEvents.createdAt,
        })
        .from(auditEvents)
        .where(and(...conditions))
        .orderBy(...orderBy)
        .limit(PAGE_SIZE + 1); // fetch one extra to determine if there's a next page

      const hasMore = rows.length > PAGE_SIZE;
      const events = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

      // Batch-resolve actor names for UI display
      const { users } = await loadAuditDb();
      const actorIds = [...new Set(events.map((e) => e.actorId))];
      const actorRows =
        actorIds.length > 0
          ? await db
              .select({ id: users.id, name: users.name, email: users.email })
              .from(users)
              .where(inArray(users.id, actorIds))
          : [];
      const actorMap = new Map(
        actorRows.map((u) => [u.id, u.name ?? u.email ?? u.id]),
      );

      const lastRow = events[events.length - 1];
      const nextCursor =
        hasMore && lastRow
          ? buildAuditNextCursor(lastRow, data.sort)
          : null;

      logger.safe.info(
        { count: events.length, hasMore, tenantId: access.organizationId },
        "listAuditEventsFn: fetched audit events",
      );

      return {
        events: events.map((e) => ({
          ...e,
          actorName: actorMap.get(e.actorId) ?? null,
        })),
        nextCursor,
      };
    });
  });

// ---------------------------------------------------------------------------
// estimateAuditCountFn - row-count preview for export UI
// ---------------------------------------------------------------------------

const EstimateAuditCountInput = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  actorId: z.string().optional(),
  actorEmail: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  action: z.string().optional(),
  search: z.string().optional(),
  locationId: z.string().uuid().optional(),
});

export const estimateAuditCountFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => EstimateAuditCountInput.parse(data))
  .handler(async ({ data }) => {
    const { db, access } = await requireAuditAccess();

    return runInAuditContext(access.userId, async () => {
      const locationIds = getReadLocationIds(access, data.locationId);
      const conditions = [
        eq(auditEvents.tenantId, access.organizationId),
        buildAuditLocationScope(locationIds),
      ];

      if (data.dateFrom) {
        conditions.push(gte(auditEvents.createdAt, new Date(data.dateFrom)));
      }
      if (data.dateTo) {
        conditions.push(lte(auditEvents.createdAt, new Date(data.dateTo)));
      }

      const filterConditions = await buildAuditFilterConditions(
        db,
        access.organizationId,
        {
          actorId: data.actorId,
          actorEmail: data.actorEmail,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          search: data.search,
        },
      );
      conditions.push(...filterConditions);

      const result = await db
        .select({ rowCount: count() })
        .from(auditEvents)
        .where(and(...conditions));

      const rowCount = result[0]?.rowCount ?? 0;

      logger.safe.info(
        { count: rowCount, tenantId: access.organizationId },
        "estimateAuditCountFn: estimated audit event count",
      );

      return { count: rowCount };
    });
  });

// ---------------------------------------------------------------------------
// getAuditEnumsFn - server-supplied enum lists for filter dropdowns
// ---------------------------------------------------------------------------

export const getAuditEnumsFn = createServerFn({ method: "GET" })
  .inputValidator(() => undefined)
  .handler(async () => {
    await requireAuditAccess();
    return {
      actions: AUDIT_ACTIONS as unknown as string[],
      resourceTypes: AUDIT_RESOURCE_TYPES as unknown as string[],
    };
  });
