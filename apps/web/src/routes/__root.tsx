import '@fontsource/public-sans/400.css'
import '@fontsource/public-sans/500.css'
import '@fontsource/public-sans/600.css'
import '@fontsource/public-sans/700.css'
import '@fontsource/besley/600.css'
import '@fontsource/besley/700.css'
import '@fontsource/besley/800.css'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/600.css'
import { createRootRoute, Outlet, HeadContent, Scripts } from '@tanstack/react-router'
import { useEffect } from 'react'
import { NotFoundFallback, RootErrorFallback } from '../components/error-fallback'
import appCss from '../styles/globals.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'robots', content: 'noindex, nofollow' },
      { title: 'PHIGuard' },
    ],
    links: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootComponent,
  errorComponent: RootErrorFallback,
  notFoundComponent: NotFoundFallback,
})

function RootComponent() {
  useEffect(() => {
    document.body.dataset.appHydrated = 'true'
  }, [])

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body data-app-hydrated="false">
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
