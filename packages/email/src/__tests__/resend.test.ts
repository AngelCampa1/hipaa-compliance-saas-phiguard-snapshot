import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SUPPORT_EMAIL_FROM } from "@phiguard/brand/contact";
import { sendEmail } from "../resend.js";

vi.mock("@react-email/render", () => ({
  render: vi.fn().mockResolvedValue("<html><body>test</body></html>"),
}));

const mockSend = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

const mockSendMail = vi.fn();
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: mockSendMail,
    })),
  },
}));

describe("sendEmail", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = originalEnv;
    delete process.env.EMAIL_FROM;
    delete process.env.MAIL_SMTP_HOST;
    delete process.env.MAIL_SMTP_PORT;
    delete process.env.RESEND_API_KEY;
  });

  describe("in test environment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "test";
    });

    it("returns a mock message id without calling Resend", async () => {
      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test subject",
        react: createElement("div"),
      });

      expect(result).toEqual({ messageId: "test-message-id" });
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe("in production environment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
      process.env.RESEND_API_KEY = "test-api-key";
    });

    it("calls Resend with correct parameters", async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: "resend-message-123" },
        error: null,
      });

      const result = await sendEmail({
        to: "recipient@example.com",
        from: "sender@phiguard.app",
        subject: "Test subject",
        react: createElement("div"),
        tags: [{ name: "campaign", value: "lifecycle" }],
      });

      expect(mockSend).toHaveBeenCalledOnce();
      const callArg = mockSend.mock.calls[0][0];
      expect(callArg.to).toBe("recipient@example.com");
      expect(callArg.from).toBe("sender@phiguard.app");
      expect(callArg.subject).toBe("Test subject");
      expect(callArg.html).toBe("<html><body>test</body></html>");
      expect(callArg.tags).toEqual([{ name: "campaign", value: "lifecycle" }]);
      expect(result).toEqual({ messageId: "resend-message-123" });
    });

    it("uses default from address when not specified", async () => {
      mockSend.mockResolvedValueOnce({
        data: { id: "resend-message-456" },
        error: null,
      });

      await sendEmail({
        to: "recipient@example.com",
        subject: "Test",
        react: createElement("div"),
      });

      const callArg = mockSend.mock.calls[0][0];
      expect(callArg.from).toBe(SUPPORT_EMAIL_FROM);
    });

    it("uses EMAIL_FROM env var when set", async () => {
      process.env.EMAIL_FROM = "Custom <custom@phiguard.app>";
      mockSend.mockResolvedValueOnce({
        data: { id: "resend-message-789" },
        error: null,
      });

      await sendEmail({
        to: "recipient@example.com",
        subject: "Test",
        react: createElement("div"),
      });

      const callArg = mockSend.mock.calls[0][0];
      expect(callArg.from).toBe("Custom <custom@phiguard.app>");
    });

    it("throws when Resend returns an error", async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: "Invalid API key" },
      });

      await expect(
        sendEmail({
          to: "recipient@example.com",
          subject: "Test",
          react: createElement("div"),
        }),
      ).rejects.toThrow("Failed to send email");
    });

    it("throws when RESEND_API_KEY is not set", async () => {
      delete process.env.RESEND_API_KEY;

      await expect(
        sendEmail({
          to: "recipient@example.com",
          subject: "Test",
          react: createElement("div"),
        }),
      ).rejects.toThrow("RESEND_API_KEY environment variable is not set");
    });
  });

  describe("in development environment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
      process.env.RESEND_API_KEY = "re_placeholder_replace_with_real_key";
      mockSendMail.mockResolvedValue({ messageId: "mailpit-message-123" });
    });

    it("routes placeholder API keys to the Mailpit SMTP fallback", async () => {
      const result = await sendEmail({
        to: "recipient@example.com",
        subject: "Test",
        react: createElement("div"),
      });

      expect(mockSend).not.toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "recipient@example.com",
          subject: "Test",
        }),
      );
      expect(result).toEqual({ messageId: "mailpit-message-123" });
    });

    it("routes documented REPLACE_ME API key placeholders to the Mailpit SMTP fallback", async () => {
      process.env.RESEND_API_KEY = "REPLACE_ME_RESEND_API_KEY";

      const result = await sendEmail({
        to: "recipient@example.com",
        subject: "Test",
        react: createElement("div"),
      });

      expect(mockSend).not.toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "recipient@example.com",
          subject: "Test",
        }),
      );
      expect(result).toEqual({ messageId: "mailpit-message-123" });
    });
  });
});
