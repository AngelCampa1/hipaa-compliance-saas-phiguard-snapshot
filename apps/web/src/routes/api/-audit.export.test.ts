import { beforeEach, describe, expect, it, vi } from "vitest";

const { createAuditCsvDownloadResponseMock, captureServerExceptionMock } =
  vi.hoisted(() => ({
    createAuditCsvDownloadResponseMock: vi.fn(),
    captureServerExceptionMock: vi.fn(),
  }));

vi.mock("../../server/audit.js", async () => {
  const actual = await vi.importActual<typeof import("../../server/audit.js")>(
    "../../server/audit.js",
  );

  return {
    ...actual,
    createAuditCsvDownloadResponse: createAuditCsvDownloadResponseMock,
  };
});

vi.mock("../../lib/sentry.js", () => ({
  captureServerException: captureServerExceptionMock,
}));

type AuditExportHandlers = {
  GET: (ctx: { request: Request }) => Promise<Response>;
};

async function getHandlers() {
  const { Route } = await import("./audit.export.js");
  return Route.options.server?.handlers as unknown as AuditExportHandlers;
}

describe("audit CSV export API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createAuditCsvDownloadResponseMock.mockResolvedValue(
      new Response("csv", { status: 200 }),
    );
  });

  it("passes selected location filters to the export service", async () => {
    const locationId = "11111111-1111-4111-8111-111111111111";
    const handlers = await getHandlers();
    const response = await handlers.GET({
      request: new Request(
        `https://app.phiguard.test/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z&locationId=${locationId}`,
      ),
    });

    expect(response.status).toBe(200);
    expect(createAuditCsvDownloadResponseMock).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({ locationId }),
    );
  });

  it("returns 400 for invalid export query params", async () => {
    const handlers = await getHandlers();
    const response = await handlers.GET({
      request: new Request(
        "https://app.phiguard.test/api/audit/export?dateFrom=bad",
      ),
    });

    expect(response.status).toBe(400);
    expect(createAuditCsvDownloadResponseMock).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed selected locations", async () => {
    const handlers = await getHandlers();
    const response = await handlers.GET({
      request: new Request(
        "https://app.phiguard.test/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z&locationId=not-a-location-id",
      ),
    });

    expect(response.status).toBe(400);
    expect(createAuditCsvDownloadResponseMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid export range errors", async () => {
    const handlers = await getHandlers();
    const response = await handlers.GET({
      request: new Request(
        "https://app.phiguard.test/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2025-02-01T00:00:00.000Z",
      ),
    });

    expect(response.status).toBe(400);
    expect(createAuditCsvDownloadResponseMock).not.toHaveBeenCalled();
    expect(captureServerExceptionMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the export range ends before it starts", async () => {
    const handlers = await getHandlers();
    const response = await handlers.GET({
      request: new Request(
        "https://app.phiguard.test/api/audit/export?dateFrom=2024-02-01T00:00:00.000Z&dateTo=2024-01-01T00:00:00.000Z",
      ),
    });

    expect(response.status).toBe(400);
    expect(createAuditCsvDownloadResponseMock).not.toHaveBeenCalled();
    expect(captureServerExceptionMock).not.toHaveBeenCalled();
  });

  it("returns 401 for unauthenticated direct exports", async () => {
    createAuditCsvDownloadResponseMock.mockRejectedValueOnce(
      new Error("Unauthorized"),
    );

    const handlers = await getHandlers();
    const response = await handlers.GET({
      request: new Request(
        "https://app.phiguard.test/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
      ),
    });

    expect(response.status).toBe(401);
    expect(captureServerExceptionMock).not.toHaveBeenCalled();
  });

  it("returns 403 when commercial access is locked", async () => {
    createAuditCsvDownloadResponseMock.mockRejectedValueOnce(
      new Error("Billing action required before accessing PHIGuard."),
    );

    const handlers = await getHandlers();
    const response = await handlers.GET({
      request: new Request(
        "https://app.phiguard.test/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
      ),
    });

    expect(response.status).toBe(403);
    expect(captureServerExceptionMock).not.toHaveBeenCalled();
  });

  it("returns 403 when legal onboarding blocks commercial access", async () => {
    createAuditCsvDownloadResponseMock.mockRejectedValueOnce(
      new Error("You need to accept the Terms and BAA before using PHIGuard."),
    );

    const handlers = await getHandlers();
    const response = await handlers.GET({
      request: new Request(
        "https://app.phiguard.test/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
      ),
    });

    expect(response.status).toBe(403);
    expect(captureServerExceptionMock).not.toHaveBeenCalled();
  });

  it("returns 403 when the user role cannot access audit logs", async () => {
    const { AUDIT_LOG_ACCESS_DENIED_MESSAGE } =
      await import("../../server/audit.js");
    createAuditCsvDownloadResponseMock.mockRejectedValueOnce(
      new Error(AUDIT_LOG_ACCESS_DENIED_MESSAGE),
    );

    const handlers = await getHandlers();
    const response = await handlers.GET({
      request: new Request(
        "https://app.phiguard.test/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
      ),
    });

    expect(response.status).toBe(403);
    expect(captureServerExceptionMock).not.toHaveBeenCalled();
  });

  it("returns 413 when a direct export would exceed the row limit", async () => {
    const { AUDIT_EXPORT_ROW_LIMIT_MESSAGE } =
      await import("../../server/audit.js");
    createAuditCsvDownloadResponseMock.mockRejectedValueOnce(
      new Error(AUDIT_EXPORT_ROW_LIMIT_MESSAGE),
    );

    const handlers = await getHandlers();
    const response = await handlers.GET({
      request: new Request(
        "https://app.phiguard.test/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
      ),
    });

    expect(response.status).toBe(413);
    await expect(response.text()).resolves.toBe(AUDIT_EXPORT_ROW_LIMIT_MESSAGE);
    expect(captureServerExceptionMock).not.toHaveBeenCalled();
  });

  it("returns 500 for unexpected export failures", async () => {
    const error = new Error("database unavailable");
    createAuditCsvDownloadResponseMock.mockRejectedValueOnce(error);

    const handlers = await getHandlers();
    const response = await handlers.GET({
      request: new Request(
        "https://app.phiguard.test/api/audit/export?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-01-31T00:00:00.000Z",
      ),
    });

    expect(response.status).toBe(500);
    expect(captureServerExceptionMock).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        surface: "api",
        route: "/api/audit/export",
        operation: "audit.csv.export",
        status: 500,
      }),
    );
  });
});
