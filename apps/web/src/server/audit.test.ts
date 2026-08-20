import { inspect } from "node:util";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getDbMock = vi.fn();
const getSessionMock = vi.fn();
const resolveSessionFromHeadersMock = vi.fn();
const resolveOrganizationAccessMock = vi.fn();
const resolveActiveLocationAccessMock = vi.fn();
const assertCommercialProductAccessMock = vi.fn();
const getReadLocationIdsMock = vi.fn();
const loggerInfoMock = vi.fn();
const writeAuditEventMock = vi.fn();
const withAuditContextMock = vi.fn();
let dbSelectMock: ReturnType<typeof vi.fn>;

vi.mock("@phiguard/audit", async () => {
  const { auditEvents } =
    await import("../../../../packages/audit/src/schema/audit-events.phi.js");

  return {
    auditEvents,
    logger: {
      safe: {
        info: loggerInfoMock,
      },
    },
    writeAuditEvent: writeAuditEventMock,
    withAuditContext: withAuditContextMock,
  };
});

vi.mock("@phiguard/auth", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
  resolveSessionFromHeaders: resolveSessionFromHeadersMock,
  resolveOrganizationAccess: resolveOrganizationAccessMock,
}));

vi.mock("@phiguard/db/server", async () => {
  const actual = await vi.importActual<typeof import("@phiguard/db/server")>(
    "@phiguard/db/server",
  );
  return {
    ...actual,
    getDb: getDbMock,
  };
});

vi.mock("./access.js", () => ({
  assertCommercialProductAccess: assertCommercialProductAccessMock,
  getReadLocationIds: getReadLocationIdsMock,
  resolveActiveLocationAccess: resolveActiveLocationAccessMock,
}));

