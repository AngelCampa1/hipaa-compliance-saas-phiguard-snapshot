ALTER TABLE "legal_acceptances"
  ADD COLUMN "executed_pdf_base64" text,
  ADD COLUMN "executed_pdf_sha256" text,
  ADD COLUMN "executed_pdf_size_bytes" integer,
  ADD COLUMN "executed_pdf_mime_type" text;
