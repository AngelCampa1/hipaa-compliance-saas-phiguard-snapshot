import { beforeEach, describe, expect, it, vi } from "vitest";
import { faker } from "@faker-js/faker";
import { SUPPORT_EMAIL } from "@phiguard/knowledge/support";

faker.seed(7);

const { captureServerExceptionMock } = vi.hoisted(() => ({
  captureServerExceptionMock: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mocks - set up before any imports of the module under test
// ---------------------------------------------------------------------------

vi.mock("svix", () => ({
  Webhook: vi.fn(),
}));

vi.mock("@phiguard/marketing-db/server", () => ({
  getMarketingDb: vi.fn(),
  emailSubscriptions: { _brand: "emailSubscriptions" },
}));

vi.mock("@phiguard/audit", () => {
  const loggerMethods = { error: vi.fn(), warn: vi.fn() };
  const logger = { ...loggerMethods, safe: loggerMethods };
  return { logger };
});

vi.mock("../../../middleware/rate-limit.js", () => ({
  createRateLimitMiddleware: vi.fn(() => vi.fn().mockResolvedValue(null)),
}));

vi.mock("../../../lib/sentry.js", () => ({
  captureServerException: captureServerExceptionMock,
}));

const unsubscribeSequencerContactMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue(true),
);

vi.mock("../../../server/sequencer.js", () => ({
  unsubscribeSequencerContact: unsubscribeSequencerContactMock,
}));

import { handleResendWebhook } from "./resend-webhook.js";
import { Webhook } from "svix";
import { getMarketingDb } from "@phiguard/marketing-db/server";
import { logger } from "@phiguard/audit";

const BASE = "https://app.phiguard.test";
const WEBHOOK_SECRET = "test-webhook-secret";

function makeWebhookRequest(
  body: unknown,
  overrideHeaders?: Record<string, string>,
) {
  const rawBody = JSON.stringify(body);
  return new Request(`${BASE}/api/marketing/resend-webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "svix-id": faker.string.uuid(),
      "svix-timestamp": String(Math.floor(Date.now() / 1000)),
      "svix-signature": "v1,test-sig",
      ...overrideHeaders,
    },
    body: rawBody,
  });
}

function buildEmailEvent(
  type: string,
  emailAddress = "recipient@clinic.com",
  emailId = faker.string.uuid(),
) {
  return {
    type,
    data: {
      email_id: emailId,
      to: [emailAddress],
      from: SUPPORT_EMAIL,
    },
  };
}

// ---------------------------------------------------------------------------
// DB mock builder
// ---------------------------------------------------------------------------

function buildDbMock() {
  const mockReturning = vi.fn().mockResolvedValue([{ id: faker.string.uuid() }]);
  const mockUpdateWhere = vi.fn().mockReturnValue({ returning: mockReturning });
  const mockSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
  const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });

  const mockLeadWhere = vi
    .fn()
    .mockResolvedValue([{ id: faker.string.uuid() }]);
  const mockLeadFrom = vi.fn().mockReturnValue({ where: mockLeadWhere });
  const mockSelect = vi.fn().mockReturnValue({ from: mockLeadFrom });

  return {
    update: mockUpdate,
    select: mockSelect,
    _mocks: { set: mockSet, updateWhere: mockUpdateWhere, returning: mockReturning },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("handleResendWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });

  describe("signature verification", () => {
    it("returns 400 when Svix signature verification throws", async () => {
      const mockVerify = vi.fn().mockImplementation(() => {
        throw new Error("Invalid signature");
      });
      vi.mocked(Webhook).mockImplementation(
        () => ({ verify: mockVerify }) as never,
      );

      const db = buildDbMock();
      vi.mocked(getMarketingDb).mockReturnValue(db as never);

      const res = await handleResendWebhook(
        makeWebhookRequest(buildEmailEvent("email.delivered")),
      );
      expect(res.status).toBe(400);
      await expect(res.json()).resolves.toMatchObject({
        error: "invalid_signature",
      });
      expect(captureServerExceptionMock).not.toHaveBeenCalled();
    });

    it("returns 200 when Svix signature verification succeeds", async () => {
      const event = buildEmailEvent("email.bounced");
      const mockVerify = vi.fn().mockReturnValue(event);
      vi.mocked(Webhook).mockImplementation(
        () => ({ verify: mockVerify }) as never,
      );

      const db = buildDbMock();
      vi.mocked(getMarketingDb).mockReturnValue(db as never);

      const res = await handleResendWebhook(makeWebhookRequest(event));
      expect(res.status).toBe(200);
    });

    it("rejects oversized webhook bodies before signature verification or DB access", async () => {
      const event = buildEmailEvent("email.bounced");
      const db = buildDbMock();
      vi.mocked(getMarketingDb).mockReturnValue(db as never);

      const res = await handleResendWebhook(
        makeWebhookRequest({
          ...event,
          extra: "x".repeat(256 * 1024),
        }),
      );

      expect(res.status).toBe(413);
      await expect(res.json()).resolves.toEqual({ error: "payload_too_large" });
      expect(Webhook).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
      expect(unsubscribeSequencerContactMock).not.toHaveBeenCalled();
    });

    it("rejects oversized webhook content-length before reading the body", async () => {
      const event = buildEmailEvent("email.bounced");
      const db = buildDbMock();
      vi.mocked(getMarketingDb).mockReturnValue(db as never);

      const res = await handleResendWebhook(
        makeWebhookRequest(event, {
          "content-length": `${256 * 1024 + 1}`,
        }),
      );

      expect(res.status).toBe(413);
      await expect(res.json()).resolves.toEqual({ error: "payload_too_large" });
      expect(Webhook).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
      expect(unsubscribeSequencerContactMock).not.toHaveBeenCalled();
    });

    it("skips signed payloads with malformed recipient lists before updating subscriptions", async () => {
      const event = {
        type: "email.bounced",
        data: {
          email_id: faker.string.uuid(),
          to: "recipient@clinic.com",
          from: SUPPORT_EMAIL,
        },
      };
      const mockVerify = vi.fn().mockReturnValue(event);
      vi.mocked(Webhook).mockImplementation(
        () => ({ verify: mockVerify }) as never,
      );

      const db = buildDbMock();
      vi.mocked(getMarketingDb).mockReturnValue(db as never);

      const res = await handleResendWebhook(makeWebhookRequest(event));
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({
        received: true,
        skipped: "missing_recipient",
      });
      expect(db.update).not.toHaveBeenCalled();
      expect(unsubscribeSequencerContactMock).not.toHaveBeenCalled();
    });
  });

  describe("delivery engagement events", () => {
    it("acknowledges delivered/opened/clicked events without local send tracking", async () => {
      const emailId = faker.string.uuid();
      const event = buildEmailEvent(
        "email.delivered",
        "recipient@clinic.com",
        emailId,
      );
      const mockVerify = vi.fn().mockReturnValue(event);
      vi.mocked(Webhook).mockImplementation(
        () => ({ verify: mockVerify }) as never,
      );

      const db = buildDbMock();
      vi.mocked(getMarketingDb).mockReturnValue(db as never);

      const res = await handleResendWebhook(makeWebhookRequest(event));
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ received: true });

      expect(db.update).not.toHaveBeenCalled();
      expect(unsubscribeSequencerContactMock).not.toHaveBeenCalled();
    });
  });

  describe("email.bounced", () => {
    it("flips subscription and forwards suppression to Sequencer", async () => {
      const event = buildEmailEvent("email.bounced", "Bounce@Clinic.COM");
      const mockVerify = vi.fn().mockReturnValue(event);
      vi.mocked(Webhook).mockImplementation(
        () => ({ verify: mockVerify }) as never,
      );

      const db = buildDbMock();
      vi.mocked(getMarketingDb).mockReturnValue(db as never);

      const res = await handleResendWebhook(makeWebhookRequest(event));
      expect(res.status).toBe(200);

      expect(db.update).toHaveBeenCalledTimes(1);

      const allSetCalls = vi
        .mocked(db._mocks.set)
        .mock.calls.map((c) => c[0]) as Array<Record<string, unknown>>;
      expect(allSetCalls).toContainEqual(
        expect.objectContaining({ subscribed: false }),
      );
      expect(unsubscribeSequencerContactMock).toHaveBeenCalledWith(
        "bounce@clinic.com",
        { source: "resend-webhook", eventType: "email.bounced" },
      );
    });

    it("does not forward suppression when no active local subscription was updated", async () => {
      const event = buildEmailEvent("email.bounced", "already@clinic.com");
      const mockVerify = vi.fn().mockReturnValue(event);
      vi.mocked(Webhook).mockImplementation(
        () => ({ verify: mockVerify }) as never,
      );

      const db = buildDbMock();
      db._mocks.returning.mockResolvedValueOnce([]);
      vi.mocked(getMarketingDb).mockReturnValue(db as never);

      const res = await handleResendWebhook(makeWebhookRequest(event));
      expect(res.status).toBe(200);

      expect(db.update).toHaveBeenCalledTimes(1);
      expect(unsubscribeSequencerContactMock).not.toHaveBeenCalled();
    });
  });

  describe("email.complained", () => {
    it("flips subscription and forwards complaint suppression to Sequencer", async () => {
      const event = buildEmailEvent("email.complained", "spam@clinic.com");
      const mockVerify = vi.fn().mockReturnValue(event);
      vi.mocked(Webhook).mockImplementation(
        () => ({ verify: mockVerify }) as never,
      );

      const db = buildDbMock();
      vi.mocked(getMarketingDb).mockReturnValue(db as never);

      const res = await handleResendWebhook(makeWebhookRequest(event));
      expect(res.status).toBe(200);

      const allSetCalls = vi
        .mocked(db._mocks.set)
        .mock.calls.map((c) => c[0]) as Array<Record<string, unknown>>;
      expect(allSetCalls).toContainEqual(
        expect.objectContaining({ subscribed: false }),
      );
      expect(unsubscribeSequencerContactMock).toHaveBeenCalledWith(
        "spam@clinic.com",
        { source: "resend-webhook", eventType: "email.complained" },
      );
    });
  });

  describe("unknown event type", () => {
    it("returns 200 (acknowledged) and does not throw", async () => {
      const event = buildEmailEvent("email.unknown_future_type");
      const mockVerify = vi.fn().mockReturnValue(event);
      vi.mocked(Webhook).mockImplementation(
        () => ({ verify: mockVerify }) as never,
      );

      const db = buildDbMock();
      vi.mocked(getMarketingDb).mockReturnValue(db as never);

      const res = await handleResendWebhook(makeWebhookRequest(event));
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ received: true });
    });
  });

  describe("internal error handling", () => {
    it("returns 503 when the local suppression update fails so Resend can retry", async () => {
      const event = buildEmailEvent("email.bounced");
      const mockVerify = vi.fn().mockReturnValue(event);
      vi.mocked(Webhook).mockImplementation(
        () => ({ verify: mockVerify }) as never,
      );

      const mockUpdateWhere = vi
        .fn()
        .mockRejectedValue(new Error("DB connection lost"));
      const mockSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
      const db = {
        update: vi.fn().mockReturnValue({ set: mockSet }),
        select: vi
          .fn()
          .mockReturnValue({
            from: vi
              .fn()
              .mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
          }),
        _mocks: { set: mockSet, updateWhere: mockUpdateWhere },
      };
      vi.mocked(getMarketingDb).mockReturnValue(db as never);

      const res = await handleResendWebhook(makeWebhookRequest(event));
      expect(res.status).toBe(503);
      await expect(res.json()).resolves.toEqual({ error: "processing_failed" });
      expect(logger.safe.error).toHaveBeenCalled();
      expect(captureServerExceptionMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          surface: "api",
          route: "/api/marketing/resend-webhook",
          operation: "resend.webhook.process",
          tags: expect.objectContaining({
            eventType: "email.bounced",
            sink: "marketing-db",
          }),
        }),
      );
      expect(unsubscribeSequencerContactMock).not.toHaveBeenCalled();
    });

    it("still flips the local subscription when Sequencer suppression throws", async () => {
      const event = buildEmailEvent("email.complained", "spam@clinic.com");
      const mockVerify = vi.fn().mockReturnValue(event);
      vi.mocked(Webhook).mockImplementation(
        () => ({ verify: mockVerify }) as never,
      );

      const db = buildDbMock();
      vi.mocked(getMarketingDb).mockReturnValue(db as never);
      const sequencerError = new Error("Sequencer timeout");
      unsubscribeSequencerContactMock.mockRejectedValueOnce(sequencerError);

      const res = await handleResendWebhook(makeWebhookRequest(event));

      expect(res.status).toBe(200);
      expect(db.update).toHaveBeenCalledTimes(1);
      expect(captureServerExceptionMock).toHaveBeenCalledWith(
        sequencerError,
        expect.objectContaining({
          surface: "api",
          route: "/api/marketing/resend-webhook",
          operation: "resend.webhook.process",
          tags: expect.objectContaining({
            eventType: "email.complained",
            sink: "sequencer",
          }),
        }),
      );
    });
  });

  describe("missing RESEND_WEBHOOK_SECRET", () => {
    it("returns 503 when RESEND_WEBHOOK_SECRET env var is absent", async () => {
      const savedSecret = process.env.RESEND_WEBHOOK_SECRET;
      delete process.env.RESEND_WEBHOOK_SECRET;

      try {
        const res = await handleResendWebhook(
          makeWebhookRequest(buildEmailEvent("email.delivered")),
        );
        expect(res.status).toBe(503);
        await expect(res.json()).resolves.toMatchObject({
          error: "webhook_not_configured",
        });
        expect(logger.safe.error).toHaveBeenCalled();
        expect(captureServerExceptionMock).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            surface: "api",
            route: "/api/marketing/resend-webhook",
            operation: "resend.webhook.configure",
            status: 503,
          }),
        );
      } finally {
        if (savedSecret !== undefined) {
          process.env.RESEND_WEBHOOK_SECRET = savedSecret;
        }
      }
    });

    it("returns 503 when RESEND_WEBHOOK_SECRET env var is empty string", async () => {
      process.env.RESEND_WEBHOOK_SECRET = "";

      const res = await handleResendWebhook(
        makeWebhookRequest(buildEmailEvent("email.delivered")),
      );
      expect(res.status).toBe(503);
      await expect(res.json()).resolves.toMatchObject({
        error: "webhook_not_configured",
      });
      expect(captureServerExceptionMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          surface: "api",
          route: "/api/marketing/resend-webhook",
          operation: "resend.webhook.configure",
          status: 503,
        }),
      );
    });
  });
});
