# @phiguard/pdf

Renders the PHIGuard lead-magnet PDFs from React-PDF components into `dist/`.

- `pnpm --filter @phiguard/pdf build:local` renders every PDF into `packages/pdf/dist/` for previewing.
- `pnpm --filter @phiguard/pdf build:pdfs` renders every PDF locally.
- `PDF_FORCE_UPLOAD=true pnpm --filter @phiguard/pdf build:pdfs` forces replacement and verifies the uploaded bytes match the rendered PDF.

Document components live in `src/documents/`, the shared layout lives in `src/layout/`, and `src/manifest.ts` maps each lead magnet slug to its renderer and storage key.

Before shipping a new or changed lead magnet:

1. Add the slug, storage key, and four-step nurture sequence in `@phiguard/lead-magnets`.
2. Add the matching React-PDF document renderer and manifest mapping.
3. Add or update the marketing resource page that uses the same `magnetSlug`.
4. Run `pnpm --filter @phiguard/pdf build:local` and review the rendered PDF for practical clinic value, PHIGuard branding, a clear caveat, and no placeholder copy.
5. Run `pnpm --filter @phiguard/pdf build:pdfs`, `pnpm --filter @phiguard/web seed:prod`, and `pnpm --filter @phiguard/web verify:lead-magnets` with production-like URL environment variables.
