/**
 * Hand-written declaration for the private `@ventora/ai-cs` package — written
 * by this repo, not shipped by the vendor, and deliberately narrower than the
 * vendor's real types: it covers only the props this app actually passes.
 *
 * The package itself is not distributed with this snapshot; see
 * `src/vendor-stubs/ventora-ai-cs-react.ts` for what resolves in its place.
 */
declare module '@ventora/ai-cs/react' {
  import type { ComponentType } from 'react'

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

  export const AiCsWidget: ComponentType<AiCsWidgetProps>
}