describe("createAuditCsvDownloadResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    writeAuditEventMock.mockResolvedValue(undefined);
    withAuditContextMock.mockImplementation(async (_ctx: unknown, fn: () => Promise<unknown>) =>
      fn(),
    );
    dbSelectMock = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });

    const session = {
      user: {
        id: "user-1",
        email: "user@example.com",
        name: "Test User",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "session-1",
        token: "token",
        userId: "user-1",
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
        updatedAt: new Date(),
        activeOrganizationId: "org-1",
      },
    };
    getSessionMock.mockResolvedValue(session);
    resolveSessionFromHeadersMock.mockResolvedValue(session);
    resolveOrganizationAccessMock.mockResolvedValue({
      status: "ready",
      activeOrganizationId: "org-1",
      scope: {
        organizationId: "org-1",
        role: "org_admin",
        accessLevel: "organization",
        locationIds: ["location-1"],
      },
    });
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: "user-1",
      organizationId: "org-1",
      role: "org_admin",
      accessLevel: "organization",
      allowedLocationIds: ["location-1"],
      locations: [{ id: "location-1", name: "Main Clinic" }],
      defaultLocationId: "location-1",
      canAccessAllLocations: true,
    });
    getDbMock.mockReturnValue({
      select: dbSelectMock,
    });
    assertCommercialProductAccessMock.mockImplementation(() => undefined);
    getReadLocationIdsMock.mockImplementation((access, locationId?: string) =>
      locationId ? [locationId] : access.allowedLocationIds,
    );
  });

  it("marks streamed CSV exports as non-cacheable", async () => {
    const { createAuditCsvDownloadResponse } = await import("./audit.js");

    const response = await createAuditCsvDownloadResponse(
      new Request(
        "http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
        {
          headers: {
            "x-forwarded-for": "203.0.113.10",
            "user-agent": "AuditExportTest/1.0",
          },
        },
      ),
      {
        dateFrom: "2024-01-01T00:00:00.000Z",
        dateTo: "2024-01-31T00:00:00.000Z",
      },
    );

    expect(response.headers.get("Cache-Control")).toBe("no-store, max-age=0");
    expect(response.headers.get("Pragma")).toBe("no-cache");
    expect(response.headers.get("Expires")).toBe("0");
    await response.text();
    expect(loggerInfoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        count: 0,
        tenantId: "org-1",
      }),
      "createAuditCsvDownloadResponse: streamed audit export",
    );
  }, 120_000);

  it("writes an append-only audit event for successful direct CSV exports", async () => {
    const { createAuditCsvDownloadResponse } = await import("./audit.js");

    const response = await createAuditCsvDownloadResponse(
      new Request(
        "http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
        {
          headers: {
            "x-forwarded-for": "203.0.113.10",
            "user-agent": "AuditExportTest/1.0",
          },
        },
      ),
      {
        dateFrom: "2024-01-01T00:00:00.000Z",
        dateTo: "2024-01-31T00:00:00.000Z",
        action: "task.created",
        search: "task",
      },
    );

    await response.text();

    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: "org-1",
        actorId: "user-1",
        action: "audit_log.exported",
        resourceType: "audit_log",
        resourceId: "direct-csv",
        after: expect.objectContaining({
          count: 0,
          dateFrom: "2024-01-01T00:00:00.000Z",
          dateTo: "2024-01-31T00:00:00.000Z",
          filters: expect.objectContaining({
            action: "task.created",
            search: "task",
          }),
        }),
      }),
    );
    expect(withAuditContextMock).toHaveBeenCalledWith(
      {
        actorId: "user-1",
        ip: "203.0.113.10",
        userAgent: "AuditExportTest/1.0",
      },
      expect.any(Function),
    );
  }, 120_000);

  it("resolves actor email filters only through memberships in the active organization", async () => {
    const actorLookupWhereMock = vi.fn().mockResolvedValue([{ id: "user-2" }]);
    const actorLookupInnerJoinMock = vi.fn().mockReturnValue({
      where: actorLookupWhereMock,
    });
    const auditWhereMock = vi.fn().mockReturnValue({
      orderBy: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
      }),
    });

    dbSelectMock
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: actorLookupInnerJoinMock,
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: auditWhereMock,
        }),
      });

    const { createAuditCsvDownloadResponse } = await import("./audit.js");

    const response = await createAuditCsvDownloadResponse(
      new Request(
        "http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
      ),
      {
        dateFrom: "2024-01-01T00:00:00.000Z",
        dateTo: "2024-01-31T00:00:00.000Z",
        actorEmail: "admin@example.com",
      },
    );

    await response.text();

    const actorLookupCondition = inspect(actorLookupWhereMock.mock.calls[0]?.[0], {
      depth: 20,
    });
    const auditCondition = inspect(auditWhereMock.mock.calls[0]?.[0], { depth: 20 });

    expect(actorLookupInnerJoinMock).toHaveBeenCalled();
    expect(actorLookupCondition).toContain("org-1");
    expect(actorLookupCondition).toContain("%admin@example.com%");
    expect(auditCondition).toContain("user-2");
  }, 120_000);

  it("searches audit resource fields as well as action for direct CSV exports", async () => {
    const auditWhereMock = vi.fn().mockReturnValue({
      orderBy: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
      }),
    });
    dbSelectMock.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: auditWhereMock,
      }),
    });

    const { createAuditCsvDownloadResponse } = await import("./audit.js");

    const response = await createAuditCsvDownloadResponse(
      new Request(
        "http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
      ),
      {
        dateFrom: "2024-01-01T00:00:00.000Z",
        dateTo: "2024-01-31T00:00:00.000Z",
        search: "incident",
      },
    );

    await response.text();

    const auditCondition = inspect(auditWhereMock.mock.calls[0]?.[0], { depth: 20 });
    expect(auditCondition).toContain("action");
    expect(auditCondition).toContain("resource_type");
    expect(auditCondition).toContain("resource_id");
    expect(auditCondition).toContain("%incident%");
  }, 120_000);

  it("keeps audit exports scoped to org-wide events when there are no readable locations", async () => {
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: "user-1",
      organizationId: "org-1",
      role: "org_admin",
      accessLevel: "organization",
      allowedLocationIds: [],
      locations: [],
      defaultLocationId: null,
      canAccessAllLocations: true,
    });

    const { createAuditCsvDownloadResponse } = await import("./audit.js");

    const response = await createAuditCsvDownloadResponse(
      new Request(
        "http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
      ),
      {
        dateFrom: "2024-01-01T00:00:00.000Z",
        dateTo: "2024-01-31T00:00:00.000Z",
      },
    );

    await expect(response.text()).resolves.toContain("id,created_at");
  }, 120_000);

  it("rejects overlong export ranges as invalid input before querying the database", async () => {
    const { createAuditCsvDownloadResponse } = await import("./audit.js");

    await expect(
      createAuditCsvDownloadResponse(
        new Request(
          "http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2025-02-01T00:00:00.000Z",
        ),
        {
          dateFrom: "2024-01-01T00:00:00.000Z",
          dateTo: "2025-02-01T00:00:00.000Z",
        },
      ),
    ).rejects.toMatchObject({
      issues: expect.arrayContaining([
        expect.objectContaining({
          message:
            "Date range cannot exceed 365 days. For longer exports, use the nightly object-storage export.",
        }),
      ]),
    });
    expect(dbSelectMock).not.toHaveBeenCalled();
  }, 120_000);

  it("rejects export ranges that end before they start before querying the database", async () => {
    const { createAuditCsvDownloadResponse } = await import("./audit.js");

    await expect(
      createAuditCsvDownloadResponse(
        new Request(
          "http://localhost/api/audit/export?dateFrom=2024-02-01T00:00:00.000Z&dateTo=2024-01-01T00:00:00.000Z",
        ),
        {
          dateFrom: "2024-02-01T00:00:00.000Z",
          dateTo: "2024-01-01T00:00:00.000Z",
        },
      ),
    ).rejects.toMatchObject({
      issues: expect.arrayContaining([
        expect.objectContaining({
          message: "Date range end must be on or after the start.",
        }),
      ]),
    });
    expect(dbSelectMock).not.toHaveBeenCalled();
  }, 120_000);

  it("rejects audit export query failures before returning a 200 response", async () => {
    dbSelectMock.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error("database unavailable")),
          }),
        }),
      }),
    });

    const { createAuditCsvDownloadResponse } = await import("./audit.js");

    await expect(
      createAuditCsvDownloadResponse(
        new Request(
          "http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
        ),
        {
          dateFrom: "2024-01-01T00:00:00.000Z",
          dateTo: "2024-01-31T00:00:00.000Z",
        },
      ),
    ).rejects.toThrow("database unavailable");
  }, 120_000);

  it("rejects direct CSV exports that exceed the row limit instead of silently truncating", async () => {
    const fullBatch = Array.from({ length: 5_000 }, (_, index) => ({
      id: `00000000-0000-4000-8000-${index.toString().padStart(12, "0")}`,
      tenantId: "org-1",
      locationId: "location-1",
      actorId: "user-1",
      action: "audit.event",
      resourceType: "audit",
      resourceId: `resource-${index}`,
      ip: null,
      userAgent: null,
      createdAt: new Date(Date.UTC(2024, 0, 1, 0, 0, index)),
    }));
    const extraRow = [
      {
        ...fullBatch[0],
        id: "00000000-0000-4000-8000-999999999999",
        resourceId: "resource-extra",
        createdAt: new Date("2024-01-02T00:00:00.000Z"),
      },
    ];
    const batches = [...Array.from({ length: 20 }, () => fullBatch), extraRow];
    dbSelectMock.mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi
              .fn()
              .mockImplementation(() => Promise.resolve(batches.shift() ?? [])),
          }),
        }),
      }),
    }));

    const { AUDIT_EXPORT_ROW_LIMIT_MESSAGE, createAuditCsvDownloadResponse } =
      await import("./audit.js");

    await expect(
      createAuditCsvDownloadResponse(
        new Request(
          "http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
        ),
        {
          dateFrom: "2024-01-01T00:00:00.000Z",
          dateTo: "2024-01-31T00:00:00.000Z",
        },
      ),
    ).rejects.toThrow(AUDIT_EXPORT_ROW_LIMIT_MESSAGE);
    expect(loggerInfoMock).not.toHaveBeenCalled();
    expect(writeAuditEventMock).not.toHaveBeenCalled();
  }, 120_000);

  it("neutralizes spreadsheet formulas hidden behind leading whitespace in audit exports", async () => {
    const row = {
      id: "00000000-0000-4000-8000-000000000001",
      tenantId: "org-1",
      locationId: "location-1",
      actorId: "\t=IMPORTXML(\"https://example.test\",\"//a\")",
      action: "audit.event",
      resourceType: "audit",
      resourceId: "resource-1",
      ip: null,
      userAgent: null,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    };
    dbSelectMock.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([row]),
          }),
        }),
      }),
    });

    const { createAuditCsvDownloadResponse } = await import("./audit.js");

    const response = await createAuditCsvDownloadResponse(
      new Request(
        "http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
      ),
      {
        dateFrom: "2024-01-01T00:00:00.000Z",
        dateTo: "2024-01-31T00:00:00.000Z",
      },
    );

    await expect(response.text()).resolves.toContain(
      "\"'\t=IMPORTXML(\"\"https://example.test\"\",\"\"//a\"\")\"",
    );
  }, 120_000);

  it("blocks direct CSV exports when commercial access is locked", async () => {
    assertCommercialProductAccessMock.mockImplementationOnce(() => {
      throw new Error("Billing action required before accessing PHIGuard.");
    });

    const { createAuditCsvDownloadResponse } = await import("./audit.js");

    await expect(
      createAuditCsvDownloadResponse(
        new Request(
          "http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
        ),
        {
          dateFrom: "2024-01-01T00:00:00.000Z",
          dateTo: "2024-01-31T00:00:00.000Z",
        },
      ),
    ).rejects.toThrow("Billing action required before accessing PHIGuard.");
    expect(dbSelectMock).not.toHaveBeenCalled();
  }, 120_000);

  it("blocks direct CSV exports for location staff before querying audit events", async () => {
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: "user-1",
      organizationId: "org-1",
      role: "location_staff",
      accessLevel: "location",
      allowedLocationIds: ["location-1"],
      locations: [{ id: "location-1", name: "Main Clinic" }],
      defaultLocationId: "location-1",
      canAccessAllLocations: false,
    });

    const { AUDIT_LOG_ACCESS_DENIED_MESSAGE, createAuditCsvDownloadResponse } =
      await import("./audit.js");

    await expect(
      createAuditCsvDownloadResponse(
        new Request(
          "http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
        ),
        {
          dateFrom: "2024-01-01T00:00:00.000Z",
          dateTo: "2024-01-31T00:00:00.000Z",
        },
      ),
    ).rejects.toThrow(AUDIT_LOG_ACCESS_DENIED_MESSAGE);
    expect(dbSelectMock).not.toHaveBeenCalled();
  }, 120_000);

  it("blocks direct CSV exports for location managers before querying audit events", async () => {
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: "user-1",
      organizationId: "org-1",
      role: "location_manager",
      accessLevel: "location",
      allowedLocationIds: ["location-1"],
      locations: [{ id: "location-1", name: "Main Clinic" }],
      defaultLocationId: "location-1",
      canAccessAllLocations: false,
    });

    const { AUDIT_LOG_ACCESS_DENIED_MESSAGE, createAuditCsvDownloadResponse } =
      await import("./audit.js");

    await expect(
      createAuditCsvDownloadResponse(
        new Request(
          "http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
        ),
        {
          dateFrom: "2024-01-01T00:00:00.000Z",
          dateTo: "2024-01-31T00:00:00.000Z",
        },
      ),
    ).rejects.toThrow(AUDIT_LOG_ACCESS_DENIED_MESSAGE);
    expect(dbSelectMock).not.toHaveBeenCalled();
  }, 120_000);

  it("switches stale direct export sessions to the user's active organization", async () => {
    resolveSessionFromHeadersMock.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.com",
        name: "Test User",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "session-1",
        token: "token",
        userId: "user-1",
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
        updatedAt: new Date(),
        activeOrganizationId: "org-stale",
      },
    });
    resolveOrganizationAccessMock.mockResolvedValueOnce({
      status: "switch-required",
      activeOrganizationId: "org-1",
      scope: {
        organizationId: "org-1",
        role: "org_admin",
        accessLevel: "organization",
        locationIds: ["location-1"],
      },
    });

    const { createAuditCsvDownloadResponse } = await import("./audit.js");

    const response = await createAuditCsvDownloadResponse(
      new Request(
        "http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
      ),
      {
        dateFrom: "2024-01-01T00:00:00.000Z",
        dateTo: "2024-01-31T00:00:00.000Z",
      },
    );

    await expect(response.text()).resolves.toContain("id,created_at");
    expect(resolveActiveLocationAccessMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        session: expect.objectContaining({
          activeOrganizationId: "org-1",
        }),
      }),
    );
  }, 120_000);

  it("rejects malformed audit cursors before querying the database", async () => {
    const { parseAuditCursor } = await import("./audit.js");

    expect(() => parseAuditCursor("{not-json")).toThrow("Invalid cursor");
  });

  it("scopes direct CSV exports to a requested readable location", async () => {
    const locationId = "11111111-1111-4111-8111-111111111111";
    const { createAuditCsvDownloadResponse } = await import("./audit.js");

    const response = await createAuditCsvDownloadResponse(
      new Request(
        `http://localhost/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z&locationId=${locationId}`,
      ),
      {
        dateFrom: "2024-01-01T00:00:00.000Z",
        dateTo: "2024-01-31T00:00:00.000Z",
        locationId,
      },
    );

    await expect(response.text()).resolves.toContain("id,created_at");
    expect(getReadLocationIdsMock).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org-1" }),
      locationId,
    );
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        after: expect.objectContaining({
          filters: expect.objectContaining({ locationId }),
        }),
      }),
    );
  });

  it("encodes sort-specific audit cursors for action and actor pagination", async () => {
    const { buildAuditNextCursor } = await import("./audit.js");
    const row = {
      id: "11111111-1111-4111-8111-111111111111",
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
      action: "member.role_updated",
      actorId: "22222222-2222-4222-8222-222222222222",
    };

    expect(JSON.parse(buildAuditNextCursor(row, { field: "action", direction: "asc" }))).toEqual({
      ts: "2026-05-01T12:00:00.000Z",
      id: "11111111-1111-4111-8111-111111111111",
      action: "member.role_updated",
    });
    expect(JSON.parse(buildAuditNextCursor(row, { field: "actorId", direction: "desc" }))).toEqual({
      ts: "2026-05-01T12:00:00.000Z",
      id: "11111111-1111-4111-8111-111111111111",
      actorId: "22222222-2222-4222-8222-222222222222",
    });
  });

  it("rejects cursors that do not carry the active sort field", async () => {
    const { buildAuditCursorCondition, parseAuditCursor } = await import("./audit.js");
    const createdAtOnlyCursor = parseAuditCursor(
      JSON.stringify({
        ts: "2026-05-01T12:00:00.000Z",
        id: "11111111-1111-4111-8111-111111111111",
      }),
    );

    expect(() =>
      buildAuditCursorCondition(createdAtOnlyCursor, { field: "action", direction: "asc" }),
    ).toThrow("Invalid cursor");
    expect(() =>
      buildAuditCursorCondition(createdAtOnlyCursor, { field: "actorId", direction: "asc" }),
    ).toThrow("Invalid cursor");
  });

  it("exposes emitted backend audit actions and resource types in filter enums", async () => {
    const { AUDIT_ACTIONS, AUDIT_RESOURCE_TYPES } = await import("./audit.js");

    expect(AUDIT_ACTIONS).toEqual(
      expect.arrayContaining([
        "audit_log.exported",
        "access_review.opened",
        "billing.subscription.activation_blocked",
        "incident.created",
        "risk_assessment.reviewed",
        "soc2.evidence_recorded",
        "task.status_updated",
        "training.completed",
      ]),
    );
    expect(AUDIT_RESOURCE_TYPES).toEqual(
      expect.arrayContaining([
        "audit_log",
        "access_review",
        "incident",
        "risk_assessment",
        "soc2_evidence",
        "task_attachment",
        "training_assignment",
      ]),
    );
  });
});
