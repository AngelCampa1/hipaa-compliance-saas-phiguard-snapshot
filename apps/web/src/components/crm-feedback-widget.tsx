import { useEffect } from 'react'

const DEFAULT_CRM_LOADER_URL = 'https://crm.example.com/w/v1.js'

/**
 * Mounts the CRM feedback-button widget on the authenticated app surface.
 *
 * The widget is env-gated: if VITE_CRM_WIDGET_KEY is unset nothing renders.
 * The loader script is injected once per page and cleaned up when the component
 * unmounts.
 *
 * PHI note: this component never reads or transmits application data. It renders
 * a standard floating feedback button served by the CRM. Do NOT extend it to
 * pass user attributes, session tokens, or any PHI to the loader.
 */
export function CrmFeedbackWidget() {
  const key = import.meta.env.VITE_CRM_WIDGET_KEY as string | undefined
  const url = (import.meta.env.VITE_CRM_LOADER_URL as string | undefined) ?? DEFAULT_CRM_LOADER_URL

  useEffect(() => {
    if (!key) return

    const selector = `script[data-product="${key}"][data-widget="feedback-button"]`
    if (document.querySelector(selector)) return

    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.setAttribute('data-product', key)
    script.setAttribute('data-widget', 'feedback-button')
    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [key, url])

  return null
}
