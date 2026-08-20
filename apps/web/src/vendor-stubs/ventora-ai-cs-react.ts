/**
 * Resolution stub for `@ventora/ai-cs/react`.
 *
 * This is a NO-OP STAND-IN, not the vendor's code. The real `@ventora/ai-cs`
 * ships from a private package registry that is not part of this public
 * snapshot, so the dependency was removed and this file is aliased in its place
 * by `vite.config.ts` and `vitest.config.ts`. It renders `null`: the support
 * launcher does not appear when you run this repo.
 *
 * Everything that talks *to* the widget is real, first-party, and unstubbed:
 *
 *   - `src/components/ai-cs-support-widget.tsx` — the mount guard (client-only,
 *     to keep a third-party widget with its own React copy out of the worker
 *     SSR pass), availability gating, and the PHI-safe analytics bridge.
 *   - `src/server/ai-cs-proxy.server.ts` — the same-origin BFF proxy. The
 *     browser never holds a credential; the server signs upstream requests.
 *   - `src/server/ai-cs-context.server.ts` — HMAC request signing, nonce replay
 *     protection, and timestamp-skew rejection, all on `node:crypto`.
 *
 * Read those. This file exists only so the build and the test suite can run
 * without registry access.
 */

export interface AiCsEvent {
  event: 'session.created' | 'message.done' | 'error' | string
  data: { code?: string } & Record<string, unknown>
}

export interface AiCsWidgetProps {
  api: {
    baseUrl: string
    credentials?: string
    fetch?: typeof fetch
  }
  session: {
    appId: string
    userId: string
    currentPath?: string
  }
  brand?: { id: string }
  copy?: {
    title?: string
    subtitle?: string
    launcher?: string
    placeholder?: string
    empty?: string
  }
  onEvent?: (event: AiCsEvent) => void
  onError?: (error: Error, route?: string) => void
}

export function AiCsWidget(_props: AiCsWidgetProps): null {
  return null
}
